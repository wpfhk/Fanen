'use client';

import { useState, useEffect } from 'react';
import { mockValueChains } from '../mock/mockValueChains';
import type { ValueChain } from '../types';

/**
 * useValueChain — 섹터별 밸류체인 데이터 훅
 * v0.0.1: mock 데이터 반환 (향후 Railway FastAPI로 교체 예정)
 *
 * @param sector - 섹터 키 ("defense" | "semiconductor" | "battery")
 *                 null 전달 시 "defense" 기본값 사용
 */
export function useValueChain(sector: string | null) {
  const [chain, setChain] = useState<ValueChain | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const key = sector ?? 'defense';
    setIsLoading(true);
    // v0.0.1: mock 데이터 반환 (향후 Railway API로 교체)
    const data = mockValueChains[key] ?? mockValueChains['defense'];
    setChain(data);
    setIsLoading(false);
  }, [sector]);

  return { chain, isLoading, error };
}
