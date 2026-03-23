"""
Upstash Redis 클라이언트 초기화 모듈
REST API 기반 Redis 싱글톤 제공
"""
from upstash_redis import Redis

from app.core.config import settings

# Redis 싱글톤 인스턴스
redis_client: Redis | None = None


def get_redis_client() -> Redis | None:
    """
    Upstash Redis 클라이언트 반환
    URL 또는 토큰이 미설정된 경우 None 반환 (graceful fallback)
    """
    global redis_client

    # 이미 초기화된 경우 캐싱된 인스턴스 반환
    if redis_client is not None:
        return redis_client

    # 환경변수 미설정 시 None 반환 (앱 기동 중단 방지)
    if not settings.upstash_redis_rest_url or not settings.upstash_redis_rest_token:
        return None

    try:
        redis_client = Redis(
            url=settings.upstash_redis_rest_url,
            token=settings.upstash_redis_rest_token,
        )
        return redis_client
    except Exception:
        # 연결 실패 시 None 반환
        return None


# 모듈 로드 시 싱글톤 초기화 시도
redis_client = get_redis_client()
