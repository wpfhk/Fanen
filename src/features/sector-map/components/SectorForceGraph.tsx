'use client';

/**
 * SectorForceGraph 컴포넌트
 * D3 ForceSimulation 기반 섹터 인과관계 포스 그래프 시각화
 */
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { SectorNode, SectorLink } from '../types';
import { getEdgeColor } from '../types';

interface SectorForceGraphProps {
  nodes: SectorNode[];
  links: SectorLink[];
  onSectorClick: (sectorId: string) => void;
  uiMode: 'standard' | 'senior';
}

export default function SectorForceGraph({
  nodes,
  links,
  onSectorClick,
  uiMode,
}: SectorForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 600;
  const height = 480;

  // Senior 모드 크기 배율
  const nodeRadius = uiMode === 'senior' ? 18 : 12;
  const fontSize = uiMode === 'senior' ? '14px' : '11px';

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // 이전 렌더링 초기화

    // D3가 원본을 mutate하므로 노드/링크 복사본 생성
    const nodesCopy = nodes.map((n) => ({ ...n }));
    const linksCopy = links.map((l) => ({ ...l }));

    // ForceSimulation 설정
    const simulation = d3
      .forceSimulation<SectorNode>(nodesCopy)
      .force(
        'link',
        d3
          .forceLink<SectorNode, SectorLink>(linksCopy)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.05);

    // 엣지(선) 렌더링
    const link = svg
      .append('g')
      .selectAll('line')
      .data(linksCopy)
      .enter()
      .append('line')
      .attr('stroke', (d) => getEdgeColor(d.causal_strength))
      .attr('stroke-width', (d) => Math.abs(d.causal_strength) * 3 + 1)
      .attr('stroke-opacity', 0.7);

    // 노드(원 + 텍스트) 렌더링
    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodesCopy)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .on('click', (_, d) => onSectorClick(d.id));

    node
      .append('circle')
      .attr('r', nodeRadius)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#1d4ed8')
      .attr('stroke-width', 2);

    node
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', nodeRadius + 14)
      .attr('font-size', fontSize)
      .attr('fill', '#374151');

    // tick 이벤트로 위치 업데이트
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SectorNode).x ?? 0)
        .attr('y1', (d) => (d.source as SectorNode).y ?? 0)
        .attr('x2', (d) => (d.target as SectorNode).x ?? 0)
        .attr('y2', (d) => (d.target as SectorNode).y ?? 0);

      node.attr('transform', (d) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
    });

    // cleanup — 메모리 누수 방지를 위해 반드시 simulation.stop() 호출
    return () => {
      simulation.stop();
    };
  }, [nodes, links, uiMode, onSectorClick, nodeRadius, fontSize]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      aria-label="섹터 인과관계 포스 그래프"
    />
  );
}
