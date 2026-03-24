# 파낸 (Fanen) — 보안 체크리스트

> 마지막 업데이트: 2026-03-24 (v2 보안 검토)
> 작업 시 보안 이슈가 추가/해결되면 이 문서를 업데이트한다.

---

## 현재 보안 상태 요약

| 심각도 | 항목 | 상태 |
|--------|------|------|
| 🔴 심각 | `railway-api/.env` gitignore 누락 | ✅ 2026-03-24 수정 완료 |
| 🔴 심각 | OAuth 콜백 오픈 리다이렉트 취약점 | ✅ 2026-03-24 수정 완료 |
| 🟠 경고 | Rate Limiting 미구현 | ⏳ 프로덕션 배포 전 필요 |
| 🟡 주의 | CRON_SECRET 환경변수 미설정 | ⏳ 배포 전 설정 필요 |
| 🟢 양호 | CORS 설정 (명시적 메서드/헤더) | ✅ 구현 완료 |
| 🟢 양호 | JWT 인증 미들웨어 (Bearer 검증) | ✅ 구현 완료 |
| 🟢 양호 | Supabase RLS (전체 테이블) | ✅ 활성화됨 |
| 🟢 양호 | 금융 민감 데이터 Railway 전용 처리 | ✅ 원칙 준수 |
| 🟢 양호 | Next.js 미들웨어 인증 보호 | ✅ 구현 완료 |
| 🟢 양호 | 환경변수 노출 방지 (.gitignore) | ✅ 확인 완료 |

---

## v2 보안 검토 결과 (2026-03-24)

### 1. Middleware 보안 확인 — src/middleware.ts

**결과: 양호**

- 보호 경로 10개 (`/profile`, `/portfolio`, `/coach`, `/journal`, `/mock-trading`, `/dividend`, `/sector`, `/signal`, `/report`, `/tax`) 모두 미인증 시 `/login` 으로 리다이렉트
- `supabase.auth.getUser()` 로 서버 사이드 세션 검증 (쿠키 기반)
- 인증된 사용자가 Auth 전용 경로(`/login`, `/signup`, `/forgot-password`, `/reset-password`) 접근 시 홈(`/`)으로 리다이렉트
- 로그인 후 원래 경로 복귀를 위한 `next` 파라미터 포함
- 정적 리소스(`_next/static`, 이미지 등) 미들웨어 제외 설정 올바름

### 2. API Routes 확인 — src/app/api/

**결과: 양호 (1건 수정)**

- Vercel API Routes는 `auth/callback` 1개만 존재
- OAuth 콜백만 처리하며, 금융 개인정보 처리 없음 (CLAUDE.md 원칙 준수)
- **수정**: `next` 파라미터에 대한 오픈 리다이렉트 방지 추가 — 상대 경로(`/`로 시작하고 `//`가 아닌 경우)만 허용

### 3. Supabase RLS 확인 — supabase/migrations/

**결과: 양호 (전체 테이블 RLS 활성화)**

| 테이블 | 분류 | RLS | 정책 | 검토 결과 |
|--------|------|-----|------|----------|
| `profiles` | 사용자 데이터 | ✅ | `auth.uid() = id` | ✅ 양호 |
| `portfolios` | 사용자 데이터 | ✅ | `auth.uid() = user_id` (CRUD 분리) | ✅ 양호 |
| `dividend_simulations` | 사용자 데이터 | ✅ | `auth.uid() = user_id` (CRUD 분리) | ✅ 양호 |
| `mock_accounts` | 사용자 데이터 | ✅ | `auth.uid() = user_id` (CRUD 분리) | ✅ 양호 |
| `mock_trades` | 사용자 데이터 | ✅ | `auth.uid() = user_id` (CRUD 분리) | ✅ 양호 |
| `trade_journals` | 사용자 데이터 | ✅ | `auth.uid() = user_id` (CRUD 분리) | ✅ 양호 |
| `coach_history` | 사용자 데이터 | ✅ | `auth.uid() = user_id` (신규 생성) | ✅ 양호 |
| `news_impacts` | 공개 | ✅ | SELECT 공개, CUD는 `service_role` 전용 | ✅ 양호 |
| `sector_causal_maps` | 공개 | ✅ | SELECT 공개, CUD는 `service_role` 전용 | ✅ 양호 |
| `mock_seasons` | 공개 | ✅ | SELECT 공개, CUD는 `service_role` 전용 | ✅ 양호 |
| `mock_rankings` | 공개 | ✅ | SELECT 공개, CUD는 `service_role` 전용 | ✅ 양호 |
| `dividend_calendar` | 공개 | ✅ | SELECT 공개, CUD는 `service_role` 전용 | ✅ 양호 |

### 4. coach_history 마이그레이션 생성

