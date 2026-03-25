import type { SectorImpact } from '@/lib/mock/mockGlobalNews';
import { IMPACT_CONFIG } from '@/lib/mock/mockGlobalNews';

interface Props { sectors: SectorImpact[]; }

const IMPACT_WIDTH: Record<string, string> = {
  strong_positive: 'w-full',
  positive:        'w-3/4',
  neutral:         'w-1/2',
  negative:        'w-3/4',
  strong_negative: 'w-full',
};

export default function SectorImpactHeatmap({ sectors }: Props) {
  return (
    <div className="space-y-3">
      {sectors.map((s) => {
        const cfg = IMPACT_CONFIG[s.impact];
        return (
          <div key={s.sector}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-800 dark:text-zinc-200">{s.sector}</span>
              <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full ${cfg.barColor} ${IMPACT_WIDTH[s.impact]} rounded-full transition-all`}/>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{s.reason}</p>
          </div>
        );
      })}
    </div>
  );
}
