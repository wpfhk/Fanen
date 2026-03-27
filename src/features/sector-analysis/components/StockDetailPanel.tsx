'use client';

import type { ValueChainNode } from '../types';
import { SignalBadge } from './SignalBadge';
import { getMockStockDetail } from '../mock/mockStockDetail';

/* ── SVG 스파크라인 ── */

interface SparklineProps {
  data: { year: number; value: number }[];
  width?: number;
  height?: number;
  color?: string;
}

function Sparkline({ data, width = 120, height = 36, color = '#3B82F6' }: SparklineProps) {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + (1 - (d.value - min) / range) * h;
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const lastPt = points[points.length - 1].split(',');
  const lastX = parseFloat(lastPt[0]);
  const lastY = parseFloat(lastPt[1]);

  /* 면적 채우기용 polygon */
  const fill = [
    `${pad},${pad + h}`,
    ...points,
    `${pad + w},${pad + h}`,
  ].join(' ');

  return (
    <svg width={width} height={height} aria-hidden="true">
      <polygon points={fill} fill={color} fillOpacity={0.08} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
}

/* ── 재무 지표 행 ── */

interface FinancialMetricsProps {
  per?: number;
  pbr?: number;
  roe?: number;
  revenueTrend?: { year: number; value: number }[];
}

function FinancialMetrics({ per, pbr, roe, revenueTrend }: FinancialMetricsProps) {
  const metrics = [
    { label: 'PER', value: per, unit: '배' },
    { label: 'PBR', value: pbr, unit: '배' },
    { label: 'ROE', value: roe, unit: '%' },
  ].filter((m) => m.value !== undefined);

  if (metrics.length === 0 && !revenueTrend?.length) return null;

  return (
    <div className="rounded-card bg-zinc-50 dark:bg-zinc-800/50 px-3 py-3 space-y-2.5">
      <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        재무 지표
      </p>

      {/* PER / PBR / ROE */}
      {metrics.length > 0 && (
        <div className="flex gap-4">
          {metrics.map(({ label, value, unit }) => (
            <div key={label} className="flex-1 text-center">
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{label}</p>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {value!.toFixed(1)}
                <span className="text-[10px] font-normal text-zinc-400 ml-0.5">{unit}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 매출 스파크라인 */}
      {revenueTrend && revenueTrend.length >= 2 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">매출 추이 (조원)</p>
            <p className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
              {revenueTrend[revenueTrend.length - 1].value.toFixed(1)}조
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkline data={revenueTrend} width={120} height={32} color="#3B82F6" />
            <div className="flex flex-col gap-0.5">
              {[revenueTrend[0], revenueTrend[revenueTrend.length - 1]].map((d) => (
                <p key={d.year} className="text-[9px] text-zinc-400 dark:text-zinc-500">
                  {d.year}: {d.value.toFixed(1)}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TIER_LABEL: Record<number, string> = {
  0: 'Tier 0',
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
};

const TIER_RELATION: Record<number, string> = {
  0: '메이저',
  1: '직접 납품',
  2: '부품/소재',
  3: '간접 수혜',
};

interface StockDetailPanelProps {
  node: ValueChainNode | null;
  onClose: () => void;
}

/** LoadingSkeleton — Phase A */
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
      <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" />
      <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4" />
      <div className="h-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
    </div>
  );
}

/** EmptyState — 종목 미선택 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4">
      <span className="text-3xl mb-3">🔍</span>
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">종목을 선택하세요</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
        그래프에서 종목 노드를 클릭하면 상세 정보를 확인할 수 있습니다
      </p>
    </div>
  );
}

/** CrowdSentimentWarning — 개미 반응도 높음 경고 */
function CrowdSentimentWarning() {
  return (
    <div className="flex items-start gap-2 rounded-card bg-crowd-warning-bg border border-crowd-warning-border px-3 py-2.5 mb-3">
      <span className="text-base flex-shrink-0">⚠️</span>
      <div>
        <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
          개미 반응도 높음 — 주의
        </p>
        <p className="text-[11px] text-orange-600/80 dark:text-orange-400/70 mt-0.5 leading-relaxed">
          개인 투자자 반응이 집중되는 구간입니다. 뒤늦은 진입은 손실 위험이 높습니다.
        </p>
      </div>
    </div>
  );
}

/**
 * StockDetailPanel — 종목 상세 패널
 *
 * Phase A: Header + Signal + Overview + CrowdWarning + Evidence
 * Phase B: FinancialMetrics (PER/PBR/ROE) + Revenue Sparkline
 */
export function StockDetailPanel({ node, onClose }: StockDetailPanelProps) {
  if (!node) return <EmptyState />;

  // mock 데이터에서 상세 정보 조회 (없으면 node 기본값 사용)
  const detail = getMockStockDetail(node.ticker);
  const crowdLevel = detail?.crowdSentimentLevel ?? node.crowdSentimentLevel ?? 0;
  const evidence = detail?.evidence ?? node.evidence ?? [];
  const businessSummary = detail?.businessSummary ?? node.description;
  const per = detail?.per ?? node.per;
  const pbr = detail?.pbr ?? node.pbr;
  const roe = detail?.roe ?? node.roe;
  const revenueTrend = detail?.revenueTrend ?? node.revenueTrend;

  return (
    <div className="h-full overflow-y-auto">
      {/* 헤더 */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex-1 min-w-0">
          {/* Tier 뱃지 + 관계 */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              {TIER_LABEL[node.tier]}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
              {node.relationship || TIER_RELATION[node.tier]}
            </span>
          </div>
          {/* 기업명 */}
          <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 truncate">
            {node.name}
          </p>
          {/* 티커 */}
          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">
            {node.ticker}
          </p>
        </div>

        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 ml-2 w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="패널 닫기"
        >
          ✕
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Signal 뱃지 + 배당 */}
        <div className="flex items-center gap-2">
          <SignalBadge signal={node.signal} size="md" />
          {node.dividendYield !== undefined && node.dividendYield > 0 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              배당 {node.dividendYield.toFixed(1)}%
            </span>
          )}
        </div>

        {/* 군중심리 경고 (level >= 2) */}
        {crowdLevel >= 2 && <CrowdSentimentWarning />}

        {/* 기업 개요 */}
        <div className="rounded-card bg-zinc-50 dark:bg-zinc-800/50 px-3 py-3">
          <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1.5">
            기업 개요
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {businessSummary}
          </p>
        </div>

        {/* 근거 목록 */}
        {evidence.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
              수혜 근거
            </p>
            <ul className="space-y-1.5">
              {evidence.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 재무 지표 + 스파크라인 — Phase B */}
        <FinancialMetrics per={per} pbr={pbr} roe={roe} revenueTrend={revenueTrend} />

        {/* 출처 */}
        <a
          href={node.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 transition-colors"
        >
          <span>📄</span>
          KRX/DART 공시 원문 보기
        </a>
      </div>
    </div>
  );
}

export { LoadingSkeleton as StockDetailPanelSkeleton };
