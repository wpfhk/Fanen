import type { MorningBrief } from '@/features/binah-map/types';

/** 반디 오전 브리핑 Mock 데이터 */
export const MOCK_MORNING_BRIEF: MorningBrief = {
  date: '2026-03-25',
  headline: '미중 갈등 속 반도체·방산 기회 포착',
  summary:
    '오늘 반디가 주목한 지정학 이벤트 4건. 미중 반도체 규제 강화로 국내 메모리 수혜가 기대되며, ' +
    '중동 긴장으로 방산·에너지 변동성이 확대될 수 있습니다. 포트폴리오 방어 자산 비중 점검을 권장합니다.',
  topSectors: [
    { name: '반도체', direction: 'up', reason: '미국 대중 HBM 수출 규제 → 삼성·SK 반사 수혜' },
    { name: '방산', direction: 'up', reason: '중동 긴장 고조 → 방산 수출 모멘텀 지속' },
    { name: '에너지', direction: 'neutral', reason: '유가 상승 압력, 단기 변동성 주의' },
  ],
  bandiMood: 'thinking',
};
