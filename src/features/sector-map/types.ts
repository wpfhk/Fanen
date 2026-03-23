/**
 * sector-map feature 타입 정의
 * D3 ForceSimulation 기반 섹터 노드/링크 타입 및 유틸리티
 */
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

/** D3 SimulationNodeDatum 확장 — 섹터 노드 */
export interface SectorNode extends SimulationNodeDatum {
  id: string;
  name: string;
  // D3 ForceSimulation이 x, y를 주입 (SimulationNodeDatum에서 상속)
}

/** D3 SimulationLinkDatum 확장 — 섹터 간 인과관계 링크 */
export interface SectorLink extends SimulationLinkDatum<SectorNode> {
  source: string | SectorNode;
  target: string | SectorNode;
  causal_strength: number;
  description: string;
}

/**
 * causal_strength 값을 링크 색상으로 변환
 * 양수(0초과) = 파랑 계열, 음수(0미만) = 빨강 계열, 0 = 회색
 */
export function getEdgeColor(causal_strength: number): string {
  if (causal_strength > 0) {
    const intensity = Math.min(Math.round(causal_strength * 255), 255);
    return `rgb(0, 0, ${intensity})`;
  } else if (causal_strength < 0) {
    const intensity = Math.min(Math.round(Math.abs(causal_strength) * 255), 255);
    return `rgb(${intensity}, 0, 0)`;
  }
  return '#9ca3af'; // 회색
}

/** 드릴다운 패널용 보조 타입 — 선택 섹터의 관계 정보 */
export interface SectorRelation {
  direction: 'from' | 'to';
  sector: string;
  causal_strength: number;
  description: string;
}
