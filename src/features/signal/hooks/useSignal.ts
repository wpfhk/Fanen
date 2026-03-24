import { USE_MOCK } from '@/lib/mock';

/** 매매 신호 아이템 타입 */
export interface SignalItem {
  stockCode: string;
  stockName: string;
  signal: 'buy' | 'hold' | 'sell';
  reason: string;
  confidence: number;
  analyzedAt: string;
}

/** 매매 신호 데이터 훅 — Mock 모드에서는 샘플 데이터 반환 */
export function useSignal() {
  if (USE_MOCK) return {
    data: [
      { stockCode: '005930', stockName: '삼성전자', signal: 'buy', reason: 'AI 반도체 수요 증가로 실적 개선 기대', confidence: 78, analyzedAt: new Date().toISOString() },
      { stockCode: '000660', stockName: 'SK하이닉스', signal: 'hold', reason: 'HBM 출하 견조, 단기 과매수 구간', confidence: 65, analyzedAt: new Date().toISOString() },
      { stockCode: '035420', stockName: 'NAVER', signal: 'sell', reason: '광고 수익 둔화, AI 투자 비용 증가', confidence: 72, analyzedAt: new Date().toISOString() },
    ] as SignalItem[],
    loading: false,
  };

  // TODO: Railway API 연동
  return { data: [] as SignalItem[], loading: false };
}
