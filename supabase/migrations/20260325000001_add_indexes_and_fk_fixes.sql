-- 성능 인덱스 추가 및 FK CASCADE 보완
-- (DB 전문가 팀 권고사항 반영)

-- ┌─────────────────────────────────────────────────────────┐
-- │ 1. FK CASCADE 보완                                       │
-- │    mock_accounts.season_id, mock_rankings.season_id     │
-- │    시즌 삭제 시 고아 레코드 방지                              │
-- └─────────────────────────────────────────────────────────┘

-- mock_accounts: season_id FK에 ON DELETE CASCADE 추가
ALTER TABLE mock_accounts
  DROP CONSTRAINT IF EXISTS mock_accounts_season_id_fkey;

ALTER TABLE mock_accounts
  ADD CONSTRAINT mock_accounts_season_id_fkey
  FOREIGN KEY (season_id) REFERENCES mock_seasons(id) ON DELETE CASCADE;

-- mock_rankings: season_id FK에 ON DELETE CASCADE 추가
ALTER TABLE mock_rankings
  DROP CONSTRAINT IF EXISTS mock_rankings_season_id_fkey;

ALTER TABLE mock_rankings
  ADD CONSTRAINT mock_rankings_season_id_fkey
  FOREIGN KEY (season_id) REFERENCES mock_seasons(id) ON DELETE CASCADE;

-- ┌─────────────────────────────────────────────────────────┐
-- │ 2. 성능 인덱스 추가                                        │
-- │    RLS user_id 필터링 + 정렬 쿼리 최적화                    │
-- └─────────────────────────────────────────────────────────┘

-- portfolios: user_id 조회 최적화 (usePortfolios.ts)
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id
  ON portfolios(user_id);

-- mock_accounts: user_id + season_id 조회 최적화 (useMockAccount.ts)
CREATE INDEX IF NOT EXISTS idx_mock_accounts_user_id
  ON mock_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_accounts_season_id
  ON mock_accounts(season_id);

-- mock_trades: user_id + traded_at 정렬 최적화 (useMockTrades.ts)
CREATE INDEX IF NOT EXISTS idx_mock_trades_user_id
  ON mock_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_trades_account_id
  ON mock_trades(account_id);
CREATE INDEX IF NOT EXISTS idx_mock_trades_traded_at
  ON mock_trades(traded_at DESC);

-- trade_journals: user_id + created_at 정렬 최적화 (useJournals.ts)
CREATE INDEX IF NOT EXISTS idx_trade_journals_user_id
  ON trade_journals(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_journals_created_at
  ON trade_journals(created_at DESC);

-- dividend_calendar: 날짜 범위 조회 최적화 (useDividendCalendar.ts)
CREATE INDEX IF NOT EXISTS idx_dividend_calendar_ex_dividend_date
  ON dividend_calendar(ex_dividend_date);

-- news_impacts: 최신순 조회 최적화 (useNewsImpacts.ts)
CREATE INDEX IF NOT EXISTS idx_news_impacts_published_at
  ON news_impacts(published_at DESC);

-- mock_rankings: season_id 조회 최적화 (useMockRanking.ts)
CREATE INDEX IF NOT EXISTS idx_mock_rankings_season_id
  ON mock_rankings(season_id);
