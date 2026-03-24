/**
 * 홈 페이지 — 서버 컴포넌트
 * 로그인 사용자: DashboardHome, 비로그인: LandingPage
 */
import { getUser } from '@/lib/auth/getUser';
import LandingPage from '@/features/landing/LandingPage';
import DashboardHome from '@/features/dashboard/DashboardHome';

export default async function HomePage() {
  let user = null;
  try {
    user = await getUser();
  } catch {
    // Supabase 미설정 시 비로그인 상태로 처리
  }

  if (user) {
    return <DashboardHome />;
  }
  return <LandingPage />;
}
