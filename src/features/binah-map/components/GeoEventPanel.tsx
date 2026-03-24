'use client';

/**
 * GeoEventPanel — 선택된 지정학 이벤트 상세 패널
 */
import type { GeoEvent } from '../types';

interface Props {
  event: GeoEvent;
  onClose: () => void;
}

const RISK_LABEL: Record<string, { label: string; color: string }> = {
  high:    { label: '고위험', color: 'text-red-500' },
  medium:  { label: '중위험', color: 'text-amber-500' },
  low:     { label: '저위험', color: 'text-emerald-500' },
};

function riskLevel(score: number) {
  if (score >= 70) return RISK_LABEL.high;
  if (score >= 45) return RISK_LABEL.medium;
  return RISK_LABEL.low;
}

const EVENT_TYPE_LABEL: Record<GeoEvent['eventType'], string> = {
  trade:    '무역/기술',
  conflict: '지정학/갈등',
  policy:   '정책/규제',
  disaster: '재해/자연',
};

export function GeoEventPanel({ event, onClose }: Props) {
  const risk = riskLevel(event.riskScore);

  return (
    <div className="rounded-xl border border-[#1E3448] bg-[#162032] p-4 space-y-3">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-slate-500">
            {EVENT_TYPE_LABEL[event.eventType]} · {event.region}
          </span>
          <h3 className="mt-0.5 text-sm font-bold text-slate-100">{event.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none"
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      {/* 위험도 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">위험도</span>
        <div className="flex-1 h-1.5 rounded-full bg-[#0F1923] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${event.riskScore}%`,
              background: event.riskScore >= 70 ? '#F87171' : event.riskScore >= 45 ? '#FBBF24' : '#34D399',
            }}
          />
        </div>
        <span className={`text-xs font-semibold ${risk.color}`}>
          {event.riskScore} ({risk.label})
        </span>
      </div>

      {/* 요약 */}
      <p className="text-xs text-slate-400 leading-relaxed">{event.summary}</p>

      {/* 수혜 섹터 */}
      <div>
        <span className="text-xs font-medium text-slate-500 mb-1.5 block">관련 섹터</span>
        <div className="flex flex-wrap gap-1.5">
          {event.affectedSectors.map((sector) => (
            <span
              key={sector}
              className="rounded-full bg-teal-900/40 text-teal-300 text-xs px-2 py-0.5 font-medium"
            >
              {sector}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
