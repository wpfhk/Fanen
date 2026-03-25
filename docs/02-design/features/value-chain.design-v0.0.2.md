# Value Chain 레이아웃 개편 — Design Document

> 버전: v0.0.2
> 작성일: 2026-03-25
> Plan 참조: docs/01-plan/features/value-chain.plan-v0.0.2.md
> 아키텍처: Option C — Pragmatic Balance (기존 코드 최대 재활용 + shadcn-ui 패턴 도입)

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 다크모드 미작동 + 순수 Tailwind 하드코딩 → shadcn/ui 패턴으로 테마 대응 및 UX 개선 |
| **WHO** | 밸류체인 분석 페이지 방문 사용자 (다크/라이트 모드 양쪽) |
| **RISK** | 기존 D3 Sankey 로직 보존, DisclaimerBanner 유지 필수 |
| **SUCCESS** | 다크/라이트 모드 정상 동작, shadcn/ui 컴포넌트 활용, Playwright 검증 통과 |
| **SCOPE** | value-chain 페이지 레이아웃만 변경 (Sankey 로직 유지) |

---

## 1. 문제 분석 (Playwright QA 결과)

| 문제 | 현황 | 해결 방향 |
|------|------|-----------|
| 다크모드 미작동 | `bg-[#0F1923]` 하드코딩, `dark:` 클래스 없음 | CSS 변수 기반 테마 색상 적용 |
| 컴포넌트 비표준 | 날 Tailwind 클래스 직접 사용 | shadcn/ui 패턴 컴포넌트 도입 |
| 섹터 탭 UX | 단순 button — 활성/비활성 상태 불명확 | Radix Tabs 기반 `SectorTabs` 컴포넌트 |
| CompanyCard | button 태그, 구조 단순 | shadcn Card 패턴으로 재구성 |
| TierBadge | 수동 색상 매핑 | CVA 기반 Badge 컴포넌트 |

---

## 2. 신규 공통 유틸리티

### 2.1 `src/lib/cn.ts`
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 3. 신규 UI 컴포넌트 (shadcn/ui 패턴)

### 3.1 `src/components/ui/badge.tsx`
CVA(class-variance-authority) 기반 뱃지 컴포넌트
```
variants:
  - default: 기본 (teal)
  - tier0: 메이저 T0 (teal)
  - tier1: T1 직접납품 (blue)
  - tier2: T2 부품소재 (purple)
  - tier3: T3 간접수혜 (slate)
  - success: 관심 (green)
  - warning: 관망 (amber)
  - danger: 주의 (red)
sizes:
  - sm: 기본 뱃지 크기
  - md: 중간
```

### 3.2 `src/components/ui/tabs.tsx`
Radix UI Tabs 기반 컴포넌트
```
- Tabs (root)
- TabsList (trigger 컨테이너)
- TabsTrigger (선택 버튼)
- TabsContent (내용 영역)
dark: 클래스로 다크모드 지원
```

---

## 4. 수정 대상 컴포넌트

### 4.1 `TierBadge.tsx` — Badge 컴포넌트 활용

```
기존: 수동 className 문자열 조합
변경: Badge variant={tierVariantMap[tier]} 사용
```

### 4.2 `CompanyCard.tsx` — 구조 개선

```
기존: <button> 전체를 카드로 사용
변경:
  <article> (카드 래퍼 — dark:bg-slate-800/80 bg-white)
    Header: TierBadge + 티커 + 기업명
    Body:   신호 Badge + 배당률
    Desc:   설명 텍스트
    Footer: AiBadge + 출처 링크
  onClick은 카드 전체에 cursor-pointer로 처리
```

### 4.3 `ValueChainView.tsx` — 다크모드 대응

```
기존: bg-[#0F1923] 하드코딩
변경:
  - Sankey 컨테이너: dark:bg-slate-900 bg-white
  - TierList: dark:border-slate-700 border-slate-200
  - 이벤트 트리거 박스: dark:bg-teal-950 bg-teal-50
  - ResizeObserver 중복 제거 (2번째 Observer 삭제)
```

### 4.4 `ValueChainPageClient.tsx` — Tabs 컴포넌트 적용

```
기존: 수동 button + className 조건부
변경: <Tabs value={sector} onValueChange={handleSectorChange}>
       <TabsList>
         <TabsTrigger value="defense">방산</TabsTrigger>
         ...
       </TabsList>
```

### 4.5 `page.tsx` — 배경 다크모드 대응

```
기존: className="min-h-screen bg-[#0F1923]"
변경: className="min-h-screen bg-white dark:bg-[#0F1923]"
  또는 className="min-h-screen bg-slate-50 dark:bg-slate-950"
```

---

## 5. D3 Sankey 색상 개선

```typescript
// 라이트/다크 모드 대응 (prefers-color-scheme 기준)
const isDark = document.documentElement.classList.contains('dark');
const TIER_COLORS = isDark ? {
  [-1]: '#0D9488', 0: '#0D9488', 1: '#3B82F6', 2: '#8B5CF6', 3: '#64748B',
} : {
  [-1]: '#0F766E', 0: '#0F766E', 1: '#2563EB', 2: '#7C3AED', 3: '#475569',
};

// 노드 텍스트 색상
.attr('fill', isDark ? '#CBD5E1' : '#334155')
```

---

## 6. 구현 순서

```
1. src/lib/cn.ts                                    [신규]
2. src/components/ui/badge.tsx                      [신규]
3. src/components/ui/tabs.tsx                       [신규]
4. src/features/value-chain/components/TierBadge.tsx [수정]
5. src/features/value-chain/components/CompanyCard.tsx [수정]
6. src/features/value-chain/components/ValueChainView.tsx [수정]
7. src/app/value-chain/ValueChainPageClient.tsx     [수정]
8. src/app/value-chain/page.tsx                     [수정]
```

---

## 7. CLAUDE.md 원칙 준수

- DisclaimerBanner 유지 ✅
- AiBadge + sourceUrl 유지 ✅
- TypeScript strict 오류 0건 ✅
- 다크모드: dark: 클래스 기반 (class 전략)
