/**
 * Mock 시장 데이터 — 코스피/코스닥 지수 + 30일치 OHLCV
 * 수치는 참고용 Mock 데이터이며, 실제 시세가 아닙니다.
 */
import type { OHLCVPoint, StockIndexResponse } from '@/types/market.types';

/** 30일치 OHLCV 데이터 생성 헬퍼 */
function generateOHLCV(days: number, basePrice: number): OHLCVPoint[] {
  const data: OHLCVPoint[] = [];
  let price = basePrice;

  for (let i = days; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // 랜덤 변동 (-1.5% ~ +1.5%)
    const changeRate = (Math.random() - 0.48) * 0.03;
    const open = price;
    const close = Math.round(price * (1 + changeRate) * 100) / 100;
    const high = Math.round(Math.max(open, close) * (1 + Math.random() * 0.01) * 100) / 100;
    const low = Math.round(Math.min(open, close) * (1 - Math.random() * 0.01) * 100) / 100;
    const volume = Math.round(300_000_000 + Math.random() * 200_000_000);

    data.push({ time: dateStr, open, high, low, close, volume });
    price = close;
  }

  return data;
}

/** 코스피 Mock 데이터 */
export const MOCK_KOSPI: StockIndexResponse = {
  market: 'KOSPI',
  value: 2687.44,
  change: 12.34,
  change_rate: 0.46,
  timestamp: new Date().toISOString(),
  chart_data: generateOHLCV(30, 2650),
  cached: false,
  mock: true,
};

/** 코스닥 Mock 데이터 */
export const MOCK_KOSDAQ: StockIndexResponse = {
  market: 'KOSDAQ',
  value: 872.15,
  change: -3.21,
  change_rate: -0.37,
  timestamp: new Date().toISOString(),
  chart_data: generateOHLCV(30, 880),
  cached: false,
  mock: true,
};
