/** 밸류체인 티어 레벨 — 0=메이저, 1=직접납품, 2=부품소재, 3=간접수혜 */
export type TierLevel = 0 | 1 | 2 | 3;

/** 반디 매매 시그널 */
export type SignalType = 'buy' | 'wait' | 'watch';

/** 밸류체인 노드 (개별 종목) */
export interface ValueChainNode {
  ticker: string;
  name: string;
  /** 0=메이저, 1=직접납품, 2=부품/소재, 3=간접수혜 */
  tier: TierLevel;
  /** 관계 설명: "직접 납품" | "부품/소재" | "간접 수혜" | "메이저" */
  relationship: string;
  /** 시가배당률 (%) — 선택값 */
  dividendYield?: number;
  /** 반디 한줄 설명 */
  description: string;
  signal: SignalType;
  /** KRX/DART 출처 URL — 필수, 빈 문자열 불가 */
  sourceUrl: string;
}

/** 밸류체인 섹터 전체 데이터 */
export interface ValueChain {
  /** 섹터 키: "defense" | "semiconductor" | "battery" */
  sector: string;
  /** 섹터 한글 레이블: "방산" | "반도체" | "2차전지" */
  sectorLabel: string;
  /** 트리거 이벤트 설명 */
  eventTrigger: string;
  nodes: ValueChainNode[];
  /** ISO 8601 업데이트 시각 */
  updatedAt: string;
}
