'use client';

import { useState, useEffect } from 'react';
import type { PlanTier } from '@/lib/plans';
import { PLAN_PRIORITY } from '@/lib/plans';
import { USE_MOCK } from '@/lib/mock';

const DEV_UNLOCK = process.env.NEXT_PUBLIC_DEV_UNLOCK_PRO === 'true';

/**
 * 구독 플랜 조회 훅
 * Mock 모드에서는 free 플랜 고정, DEV_UNLOCK 시 premium 플랜 고정
 * 실 환경에서는 Supabase profiles 조회
 */
export function useSubscription() {
  const [plan, setPlan] = useState<PlanTier>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK || DEV_UNLOCK) {
      const mockPlan: PlanTier = DEV_UNLOCK ? 'premium' : 'free';
      setPlan(mockPlan);
      setLoading(false);
      return;
    }

    // Supabase에서 profiles.subscription_tier 조회
    async function fetchPlan() {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        if (!supabase) {
          setPlan('free');
          setLoading(false);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setPlan('free');
          setLoading(false);
          return;
        }
        const { data } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single<{ subscription_tier: string }>();
        if (data?.subscription_tier) {
          setPlan(data.subscription_tier as PlanTier);
        }
      } catch {
        // 오류 시 free 플랜 기본값 유지
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, []);

  return {
    plan,
    loading,
    isPro: PLAN_PRIORITY[plan] >= 1,
    isPremium: PLAN_PRIORITY[plan] >= 2,
  };
}
