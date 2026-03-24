'use client';

/**
 * 온보딩 Step 2 — 관심 섹터 다중 선택
 * 최소 1개 이상 선택 필수
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SECTORS = [
  'IT/반도체',
  '바이오/헬스케어',
  '금융/보험',
  '제조/화학',
  '건설/부동산',
  '에너지/유틸리티',
] as const;

type Sector = (typeof SECTORS)[number];

export default function OnboardingStep2() {
  const router = useRouter();
  const [selected, setSelected] = useState<Sector[]>([]);

  const toggleSector = (sector: Sector) => {
    setSelected((prev) =>
      prev.includes(sector)
        ? prev.filter((s) => s !== sector)
        : [...prev, sector]
    );
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    localStorage.setItem('onboarding_sectors', JSON.stringify(selected));
    router.push('/onboarding/step3');
  };

  const handleBack = () => {
    router.push('/onboarding/step1');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* 진행 바 */}
        <div className="flex gap-2 justify-center mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-16 rounded-full ${i <= 2 ? 'bg-primary' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          관심 있는 섹터를 선택하세요
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          최소 1개 이상 선택해주세요 (복수 선택 가능)
        </p>

        {/* 섹터 태그 */}
        <div className="flex flex-wrap gap-3 justify-center">
          {SECTORS.map((sector) => {
            const isSelected = selected.includes(sector);
            return (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`px-5 py-3 rounded-full border-2 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {sector}
              </button>
            );
          })}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 py-3 rounded-xl font-medium border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={selected.length === 0}
            className={`flex-1 py-3 rounded-xl font-medium text-white transition-colors ${
              selected.length > 0
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
