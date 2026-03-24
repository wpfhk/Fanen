'use client';

import { useState, useCallback } from 'react';
import { MOCK_GEO_EVENTS } from '@/lib/mock/mockBinahMap';
import type { BinahMapState, GeoEvent } from '../types';

/** 비나 맵 데이터 및 선택 상태 훅 */
export function useBinahMap(): BinahMapState & {
  selectEvent: (event: GeoEvent | null) => void;
} {
  const [selectedEvent, setSelectedEvent] = useState<GeoEvent | null>(null);

  const selectEvent = useCallback((event: GeoEvent | null) => {
    setSelectedEvent((prev) => (prev?.id === event?.id ? null : event));
  }, []);

  return {
    events: MOCK_GEO_EVENTS,
    selectedEvent,
    loading: false,
    error: null,
    selectEvent,
  };
}
