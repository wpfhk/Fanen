'use client';

import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useValueChain } from '@/features/value-chain/hooks/useValueChain';
import { ValueChainView } from '@/features/value-chain/components/ValueChainView';

/** 섹터 탭 목록 */
const SECTOR_TABS = [
  { key: 'defense',      label: '방산' },
  { key: 'semiconductor', label: '반도체' },
  { key: 'battery',      label: '2차전지' },
] as const;

interface ValueChainPageClientProps {
  sector: string;
}

/** 밸류체인 페이지 클라이언트 컴포넌트 — shadcn/ui Tabs 적용 */
export function ValueChainPageClient({ sector }: ValueChainPageClientProps) {
  const router = useRouter();
  const { chain, isLoading, error } = useValueChain(sector);

  const handleSectorChange = (key: string) => {
    router.replace(`/value-chain?sector=${key}`);
  };

  return (
    <Tabs value={sector} onValueChange={handleSectorChange}>
      {/* 섹터 탭 선택 */}
      <TabsList>
        {SECTOR_TABS.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* 각 섹터 콘텐츠 */}
      {SECTOR_TABS.map((tab) => (
        <TabsContent key={tab.key} value={tab.key}>
          {/* 로딩 스켈레톤 */}
          {isLoading && (
            <div className="animate-pulse space-y-4">
              <div className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300">
              데이터를 불러오는 중 오류가 발생했습니다: {error.message}
            </div>
          )}

          {/* 밸류체인 뷰 */}
          {!isLoading && !error && chain && <ValueChainView chain={chain} />}

          {/* 데이터 없음 */}
          {!isLoading && !error && !chain && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500">
              해당 섹터의 밸류체인 데이터가 없습니다.
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
