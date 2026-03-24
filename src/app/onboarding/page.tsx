'use client';

/**
 * 온보딩 진입점
 * step1으로 자동 리다이렉트
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/onboarding/step1');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-sm text-gray-500">온보딩 준비 중...</div>
    </div>
  );
}
