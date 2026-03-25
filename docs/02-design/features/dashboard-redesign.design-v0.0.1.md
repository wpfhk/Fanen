# Dashboard Redesign — Design Document v0.0.1

> Feature: dashboard-redesign
> Plan 참조: docs/01-plan/binah.plan.md
> 작성일: 2026-03-25
> 선택 설계안: Option B — Clean 재설계
> 검토 반영: v2 (사용자 피드백 3개 + 추가 검토 2개 반영)

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 현재 대시보드는 하드코딩 색상 + linear stack 레이아웃으로 어드민 스타일. BINAH 브랜드 정체성("반디가 찾은 오늘의 기회")을 반영한 우아하고 세련된 UI가 필요함. |
| **WHO** | 20~60대 전 연령 불로소득 관심 투자자. 모바일 우선, 정보 소외 계층 포함. |
| **RISK** | (1) Card.tsx 교체 → Regression (**해결: LegacyCard 분리**) (2) D3 + Tailwind animation 충돌 (**해결: globals.css 분리**) (3) `cn()` 유틸 없음 (**해결: lib/utils.ts 생성**) (4) `text-muted-foreground` shadcn 변수 미정의 (**해결: Tailwind 직접 클래스 사용**) |
| **SUCCESS** | 라이트/다크 모드 양쪽에서 카드 경계선 부드러움, Progress bars 세련됨, ping animation 동작, bandi-aura glow 렌더링, Card 호환성 유지 |
| **SCOPE** | DashboardHome + MorningBriefCard + SectorTop3Card + BinahMapLite + PortfolioCard(신규) + NewsCard(신규) + HotZoneCard(신규) |

---

## 설계 검토 반영 사항 (v2)

### 피드백 1 — Card.tsx Regression 방지 ✅

**문제:** 기존 `Card.tsx`를 shadcn 표준으로 전면 교체하면 다른 페이지(뉴스, 모의투자 등) Regression 위험.

**해결:**
```
src/components/ui/
├── Card.tsx          ← 기존 그대로 유지 (LegacyCard 역할, 변경 금지)
└── card.tsx          ← 신규: shadcn 표준 Card (CardHeader, CardContent, CardTitle, CardFooter)
```
- 대시보드 신규 컴포넌트는 `card.tsx` (소문자) import
- 기존 `Card.tsx` (대문자) 사용 파일은 일체 건드리지 않음

### 피드백 2 — D3 애니메이션 + globals.css 분리 ✅

**문제:** D3 `.style('animation', ...)` 주입 방식은 React 생명주기 충돌, 브라우저 FPS 저하 위험.

**해결:** D3는 클래스명만 부여, 애니메이션은 `globals.css`에서 정의.
```css
/* globals.css 추가 */
@keyframes map-ping {
  75%, 100% { transform: scale(2.5); opacity: 0; }
}
.map-ping-ring {
  animation: map-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  transform-box: fill-box;
  transform-origin: center;
}
```
D3 코드: `.attr('class', 'map-ping-ring')` 만 설정.

### 피드백 3 — 모바일 QuickMenu order 최상단 ✅

**문제:** 모바일에서 QuickMenu가 맨 아래로 내려가 스크롤 과다.

**해결:** CSS `order` 클래스로 모바일에서 MorningBriefCard 다음으로 끌어올림.
```tsx
<QuickMenuGrid className="order-2 md:order-last md:col-span-2" />
// MorningBriefCard: order-1 md:order-first
// HotZoneCard: order-3 md:order-none
```

### 추가 검토 4 — `cn()` 유틸 없음 ✅

**문제:** `src/lib/utils.ts` 파일 없음 → shadcn 컴포넌트가 `cn()` 임포트 시 오류.

**해결:** Module 1에서 `src/lib/utils.ts` 먼저 생성.
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
> ✅ `clsx`와 `tailwind-merge` 모두 package.json에 이미 설치됨.

### 추가 검토 5 — shadcn CSS 변수 미정의 ✅

**문제:** `text-muted-foreground`, `text-foreground` 등 shadcn 토큰이 globals.css에 없음.
(`--muted-foreground`, `--foreground` HSL 변수 미정의 → Tailwind 클래스 불작동)

**해결:** shadcn 토큰 대신 프로젝트 기존 Tailwind 클래스를 직접 사용.
| shadcn 토큰 | 대체 Tailwind 클래스 |
|-------------|-------------------|
| `text-muted-foreground` | `text-slate-500 dark:text-slate-400` |
| `text-foreground` | `text-slate-900 dark:text-slate-100` |
| `bg-primary` | `bg-primary` (tailwind.config에 정의됨 ✅) |
| `border-border` | `border-slate-100 dark:border-white/5` |

