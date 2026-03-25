'use client';

/**
 * NewsImpactList 컴포넌트 (v2 리디자인)
 * - 섹터 필터와 영향도 필터를 시각적으로 분리 (구분선으로 구분)
 * - 섹터/영향도 레이블 강조
 * - zinc 컬러 시스템 통일
 */
import { useState, useMemo } from 'react';
import { useNewsImpacts } from '../hooks/useNewsImpacts';
import NewsImpactCard from './NewsImpactCard';
import type { NewsImpactCardData } from '../types';

const SECTOR_OPTIONS = [
  'IT', '반도체', '바이오', '금융', '제조', '자동차',
  '철강', '소재', '방산', '에너지', '플랫폼', '헬스케어', '2차전지', '전력', '항공', '은행',
] as const;

type ImpactLevel = '전체' | '높음' | '중간' | '낮음';

/** 영향도 필터 옵션 설정 */
const IMPACT_OPTIONS: { level: ImpactLevel; label: string; desc: string }[] = [
  { level: '전체', label: '전체', desc: '' },
  { level: '높음', label: '높음', desc: '7+' },
  { level: '중간', label: '중간', desc: '4~7' },
  { level: '낮음', label: '낮음', desc: '~4' },
];

export default function NewsImpactList() {
  const { data, loading, error } = useNewsImpacts();
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [impactFilter, setImpactFilter] = useState<ImpactLevel>('전체');

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const filteredData = useMemo(() => {
    return data.filter((item: NewsImpactCardData) => {
      if (selectedSectors.length > 0) {
        const matchesSector = selectedSectors.some((sel) =>
          item.affected_sectors.some((s) => s.includes(sel) || sel.includes(s))
        );
        if (!matchesSector) return false;
      }
      if (impactFilter === '높음' && item.impact_score < 67) return false;
      if (impactFilter === '중간' && (item.impact_score < 34 || item.impact_score >= 67)) return false;
      if (impactFilter === '낮음' && item.impact_score >= 34) return false;
      return true;
    });
  }, [data, selectedSectors, impactFilter]);

  const resetFilters = () => {
    setSelectedSectors([]);
    setImpactFilter('전체');
  };

  const hasActiveFilter = selectedSectors.length > 0 || impactFilter !== '전체';

  return (
    <section className="space-y-4">
      {/* ── 필터 패널 ── */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">

        {/* 섹터 필터 영역 */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">섹터 필터</span>
            {selectedSectors.length > 0 && (
              <span className="text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 px-1.5 py-0.5 rounded-full font-medium">
                {selectedSectors.length}개 선택
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SECTOR_OPTIONS.map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => toggleSector(sector)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  selectedSectors.includes(sector)
                    ? 'bg-teal-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-zinc-100 dark:border-zinc-800" />

        {/* 영향도 필터 영역 */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">영향도 필터</span>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 underline"
              >
                초기화
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {IMPACT_OPTIONS.map(({ level, label, desc }) => (
              <button
                key={level}
                type="button"
                onClick={() => setImpactFilter(level)}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  impactFilter === level
                    ? 'bg-teal-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {/* 라디오 아이콘 시뮬레이션 */}
                <span className={`inline-block w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                  impactFilter === level
                    ? 'border-white bg-white'
                    : 'border-zinc-400 dark:border-zinc-500'
                }`} />
                <span>{label}</span>
                {desc && (
                  <span className={`${impactFilter === level ? 'text-teal-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {desc}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900/50 p-4 text-sm text-rose-700 dark:text-rose-400">
          데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </div>
      )}

      {/* 빈 데이터 */}
      {!loading && !error && filteredData.length === 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8 text-center text-sm text-zinc-500">
          {hasActiveFilter
            ? '필터 조건에 맞는 뉴스가 없습니다.'
            : '표시할 뉴스 분석 정보가 없습니다.'}
        </div>
      )}

      {/* 카드 목록 */}
      {!loading && filteredData.length > 0 && (
        <div className="space-y-3">
          {filteredData.map((item) => (
            <NewsImpactCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
