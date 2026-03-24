/**
 * Mock 데이터 사용 여부 플래그
 * 환경변수 또는 Supabase 미설정 시 자동으로 Mock 모드 활성화
 */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  || !process.env.NEXT_PUBLIC_SUPABASE_URL
  || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url';
