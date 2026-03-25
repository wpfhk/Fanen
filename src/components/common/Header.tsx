/**
 * 공통 헤더 컴포넌트 (서버 컴포넌트)
 * 모바일 전용 헤더 — 데스크탑은 SideNav가 담당
 * - 비로그인: [로그인] [회원가입] 버튼
 * - 로그인: [마이페이지] [로그아웃] 버튼
 */
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import DarkModeToggle from './DarkModeToggle';
import { BinahLogo } from './BinahLogo';
import Link from 'next/link';
import { LogoutButton } from './LogoutButton';

export async function Header() {
  // 항상 동적 렌더링 — 쿠키(세션) 기반이므로 정적 생성 불가
  noStore();

  // 서버에서 세션 조회 — 쿠키 기반
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // 환경변수 미설정 등 — 비로그인 상태로 렌더링
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        {/* 로고 */}
        <BinahLogo />

        {/* 우측 사용자 영역 (모바일용) */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <DarkModeToggle />
              <Link
                href="/profile"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                마이페이지
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <DarkModeToggle />
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
