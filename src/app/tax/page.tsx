'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { DisclaimerBanner, SubscriptionGate } from '@/components/common';
import TaxForm from '@/features/tax-simulator/components/TaxForm';
import { useRouter } from 'next/navigation';

/** 세금 시뮬레이터 페이지 — Premium 전용 */
export default function TaxPage() {
  const { plan } = useSubscription();
  const router = useRouter();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">세금 시뮬레이터</h1>
      <DisclaimerBanner variant="tax" />
      <SubscriptionGate
        requiredPlan="premium"
        currentPlan={plan}
        onUpgradeClick={() => router.push('/pricing')}
      >
        <TaxForm />
      </SubscriptionGate>
    </main>
  );
}
