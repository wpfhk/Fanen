/**
 * useSectorCausalMap 훅
 * Supabase sector_causal_maps 테이블에서 섹터 인과관계 데이터 조회
 * USE_MOCK=true 시 mockSector 데이터 사용
 */
import { useState, useEffect } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { USE_MOCK } from '@/lib/mock';
import { MOCK_SECTOR_NODES, MOCK_SECTOR_LINKS } from '@/lib/mock/mockSector';
import type { Database } from '@/types/database.types';
import type { SectorNode, SectorLink } from '../types';

type SectorCausalMapRow = Database['public']['Tables']['sector_causal_maps']['Row'];

interface UseSectorCausalMapReturn {
  nodes: SectorNode[];
  links: SectorLink[];
  selectedSector: string | null;
  setSelectedSector: (id: string | null) => void;
  loading: boolean;
  error: string | null;
}

export function useSectorCausalMap(): UseSectorCausalMapReturn {
  const [nodes, setNodes] = useState<SectorNode[]>(USE_MOCK ? MOCK_SECTOR_NODES : []);
  const [links, setLinks] = useState<SectorLink[]>(USE_MOCK ? MOCK_SECTOR_LINKS : []);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock 모드 — Supabase 없이 mock 데이터 사용
    if (USE_MOCK) return;

    async function fetchData() {
      // Supabase 설정 여부 확인
      if (!isSupabaseConfigured()) {
        setNodes(MOCK_SECTOR_NODES);
        setLinks(MOCK_SECTOR_LINKS);
        setLoading(false);
        return;
      }

      // Supabase 클라이언트 생성
      const supabase = createClient();
      if (!supabase) {
        setNodes(MOCK_SECTOR_NODES);
        setLinks(MOCK_SECTOR_LINKS);
        setLoading(false);
        return;
      }

      try {
        // sector_causal_maps 전체 조회
        const { data: rawRows, error: supabaseError } = await supabase
          .from('sector_causal_maps')
          .select('*');
        const rows = rawRows as SectorCausalMapRow[] | null;

        if (supabaseError) {
          setError(supabaseError.message);
          setLoading(false);
          return;
        }

        const causalRows = rows ?? [];

        // 노드 dedup 처리 — from_sector + to_sector 수집 후 중복 제거
        const sectorSet = new Set<string>();
        causalRows.forEach((row) => {
          if (row.from_sector) sectorSet.add(row.from_sector);
          if (row.to_sector) sectorSet.add(row.to_sector);
        });

        const sectorNodes: SectorNode[] = Array.from(sectorSet).map((name) => ({
          id: name,
          name,
        }));

        // SectorLink 변환
        const sectorLinks: SectorLink[] = causalRows.map((row) => ({
          source: row.from_sector,
          target: row.to_sector,
          causal_strength: row.causal_strength ?? 0,
          description: row.description ?? '',
        }));

        setNodes(sectorNodes);
        setLinks(sectorLinks);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { nodes, links, selectedSector, setSelectedSector, loading, error };
}
