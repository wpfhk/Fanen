'use client';

/**
 * SectorMindmapView — 섹터 연결망 3D 세포형 마인드맵 v3.0
 * - 3D CSS perspective + 마우스 드래그 회전
 * - 유기적 레이아웃 (seeded random 오프셋)
 * - 세포 질감 (SVG radial gradient + glow filter)
 * - 둥실둥실 떠다니는 애니메이션
 * - bezier curve 연결선
 * - 다크: 순수 블랙 배경 + 별/달 장식
 * - 라이트: warm 태양빛 배경 + 해 장식
 * - shadcn/ui Card, Badge 활용
 * - 텍스트 가독성 강화
 * - D3 zoom/pan 유지
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import type { ValueChain, ValueChainNode, TierLevel } from '../types';

/* ─────────────────────────────────────────────
   결정론적 시드 랜덤
───────────────────────────────────────────── */

function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return (h >>> 0) / 0xFFFFFFFF;
}

/* ─────────────────────────────────────────────
   색상 시스템 (라이트/다크)
───────────────────────────────────────────── */

const COLORS = {
  dark: {
    bg: '#050508',
    border: '#1a1a2e',
    centerFill: '#F9FAFB',
    centerText: '#111111',
    tierFill: {
      '-1': '#F9FAFB',
      '0': '#1E3A5F',
      '1': '#1A3A2F',
      '2': '#3A2A10',
      '3': '#3A1A1A',
    } as Record<string, string>,
    tierStroke: {
      '-1': 'transparent',
      '0': '#60A5FA',
      '1': '#34D399',
      '2': '#FBBF24',
      '3': '#F87171',
    } as Record<string, string>,
    tierEdge: {
      '0': '#3B82F6',
      '1': '#10B981',
      '2': '#D97706',
      '3': '#EF4444',
    } as Record<string, string>,
    // 세포 구체 하이라이트 색상
    tierHighlight: {
      '0': '#93C5FD',
      '1': '#6EE7B7',
      '2': '#FCD34D',
      '3': '#FCA5A5',
    } as Record<string, string>,
    tierShadow: {
      '0': '#0C2340',
      '1': '#0C291E',
      '2': '#2A1A08',
      '3': '#2A0C0C',
    } as Record<string, string>,
    label: '#D1D5DB',
    labelHover: '#F3F4F6',
    hover: '#60A5FA',
    dimOpacity: 0.12,
    hintText: '#4B5563',
    eventText: '#6B7280',
    headerText: '#E5E7EB',
    subText: '#9CA3AF',
    badge: 'rgba(255,255,255,0.05)',
    badgeBorder: 'rgba(255,255,255,0.08)',
    badgeText: '#9CA3AF',
  },
  light: {
    bg: '#FFFBF5',
    border: '#F3E8D8',
    centerFill: '#111827',
    centerText: '#FFFFFF',
    tierFill: {
      '-1': '#111827',
      '0': '#DBEAFE',
      '1': '#D1FAE5',
      '2': '#FEF3C7',
      '3': '#FEE2E2',
    } as Record<string, string>,
    tierStroke: {
      '-1': 'transparent',
      '0': '#2563EB',
      '1': '#059669',
      '2': '#B45309',
      '3': '#DC2626',
    } as Record<string, string>,
    tierEdge: {
      '0': '#3B82F6',
      '1': '#10B981',
      '2': '#D97706',
      '3': '#EF4444',
    } as Record<string, string>,
    tierHighlight: {
      '0': '#BFDBFE',
      '1': '#A7F3D0',
      '2': '#FDE68A',
      '3': '#FECACA',
    } as Record<string, string>,
    tierShadow: {
      '0': '#1E40AF',
      '1': '#065F46',
      '2': '#78350F',
      '3': '#991B1B',
    } as Record<string, string>,
    label: '#374151',
    labelHover: '#111827',
    hover: '#2563EB',
    dimOpacity: 0.10,
    hintText: '#9CA3AF',
    eventText: '#78716C',
    headerText: '#111827',
    subText: '#6B7280',
    badge: 'rgba(0,0,0,0.03)',
    badgeBorder: 'rgba(0,0,0,0.08)',
    badgeText: '#9CA3AF',
  },
} as const;

/* ─────────────────────────────────────────────
   레이아웃 상수
───────────────────────────────────────────── */

const TIER_RADIUS: Record<number, number> = {
  [-1]: 44,
  0: 28,
  1: 22,
  2: 17,
  3: 13,
};

const ORBIT_RADIUS: Record<number, number> = {
  0: 120,
  1: 215,
  2: 310,
  3: 400,
};

