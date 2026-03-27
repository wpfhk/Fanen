'use client';

import TrafficLightSignal from '@/components/common/TrafficLightSignal';
import type { SignalItem } from '../hooks/useSignal';

interface SignalCardProps {
  item: SignalItem;
}

/** 개별 종목 매매 신호 카드 — TrafficLightSignal 재사용 */
export default function SignalCard({ item }: SignalCardProps) {
  return (
    <div className="rounded-card shadow-card border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      {/* 종목 정보 */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-gray-900">{item.stockName}</p>
          <p className="text-xs text-gray-500">{item.stockCode}</p>
        </div>
        <p className="text-xs text-gray-400">
          {new Date(item.analyzedAt).toLocaleString('ko-KR')}
        </p>
      </div>

      {/* 신호등 */}
      <TrafficLightSignal
        signal={item.signal}
        confidence={item.confidence}
        reason={item.reason}
      />
    </div>
  );
}
