'use client';

import { DisclaimerBanner } from '@/components/common';
import {
  MockTradingDashboard,
  MockTradeForm,
  MockTradeHistory,
  MockRankingBoard,
} from '@/features/mock-trading';

/** 모의투자 페이지 */
export default function MockTradingPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">모의투자</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">가상 자산으로 안전하게 투자를 연습하세요</p>
        </header>
        <DisclaimerBanner variant="default" />
        <MockTradingDashboard />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MockTradeForm />
          <MockTradeHistory />
        </div>
        <MockRankingBoard />
      </div>
    </main>
  );
}
