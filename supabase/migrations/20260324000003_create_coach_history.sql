-- coach_history 테이블: AI 코치 핀이 대화 히스토리
create table if not exists coach_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS 활성화
alter table coach_history enable row level security;

-- 정책: 본인 데이터만 접근
create policy "Users can manage own coach history"
  on coach_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 인덱스
create index idx_coach_history_user_id on coach_history(user_id);
