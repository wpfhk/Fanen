import { Suspense } from 'react';
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
import TutorialPopup from '@/components/common/TutorialPopup';
import { ValueChainPageClient } from './ValueChainPageClient';

/** 수혜 기업 연결망 페이지 — 서버 컴포넌트 */
export default function ValueChainPage({
  searchParams,
}: {
  searchParams: { sector?: string };
}) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-6 max-w-5xl space-y-6">
        {/* 페이지 헤더 */}
        <header>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100">
            수혜 기업 <span className="text-teal-600 dark:text-teal-400">연결망</span>
          </h1>
          <p className="mt-2 text-slate-600 dark:text-zinc-400">
            세계 이벤트 트리거별 국내 수혜 기업 연결망을 원형 마인드맵으로 분석합니다
          </p>
        </header>

        {/* 면책 고지 — CLAUDE.md 절대 원칙 */}
        <DisclaimerBanner variant="signal" />

        {/* 클라이언트 컴포넌트에 섹터 전달 */}
        <Suspense
          fallback={
            <div className="animate-pulse space-y-4">
              <div className="h-12 rounded-lg bg-slate-200 dark:bg-zinc-900" />
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 rounded-lg bg-slate-200 dark:bg-zinc-900" />
                ))}
              </div>
            </div>
          }
        >
          <ValueChainPageClient sector={searchParams.sector ?? 'defense'} />
        </Suspense>
      </div>

      {/* 수혜 기업 연결망 튜토리얼 팝업 */}
      <TutorialPopup
        pageKey="value-chain"
        tutorialTitle="수혜 기업 연결망 활용법"
        steps={[
          { emoji: '🌐', title: '글로벌 이슈와 기업 연결', description: '세계 정세 이벤트에서 직접적으로 수혜를 받는 기업들을 Tier별로 보여줍니다.' },
          { emoji: '🏭', title: 'Tier 구조 이해', description: 'Tier 0은 핵심 수혜 기업, Tier 1은 직접 납품사, Tier 2/3으로 갈수록 간접 수혜 기업입니다.' },
          { emoji: '🔗', title: '가치사슬 탐색', description: '기업 카드를 클릭하면 해당 기업의 주요 제품, 매출 비중, 관련 뉴스를 확인할 수 있습니다.' },
        ]}
      />
    </main>
  );
}
