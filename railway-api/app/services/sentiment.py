"""
Gemini 기반 금융 감성 분석 서비스
FinBERT 모델 대신 Gemini API를 사용하여 Railway 메모리 위험 회피
"""
import json
import logging

from app.core.gemini import generate_text

logger = logging.getLogger(__name__)

# 감성 분석 기본값 (Gemini 미설정 또는 파싱 실패 시)
DEFAULT_SENTIMENT = {"label": "neutral", "score": 0.5}

# Gemini 감성 분석 프롬프트 (금융 전문가 역할 부여)
SENTIMENT_PROMPT_TEMPLATE = """당신은 한국 주식시장 전문 금융 애널리스트입니다.
주어진 금융 뉴스 헤드라인의 시장 감성을 분석하여 반드시 아래 JSON 형식으로만 응답하세요.

응답 형식:
{{"label": "positive" | "negative" | "neutral", "score": 0.0~1.0}}

규칙:
- label: positive(긍정), negative(부정), neutral(중립) 중 하나
- score: 해당 감성의 신뢰도 (0.0~1.0, 소수점 2자리)
- 반드시 JSON만 응답, 다른 텍스트 포함 금지

분석할 텍스트:
{text}"""


def analyze_sentiment(text: str) -> dict:
    """
    금융 뉴스 텍스트 감성 분석 (Gemini API 기반)

    Args:
        text: 분석할 뉴스 헤드라인 또는 텍스트

    Returns:
        {'label': 'positive'|'negative'|'neutral', 'score': 0.0~1.0}
    """
    prompt = SENTIMENT_PROMPT_TEMPLATE.format(text=text)
    raw_text = generate_text(prompt)

    if raw_text is None:
        logger.warning("Gemini 감성 분석 실패 — 기본값 반환")
        return DEFAULT_SENTIMENT

    try:
        result = json.loads(raw_text.strip())
        label = result.get("label", "neutral")
        if label not in ("positive", "negative", "neutral"):
            label = "neutral"
        score = float(result.get("score", 0.5))
        score = max(0.0, min(1.0, score))
        return {"label": label, "score": score}
    except Exception as e:
        logger.warning("감성 분석 JSON 파싱 실패: %s — 원문: %.100s", e, raw_text)
        return DEFAULT_SENTIMENT
