import { Badge } from '@/components/ui/badge';
import type { TierLevel } from '../types';

/** 티어 → Badge variant 매핑 */
const TIER_VARIANT = {
  0: 'tier0',
  1: 'tier1',
  2: 'tier2',
  3: 'tier3',
} as const;

/** 티어 레이블 */
const TIER_LABEL: Record<TierLevel, string> = {
  0: '메이저',
  1: 'T1 직접납품',
  2: 'T2 부품소재',
  3: 'T3 간접수혜',
};

/** 밸류체인 티어 뱃지 컴포넌트 — shadcn/ui Badge 기반 */
export function TierBadge({ tier }: { tier: TierLevel }) {
  return (
    <Badge variant={TIER_VARIANT[tier]} size="sm">
      {TIER_LABEL[tier]}
    </Badge>
  );
}