> 단, `card.tsx` 내부에서 className prop으로 외부 override 가능하게 설계.

---

## 1. 아키텍처 개요

### 1.1 신규 파일 구조

```
src/
├── lib/
│   └── utils.ts                 ← 신규: cn() 유틸 (Module 1)
├── components/ui/
│   ├── Card.tsx                 ← 기존 유지 (변경 금지)
│   ├── card.tsx                 ← 신규: shadcn 표준 Card (Module 1)
│   └── progress.tsx             ← 신규: shadcn Progress (Module 1)
├── features/dashboard/
│   ├── DashboardHome.tsx        ← Bento Grid 전면 재작성 (Module 3)
│   └── components/
│       ├── MorningBriefCard.tsx ← bandi-aura glow (Module 2)
│       ├── SectorTop3Card.tsx   ← shadcn Progress bars (Module 2)
│       ├── HotZoneCard.tsx      ← BinahMapLite wrapper + dot pattern (Module 3)
│       ├── PortfolioCard.tsx    ← tracking-tight typography (Module 2)
│       └── NewsCard.tsx         ← glass card (Module 2)
└── features/binah-map/components/
    └── BinahMapLite.tsx         ← ping class 부여 (Module 3)
```

---

## 2. 색상 & 스타일 시스템

### 2.1 Tailwind 클래스 패턴 (shadcn 변수 없이)

| 상황 | 라이트모드 | 다크모드 |
|------|-----------|---------|
| 카드 배경 | `bg-white shadow-sm` | `bg-white/5` |
| 카드 테두리 | `border-slate-100` | `border-white/5` |
| 섹션 타이틀 | `text-slate-500 text-xs font-medium uppercase tracking-widest` | `dark:text-slate-400` |
| 중요 수치 | `text-3xl font-bold tracking-tight text-slate-900` | `dark:text-slate-100` |
| bandi-aura bg | `bg-bandi-aura/30` (Tailwind colors에 정의됨) | `dark:bg-bandi-aura/20` |
| Primary accent | `bg-primary` or `text-primary` | 동일 |

### 2.2 globals.css 추가 항목

```css
/* 1. Ping animation for BinahMapLite */
@keyframes map-ping {
  75%, 100% { transform: scale(2.5); opacity: 0; }
}
.map-ping-ring {
  animation: map-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  transform-box: fill-box;
  transform-origin: center;
}

/* 2. Dot pattern utility */
.bg-dot-pattern {
  background-image: radial-gradient(circle, rgba(45, 212, 191, 0.12) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

---

## 3. 컴포넌트 상세 설계

### 3.1 DashboardHome.tsx — Bento Grid + 모바일 order

```
Desktop (md+):
┌─────────────────────────────────────────────┐  order-1 md:col-span-2
│  MorningBriefCard — full width, glow        │
├────────────────────┬────────────────────────┤
│  HotZoneCard       │  SectorTop3Card        │  order-3 / order-4
│  md:row-span-2     │                        │
│  dot pattern bg    ├────────────────────────┤
│  ping indicators   │  PortfolioCard         │  order-5
│                    │  tracking-tight        │
├────────────────────┴────────────────────────┤
│  NewsCard — md:col-span-2, 3-col news       │  order-6 md:col-span-2
├─────────────────────────────────────────────┤
│  QuickMenuGrid — md:col-span-2              │  order-2 md:order-last
└─────────────────────────────────────────────┘

Mobile (sm):
MorningBriefCard → QuickMenuGrid(order-2) → HotZoneCard
→ SectorTop3Card → PortfolioCard → NewsCard
```

**핵심 그리드 구조:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto">
  <MorningBriefCard className="md:col-span-2 order-1" />
  <QuickMenuGrid    className="order-2 md:order-last md:col-span-2" />
  <HotZoneCard      className="order-3 md:row-span-2" />
  <SectorTop3Card   className="order-4" />
  <PortfolioCard    className="order-5" />
  <NewsCard         className="order-6 md:col-span-2" />
</div>
```

> ⚠️ `md:row-span-2` 동작을 위해 부모 그리드에 `grid-rows` 명시가 필요할 수 있음.
> 구현 시 `md:grid-rows-[auto_auto_auto]` 또는 `items-start` 추가 확인.

---

### 3.2 MorningBriefCard — bandi-aura glow

