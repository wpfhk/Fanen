"""
Google Gemini API 클라이언트 초기화 모듈
google-generativeai 패키지 사용 (import google.generativeai as genai)
"""
import logging

import google.generativeai as genai

from app.core.config import settings

logger = logging.getLogger(__name__)

# Gemini 모델 싱글톤
_gemini_model: genai.GenerativeModel | None = None


def _init_model() -> "genai.GenerativeModel | None":
    """모델 초기화 — API 키 미설정 또는 오류 시 None 반환"""
    if not settings.gemini_api_key:
        logger.warning("GEMINI_API_KEY 미설정 — Gemini 비활성화")
        return None
    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-3.1-flash-lite-preview")
        logger.info("Gemini 모델 초기화 성공")
        return model
    except Exception as e:
        logger.error("Gemini 모델 초기화 실패: %s", e)
        return None


def generate_text(prompt: str) -> str | None:
    """
    Gemini API로 텍스트 생성
    실패 시 None 반환 (graceful fallback)
    """
    global _gemini_model
    if _gemini_model is None:
        _gemini_model = _init_model()
    if _gemini_model is None:
        return None
    try:
        response = _gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error("Gemini generate_content 실패: %s", e)
        return None


# 모듈 로드 시 초기화
_gemini_model = _init_model()
