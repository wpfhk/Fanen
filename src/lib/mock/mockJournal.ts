/**
 * Mock 투자 일지 데이터 — 5건
 * TradeJournalRow 타입 준수, 다양한 감정 태그
 */
import type { TradeJournalRow } from '@/features/journal/types';

/** 투자 일지 Mock 5건 */
export const MOCK_JOURNALS: TradeJournalRow[] = [
  {
    id: 'mock-journal-1',
    user_id: 'mock-user-1',
    trade_id: 'mock-trade-1',
    stock_code: '005930',
    stock_name: '삼성전자',
    note: 'AI 반도체 성장 기대감에 매수. HBM 수요 증가 추세를 확인하고 진입했다.',
    emotion: 'excited',
    ai_feedback: null,
    created_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'mock-journal-2',
    user_id: 'mock-user-1',
    trade_id: 'mock-trade-3',
    stock_code: '005930',
    stock_name: '삼성전자',
    note: '단기 차익 실현 목적으로 일부 매도. 수익률 3.5%로 나쁘지 않았다.',
    emotion: 'neutral',
    ai_feedback: null,
    created_at: '2026-01-20T15:00:00Z',
  },
  {
    id: 'mock-journal-3',
    user_id: 'mock-user-1',
    trade_id: 'mock-trade-4',
    stock_code: '068270',
    stock_name: '셀트리온',
    note: '바이오시밀러 실적 호조 뉴스 보고 매수했는데, 진입 타이밍이 늦은 것 같아 불안하다.',
    emotion: 'anxious',
    ai_feedback: null,
    created_at: '2026-02-03T10:30:00Z',
  },
  {
    id: 'mock-journal-4',
    user_id: 'mock-user-1',
    trade_id: 'mock-trade-6',
    stock_code: '000660',
    stock_name: 'SK하이닉스',
    note: '반도체 업황 우려에 절반 매도했는데, 이후 주가가 더 올랐다. 성급했다.',
    emotion: 'regret',
    ai_feedback: null,
    created_at: '2026-02-18T14:00:00Z',
  },
  {
    id: 'mock-journal-5',
    user_id: 'mock-user-1',
    trade_id: 'mock-trade-8',
    stock_code: '068270',
    stock_name: '셀트리온',
    note: '목표가 도달로 매도. 약 5% 수익 확보. 바이오 섹터 공부가 도움이 됐다.',
    emotion: 'excited',
    ai_feedback: null,
    created_at: '2026-03-05T15:00:00Z',
  },
];
