'use client';

import type { SignalType } from '../types';

/** Signal 타입별 UI 설정 — CSS 토큰 기반 */
export const SIGNAL_CONFIG: Record<
  SignalType,
  { label: string; color: string; bg: string; dot: string }
> = {
  buy:   { label: '매수', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-signal-buy-bg',   dot: 'var(--signal-buy)' },
  wait:  { label: '관망', color: 'text-amber-700 dark:text-amber-400',     bg: 'bg-signal-wait-bg',  dot: 'var(--signal-wait)' },
  watch: { label: '매도', color: 'text-red-700 dark:text-red-400',         bg: 'bg-signal-watch-bg', dot: 'var(--signal-watch)' },
};

interface SignalBadgeProps {
  signal: SignalType;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

/** 매수/관망/매도 시그널 뱃지 */
export function SignalBadge({ signal, size = 'md', showDot = true }: SignalBadgeProps) {
  const cfg = SIGNAL_CONFIG[signal];
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs';
  const px = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${textSize} ${px} ${cfg.color} ${cfg.bg}`}
    >
      {showDot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: cfg.dot }}
        />
      )}
      {cfg.label}
    </span>
  );
}
