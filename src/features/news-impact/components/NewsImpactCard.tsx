'use client';

/**
 * NewsImpactCard 컴포넌트
 * 개별 뉴스 임팩트 항목을 카드 형태로 표시
 */
import { TrafficLightSignal, AiBadge } from '@/components/common';
import type { NewsImpactCardData } from '../types';

interface NewsImpactCardProps {
  item: NewsImpactCardData;
  languageLevel: 'general' | 'expert';
}

export default function NewsImpactCard({ item, languageLevel }: NewsImpactCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* 헤드라인 */}
      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{item.headline}</h3>

      {/* 메타 정보: 출처, 발행일 */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        {item.source && <span>{item.source}</span>}
        {item.published_at && (
          <span>{new Date(item.published_at).toLocaleDateString('ko-KR')}</span>
        )}
      </div>

      {/* 매매 신호 */}
      <div className="mb-3">
        <TrafficLightSignal
          signal={item.signal}
          confidence={item.confidence}
          reason={languageLevel === 'general' ? item.ai_summary_general : item.ai_summary_expert}
        />
      </div>

      {/* AI 뱃지 + 영향 섹터 태그 */}
      <div className="flex items-center justify-between">
        <AiBadge label="핀이 분석" source={item.source_url ?? undefined} />
        {/* 영향 섹터 태그 (최대 3개) */}
        <div className="flex flex-wrap gap-1">
          {item.affected_sectors.slice(0, 3).map((sector) => (
            <span
              key={sector}
              className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
            >
              {sector}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
