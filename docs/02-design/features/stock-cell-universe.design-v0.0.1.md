# stock-cell-universe Design Document

> **Summary**: React Three Fiber 기반 3D 셀 유니버스 컴포넌트 설계
>
> **Project**: Fanen (파낸)
> **Version**: 0.0.1
> **Author**: CTO Lead (bkit)
> **Date**: 2026-03-26
> **Status**: Approved
> **Planning Doc**: [stock-cell-universe.plan-v0.0.1.md](../01-plan/features/stock-cell-universe.plan-v0.0.1.md)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | SVG+CSS 3D 한계를 넘어 진정한 WebGL 3D 시각화 |
| **WHO** | 20~60대 일반 투자자 |
| **RISK** | WebGL 미지원, 60fps 성능 미달, 번들 크기 |
| **SUCCESS** | build 통과, 3섹터 렌더링, compact/full 동작, MR>=90% |
| **SCOPE** | useSectorStore + SectorCellUniverse + PageClient 교체 |

---

## 1. Overview

### 1.1 Design Goals

1. MeshDistortMaterial로 유기적 세포 질감의 3D 노드 구현
2. T0~T3 계층별 크기/발광색/연결선 시각화
3. Day/Night 라이팅 자동 전환
4. shadcn/ui 오버레이로 기존 디자인 시스템 유지
5. 60fps 성능 목표

### 1.2 Design Principles

- Composition: R3F의 선언적 씬 그래프 활용
- Separation: 3D 렌더링과 UI 오버레이 분리
- Performance: InstancedMesh 대신 개별 Mesh + useMemo 최적화 (노드 30개 미만)

---

## 2. Architecture

### 2.0 Selected: Option C (Pragmatic)

단일 파일에 서브 컴포넌트를 정의하되, store는 별도 파일로 분리.

### 2.1 Component Architecture

```
SectorCellUniverse (메인 R3F Canvas)
├── SceneLighting          (Day/Night 라이팅)
├── CellNode[]             (세포 질감 3D 노드)
│   └── Html (drei)        (shadcn Card+Badge 오버레이)
├── ConnectionLine[]       (Bezier 연결선)
├── OrbitControls (drei)   (마우스 회전/줌)
└── useSectorStore         (Zustand 상태)
```

### 2.2 Data Flow

```
ValueChain (props)
  → useSectorStore (selectedTicker, isDark, visibleTiers)
  → Layout 계산 (동심원 배치 + 랜덤 오프셋)
  → CellNode 렌더링 (MeshDistortMaterial, useFrame 부유)
  → ConnectionLine 렌더링 (CatmullRomCurve3)
  → Html 오버레이 (shadcn Card+Badge)
```

---

## 3. Detailed Component Design

### 3.1 useSectorStore (Zustand)

```typescript
interface SectorStoreState {
  selectedTicker: string | null;
  visibleTiers: Set<TierLevel>;
  isDark: boolean;
  setSelectedTicker: (ticker: string | null) => void;
  toggleTier: (tier: TierLevel) => void;
  setIsDark: (dark: boolean) => void;
}
```

### 3.2 CellNode

| Tier | Radius | Distort | Speed | Emissive (Dark) | Emissive (Light) |
|------|--------|---------|-------|-----------------|-------------------|
| T0 | 0.6 | 0.4 | 2 | #60A5FA (blue) | #F59E0B (amber) |
| T1 | 0.45 | 0.35 | 2.5 | #34D399 (green) | #10B981 (emerald) |
| T2 | 0.35 | 0.3 | 3 | #FBBF24 (yellow) | #D97706 (amber) |
| T3 | 0.28 | 0.25 | 3.5 | #F87171 (red) | #EF4444 (red) |

- Y축 부유: `sin(time * speed + seedOffset) * 0.15`
- 호버: emissiveIntensity 0.3 → 0.8, scale 1.0 → 1.15

### 3.3 Layout Algorithm (동심원 배치)

```
T0 노드: 반지름 2.0 원 위에 균등 배치
T1 노드: 반지름 4.0
T2 노드: 반지름 6.0
T3 노드: 반지름 8.0
+ seededRandom 오프셋 (x: +-0.5, z: +-0.5)
```

compact 모드: 전체 스케일 0.5, 카메라 fov 60, OrbitControls 비활성화

### 3.4 ConnectionLine

- 부모 tier → 자식 tier 연결 (T0→T1, T1→T2, T2→T3)
- CatmullRomCurve3로 중간점에 Y 오프셋 추가 (곡선 효과)
- Line (drei) 사용, opacity 0.4, 호버 시 0.9
- 색상: 부모 tier의 emissive 색상 사용

### 3.5 SceneLighting

| Mode | Component | Props |
|------|-----------|-------|
| Light | ambientLight | intensity=0.6, color=#FFF8E7 |
| Light | directionalLight | intensity=0.8, color=#FFE4B5, position=[5,5,5] |
| Dark | ambientLight | intensity=0.15, color=#0A0A1A |
| Dark | pointLight | intensity=1.5, color=#60A5FA, position=[0,3,0] |

lerp 보간으로 smooth 전환 (duration ~0.5s via useFrame)

### 3.6 shadcn/ui Overlay

- `<Html>` (drei) with `distanceFactor={8}` + billboard 모드
- 글라스모피즘: `backdrop-blur-md bg-white/10 dark:bg-black/20`
- Badge variant: tier0~tier3 (기존 badge.tsx 활용)
- 선택된 노드: Card 확장 (description, signal 표시)

---

## 4. File Structure

```
src/features/sector-analysis/
├── store/
│   └── useSectorStore.ts        # Zustand store (신규)
├── components/
│   ├── SectorCellUniverse.tsx   # 메인 R3F 컴포넌트 (신규)
│   ├── SectorMindmapView.tsx    # 기존 (유지, deprecated)
│   ├── SectorDetailPanel.tsx    # 기존 (유지)
│   └── ValueChainDiagram.tsx    # 기존 (유지)
├── hooks/
│   └── useSectorAnalysis.ts     # 기존 (유지)
├── mock/
│   └── mockSectorData.ts        # 기존 (유지)
└── types.ts                     # 기존 (유지)
```

---

## 5. Implementation Order

1. `useSectorStore.ts` — Zustand store
2. `SectorCellUniverse.tsx` — 메인 R3F 컴포넌트
3. `SectorAnalysisPageClient.tsx` — dynamic import 교체

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.0.1 | 2026-03-26 | Initial draft | CTO Lead |
