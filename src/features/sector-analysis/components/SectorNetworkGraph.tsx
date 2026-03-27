'use client';

/**
 * SectorNetworkGraph — 2D Canvas 기반 섹터 네트워크 그래프
 *
 * - d3-force-3d (2D 모드) 물리 엔진: 반발력 + 중력
 * - Canvas API: Glow 발광, Bezier 곡선 연결선, 방사형 그라디언트 노드
 * - Light/Dark 테마: 낮(태양) / 밤(달+별) 무드
 * - Hover: 1-depth 하이라이트 + 나머지 Dim
 * - Click: shadcn/ui Card 팝업 (Glassmorphism)
 * - 줌/팬: 마우스 휠 + 드래그
 */

import {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type RefObject,
} from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/Card';
import type { ValueChain, ValueChainNode, TierLevel } from '../types';

/* ─────────────────────────────────────────────
   상수
───────────────────────────────────────────── */

const TIER_CONFIG: Record<TierLevel, {
  radius: number;
  colorDark: string;
  colorLight: string;
  glowDark: string;
  glowLight: string;
  labelAlwaysVisible: boolean;
}> = {
  0: { radius: 28, colorDark: '#3B82F6', colorLight: '#F59E0B', glowDark: '#60A5FA', glowLight: '#FDE68A', labelAlwaysVisible: true },
  1: { radius: 20, colorDark: '#10B981', colorLight: '#059669', glowDark: '#34D399', glowLight: '#6EE7B7', labelAlwaysVisible: false },
  2: { radius: 14, colorDark: '#F59E0B', colorLight: '#D97706', glowDark: '#FBBF24', glowLight: '#FCD34D', labelAlwaysVisible: false },
  3: { radius: 10, colorDark: '#EF4444', colorLight: '#DC2626', glowDark: '#F87171', glowLight: '#FCA5A5', labelAlwaysVisible: false },
};

const TIER_BADGE_VARIANT: Record<TierLevel, 'tier0' | 'tier1' | 'tier2' | 'tier3'> = {
  0: 'tier0', 1: 'tier1', 2: 'tier2', 3: 'tier3',
};
const TIER_LABELS: Record<TierLevel, string> = {
  0: '중심섹터', 1: '연관섹터', 2: '기업', 3: '공급사',
};
const SIGNAL_COLORS: Record<string, string> = {
  buy: 'text-green-500', wait: 'text-amber-500', watch: 'text-blue-500',
};
const SIGNAL_LABELS: Record<string, string> = {
  buy: '매수', wait: '관망', watch: '매도',
};
/** Signal 닷 색상 (Canvas 직접 사용) */
const SIGNAL_DOT_COLORS: Record<string, string> = {
  buy: '#16A34A', wait: '#F59E0B', watch: '#EF4444',
};

/* ─────────────────────────────────────────────
   유틸리티
───────────────────────────────────────────── */

function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return (h >>> 0) / 0xffffffff;
}

type D3Node = {
  id: string;
  tier: TierLevel;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
};

type D3Link = {
  source: D3Node;
  target: D3Node;
  fromTier: TierLevel;
  toTier: TierLevel;
};

