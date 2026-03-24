import React from 'react';

/** Card variant별 스타일 매핑 */
const VARIANT_STYLES = {
  default: 'bg-white shadow-sm',
  highlighted: 'bg-primary-50 shadow-sm border border-primary-200',
  bordered: 'bg-white border border-gray-200',
} as const;

/** Card padding별 스타일 매핑 */
const PADDING_STYLES = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

/** Card 컴포넌트 Props */
interface CardProps {
  variant?: 'default' | 'highlighted' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

/** 공통 카드 컴포넌트 */
export default function Card({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
}: CardProps) {
  return (
    <div className={`rounded-xl ${VARIANT_STYLES[variant]} ${PADDING_STYLES[padding]} ${className}`}>
      {children}
    </div>
  );
}
