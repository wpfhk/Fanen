/** 지정학적 이벤트 */
export interface GeoEvent {
  id: string;
  title: string;
  region: string;
  lat: number;
  lon: number;
  /** 위험도 0~100 */
  riskScore: number;
  affectedSectors: string[];
  eventType: 'trade' | 'conflict' | 'policy' | 'disaster';
  summary: string;
  sourceUrl?: string;
}

/** 섹터 방향 신호 */
export interface SectorSignal {
  name: string;
  direction: 'up' | 'down' | 'neutral';
  reason: string;
}

/** 반디 오전 브리핑 */
export interface MorningBrief {
  date: string;
  headline: string;
  summary: string;
  topSectors: SectorSignal[];
  bandiMood: 'default' | 'happy' | 'thinking' | 'excited' | 'glowing';
}

/** 비나 맵 상태 */
export interface BinahMapState {
  events: GeoEvent[];
  selectedEvent: GeoEvent | null;
  loading: boolean;
  error: string | null;
}
