/** news-impact feature 배럴 익스포트 */
export { default as NewsImpactList } from './components/NewsImpactList';
export { default as NewsImpactCard } from './components/NewsImpactCard';
export { useNewsImpacts } from './hooks/useNewsImpacts';
export type { NewsImpactCardData, Signal } from './types';
export { scoreToSignal, splitSummary } from './types';
