'use client';

/**
 * SectorDrilldownPanel 컴포넌트
 * 선택된 섹터의 인과관계 상세 정보를 패널 형태로 표시
 */
import { AiBadge } from '@/components/common';
import type { SectorLink, SectorRelation, SectorNode } from '../types';

interface SectorDrilldownPanelProps {
  sectorId: string | null;
  links: SectorLink[];
  uiMode: 'standard' | 'senior';
}

/** source/target이 string 또는 SectorNode일 수 있으므로 id 추출 헬퍼 */
function getNodeId(node: string | SectorNode): string {
  return typeof node === 'string' ? node : node.id;
}

export default function SectorDrilldownPanel({
  sectorId,
  links,
  uiMode,
}: SectorDrilldownPanelProps) {
  // 선택된 섹터와 연결된 관계 필터링
  const relations: SectorRelation[] = sectorId
    ? [
        // 해당 섹터에서 출발하는 관계 (→)
        ...links
          .filter((l) => getNodeId(l.source) === sectorId)
          .map((l) => ({
            direction: 'from' as const,
            sector: getNodeId(l.target),
            causal_strength: l.causal_strength,
            description: l.description,
          })),
        // 해당 섹터로 들어오는 관계 (←)
        ...links
          .filter((l) => getNodeId(l.target) === sectorId)
          .map((l) => ({
            direction: 'to' as const,
            sector: getNodeId(l.source),
            causal_strength: l.causal_strength,
            description: l.description,
          })),
      ]
    : [];

  return (
    <aside className="rounded-lg border border-gray-200 bg-white p-4 h-full">
      {!sectorId ? (
        // 섹터 미선택 시 안내 문구
        <div className="flex items-center justify-center h-32 text-gray-400">
          <p className={uiMode === 'senior' ? 'text-lg' : 'text-sm'}>
            섹터를 클릭하면 상세 정보가 표시됩니다
          </p>
        </div>
      ) : (
        <>
          {/* 선택 섹터 제목 */}
          <h3
            className={`font-bold text-gray-900 mb-3 ${
              uiMode === 'senior' ? 'text-xl' : 'text-base'
            }`}
          >
            {sectorId} 섹터 인과관계
          </h3>
          <div className="space-y-2">
            {relations.map((rel, idx) => (
              <div
                key={idx}
                className={`rounded-lg bg-gray-50 p-3 ${
                  uiMode === 'senior' ? 'text-base' : 'text-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {/* 방향 표시: → 출발, ← 도착 */}
                  <span
                    className={
                      rel.direction === 'from'
                        ? 'text-blue-600 font-medium'
                        : 'text-orange-600 font-medium'
                    }
                  >
                    {rel.direction === 'from' ? `→ ${rel.sector}` : `← ${rel.sector}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    (강도: {rel.causal_strength.toFixed(2)})
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <AiBadge label="AI 분석" />
                  <p className="text-gray-600">{rel.description}</p>
                </div>
              </div>
            ))}
            {relations.length === 0 && (
              <p className="text-gray-400 text-sm">관련 인과관계가 없습니다.</p>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
