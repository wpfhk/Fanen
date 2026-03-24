/**
 * 서버 컴포넌트용 현재 사용자 조회 유틸리티
 */
import { createClient } from '@/lib/supabase/server';

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
