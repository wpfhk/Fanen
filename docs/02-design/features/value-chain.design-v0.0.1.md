# Value Chain 분석 — Design Document

> 버전: v0.0.1
> 작성일: 2026-03-25
> Plan 참조: docs/01-plan/features/value-chain.plan-v0.0.1.md
> 아키텍처: Option C — Pragmatic Balance (기존 features/ 패턴 준수 + D3 dynamic import)

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 비나 맵이 "정세 → 섹터"라면, Value Chain은 "섹터 → 기업"까지 이어주는 투자 액션의 마지막 고리 |
| **WHO** | 숨은 수혜주를 찾는 테마/트렌드 투자 관심 사용자 (20~40대) |
| **RISK** | D3 Sankey SSR 이슈, AI 기업명 직접 생성 금지(mock만), DisclaimerBanner 필수 |
| **SUCCESS** | Value Chain 페이지 렌더링 오류 0건, TS 오류 0건, mock 3종(방산/반도체/2차전지) |
| **SCOPE** | v0.0.1: src/features/value-chain/ 신규 + /value-chain 페이지 + BinahMap 드릴다운 |

---

## 1. 아키텍처 개요

### 1.1 디렉토리 구조

```
src/features/value-chain/
├── types.ts                     ValueChainNode, ValueChain 인터페이스
├── index.ts                     public exports
├── components/
│   ├── ValueChainView.tsx        D3 Sankey 다이어그램 (dynamic import)
│   ├── TierBadge.tsx             T0/T1/T2/T3 뱃지
│   └── CompanyCard.tsx           기업 카드 (신호등 + 반디 설명)
├── hooks/
│   └── useValueChain.ts          섹터 파라미터 → 체인 데이터 반환
└── mock/
    └── mockValueChains.ts        방산/반도체/2차전지 mock 데이터

src/app/value-chain/
└── page.tsx                      /value-chain?sector={sector}
```

### 1.2 데이터 흐름

```
BinahMap (섹터 클릭)
  → /value-chain?sector=defense
    → useValueChain(sector)
      → mockValueChains[sector]  (v0.0.1: mock / v0.1.0: Railway API)
        → ValueChainView (Sankey)
          → CompanyCard (노드 클릭)
```

---

## 2. 타입 정의 (`types.ts`)

```typescript
export type TierLevel = 0 | 1 | 2 | 3;
export type SignalType = 'buy' | 'wait' | 'watch';

export interface ValueChainNode {
  ticker: string;
  name: string;
  tier: TierLevel;            // 0=메이저, 1=직접납품, 2=부품소재, 3=간접수혜
  relationship: string;       // "직접 납품", "부품/소재", "간접 수혜"
  dividendYield?: number;     // 시가배당률 (%)
  description: string;        // 반디 한줄 설명
  signal: SignalType;
  sourceUrl: string;          // KRX/DART 출처 URL (필수 — CLAUDE.md 원칙)
}

export interface ValueChain {
  sector: string;             // "defense", "semiconductor", "battery"
  sectorLabel: string;        // "방산", "반도체", "2차전지"
  eventTrigger: string;       // 트리거 이벤트 설명
  nodes: ValueChainNode[];
  updatedAt: string;          // ISO 8601
}
```

---

## 3. 컴포넌트 설계

### 3.1 TierBadge.tsx

```
props: { tier: TierLevel }
렌더: tier에 따른 컬러 뱃지
  T0 → teal (메이저)
  T1 → blue (직접납품)
  T2 → purple (부품소재)
  T3 → gray (간접수혜)
```

### 3.2 CompanyCard.tsx

```
props: { node: ValueChainNode }
렌더:
  [TierBadge] 티커 · 기업명
  신호등 아이콘 (🟢/🟡/🔴) + signal 텍스트
  배당률 (있을 때만)
  반디 설명 텍스트
  [AiBadge] + 출처 링크 (sourceUrl)
```

### 3.3 ValueChainView.tsx (D3 Sankey)

