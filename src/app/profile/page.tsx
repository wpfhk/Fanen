/**
 * 프로필 설정 페이지 (서버 컴포넌트)
 * 미들웨어가 미인증 사용자를 /login으로 리다이렉트
 */
import type { Metadata } from 'next';
import { ProfileForm } from '@/features/profile/components/ProfileForm';

export const metadata: Metadata = {
  title: '내 프로필 — 파낸',
  description: '투자 성향과 UI 설정을 관리합니다',
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">내 프로필</h1>
      <ProfileForm />
    </div>
  );
}
