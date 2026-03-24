/** news-impact feature 배럴 익스포트 */
export { default as NewsImpactList } from './components/NewsImpactList';
export { default as NewsImpactCard } from './components/NewsImpactCard';
// useNewsImpacts — 배럴 제외. 컴포넌트 내부에서 직접 import할 것
export type { NewsImpactCardData, Signal } from './types';
export { scoreToSignal, splitSummary } from './types';