/** d3-force-3d 2D 모드로 레이아웃 계산 */
function computeLayout(
  nodes: ValueChainNode[],
  width: number,
  height: number,
): { nodeMap: Map<string, D3Node>; links: D3Link[] } {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const d3 = require('d3-force-3d') as any;
  const tierRadius: Record<number, number> = { 0: 28, 1: 20, 2: 14, 3: 10 };

  // Tier 그룹화
  const tierGroups = new Map<TierLevel, ValueChainNode[]>();
  for (const n of nodes) {
    const g = tierGroups.get(n.tier) ?? [];
    g.push(n);
    tierGroups.set(n.tier, g);
  }

  // 연결 생성 (tier i → tier i+1, seededRandom 매핑)
  const rawLinks: Array<{ source: string; target: string; fromTier: TierLevel; toTier: TierLevel }> = [];
  const tiers: TierLevel[] = [0, 1, 2, 3];
  for (let ti = 0; ti < tiers.length - 1; ti++) {
    const parents = tierGroups.get(tiers[ti]) ?? [];
    const children = tierGroups.get(tiers[ti + 1]) ?? [];
    for (const child of children) {
      if (parents.length > 0) {
        const idx = Math.floor(seededRandom(child.ticker + 'p') * parents.length) % parents.length;
        rawLinks.push({ source: parents[idx].ticker, target: child.ticker, fromTier: tiers[ti], toTier: tiers[ti + 1] });
      }
    }
  }

  // 초기 위치 (tier별 동심원 — 시뮬레이션 수렴 가속)
  const d3Nodes: D3Node[] = nodes.map((n, idx) => {
    const group = tierGroups.get(n.tier) ?? [];
    const i = group.indexOf(n);
    const count = group.length;
    const orbitR = n.tier === 0 ? (count <= 1 ? 0 : 60) : n.tier * 110;
    const angle = (2 * Math.PI * i) / Math.max(count, 1) - Math.PI / 2;
    return {
      id: n.ticker,
      tier: n.tier,
      x: Math.cos(angle) * orbitR + seededRandom(n.ticker + 'ix') * 20 - 10,
      y: Math.sin(angle) * orbitR + seededRandom(n.ticker + 'iy') * 20 - 10,
    };
    void idx;
  });

  const sim = d3.forceSimulation(d3Nodes, 2)
    .force('charge', d3.forceManyBody().strength(-280))
    .force(
      'link',
      d3.forceLink(rawLinks)
        .id((d: D3Node) => d.id)
        .distance((l: { source: D3Node; target: D3Node }) => {
          const avgTier = (l.source.tier + l.target.tier) / 2;
          return 60 + avgTier * 40;
        })
        .strength(0.7),
    )
    .force('center', d3.forceCenter(0, 0))
    .force('collide', d3.forceCollide()
      .radius((d: D3Node) => tierRadius[d.tier] * 2.2 + 8)
      .strength(1.0),
    )
    .stop();

  const iterations = Math.ceil(Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay()));
  for (let i = 0; i < Math.min(iterations, 500); i++) sim.tick();

  // 중심 정렬: 평균 위치를 0으로
  let cx = 0, cy = 0;
  for (const n of d3Nodes) { cx += n.x; cy += n.y; }
  cx /= d3Nodes.length; cy /= d3Nodes.length;
  for (const n of d3Nodes) { n.x -= cx; n.y -= cy; }

  const nodeMap = new Map<string, D3Node>();
  for (const n of d3Nodes) nodeMap.set(n.id, n);

  const links: D3Link[] = rawLinks.map((l) => ({
    source: nodeMap.get(l.source)!,
    target: nodeMap.get(l.target)!,
    fromTier: l.fromTier,
    toTier: l.toTier,
  })).filter((l) => l.source && l.target);

  void width; void height;
  return { nodeMap, links };
}

