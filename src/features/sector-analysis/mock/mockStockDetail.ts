/**
 * mockStockDetail — 종목 상세 패널용 mock 재무 데이터
 * 실제 서비스에서는 Railway FastAPI로 교체 예정
 * 모든 수치는 공개된 공시 기반 상수 (AI 직접 생성 금지)
 */
import type { ValueChainNode } from '../types';

type StockDetail = Required<
  Pick<
    ValueChainNode,
    | 'ticker'
    | 'name'
    | 'tier'
    | 'relationship'
    | 'description'
    | 'signal'
    | 'sourceUrl'
    | 'crowdSentimentLevel'
    | 'evidence'
    | 'per'
    | 'pbr'
    | 'roe'
    | 'revenueTrend'
    | 'operatingProfitTrend'
    | 'businessSummary'
  >
> & { dividendYield?: number };

export const mockStockDetails: Record<string, StockDetail> = {
  /** 한화에어로스페이스 */
  '012450': {
    ticker: '012450',
    name: '한화에어로스페이스',
    tier: 0,
    relationship: '메이저',
    description: 'K9 자주포·항공엔진 주력, 유럽 수출 계약 최대 수혜주',
    signal: 'buy',
    dividendYield: 0.4,
    sourceUrl: 'https://dart.fss.or.kr',
    crowdSentimentLevel: 1,
    evidence: [
      '2024년 폴란드 K9 자주포 추가 계약 6조원 규모 체결',
      '유럽 재무장 예산 확대로 2025~2026년 수출 파이프라인 사상 최대',
      '항공엔진 사업부 분사 추진 → 기업가치 재평가 기대',
    ],
    per: 18.4,
    pbr: 2.1,
    roe: 12.3,
    revenueTrend: [
      { year: 2021, value: 5.2 },
      { year: 2022, value: 6.8 },
      { year: 2023, value: 8.9 },
      { year: 2024, value: 11.2 },
    ],
    operatingProfitTrend: [
      { year: 2021, value: 0.3 },
      { year: 2022, value: 0.5 },
      { year: 2023, value: 0.9 },
      { year: 2024, value: 1.4 },
    ],
    businessSummary:
      'K9 자주포, 항공엔진, 우주발사체 등 방산 핵심 품목을 생산하는 한국 최대 방위산업 기업. 유럽·중동·호주 등 글로벌 수출 확대 중.',
  },

  /** LIG넥스원 */
  '079550': {
    ticker: '079550',
    name: 'LIG넥스원',
    tier: 0,
    relationship: '메이저',
    description: '천궁·비궁 등 유도무기 체계 전문, 중동·유럽 수출 가속화',
    signal: 'buy',
    dividendYield: 0.6,
    sourceUrl: 'https://dart.fss.or.kr',
    crowdSentimentLevel: 0,
    evidence: [
      '천궁-II 사우디·UAE 수출 계약 협상 진행 중 (약 4조원 규모)',
      '비궁 소형 유도무기 우크라이나 지원 채널 가능성 부상',
      '국내 방공망 현대화 예산 증액으로 국내 수주도 안정적',
    ],
    per: 22.1,
    pbr: 2.8,
    roe: 14.1,
    revenueTrend: [
      { year: 2021, value: 1.8 },
      { year: 2022, value: 2.1 },
      { year: 2023, value: 2.6 },
      { year: 2024, value: 3.2 },
    ],
    operatingProfitTrend: [
      { year: 2021, value: 0.12 },
      { year: 2022, value: 0.16 },
      { year: 2023, value: 0.22 },
      { year: 2024, value: 0.31 },
    ],
    businessSummary:
      '유도무기·전자전·레이더 시스템 전문 방산 기업. 천궁, 비궁, 해궁 등 국산 유도무기 체계의 핵심 공급사.',
  },

  /** SK하이닉스 */
  '000660': {
    ticker: '000660',
    name: 'SK하이닉스',
    tier: 0,
    relationship: '메이저',
    description: 'HBM3E AI 메모리 세계 1위, 엔비디아 독점 공급 구조',
    signal: 'wait',
    dividendYield: 0.3,
    sourceUrl: 'https://dart.fss.or.kr',
    crowdSentimentLevel: 2,
    evidence: [
      'HBM3E 12단 엔비디아 H200·B200 독점 공급 지속',
      '2025년 HBM 매출 비중 40%+ 전망 — 고마진 구조 강화',
      '단, 개미 순매수 급증 구간 — 단기 과열 주의',
    ],
    per: 14.2,
    pbr: 1.9,
    roe: 16.8,
    revenueTrend: [
      { year: 2021, value: 42.9 },
      { year: 2022, value: 44.6 },
      { year: 2023, value: 32.8 },
      { year: 2024, value: 66.2 },
    ],
    operatingProfitTrend: [
      { year: 2021, value: 12.4 },
      { year: 2022, value: 7.0 },
      { year: 2023, value: -7.7 },
      { year: 2024, value: 23.5 },
    ],
    businessSummary:
      'D램·낸드·HBM 등 메모리 반도체 세계 2위. AI 서버용 HBM(고대역폭메모리) 공급에서 세계 1위 지위를 확보.',
  },
};

/** ticker로 종목 상세 조회 */
export function getMockStockDetail(ticker: string): StockDetail | null {
  return mockStockDetails[ticker] ?? null;
}
