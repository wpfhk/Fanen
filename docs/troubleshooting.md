# 파낸 (Fanen) — 트러블슈팅 가이드

> 마지막 업데이트: 2026-03-24
> 개발 중 실제로 발생한 에러와 해결 방법을 기록한다.

---

## 목차

1. [Claude Code 스킬 인식 안 됨](#1-claude-code-스킬-인식-안-됨)
2. [pydantic-core 빌드 실패 (Python 3.14)](#2-pydantic-core-빌드-실패-python-314)
3. [supabase start — config.toml 파싱 에러](#3-supabase-start--configtoml-파싱-에러)
4. [supabase start — Docker daemon 연결 실패](#4-supabase-start--docker-daemon-연결-실패)
5. [supabase start — docker.sock 마운트 실패](#5-supabase-start--dockersock-마운트-실패)

---

## 1. Claude Code 스킬 인식 안 됨

**증상**
```
Unknown skill: context-check
```

**원인**

스킬 파일 경로가 한 단계 더 중첩되어 있었음.

```
# 잘못된 경로
~/.claude/skills/context-check/context-check-skill/SKILL.md

# 올바른 경로
~/.claude/skills/context-check/SKILL.md
```

Claude Code는 `skills/<name>/SKILL.md` 구조만 인식한다.

**해결**

올바른 경로에 `SKILL.md`를 생성한다.

```bash
# 올바른 위치에 파일 생성 후 Claude Code 재시작
```

---

## 2. pydantic-core 빌드 실패 (Python 3.14)

**증상**
```
error: the configured Python interpreter version (3.14) is newer than
PyO3's maximum supported version (3.12)

ERROR: Failed building wheel for pydantic-core
```

**원인**

`pydantic-core 2.18.2`가 내부적으로 사용하는 PyO3 v0.21.1이 Python 3.12까지만 지원한다.
Python 3.14는 너무 최신이라 아직 지원하지 않는 패키지가 많다.

**해결**

Python 3.12로 venv를 재생성한다.

```bash
cd railway-api

rm -rf .venv
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**참고**: Railway 배포 시에도 Python 3.12를 사용하도록 `Dockerfile`에 명시할 것.

---

## 3. supabase start — config.toml 파싱 에러

**증상**
```
failed to parse config: decoding failed due to the following error(s):
'config.config' has invalid keys: project
```

**원인**

Supabase CLI 업데이트로 `[project]` 섹션이 폐기되었다.
`id`는 최상위 키 `project_id`로 변경되었다.

**해결**

`supabase/config.toml` 수정:

```toml
# 변경 전
[project]
id = "fanen"

# 변경 후
project_id = "fanen"
```

---

## 4. supabase start — Docker daemon 연결 실패

**증상**
```
failed to inspect service: Cannot connect to the Docker daemon at
unix:///Users/youngsang.kwon/.colima/default/docker.sock.
Is the docker daemon running?
```

**원인**

Colima가 실행되지 않은 상태.

**해결**

```bash
colima start
supabase start
```

**참고**: Colima는 macOS 재시작 시 자동으로 켜지지 않는다. 개발 시작 전 항상 확인할 것.

---

## 5. supabase start — docker.sock 마운트 실패

**증상**
```
failed to start docker container: Error response from daemon:
error while creating mount source path
'/Users/youngsang.kwon/.colima/default/docker.sock':
mkdir /Users/youngsang.kwon/.colima/default/docker.sock:
operation not supported
```

**원인**

Colima는 실행 중이지만 `DOCKER_HOST` 환경변수가 설정되지 않아
Supabase CLI가 Docker Desktop 기본 소켓 경로를 참조하려다 실패.

**해결**

**임시 (현재 터미널 세션만)**:
```bash
export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"
supabase start
```

**영구 (셸 설정에 등록)**:
```bash
echo 'export DOCKER_HOST="unix://${HOME}/.colima/default/docker.sock"' >> ~/.zshrc
source ~/.zshrc
```

이후 `supabase start` 바로 실행 가능.

---

## 개발 환경 시작 체크리스트

매 개발 세션 시작 시 확인:

```bash
# 1. Colima 실행 확인
colima status

# 실행 안 되어 있으면
colima start

# 2. DOCKER_HOST 설정 확인 (미설정 시 ~/.zshrc에 추가)
echo $DOCKER_HOST

# 3. Supabase 로컬 서버 시작
supabase start

# 4. Next.js 개발 서버
npm run dev

# 5. FastAPI 개발 서버
cd railway-api && source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
