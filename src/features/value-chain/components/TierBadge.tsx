'use client';

import type { TierLevel } from '../types';

/** 티어별 뱃지 설정 */
const TIER_CONFIG: Record<TierLevel, { label: string; className: string }> = {
  0: { label: '메이저', className: 'bg-teal-900/50 text-teal-300 border-teal-700' },
  1: { label: 'T1 직접납품', className: 'bg-blue-900/50 text-blue-300 border-blue-700' },
  2: { label: 'T2 부품소재', className: 'bg-purple-900/50 text-purple-300 border-purple-700' },
  3: { label: 'T3 간접수혜', className: 'bg-slate-800 text-slate-400 border-slate-600' },
};

/** 밸류체인 티어 뱃지 컴포넌트 */
export function TierBadge({ tier }: { tier: TierLevel }) {
  const config = TIER_CONFIG[tier];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
