import type { PlanTier } from '@/lib/plans';

/** PlanBadge Props */
interface PlanBadgeProps {
  /** 구독 플랜 */
  plan: PlanTier;
  /** 뱃지 크기 */
  size?: 'sm' | 'md';
}

/** 플랜별 스타일 매핑 */
const PLAN_STYLES: Record<PlanTier, string> = {
  free: 'bg-gray-100 text-gray-600',
  pro: 'bg-blue-100 text-blue-700',
  premium: 'bg-yellow-100 text-yellow-700',
};

/** 플랜별 라벨 */
const PLAN_LABELS: Record<PlanTier, string> = {
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
};

/** 크기별 스타일 */
const SIZE_STYLES: Record<'sm' | 'md', string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

/** 구독 플랜 뱃지 — 플랜에 따라 색상 구분 표시 */
export default function PlanBadge({ plan, size = 'sm' }: PlanBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${PLAN_STYLES[plan]} ${SIZE_STYLES[size]}`}
    >
      {PLAN_LABELS[plan]}
    </span>
  );
}
