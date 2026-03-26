'use client';

/**
 * SectorCellUniverse v2.0 — 3D 셀 유니버스 (리팩토링)
 *
 * 개선사항:
 * 1. d3-force-3d 물리 엔진: 반발력으로 노드 3D 입체 배치
 * 2. LOD 텍스트: T0 항상 표시, 거리/호버 기반 투명도 보간
 * 3. MeshTransmissionMaterial: 유리/세포 투명 질감
 * 4. @react-three/postprocessing Bloom: 몽환적 발광 효과
 */

import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Html,
  MeshTransmissionMaterial,
  Line,
  Environment,
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/Card';
import { useSectorStore } from '../store/useSectorStore';
import type { ValueChain, ValueChainNode, TierLevel } from '../types';

/* ─────────────────────────────────────────────
   상수 정의
───────────────────────────────────────────── */

const TIER_CONFIG: Record<TierLevel, {
  radius: number;
  color: string;
  emissiveDark: string;
  emissiveLight: string;
  transmissionDark: number;
  transmissionLight: number;
}> = {
  0: {
    radius: 0.7,
    color: '#60A5FA',
    emissiveDark: '#3B82F6',
    emissiveLight: '#F59E0B',
    transmissionDark: 0.6,
    transmissionLight: 0.5,
  },
  1: {
    radius: 0.5,
    color: '#34D399',
    emissiveDark: '#10B981',
    emissiveLight: '#10B981',
    transmissionDark: 0.7,
    transmissionLight: 0.6,
  },
  2: {
    radius: 0.38,
    color: '#FBBF24',
    emissiveDark: '#D97706',
    emissiveLight: '#D97706',
    transmissionDark: 0.8,
    transmissionLight: 0.7,
  },
  3: {
    radius: 0.28,
    color: '#F87171',
    emissiveDark: '#EF4444',
    emissiveLight: '#DC2626',
    transmissionDark: 0.85,
    transmissionLight: 0.75,
  },
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
  buy: '매수', wait: '관망', watch: '주시',
};

/** LOD 라벨 표시 거리 임계값 (카메라 거리) */
const LABEL_SHOW_DISTANCE = 10;

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

/** d3-force-3d 물리 시뮬레이션으로 3D 위치 계산 */
function computePhysicsPositions(
  nodes: ValueChainNode[],
  connections: Array<{ from: string; to: string }>,
): Map<string, THREE.Vector3> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const d3 = require('d3-force-3d') as any;

  // d3 노드 객체 (x, y, z가 자동으로 추가됨)
  const d3Nodes = nodes.map((n) => ({
    id: n.ticker,
    tier: n.tier,
    x: seededRandom(n.ticker + 'ix') * 4 - 2,
    y: seededRandom(n.ticker + 'iy') * 4 - 2,
    z: seededRandom(n.ticker + 'iz') * 4 - 2,
  }));

  const d3Links = connections.map((c) => ({ source: c.from, target: c.to }));

  const tierRadius: Record<number, number> = { 0: 0.7, 1: 0.5, 2: 0.38, 3: 0.28 };

  const sim = d3.forceSimulation(d3Nodes, 3)
    .force('charge', d3.forceManyBody().strength(-120))
    .force(
      'link',
      d3.forceLink(d3Links)
        .id((d: { id: string }) => d.id)
        .distance((d: { source: { tier: number }; target: { tier: number } }) => {
          const avgTier = (d.source.tier + d.target.tier) / 2;
          return 3.5 + avgTier * 1.2;
        })
        .strength(0.6),
    )
    .force('center', d3.forceCenter(0, 0, 0))
    .force('z', d3.forceZ(0).strength(0.05))
    .force(
      'collide',
      d3.forceCollide()
        .radius((d: { tier: number }) => tierRadius[d.tier] * 2.5 + 1.0)
        .strength(0.9),
    )
    .stop();

  // 시뮬레이션 수렴까지 실행
  for (let i = 0; i < 400; i++) sim.tick();

  const positions = new Map<string, THREE.Vector3>();
  for (const n of d3Nodes as Array<{ id: string; x: number; y: number; z: number }>) {
    positions.set(n.id, new THREE.Vector3(n.x, n.y, n.z));
  }
  return positions;
}