```tsx
// 카드 컨테이너
<div className="rounded-2xl border border-amber-200/40 dark:border-amber-400/10
                bg-bandi-aura/30 dark:bg-bandi-aura/15
                backdrop-blur-sm p-6 space-y-4">

  {/* BandiAvatar glow wrapper */}
  <div className="relative flex-shrink-0">
    {/* glow ring */}
    <div className="absolute inset-0 rounded-full bg-bandi-glow/40 blur-md animate-pulse" />
    <BandiAvatar size={44} mood={brief.bandiMood} animate />
  </div>

  {/* 헤드라인: tracking-tight 적용 */}
  <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
    {brief.headline}
  </p>

  {/* 섹터 신호: shadcn Badge (outline variant) */}
  {brief.topSectors.map(s => (
    <Badge key={s.name} variant="outline" className={directionClass(s.direction)}>
      {DIRECTION_ICON[s.direction]} {s.name}
    </Badge>
  ))}
</div>
```

---

### 3.3 HotZoneCard — dot pattern + ping

```tsx
export function HotZoneCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      "relative rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5",
      "bg-white dark:bg-white/5 shadow-sm",
      className
    )}>
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 bg-dot-pattern pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
          비나 맵 — Hot Zone
        </p>
        <Link href="/binah-map" className="text-xs text-primary hover:underline">
          자세히 보기 →
        </Link>
      </div>

      {/* BinahMapLite — height 100% fill */}
      <div className="relative z-10">
        <BinahMapLite events={events} selectedId={selectedId} onSelect={onSelect} height={220} />
      </div>
    </div>
  );
}
```

**BinahMapLite ping 수정 (클래스명만 부여):**
```ts
// 기존 circle → ping group으로 교체
const pingGroup = markerGroup.append('g').attr('class', 'ping-group');

// ping ring (클래스만 — animation은 globals.css)
pingGroup.append('circle')
  .attr('class', 'map-ping-ring')
  .attr('r', 7)
  .attr('fill', 'none')
  .attr('stroke', color)
  .attr('stroke-width', 1.5)
  .attr('opacity', 0.6);

// core dot (기존과 동일)
pingGroup.append('circle')
  .attr('r', 4)
  .attr('fill', color);
```

---

### 3.4 SectorTop3Card — shadcn Progress

```tsx
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// 순위 Badge + 섹터명 + Progress (teal primary 단일 색상)
{TOP_SECTORS.map((s, idx) => (
  <div key={s.name} className="space-y-1.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="w-5 h-5 p-0 flex items-center justify-center text-xs">
          {idx + 1}
        </Badge>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400">{s.score}</span>
    </div>
    <Progress value={s.score} className="h-1.5" />
  </div>
))}
```

> Progress 색상은 `--primary` (teal) 단일 색상 — 위험도별 빨강/노랑 제거로 세련됨.

---

### 3.5 PortfolioCard (신규)

```tsx
<div className="rounded-2xl border border-slate-100 dark:border-white/5
                bg-white dark:bg-white/5 shadow-sm p-6">
  <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
    내 포트폴리오
  </p>
  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
    {totalValue.toLocaleString()}원
  </p>
  <div className="mt-1 flex items-center gap-2">
    <Badge variant="outline" className={returnClass}>
      {totalReturn >= 0 ? '+' : ''}{totalReturn}%
    </Badge>
  </div>
  <Link href="/portfolio" className="mt-4 block text-xs text-primary hover:underline">
    상세 보기 →
  </Link>
</div>
```

---

### 3.6 NewsCard (신규) — glassmorphism + 3-col

```tsx
<div className="md:col-span-2 rounded-2xl border border-slate-100 dark:border-white/5
                bg-white/80 dark:bg-white/5 shadow-sm backdrop-blur-sm p-6">
  <div className="flex items-center justify-between mb-4">
    <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
      오늘의 주요 뉴스
    </p>
    <Link href="/news" className="text-xs text-primary hover:underline">전체 보기 →</Link>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {MOCK_NEWS.map(n => (
      <div key={n.id} className="flex gap-2 items-start">
        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
        <div>
          <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-200">{n.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.source}</p>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

### 3.7 QuickMenuGrid — hover glow + mobile order-2

```tsx
<div className={cn(
  "grid grid-cols-4 gap-3 md:col-span-2",
  "order-2 md:order-last",
  className
)}>
  {QUICK_MENU.map(item => (
    <Link key={item.href} href={item.href} className="group">
      <div className="rounded-2xl border border-slate-100 dark:border-white/5
                      bg-white dark:bg-white/5 shadow-sm p-4 text-center
                      hover:border-primary/30 dark:hover:border-primary/20
                      hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
          {item.icon}
        </div>
        <p className="mt-1.5 text-xs font-medium text-slate-600 dark:text-slate-400
                      group-hover:text-primary transition-colors">
          {item.label}
        </p>
      </div>
    </Link>
  ))}
