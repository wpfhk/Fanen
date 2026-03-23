"""
Supabase 서비스 클라이언트 초기화 모듈
service_role 권한 싱글톤 제공 (금융 개인정보 처리 전용)
"""
from supabase import Client, create_client

from app.core.config import settings

# Supabase 싱글톤 인스턴스
supabase_client: Client | None = None


def get_supabase_client() -> Client | None:
    """
    Supabase service_role 클라이언트 반환
    URL 또는 키가 미설정된 경우 None 반환 (graceful fallback)
    과거 커밋에서 환경변수 미설정 시 크래시 이슈가 있었으므로 방어 코드 포함
    """
    global supabase_client

    # 이미 초기화된 경우 캐싱된 인스턴스 반환
    if supabase_client is not None:
        return supabase_client

    # 환경변수 미설정 시 None 반환 (앱 기동 중단 방지)
    if not settings.supabase_url or not settings.supabase_service_role_key:
        return None

    try:
        supabase_client = create_client(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_service_role_key,
        )
        return supabase_client
    except Exception:
        # 초기화 실패 시 None 반환
        return None


# 모듈 로드 시 싱글톤 초기화 시도
supabase_client = get_supabase_client()