/** 연결 계산 (인접 tier 간 seededRandom 매핑) */
function computeConnections(
  nodes: ValueChainNode[],
): Array<{ from: string; to: string; fromTier: TierLevel; toTier: TierLevel }> {
  const tierGroups = new Map<TierLevel, ValueChainNode[]>();
  for (const node of nodes) {
    const group = tierGroups.get(node.tier) ?? [];
    group.push(node);
    tierGroups.set(node.tier, group);
  }

  const connections: Array<{ from: string; to: string; fromTier: TierLevel; toTier: TierLevel }> = [];
  const tiers: TierLevel[] = [0, 1, 2, 3];
  for (let ti = 0; ti < tiers.length - 1; ti++) {
    const parentTier = tiers[ti];
    const childTier = tiers[ti + 1];
    const parents = tierGroups.get(parentTier) ?? [];
    const children = tierGroups.get(childTier) ?? [];
    for (const child of children) {
      if (parents.length > 0) {
        const idx = Math.floor(seededRandom(child.ticker + 'parent') * parents.length) % parents.length;
        connections.push({ from: parents[idx].ticker, to: child.ticker, fromTier: parentTier, toTier: childTier });
      }
    }
  }
  return connections;
}

/** 인접 노드 맵 빌드 */
function buildAdjacencyMap(
  connections: Array<{ from: string; to: string }>,
): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  for (const c of connections) {
    if (!adj.has(c.from)) adj.set(c.from, new Set());
    if (!adj.has(c.to)) adj.set(c.to, new Set());
    adj.get(c.from)!.add(c.to);
    adj.get(c.to)!.add(c.from);
  }
  return adj;
}

/* ─────────────────────────────────────────────
   3D 서브 컴포넌트
───────────────────────────────────────────── */

