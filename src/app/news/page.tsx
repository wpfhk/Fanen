import type { Metadata } from 'next';
import { DisclaimerBanner } from '@/components/common';
import { NewsImpactList } from '@/features/news-impact';

export const metadata: Metadata = {
  title: '뉴스 임팩트 — 파낸',
  description: 'AI 기반 뉴스 임팩트 분석으로 시장 움직임을 먼저 파악하세요.',
};

/**
 * 뉴스 임팩트 전용 페이지
 * 서버 컴포넌트
 */
export default function NewsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">뉴스 임팩트</h1>
          <p className="mt-2 text-gray-600">AI 핀이가 분석한 실시간 뉴스 임팩트 시그널</p>
        </header>

        {/* 면책 고지 */}
        <div className="mb-6">
          <DisclaimerBanner variant="signal" />
        </div>

        {/* 뉴스 임팩트 목록 */}
        <NewsImpactList />
      </div>
    </main>
  );
}
