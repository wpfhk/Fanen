'use client';

/**
 * 랜딩 페이지 — 비로그인 사용자에게 서비스 소개
 * 섹션: Hero → FeatureCards → 핀이 소개 → 요금제 미리보기 → CTA
 */
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { PLANS } from '@/lib/plans';
import { FinniAvatar } from '@/features/ai-coach/components/FinniAvatar';

/* ── 기능 카드 데이터 ── */
const FEATURE_CARDS = [
  { title: 'AI 뉴스 분석', desc: 'AI가 뉴스를 읽고 투자 영향도를 실시간 분석합니다.', href: '/news', icon: '📰' },
  { title: '섹터 인과관계', desc: '산업 간 연결고리를 시각화하여 투자 기회를 포착합니다.', href: '/sector', icon: '📊' },
  { title: '포트폴리오 관리', desc: '내 투자 현황을 한눈에 파악하고 관리합니다.', href: '/portfolio', icon: '💼' },
  { title: 'AI 코치 핀이', desc: '궁금한 것은 핀이에게 물어보세요. 친절하게 알려드려요.', href: '/coach', icon: '🤖' },
  { title: '모의투자', desc: '가상 자금으로 실전처럼 투자 연습을 할 수 있습니다.', href: '/mock-trading', icon: '📈' },
  { title: '배당 캘린더', desc: '배당금 일정과 수익률 시뮬레이션을 제공합니다.', href: '/dividend', icon: '📅' },
] as const;

/* ── Hero Section ── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:py-28">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          파낸
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100 sm:text-xl">
          세상이 움직이면, 파낸이 먼저 압니다
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-700 shadow-lg transition-colors hover:bg-blue-50"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/news"
            className="rounded-lg border border-white/30 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            서비스 보기
          </Link>
        </div>
      </div>
      {/* 배경 장식 */}
      <div className="absolute -bottom-4 left-0 right-0 h-8 bg-gray-50 dark:bg-slate-950 rounded-t-[2rem]" />
    </section>
  );
}

/* ── Feature Cards ── */
function FeatureCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
        파낸이 제공하는 기능
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="group">
            <Card variant="bordered" padding="lg" className="h-full transition-shadow group-hover:shadow-md">
              <div className="mb-3 text-3xl">{card.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{card.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ── 핀이 소개 ── */
function FiniIntro() {
  return (
    <section className="bg-blue-50 dark:bg-slate-800 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <FinniAvatar size={80} mood="happy" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-slate-100">AI 투자 코치, 핀이를 만나보세요</h2>
        <p className="mt-2 text-gray-600 dark:text-slate-400">
          궁금한 종목, 시장 동향, 투자 전략 — 무엇이든 핀이에게 물어보세요.
        </p>
        {/* 예시 대화 */}
        <div className="mt-8 space-y-3 text-left">
          <div className="flex justify-end">
            <div className="max-w-xs rounded-2xl rounded-br-md bg-blue-600 px-4 py-2.5 text-sm text-white">
              오늘 삼성전자 어때요?
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <FinniAvatar size={32} />
            </div>
            <div className="max-w-sm rounded-2xl rounded-bl-md bg-white dark:bg-slate-700 px-4 py-2.5 text-sm text-gray-800 dark:text-slate-200 shadow-sm">
              삼성전자는 최근 HBM3E 양산 호재로 긍정적 흐름입니다. 반도체 섹터 전반의 상승 모멘텀도 확인되고 있어요.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 요금제 미리보기 ── */
function PricingPreview() {
  const plans = [PLANS.free, PLANS.pro, PLANS.premium];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-slate-100 sm:text-3xl">
        요금제
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.tier}
            variant={plan.tier === 'pro' ? 'highlighted' : 'bordered'}
            padding="lg"
            className="text-center"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">{plan.name}</h3>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-slate-100">
              {plan.priceMonthly === 0 ? '무료' : `${plan.priceMonthly.toLocaleString()}원`}
              {plan.priceMonthly > 0 && (
                <span className="text-base font-normal text-gray-500 dark:text-slate-400">/월</span>
              )}
            </p>
            <ul className="mt-4 space-y-2 text-left text-sm text-gray-600 dark:text-slate-400">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-500">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link href="/pricing" className="text-sm font-medium text-blue-600 hover:underline">
          자세히 보기 →
        </Link>
      </div>
    </section>
  );
}

/* ── CTA Section ── */
function CtaSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-center text-white">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="text-2xl font-bold sm:text-3xl">지금 바로 무료로 시작하세요</h2>
        <p className="mt-3 text-blue-100">베타 기간 동안 모든 기능을 무료로 체험할 수 있습니다.</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-700 shadow transition-colors hover:bg-blue-50"
          >
            이메일로 가입하기
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/30 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 메인 랜딩 페이지 ── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <HeroSection />
      <FeatureCards />
      <FiniIntro />
      <PricingPreview />
      <CtaSection />
    </div>
  );
}
