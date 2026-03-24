'use client';

/**
 * MorningBriefCard — 반디의 오전 브리핑 카드
 */
import Link from 'next/link';
import { BandiAvatar } from '@/features/ai-coach/components/BandiAvatar';
import { MOCK_MORNING_BRIEF } from '@/lib/mock/mockMorningLight';

const DIRECTION_ICON: Record<string, string> = {
  up:      '▲',
  down:    '▼',
  neutral: '–',
};
const DIRECTION_COLOR: Record<string, string> = {
  up:      'text-red-400',
  down:    'text-blue-400',
  neutral: 'text-slate-400',
};

export function MorningBriefCard() {
  const brief = MOCK_MORNING_BRIEF;

  return (
    <div className="rounded-xl border border-[#1E3448] bg-[#162032] p-4 space-y-3">
      {/* 반디 + 헤드라인 */}
      <div className="flex items-start gap-3">
        <BandiAvatar size={36} mood={brief.bandiMood} animate />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-teal-400">반디의 오늘 브리핑 ☀️</p>
          <p className="mt-0.5 text-sm font-bold text-slate-100 leading-snug">{brief.headline}</p>
        </div>
      </div>

      {/* 요약 */}
      <p className="text-xs text-slate-400 leading-relaxed">{brief.summary}</p>

      {/* 섹터 신호 */}
      <div className="grid grid-cols-3 gap-2">
        {brief.topSectors.map((s) => (
          <div
            key={s.name}
            className="rounded-lg bg-[#0F1923] px-2 py-1.5 text-center"
          >
            <span className={`text-xs font-bold ${DIRECTION_COLOR[s.direction]}`}>
              {DIRECTION_ICON[s.direction]}
            </span>
            <p className="text-xs font-semibold text-slate-200 mt-0.5">{s.name}</p>
          </div>
        ))}
      </div>

      {/* 비나 맵 링크 */}
      <div className="text-right">
        <Link
          href="/binah-map"
          className="text-xs text-teal-400 hover:text-teal-300 hover:underline transition-colors"
        >
          비나 맵에서 전체 보기 →
        </Link>
      </div>
    </div>
  );
}