/* ─────────────────────────────────────────────
   Canvas 드로잉 유틸리티
───────────────────────────────────────────── */

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  isDark: boolean,
  t: number,
) {
  if (isDark) {
    // 밤 배경: 깊은 우주
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    grad.addColorStop(0, '#0D0B1E');
    grad.addColorStop(1, '#020208');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 별 (deterministic 위치 + 반짝임)
    const starSeeds = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10',
      's11','s12','s13','s14','s15','s16','s17','s18','s19','s20'];
    for (const seed of starSeeds) {
      const sx = seededRandom(seed + 'x') * w;
      const sy = seededRandom(seed + 'y') * h;
      const sr = 0.5 + seededRandom(seed + 'r') * 1.2;
      const blink = 0.3 + 0.7 * ((Math.sin(t * (0.5 + seededRandom(seed + 'b')) + seededRandom(seed + 'p') * 6.28) + 1) / 2);
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${blink * 0.8})`;
      ctx.fill();
    }

    // 달
    const moonX = w * 0.85, moonY = h * 0.12, moonR = 18;
    const moonGrad = ctx.createRadialGradient(moonX - 4, moonY - 4, 0, moonX, moonY, moonR);
    moonGrad.addColorStop(0, 'rgba(255,253,220,0.95)');
    moonGrad.addColorStop(1, 'rgba(200,190,150,0.6)');
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fillStyle = moonGrad;
    ctx.shadowColor = 'rgba(255,253,200,0.5)';
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.shadowBlur = 0;

  } else {
    // 낮 배경: 부드러운 하늘
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#EFF6FF');
    grad.addColorStop(1, '#FFFBF5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 태양
    const sunX = w * 0.88, sunY = h * 0.1, sunR = 22;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 2.5);
    sunGrad.addColorStop(0, 'rgba(255,220,50,1)');
    sunGrad.addColorStop(0.4, 'rgba(255,180,0,0.6)');
    sunGrad.addColorStop(1, 'rgba(255,160,0,0)');
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // 태양 광선
    ctx.save();
    ctx.translate(sunX, sunY);
    const pulse = 1 + 0.05 * Math.sin(t * 0.8);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(sunR * 1.3 * pulse, 0);
      ctx.lineTo(sunR * 2.2 * pulse, 0);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,200,0,0.4)';
      ctx.stroke();
      ctx.rotate(-angle);
    }
    ctx.restore();
  }
}

function drawLink(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  alpha: number,
  lineWidth: number,
) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // 수직 방향으로 컨트롤 포인트 오프셋 (Bezier)
  const cx = mx - dy * 0.18;
  const cy = my + dx * 0.18;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.strokeStyle = hexToRgba(color, alpha);
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  glowColor: string,
  alpha: number,
  glowIntensity: number,
  isDark: boolean,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Glow
  if (glowIntensity > 0) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = radius * glowIntensity;
  }

  // 외곽 링
  ctx.beginPath();
  ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(glowColor, 0.4 * alpha);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 메인 원 (방사형 그라디언트)
  const grad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.35, 0, x, y, radius);
  if (isDark) {
    grad.addColorStop(0, hexToRgba('#ffffff', 0.25));
    grad.addColorStop(0.35, hexToRgba(color, 0.85));
    grad.addColorStop(1, hexToRgba(color, 0.3));
  } else {
    grad.addColorStop(0, hexToRgba('#ffffff', 0.7));
    grad.addColorStop(0.4, hexToRgba(color, 0.9));
    grad.addColorStop(1, hexToRgba(color, 0.4));
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // 하이라이트 스펙큘러
  const spec = ctx.createRadialGradient(
    x - radius * 0.3, y - radius * 0.35, 0,
    x - radius * 0.3, y - radius * 0.35, radius * 0.5,
  );
  spec.addColorStop(0, hexToRgba('#ffffff', 0.5));
  spec.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = spec;
  ctx.fill();

  ctx.restore();
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  radius: number,
  alpha: number,
  isDark: boolean,
) {
  if (alpha < 0.05) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `600 11px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const metrics = ctx.measureText(text);
  const tw = metrics.width + 10;
  const th = 16;
  const tx = x - tw / 2;
  const ty = y + radius + 6;

  // 배경 pill
  ctx.beginPath();
  ctx.roundRect(tx, ty, tw, th, 4);
  ctx.fillStyle = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)';
  ctx.fill();
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = isDark ? 'rgba(240,240,255,0.95)' : 'rgba(30,30,50,0.9)';
  ctx.fillText(text, x, ty + 2);
  ctx.restore();
}

/**
 * drawSignalDot — 노드 우하단에 시그널 컬러 닷 표시
 * T0: 닷 크기 + 텍스트 레이블
 */
function drawSignalDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  nodeRadius: number,
  signal: string,
  tier: TierLevel,
  alpha: number,
  isDark: boolean,
) {
  const color = SIGNAL_DOT_COLORS[signal] ?? '#9CA3AF';
  const dotR = tier === 0 ? 6 : 4;
  const dx = x + nodeRadius * 0.68;
  const dy = y + nodeRadius * 0.68;

  ctx.save();
  ctx.globalAlpha = alpha;

  // 흰 테두리 링 (배경과 구분)
  ctx.beginPath();
  ctx.arc(dx, dy, dotR + 1.5, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? '#18181b' : '#ffffff';
  ctx.fill();

  // 시그널 닷
  ctx.beginPath();
  ctx.arc(dx, dy, dotR, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;
  ctx.fill();
  ctx.shadowBlur = 0;

  // T0 전용: 텍스트 레이블 ("매수"/"관망"/"매도")
  if (tier === 0) {
    const label = SIGNAL_LABELS[signal] ?? signal;
    ctx.font = `700 10px -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const tw = ctx.measureText(label).width + 8;
    const th = 14;
    const lx = dx - tw / 2;
    const ly = dy + dotR + 3;
    ctx.shadowBlur = 0;
    ctx.globalAlpha = alpha * 0.95;
    ctx.beginPath();
    ctx.roundRect(lx, ly, tw, th, 3);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, dx, ly + 2);
  }

  ctx.restore();
}

/**
 * drawCrowdWarningRing — 군중심리 경고 주황 링
 * crowdSentimentLevel >= 2 일 때 표시
 */
function drawCrowdWarningRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  nodeRadius: number,
  alpha: number,
  t: number,
  ticker: string,
) {
  const pulse = 0.7 + 0.3 * Math.sin(t * 2.0 + seededRandom(ticker + 'cw') * Math.PI * 2);
  ctx.save();
  ctx.globalAlpha = alpha * pulse * 0.7;
  ctx.beginPath();
  ctx.arc(x, y, nodeRadius + 11, 0, Math.PI * 2);
  ctx.strokeStyle = '#F97316';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([3, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/* ─────────────────────────────────────────────
   메인 컴포넌트
───────────────────────────────────────────── */

export interface SectorNetworkGraphProps {
  chain: ValueChain;
  onNodeClick?: (node: ValueChainNode) => void;
  selectedTicker?: string | null;
  compact?: boolean;
}

export function SectorNetworkGraph({
  chain,
  onNodeClick,
  selectedTicker,
  compact = false,
}: SectorNetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const isDarkRef = useRef(false);

  // 팬/줌 상태 (ref — RAF에서 직접 읽기)
  const transform = useRef({ x: 0, y: 0, zoom: compact ? 0.7 : 1.0 });
  const drag = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number } | null>(null);

  // React 상태 (팝업 overlay용)
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const [popupNode, setPopupNode] = useState<ValueChainNode | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDark, setIsDark] = useState(false);

  // 선택 ticker (prop 우선)
  const activeTicker = selectedTicker ?? null;

  // 노드 맵 (ticker → ValueChainNode)
  const nodeDataMap = useMemo(() => {
    const m = new Map<string, ValueChainNode>();
    for (const n of chain.nodes) m.set(n.ticker, n);
    return m;
  }, [chain.nodes]);

  // 물리 레이아웃
  const { nodeMap, links } = useMemo(
    () => computeLayout(chain.nodes, 800, 600),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chain.sector],
  );

  // 인접 맵
  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of links) {
      const si = l.source.id, ti = l.target.id;
      if (!m.has(si)) m.set(si, new Set());
      if (!m.has(ti)) m.set(ti, new Set());
      m.get(si)!.add(ti);
      m.get(ti)!.add(si);
    }
    return m;
  }, [links]);

  // 부유 오프셋 시드
  const floatSeeds = useMemo(() => {
    const m = new Map<string, { offset: number; speed: number; amp: number }>();
    for (const n of chain.nodes) {
      m.set(n.ticker, {
        offset: seededRandom(n.ticker + 'fo') * Math.PI * 2,
        speed: 0.6 + seededRandom(n.ticker + 'fs') * 0.6,
        amp: compact ? 0 : (3 + seededRandom(n.ticker + 'fa') * 3),
      });
    }
    return m;
  }, [chain.nodes, compact]);

  // 다크모드 감지
  useEffect(() => {
    const html = document.documentElement;
    const check = () => {
      const dark = html.classList.contains('dark');
      setIsDark(dark);
      isDarkRef.current = dark;
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // 호버 ticker ref (RAF에서 직접 읽기)
  const hoveredRef = useRef<string | null>(null);
  useEffect(() => { hoveredRef.current = hoveredTicker; }, [hoveredTicker]);

  // 활성 ticker ref
  const activeRef = useRef<string | null>(null);
  useEffect(() => { activeRef.current = activeTicker; }, [activeTicker]);

  /* ──── Canvas 렌더 루프 ──── */
  const startRenderLoop = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = (now: number) => {
      const t = (now - startTime) / 1000;
      const { width: w, height: h } = canvas;
      const { x: panX, y: panY, zoom } = transform.current;
      const hovered = hoveredRef.current;
      const active = activeRef.current;
      const dark = isDarkRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.save();

      // 배경
      drawBackground(ctx, w, h, dark, t);

      // 월드 변환 (중앙 기준)
      ctx.translate(w / 2 + panX, h / 2 + panY);
      ctx.scale(zoom, zoom);

      // 링크 그리기
      for (const link of links) {
        const sn = link.source;
        const tn = link.target;
        const floatS = floatSeeds.get(sn.id);
        const floatT = floatSeeds.get(tn.id);
        const sy = sn.y + (floatS ? Math.sin(t * floatS.speed + floatS.offset) * floatS.amp : 0);
        const ty2 = tn.y + (floatT ? Math.sin(t * floatT.speed + floatT.offset) * floatT.amp : 0);

        const isHighlighted = hovered !== null && (sn.id === hovered || tn.id === hovered);
        const isActive = active !== null && (sn.id === active || tn.id === active);
        const dimmed = (hovered !== null && !isHighlighted) || (active !== null && !isActive && hovered === null);

        const baseColor = TIER_CONFIG[link.fromTier][dark ? 'colorDark' : 'colorLight'];
        const alpha = dimmed ? 0.06 : isHighlighted ? 0.85 : 0.25;
        // Tier 계층 두께: T0-T1 두껍게, T2-T3 얇게
        const tierLw = link.fromTier === 0 ? 2.0 : link.fromTier === 1 ? 1.2 : 0.7;
        const lw = isHighlighted ? 2.8 : tierLw;

        drawLink(ctx, sn.x, sy, tn.x, ty2, baseColor, alpha, lw);
      }

      // 노드 + 라벨
      for (const n of chain.nodes) {
        const d3n = nodeMap.get(n.ticker);
        if (!d3n) continue;
        const float = floatSeeds.get(n.ticker);
        const fy = d3n.y + (float ? Math.sin(t * float.speed + float.offset) * float.amp : 0);
        const cfg = TIER_CONFIG[n.tier];

        const isHovered = n.ticker === hovered;
        const isActive = n.ticker === active;
        const isNeighbor = hovered !== null && (adjacency.get(hovered)?.has(n.ticker) ?? false);
        const dimmed = (hovered !== null && !isHovered && !isNeighbor) ||
                       (active !== null && !isActive && hovered === null && !(adjacency.get(active)?.has(n.ticker) ?? false));

        const alpha = dimmed ? 0.2 : 1.0;
        const glowIntensity = isHovered || isActive ? 2.5 : isNeighbor ? 1.5 : 0.8;
        const radius = cfg.radius * (isHovered || isActive ? 1.15 : 1.0);
        const color = dark ? cfg.colorDark : cfg.colorLight;
        const glowColor = dark ? cfg.glowDark : cfg.glowLight;

        drawNode(ctx, d3n.x, fy, radius, color, glowColor, alpha, glowIntensity, dark);

        // T0 노드: 황금 펄싱 링 (계층 시각적 강조)
        if (n.tier === 0 && alpha > 0.1) {
          const ringPulse = 1 + 0.06 * Math.sin(t * 1.2 + seededRandom(n.ticker + 'rp') * Math.PI * 2);
          ctx.save();
          ctx.globalAlpha = 0.55 * alpha;
          ctx.beginPath();
          ctx.arc(d3n.x, fy, radius * ringPulse + 7, 0, Math.PI * 2);
          ctx.strokeStyle = dark ? '#F59E0B' : '#D97706';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }

        // 군중심리 경고 링 (crowdSentimentLevel >= 2)
        if ((n.crowdSentimentLevel ?? 0) >= 2 && alpha > 0.1) {
          drawCrowdWarningRing(ctx, d3n.x, fy, radius, alpha, t, n.ticker);
        }

        // Signal 닷 (모든 노드에 표시)
        if (!compact) {
          drawSignalDot(ctx, d3n.x, fy, radius, n.signal, n.tier, alpha, dark);
        }

        // 라벨 가시성: T0 항상, hover/active 시 자신+이웃
        const showLabel = cfg.labelAlwaysVisible || isHovered || isActive || isNeighbor;
        const labelAlpha = dimmed ? 0 : showLabel ? 1.0 : 0;
        if (labelAlpha > 0.05) {
          drawLabel(ctx, d3n.x, fy, n.name, radius, labelAlpha, dark);
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    startTime = performance.now();
    rafRef.current = requestAnimationFrame(render);
  }, [chain.nodes, links, nodeMap, adjacency, floatSeeds]);

  /* ──── Canvas 마운트 + 리사이즈 ──── */
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width * (window.devicePixelRatio || 1);
      canvas.height = height * (window.devicePixelRatio || 1);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    resize();

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRenderLoop(canvas);

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startRenderLoop]);

  /* ──── 마우스 이벤트: 호버 감지 ──── */
  const getWorldPos = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { wx: 0, wy: 0 };
    const rect = canvas.getBoundingClientRect();
    const { x: panX, y: panY, zoom } = transform.current;
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const wx = (mx - rect.width / 2 - panX) / zoom;
    const wy = (my - rect.height / 2 - panY) / zoom;
    return { wx, wy };
  }, []);

  const hitTest = useCallback((wx: number, wy: number, t: number): string | null => {
    for (const n of chain.nodes) {
      const d3n = nodeMap.get(n.ticker);
      if (!d3n) continue;
      const float = floatSeeds.get(n.ticker);
      const fy = d3n.y + (float ? Math.sin(t * float.speed + float.offset) * float.amp : 0);
      const dist = Math.hypot(wx - d3n.x, wy - fy);
      const cfg = TIER_CONFIG[n.tier];
      if (dist < cfg.radius * 1.3) return n.ticker;
    }
    return null;
  }, [chain.nodes, nodeMap, floatSeeds]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (compact) return;
    if (drag.current) {
      transform.current.x = drag.current.startPanX + (e.clientX - drag.current.startX);
      transform.current.y = drag.current.startPanY + (e.clientY - drag.current.startY);
      return;
    }
    const t = (performance.now() - 0) / 1000;
    const { wx, wy } = getWorldPos(e.clientX, e.clientY);
    const hit = hitTest(wx, wy, t);
    setHoveredTicker(hit);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hit ? 'pointer' : 'grab';
    }
  }, [compact, getWorldPos, hitTest]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (compact) return;
    drag.current = {
      startX: e.clientX, startY: e.clientY,
      startPanX: transform.current.x, startPanY: transform.current.y,
    };
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  }, [compact]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (compact) return;
    const wasDragging = drag.current &&
      (Math.abs(e.clientX - drag.current.startX) > 3 || Math.abs(e.clientY - drag.current.startY) > 3);
    drag.current = null;
    if (canvasRef.current) canvasRef.current.style.cursor = hoveredTicker ? 'pointer' : 'grab';

    if (!wasDragging && hoveredTicker) {
      const node = nodeDataMap.get(hoveredTicker);
      if (node) {
        setPopupNode((prev) => prev?.ticker === node.ticker ? null : node);
        // 팝업 위치: 노드 위 (canvas 기준)
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const d3n = nodeMap.get(node.ticker);
          if (d3n) {
            const { x: panX, y: panY, zoom } = transform.current;
            const sx = d3n.x * zoom + rect.width / 2 + panX;
            const sy = d3n.y * zoom + rect.height / 2 + panY;
            setPopupPos({ x: sx, y: sy - TIER_CONFIG[node.tier].radius * zoom - 10 });
          }
        }
        onNodeClick?.(node);
      }
    }
  }, [compact, hoveredTicker, nodeDataMap, nodeMap, onNodeClick]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (compact) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    transform.current.zoom = Math.max(0.3, Math.min(3, transform.current.zoom * delta));
  }, [compact]);

  const handleMouseLeave = useCallback(() => {
    setHoveredTicker(null);
    drag.current = null;
  }, []);

  // 팝업 닫기 (선택 해제)
  useEffect(() => {
    if (selectedTicker === null) setPopupNode(null);
  }, [selectedTicker]);

  /* ──── 렌더 ──── */
  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-zinc-200/60 dark:border-zinc-700/30 ${
        compact ? 'aspect-square' : 'aspect-[4/3]'
      }`}
    >
      {/* 배경 컨테이너 */}
      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ cursor: compact ? 'default' : 'grab' }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        />
      </div>

      {/* shadcn/ui 팝업 오버레이 */}
      {!compact && popupNode && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: popupPos.x,
            top: popupPos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <Card className="w-52 pointer-events-auto backdrop-blur-md bg-white/80 dark:bg-zinc-900/85
            border-white/30 dark:border-zinc-700/40 shadow-xl">
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={TIER_BADGE_VARIANT[popupNode.tier]} size="sm">
                  {TIER_LABELS[popupNode.tier]}
                </Badge>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{popupNode.ticker}</span>
              </div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{popupNode.name}</p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {popupNode.description}
              </p>
              <div className="flex items-center justify-between pt-1 border-t border-zinc-200/50 dark:border-zinc-700/40">
                <span className={`text-[11px] font-bold ${SIGNAL_COLORS[popupNode.signal]}`}>
                  {SIGNAL_LABELS[popupNode.signal]}
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{popupNode.relationship}</span>
              </div>
              {popupNode.dividendYield !== undefined && (
                <p className="text-[10px] text-zinc-400">배당수익률: {popupNode.dividendYield}%</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* compact 모드: 섹터 라벨 */}
      {compact && (
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
          <p className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 text-center">
            {chain.sectorLabel}
          </p>
        </div>
      )}

      {/* Tier 범례 + T0 카운트 (full 모드) */}
      {!compact && (
        <>
          {/* T0 종목 수 배지 */}
          <div className="absolute top-3 left-3 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold
              bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm
              border border-amber-300/60 dark:border-amber-600/40
              text-amber-700 dark:text-amber-400
              px-2 py-1 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Tier 0 수혜주 {chain.nodes.filter((n) => n.tier === 0).length}개
            </span>
          </div>

          {/* Tier 범례 */}
          <div className="absolute bottom-8 left-3 pointer-events-none space-y-1">
            {([0, 1, 2, 3] as TierLevel[]).map((tier) => (
              <div key={tier} className="flex items-center gap-1.5">
                <span
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: tier === 0 ? 10 : tier === 1 ? 8 : tier === 2 ? 6 : 5,
                    height: tier === 0 ? 10 : tier === 1 ? 8 : tier === 2 ? 6 : 5,
                    backgroundColor: isDark
                      ? TIER_CONFIG[tier].colorDark
                      : TIER_CONFIG[tier].colorLight,
                    opacity: 0.85,
                  }}
                />
                <span className="text-[9px] text-zinc-500 dark:text-zinc-400">
                  T{tier} {TIER_LABELS[tier]}
                </span>
              </div>
            ))}
          </div>

          {/* 조작 안내 */}
          <div className="absolute bottom-3 right-3 flex gap-1 pointer-events-none">
            <span className="text-[9px] text-zinc-400 dark:text-zinc-600 bg-white/40 dark:bg-black/30 px-1.5 py-0.5 rounded">
              휠: 줌 · 드래그: 이동
            </span>
          </div>
        </>
      )}
    </div>
  );
}