const TIER_EDGE_OPACITY: Record<string, number> = {
  '0': 0.55,
  '1': 0.45,
  '2': 0.35,
  '3': 0.30,
};

/* ─────────────────────────────────────────────
   레이블
───────────────────────────────────────────── */

const TIER_LABELS: Record<number, string> = {
  0: '중심기업',
  1: '직납업체',
  2: '부품/소재',
  3: '물류/MRO',
};

const SIGNAL_LABEL: Record<string, string> = { buy: '관심', wait: '관망', watch: '주의' };
const SIGNAL_COLOR: Record<string, string> = {
  buy: 'text-blue-400',
  wait: 'text-zinc-400',
  watch: 'text-zinc-500',
};

/* ─────────────────────────────────────────────
   타입
───────────────────────────────────────────── */

interface MindMapNode {
  id: string;
  name: string;
  tier: TierLevel | -1;
  originalNode?: ValueChainNode;
  x: number;
  y: number;
  /** 떠다니는 애니메이션 인덱스 */
  floatIdx: number;
}

interface MindMapEdge {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tier: TierLevel;
  sourceId: string;
  targetId: string;
}

interface TooltipState {
  node: ValueChainNode;
  x: number;
  y: number;
}

/* ─────────────────────────────────────────────
   유기적 레이아웃 (시드 기반 랜덤 오프셋)
───────────────────────────────────────────── */

function buildMindMapLayout(chain: ValueChain): {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
} {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];
  let floatCounter = 0;

  nodes.push({ id: '__center__', name: chain.sectorLabel, tier: -1, x: 0, y: 0, floatIdx: floatCounter++ });

  const t0 = chain.nodes.filter((n) => n.tier === 0);
  const t1 = chain.nodes.filter((n) => n.tier === 1);
  const t2 = chain.nodes.filter((n) => n.tier === 2);
  const t3 = chain.nodes.filter((n) => n.tier === 3);

  // T0: 균등 분배 + 시드 기반 랜덤 오프셋 (십자가 방지)
  const t0Angles = t0.map((n, i) => {
    const baseAngle = (2 * Math.PI * i) / Math.max(t0.length, 1);
    const jitter = (seededRandom(n.ticker) - 0.5) * 0.6; // ±0.3 rad
    return baseAngle + jitter;
  });

  // T0 반경에도 약간의 랜덤 오프셋
  const t0Nodes: MindMapNode[] = t0.map((n, i) => {
    const rJitter = 1 + (seededRandom(n.ticker + '_r') - 0.5) * 0.15;
    const r = ORBIT_RADIUS[0] * rJitter;
    return {
      id: n.ticker, name: n.name, tier: 0 as TierLevel, originalNode: n,
      x: r * Math.cos(t0Angles[i]),
      y: r * Math.sin(t0Angles[i]),
      floatIdx: floatCounter++,
    };
  });
  nodes.push(...t0Nodes);
  t0Nodes.forEach((n) =>
    edges.push({
      id: `center-${n.id}`,
      x1: 0, y1: 0, x2: n.x, y2: n.y,
      tier: 0, sourceId: '__center__', targetId: n.id,
    })
  );

  function placeTierNodes(
    tierNodes: ValueChainNode[],
    tier: TierLevel,
    parentTierNodes: MindMapNode[],
    parentTierAngles: number[]
  ): { placed: MindMapNode[]; angles: number[] } {
    if (tierNodes.length === 0 || parentTierNodes.length === 0) return { placed: [], angles: [] };
    const orbit = ORBIT_RADIUS[tier];
    const perParent = Math.ceil(tierNodes.length / parentTierNodes.length);
    const placed: MindMapNode[] = [];
    const angles: number[] = [];
    tierNodes.forEach((n, i) => {
      const parentIdx = Math.min(Math.floor(i / perParent), parentTierNodes.length - 1);
      const parentAngle = parentTierAngles[parentIdx];
      const spread = Math.PI / Math.max(parentTierNodes.length, 1);
      const siblingIdx = i % perParent;
      const siblingCount = Math.min(perParent, tierNodes.length - parentIdx * perParent);
      const angleStep = siblingCount > 1 ? (2 * spread) / (siblingCount - 1) : 0;
      const baseAngle = siblingCount > 1 ? parentAngle - spread + siblingIdx * angleStep : parentAngle;
      // 시드 기반 jitter 추가
      const jitter = (seededRandom(n.ticker) - 0.5) * 0.3;
      const angle = baseAngle + jitter;
      const rJitter = 1 + (seededRandom(n.ticker + '_r') - 0.5) * 0.1;
      placed.push({
        id: n.ticker, name: n.name, tier, originalNode: n,
        x: orbit * rJitter * Math.cos(angle),
        y: orbit * rJitter * Math.sin(angle),
        floatIdx: floatCounter++,
      });
      angles.push(angle);
    });
    return { placed, angles };
  }

  const { placed: t1Nodes, angles: t1Angles } = placeTierNodes(t1, 1, t0Nodes, t0Angles);
  nodes.push(...t1Nodes);
  t1Nodes.forEach((n, i) => {
    const perParent = Math.ceil(t1.length / Math.max(t0Nodes.length, 1));
    const parentIdx = Math.min(Math.floor(i / perParent), t0Nodes.length - 1);
    const parent = t0Nodes[parentIdx];
    if (parent) edges.push({ id: `t0-${parent.id}-${n.id}`, x1: parent.x, y1: parent.y, x2: n.x, y2: n.y, tier: 1, sourceId: parent.id, targetId: n.id });
  });

  const t2ParentNodes = t1Nodes.length > 0 ? t1Nodes : t0Nodes;
  const t2ParentAngles = t1Nodes.length > 0 ? t1Angles : t0Angles;
  const { placed: t2Nodes, angles: t2Angles } = placeTierNodes(t2, 2, t2ParentNodes, t2ParentAngles);
  nodes.push(...t2Nodes);
  t2Nodes.forEach((n, i) => {
    const perParent = Math.ceil(t2.length / Math.max(t2ParentNodes.length, 1));
    const parentIdx = Math.min(Math.floor(i / perParent), t2ParentNodes.length - 1);
    const parent = t2ParentNodes[parentIdx];
    if (parent) edges.push({ id: `t1-${parent.id}-${n.id}`, x1: parent.x, y1: parent.y, x2: n.x, y2: n.y, tier: 2, sourceId: parent.id, targetId: n.id });
  });

  const t3ParentNodes = t2Nodes.length > 0 ? t2Nodes : t2ParentNodes;
  const t3ParentAngles = t2Angles.length > 0 ? t2Angles : t2ParentAngles;
  const { placed: t3Nodes } = placeTierNodes(t3, 3, t3ParentNodes, t3ParentAngles);
  nodes.push(...t3Nodes);
  t3Nodes.forEach((n, i) => {
    const perParent = Math.ceil(t3.length / Math.max(t3ParentNodes.length, 1));
    const parentIdx = Math.min(Math.floor(i / perParent), t3ParentNodes.length - 1);
    const parent = t3ParentNodes[parentIdx];
    if (parent) edges.push({ id: `t2-${parent.id}-${n.id}`, x1: parent.x, y1: parent.y, x2: n.x, y2: n.y, tier: 3, sourceId: parent.id, targetId: n.id });
  });

  return { nodes, edges };
}

