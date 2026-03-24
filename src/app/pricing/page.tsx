'use client';

import Link from 'next/link';

/** BINAH 완전 무료 안내 페이지 */
export default function PricingPage() {
  const features = [
    '비나 맵 — 세계 정세 시각화',
    '뉴스 분석 — 무제한',
    'Value Chain 분석 (Tier 1~3)',
    '반디 AI 코치 — 무제한',
    '불로소득 목표 계산기',
    '배당 허브 + ETF 시뮬레이터',
    '모의투자 — 무제한',
    '투자 일지',
  ];

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0F1923]">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* BINAH 로고 */}
        <div className="mb-8">
          <span className="text-4xl font-black tracking-tight text-teal-600 dark:text-teal-400">
            BINAH
          </span>
        </div>

        {/* 메인 헤드라인 */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">
          모든 기능, 완전 무료
        </h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 mb-12">
          반디와 함께하는 모든 투자 분석 도구를 제한 없이 사용하세요
        </p>

        {/* 무료 플랜 카드 */}
        <div className="rounded-2xl border-2 border-teal-400 ring-4 ring-teal-100 dark:ring-teal-900/30 bg-white dark:bg-[#162032] p-8 shadow-lg mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-slate-100">BINAH</span>
            <span className="rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-xs font-semibold px-3 py-1">
              무료
            </span>
          </div>
          <p className="text-5xl font-extrabold text-gray-900 dark:text-slate-100 my-6">
            ₩0
            <span className="text-base font-normal text-gray-500 dark:text-slate-400">/월</span>
          </p>

          <ul className="space-y-3 text-left mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-gray-700 dark:text-slate-300">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-teal-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <Link
            href="/dashboard"
            className="block w-full rounded-lg bg-teal-600 hover:bg-teal-700 px-6 py-3 text-sm font-semibold text-white transition-colors text-center"
          >
            지금 시작하기
          </Link>
        </div>

        {/* 안내 문구 */}
        <p className="text-xs text-gray-500 dark:text-slate-500">
          본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다
        </p>
      </div>
    </main>
  );
}
