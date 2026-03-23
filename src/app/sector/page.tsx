import type { Metadata } from 'next';
import { DisclaimerBanner } from '@/components/common';
import { SectorMapSection } from '@/features/sector-map';

export const metadata: Metadata = {
  title: '섹터 인과관계 — 파낸',
  description: '섹터 간 인과관계 맵으로 시장 구조를 시각화합니다.',
};

/**
 * 섹터 인과관계 전용 페이지
 * 서버 컴포넌트
 */
export default function SectorPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">섹터 인과관계 맵</h1>
          <p className="mt-2 text-gray-600">
            섹터 간 경제적 영향력 흐름을 인터랙티브 그래프로 탐색하세요
          </p>
        </header>

        {/* 면책 고지 */}
        <div className="mb-6">
          <DisclaimerBanner variant="default" />
        </div>

        {/* 섹터 인과관계 맵 */}
        <SectorMapSection />
      </div>
    </main>
  );
}
