'use client';

/**
 * useProfile 훅
 * Supabase profiles 테이블 조회/업데이트
 * 첫 로그인 시 기본 프로필 자동 생성
 */
import { useState, useEffect } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

interface UseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Omit<ProfileUpdate, 'id' | 'created_at'>) => Promise<void>;
}

/** 기본 프로필 값 (첫 로그인 시 사용) */
const DEFAULT_PROFILE: Omit<Database['public']['Tables']['profiles']['Insert'], 'id'> = {
  ui_mode: 'standard',
  language_level: 'general',
  investment_type: 'balanced',
  subscription_tier: 'free',
};

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      try {
        // 현재 사용자 확인
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setLoading(false);
          return;
        }

        // 프로필 조회
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          setError(fetchError.message);
          setLoading(false);
          return;
        }

        if (!data) {
          // 첫 로그인 — 기본 프로필 생성
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: newProfile, error: insertError } = await (supabase as any)
            .from('profiles')
            .upsert({ id: user.id, ...DEFAULT_PROFILE })
            .select()
            .single();

          if (insertError) {
            setError(insertError.message);
          } else {
            setProfile(newProfile);
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '프로필 로드 실패');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const updateProfile = async (updates: Omit<ProfileUpdate, 'id' | 'created_at'>) => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    if (!supabase || !profile) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: updateError } = await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
    } else if (data) {
      setProfile(data);
    }
  };

  return { profile, loading, error, updateProfile };
}