/** LOD 라벨 + 유리 재질 세포 노드 */
function CellNode({
  node,
  position,
  isDark,
  isSelected,
  isHighlighted,
  isCompact,
  onNodeClick,
  onHover,
}: {
  node: ValueChainNode;
  position: THREE.Vector3;
  isDark: boolean;
  isSelected: boolean;
  isHighlighted: boolean;  // hover된 노드의 인접 노드
  isCompact: boolean;
  onNodeClick?: (node: ValueChainNode) => void;
  onHover?: (ticker: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const labelWrapperRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const config = TIER_CONFIG[node.tier];
  const floatOffset = useMemo(() => seededRandom(node.ticker + 'float') * Math.PI * 2, [node.ticker]);
  const floatSpeed = useMemo(() => 1.2 + seededRandom(node.ticker + 'speed') * 0.8, [node.ticker]);
  const floatAmp = useMemo(() => 0.12 + seededRandom(node.ticker + 'amp') * 0.08, [node.ticker]);

  // 부유 애니메이션 + 스케일 보간 + LOD 라벨 투명도
  useFrame(({ clock, camera }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = position.y + Math.sin(t * floatSpeed + floatOffset) * floatAmp;

    const targetScale = hovered || isSelected ? 1.18 : (isHighlighted ? 1.08 : 1.0);
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1),
    );

    // LOD: T0 항상, 나머지는 카메라 거리 기반
    if (!isCompact && labelWrapperRef.current) {
      const worldPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(worldPos);
      const dist = camera.position.distanceTo(worldPos);
      const shouldShow = node.tier === 0 || hovered || isSelected || isHighlighted || dist < LABEL_SHOW_DISTANCE;
      const targetOpacity = shouldShow ? 1 : 0;
      const currentOpacity = parseFloat(labelWrapperRef.current.style.opacity || '0');
      const newOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, 0.08);
      labelWrapperRef.current.style.opacity = String(newOpacity.toFixed(3));
      labelWrapperRef.current.style.pointerEvents = newOpacity > 0.3 ? 'auto' : 'none';
    }
  });

  const emissive = isDark ? config.emissiveDark : config.emissiveLight;
  const emissiveIntensity = hovered || isSelected ? 1.0 : (isHighlighted ? 0.6 : 0.25);
  const transmission = isDark ? config.transmissionDark : config.transmissionLight;

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => { e.stopPropagation(); onNodeClick?.(node); },
    [node, onNodeClick],
  );

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover?.(node.ticker);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover?.(null);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[config.radius, 64, 64]} />
        <MeshTransmissionMaterial
          color={config.color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          transmission={transmission}
          roughness={0.1}
          thickness={1.5}
          chromaticAberration={0.05}
          anisotropy={0.3}
          ior={1.3}
          backside
        />
      </mesh>

      {/* LOD 라벨 — 직접 DOM 투명도 제어 */}
      {!isCompact && (
        <Html
          distanceFactor={8}
          position={[0, config.radius + 0.35, 0]}
          center
          zIndexRange={[10, 0]}
        >
          <div
            ref={labelWrapperRef}
            className="flex flex-col items-center gap-1"
            style={{
              opacity: node.tier === 0 ? 1 : 0,
              transition: 'none',
              minWidth: '80px',
            }}
          >
            <Badge variant={TIER_BADGE_VARIANT[node.tier]} size="sm">
              {TIER_LABELS[node.tier]}
            </Badge>
            <div className="rounded-lg backdrop-blur-md bg-white/15 dark:bg-black/30 border border-white/25 dark:border-white/15 px-2 py-1 text-center shadow-sm">
              <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                {node.name}
              </p>
              {(hovered || isSelected) && (
                <p className="text-[9px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {node.ticker}
                </p>
              )}
            </div>

            {/* 선택 시 상세 카드 */}
            {isSelected && (
              <Card className="w-48 backdrop-blur-md bg-white/85 dark:bg-zinc-900/80 border-white/30 dark:border-zinc-700/40 shadow-xl">
                <div className="p-2.5 space-y-1.5">
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {node.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold ${SIGNAL_COLORS[node.signal]}`}>
                      {SIGNAL_LABELS[node.signal]}
                    </span>
                    <span className="text-[9px] text-zinc-400">{node.relationship}</span>
                  </div>
                  {node.dividendYield !== undefined && (
                    <p className="text-[9px] text-zinc-400">
                      배당수익률: {node.dividendYield}%
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </Html>
      )}

      {/* compact 모드: T0만 라벨 */}
      {isCompact && node.tier === 0 && (
        <Html distanceFactor={6} position={[0, config.radius + 0.2, 0]} center>
          <p className="text-[8px] font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap text-center drop-shadow">
            {node.name}
          </p>
        </Html>
      )}
    </group>
  );
}

/** Bezier 연결선 (CatmullRomCurve3) */
function ConnectionLine({
  from,
  to,
  tierColor,
  isDark,
  isHighlighted,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  tierColor: string;
  isDark: boolean;
  isHighlighted: boolean;
}) {
  const points = useMemo(() => {
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    const perp = new THREE.Vector3(-from.z + to.z, 0.6, from.x - to.x).normalize().multiplyScalar(0.8);
    mid.add(perp);
    return new THREE.CatmullRomCurve3([from, mid, to]).getPoints(32);
  }, [from, to]);

  const opacity = isHighlighted ? 0.9 : (isDark ? 0.2 : 0.15);

  return (
    <Line
      points={points}
      color={tierColor}
      lineWidth={isHighlighted ? 2.0 : 1.0}
      transparent
      opacity={opacity}
    />
  );
}

/** Day/Night 조명 */
function SceneLighting({ isDark }: { isDark: boolean }) {
  const ambRef = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    if (ambRef.current) {
      ambRef.current.intensity = THREE.MathUtils.lerp(
        ambRef.current.intensity,
        isDark ? 0.1 : 0.5,
        0.04,
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={isDark ? 0.1 : 0.5} color={isDark ? '#0A0A1A' : '#FFF8E7'} />
      {isDark ? (
        <>
          <pointLight position={[0, 6, 0]} intensity={2.0} color="#60A5FA" distance={25} decay={2} />
          <pointLight position={[-5, -2, -5]} intensity={0.8} color="#8B5CF6" distance={18} decay={2} />
          <pointLight position={[5, -2, 5]} intensity={0.5} color="#34D399" distance={15} decay={2} />
        </>
      ) : (
        <>
          <directionalLight position={[6, 8, 6]} intensity={1.2} color="#FFE4B5" />
          <directionalLight position={[-4, 3, -4]} intensity={0.4} color="#FDE68A" />
        </>
      )}
    </>
  );
}

/** Dark mode 감지 훅 */
function useDarkModeObserver() {
  const { setIsDark } = useSectorStore();
  useEffect(() => {
    const html = document.documentElement;
    const check = () => setIsDark(html.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [setIsDark]);
}

/** 카메라 위치 조정 */
function CameraController({ compact }: { compact: boolean }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(compact ? 0 : 2, compact ? 14 : 6, compact ? 0 : 16);
    camera.lookAt(0, 0, 0);
  }, [compact, camera]);
  return null;
}

/* ─────────────────────────────────────────────
   씬 내부 컴포넌트
───────────────────────────────────────────── */

function UniverseScene({
  chain,
  onNodeClick,
  selectedTicker,
  compact,
}: {
  chain: ValueChain;
  onNodeClick?: (node: ValueChainNode) => void;
  selectedTicker?: string | null;
  compact: boolean;
}) {
  const { isDark, selectedTicker: storeSelected, setSelectedTicker } = useSectorStore();
  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);

  useDarkModeObserver();

  const activeTicker = selectedTicker ?? storeSelected;

  // 연결 계산
  const connections = useMemo(() => computeConnections(chain.nodes), [chain.nodes]);

  // 물리 시뮬레이션 3D 위치
  const positions = useMemo(
    () => computePhysicsPositions(chain.nodes, connections),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chain.sector],
  );

  // 인접 맵 (hover highlight용)
  const adjacencyMap = useMemo(() => buildAdjacencyMap(connections), [connections]);

  const handleNodeClick = useCallback(
    (node: ValueChainNode) => {
      setSelectedTicker(activeTicker === node.ticker ? null : node.ticker);
      onNodeClick?.(node);
    },
    [activeTicker, setSelectedTicker, onNodeClick],
  );

  const handleHover = useCallback((ticker: string | null) => {
    setHoveredTicker(ticker);
  }, []);

  return (
    <>
      <CameraController compact={compact} />
      <SceneLighting isDark={isDark} />
      <color attach="background" args={[isDark ? '#02020A' : '#F8F7F5']} />

      {/* 환경 맵 (유리 굴절용) */}
      <Environment preset={isDark ? 'night' : 'studio'} />

      {/* 연결선 */}
      {connections.map((conn) => {
        const fromPos = positions.get(conn.from);
        const toPos = positions.get(conn.to);
        if (!fromPos || !toPos) return null;
        const isHighlighted = hoveredTicker !== null && (
          conn.from === hoveredTicker || conn.to === hoveredTicker
        );
        return (
          <ConnectionLine
            key={`${conn.from}-${conn.to}`}
            from={fromPos}
            to={toPos}
            tierColor={TIER_CONFIG[conn.fromTier].color}
            isDark={isDark}
            isHighlighted={isHighlighted}
          />
        );
      })}

      {/* 세포 노드 */}
      {chain.nodes.map((node) => {
        const pos = positions.get(node.ticker);
        if (!pos) return null;
        const isHighlighted = hoveredTicker !== null &&
          hoveredTicker !== node.ticker &&
          (adjacencyMap.get(hoveredTicker)?.has(node.ticker) ?? false);
        return (
          <CellNode
            key={node.ticker}
            node={node}
            position={pos}
            isDark={isDark}
            isSelected={activeTicker === node.ticker}
            isHighlighted={isHighlighted}
            isCompact={compact}
            onNodeClick={handleNodeClick}
            onHover={handleHover}
          />
        );
      })}

      {/* Bloom 효과 */}
      {!compact && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.15}
            luminanceSmoothing={0.85}
            intensity={isDark ? 0.8 : 0.3}
            height={256}
          />
        </EffectComposer>
      )}

      {!compact && (
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI * 0.85}
          minPolarAngle={Math.PI * 0.1}
          maxDistance={30}
          minDistance={4}
          enableDamping
          dampingFactor={0.05}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   메인 컴포넌트 (export)
───────────────────────────────────────────── */

export interface SectorCellUniverseProps {
  chain: ValueChain;
  onNodeClick?: (node: ValueChainNode) => void;
  selectedTicker?: string | null;
  compact?: boolean;
}

export function SectorCellUniverse({
  chain,
  onNodeClick,
  selectedTicker,
  compact = false,
}: SectorCellUniverseProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-zinc-200/60 dark:border-zinc-700/30 ${
        compact ? 'aspect-square' : 'aspect-[4/3]'
      }`}
    >
      <Canvas
        camera={{
          fov: compact ? 55 : 45,
          near: 0.1,
          far: 120,
          position: compact ? [0, 14, 0] : [2, 6, 16],
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <UniverseScene
          chain={chain}
          onNodeClick={onNodeClick}
          selectedTicker={selectedTicker}
          compact={compact}
        />
      </Canvas>

      {compact && (
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
          <p className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 text-center drop-shadow">
            {chain.sectorLabel}
          </p>
        </div>
      )}
    </div>
  );
}
