"""
뉴스 분석 요청/응답 Pydantic 모델
"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class NewsHeadlineInput(BaseModel):
    """뉴스 헤드라인 입력 모델"""

    # 뉴스 제목 (필수)
    headline: str
    # 뉴스 출처 (선택)
    source: str | None = None
    # 발행 일시 (선택)
    published_at: datetime | None = None


class NewsAnalyzeRequest(BaseModel):
    """뉴스 분석 요청 모델 — 복수 헤드라인 일괄 분석"""

    # 분석할 뉴스 헤드라인 목록
    headlines: list[NewsHeadlineInput]


class NewsImpactResult(BaseModel):
    """뉴스 임팩트 분석 결과 모델"""

    # 원본 헤드라인
    headline: str
    # 시장 임팩트 점수 (0~100)
    impact_score: float = Field(ge=0, le=100)
    # 감성 레이블 (긍정/부정/중립)
    sentiment: Literal["positive", "negative", "neutral"]
    # 감성 신뢰도 (0~1)
    sentiment_confidence: float = Field(ge=0, le=1)
    # 영향받는 섹터 목록
    affected_sectors: list[str]
    # 영향받는 종목 목록
    affected_stocks: list[str]
    # AI 분석 요약 (출처 포함)
    ai_summary: str
    # AI 분석 출처 URL (CLAUDE.md 절대 원칙: AI 출처 병기)
    source_url: str


class NewsAnalyzeResponse(BaseModel):
    """뉴스 분석 응답 모델"""

    # 각 헤드라인별 분석 결과 목록
    results: list[NewsImpactResult]
    # Redis 캐시 히트 여부
    cached: bool
