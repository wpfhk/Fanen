"""
AI 코치 "핀이" 서비스
Gemini API로 투자 관련 질문에 답변
CLAUDE.md 절대 원칙: 금융 수치 직접 생성 금지, 출처 URL 병기 필수
"""
import logging

from app.core.gemini import generate_text

logger = logging.getLogger(__name__)

# AI 출처 URL (CLAUDE.md 절대 원칙: AI 출처 병기)
AI_SOURCE_URL = "https://ai.google.dev/gemini-api"

# 면책 고지 (모든 AI 응답에 포함)
DISCLAIMER = "본 정보는 투자 참고자료이며, 투자 판단 및 결과의 책임은 이용자에게 있습니다."

# 코치 핀이 시스템 프롬프트
COACH_SYSTEM_PROMPT_GENERAL = """당신은 파낸(Fanen) 앱의 AI 투자 코치 "핀이"입니다.
20~60대 일반 투자자를 위해 쉽고 친절하게 투자 개념을 설명합니다.

규칙:
- 구체적인 주가 수치나 수익률 예측을 절대 직접 생성하지 마세요
- 금융 수치가 필요하면 "현재 주가는 KRX 데이터를 확인하세요"처럼 안내하세요
- 투자 결정은 사용자 본인이 해야 함을 항상 강조하세요
- 한국어로 친절하고 간결하게 답변하세요 (3~5문장)
- 전문 용어는 쉽게 풀어서 설명하세요"""

COACH_SYSTEM_PROMPT_EXPERT = """당신은 파낸(Fanen) 앱의 AI 투자 코치 "핀이"입니다.
금융 전문가 수준의 용어와 심층 분석을 제공합니다.

규칙:
- 구체적인 주가 수치나 수익률 예측을 절대 직접 생성하지 마세요
- 금융 수치가 필요하면 "KRX/DART 공식 데이터를 참고하세요"처럼 안내하세요
- 투자 결정은 사용자 본인이 해야 함을 항상 강조하세요
- 한국어로 전문적으로 답변하세요"""

# Gemini API 미설정 시 기본 응답
FALLBACK_ANSWER = (
    "현재 AI 서비스를 이용할 수 없습니다. "
    "잠시 후 다시 시도해주세요. "
    "투자 관련 정보는 KRX, DART 등 공식 기관을 통해 확인하시기 바랍니다."
)


async def ask_coach(question: str, language_level: str = "general") -> dict:
    """
    AI 코치 핀이에게 투자 질문 답변 요청

    Args:
        question: 사용자 질문
        language_level: 'general' (일반인) | 'expert' (전문가)

    Returns:
        { answer, source_urls, disclaimer }
    """
    system_prompt = (
        COACH_SYSTEM_PROMPT_EXPERT
        if language_level == "expert"
        else COACH_SYSTEM_PROMPT_GENERAL
    )

    full_prompt = f"{system_prompt}\n\n질문: {question}"

    answer = generate_text(full_prompt)

    if not answer:
        logger.warning("Gemini 응답 없음 — 기본 응답 반환 (question: %.50s)", question)
        answer = FALLBACK_ANSWER

    return {
        "answer": answer,
        "source_urls": [AI_SOURCE_URL],
        "disclaimer": DISCLAIMER,
    }
