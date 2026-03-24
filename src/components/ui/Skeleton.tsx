import React from 'react';

/** 기본 Skeleton Props */
interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

/** 기본 Skeleton — 임의 크기 플레이스홀더 */
function SkeletonBase({ width, height, className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      style={{ width, height }}
    />
  );
}

/** Skeleton.Card — 카드 형태 플레이스홀더 */
function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-200 p-4 ${className}`}>
      <div className="mb-3 h-4 w-3/4 rounded bg-gray-300" />
      <div className="mb-2 h-3 w-full rounded bg-gray-300" />
      <div className="h-3 w-5/6 rounded bg-gray-300" />
    </div>
  );
}

/** Skeleton.Text — 텍스트 형태 플레이스홀더 */
function SkeletonText({ rows = 3, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-gray-200"
          style={{ width: i === rows - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

/** Skeleton 컴포넌트 — 복합 export */
const Skeleton = Object.assign(SkeletonBase, {
  Card: SkeletonCard,
  Text: SkeletonText,
});

export default Skeleton;
