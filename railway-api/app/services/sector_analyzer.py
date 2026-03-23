"""
섹터 인과관계 분석 서비스
Gemini API로 이벤트의 섹터 간 인과관계를 분석하고 Supabase에 저장
"""
import hashlib
import json
import logging

from app.core.gemini import generate_text
from app.core.supabase import get_supabase_client
from app.models.sector import SectorCausalEdge
from app.services.cache import get_cached, set_cached

logger = logging.getLogger(__name__)

# 한국 주식시장 주요 섹터 목록 (target_sectors 미지정 시 기본값)
DEFAULT_SECTORS = [
    "반도체", "IT", "자동차", "배터리", "바이오", "금융", "에너지",
    "화학", "철강", "건설", "소비재", "통신", "항공", "해운",
]

# 섹터 인과관계 분석 프롬프트
SECTOR_CAUSAL_SYSTEM_PROMPT = """당신은 한국 주식시장 전문 투자 애널리스트입니다.
주어진 시장 이벤트가 각 섹터에 미치는 인과관계를 분석하여 반드시 아래 JSON 배열 형식으로만 응답하세요.

응답 형식:
[
  {{
    "from_sector": "원인 섹터",
    "to_sector": "결과 섹터",
    "causal_strength": -1.0 ~ 1.0,
    "description": "인과관계 설명 (1~2문장)"
  }}
]

규칙:
- from_sector: 이벤트가 직접 영향을 주는 섹터
- to_sector: 간접적으로 영향받는 섹터
- causal_strength: 양수=긍정적 영향, 음수=부정적 영향, 크기=영향 강도
- 분석 대상 섹터: {sectors}
- 반드시 JSON 배열만 응답, 다른 텍스트 포함 금지"""


def _make_cache_key(event_description: str) -> str:
    """이벤트 설명 해시를 이용한 캐시 키 생성"""
    event_hash = hashlib.md5(event_description.encode("utf-8")).hexdigest()[:16]
    return f"sector:{event_hash}"


async def analyze_sector_causality(
    event_description: str,
    target_sectors: list[str] | None = None,
) -> list[SectorCausalEdge]:
    """
    이벤트의 섹터 간 인과관계 분석

    1) Redis 캐시 확인
    2) Gemini API로 인과관계 분석
    3) Supabase sector_causal_maps 테이블에 저장
    4) Redis에 캐싱

    Args:
        event_description: 분석할 시장 이벤트 설명
        target_sectors: 분석 대상 섹터 목록 (None이면 Gemini가 자동 판단)

    Returns:
        SectorCausalEdge 목록
    """
    cache_key = _make_cache_key(event_description)

    # 1) Redis 캐시 확인
    cached = get_cached(cache_key)
    if cached:
        logger.info("섹터 인과관계 캐시 히트 (key=%s)", cache_key)
        edges_data: list[dict] = cached.get("edges", [])
        return [SectorCausalEdge(**edge) for edge in edges_data]

    # 분석 대상 섹터 결정
    sectors = target_sectors if target_sectors else DEFAULT_SECTORS
    sectors_str = ", ".join(sectors)

    supabase = get_supabase_client()
    causal_edges: list[SectorCausalEdge] = []

    prompt = (
        SECTOR_CAUSAL_SYSTEM_PROMPT.format(sectors=sectors_str)
        + f"\n\n분석할 이벤트:\n{event_description}"
    )
    raw_text = generate_text(prompt)

    if raw_text is not None:
        try:
            edges_list: list[dict] = json.loads(raw_text.strip())
            for edge_data in edges_list:
                try:
                    strength = float(edge_data.get("causal_strength", 0))
                    edge_data["causal_strength"] = max(-1.0, min(1.0, strength))
                    causal_edges.append(SectorCausalEdge(**edge_data))
                except Exception as edge_err:
                    logger.warning("엣지 파싱 실패: %s", edge_err)
        except Exception as e:
            logger.warning("섹터 인과관계 JSON 파싱 실패 (event=%.50s...): %s — 원문: %.100s", event_description, e, raw_text)
    else:
        logger.warning("Gemini 섹터 분석 실패 — 빈 결과 반환 (event=%.50s...)", event_description)

    # 2) Supabase sector_causal_maps 테이블에 저장
    if supabase is not None and causal_edges:
        try:
            rows = [
                {
                    "from_sector": edge.from_sector,
                    "to_sector": edge.to_sector,
                    "causal_strength": edge.causal_strength,
                    "description": edge.description,
                }
                for edge in causal_edges
            ]
            supabase.table("sector_causal_maps").upsert(rows).execute()
        except Exception as e:
            logger.warning("Supabase 섹터 인과관계 저장 실패: %s", e)

    # 3) Redis 캐싱 (1시간)
    edges_cache_data = {"edges": [edge.model_dump() for edge in causal_edges]}
    set_cached(cache_key, edges_cache_data, ttl=3600)

    return causal_edges
