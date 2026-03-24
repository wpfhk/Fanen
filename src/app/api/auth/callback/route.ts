/**
 * Supabase Auth OAuth 콜백 핸들러
 * OAuth 인증 완료 후 code를 세션으로 교환
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET /api/auth/callback — OAuth 콜백 처리 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 인증 성공 → next 파라미터 경로 또는 홈으로 리다이렉트
      // 오픈 리다이렉트 방지: 상대 경로만 허용 (외부 URL 차단)
      const next = searchParams.get('next') ?? '/';
      const safePath = next.startsWith('/') && !next.startsWith('//') ? next : '/';
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  // 인증 실패 → 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
