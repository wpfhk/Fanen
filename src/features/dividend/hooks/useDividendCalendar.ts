/**
 * useDividendCalendar 훅
 * Supabase dividend_calendar 테이블에서 월별 배당 데이터 조회
 */
import { useState, useEffect } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { USE_MOCK } from '@/lib/mock';
import { MOCK_DIVIDEND_CALENDAR } from '@/lib/mock/mockDividend';
import type { DividendCalendarRow } from '../types';

interface UseDividendCalendarReturn {
  data: DividendCalendarRow[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  loading: boolean;
  error: string | null;
}

/** 현재 월 기준 YYYY-MM 문자열 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function useDividendCalendar(): UseDividendCalendarReturn {
  // Mock 모드: 전체 캘린더 데이터 반환 (월 필터 없이)
  if (USE_MOCK) {
    return {
      data: MOCK_DIVIDEND_CALENDAR,
      selectedMonth: getCurrentMonth(),
      setSelectedMonth: () => {},
      loading: false,
      error: null,
    };
  }
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [data, setData] = useState<DividendCalendarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseConfigured()) {
        setData([]);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 선택된 월의 배당락일 기준으로 필터링
        const startDate = `${selectedMonth}-01`;
        const [year, month] = selectedMonth.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;

        const { data: rows, error: supabaseError } = await supabase
          .from('dividend_calendar')
          .select('*')
          .gte('ex_dividend_date', startDate)
          .lte('ex_dividend_date', endDate)
          .order('ex_dividend_date', { ascending: true });

        if (supabaseError) {
          setError(supabaseError.message);
        } else {
          setData(rows ?? []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedMonth]);

  return { data, selectedMonth, setSelectedMonth, loading, error };
}
