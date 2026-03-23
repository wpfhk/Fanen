/**
 * 브라우저 측 Supabase 클라이언트
 * 싱글톤 패턴으로 중복 인스턴스 생성 방지
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/** Supabase 환경변수가 유효한지 확인 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return url.startsWith('http') && key.length > 0 && !key.includes('your-');
}

/** 브라우저 환경 Supabase 클라이언트 생성 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!isSupabaseConfigured()) {
    return null;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