**파일**: `supabase/migrations/20260324000003_create_coach_history.sql`

- `coach_history` 테이블 생성 완료
- RLS 활성화 + `auth.uid() = user_id` 정책 적용
- `user_id` 인덱스 추가

### 5. 환경변수 노출 체크

**결과: 양호**

- `.env.local` — `.gitignore`에 포함 ✅
- `.env.*.local` — `.gitignore`에 포함 ✅
- `railway-api/.env` — `.gitignore`에 포함 ✅, git 추적 안 됨 확인
- `NEXT_PUBLIC_` 접두사 변수 확인:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 URL (공개 정보) ✅
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon 키 (RLS로 보호, 공개 가능) ✅
  - `NEXT_PUBLIC_RAILWAY_API_URL` — Railway API URL (공개 정보) ✅
  - `NEXT_PUBLIC_USE_MOCK` — Mock 모드 플래그 (비민감) ✅
- 민감 정보(`service_role_key`, `jwt_secret`, API 키 등)는 `NEXT_PUBLIC_` 없이 서버 전용 ✅

### 6. CORS 설정 확인 — railway-api/app/main.py

**결과: 양호**

- `allow_origins`: `settings.cors_origins` (환경변수 기반 명시적 목록) ✅
- `allow_methods`: `["GET", "POST", "PUT", "DELETE", "OPTIONS"]` (와일드카드 아님) ✅
- `allow_headers`: `["Content-Type", "Authorization"]` (명시적) ✅
- `allow_credentials`: `True` (쿠키/인증 헤더 전달 허용) ✅
- 이전 보안 리뷰에서 지적된 와일드카드 문제 해결 확인

### 7. Railway API 인증 확인

**결과: 양호**

| 엔드포인트 | 인증 방식 | 비고 |
|-----------|----------|------|
| `/api/health` | 없음 | 헬스체크 (정상) |
| `/api/news/analyze` | JWT (`get_current_user`) | ✅ |
| `/api/sector/causal-map` | JWT (`get_current_user`) | ✅ |
| `/api/coach/*` | JWT (`get_current_user`) | ✅ |
| `/api/krx/*` | 없음 | 공개 시장 데이터 (정상) |
| `/api/dart/*` | 없음 | 공개 공시 데이터 (정상) |
| `/api/cron/*` | `X-Cron-Secret` 헤더 | ✅ (cron_secret 미설정 시 403 반환) |

---

## 프로덕션 배포 전 필수 체크리스트

### 1. Rate Limiting 미들웨어 추가
**파일**: `railway-api/app/main.py` (또는 별도 미들웨어 파일)

Railway API는 금융 데이터를 처리하므로 과도한 요청을 제한해야 한다.

권장 라이브러리: `slowapi` (FastAPI 용 rate limiter)

```bash
pip install slowapi
```

```python
# 구현 예시
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 엔드포인트에 적용
@router.post("/api/news/analyze")
@limiter.limit("30/minute")
async def analyze_news(request: Request, ...):
    ...
```

### 2. CRON_SECRET 환경변수 설정
**파일**: `railway-api/.env` (로컬), Railway 대시보드 (프로덕션)

```bash
# 안전한 랜덤 시크릿 생성
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

생성된 값을 `.env`의 `CRON_SECRET=` 에 추가하고, Railway 대시보드 환경변수에도 동일하게 설정한다.

### 3. 프로덕션 CORS 오리진 설정
Railway 대시보드에서 `ALLOWED_ORIGINS` 환경변수를 프로덕션 도메인으로 설정:
```
ALLOWED_ORIGINS=https://fanen.vercel.app
```

---

## 환경변수 관리 원칙

| 파일 | git 포함 여부 | 용도 |
|------|-------------|------|
| `.env.local` | ❌ 제외 | Next.js 로컬 개발용 |
| `railway-api/.env` | ❌ 제외 | FastAPI 로컬 개발용 |
| `.env.example` | ✅ 포함 | 키 목록만 (값 없음) |
| `railway-api/.env.example` | ✅ 포함 | 키 목록만 (값 없음) |

> **주의**: 실제 API 키/시크릿이 담긴 파일은 절대 git에 커밋하지 않는다.
> git에 올라간 키는 즉시 폐기하고 재발급해야 한다.

---

## 알려진 잠재 취약점 추적

| 발견일 | 위치 | 내용 | 조치 |
|--------|------|------|------|
| 2026-03-24 | `.gitignore` | `railway-api/.env` 미제외 — Service Role Key 노출 위험 | ✅ gitignore 추가로 해결 |
| 2026-03-24 | `src/app/api/auth/callback/route.ts` | OAuth 콜백 `next` 파라미터 오픈 리다이렉트 | ✅ 상대 경로만 허용하도록 수정 |
