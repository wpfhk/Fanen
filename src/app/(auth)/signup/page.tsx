'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import AuthLayout from '@/components/layout/AuthLayout';

/**
 * 회원가입 페이지
 * 이메일/비밀번호 + 약관 동의 후 Supabase signUp 호출
 */
export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const configured = isSupabaseConfigured();
  const supabase = configured ? createClient() : null;

  // Supabase 미설정 시 안내 화면 표시
  if (!configured || !supabase) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">파낸</h1>
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <p className="font-medium mb-1">Supabase 환경변수 미설정</p>
            <p>.env.local 파일에 실제 Supabase URL과 Anon Key를 입력한 후 서버를 재시작하세요.</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // 성공 시 이메일 확인 안내 화면
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">파낸</h1>
          <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-6 text-sm text-green-700">
            <p className="font-medium text-lg mb-2">이메일을 확인해주세요</p>
            <p>입력하신 이메일로 인증 링크를 발송했습니다.</p>
            <p className="mt-1">이메일의 링크를 클릭하면 회원가입이 완료됩니다.</p>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            <Link href="/login" className="text-primary hover:underline">
              로그인 페이지로 돌아가기
            </Link>
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

  /** 회원가입 처리 */
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError('이용약관과 개인정보처리방침에 모두 동의해야 합니다.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/api/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <AuthLayout>
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">파낸</h1>
        <p className="mt-2 text-sm text-gray-500">새 계정을 만들어 시작하세요</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 회원가입 폼 */}
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="example@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            비밀번호
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
            비밀번호 확인
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

        {/* 약관 동의 */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>
              이용약관에 동의합니다 <span className="text-red-500">*</span>
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>
              개인정보처리방침에 동의합니다 <span className="text-red-500">*</span>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? '가입 처리 중...' : '회원가입'}
        </button>
      </form>

      {/* 하단 링크 */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
