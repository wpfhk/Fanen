import Link from 'next/link';
import { DisclaimerBanner } from '@/components/common';
import { NewsImpactList } from '@/features/news-impact';
import { SectorMapSection } from '@/features/sector-map';

/**
 * 홈 페이지 — 뉴스 임팩트 + 섹터 인과관계 통합 뷰
 * 서버 컴포넌트 (NewsImpactList, SectorMapSection은 내부에서 'use client' 처리)
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* 서비스 헤더 */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">파낸</h1>
          <p className="text-lg text-gray-600">세상이 움직이면, 파낸이 먼저 압니다</p>
        </header>

        {/* 공통 면책 고지 */}
        <DisclaimerBanner variant="default" />

        {/* 뉴스 임팩트 섹션 */}
        <section>
          <NewsImpactList />
          <div className="mt-4 text-right">
            <Link href="/news" className="text-sm text-primary hover:underline">
              뉴스 임팩트 전체 보기 →
            </Link>
          </div>
        </section>

        {/* 섹터 인과관계 섹션 */}
        <section>
          <SectorMapSection />
          <div className="mt-4 text-right">
            <Link href="/sector" className="text-sm text-primary hover:underline">
              섹터 인과관계 전체 보기 →
            </Link>
          </div>
        </section>

        {/* 로그인 유도 */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-block rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-600"
          >
            시작하기
          </Link>
        </div>
      </div>
    </main>
  );
}
