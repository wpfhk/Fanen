'use client';

/**
 * 프로필 설정 폼 컴포넌트
 * UI 모드, 언어 수준, 투자 성향 설정
 */
import { useState } from 'react';
import { useToast } from '@/components/ui';
import { useProfile } from '../hooks/useProfile';
import type { Profile } from '../hooks/useProfile';

export function ProfileForm() {
  const { profile, loading, error, updateProfile } = useProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-gray-500">프로필 불러오는 중...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        로그인이 필요합니다.
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const handleSave = async (updates: Omit<Parameters<typeof updateProfile>[0], never>) => {
    setSaving(true);
    try {
      await updateProfile(updates);
      toast.success('프로필이 저장됐습니다');
    } catch {
      toast.error('저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* UI 모드 */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">화면 모드</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'standard' as Profile['ui_mode'], label: '일반 모드', desc: '기본 글씨 크기' },
            { value: 'senior' as Profile['ui_mode'], label: '시니어 모드', desc: '큰 글씨 + 음성 우선' },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSave({ ui_mode: opt.value })}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${
                profile.ui_mode === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{opt.label}</div>
              <div className="mt-1 text-xs text-gray-500">{opt.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 언어 수준 */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">언어 수준</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'general' as Profile['language_level'], label: '일반인 용어', desc: '쉬운 말로 설명' },
            { value: 'expert' as Profile['language_level'], label: '전문가 용어', desc: 'PER, 섹터 로테이션 등' },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSave({ language_level: opt.value })}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${
                profile.language_level === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{opt.label}</div>
              <div className="mt-1 text-xs text-gray-500">{opt.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 투자 성향 */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">투자 성향</h2>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: 'conservative' as NonNullable<Profile['investment_type']>, label: '안정형', desc: '원금 보전 중시' },
            { value: 'balanced' as NonNullable<Profile['investment_type']>, label: '균형형', desc: '수익과 안정 균형' },
            { value: 'aggressive' as NonNullable<Profile['investment_type']>, label: '공격형', desc: '높은 수익 추구' },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSave({ investment_type: opt.value })}
              className={`rounded-xl border-2 p-4 text-left transition-colors ${
                profile.investment_type === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{opt.label}</div>
              <div className="mt-1 text-xs text-gray-500">{opt.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 저장 중 표시 */}
      {saving && <p className="text-sm text-gray-500">저장 중...</p>}
    </div>
  );
}
