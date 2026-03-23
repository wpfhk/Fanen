'use client';

/**
 * SectorMapSection 컴포넌트
 * 섹터 인과관계 포스 그래프 + 드릴다운 패널 통합 섹션
 */
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { DisclaimerBanner, UiModeSwitch, SubscriptionGate } from '@/components/common';
import { useSectorCausalMap } from '../hooks/useSectorCausalMap';
import SectorDrilldownPanel from './SectorDrilldownPanel';

// D3.js는 브라우저 전용 라이브러리 — SSR 비활성화 필수
const SectorForceGraph = dynamic(() => import('./SectorForceGraph'), { ssr: false });

interface SectorMapSectionProps {
  currentPlan?: 'free' | 'pro' | 'premium';
}

export default function SectorMapSection({ currentPlan }: SectorMapSectionProps) {
  // UI 모드 상태 (standard/senior)
  const [uiMode, setUiMode] = useState<'standard' | 'senior'>('standard');
  const { nodes, links, selectedSector, setSelectedSector, loading, error } =
    useSectorCausalMap();

  return (
    <section className="space-y-4">
      {/* 상단: 타이틀 + UiModeSwitch */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">섹터 인과관계 맵</h2>
        <UiModeSwitch onToggle={(mode) => setUiMode(mode)} />
      </div>

      {/* 면책 고지 — 분석 화면 필수 */}
      <DisclaimerBanner variant="default" />

      {/* 구독 게이트 — Pro 이상 필요 */}
      <SubscriptionGate requiredPlan="pro" currentPlan={currentPlan ?? 'free'}>
        {/* 로딩 스켈레톤 */}
        {loading && <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />}

        {/* 에러 메시지 */}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            섹터 인과관계 데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        )}

        {/* 그래프 + 드릴다운 레이아웃 */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 포스 그래프: 2/3 너비 */}
            <div className="lg:col-span-2">
              <SectorForceGraph
                nodes={nodes}
                links={links}
                onSectorClick={(id) => setSelectedSector(id)}
                uiMode={uiMode}
              />
            </div>
            {/* 드릴다운 패널: 1/3 너비 */}
            <div className="lg:col-span-1">
              <SectorDrilldownPanel
                sectorId={selectedSector}
                links={links}
                uiMode={uiMode}
              />
            </div>
          </div>
        )}
      </SubscriptionGate>
    </section>
  );
}
