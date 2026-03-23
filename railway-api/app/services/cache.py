"""
Redis 기반 JSON 캐시 서비스
Upstash Redis REST API를 통한 캐시 읽기/쓰기 유틸리티
"""
import json
import logging

from app.core.redis import get_redis_client

logger = logging.getLogger(__name__)

# 캐시 키 prefix
CACHE_KEY_PREFIX = "fanen:"


def get_cached(key: str) -> dict | None:
    """
    Redis 캐시에서 JSON 데이터 조회
    Redis 미설정 또는 연결 실패 시 None 반환 (서비스 중단 방지)

    Args:
        key: 캐시 키 (prefix 'fanen:'가 자동으로 붙음)

    Returns:
        캐시된 dict 또는 None (미스/오류)
    """
    client = get_redis_client()
    if client is None:
        return None

    try:
        # 캐시 키에 prefix 적용
        full_key = f"{CACHE_KEY_PREFIX}{key}"
        raw = client.get(full_key)
        if raw is None:
            return None
        # JSON 역직렬화
        return json.loads(raw)  # type: ignore[arg-type]
    except Exception as e:
        logger.warning("캐시 조회 실패 (key=%s): %s", key, e)
        return None


def set_cached(key: str, value: dict, ttl: int = 3600) -> bool:
    """
    Redis 캐시에 JSON 데이터 저장
    Redis 미설정 또는 연결 실패 시 False 반환 (서비스 중단 방지)

    Args:
        key: 캐시 키 (prefix 'fanen:'가 자동으로 붙음)
        value: 저장할 dict 데이터
        ttl: 캐시 만료 시간 (초, 기본 1시간)

    Returns:
        저장 성공 여부
    """
    client = get_redis_client()
    if client is None:
        return False

    try:
        # 캐시 키에 prefix 적용
        full_key = f"{CACHE_KEY_PREFIX}{key}"
        # JSON 직렬화 후 TTL과 함께 저장
        client.setex(full_key, ttl, json.dumps(value, ensure_ascii=False))
        return True
    except Exception as e:
        logger.warning("캐시 저장 실패 (key=%s): %s", key, e)
        return False
