'use client';

/**
 * useSectorStore — 섹터 셀 유니버스 Zustand 상태 관리
 * selectedTicker, visibleTiers, isDark 상태 관리
 */

import { create } from 'zustand';
import type { TierLevel } from '../types';

interface SectorStoreState {
  /** 현재 선택된 종목 ticker (null = 미선택) */
  selectedTicker: string | null;
  /** Morning Brief에서 선택된 섹터 키 (null = 미선택) */
  selectedSector: string | null;
  /** 표시할 tier 집합 */
  visibleTiers: Set<TierLevel>;
  /** 다크모드 여부 */
  isDark: boolean;
  /** 선택 ticker 변경 */
  setSelectedTicker: (ticker: string | null) => void;
  /** 선택 섹터 변경 (Morning Brief → Sector Analysis 네비게이션) */
  setSelectedSector: (sector: string | null) => void;
  /** tier 가시성 토글 */
  toggleTier: (tier: TierLevel) => void;
  /** 다크모드 설정 */
  setIsDark: (dark: boolean) => void;
}

export const useSectorStore = create<SectorStoreState>((set) => ({
  selectedTicker: null,
  selectedSector: null,
  visibleTiers: new Set<TierLevel>([0, 1, 2, 3]),
  isDark: false,

  setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),
  setSelectedSector: (sector) => set({ selectedSector: sector }),

  toggleTier: (tier) =>
    set((state) => {
      const next = new Set(state.visibleTiers);
      if (next.has(tier)) {
        next.delete(tier);
      } else {
        next.add(tier);
      }
      return { visibleTiers: next };
    }),

  setIsDark: (dark) => set({ isDark: dark }),
}));
