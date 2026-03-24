'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import AuthLayout from '@/components/layout/AuthLayout';

/**
 * 비밀번호 재설정 요청 페이지
 * 이메일 입력 후 재설정 링크 발송
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
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

  // 성공 시 안내 화면
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">파낸</h1>
          <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-6 text-sm text-green-700">
            <p className="font-medium text-lg mb-2">비밀번호 재설정 이메일을 발송했습니다</p>
            <p>입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다.</p>
            <p className="mt-1">이메일의 링크를 클릭하여 새 비밀번호를 설정하세요.</p>
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

  /** 비밀번호 재설정 이메일 발송 */
  const handleResetRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
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
        <p className="mt-2 text-sm text-gray-500">비밀번호를 재설정합니다</p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 이메일 입력 폼 */}
      <form onSubmit={handleResetRequest} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            가입한 이메일
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? '발송 중...' : '재설정 이메일 발송'}
        </button>
      </form>

      {/* 하단 링크 */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <Link href="/login" className="text-primary hover:underline">
          로그인으로 돌아가기
        </Link>
      </div>
    </AuthLayout>
  );
}
