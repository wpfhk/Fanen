'use client';

/**
 * 대시보드 홈 — 로그인 사용자 전용
 * 반디 오전 브리핑 + 비나 맵 섹터 + 포트폴리오 + 빠른 메뉴
 */
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/common';
import Card from '@/components/ui/Card';
import { MorningBriefCard } from './components/MorningBriefCard';
import { SectorTop3Card } from './components/SectorTop3Card';
import { BinahMapLite } from '@/features/binah-map';
import { useBinahMap } from '@/features/binah-map';

/* ── Mock 데이터 ── */
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
  { label: '비나 맵', href: '/binah-map', icon: '🌍' },
  { label: '모의투자', href: '/mock-trading', icon: '📈' },
  { label: '반디 코치', href: '/coach', icon: '🤖' },
  { label: '배당 허브', href: '/dividend', icon: '💰' },
] as const;

export default function DashboardHome() {
  const { events, selectedEvent, selectEvent } = useBinahMap();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F1923]">
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-5">
        {/* 반디 오전 브리핑 */}
        <MorningBriefCard />

        {/* 비나 맵 Lite — 세계 이벤트 시각화 */}
        <div className="rounded-xl border border-slate-200 dark:border-[#1E3448] overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">비나 맵 — 오늘의 Hot Zone</h2>
            <Link href="/binah-map" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
              자세히 보기 →
            </Link>
          </div>
          <BinahMapLite
            events={events}
            selectedId={selectedEvent?.id}
            onSelect={selectEvent}
            height={180}
          />
        </div>

        {/* 비나 맵 섹터 + 포트폴리오 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SectorTop3Card />

          {/* 포트폴리오 요약 */}
          <div className="rounded-xl border border-slate-200 dark:border-[#1E3448] bg-white dark:bg-[#162032] p-4">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">내 포트폴리오</h2>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {MOCK_PORTFOLIO.totalValue.toLocaleString()}원
            </p>
            <p className={`mt-1 text-sm font-medium ${MOCK_PORTFOLIO.totalReturn >= 0 ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
              {MOCK_PORTFOLIO.totalReturn >= 0 ? '+' : ''}{MOCK_PORTFOLIO.totalReturn}%
            </p>
            <Link href="/portfolio" className="mt-3 inline-block text-xs text-teal-600 dark:text-teal-400 hover:underline">
              상세 보기 →
            </Link>
          </div>
        </div>

        {/* 오늘의 주요 뉴스 */}
        <div className="rounded-xl border border-slate-200 dark:border-[#1E3448] bg-white dark:bg-[#162032] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">오늘의 주요 뉴스</h2>
            <Link href="/news" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">전체 보기 →</Link>
          </div>
          <ul className="space-y-2">
            {MOCK_NEWS.map((news) => (
              <li key={news.id} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-500" />
                <div>
                  <p className="text-slate-800 dark:text-slate-200 leading-snug">{news.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{news.source}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_MENU.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <Card variant="bordered" padding="md" className="text-center transition-shadow group-hover:shadow-md dark:bg-[#162032] dark:border-[#1E3448]">
                <div className="text-2xl">{item.icon}</div>
                <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
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
