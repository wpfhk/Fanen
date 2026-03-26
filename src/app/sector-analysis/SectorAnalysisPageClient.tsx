'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSectorAnalysis } from '@/features/sector-analysis/hooks/useSectorAnalysis';
import { SectorDetailPanel } from '@/features/sector-analysis/components/SectorDetailPanel';
import type { ValueChainNode } from '@/features/sector-analysis/types';

/** Canvas 기반 2D 네트워크 그래프 (SSR 제외) */
const SectorNetworkGraph = dynamic(
  () =>
    import('@/features/sector-analysis/components/SectorNetworkGraph').then(
      (m) => m.SectorNetworkGraph
    ),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-900" style={{ aspectRatio: '4/3' }} />
    ),
  }
);

/**
 * 섹터 탭 목록
 * active: true → 데이터 있음
 */
const SECTOR_TABS = [
  { key: 'defense',       label: '방산',      active: true  },
  { key: 'semiconductor', label: '반도체',    active: true  },
  { key: 'battery',       label: '2차전지',   active: true  },
  { key: 'energy',        label: '에너지',    active: false },
  { key: 'bio',           label: '바이오',    active: false },
  { key: 'ai',            label: 'AI/플랫폼', active: false },
] as const;

const ACTIVE_SECTORS = SECTOR_TABS.filter((t) => t.active);

interface SectorAnalysisPageClientProps {
  sector: string;
}

