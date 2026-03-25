'use client';

import AiBadge from '@/components/common/AiBadge';
import type { ValueChainNode } from '../types';
import { TierBadge } from './TierBadge';

/** 신호 타입별 신호등 표시 설정 */
const SIGNAL_CONFIG = {
  buy: { dot: '🟢', label: '관심' },
  wait: { dot: '🟡', label: '관망' },
  watch: { dot: '🔴', label: '주의' },
} as const;

/** CompanyCard Props */
interface CompanyCardProps {
  node: ValueChainNode;
  isSelected?: boolean;
  onClick?: () => void;
}

/** 밸류체인 종목 카드 컴포넌트 */
export function CompanyCard({ node, isSelected = false, onClick }: CompanyCardProps) {
  const signal = SIGNAL_CONFIG[node.signal];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-colors bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
        isSelected ? 'border-teal-500' : 'border-slate-700'
      }`}
    >
      {/* 상단: 티어 뱃지 + 티커 + 기업명 */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <TierBadge tier={node.tier} />
        <span className="text-xs font-mono text-slate-400">{node.ticker}</span>
        <span className="text-sm font-semibold text-slate-100">{node.name}</span>
      </div>

      {/* 신호등 + 배당수익률 */}
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex items-center gap-1 text-xs text-slate-300">
          <span>{signal.dot}</span>
          <span>{signal.label}</span>
        </span>
        {node.dividendYield !== undefined && (
          <span className="text-xs text-amber-400">
            배당 {node.dividendYield.toFixed(1)}%
          </span>
        )}
      </div>

      {/* 반디 설명 텍스트 */}
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{node.description}</p>

      {/* AI 뱃지 (source prop으로 출처 링크 포함 — CLAUDE.md 원칙) */}
      <div className="flex items-center gap-2 flex-wrap">
        <AiBadge label="AI 분석" variant="info" source={node.sourceUrl} />
      </div>
    </button>
  );
}