</div>
```

---

## 4. shadcn 컴포넌트 목록

| 컴포넌트 | 현재 상태 | 조치 |
|---------|---------|------|
| `Card.tsx` (대문자) | ✅ 기존 유지 | **건드리지 않음** |
| `card.tsx` (소문자) | ❌ 없음 | Module 1에서 신규 생성 |
| `badge.tsx` | ✅ 설치됨 | 그대로 사용 |
| `progress.tsx` | ❌ 없음 | Module 1에서 신규 생성 |
| `src/lib/utils.ts` | ❌ 없음 | Module 1에서 신규 생성 |

**필요 패키지:**
```bash
npm install @radix-ui/react-progress
# clsx, tailwind-merge는 이미 설치됨
```

---

## 5. globals.css 추가 내용

```css
/* BinahMapLite ping animation */
@keyframes map-ping {
  75%, 100% { transform: scale(2.5); opacity: 0; }
}
.map-ping-ring {
  animation: map-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
  transform-box: fill-box;
  transform-origin: center;
}

/* Hot Zone dot pattern */
.bg-dot-pattern {
  background-image: radial-gradient(circle, rgba(45, 212, 191, 0.12) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

---

## 6. 영향 범위 (최종)

| 파일 | 변경 유형 | 우선순위 | Regression 위험 |
|------|---------|---------|---------------|
| `src/lib/utils.ts` | 신규 생성 | P0 | 없음 |
| `src/components/ui/Card.tsx` | **변경 금지** | — | — |
| `src/components/ui/card.tsx` | 신규 생성 | P0 | 없음 |
| `src/components/ui/progress.tsx` | 신규 생성 | P0 | 없음 |
| `src/app/globals.css` | ping/dot 추가 | P0 | 없음 |
| `src/features/dashboard/DashboardHome.tsx` | 전면 재작성 | P0 | 대시보드만 |
| `src/features/dashboard/components/MorningBriefCard.tsx` | 재작성 | P0 | 대시보드만 |
| `src/features/dashboard/components/SectorTop3Card.tsx` | Progress 교체 | P0 | 대시보드만 |
| `src/features/dashboard/components/HotZoneCard.tsx` | 신규 | P1 | 없음 |
| `src/features/dashboard/components/PortfolioCard.tsx` | 신규 | P1 | 없음 |
| `src/features/dashboard/components/NewsCard.tsx` | 신규 | P1 | 없음 |
| `src/features/binah-map/components/BinahMapLite.tsx` | class명만 수정 | P1 | 낮음 |
| `package.json` | `@radix-ui/react-progress` | P0 | 없음 |

---

## 7. 구현 세션 가이드

### Module 1 — 기반 인프라 (Prerequisites)
```
1. npm install @radix-ui/react-progress
2. src/lib/utils.ts — cn() 유틸 생성
3. src/components/ui/card.tsx — shadcn 표준 Card (CardHeader/Content/Title/Footer)
4. src/components/ui/progress.tsx — Progress 컴포넌트
5. src/app/globals.css — ping animation + dot pattern 추가
```

### Module 2 — 카드 컴포넌트
```
6. MorningBriefCard.tsx — bandi-aura glow 재작성
7. SectorTop3Card.tsx — Progress bars
8. PortfolioCard.tsx — 신규 (tracking-tight)
9. NewsCard.tsx — 신규 (glassmorphism + 3-col)
```

### Module 3 — 지도 + 레이아웃 최종 조립
```
10. BinahMapLite.tsx — map-ping-ring 클래스 적용
11. HotZoneCard.tsx — dot pattern wrapper 신규
12. DashboardHome.tsx — Bento Grid + order 최종 조립
```

### 검증 체크리스트
- [ ] 라이트모드: shadow-sm, 경계선 은은함
- [ ] 다크모드: bg-white/5 glassmorphism 동작
- [ ] MorningBriefCard: bandi-aura/30 배경 + glow ring
- [ ] BinahMapLite: map-ping-ring 애니메이션 동작
- [ ] SectorTop3Card: Progress teal bars
- [ ] PortfolioCard: text-3xl tracking-tight 수치
- [ ] 모바일 375px: QuickMenu가 브리핑 아래에 위치
- [ ] Card.tsx (대문자) 사용 페이지: regression 없음
- [ ] TypeScript 오류 0건
