/**
 * usePortfolios 훅
 * Supabase portfolios 테이블 CRUD 처리
 * — 'use client' 지시어 사용 금지 (훅 파일)
 */
import { useState, useEffect, useCallback } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { USE_MOCK } from '@/lib/mock';
import { MOCK_PORTFOLIOS } from '@/lib/mock/mockPortfolio';
import type { PortfolioRow } from '../types';

interface UsePortfoliosReturn {
  portfolios: PortfolioRow[];
  loading: boolean;
  error: string | null;
  createPortfolio: (data: {
    name: string;
    description?: string;
    total_value: number;
  }) => Promise<void>;
  updatePortfolio: (
    id: string,
    data: { name?: string; description?: string; total_value?: number },
  ) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
}

/** Mock 모드 noop 함수 */
const noop = async () => {};

export function usePortfolios(): UsePortfoliosReturn {
  // Mock 모드: 즉시 Mock 데이터 반환
  if (USE_MOCK) {
    return {
      portfolios: MOCK_PORTFOLIOS,
      loading: false,
      error: null,
      createPortfolio: noop,
      updatePortfolio: noop,
      deletePortfolio: noop,
    };
  }
  const [portfolios, setPortfolios] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** 현재 사용자의 포트폴리오 전체 조회 */
  const fetchPortfolios = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setPortfolios([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setPortfolios([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 현재 로그인 사용자 확인
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setPortfolios([]);
        setLoading(false);
        return;
      }

      const { data: rows, error: supabaseError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        setError(supabaseError.message);
      } else {
        setPortfolios((rows as PortfolioRow[]) ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '포트폴리오 로드 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  /** 포트폴리오 생성 */
  const createPortfolio = useCallback(
    async (data: { name: string; description?: string; total_value: number }) => {
      if (!isSupabaseConfigured()) return;

      const supabase = createClient();
      if (!supabase) return;

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError('로그인이 필요합니다');
        return;
      }

      setError(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase v2 insert 타입 추론 버그 workaround
      const { error: insertError } = await (supabase as any)
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: data.name,
          description: data.description ?? null,
          total_value: data.total_value,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
      } else {
        // 생성 후 목록 갱신
        await fetchPortfolios();
      }
    },
    [fetchPortfolios],
  );

  /** 포트폴리오 수정 */
  const updatePortfolio = useCallback(
    async (
      id: string,
      data: { name?: string; description?: string; total_value?: number },
    ) => {
      if (!isSupabaseConfigured()) return;

      const supabase = createClient();
      if (!supabase) return;

      setError(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase v2 update 타입 추론 버그 workaround
      const { error: updateError } = await (supabase as any)
        .from('portfolios')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
      } else {
        // 수정 후 목록 갱신
        await fetchPortfolios();
      }
    },
    [fetchPortfolios],
  );

  /** 포트폴리오 삭제 */
  const deletePortfolio = useCallback(
    async (id: string) => {
      if (!isSupabaseConfigured()) return;

      const supabase = createClient();
      if (!supabase) return;

      setError(null);

      const { error: deleteError } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
      } else {
        // 삭제 후 옵티미스틱 업데이트
        setPortfolios((prev) => prev.filter((p) => p.id !== id));
      }
    },
    [],
  );

  return { portfolios, loading, error, createPortfolio, updatePortfolio, deletePortfolio };
}
