'use client';

/**
 * MorningBriefCard — 오늘의 수혜 섹터 진입점
 * 반디 브리핑 + 가로 스크롤 섹터 카드 → /sector-analysis?sector={key}
 */
import Link from 'next/link';
import { BandiAvatar } from '@/components/common/BandiAvatar';
import { MOCK_MORNING_BRIEF_DATA } from '@/lib/mock/mockMorningBrief';
import { cn } from '@/lib/utils';
import type { BriefSector } from '@/types/sector.types';

const URGENCY_CONFIG = {
  high:   { label: '긴급', color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-900/20',    dot: 'bg-red-500' },
  medium: { label: '주목', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', dot: 'bg-amber-500' },
  low:    { label: '관찰', color: 'text-zinc-500 dark:text-zinc-400',   bg: 'bg-zinc-50 dark:bg-zinc-800/50',   dot: 'bg-zinc-400' },
} as const;

function SectorCard({ sector }: { sector: BriefSector }) {
  const cfg = URGENCY_CONFIG[sector.urgency];

  return (
    <Link
      href={`/sector-analysis?sector=${sector.sectorKey}`}
      className={cn(
        'flex-shrink-0 w-52 rounded-xl border border-zinc-200/60 dark:border-zinc-700/40',
        'bg-white dark:bg-zinc-900',
        'p-4 space-y-2.5',
        'hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600',
        'active:scale-[0.98] transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
      )}
    >
      {/* 섹터명 + 긴급도 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
          {sector.sectorLabel}
        </span>
        <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full', cfg.color, cfg.bg)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
          {cfg.label}
        </span>
      </div>

      {/* 트리거 */}
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
        {sector.trigger}
      </p>

      {/* 대표 Tier 0 종목 */}
      <div className="flex items-center justify-between pt-0.5 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">Tier 0</span>
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
          {sector.topTier0Name}
        </span>
      </div>

      {/* 진입 안내 */}
      <p className="text-[10px] text-blue-500 dark:text-blue-400 text-right">
        Tier 1~3 보기 →
      </p>
    </Link>
  );
}

export function MorningBriefCard({ className }: { className?: string }) {
  const brief = MOCK_MORNING_BRIEF_DATA;

  return (
    <div className={cn(
      'rounded-card shadow-card border border-amber-200/40 dark:border-amber-400/10',
      'bg-gradient-to-br from-amber-50/50 via-white to-white dark:from-amber-900/10 dark:via-zinc-900 dark:to-zinc-900',
      'backdrop-blur-sm p-5 space-y-4',
      className
    )}>
      {/* 반디 + 헤드라인 */}
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-amber-200/40 blur-md animate-pulse" />
          <BandiAvatar size={44} mood={brief.bandiMood} animate />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            반디의 오늘 브리핑 ☀️
          </p>
          <p className="mt-0.5 text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
            {brief.headline}
          </p>
        </div>
      </div>

      {/* 요약 */}
      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {brief.summary}
      </p>

      {/* 섹터 카드 — 가로 스크롤 */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
        {brief.beneficiarySectors.map((sector) => (
          <div key={sector.sectorKey} className="snap-start">
            <SectorCard sector={sector} />
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <p className="text-[10px] text-zinc-400 dark:text-zinc-600 text-right">
        {brief.date} 기준
      </p>
    </div>
  );
}