```
'use client' + dynamic import 필수 (SSR 방지)

props: { chain: ValueChain }

레이아웃:
  - 모바일(<768px): 계층 아코디언 리스트 (Tier별 그룹)
  - 데스크톱: D3 Sankey 다이어그램

D3 Sankey 노드 구성:
  이벤트노드 → 섹터노드 → T0노드 → T1노드 → T2노드 → T3노드

클릭: 노드 클릭 시 selectedNode 상태 업데이트 → CompanyCard 표시
```

### 3.4 useValueChain.ts

```
파라미터: sector: string | null
반환: { chain: ValueChain | null, isLoading: boolean, error: Error | null }

v0.0.1: mockValueChains[sector] 반환
v0.1.0: Railway API /api/value-chain?sector={sector} 호출
```

---

## 4. 페이지 (`app/value-chain/page.tsx`)

```
Server Component (searchParams로 sector 수신)
  ↓
  DisclaimerBanner (필수 — CLAUDE.md 원칙)
  ↓
  <ValueChainPageClient sector={sector} />
    (useValueChain → ValueChainView + 섹터 셀렉터)
```

**URL 파라미터**: `?sector=defense | semiconductor | battery`
**기본값**: sector 없으면 "defense" (방산)

---

## 5. BinahMap 드릴다운 연결

`src/features/binah-map/components/` 내 섹터 노드 클릭 핸들러에:
```typescript
router.push(`/value-chain?sector=${sectorKey}`)
// 또는 <Link href={`/value-chain?sector=${sectorKey}`}>
```

---

## 6. mock 데이터 (`mockValueChains.ts`)

**3종 섹터:**

| 섹터 | sectorKey | 메이저 종목 예시 |
|------|-----------|----------------|
| 방산 | defense | 한화에어로스페이스, LIG넥스원 |
| 반도체 | semiconductor | 삼성전자, SK하이닉스 |
| 2차전지 | battery | LG에너지솔루션, 삼성SDI |

각 섹터당 노드: T0 × 2, T1 × 2, T2 × 2, T3 × 2 (총 8개)
모든 노드 sourceUrl: `"https://www.krx.co.kr"` (mock placeholder)

---

## 7. CLAUDE.md 원칙 준수 체크리스트

- [ ] `DisclaimerBanner` — `app/value-chain/page.tsx` 에 렌더링
- [ ] `AiBadge` — CompanyCard의 반디 설명 옆에 표시
- [ ] `sourceUrl` — 모든 ValueChainNode에 필수 (빈 문자열 불가)
- [ ] AI가 기업명/수치 직접 생성 금지 — mock 데이터 파일에서만 참조
- [ ] TypeScript strict 오류 0건

---

## 8. 구현 순서 (Agent 분담)

### Agent 1 — frontend-dev

```
순서:
1. src/features/value-chain/components/TierBadge.tsx
2. src/features/value-chain/components/CompanyCard.tsx
3. src/features/value-chain/components/ValueChainView.tsx  (D3 Sankey + 모바일 fallback)
4. src/app/value-chain/page.tsx
```

### Agent 2 — backend-dev

```
순서:
1. src/features/value-chain/types.ts
2. src/features/value-chain/mock/mockValueChains.ts  (방산/반도체/2차전지)
3. src/features/value-chain/hooks/useValueChain.ts
4. src/features/value-chain/index.ts
5. src/features/binah-map/ → Value Chain 드릴다운 링크 추가
6. src/app/(dashboard)/layout.tsx or navigation → Value Chain 메뉴 추가
```

**의존성**: Agent 2가 types.ts를 먼저 완료해야 Agent 1이 import 가능.
→ Agent 2 types.ts 완료 후 Agent 1 시작 (또는 동시 시작 후 types import 충돌 주의)

---

## 9. 의존성 설치

```bash
# D3 (이미 설치되어 있을 가능성 높음 — 확인 후 설치)
npm install d3 @types/d3
```
