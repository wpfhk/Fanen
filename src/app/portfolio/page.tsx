import type { Metadata } from 'next';
import { DisclaimerBanner } from '@/components/common';
import { PortfolioList } from '@/features/portfolio';
import { MOCK_PORTFOLIOS } from '@/lib/mock/mockPortfolio';
import { formatKRW } from '@/features/portfolio/types';

export const metadata: Metadata = {
  title: '내 포트폴리오 — 파낸',
  description: '보유 종목과 투자 현황을 관리하세요.',
};

export default function PortfolioPage() {
  /* Mock 데이터 기반 요약 계산 */
  const totalValue = MOCK_PORTFOLIOS.reduce((sum, p) => sum + p.total_value, 0);
  const investedCost = 63_000_000; // Mock 투자 원금
  const profitLoss = totalValue - investedCost;
  const profitRate = ((profitLoss / investedCost) * 100).toFixed(1);
  const isPositive = profitLoss >= 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">내 포트폴리오</h1>
          <p className="mt-2 text-gray-600">보유 종목과 투자 현황을 관리하세요</p>
        </header>
        {/* 수익률 요약 카드 (Mock 데이터) */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">총 평가금액</p>
            <p className="text-2xl font-bold">{formatKRW(totalValue)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">수익률</p>
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{profitRate}%
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">평가손익</p>
            <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatKRW(Math.abs(profitLoss))}
            </p>
          </div>
        </div>
        <div className="mb-6">
          <DisclaimerBanner variant="default" />
        </div>
        <PortfolioList />
      </div>
    </main>
  );
}
