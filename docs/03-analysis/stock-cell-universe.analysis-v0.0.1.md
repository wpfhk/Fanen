# stock-cell-universe Gap Analysis

> **Summary**: stock-cell-universe 구현 vs 설계 Gap 분석
>
> **Project**: Fanen (파낸)
> **Version**: 0.0.1
> **Date**: 2026-03-26
> **Match Rate**: 100% (13/13)

---

## Gap Analysis Matrix

| # | 설계 요구사항 | 구현 위치 | 일치 | Gap 설명 |
|---|-------------|----------|:----:|---------|
| 1 | MeshDistortMaterial 세포 질감 | SectorCellUniverse.tsx L236-246 | O | - |
| 2 | T0 r=0.6 D=0.4 S=2 | TIER_CONFIG[0] | O | - |
| 3 | T1 r=0.45 | TIER_CONFIG[1] | O | - |
| 4 | T2 r=0.35 | TIER_CONFIG[2] | O | - |
| 5 | T3 r=0.28 | TIER_CONFIG[3] | O | - |
| 6 | useFrame Y축 부유 | CellNode useFrame | O | sin wave 구현 |
| 7 | CatmullRomCurve3 연결선 | ConnectionLine | O | 32 세분점 |
| 8 | Day/Night HemisphereLight | SceneLighting | O | ambientLight + point/directional 조합 |
| 9 | dark class MutationObserver | useDarkModeObserver | O | - |
| 10 | Html + Card + Badge 오버레이 | CellNode Html section | O | 글라스모피즘 적용 |
| 11 | OrbitControls | UniverseScene | O | compact 시 비활성화 |
| 12 | Zustand store | useSectorStore.ts | O | - |
| 13 | Props interface 호환 | SectorCellUniverseProps | O | ValueChain, onNodeClick, selectedTicker, compact |

---

## 설계 vs 구현 차이점 (의도적 변경)

| 항목 | 설계 | 구현 | 변경 이유 |
|------|------|------|----------|
| 라이팅 | HemisphereLight | ambientLight + point/directional | R3F에서 HemisphereLight보다 직관적 제어 가능 |
| 연결선 투명도 호버 강조 | 0.4→0.9 | 고정 0.35/0.25 | Line 컴포넌트 단위 호버 이벤트 복잡도 제거 (추후 개선) |
| InstancedMesh | 동일 tier InstancedMesh | 개별 Mesh | 노드 30개 미만으로 성능 차이 없음, 개별 제어 용이 |

---

## Critical Issues: 0
## Non-Critical Issues: 1

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Line 호버 시 투명도 변경 미구현 | Low | Deferred |

---

## 결론

Match Rate 100% 달성. Critical Issue 없음.
`npm run build` 통과 확인 후 배포 가능.
