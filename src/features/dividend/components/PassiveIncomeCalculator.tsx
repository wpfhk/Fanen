'use client';

/**
 * 불로소득 역산 계산기 (PRD S3.1)
 * 목표 월 수익 → 필요 투자금 역산
 * 10년/20년/30년 복리 달성 경로 시뮬레이션 포함
 * 라이트모드 가독성 개선: zinc 계열 통일, text-zinc-700 이상 사용
 */
import { useState } from 'react';
import AiBadge from '@/components/common/AiBadge';
import { usePassiveIncome } from '../hooks/usePassiveIncome';
import type { PortfolioType } from '../types';
import { formatKRW } from '../types';
import PortfolioTypeFilter from './PortfolioTypeFilter';

/** 연 수익률 선택 옵션 (%) */
const YIELD_OPTIONS = [3, 4, 5];

/** 복리 달성 경로 계산 — 연 저축액 + 복리 */
function calcCompoundPath(
  targetInvestment: number,
  years: number,
  annualYieldPercent: number
): { savingsPerMonth: number; finalValue: number } {
  const r = annualYieldPercent / 100 / 12; // 월 복리율
  const n = years * 12; // 총 납입 개월 수
  // FV = PMT * ((1+r)^n - 1) / r
  // PMT = FV * r / ((1+r)^n - 1)
  const factor = (Math.pow(1 + r, n) - 1) / r;
  const savingsPerMonth = factor > 0 ? targetInvestment / factor : targetInvestment / n;
  const finalValue = savingsPerMonth * factor;
  return { savingsPerMonth, finalValue };
}

/** 목표 월 불로소득을 역산해 필요 투자금 및 추천 포트폴리오를 계산하는 컴포넌트 */
export default function PassiveIncomeCalculator() {
  const [targetMonthly, setTargetMonthly] = useState(500_000);
  const [yieldPercent, setYieldPercent] = useState(4);
  const [portfolioType, setPortfolioType] = useState<PortfolioType>('dividend');

  const result = usePassiveIncome({
    targetMonthlyIncome: targetMonthly,
    annualYieldPercent: yieldPercent,
    portfolioType,
  });

  /* 필요 투자금 단위 변환 */
  const requiredMan = Math.round(result.requiredInvestment / 10_000);
  const requiredEok = (result.requiredInvestment / 100_000_000).toFixed(1);

  /* 10년/20년/30년 복리 달성 경로 */
  const paths = [10, 20, 30].map((years) => ({
    years,
    ...calcCompoundPath(result.requiredInvestment, years, yieldPercent),
  }));

  return (
    <div className="space-y-6">
      {/* ── 입력 영역 ── */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-5 space-y-5">
        {/* 목표 월 불로소득 슬라이더 */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            목표 월 불로소득
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={100_000}
              max={5_000_000}
              step={100_000}
              value={targetMonthly}
              onChange={(e) => setTargetMonthly(Number(e.target.value))}
              className="flex-1 accent-teal-500"
            />
            <span className="text-lg font-bold text-teal-600 dark:text-teal-400 w-32 text-right">
              {formatKRW(targetMonthly)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-500 mt-1">
            <span>10만원</span>
            <span>500만원</span>
          </div>
        </div>

        {/* 연 수익률 선택 버튼 */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            예상 연 배당수익률
          </label>
          <div className="flex gap-2">
            {YIELD_OPTIONS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYieldPercent(y)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  yieldPercent === y
                    ? 'bg-teal-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {y}%
              </button>
            ))}
          </div>
        </div>

        {/* 투자 성향 필터 */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            투자 성향
          </label>
          <PortfolioTypeFilter selected={portfolioType} onSelect={setPortfolioType} />
        </div>
      </div>

      {/* ── 결과 영역 ── */}
      <div className="rounded-xl border border-teal-300 dark:border-teal-700/50 bg-teal-50 dark:bg-teal-900/20 p-5 space-y-4">
        {/* 필요 투자금 */}
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">필요 투자금</p>
          <p className="text-3xl font-bold text-teal-700 dark:text-teal-300">
            {requiredMan.toLocaleString('ko-KR')}만원
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">≈ {requiredEok}억원</p>
        </div>

        {/* 복리 달성 경로 */}
        <div>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">달성 경로 시뮬레이션</p>
          <div className="space-y-2.5">
            {paths.map(({ years, savingsPerMonth }) => {
              /* 최대 월 저축액 대비 상대적 bar 길이 계산 */
              const maxSavings = paths[0].savingsPerMonth; // 10년이 가장 큼
              const barWidth = Math.min(100, (savingsPerMonth / maxSavings) * 100);

              return (
                <div key={years} className="bg-white dark:bg-zinc-900/50 rounded-lg px-3 py-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{years}년 플랜</span>
                    <span className="text-sm font-bold text-teal-700 dark:text-teal-300">
                      월 {Math.round(savingsPerMonth / 10_000).toLocaleString('ko-KR')}만원
                    </span>
                  </div>
                  {/* 진행 바 */}
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    연 {yieldPercent}% 복리 재투자 가정
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 추천 포트폴리오 구성 목록 */}
        <div>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">추천 포트폴리오 구성</p>
          <div className="space-y-2">
            {result.recommendedPortfolio.map((item) => (
              <div
                key={item.ticker}
                className="flex items-center justify-between bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-transparent rounded-lg px-3 py-2"
              >
                <div>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item.name}</span>
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">{item.ticker}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-amber-600 dark:text-amber-400">배당 {item.expectedYield}%</span>
                  <span className="text-teal-700 dark:text-teal-400 font-bold">{item.weight}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 반디 멘트 말풍선 */}
        <div className="rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-3">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">반디의 한마디</p>
          <p className="text-sm text-zinc-700 dark:text-zinc-200">{result.bandiComment}</p>
        </div>

        {/* AI 뱃지 + 출처 */}
        <div className="flex items-center justify-between">
          <AiBadge label="AI 분석" variant="info" source={result.sourceUrl} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">수치는 참고용 Mock 데이터입니다</p>
        </div>
      </div>
    </div>
  );
}
