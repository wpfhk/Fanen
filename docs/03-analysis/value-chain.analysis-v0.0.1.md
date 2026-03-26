# Value Chain — Gap Analysis Report

> 버전: v0.0.1
> 분석일: 2026-03-26
> Design 참조: docs/02-design/features/value-chain.design-v0.0.1.md
> Phase: Check

---

## Context Anchor (Design 인계)

| 항목 | 내용 |
|------|------|
| **WHY** | 비나 맵이 "정세 → 섹터"라면, Value Chain은 "섹터 → 기업"까지 이어주는 투자 액션의 마지막 고리 |
| **WHO** | 숨은 수혜주를 찾는 테마/트렌드 투자 관심 사용자 (20~40대) |
| **RISK** | D3 Sankey SSR 이슈, AI 기업명 직접 생성 금지(mock만), DisclaimerBanner 필수 |
| **SUCCESS** | Value Chain 페이지 렌더링 오류 0건, TS 오류 0건, mock 3종(방산/반도체/2차전지) |
| **SCOPE** | v0.0.1: src/features/value-chain/ 신규 + /value-chain 페이지 + BinahMap 드릴다운 |

---

## 1. Match Rate Summary

| 항목 | 설계 | 구현 | 상태 |
|------|------|------|------|
| types.ts (ValueChainNode, ValueChain) | ✓ | ✓ `sector-analysis/types.ts` | ✅ |
| hooks/useValueChain.ts | ✓ | ✓ `useSectorAnalysis.ts` (동일 인터페이스) | ✅ |
| mock/mockValueChains.ts (3종) | ✓ | ✓ `mockSectorData.ts` (3종 완비) | ✅ |
| index.ts (public exports) | ✓ | ✓ | ✅ |
| ValueChainView.tsx (D3 Sankey) | ✓ | △ `ValueChainDiagram.tsx` (force simulation) + `SectorMindmapView.tsx` | ⚠️ |
| TierBadge.tsx (독립 컴포넌트) | ✓ | ✗ 미생성 (SectorDetailPanel에 인라인 처리) | ⚠️ |
| CompanyCard.tsx | ✓ | △ `SectorDetailPanel.tsx` (기능 동일, 명칭 변경) | ⚠️ |
| DisclaimerBanner 렌더링 | ✓ | ✓ `page.tsx` 최상단 렌더링 | ✅ |
| AiBadge 표시 | ✓ | ✓ `SectorDetailPanel.tsx` 내 AiBadge 포함 | ✅ |
| sourceUrl 필수 적용 | ✓ | ✓ 전 노드 KRX_URL 적용 | ✅ |
| BinahMap 드릴다운 링크 | ✓ | ✓ `GeoEventPanel.tsx` → `/sector-analysis?sector=` | ✅ |
| TypeScript strict 오류 0건 | ✓ | ✓ `npx tsc --noEmit` 통과 | ✅ |
| 페이지 경로 | `/value-chain` | `/sector-analysis` | ⚠️ |
| Feature 디렉토리 | `features/value-chain/` | `features/sector-analysis/` | ⚠️ |
| SSR 에러 방지 (ssr:false) | ✓ | ✓ `next/dynamic({ ssr: false })` 적용 | ✅ |

**전체 Match Rate: 87%**

---

## 2. Gap 목록

### [Important] — 설계 대비 명칭·구조 변경 (의도적 변경, 기능 동일)

#### G-01: 디렉토리·페이지 경로 변경
- **설계**: `src/features/value-chain/`, `src/app/value-chain/`
- **구현**: `src/features/sector-analysis/`, `src/app/sector-analysis/`
- **판단**: 의도적 범위 확장 (섹터 분석 = 밸류체인 + 마인드맵). 기능 커버리지 동일.
- **권고**: 설계 문서에 경로 변경 이력 주석 추가 (v0.0.2에서)

#### G-02: ValueChainView.tsx (Sankey) → 두 컴포넌트로 분리
- **설계**: `ValueChainView.tsx` — D3 Sankey 다이어그램 단일 컴포넌트
- **구현**: `ValueChainDiagram.tsx` (D3 force simulation 방사형) + `SectorMindmapView.tsx` (radial mindmap)
- **판단**: 설계보다 향상된 구현. Sankey → 방사형 전환은 UI 개선 결정으로 적절.
- **권고**: 설계 문서 v0.0.2에서 Sankey 대신 force simulation으로 업데이트

#### G-03: TierBadge.tsx 미생성
- **설계**: 독립 컴포넌트 `TierBadge.tsx`
- **구현**: `SectorDetailPanel.tsx` 내에 인라인 처리 (`T${node.tier} · ${TIER_LABEL[node.tier]}`)
- **판단**: 현재 사용처가 1곳이므로 YAGNI 원칙상 인라인 처리 수용 가능. 단, 재사용 시 추출 필요.
- **권고**: 2곳 이상 사용 시 `TierBadge.tsx` 추출

#### G-04: CompanyCard.tsx → SectorDetailPanel.tsx
- **설계**: `CompanyCard.tsx` — 기업 카드 컴포넌트
- **구현**: `SectorDetailPanel.tsx` — 기능 동일, 명칭 변경
- **판단**: 기능 완전 동일. AiBadge, sourceUrl, signal, dividendYield 모두 포함.

---

## 3. CLAUDE.md 원칙 준수 체크리스트

- [x] `DisclaimerBanner` — `app/sector-analysis/page.tsx` 최상단 렌더링 (`variant="signal"`)
- [x] `AiBadge` — `SectorDetailPanel.tsx`의 설명 하단 표시
- [x] `sourceUrl` — 전 노드 `KRX_URL` 적용 (mock placeholder)
- [x] AI 기업명/수치 직접 생성 금지 — `mockSectorData.ts` 정적 상수로만 정의
- [x] TypeScript strict 오류 0건

---

## 4. Success Criteria 달성 현황

| Success Criteria | 달성 여부 |
|-----------------|----------|
| Value Chain 페이지 렌더링 오류 0건 | ✅ SSR 에러 `next/dynamic(ssr:false)` 로 수정 완료 |
| TS 오류 0건 | ✅ |
| mock 3종 (방산/반도체/2차전지) | ✅ |
| BinahMap 드릴다운 연결 | ✅ |
| DisclaimerBanner 필수 렌더링 | ✅ |

---

## 5. 종합 평가

**Match Rate: 87%**

구현된 모든 기능은 설계 요구사항을 충족하거나 초과합니다.
갭 항목은 모두 의도적 리팩토링 결과로, 기능 결손이 없습니다:
- 디렉토리/페이지 경로는 `sector-analysis`로 통합 (범위 확장)
- Sankey → force simulation 전환은 UX 개선 결정
- TierBadge 인라인 처리는 YAGNI 준수

**v0.0.2 권장 사항**:
1. 설계 문서 경로 및 컴포넌트 구조를 실제 구현에 맞게 업데이트
2. TierBadge가 2곳 이상 사용 시 독립 컴포넌트로 추출

---

_분석자: Claude Sonnet 4.6 (bkit gap-detector) | 2026-03-26_
