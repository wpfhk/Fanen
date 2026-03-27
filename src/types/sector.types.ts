/**
 * sector.types.ts — 수혜 섹터 & Tier 0~3 종목 공통 타입
 *
 * Signal 타입 컨벤션:
 *   'buy' | 'wait' | 'watch'  (NOT 'sell')
 *   UI 레이블: buy="매수", wait="관망", watch="매도"
 *
 * Supabase 스키마는 post-sprint에 생성 예정.
 * 현재는 TypeScript 타입만 정의하여 mock 데이터와 컴포넌트 간 계약을 맞춘다.
 */

import type { SignalType, TierLevel } from '@/features/sector-analysis/types';

/** 오늘의 수혜 섹터 */
export interface BeneficiarySector {
  id: string;
  /** 섹터 키: 'defense' | 'semiconductor' | 'battery' */
  sectorKey: string;
  /** 섹터 한글 레이블: '방산' | '반도체' | '2차전지' */
  sectorLabel: string;
  /** 트리거 이벤트 설명 (Morning Brief에 표시) */
  eventTrigger: string;
  /** ISO 8601 날짜 */
  date: string;
  /** 오늘 표시 순위 (낮을수록 상위) */
  rank: number;
  /** Tier 0 종목 수 (Morning Brief 섹터 카드에 표시) */
  tier0Count: number;
  createdAt: string;
}

/** 섹터 종목 상세 (Tier 0~3) — 재무 데이터 포함 */
export interface SectorStock {
  id: string;
  sectorId: string;
  ticker: string;
  name: string;
  tier: TierLevel;
  /** '메이저' | '직접 납품' | '부품/소재' | '간접 수혜' */
  relationship: string;
  description: string;
  signal: SignalType;
  dividendYield?: number;
  /** KRX/DART 출처 URL */
  sourceUrl: string;
  /**
   * 군중 반응도 (개미 반응도가 높으면 경고)
   *   0 = 낮음 (안전)
   *   1 = 보통 (주의)
   *   2 = 높음 (경고 — 개미가 몰리면 오히려 위험)
   */
  crowdSentimentLevel: 0 | 1 | 2;
  /** 근거 목록 (2~3개 bullet) */
  evidence?: string[];
  /* ── 재무 지표 (선택) ── */
  per?: number;
  pbr?: number;
  roe?: number;
  /** 연도별 매출 추이 */
  revenueTrend?: { year: number; value: number }[];
  /** 연도별 영업이익 추이 */
  operatingProfitTrend?: { year: number; value: number }[];
  /** 사업 요약 */
  businessSummary?: string;
  updatedAt: string;
}

/** Morning Brief 섹터 카드 (진입점용 — Supabase ID 없는 간략 타입) */
export interface BriefSector {
  sectorKey: string;
  sectorLabel: string;
  /** 트리거 이벤트 한 줄 요약 */
  trigger: string;
  /** Tier 0 종목 수 */
  tier0Count: number;
  /** 대표 Tier 0 종목명 */
  topTier0Name: string;
  urgency: 'high' | 'medium' | 'low';
}

/** Morning Brief 진입점 데이터 */
export interface MorningBriefData {
  date: string;
  headline: string;
  summary: string;
  /** 반디 표정 mood */
  bandiMood: 'default' | 'happy' | 'thinking' | 'excited' | 'glowing';
  beneficiarySectors: BriefSector[];
}
