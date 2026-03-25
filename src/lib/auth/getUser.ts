/**
 * 서버 컴포넌트용 현재 사용자 조회 유틸리티
 */
import { createClient } from '@/lib/supabase/server';

export async function getUser() {
  // 테스트 모드: NEXT_PUBLIC_BYPASS_AUTH=true 시 mock user 반환
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
    return {
      id: 'test-user',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as const;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
