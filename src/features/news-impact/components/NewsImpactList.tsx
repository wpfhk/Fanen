'use client';

/**
 * NewsImpactList 컴포넌트
 * 뉴스 임팩트 카드 목록 및 구독 게이트, 언어 토글 통합
 */
import { useState } from 'react';
import { DisclaimerBanner, LanguageToggle, SubscriptionGate } from '@/components/common';
import { useNewsImpacts } from '../hooks/useNewsImpacts';
import NewsImpactCard from './NewsImpactCard';

interface NewsImpactListProps {
  currentPlan?: 'free' | 'pro' | 'premium';
}

export default function NewsImpactList({ currentPlan }: NewsImpactListProps) {
  // 언어 레벨 상태 (일반인/전문가 모드)
  const [languageLevel, setLanguageLevel] = useState<'general' | 'expert'>('general');
  const { data, loading, error } = useNewsImpacts();

  return (
    <section className="space-y-4">
      {/* 상단: 타이틀 + LanguageToggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">뉴스 임팩트</h2>
        <LanguageToggle
          onChange={(level) => setLanguageLevel(level)}
          defaultLevel="general"
        />
      </div>

      {/* 면책 고지 — 분석 화면 필수 */}
      <DisclaimerBanner variant="signal" />

      {/* 구독 게이트 — Pro 이상 필요 */}
      <SubscriptionGate requiredPlan="pro" currentPlan={currentPlan ?? 'free'}>
        {/* 로딩 스켈레톤 */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* 에러 메시지 */}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </div>
        )}

        {/* 빈 데이터 안내 */}
        {!loading && !error && data.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            표시할 뉴스 임팩트 정보가 없습니다.
          </div>
        )}

        {/* 카드 목록 */}
        {!loading && data.length > 0 && (
          <div className="space-y-3">
            {data.map((item) => (
              <NewsImpactCard
                key={item.id}
                item={item}
                languageLevel={languageLevel}
              />
            ))}
          </div>
        )}
      </SubscriptionGate>
    </section>
  );
}
