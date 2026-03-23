"""
뉴스 임팩트 분석 서비스
Gemini API로 뉴스 헤드라인의 시장 임팩트를 분석하고 Supabase에 저장
CLAUDE.md 절대 원칙: AI 생성 텍스트에 출처 URL 병기 필수
"""
import hashlib
import json
import logging

from app.core.gemini import generate_text
from app.core.supabase import get_supabase_client
from app.models.news import NewsImpactResult
from app.services.cache import get_cached, set_cached
from app.services.sentiment import analyze_sentiment

logger = logging.getLogger(__name__)

# AI 분석 출처 URL (CLAUDE.md 절대 원칙: AI 출처 병기)
AI_SOURCE_URL = "https://ai.google.dev/gemini-api"

# 뉴스 임팩트 분석 프롬프트
NEWS_IMPACT_SYSTEM_PROMPT = """당신은 한국 주식시장 전문 투자 애널리스트입니다.
주어진 뉴스 헤드라인을 분석하여 시장 임팩트를 반드시 아래 JSON 형식으로만 응답하세요.

응답 형식:
{
  "affected_sectors": ["섹터1", "섹터2"],
  "affected_stocks": ["종목명1", "종목명2"],
  "impact_level": 0 ~ 100,
  "ai_summary": "분석 요약 (2~3문장)"
}

규칙:
- affected_sectors: 영향받는 한국 주식시장 섹터 (반도체, IT, 자동차, 바이오, 금융, 에너지 등)
- affected_stocks: 실제 한국 상장 기업명 (주가 수치 직접 생성 금지)
- impact_level: 시장 임팩트 강도 (0=영향없음, 100=매우 강함)
- ai_summary: 투자 참고용 분석 요약 (수치 예측 금지)
- 반드시 JSON만 응답, 다른 텍스트 포함 금지"""


def _make_cache_key(headline: str) -> str:
    """헤드라인 해시를 이용한 캐시 키 생성"""
    headline_hash = hashlib.md5(headline.encode("utf-8")).hexdigest()[:16]
    return f"news:{headline_hash}"


def _combine_impact_score(impact_level: float, sentiment_score: float, sentiment_label: str) -> float:
    """
    Gemini 임팩트 레벨과 감성 점수를 결합하여 최종 임팩트 스코어 산출

    Args:
        impact_level: Gemini 분석 임팩트 레벨 (0~100)
        sentiment_score: 감성 신뢰도 (0~1)
        sentiment_label: 감성 레이블

    Returns:
        최종 임팩트 스코어 (0~100)
    """
    # 부정적 감성은 임팩트 스코어를 상향 조정 (위험 강조)
    sentiment_multiplier = 1.0
    if sentiment_label == "negative":
        sentiment_multiplier = 1.0 + (sentiment_score * 0.3)
    elif sentiment_label == "positive":
        sentiment_multiplier = 1.0 + (sentiment_score * 0.1)

    score = impact_level * sentiment_multiplier
    return round(min(100.0, max(0.0, score)), 2)


async def analyze_news_impact(
    headline: str,
    source: str | None = None,
) -> NewsImpactResult:
    """
    뉴스 헤드라인 시장 임팩트 분석

    1) Redis 캐시 확인
    2) Gemini API로 임팩트 분석
    3) 감성 분석 (sentiment.py)
    4) 최종 스코어 산출
    5) Supabase news_impacts 테이블에 저장
    6) Redis에 캐싱

    Args:
        headline: 분석할 뉴스 헤드라인
        source: 뉴스 출처 URL (선택)

    Returns:
        NewsImpactResult 모델
    """
    cache_key = _make_cache_key(headline)

    # 1) Redis 캐시 확인
    cached = get_cached(cache_key)
    if cached:
        logger.info("캐시 히트 (key=%s)", cache_key)
        return NewsImpactResult(**cached)

    supabase = get_supabase_client()

    # Gemini 기본값 (API 실패 시)
    affected_sectors: list[str] = []
    affected_stocks: list[str] = []
    impact_level = 50.0
    ai_summary_text = "AI 분석 서비스를 일시적으로 사용할 수 없습니다."

    prompt = f"{NEWS_IMPACT_SYSTEM_PROMPT}\n\n분석할 헤드라인:\n{headline}"
    raw_text = generate_text(prompt)

    if raw_text is not None:
        try:
            gemini_result = json.loads(raw_text.strip())
            affected_sectors = gemini_result.get("affected_sectors", [])
            affected_stocks = gemini_result.get("affected_stocks", [])
            impact_level = float(gemini_result.get("impact_level", 50))
            ai_summary_text = gemini_result.get("ai_summary", "")
        except Exception as e:
            logger.warning("뉴스 임팩트 JSON 파싱 실패 (headline=%.50s...): %s — 원문: %.100s", headline, e, raw_text)
    else:
        logger.warning("Gemini 뉴스 분석 실패 — fallback 기본값 사용 (headline=%.50s...)", headline)

    # 2) 감성 분석 (Gemini 기반)
    sentiment_result = analyze_sentiment(headline)
    sentiment_label: str = sentiment_result["label"]
    sentiment_score: float = sentiment_result["score"]

    # 3) 최종 임팩트 스코어 산출
    final_impact_score = _combine_impact_score(impact_level, sentiment_score, sentiment_label)

    # 4) AI 분석 요약에 출처 URL 병기 (CLAUDE.md 절대 원칙)
    ai_summary_with_source = f"[AI 분석] {ai_summary_text} 출처: {AI_SOURCE_URL}"

    # 5) Supabase news_impacts 테이블에 저장
    if supabase is not None:
        try:
            supabase.table("news_impacts").insert({
                "headline": headline,
                "source": source,
                "impact_score": final_impact_score,
                "affected_sectors": affected_sectors,
                "affected_stocks": affected_stocks,
                "ai_summary": ai_summary_with_source,
            }).execute()
        except Exception as e:
            logger.warning("Supabase 저장 실패: %s", e)

    # NewsImpactResult 객체 생성
    result = NewsImpactResult(
        headline=headline,
        impact_score=final_impact_score,
        sentiment=sentiment_label,  # type: ignore[arg-type]
        sentiment_confidence=sentiment_score,
        affected_sectors=affected_sectors,
        affected_stocks=affected_stocks,
        ai_summary=ai_summary_with_source,
        source_url=AI_SOURCE_URL,
    )

    # 6) Redis 캐싱 (1시간)
    set_cached(cache_key, result.model_dump(), ttl=3600)

    return result
