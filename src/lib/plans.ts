/**
 * BINAH 구독 플랜 — 완전 무료화
 * 기존 Free/Pro/Premium → 단일 무료 플랜으로 전환
 * SubscriptionGate는 모든 페이지에서 제거됨
 */

/** 구독 플랜 타입 — 하위 호환을 위해 union 유지 */
export type PlanTier = 'free' | 'pro' | 'premium';

/** 플랜 정보 */
export interface PlanInfo {
  tier: PlanTier;
  name: string;
  priceMonthly: number;
  features: string[];
}

/** BINAH 단일 무료 플랜 */
export const PLANS: Record<'free', PlanInfo> = {
  free: {
    tier: 'free',
    name: 'BINAH',
    priceMonthly: 0,
    features: [
      '비나 맵 — 세계 정세 시각화',
      '뉴스 분석 — 무제한',
      'Value Chain 분석 (Tier 1~3)',
      '반디 AI 코치 — 무제한',
      '불로소득 목표 계산기',
      '배당 허브 + ETF 시뮬레이터',
      '모의투자 — 무제한',
      '투자 일지',
    ],
  },
} as const;

/** 플랜 우선순위 — 하위 호환 유지 */
export const PLAN_PRIORITY: Record<PlanTier, number> = {
  free: 2,    // BINAH: 모든 플랜이 최고 권한
  pro: 2,
  premium: 2,
} as const;

/**
 * 접근 권한 확인 — BINAH 완전 무료화로 항상 true 반환
 */
export function hasAccess(_userPlan: PlanTier, _requiredPlan: PlanTier): boolean {
  return true;
}
