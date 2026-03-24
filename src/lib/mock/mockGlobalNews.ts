/**
 * 글로벌 뉴스 → 수혜 섹터/종목 Mock 데이터
 * 카테고리: 금리/지정학/원자재/무역/기술
 */

export type NewsCategory = 'rate' | 'geopolitics' | 'commodity' | 'trade' | 'tech';
export type SectorImpactLevel = 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
export type TradeSignal = 'buy' | 'hold' | 'sell';

export interface SectorImpact {
  sector: string;
  impact: SectorImpactLevel;
  reason: string;
}

export interface StockRecommendation {
  code: string;
  name: string;
  sector: string;
  signal: TradeSignal;
  confidence: number;
  reason: string;
}

export interface GlobalNewsItem {
  id: string;
  title: string;
  source: string;
  category: NewsCategory;
  date: string;
  summary: string;
  benefitSectors: SectorImpact[];
  benefitStocks: StockRecommendation[];
}

export const MOCK_GLOBAL_NEWS: GlobalNewsItem[] = [
  {
    id: 'gn-001',
    title: '미 연준, 2026년 2회 금리 인하 시사 — 경기 연착륙 기대',
    source: 'Bloomberg',
    category: 'rate',
    date: '2026-03-24',
    summary: '제롬 파월 연준 의장이 올해 두 차례 금리 인하를 시사했다. 시장은 성장주 중심의 반등을 기대하고 있으며, 한국 반도체·IT 섹터에 긍정적 영향이 예상된다.',
    benefitSectors: [
      { sector: '반도체', impact: 'strong_positive', reason: '금리 인하 시 성장주 밸류에이션 개선, HBM 수요 지속' },
      { sector: 'IT/소프트웨어', impact: 'positive', reason: '기술주 전반 멀티플 재평가' },
      { sector: '바이오/헬스케어', impact: 'positive', reason: '고금리 부담 해소로 임상 파이프라인 가치 상승' },
      { sector: '금융', impact: 'negative', reason: 'NIM(순이자마진) 축소 우려' },
      { sector: '건설/부동산', impact: 'positive', reason: '부동산 금융비용 감소' },
    ],
    benefitStocks: [
      { code: '005930', name: '삼성전자', sector: '반도체', signal: 'buy', confidence: 87, reason: 'HBM3E 독점 공급 + 금리 인하 수혜' },
      { code: '000660', name: 'SK하이닉스', sector: '반도체', signal: 'buy', confidence: 85, reason: 'AI 메모리 수요 1위, 금리 민감도 낮음' },
      { code: '035720', name: '카카오', sector: 'IT/소프트웨어', signal: 'hold', confidence: 62, reason: '성장주 반등 기대, 다만 수익성 개선 지켜볼 것' },
    ],
  },
  {
    id: 'gn-002',
    title: '러-우크라이나 정전 협상 타결 임박 — 에너지 시장 안정화 전망',
    source: 'Reuters',
    category: 'geopolitics',
    date: '2026-03-23',
    summary: '러시아-우크라이나 정전 협상이 마무리 단계에 접어들었다. 유럽 에너지 공급 불안이 해소되면 천연가스 가격 하락, 한국 에너지 다소비 산업에 긍정적.',
    benefitSectors: [
      { sector: '화학/정유', impact: 'positive', reason: '원자재 비용 하락으로 마진 개선' },
      { sector: '철강/금속', impact: 'positive', reason: '에너지 비용 감소' },
      { sector: '에너지/유틸리티', impact: 'negative', reason: '천연가스 가격 하락으로 LNG 수출 수익 감소' },
      { sector: '방산', impact: 'negative', reason: '분쟁 완화로 방산 수요 기대감 감소' },
      { sector: '항공/여행', impact: 'strong_positive', reason: '유럽 노선 재개 + 유류비 하락' },
    ],
    benefitStocks: [
      { code: '051910', name: 'LG화학', sector: '화학', signal: 'buy', confidence: 79, reason: '에너지 비용 절감 + 배터리 소재 수요 회복' },
      { code: '003490', name: '대한항공', sector: '항공', signal: 'buy', confidence: 76, reason: '유럽 노선 회복 + 항공유 가격 안정화' },
    ],
  },
  {
    id: 'gn-003',
    title: '중국, 반도체 자국산 전환 가속 — 삼성·SK에 단기 타격 우려',
    source: 'Financial Times',
    category: 'trade',
    date: '2026-03-22',
    summary: '중국이 반도체 공급망 자립화를 위해 자국 기업 우선 구매 정책을 강화했다. 단기 수출 감소 우려가 있으나 미국·유럽 시장 대체 수요 기대.',
    benefitSectors: [
      { sector: '반도체', impact: 'negative', reason: '중국 수출 비중 25% → 점진적 감소 불가피' },
      { sector: '장비/소재', impact: 'neutral', reason: '중국 자립화 투자 증가로 소재 수요 일부 대체' },
      { sector: '방산/보안', impact: 'positive', reason: '지정학 리스크 증가로 방산 수주 기대' },
    ],
    benefitStocks: [
      { code: '009150', name: '삼성전기', sector: '장비/소재', signal: 'hold', confidence: 58, reason: '중국 의존도 낮고 북미·유럽 확대 중' },
    ],
  },
  {
    id: 'gn-004',
    title: '국제 유가 WTI $95 돌파 — OPEC+ 감산 연장 결정',
    source: 'Bloomberg',
    category: 'commodity',
    date: '2026-03-21',
    summary: 'OPEC+가 감산 기조를 2분기까지 연장하면서 국제 유가가 급등했다. 한국 정유·화학 업체의 마진 압박과 함께 에너지 관련주 수혜 기대.',
    benefitSectors: [
      { sector: '에너지/정유', impact: 'strong_positive', reason: '유가 상승 직접 수혜, 재고 평가이익 발생' },
      { sector: '화학', impact: 'negative', reason: '납사 등 원료 비용 상승' },
      { sector: '항공', impact: 'negative', reason: '항공유 가격 상승으로 영업비용 증가' },
      { sector: '해운', impact: 'positive', reason: '연료 비용 전가 가능, 운임 강세' },
    ],
    benefitStocks: [
      { code: '010950', name: 'S-Oil', sector: '에너지/정유', signal: 'buy', confidence: 83, reason: 'WTI 상승 직접 수혜, 배당 매력' },
      { code: '011200', name: 'HMM', sector: '해운', signal: 'hold', confidence: 65, reason: '운임 강세 지속 여부 불확실' },
    ],
  },
  {
    id: 'gn-005',
    title: 'AI 데이터센터 전력 수요 급증 — 미국 전력망 투자 본격화',
    source: 'Wall Street Journal',
    category: 'tech',
    date: '2026-03-20',
    summary: '미국 빅테크들의 AI 데이터센터 확장으로 전력 수요가 급증하고 있다. 한국 전력 인프라 및 변압기 기업들의 수출 기회 확대 기대.',
    benefitSectors: [
      { sector: '전력/전기장비', impact: 'strong_positive', reason: '변압기·전선 수출 급증, 백로그 확대' },
      { sector: '반도체', impact: 'strong_positive', reason: 'AI 서버용 HBM 수요 가속' },
      { sector: '원전/원자력', impact: 'positive', reason: '청정 전력 수요 증가로 SMR 주목' },
      { sector: '건설', impact: 'positive', reason: '데이터센터 건설 수주 기대' },
    ],
    benefitStocks: [
      { code: '011090', name: 'LS전선', sector: '전력/전기장비', signal: 'buy', confidence: 88, reason: '북미 전력망 인프라 수주 급증' },
      { code: '000660', name: 'SK하이닉스', sector: '반도체', signal: 'buy', confidence: 91, reason: 'HBM3E 독점 공급 지위, AI 수요 직접 수혜' },
    ],
  },
  {
    id: 'gn-006',
    title: '미-중 무역 협상 재개 — 관세 10% 추가 부과 유예',
    source: 'Reuters',
    category: 'trade',
    date: '2026-03-19',
    summary: '미국과 중국이 무역 협상을 재개했으며 추가 관세 부과를 90일 유예하기로 합의했다. 글로벌 공급망 안정화와 수출 회복 기대.',
    benefitSectors: [
      { sector: '반도체', impact: 'positive', reason: '중국향 수출 불확실성 일부 해소' },
      { sector: '자동차', impact: 'positive', reason: '글로벌 부품 공급망 안정화' },
      { sector: '화학/소재', impact: 'positive', reason: '중국 수출 관세 부담 완화' },
      { sector: '방산', impact: 'neutral', reason: '미-중 긴장 완화로 방산 모멘텀 약화' },
    ],
    benefitStocks: [
      { code: '005380', name: '현대차', sector: '자동차', signal: 'buy', confidence: 72, reason: '글로벌 공급망 안정화 + 전기차 판매 회복' },
      { code: '051910', name: 'LG화학', sector: '화학/소재', signal: 'hold', confidence: 67, reason: '관세 완화 수혜, 다만 배터리 부문 적자 지속' },
    ],
  },
  {
    id: 'gn-007',
    title: '일본 BOJ 금리 추가 인상 단행 — 엔화 강세 전환',
    source: 'Nikkei',
    category: 'rate',
    date: '2026-03-18',
    summary: '일본 중앙은행이 기준금리를 0.25%에서 0.5%로 추가 인상했다. 엔화 강세가 한국 수출 경쟁력에 미치는 영향이 주목된다.',
    benefitSectors: [
      { sector: '자동차', impact: 'positive', reason: '일본 경쟁사 대비 가격 경쟁력 강화' },
      { sector: '철강', impact: 'positive', reason: '일본산 철강 수입 가격 상승으로 국내 경쟁 완화' },
      { sector: '반도체', impact: 'neutral', reason: '일본 소재 수입 비용 증가, 상쇄 요인 있음' },
    ],
    benefitStocks: [
      { code: '005380', name: '현대차', sector: '자동차', signal: 'buy', confidence: 78, reason: '엔화 강세로 도요타 대비 가격 우위' },
      { code: '000010', name: 'POSCO홀딩스', sector: '철강', signal: 'hold', confidence: 61, reason: '일본산 수입 철강 가격 상승 수혜' },
    ],
  },
  {
    id: 'gn-008',
    title: '유럽 배터리 규제 강화 — 2027년 배터리 여권 의무화',
    source: 'Financial Times',
    category: 'tech',
    date: '2026-03-17',
    summary: '유럽연합이 2027년부터 배터리 여권 제도를 의무화한다. 탄소 발자국, 재활용 원료 비율 등을 추적해야 하며 한국 배터리 기업들의 대응이 필요하다.',
    benefitSectors: [
      { sector: '배터리', impact: 'positive', reason: '규제 준수 기반 기업 차별화, 한국 3사 선행 대응' },
      { sector: '배터리 소재', impact: 'positive', reason: '친환경 소재 수요 증가' },
      { sector: '폐배터리 재활용', impact: 'strong_positive', reason: '리사이클 의무화로 재활용 시장 급성장' },
    ],
    benefitStocks: [
      { code: '373220', name: 'LG에너지솔루션', sector: '배터리', signal: 'buy', confidence: 82, reason: '유럽 규제 선제 대응, 폭스바겐 공급 유지' },
      { code: '006400', name: '삼성SDI', sector: '배터리', signal: 'buy', confidence: 79, reason: '고체 배터리 특허 다수 보유, 규제 적응 능력' },
    ],
  },
  {
    id: 'gn-009',
    title: '중동 분쟁 장기화 — 홍해 해운 우회로 물류비 급등',
    source: 'Bloomberg',
    category: 'geopolitics',
    date: '2026-03-16',
    summary: '중동 분쟁 장기화로 홍해 해운 항로가 차질을 빚으며 글로벌 물류비용이 급등했다. 국내 해운사 수혜와 제조업체 비용 증가가 동시에 예상된다.',
    benefitSectors: [
      { sector: '해운', impact: 'strong_positive', reason: '운임 급등으로 영업이익 직접 증가' },
      { sector: '물류/항만', impact: 'positive', reason: '우회 항로 활용으로 부산항 경유 증가' },
      { sector: '화학/제조', impact: 'negative', reason: '원자재 운송 비용 증가로 원가 압박' },
    ],
    benefitStocks: [
      { code: '011200', name: 'HMM', sector: '해운', signal: 'buy', confidence: 84, reason: '컨테이너 운임 급등 직접 수혜, 중동 노선 보유' },
      { code: '004370', name: '한국항공우주', sector: '방산', signal: 'hold', confidence: 59, reason: '중동 분쟁 관련 방산 수주 기대, 변동성 있음' },
    ],
  },
  {
    id: 'gn-010',
    title: '미국 반도체 지원법 2.0 발표 — 첨단 패키징 보조금 확대',
    source: 'Wall Street Journal',
    category: 'tech',
    date: '2026-03-15',
    summary: '미국 정부가 반도체 지원법 2.0을 발표하며 첨단 패키징과 후공정 분야 보조금을 대폭 확대했다. 한국 파운드리·패키징 기업들의 미국 투자 확대 기대.',
    benefitSectors: [
      { sector: '반도체 파운드리', impact: 'strong_positive', reason: '미국 보조금 수혜, 첨단 패키징 수요 급증' },
      { sector: '반도체 장비', impact: 'positive', reason: '파운드리 투자 확대로 장비 수주 증가' },
      { sector: '반도체 소재', impact: 'positive', reason: '생산량 증가로 소재 수요 증가' },
    ],
    benefitStocks: [
      { code: '005930', name: '삼성전자', sector: '반도체 파운드리', signal: 'buy', confidence: 86, reason: '미국 파운드리 투자 보조금 수혜 직접' },
      { code: '058470', name: '리노공업', sector: '반도체 소재', signal: 'buy', confidence: 74, reason: '반도체 테스트 소켓 독점, 파운드리 확대 수혜' },
    ],
  },
];

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  rate: '금리/통화',
  geopolitics: '지정학',
  commodity: '원자재',
  trade: '무역/관세',
  tech: '기술/산업',
};

export const IMPACT_CONFIG: Record<SectorImpactLevel, { label: string; color: string; barColor: string }> = {
  strong_positive: { label: '강한 수혜', color: 'text-emerald-700', barColor: 'bg-emerald-500' },
  positive:        { label: '수혜',     color: 'text-green-600',   barColor: 'bg-green-400' },
  neutral:         { label: '중립',     color: 'text-gray-500',    barColor: 'bg-gray-300' },
  negative:        { label: '피해',     color: 'text-orange-600',  barColor: 'bg-orange-400' },
  strong_negative: { label: '강한 피해', color: 'text-red-700',    barColor: 'bg-red-500' },
};
