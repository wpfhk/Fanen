'use client';

/**
 * 프로필 설정 페이지
 * 현재 플랜 카드 + 프로필 설정 폼
 */
import Link from 'next/link';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { useSubscription } from '@/hooks/useSubscription';
import PlanBadge from '@/components/common/PlanBadge';

export default function ProfilePage() {
  const { plan, loading } = useSubscription();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">내 프로필</h1>

      {/* 현재 플랜 카드 */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">현재 플랜</p>
            <div className="mt-1">
              {loading ? (
                <span className="text-sm text-gray-400">불러오는 중...</span>
              ) : (
                <PlanBadge plan={plan} size="md" />
              )}
            </div>
          </div>
          <Link href="/pricing" className="text-sm text-primary hover:underline">
            플랜 변경
          </Link>
        </div>
      </div>

      <ProfileForm />
    </div>
  );
}
