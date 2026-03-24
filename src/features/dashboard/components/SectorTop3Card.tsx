'use client';

/**
 * SectorTop3Card — 오늘 반디가 주목한 섹터 Top3
 */
import Link from 'next/link';
import { MOCK_GEO_EVENTS } from '@/lib/mock/mockBinahMap';

/** 이벤트에서 섹터별 최고 riskScore 집계 */
function deriveTopSectors() {
  const scoreMap = new Map<string, number>();
  for (const ev of MOCK_GEO_EVENTS) {
    for (const sector of ev.affectedSectors) {
      const prev = scoreMap.get(sector) ?? 0;
      if (ev.riskScore > prev) scoreMap.set(sector, ev.riskScore);
    }
  }
  return [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, score]) => ({ name, score }));
}

const TOP_SECTORS = deriveTopSectors();

function riskBg(score: number) {
  if (score >= 70) return 'bg-red-900/30 text-red-300';
  if (score >= 45) return 'bg-amber-900/30 text-amber-300';
  return 'bg-emerald-900/30 text-emerald-300';
}

export function SectorTop3Card() {
  return (
    <div className="rounded-xl border border-[#1E3448] bg-[#162032] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-400">오늘 반디 주목 섹터</h2>
        <Link href="/binah-map" className="text-xs text-teal-400 hover:underline">
          지도 보기 →
        </Link>
      </div>

      <div className="space-y-2">
        {TOP_SECTORS.map((s, idx) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 w-4 text-center">
              {idx + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-200">{s.name}</span>
                <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${riskBg(s.score)}`}>
                  {s.score}
                </span>
              </div>
              <div className="h-1 rounded-full bg-[#0F1923] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${s.score}%`,
                    background: s.score >= 70 ? '#F87171' : s.score >= 45 ? '#FBBF24' : '#34D399',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
