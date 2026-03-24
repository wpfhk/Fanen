'use client';
import { DisclaimerBanner, SubscriptionGate } from '@/components/common';
import { useSubscription } from '@/hooks/useSubscription';
import { useGlobalNews } from '@/features/global-news';
import GlobalNewsCard from '@/features/global-news/components/GlobalNewsCard';
import GlobalNewsAnalysis from '@/features/global-news/components/GlobalNewsAnalysis';
import { useRouter } from 'next/navigation';

export default function GlobalNewsPage() {
  const { plan } = useSubscription();
  const router = useRouter();
  const { news, selectedNews, selectedId, selectNews, analyze, isAnalyzing, analyzed } = useGlobalNews();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">글로벌 뉴스 수혜 분석</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          세계 정세 뉴스를 선택하면 AI가 한국 수혜 섹터와 종목을 분석합니다
        </p>
      </div>

      <DisclaimerBanner variant="signal" />

      <div className="mt-6">
        <SubscriptionGate
          requiredPlan="pro"
          currentPlan={plan}
          onUpgradeClick={() => router.push('/pricing')}
        >
          {/* 뉴스 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {news.map((item) => (
              <GlobalNewsCard
                key={item.id}
                item={item}
                isSelected={selectedId === item.id}
                onClick={() => selectNews(item.id)}
              />
            ))}
          </div>

          {/* 분석 버튼 */}
          {selectedNews && !analyzed && (
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                선택된 뉴스: <strong>{selectedNews.title}</strong>
              </p>
              <button
                onClick={analyze}
                disabled={isAnalyzing}
                className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isAnalyzing ? '분석 중...' : '수혜 섹터/종목 분석하기'}
              </button>
            </div>
          )}

          {/* 분석 결과 */}
          {selectedNews && analyzed && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">분석 결과</h2>
                <button
                  onClick={() => selectNews(selectedId!)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  다시 선택
                </button>
              </div>
              <GlobalNewsAnalysis news={selectedNews} />
            </>
          )}
        </SubscriptionGate>
      </div>
    </main>
  );
}
