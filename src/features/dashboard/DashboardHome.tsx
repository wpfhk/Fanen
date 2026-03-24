'use client';

/**
 * 대시보드 홈 — 로그인 사용자 전용
 * 핀이 데일리 한마디 + 포트폴리오 요약 + 오늘의 뉴스 + 빠른 메뉴
 */
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/common';
import Card from '@/components/ui/Card';
import { FinniAvatar } from '@/features/ai-coach/components/FinniAvatar';

/* ── Mock 데이터 ── */
const DAILY_TIP = '오늘 반도체 섹터 주목해보세요! HBM3E 양산 소식이 긍정적 흐름을 이끌고 있습니다.';

const MOCK_PORTFOLIO = {
  totalValue: 12_450_000,
  totalReturn: 3.2,
};

const MOCK_NEWS = [
  { id: '1', title: '삼성전자, 2분기 영업이익 10조 돌파 전망', source: '한국경제' },
  { id: '2', title: '셀트리온, 글로벌 바이오시밀러 시장 점유율 확대', source: '매일경제' },
  { id: '3', title: '현대차, 전기차 신모델 출시로 점유율 반등 기대', source: '조선비즈' },
];

const QUICK_MENU = [
  { label: '모의투자', href: '/mock-trading', icon: '📈' },
  { label: 'AI 코치', href: '/coach', icon: '🤖' },
  { label: '배당 캘린더', href: '/dividend', icon: '📅' },
  { label: '뉴스', href: '/news', icon: '📰' },
] as const;

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        {/* 핀이 데일리 한마디 */}
        <Card variant="highlighted" padding="md">
          <div className="flex items-start gap-3">
            <FinniAvatar size={40} mood="default" />
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">핀이의 데일리 한마디</p>
              <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">{DAILY_TIP}</p>
            </div>
          </div>
        </Card>

        {/* 포트폴리오 요약 + 오늘의 뉴스 (2열 그리드) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 포트폴리오 요약 */}
          <Card variant="bordered" padding="lg">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400">내 포트폴리오</h2>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-slate-100">
              {MOCK_PORTFOLIO.totalValue.toLocaleString()}원
            </p>
            <p className={`mt-1 text-sm font-medium ${MOCK_PORTFOLIO.totalReturn >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
              {MOCK_PORTFOLIO.totalReturn >= 0 ? '+' : ''}{MOCK_PORTFOLIO.totalReturn}%
            </p>
            <Link href="/portfolio" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
              상세 보기 →
            </Link>
          </Card>

          {/* 오늘의 주요 뉴스 */}
          <Card variant="bordered" padding="lg">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400">오늘의 주요 뉴스</h2>
            <ul className="mt-3 space-y-2">
              {MOCK_NEWS.map((news) => (
                <li key={news.id} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-gray-800 dark:text-slate-200 leading-snug">{news.title}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500">{news.source}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/news" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
              뉴스 전체 보기 →
            </Link>
          </Card>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_MENU.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <Card variant="bordered" padding="md" className="text-center transition-shadow group-hover:shadow-md">
                <div className="text-2xl">{item.icon}</div>
                <p className="mt-1 text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                  {item.label}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {/* 면책 고지 */}
        <DisclaimerBanner variant="default" />
      </div>
    </div>
  );
}
