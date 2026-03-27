/**
 * mockMorningBrief — Morning Brief 섹터 수혜 mock 데이터
 * BeneficiarySector 타입 기반, 실제 서비스에서는 FastAPI로 교체 예정
 */
import type { MorningBriefData } from '@/types/sector.types';

export const MOCK_MORNING_BRIEF_DATA: MorningBriefData = {
  date: '2026-03-27',
  headline: '오늘 주목할 수혜 섹터 3개',
  summary:
    '유럽 재무장 가속화와 미중 반도체 규제 강화로 방산·반도체 섹터가 최우선 수혜권에 있습니다. 2차전지는 미국 IRA 정책 불확실성 속에서도 핵심 소재 업체 중심으로 긍정적입니다.',
  bandiMood: 'thinking',
  beneficiarySectors: [
    {
      sectorKey:    'defense',
      sectorLabel:  '방산',
      trigger:      'NATO 회원국 GDP 3.5% 국방비 목표 합의 논의',
      tier0Count:   1,
      topTier0Name: '한화에어로스페이스',
      urgency:      'high',
    },
    {
      sectorKey:    'semiconductor',
      sectorLabel:  '반도체',
      trigger:      '미국 HBM 對中 수출 규제 추가 강화 발표',
      tier0Count:   1,
      topTier0Name: 'SK하이닉스',
      urgency:      'medium',
    },
    {
      sectorKey:    'battery',
      sectorLabel:  '2차전지',
      trigger:      'GM·포드 전기차 배터리 로컬 조달 의무화 검토',
      tier0Count:   1,
      topTier0Name: 'LG에너지솔루션',
      urgency:      'medium',
    },
  ],
};
