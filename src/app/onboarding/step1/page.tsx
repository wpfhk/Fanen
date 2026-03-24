'use client';

/**
 * 온보딩 Step 1 — 투자 경험 선택
 * 입문 / 중급 / 전문가 카드 UI
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LEVELS = [
  {
    value: 'beginner',
    label: '입문',
    desc: '투자를 막 시작하신 분',
    icon: '🌱',
  },
  {
    value: 'intermediate',
    label: '중급',
    desc: '1~3년 투자 경험이 있으신 분',
    icon: '📈',
  },
  {
    value: 'expert',
    label: '전문가',
    desc: '3년 이상 활발히 투자하시는 분',
    icon: '🏆',
  },
] as const;

type Level = (typeof LEVELS)[number]['value'];

export default function OnboardingStep1() {
  const router = useRouter();
  const [selected, setSelected] = useState<Level | null>(null);

  const handleNext = () => {
    if (!selected) return;
    localStorage.setItem('onboarding_level', selected);
    router.push('/onboarding/step2');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* 진행 바 */}
        <div className="flex gap-2 justify-center mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-16 rounded-full ${i <= 1 ? 'bg-primary' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          투자 경험을 알려주세요
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          맞춤 정보를 제공하기 위해 필요해요
        </p>

        {/* 선택 카드 */}
        <div className="space-y-3">
          {LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setSelected(level.value)}
              className={`w-full rounded-xl border-2 p-5 text-left transition-colors ${
                selected === level.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{level.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{level.label}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{level.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8">
          <button
            onClick={handleNext}
            disabled={!selected}
            className={`w-full py-3 rounded-xl font-medium text-white transition-colors ${
              selected
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
