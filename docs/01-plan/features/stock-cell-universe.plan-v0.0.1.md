# stock-cell-universe Planning Document

> **Summary**: 기존 SVG+CSS 3D 섹터 마인드맵을 React Three Fiber 기반 3D 셀 유니버스로 완전 대체
>
> **Project**: Fanen (파낸)
> **Version**: 0.0.1
> **Author**: CTO Lead (bkit)
> **Date**: 2026-03-26
> **Status**: Approved

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 기존 SectorMindmapView는 SVG+CSS 3D로 구현되어 진정한 3D 인터랙션(OrbitControls, depth)이 불가능하고 성능 한계가 있음 |
| **Solution** | React Three Fiber + drei + Three.js 기반 3D 셀 유니버스 컴포넌트로 교체 |
| **Function/UX Effect** | 유기적 세포 질감의 3D 노드, 마우스 회전/줌, Day/Night 사이클, 글라스모피즘 오버레이 |
| **Core Value** | 섹터 연결망의 직관적 시각화로 투자 인사이트 전달력 극대화 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | SVG+CSS 3D의 한계를 넘어 진정한 WebGL 3D 시각화로 섹터 연결망을 표현 |
| **WHO** | 20~60대 일반 투자자 (파낸 타깃 사용자) |
| **RISK** | R3F/WebGL 미지원 브라우저, 60fps 성능 미달, 번들 크기 증가 |
| **SUCCESS** | npm run build 통과, 3개 섹터 정상 렌더링, compact/full 모드 동작, Match Rate >= 90% |
| **SCOPE** | SectorCellUniverse 신규 생성 + useSectorStore + SectorAnalysisPageClient 교체 |

---

## 1. Overview

### 1.1 Purpose

기존 `SectorMindmapView.tsx` (SVG + CSS 3D transform + D3.js) 기반 섹터 연결망 시각화를 **React Three Fiber 기반 진정한 3D 셀 유니버스**로 완전 대체한다.

### 1.2 Background

- 기존 SVG+CSS 3D는 perspective transform만 활용하여 진정한 3D depth 표현 불가
- 노드 수 증가 시 SVG DOM 조작으로 성능 저하
- WebGL 기반 R3F로 전환하면 InstancedMesh, GPU 가속, OrbitControls 등 활용 가능

---

## 2. Scope

### 2.1 In Scope

- [x] Zustand store: `useSectorStore.ts`
- [x] 메인 3D 컴포넌트: `SectorCellUniverse.tsx`
- [x] MeshDistortMaterial 세포 질감 노드
- [x] CatmullRomCurve3 기반 연결선
- [x] Day/Night 라이팅 사이클
- [x] shadcn/ui Card+Badge 글라스모피즘 오버레이 (drei Html)
- [x] OrbitControls 회전/줌
- [x] `SectorAnalysisPageClient.tsx` 업데이트 (dynamic import 교체)

### 2.2 Out of Scope

- 기존 SectorMindmapView 삭제 (별도 정리 작업)
- VR/AR 지원
- 서버사이드 렌더링 (SSR off)
- Playwright E2E 테스트 (별도 스프린트)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | MeshDistortMaterial 기반 세포 질감 3D 노드 렌더링 | High | Pending |
| FR-02 | T0~T3 계층별 크기/색상 차별화 | High | Pending |
| FR-03 | useFrame Y축 부유 애니메이션 | High | Pending |
| FR-04 | CatmullRomCurve3 Bezier 연결선 | High | Pending |
| FR-05 | Day/Night 라이팅 전환 (dark class 감지) | Medium | Pending |
| FR-06 | shadcn/ui Card+Badge 오버레이 (Html Billboard) | High | Pending |
| FR-07 | OrbitControls 마우스 회전/줌 | High | Pending |
| FR-08 | Zustand 상태 관리 (selectedTicker, visibleTiers, isDark) | High | Pending |
| FR-09 | onNodeClick prop 호출 | High | Pending |
| FR-10 | compact 모드 (overview grid) 지원 | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | 60fps @ 30개 노드 | Chrome DevTools FPS meter |
| Bundle Size | R3F/drei tree-shaking 적용 | npm run build 분석 |
| Compatibility | Chrome/Safari/Edge 최신 2버전 | Manual test |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] npm run build 통과 (TypeScript 에러 0)
- [x] 3개 섹터(defense/semiconductor/battery) 정상 렌더링
- [x] compact 모드와 full 모드 모두 작동
- [x] Match Rate >= 90%

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| WebGL 미지원 브라우저 | Medium | Low | Fallback div 표시 + 기존 SVG 뷰 유지 |
| MeshDistortMaterial 성능 이슈 | High | Medium | InstancedMesh 적용, LOD 고려 |
| drei Html 오버레이 z-fighting | Medium | Medium | occlude prop, zIndexRange 조정 |
| 번들 크기 증가 (~300KB) | Medium | High | dynamic import + tree-shaking |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| SectorAnalysisPageClient.tsx | Component | SectorMindmapView → SectorCellUniverse dynamic import 교체 |

### 6.2 Current Consumers

| Resource | Operation | Code Path | Impact |
|----------|-----------|-----------|--------|
| SectorMindmapView | RENDER | SectorAnalysisPageClient.tsx (overview + detail) | Breaking - 교체 대상 |

---

## 7. Architecture Considerations

### 7.1 Project Level: Dynamic

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| 3D Renderer | Three.js raw / R3F / Babylon.js | R3F | React 생태계 통합, drei 유틸리티 |
| Material | Standard / Distort / Custom Shader | MeshDistortMaterial | 세포 질감 표현 최적 |
| State | Context / Zustand / Redux | Zustand | 경량, R3F 생태계 호환 |
| Connection | Line / TubeGeometry / Custom | Line (drei) | 구현 간결, 성능 우수 |

---

## 8. Next Steps

1. [x] Design document 작성
2. [x] Do phase: 구현
3. [ ] Check phase: gap 분석
4. [ ] Report phase: 완료 보고

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.0.1 | 2026-03-26 | Initial draft | CTO Lead |
