'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import AuthLayout from '@/components/layout/AuthLayout';

/**
 * 비밀번호 재설정 페이지
 * 이메일 링크를 통해 접근 후 새 비밀번호 설정
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const configured = isSupabaseConfigured();
  const supabase = configured ? createClient() : null;

  // Supabase 미설정 시 안내 화면 표시
  if (!configured || !supabase) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">BINAH</h1>
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <p className="font-medium mb-1">Supabase 환경변수 미설정</p>
            <p>.env.local 파일에 실제 Supabase URL과 Anon Key를 입력한 후 서버를 재시작하세요.</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  /** 비밀번호 유효성 검사: 8자 이상, 영문+숫자 포함 */
  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (!/[a-zA-Z]/.test(pw)) return '비밀번호에 영문자를 포함해야 합니다.';
    if (!/[0-9]/.test(pw)) return '비밀번호에 숫자를 포함해야 합니다.';
    return null;
  };

  /** 새 비밀번호 설정 */
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">BINAH</h1>
        <p className="mt-2 text-sm text-gray-500">새 비밀번호를 설정하세요</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 비밀번호 재설정 폼 */}
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            새 비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="8자 이상, 영문+숫자 포함"
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
            새 비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? '설정 중...' : '비밀번호 변경'}
        </button>
      </form>
    </AuthLayout>
  );
}
