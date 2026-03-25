'use client';

import { DisclaimerBanner, TutorialPopup } from '@/components/common';
import { SectorMapSection } from '@/features/sector-map';

/** 섹터 인과관계 전용 페이지 */
export default function SectorPage() {

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 페이지 제목 */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100">섹터 분석</h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-400">
            섹터 간 경제적 영향력 흐름을 인터랙티브 그래프로 탐색하세요
          </p>
        </header>

        {/* 면책 고지 */}
        <div className="mb-6">
          <DisclaimerBanner variant="default" />
        </div>

        <SectorMapSection />
      </div>

      {/* 섹터 분석 튜토리얼 팝업 */}
      <TutorialPopup
        pageKey="sector"
        tutorialTitle="섹터 분석 활용법"
        steps={[
          { emoji: '📊', title: '섹터 인과관계 맵', description: '각 원(노드)이 산업 섹터를 나타냅니다. 클릭하면 해당 섹터에 영향을 주고받는 다른 섹터를 확인할 수 있어요.' },
          { emoji: '🔗', title: '연결선의 의미', description: '화살표 방향이 경제적 영향 흐름을 나타냅니다. 두꺼울수록 연관성이 강한 섹터예요.' },
          { emoji: '🔍', title: '드릴다운 패널', description: '섹터를 클릭하면 오른쪽에 상세 정보가 펼쳐집니다. 연관 기업과 투자 아이디어를 확인하세요.' },
        ]}
      />
    </main>
  );
}
