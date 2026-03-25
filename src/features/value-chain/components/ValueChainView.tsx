'use client';

/**
 * 밸류체인 시각화 컴포넌트
 * d3-sankey 미설치 → 티어별 계층 리스트 UI로 대체 구현
 */

import { useState } from 'react';
import type { ValueChain, ValueChainNode, TierLevel } from '../types';
import { TierBadge } from './TierBadge';
import { CompanyCard } from './CompanyCard';

/** 티어 레이블 매핑 */
const TIER_LABELS: Record<TierLevel, string> = {
  0: '메이저 (T0)',
  1: 'T1 직접납품',
  2: 'T2 부품소재',
  3: 'T3 간접수혜',
};

/** 티어 그룹 헤더 배경색 */
const TIER_HEADER_CLASS: Record<TierLevel, string> = {
  0: 'bg-teal-900/30 border-teal-800',
  1: 'bg-blue-900/30 border-blue-800',
  2: 'bg-purple-900/30 border-purple-800',
  3: 'bg-slate-800/60 border-slate-700',
};

/** ValueChainView Props */
interface ValueChainViewProps {
  chain: ValueChain;
}

/** 밸류체인 뷰 컴포넌트 (계층 리스트 UI) */
export function ValueChainView({ chain }: ValueChainViewProps) {
  const [selectedNode, setSelectedNode] = useState<ValueChainNode | null>(null);

  // 티어별로 노드 그룹화 (0 → 1 → 2 → 3 순)
  const tiers = ([0, 1, 2, 3] as TierLevel[]).map((tier) => ({
    tier,
    nodes: chain.nodes.filter((n) => n.tier === tier),
  }));

  const handleNodeClick = (node: ValueChainNode) => {
    setSelectedNode((prev) => (prev?.ticker === node.ticker ? null : node));
  };

  return (
    <div className="space-y-6">
      {/* 이벤트 트리거 표시 */}
      <div className="rounded-lg border border-teal-700/50 bg-teal-900/20 px-4 py-3">
        <p className="text-sm text-teal-300">
          <span className="font-semibold mr-2">트리거:</span>
          {chain.eventTrigger}
        </p>
      </div>

      {/* 계층 리스트 — 데스크톱: 4열 가로, 모바일: 세로 스택 */}
      <div className="hidden md:flex items-start gap-3">
        {tiers.map(({ tier, nodes }, idx) => (
          <div key={tier} className="flex items-start gap-3 flex-1 min-w-0">
            {/* 계층 컬럼 */}
            <div className="flex-1 min-w-0">
              <div
                className={`rounded-t-lg border-x border-t px-3 py-2 ${TIER_HEADER_CLASS[tier]}`}
              >
                <span className="text-xs font-semibold text-slate-300">
                  {TIER_LABELS[tier]}
                </span>
                <span className="ml-2 text-xs text-slate-500">({nodes.length}개)</span>
              </div>
              <div className="border-x border-b border-slate-700 rounded-b-lg divide-y divide-slate-800">
                {nodes.length === 0 ? (
                  <p className="px-3 py-4 text-xs text-slate-600 text-center">해당 없음</p>
                ) : (
                  nodes.map((node) => (
                    <div key={node.ticker} className="p-2">
                      <button
                        type="button"
                        onClick={() => handleNodeClick(node)}
                        className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors hover:bg-slate-700 ${
                          selectedNode?.ticker === node.ticker
                            ? 'bg-slate-700 ring-1 ring-teal-500'
                            : 'bg-slate-800/50'
                        }`}
                      >
                        <div className="font-semibold text-slate-100">{node.name}</div>
                        <div className="text-slate-400 font-mono mt-0.5">{node.ticker}</div>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 티어 간 화살표 (마지막 열 제외) */}
            {idx < tiers.length - 1 && (
              <div className="flex items-center justify-center self-stretch pt-10 text-slate-600 text-lg">
                →
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 모바일: 세로 스택 */}
      <div className="md:hidden space-y-4">
        {tiers.map(({ tier, nodes }, idx) => (
          <div key={tier}>
            {/* 티어 간 화살표 */}
            {idx > 0 && (
              <div className="flex justify-center py-1 text-slate-600 text-lg">↓</div>
            )}
            <div
              className={`rounded-t-lg border-x border-t px-3 py-2 ${TIER_HEADER_CLASS[tier]}`}
            >
              <span className="text-xs font-semibold text-slate-300">{TIER_LABELS[tier]}</span>
              <span className="ml-2 text-xs text-slate-500">({nodes.length}개)</span>
            </div>
            <div className="border-x border-b border-slate-700 rounded-b-lg space-y-2 p-2">
              {nodes.length === 0 ? (
                <p className="px-2 py-3 text-xs text-slate-600 text-center">해당 없음</p>
              ) : (
                nodes.map((node) => (
                  <button
                    key={node.ticker}
                    type="button"
                    onClick={() => handleNodeClick(node)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors hover:bg-slate-700 ${
                      selectedNode?.ticker === node.ticker
                        ? 'bg-slate-700 ring-1 ring-teal-500'
                        : 'bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TierBadge tier={node.tier} />
                      <span className="font-semibold text-slate-100">{node.name}</span>
                      <span className="text-slate-400 font-mono">{node.ticker}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 선택된 노드 상세 카드 */}
      {selectedNode && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-200">종목 상세</h3>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              닫기 ✕
            </button>
          </div>
          <CompanyCard
            node={selectedNode}
            isSelected
            onClick={() => setSelectedNode(null)}
          />
        </div>
      )}

      {/* 업데이트 시각 */}
      <p className="text-xs text-slate-600 text-right">
        마지막 업데이트: {new Date(chain.updatedAt).toLocaleString('ko-KR')}
      </p>
    </div>
  );
}
