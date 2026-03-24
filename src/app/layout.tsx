import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import DevModeBanner from '@/components/common/DevModeBanner';
import { ToastProvider } from '@/components/ui/Toast';

/** Inter 폰트 로드 — 라틴 + 한국어 지원 */
const inter = Inter({ subsets: ['latin'] });

/** 페이지 메타데이터 */
export const metadata: Metadata = {
  title: 'BINAH | 반디가 찾은 오늘의 기회',
  description: '반디가 찾은 오늘의 기회, 당신의 내일이 빛나도록',
  keywords: ['투자', '불로소득', '배당', 'AI', 'BINAH', '비나', '반디'],
};

/** 루트 레이아웃 — 전체 앱 래퍼 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} antialiased pb-16 md:pb-0 dark:bg-slate-900`}>
        <ToastProvider>
          <DevModeBanner />
          <Header />
          <main>{children}</main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
