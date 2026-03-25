'use client';

import { useRouter } from 'next/navigation';
import { useValueChain } from '@/features/value-chain/hooks/useValueChain';
import { ValueChainView } from '@/features/value-chain/components/ValueChainView';

/** 섹터 탭 목록 */
const SECTOR_TABS = [
  { key: 'defense', label: '방산' },
  { key: 'semiconductor', label: '반도체' },
  { key: 'battery', label: '2차전지' },
] as const;

/** ValueChainPageClient Props */
interface ValueChainPageClientProps {
  sector: string;
}

/** 밸류체인 페이지 클라이언트 컴포넌트 */
export function ValueChainPageClient({ sector }: ValueChainPageClientProps) {
  const router = useRouter();
  const { chain, isLoading, error } = useValueChain(sector);

  /** 섹터 탭 전환 — URL searchParams 업데이트 */
  const handleSectorChange = (key: string) => {
    router.replace(`/value-chain?sector=${key}`);
  };

  return (
    <div className="space-y-6">
      {/* 섹터 탭 */}
      <div className="flex gap-2 flex-wrap">
        {SECTOR_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleSectorChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sector === tab.key
                ? 'bg-teal-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 로딩 스켈레톤 */}
      {isLoading && (
        <div className="animate-pulse space-y-4">
          <div className="h-12 rounded-lg bg-slate-800" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-slate-800" />
            ))}
          </div>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="rounded-lg border border-red-700 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          데이터를 불러오는 중 오류가 발생했습니다: {error.message}
        </div>
      )}

      {/* 밸류체인 뷰 */}
      {!isLoading && !error && chain && (
        <ValueChainView chain={chain} />
      )}

      {/* 데이터 없음 */}
      {!isLoading && !error && !chain && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-8 text-center text-sm text-slate-500">
          해당 섹터의 밸류체인 데이터가 없습니다.
        </div>
      )}
    </div>
  );
}