/** 섹터 분석 페이지 클라이언트 컴포넌트 */
export function SectorAnalysisPageClient({ sector }: SectorAnalysisPageClientProps) {
  const router = useRouter();

  // 현재 선택 섹터 데이터
  const { chain, isLoading, error } = useSectorAnalysis(sector);

  // 전체 뷰용 — 활성 섹터 전체 로드
  const { chain: defenseChain }     = useSectorAnalysis('defense');
  const { chain: semiChain }        = useSectorAnalysis('semiconductor');
  const { chain: batteryChain }     = useSectorAnalysis('battery');

  const [selectedNode, setSelectedNode] = useState<ValueChainNode | null>(null);
  const [viewMode, setViewMode]         = useState<'overview' | 'detail'>('detail');

  const overviewChains = [defenseChain, semiChain, batteryChain].filter(Boolean);

  const handleSectorChange = (key: string) => {
    setSelectedNode(null);
    router.replace(`/sector-analysis?sector=${key}`);
  };

  const handleNodeClick = (node: ValueChainNode) => {
    setSelectedNode((prev) => (prev?.ticker === node.ticker ? null : node));
  };

  const handleOverviewClick = (sectorKey: string) => {
    setViewMode('detail');
    handleSectorChange(sectorKey);
  };

  return (
    <div className="space-y-4">
      {/* ── 뷰 모드 토글 ── */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {viewMode === 'overview'
              ? '모든 섹터의 연결망을 한눈에 — 섹터를 클릭하면 상세 분석으로 이동합니다'
              : '섹터별 연결망 상세 분석 — 노드를 클릭하면 종목 정보를 확인할 수 있습니다'}
          </p>
        </div>
        <div className="inline-flex rounded-full p-0.5 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/30 flex-shrink-0">
          {(['overview', 'detail'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                viewMode === mode
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {mode === 'overview' ? '전체 뷰' : '상세 뷰'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 뷰 전환 ── */}
      <AnimatePresence mode="wait">

        {/* ── 전체 뷰: 모든 활성 섹터 미니맵 그리드 ── */}
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ACTIVE_SECTORS.map((tab) => {
                const miniChain =
                  tab.key === 'defense'       ? defenseChain  :
                  tab.key === 'semiconductor' ? semiChain     :
                  tab.key === 'battery'       ? batteryChain  : null;

                return (
                  <motion.div
                    key={tab.key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: ACTIVE_SECTORS.indexOf(tab) * 0.08 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleOverviewClick(tab.key)}
                      className={`w-full text-left rounded-xl transition-all duration-200
                        ring-2 hover:ring-zinc-400 dark:hover:ring-zinc-500
                        focus:outline-none focus-visible:ring-blue-500
                        ${sector === tab.key
                          ? 'ring-blue-500 dark:ring-blue-400'
                          : 'ring-transparent'
                        }`}
                    >
                      {miniChain ? (
                        <SectorNetworkGraph
                          chain={miniChain}
                          compact
                        />
                      ) : (
                        <div
                          className="rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center"
                          style={{ aspectRatio: '1/1' }}
                        >
                          <div className="text-center">
                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{tab.label}</p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1">로딩 중…</p>
                          </div>
                        </div>
                      )}

                      {/* 섹터 라벨 + 트리거 */}
                      {miniChain && (
                        <div className="mt-2 px-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-semibold ${
                              sector === tab.key
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-zinc-700 dark:text-zinc-300'
                            }`}>
                              {miniChain.sectorLabel}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                              {miniChain.nodes.length}개 종목
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
                            {miniChain.eventTrigger}
                          </p>
                        </div>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* 전체 뷰 안내 */}
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-4">
              섹터 카드를 클릭하면 해당 섹터의 상세 연결망 분석으로 이동합니다
            </p>
          </motion.div>
        )}

        {/* ── 상세 뷰: 섹터 탭 + 연결망 ── */}
        {viewMode === 'detail' && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Tabs value={sector} onValueChange={handleSectorChange}>
              {/* 섹터 탭 */}
              <TabsList className="flex flex-wrap gap-1 h-auto p-1">
                {SECTOR_TABS.map((tab) =>
                  tab.active ? (
                    <TabsTrigger key={tab.key} value={tab.key}>
                      {tab.label}
                    </TabsTrigger>
                  ) : (
                    <button
                      key={tab.key}
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium
                        opacity-40 cursor-not-allowed text-zinc-500 dark:text-zinc-500 select-none"
                    >
                      {tab.label}
                      <span className="inline-flex items-center rounded-full bg-zinc-200 dark:bg-zinc-700
                        px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-none">
                        준비중
                      </span>
                    </button>
                  )
                )}
              </TabsList>

              {/* 활성 섹터 콘텐츠 */}
              {SECTOR_TABS.filter((tab) => tab.active).map((tab) => (
                <TabsContent key={tab.key} value={tab.key}>
                  {/* 로딩 */}
                  {isLoading && (
                    <div className="animate-pulse space-y-4 mt-4">
                      <div className="h-12 rounded-lg bg-zinc-200 dark:bg-zinc-900" />
                      <div className="rounded-xl bg-zinc-200 dark:bg-zinc-900" style={{ aspectRatio: '1/1' }} />
                    </div>
                  )}

                  {/* 에러 */}
                  {error && (
                    <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700
                      dark:border-red-700 dark:bg-red-900/20 dark:text-red-300 mt-4">
                      데이터를 불러오는 중 오류가 발생했습니다: {error.message}
                    </div>
                  )}

                  {/* 연결망 + 상세 패널 */}
                  {!isLoading && !error && chain && (
                    <div className="space-y-4 mt-4">
                      {/* 이벤트 트리거 배너 */}
                      <motion.div
                        key={sector + '-banner'}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl border border-zinc-200/60 dark:border-zinc-700/30
                          bg-white/60 dark:bg-zinc-800/40 backdrop-blur-sm px-4 py-3"
                      >
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 mr-2">📌 트리거:</span>
                          {chain.eventTrigger}
                        </p>
                      </motion.div>

                      {/* 섹터 연결망 마인드맵 */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={sector + '-mindmap'}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                          <SectorNetworkGraph
                            chain={chain}
                            onNodeClick={handleNodeClick}
                            selectedTicker={selectedNode?.ticker ?? null}
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* 선택 노드 디테일 패널 */}
                      <AnimatePresence>
                        {selectedNode && (
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.2 }}
                          >
                            <SectorDetailPanel
                              node={selectedNode}
                              onClose={() => setSelectedNode(null)}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <p className="text-xs text-zinc-400 dark:text-zinc-500 text-right">
                        마지막 업데이트: {new Date(chain.updatedAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  )}

                  {/* 데이터 없음 */}
                  {!isLoading && !error && !chain && (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center
                      text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-500 mt-4">
                      해당 섹터의 분석 데이터가 없습니다.
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
