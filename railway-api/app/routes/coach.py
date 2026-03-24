"""
AI 코치 "핀이" 라우터
POST /api/coach/ask — JWT 인증 필수 (보호 엔드포인트)
"""
import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.services.coach_service import ask_coach

logger = logging.getLogger(__name__)

# 코치 라우터 — JWT 인증 필수
router = APIRouter(prefix="/api/coach", tags=["coach"])


class CoachAskRequest(BaseModel):
    """AI 코치 질문 요청 모델"""
    question: str
    language_level: str = "general"  # 'general' | 'expert'


class CoachAskResponse(BaseModel):
    """AI 코치 답변 응답 모델"""
    answer: str
    source_urls: list[str]
    disclaimer: str


@router.post("/ask", response_model=CoachAskResponse)
async def ask(
    request: CoachAskRequest,
    current_user: dict = Depends(get_current_user),
) -> CoachAskResponse:
    """
    AI 코치 핀이에게 투자 관련 질문을 합니다.

    - JWT 인증 필수 (Authorization: Bearer <token>)
    - 금융 수치 직접 생성 금지 (CLAUDE.md 절대 원칙)
    - AI 응답에 출처 URL 및 면책 고지 포함
    """
    if not request.question.strip():
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="질문을 입력해주세요.")

    result = await ask_coach(
        question=request.question.strip(),
        language_level=request.language_level,
    )

    logger.info(
        "AI 코치 답변 완료 — 사용자: %s",
        current_user.get("sub", "unknown"),
    )

    return CoachAskResponse(**result)
