'use client';

/**
 * 온보딩 Step 3 — UI 모드 선택
 * 일반 / 전문가 / 시니어 모드
 * 완료 시 프로필 저장 후 홈으로 이동
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { USE_MOCK } from '@/lib/mock';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const MODES = [
  {
    value: 'standard',
    label: '일반 모드',
    desc: '기본 UI, 필요한 정보 중심',
    icon: '📱',
  },
  {
    value: 'expert',
    label: '전문가 모드',
    desc: '차트/지표 상세 정보 포함',
    icon: '📊',
  },
  {
    value: 'senior',
    label: '시니어 모드',
    desc: '큰 글자, 단순하고 명확한 UI',
    icon: '🔍',
  },
] as const;

type UIMode = (typeof MODES)[number]['value'];

export default function OnboardingStep3() {
  const router = useRouter();
  const [selected, setSelected] = useState<UIMode | null>(null);
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    if (!selected) return;
    setSaving(true);

    // 시니어 모드 선택 시 클래스 추가
    if (selected === 'senior') {
      document.documentElement.classList.add('senior');
    } else {
      document.documentElement.classList.remove('senior');
    }

    // localStorage에서 이전 단계 데이터 가져오기
    const level = localStorage.getItem('onboarding_level') ?? 'beginner';
    const sectors = localStorage.getItem('onboarding_sectors') ?? '[]';

    if (USE_MOCK) {
      // Mock 모드: localStorage에 저장
      localStorage.setItem('onboarding_ui_mode', selected);
      localStorage.setItem('onboarding_completed', 'true');
      router.push('/');
    } else {
      // 실제 모드: Supabase profiles 업데이트
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        if (supabase) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('profiles').upsert({
              id: user.id,
              investment_level: level,
              interested_sectors: JSON.parse(sectors),
              ui_mode: selected,
              onboarding_completed: true,
            });
          }
        }
      }
      router.push('/');
    }
  };

  const handleBack = () => {
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
              className={`h-2 w-16 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          화면 모드를 선택하세요
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          나중에 프로필에서 변경할 수 있어요
        </p>

        {/* 모드 선택 카드 */}
        <div className="space-y-3">
          {MODES.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setSelected(mode.value)}
              className={`w-full rounded-xl border-2 p-5 text-left transition-colors ${
                selected === mode.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{mode.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">{mode.label}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{mode.desc}</div>
                </div>
              </div>
            </button>
          ))}
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
            onClick={handleComplete}
            disabled={!selected || saving}
            className={`flex-1 py-3 rounded-xl font-medium text-white transition-colors ${
              selected && !saving
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {saving ? '저장 중...' : '완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
