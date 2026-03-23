"""
섹터 인과관계 분석 요청/응답 Pydantic 모델
"""
from pydantic import BaseModel, Field


class SectorCausalRequest(BaseModel):
    """섹터 인과관계 분석 요청 모델"""

    # 분석할 시장 이벤트 설명
    event_description: str
    # 분석 대상 섹터 목록 (None이면 Gemini가 자동 판단)
    target_sectors: list[str] | None = None


class SectorCausalEdge(BaseModel):
    """섹터 간 인과관계 엣지 모델"""

    # 원인 섹터
    from_sector: str
    # 결과 섹터
    to_sector: str
    # 인과관계 강도 (-1~1, 음수는 역방향 영향)
    causal_strength: float = Field(ge=-1, le=1)
    # 인과관계 설명
    description: str


class SectorCausalResponse(BaseModel):
    """섹터 인과관계 분석 응답 모델"""

    # 섹터 인과관계 맵 (엣지 목록)
    causal_map: list[SectorCausalEdge]
    # 분석에 사용된 이벤트 설명
    event_description: str
    # Redis 캐시 히트 여부
    cached: bool
