import React from 'react';
import { DisclaimerBanner } from '@/components/common';

/** PageLayout Props */
interface PageLayoutProps {
  title?: string;
  showDisclaimerBanner?: boolean;
  disclaimerVariant?: 'default' | 'pack' | 'tax' | 'signal';
  children: React.ReactNode;
}

/** 페이지 공통 레이아웃 — 타이틀 + 면책 고지 + 콘텐츠 */
export default function PageLayout({
  title,
  showDisclaimerBanner = false,
  disclaimerVariant = 'default',
  children,
}: PageLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {title && (
        <h1 className="mb-4 text-2xl font-bold text-gray-900">{title}</h1>
      )}
      {showDisclaimerBanner && (
        <div className="mb-4">
          <DisclaimerBanner variant={disclaimerVariant} />
        </div>
      )}
      {children}
    </div>
  );
}
