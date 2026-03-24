import React from 'react';

/** 인증 페이지 전용 레이아웃 — 그라데이션 배경 + 중앙 카드 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-b from-primary/10 to-white px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
