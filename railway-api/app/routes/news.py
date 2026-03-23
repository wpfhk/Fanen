"""
뉴스 임팩트 분석 라우터
POST /api/news/analyze — JWT 인증 필수 (보호 엔드포인트)
"""
import logging

from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.models.news import NewsAnalyzeRequest, NewsAnalyzeResponse
from app.services.news_analyzer import analyze_news_impact

logger = logging.getLogger(__name__)

# 뉴스 라우터 — health.py 패턴 따름
router = APIRouter(prefix="/api/news", tags=["news"])


@router.post("/analyze", response_model=NewsAnalyzeResponse)
async def analyze_news(
    request: NewsAnalyzeRequest,
    current_user: dict = Depends(get_current_user),
) -> NewsAnalyzeResponse:
    """
    뉴스 헤드라인 배열을 받아 시장 임팩트를 분석합니다.

    - JWT 인증 필수 (Authorization: Bearer <token>)
    - 각 헤드라인에 대해 임팩트 스코어, 감성, 영향 섹터/종목 분석
    - Redis 캐시 지원 (동일 헤드라인 재요청 시 cached: true 반환)
    """
    results = []

    for headline_input in request.headlines:
        result = await analyze_news_impact(
            headline=headline_input.headline,
            source=headline_input.source,
        )
        results.append(result)

    cached_flag = len(results) == 0

    logger.info(
        "뉴스 분석 완료 — 사용자: %s, 헤드라인 수: %d",
        current_user.get("sub", "unknown"),
        len(results),
    )

    return NewsAnalyzeResponse(results=results, cached=cached_flag)