/* ─────────────────────────────────────────────
   별 생성 (다크모드 장식)
───────────────────────────────────────────── */

function generateStars(count: number, vbSize: number): Array<{ cx: number; cy: number; r: number; opacity: number }> {
  const stars: Array<{ cx: number; cy: number; r: number; opacity: number }> = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      cx: seededRandom(`star_x_${i}`) * vbSize,
      cy: seededRandom(`star_y_${i}`) * vbSize,
      r: 0.5 + seededRandom(`star_r_${i}`) * 1.2,
      opacity: 0.3 + seededRandom(`star_o_${i}`) * 0.7,
    });
  }
  return stars;
}

/* ─────────────────────────────────────────────
   NodeTooltip
───────────────────────────────────────────── */

function NodeTooltip({ tooltip, isDark }: { tooltip: TooltipState | null; isDark: boolean }) {
  if (!tooltip) return null;
  const { node, x, y } = tooltip;
  const colors = isDark ? COLORS.dark : COLORS.light;
  const tierStroke = colors.tierStroke[String(node.tier)] ?? '#9CA3AF';
  return (
    <div
      style={{ left: x, top: y, borderColor: tierStroke + '40' }}
      className="absolute z-50 w-56 pointer-events-none
        bg-white/90 dark:bg-[#0a0a12]/95 backdrop-blur-md
        border rounded-xl shadow-2xl p-3 text-left"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold"
          style={{ background: tierStroke + '20', color: tierStroke }}
        >
          T{node.tier}
        </span>
        <span className="text-xs font-semibold text-zinc-900 dark:text-[#F9FAFB]">{node.name}</span>
      </div>
      <p className="text-[10px] font-mono text-zinc-500 dark:text-[#9CA3AF] mb-1">{node.ticker}</p>
      <p className="text-[11px] text-zinc-600 dark:text-[#9CA3AF] mb-1">
        {node.relationship}
        {node.dividendYield !== undefined && node.dividendYield > 0 && (
          <span className="ml-2">배당 {node.dividendYield.toFixed(1)}%</span>
        )}
      </p>
      <p className="text-[11px] text-zinc-500 dark:text-[#6B7280] leading-relaxed line-clamp-3">
        {node.description}
      </p>
      <p className={`text-[11px] font-semibold mt-1.5 ${SIGNAL_COLOR[node.signal]}`}>
        {SIGNAL_LABEL[node.signal]}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   메인 SectorMindmapView
───────────────────────────────────────────── */

interface SectorMindmapViewProps {
  chain: ValueChain;
  onNodeClick?: (node: ValueChainNode) => void;
  selectedTicker?: string | null;
  /** 전체 뷰 그리드에서 사용할 축소 모드 */
  compact?: boolean;
}

export function SectorMindmapView({
  chain,
  onNodeClick,
  selectedTicker,
  compact = false,
}: SectorMindmapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomGRef = useRef<SVGGElement>(null);

  const [isDark, setIsDark] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleTiers, setVisibleTiers] = useState<Set<number>>(new Set([0, 1, 2, 3]));
  const [animKey, setAnimKey] = useState(chain.sector);

  // 3D 회전 상태
  const [rotation, setRotation] = useState({ x: 12, y: -8 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  // 섹터 변경 시 애니메이션 재실행
  useEffect(() => {
    setAnimKey(chain.sector + '_' + Date.now());
  }, [chain.sector]);

  // 다크모드 감지
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // D3 zoom/pan
  useEffect(() => {
    if (!svgRef.current || !zoomGRef.current) return;
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
      .on('zoom', (event) => {
        if (zoomGRef.current) {
          zoomGRef.current.setAttribute('transform', event.transform.toString());
        }
      });
    const svgSel = d3.select(svgRef.current);
    svgSel.call(zoom);
    return () => { svgSel.on('.zoom', null); };
  }, []);

  // 3D 드래그 핸들러
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (compact) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, rotX: rotation.x, rotY: rotation.y };
  }, [compact, rotation]);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setRotation({
      x: Math.max(-30, Math.min(30, dragStart.current.rotX - dy * 0.3)),
      y: Math.max(-45, Math.min(45, dragStart.current.rotY + dx * 0.3)),
    });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  const colors = isDark ? COLORS.dark : COLORS.light;

  // viewBox 크기
  const maxOrbit = compact ? ORBIT_RADIUS[1] : ORBIT_RADIUS[3];
  const padding = TIER_RADIUS[0] + (compact ? 16 : 48);
  const vbSize = (maxOrbit + padding) * 2;
  const cx = vbSize / 2;
  const cy = vbSize / 2;

  const { nodes: allNodes, edges: allEdges } = useMemo(() => buildMindMapLayout(chain), [chain]);

  // compact 모드에선 T2/T3 제외
  const nodes = compact ? allNodes.filter((n) => n.tier === -1 || (n.tier as number) <= 1) : allNodes;
  const edges = compact ? allEdges.filter((e) => e.tier <= 1) : allEdges;

  // 별 생성 (다크모드)
  const stars = useMemo(() => generateStars(65, vbSize), [vbSize]);

  // 노드 ID → tier 매핑
  const nodeTierMap = new Map(nodes.map((n) => [n.id, n.tier]));

  const isTierVisible = (tier: TierLevel | number) => {
    if (tier === -1) return true;
    return visibleTiers.has(tier as number);
  };

  const isEdgeVisible = (edge: MindMapEdge) => {
    const srcTier = nodeTierMap.get(edge.sourceId) ?? -1;
    const tgtTier = nodeTierMap.get(edge.targetId) ?? -1;
    return isTierVisible(srcTier) && isTierVisible(tgtTier);
  };

  const toggleTier = (tier: number) => {
    setVisibleTiers((prev) => {
      const next = new Set(prev);
      if (next.has(tier)) {
        if (next.size > 1) next.delete(tier);
      } else {
        next.add(tier);
      }
      return next;
    });
  };

  // 이벤트 핸들러
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGGElement>, node: ValueChainNode) => {
      if (!containerRef.current || compact) return;
      const rect = containerRef.current.getBoundingClientRect();
      setHoveredId(node.ticker);
      setTooltip({ node, x: e.clientX - rect.left + 14, y: e.clientY - rect.top - 24 });
    },
    [compact]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip((prev) =>
      prev ? { ...prev, x: e.clientX - rect.left + 14, y: e.clientY - rect.top - 24 } : prev
    );
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
    setTooltip(null);
  }, []);

  // 떠다니는 애니메이션 CSS 생성
  const floatStyles = useMemo(() => {
    const keyframes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const amp = 3 + (i % 4) * 1.5; // 3~7.5px
      const dur = 4 + i * 0.5; // 4~7.5s
      keyframes.push(`
        @keyframes fanen-float-${i} {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-${amp}px); }
        }
      `);
      // 수평 방향도 약간
      keyframes.push(`
        @keyframes fanen-sway-${i} {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          33% { transform: translateX(${amp * 0.4}px) translateY(-${amp * 0.7}px); }
          66% { transform: translateX(-${amp * 0.3}px) translateY(-${amp}px); }
        }
      `);
      void dur; // dur은 style 속성에서 사용
    }
    return keyframes.join('\n');
  }, []);

  // Tier별 배지 variant 매핑
  const tierBadgeVariant = (tier: number) => {
    const map: Record<number, 'tier0' | 'tier1' | 'tier2' | 'tier3'> = {
      0: 'tier0', 1: 'tier1', 2: 'tier2', 3: 'tier3',
    };
    return map[tier] ?? 'outline';
  };

  return (
    <div className="flex flex-col w-full">
      {/* ── 헤더 (compact 모드 제외) ── */}
      {!compact && (
        <Card className="mb-3 border-zinc-200/60 dark:border-white/5">
          <CardHeader className="p-3 pb-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-zinc-600 dark:text-zinc-300">
                  {chain.sectorLabel} 섹터 연결망
                </CardTitle>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  중심기업에서 직납·부품·물류까지 단계별로 탐색하세요
                </p>
              </div>

              {/* Tier 필터 배지 */}
              <div className="flex gap-1.5 flex-wrap">
                {([0, 1, 2, 3] as const).map((tier) => {
                  const active = visibleTiers.has(tier);
                  return (
                    <Badge
                      key={tier}
                      variant={active ? tierBadgeVariant(tier) : 'outline'}
                      size="sm"
                      className={`cursor-pointer select-none transition-all duration-200 ${
                        active ? '' : 'opacity-40'
                      }`}
                      onClick={() => toggleTier(tier)}
                      title={`T${tier} ${TIER_LABELS[tier]} 표시/숨김`}
                    >
                      T{tier} {TIER_LABELS[tier]}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* ── 3D 컨테이너 ── */}
      <div
        style={{ perspective: compact ? 'none' : '1200px' }}
        className="w-full"
      >
        <div
          ref={containerRef}
          className="relative select-none overflow-hidden rounded-xl border"
          style={{
            aspectRatio: '1 / 1',
            backgroundColor: colors.bg,
            borderColor: colors.border,
            transform: compact ? 'none' : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? 'none' : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
            transformStyle: 'preserve-3d',
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => { handleDragEnd(); }}
        >
          {/* 라이트모드: warm 그라디언트 배경 */}
          {!isDark && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(255,237,200,0.4) 0%, rgba(255,249,235,0.2) 50%, transparent 80%)',
              }}
            />
          )}

          {/* 기능 안내 배지 */}
          {!compact && (
            <div
              className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 pointer-events-none"
              style={{ backgroundColor: colors.badge, border: `1px solid ${colors.badgeBorder}` }}
            >
              <span className="text-[10px] font-medium" style={{ color: colors.badgeText }}>
                드래그로 3D 회전 · 스크롤로 확대/축소
              </span>
            </div>
          )}

          <svg
            ref={svgRef}
            viewBox={`0 0 ${vbSize} ${vbSize}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full cursor-grab active:cursor-grabbing"
            aria-label="섹터 연결망 마인드맵"
          >
            <defs>
              {/* ── CSS 애니메이션 ── */}
              <style>{`
                @keyframes fanen-circle-in {
                  from { opacity: 0; transform: scale(0.15); }
                  to   { opacity: 1; transform: scale(1); }
                }
                @keyframes fanen-text-in {
                  from { opacity: 0; }
                  to   { opacity: 1; }
                }
                @keyframes fanen-edge-draw {
                  from { stroke-dashoffset: 1000; opacity: 0; }
                  to   { stroke-dashoffset: 0; opacity: 1; }
                }
                @keyframes fanen-star-twinkle {
                  0%, 100% { opacity: 0.3; }
                  50% { opacity: 1; }
                }
                .fanen-node-circle {
                  transform-box: fill-box;
                  transform-origin: center;
                }
                .fanen-node-glow {
                  transform-box: fill-box;
                  transform-origin: center;
                }
                .fanen-float-group {
                  transform-box: fill-box;
                  transform-origin: center;
                }
                ${floatStyles}
              `}</style>

              {/* ── 세포 질감: Radial Gradient per tier ── */}
              {([0, 1, 2, 3] as const).map((tier) => {
                const tierKey = String(tier);
                const highlight = isDark
                  ? (COLORS.dark.tierHighlight[tierKey] ?? '#fff')
                  : (COLORS.light.tierHighlight[tierKey] ?? '#fff');
                const base = colors.tierFill[tierKey] ?? '#333';
                const shadow = isDark
                  ? (COLORS.dark.tierShadow[tierKey] ?? '#000')
                  : (COLORS.light.tierShadow[tierKey] ?? '#000');
                return (
                  <radialGradient
                    key={`grad-t${tier}`}
                    id={`grad-t${tier}`}
                    cx="35%" cy="30%" r="65%"
                  >
                    <stop offset="0%" stopColor={highlight} stopOpacity={isDark ? 0.6 : 0.5} />
                    <stop offset="50%" stopColor={base} />
                    <stop offset="100%" stopColor={shadow} stopOpacity={0.9} />
                  </radialGradient>
                );
              })}

              {/* 중앙 노드 그라디언트 */}
              <radialGradient id="grad-center" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor={isDark ? '#F9FAFB' : '#374151'} stopOpacity={0.9} />
                <stop offset="60%" stopColor={colors.centerFill} />
                <stop offset="100%" stopColor={isDark ? '#9CA3AF' : '#000000'} stopOpacity={0.8} />
              </radialGradient>

              {/* ── Glow 필터 per tier ── */}
              {([0, 1, 2, 3] as const).map((tier) => (
                <filter key={`glow-t${tier}`} id={`glow-t${tier}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feFlood floodColor={colors.tierStroke[String(tier)]} floodOpacity={isDark ? 0.35 : 0.2} result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}

              {/* 중앙 glow */}
              <filter id="glow-center" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feFlood floodColor={isDark ? '#F9FAFB' : '#111827'} floodOpacity={0.3} result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* zoom/pan 그룹 */}
            <g ref={zoomGRef}>
              <g key={animKey}>

                {/* ── 다크모드: 별 장식 ── */}
                {isDark && stars.map((star, i) => (
                  <circle
                    key={`star-${i}`}
                    cx={star.cx} cy={star.cy}
                    r={star.r}
                    fill="#FFFFFF"
                    fillOpacity={star.opacity}
                    style={{
                      animation: `fanen-star-twinkle ${3 + (i % 5) * 1.2}s ease-in-out ${(i % 7) * 0.8}s infinite`,
                    }}
                  />
                ))}

                {/* ── 다크모드: 달 (초승달, 우상단) ── */}
                {isDark && !compact && (
                  <g style={{ animation: 'fanen-text-in 1.5s ease 0.5s both' }}>
                    <circle cx={vbSize - 80} cy={70} r={18} fill="#E5E7EB" fillOpacity={0.15} />
                    <circle cx={vbSize - 74} cy={65} r={15} fill={colors.bg} />
                  </g>
                )}

                {/* ── 라이트모드: 태양 (좌상단) ── */}
                {!isDark && !compact && (
                  <g style={{ animation: 'fanen-text-in 1.5s ease 0.5s both' }}>
                    <circle cx={80} cy={70} r={22} fill="#FCD34D" fillOpacity={0.25} />
                    <circle cx={80} cy={70} r={14} fill="#FBBF24" fillOpacity={0.35} />
                    {/* 방사선 8개 */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = (Math.PI * 2 * i) / 8;
                      return (
                        <line
                          key={`ray-${i}`}
                          x1={80 + 20 * Math.cos(angle)} y1={70 + 20 * Math.sin(angle)}
                          x2={80 + 32 * Math.cos(angle)} y2={70 + 32 * Math.sin(angle)}
                          stroke="#FBBF24" strokeWidth={1.5} strokeOpacity={0.3}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </g>
                )}

                {/* ── Bezier 연결선 ── */}
                <g>
                  {edges.map((edge) => {
                    const tierKey = String(edge.tier);
                    const visible = isEdgeVisible(edge);
                    const isHighlighted = hoveredId &&
                      (edge.sourceId === hoveredId || edge.targetId === hoveredId);
                    const animDelay = edge.tier * 0.2 + 0.1;

                    // bezier curve 제어점 계산
                    const x1 = cx + edge.x1;
                    const y1 = cy + edge.y1;
                    const x2 = cx + edge.x2;
                    const y2 = cy + edge.y2;
                    const dx = (x2 - x1) * 0.35;
                    const dy = (y2 - y1) * 0.15;
                    const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1 + dy}, ${x2 - dx} ${y2 - dy}, ${x2} ${y2}`;

                    return (
                      <path
                        key={edge.id}
                        d={pathD}
                        fill="none"
                        stroke={isHighlighted ? colors.hover : colors.tierEdge[tierKey]}
                        strokeWidth={edge.tier === 0 ? 2 : edge.tier === 1 ? 1.5 : 1}
                        strokeOpacity={
                          !visible ? 0
                            : hoveredId
                              ? isHighlighted ? 0.9 : 0.04
                              : TIER_EDGE_OPACITY[tierKey]
                        }
                        strokeDasharray={edge.tier === 3 ? '5 3' : undefined}
                        style={{
                          transition: 'stroke-opacity 0.25s, stroke 0.25s',
                          animation: `fanen-text-in 0.6s ease ${animDelay}s both`,
                        }}
                      />
                    );
                  })}
                </g>

                {/* ── 노드 ── */}
                <g>
                  {nodes.map((node) => {
                    const r = TIER_RADIUS[node.tier as number] ?? 13;
                    const isCenter = node.tier === -1;
                    const isSelected = node.originalNode?.ticker === selectedTicker;
                    const isHovered = hoveredId === node.id;
                    const visible = isTierVisible(node.tier);
                    const tierKey = String(node.tier);
                    const stroke = isSelected || isHovered
                      ? colors.hover
                      : (colors.tierStroke[tierKey] ?? '#6B7280');
                    const strokeWidth = isCenter ? 0 : isSelected ? 2.5 : 1.5;
                    const animDelay = isCenter ? 0 : (node.tier as number) * 0.2 + 0.12;
                    const groupOpacity = !visible ? 0
                      : hoveredId && !isCenter && hoveredId !== node.id ? colors.dimOpacity
                      : 1;
                    const floatIdx = node.floatIdx % 8;
                    const floatDur = 4 + floatIdx * 0.5;
                    const floatDelay = (node.floatIdx * 0.7) % 3;

                    // 세포 질감용 gradient ID
                    const gradId = isCenter ? 'grad-center' : `grad-t${node.tier}`;
                    const glowFilter = isCenter ? 'url(#glow-center)' : `url(#glow-t${node.tier})`;

                    return (
                      <g
                        key={node.id}
                        className="fanen-float-group"
                        style={{
                          cursor: node.originalNode && !compact ? 'pointer' : 'default',
                          opacity: groupOpacity,
                          transition: 'opacity 0.25s',
                          animation: `fanen-float-${floatIdx} ${floatDur}s ease-in-out ${floatDelay}s infinite`,
                          transformBox: 'fill-box' as const,
                          transformOrigin: 'center',
                        }}
                        onClick={() => node.originalNode && !compact && onNodeClick?.(node.originalNode)}
                        onMouseEnter={
                          node.originalNode
                            ? (e) => handleMouseEnter(e as React.MouseEvent<SVGGElement>, node.originalNode!)
                            : undefined
                        }
                        onMouseMove={
                          node.originalNode
                            ? (e) => handleMouseMove(e as React.MouseEvent<SVGGElement>)
                            : undefined
                        }
                        onMouseLeave={node.originalNode ? handleMouseLeave : undefined}
                        aria-label={node.name}
                      >
                        {/* 외곽 glow 후광 (항상 표시, 호버 시 강화) */}
                        <circle
                          cx={cx + node.x} cy={cy + node.y}
                          r={r + (isCenter ? 12 : 6)}
                          fill={colors.tierStroke[tierKey] ?? '#6B7280'}
                          fillOpacity={(isHovered || isSelected) ? 0.2 : 0.06}
                          style={{ transition: 'fill-opacity 0.3s' }}
                        />

                        {/* 세포 본체 (radial gradient + glow filter) */}
                        <circle
                          cx={cx + node.x} cy={cy + node.y}
                          r={r}
                          fill={`url(#${gradId})`}
                          stroke={stroke}
                          strokeWidth={strokeWidth}
                          strokeDasharray={node.tier === 3 ? '4 2' : undefined}
                          filter={glowFilter}
                          className="fanen-node-circle"
                          style={{
                            transition: 'stroke 0.25s',
                            animation: `fanen-circle-in 0.6s cubic-bezier(.34,1.56,.64,1) ${animDelay}s both`,
                          }}
                        />

                        {/* 구체 하이라이트 (세포 질감 강화) */}
                        {!isCenter && (
                          <circle
                            cx={cx + node.x - r * 0.2} cy={cy + node.y - r * 0.25}
                            r={r * 0.35}
                            fill="white"
                            fillOpacity={isDark ? 0.12 : 0.2}
                            style={{
                              animation: `fanen-circle-in 0.6s cubic-bezier(.34,1.56,.64,1) ${animDelay}s both`,
                              pointerEvents: 'none',
                            }}
                          />
                        )}

                        {/* 중앙 노드 텍스트 */}
                        {isCenter && (
                          <text
                            x={cx + node.x} y={cy + node.y + 1}
                            textAnchor="middle" dominantBaseline="middle"
                            fill={colors.centerText}
                            fontSize={13} fontWeight="700" letterSpacing="-0.3"
                            style={{ animation: `fanen-text-in 0.4s ease 0s both` }}
                          >
                            {node.name}
                          </text>
                        )}

                        {/* 노드 레이블 */}
                        {!isCenter && (!compact || node.tier === 0) && (
                          <text
                            x={cx + node.x} y={cy + node.y + r + 12}
                            textAnchor="middle" dominantBaseline="middle"
                            fill={isSelected || isHovered ? colors.labelHover : colors.label}
                            fontSize={node.tier === 0 ? (compact ? 8 : 10) : 9}
                            fontWeight={node.tier === 0 ? '600' : isSelected || isHovered ? '600' : '500'}
                            style={{
                              transition: 'fill 0.2s',
                              animation: `fanen-text-in 0.4s ease ${animDelay + 0.1}s both`,
                            }}
                          >
                            {node.name.length > 7 ? node.name.slice(0, 6) + '\u2026' : node.name}
                          </text>
                        )}

                        {/* 선택 강조 링 */}
                        {isSelected && !isCenter && (
                          <circle
                            cx={cx + node.x} cy={cy + node.y}
                            r={r + 8}
                            fill="none"
                            stroke={colors.hover}
                            strokeWidth={1}
                            strokeOpacity={0.5}
                            strokeDasharray="4 2"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* 이벤트 트리거 텍스트 */}
                {!compact && (
                  <text
                    x={cx} y={cy + TIER_RADIUS[-1] + 22}
                    textAnchor="middle"
                    fill={colors.eventText}
                    fontSize={9} fontStyle="italic"
                    fontWeight="500"
                    style={{ animation: 'fanen-text-in 0.4s ease 0.05s both' }}
                  >
                    {chain.eventTrigger.length > 32
                      ? chain.eventTrigger.slice(0, 30) + '\u2026'
                      : chain.eventTrigger}
                  </text>
                )}

              </g>
            </g>
          </svg>

          {/* 툴팁 */}
          {tooltip && <NodeTooltip tooltip={tooltip} isDark={isDark} />}

          {/* 범례 (compact 제외) */}
          {!compact && (
            <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 pointer-events-none">
              {([0, 1, 2, 3] as const).map((tier) => {
                const stroke = colors.tierStroke[String(tier)];
                return (
                  <div
                    key={tier}
                    className="flex items-center gap-1.5 transition-opacity duration-200"
                    style={{ opacity: visibleTiers.has(tier) ? 1 : 0.25 }}
                  >
                    <svg width={16} height={10} className="flex-shrink-0">
                      <circle
                        cx={5} cy={5} r={4}
                        fill={`url(#grad-t${tier})`}
                        stroke={stroke}
                        strokeWidth={1.5}
                        strokeDasharray={tier === 3 ? '3 2' : undefined}
                      />
                    </svg>
                    <span
                      className="text-[10px] font-medium whitespace-nowrap"
                      style={{ color: isDark ? stroke : stroke + 'DD' }}
                    >
                      {TIER_LABELS[tier]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 줌 힌트 */}
          {!compact && (
            <p
              className="absolute bottom-3 left-3 text-[9px] font-medium pointer-events-none"
              style={{ color: colors.hintText }}
            >
              스크롤·핀치로 확대/축소
            </p>
          )}

          {/* compact 모드: 섹터 이름 오버레이 */}
          {compact && (
            <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
              <span
                className="text-[11px] font-semibold"
                style={{ color: colors.headerText }}
              >
                {chain.sectorLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
