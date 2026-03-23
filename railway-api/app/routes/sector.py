"""
섹터 인과관계 분석 라우터
POST /api/sector/causal — JWT 인증 필수 (보호 엔드포인트)
"""
import logging

from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.models.sector import SectorCausalRequest, SectorCausalResponse
from app.services.sector_analyzer import analyze_sector_causality

logger = logging.getLogger(__name__)

# 섹터 라우터 — health.py 패턴 따름
router = APIRouter(prefix="/api/sector", tags=["sector"])


@router.post("/causal", response_model=SectorCausalResponse)
async def get_sector_causal_map(
    request: SectorCausalRequest,
    current_user: dict = Depends(get_current_user),
) -> SectorCausalResponse:
    """
    시장 이벤트에 대한 섹터 인과관계 맵을 반환합니다.

    - JWT 인증 필수 (Authorization: Bearer <token>)
    - 이벤트 설명을 받아 섹터 간 인과관계 분석 (Gemini API)
    - Redis 캐시 지원 (동일 이벤트 재요청 시 cached: true 반환)
    """
    # 캐시 히트 여부 확인을 위해 서비스 호출 전 캐시 키 직접 확인
    from app.services.cache import get_cached
    import hashlib

    event_hash = hashlib.md5(request.event_description.encode("utf-8")).hexdigest()[:16]
    cache_key = f"sector:{event_hash}"
    cached_data = get_cached(cache_key)
    is_cached = cached_data is not None

    # 섹터 인과관계 분석 실행
    causal_edges = await analyze_sector_causality(
        event_description=request.event_description,
        target_sectors=request.target_sectors,
    )

    logger.info(
        "섹터 인과관계 분석 완료 — 사용자: %s, 이벤트: %.50s..., 엣지 수: %d",
        current_user.get("sub", "unknown"),
        request.event_description,
        len(causal_edges),
    )

    return SectorCausalResponse(
        causal_map=causal_edges,
        event_description=request.event_description,
        cached=is_cached,
    )
