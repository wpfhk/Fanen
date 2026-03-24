/**
 * Mock 포트폴리오 데이터 — 5개 포트폴리오
 * PortfolioRow 타입 준수
 */
import type { PortfolioRow } from '@/features/portfolio/types';

/** 포트폴리오 Mock 5개 */
export const MOCK_PORTFOLIOS: PortfolioRow[] = [
  {
    id: 'mock-portfolio-1',
    user_id: 'mock-user-1',
    name: '성장주 포트폴리오',
    description: 'AI·반도체 중심 성장주 투자',
    total_value: 25_000_000,
    created_at: '2025-12-01T09:00:00Z',
    updated_at: '2026-03-20T14:30:00Z',
  },
  {
    id: 'mock-portfolio-2',
    user_id: 'mock-user-1',
    name: '배당주 포트폴리오',
    description: '고배당 우량주 중심 안정적 수익',
    total_value: 15_000_000,
    created_at: '2025-11-15T09:00:00Z',
    updated_at: '2026-03-18T10:00:00Z',
  },
  {
    id: 'mock-portfolio-3',
    user_id: 'mock-user-1',
    name: '바이오 특화',
    description: '국내 바이오 대형주 집중 투자',
    total_value: 8_500_000,
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-03-15T16:00:00Z',
  },
  {
    id: 'mock-portfolio-4',
    user_id: 'mock-user-1',
    name: '방산·에너지',
    description: '방산·에너지 섹터 테마 투자',
    total_value: 12_000_000,
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-03-22T11:00:00Z',
  },
  {
    id: 'mock-portfolio-5',
    user_id: 'mock-user-1',
    name: '단기 트레이딩',
    description: '단기 모멘텀 매매 전용 계좌',
    total_value: 5_000_000,
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-03-24T09:00:00Z',
  },
];
