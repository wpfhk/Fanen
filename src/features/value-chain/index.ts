/**
 * value-chain feature — public exports
 */

// 훅
export { useValueChain } from './hooks/useValueChain';

// 컴포넌트
export { TierBadge } from './components/TierBadge';
export { CompanyCard } from './components/CompanyCard';
export { ValueChainView } from './components/ValueChainView';

// 타입
export type { ValueChain, ValueChainNode, TierLevel, SignalType } from './types';

// mock 데이터 (개발·테스트 용도)
export { mockValueChains } from './mock/mockValueChains';
