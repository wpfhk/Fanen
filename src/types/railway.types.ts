/**
 * Railway FastAPI 서버 요청/응답 타입 정의
 * Python Pydantic 모델(models/news.py, models/sector.py)과 1:1 대응
 */

// ─── 뉴스 분석 관련 타입 ───────────────────────────────────────────────────

/** 뉴스 헤드라인 입력 */
export interface NewsHeadlineInput {
  /** 뉴스 제목 (필수) */
  headline: string;
  /** 뉴스 출처 (선택) */
  source?: string | null;
  /** 발행 일시 ISO 8601 문자열 (선택) */
  published_at?: string | null;
}

/** 뉴스 분석 요청 — 복수 헤드라인 일괄 분석 */
export interface NewsAnalyzeRequest {
  /** 분석할 뉴스 헤드라인 목록 */
  headlines: NewsHeadlineInput[];
}

/** 뉴스 임팩트 분석 결과 */
export interface NewsImpactResult {
  /** 원본 헤드라인 */
  headline: string;
  /** 시장 임팩트 점수 (0~100) */
  impact_score: number;
  /** 감성 레이블 */
  sentiment: "positive" | "negative" | "neutral";
  /** 감성 신뢰도 (0~1) */
  sentiment_confidence: number;
  /** 영향받는 섹터 목록 */
  affected_sectors: string[];
  /** 영향받는 종목 목록 */
  affected_stocks: string[];
  /** AI 분석 요약 (출처 URL 포함) */
  ai_summary: string;
  /** AI 분석 출처 URL */
  source_url: string;
}

/** 뉴스 분석 응답 */
export interface NewsAnalyzeResponse {
  /** 각 헤드라인별 분석 결과 목록 */
  results: NewsImpactResult[];
  /** Redis 캐시 히트 여부 */
  cached: boolean;
}

// ─── 섹터 인과관계 분석 관련 타입 ────────────────────────────────────────

/** 섹터 인과관계 분석 요청 */
export interface SectorCausalRequest {
  /** 분석할 시장 이벤트 설명 */
  event_description: string;
  /** 분석 대상 섹터 목록 (null이면 Gemini가 자동 판단) */
  target_sectors?: string[] | null;
}

/** 섹터 간 인과관계 엣지 */
export interface SectorCausalEdge {
  /** 원인 섹터 */
  from_sector: string;
  /** 결과 섹터 */
  to_sector: string;
  /** 인과관계 강도 (-1~1, 음수는 역방향 영향) */
  causal_strength: number;
  /** 인과관계 설명 */
  description: string;
}

/** 섹터 인과관계 분석 응답 */
export interface SectorCausalResponse {
  /** 섹터 인과관계 맵 (엣지 목록) */
  causal_map: SectorCausalEdge[];
  /** 분석에 사용된 이벤트 설명 */
  event_description: string;
  /** Redis 캐시 히트 여부 */
  cached: boolean;
}
