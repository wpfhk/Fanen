'use client';
import { useState } from 'react';
import { MOCK_GLOBAL_NEWS, type GlobalNewsItem } from '@/lib/mock/mockGlobalNews';
import { USE_MOCK } from '@/lib/mock';

export function useGlobalNews() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const news = USE_MOCK ? MOCK_GLOBAL_NEWS : MOCK_GLOBAL_NEWS; // 실 환경도 현재는 mock

  const selectedNews = news.find((n) => n.id === selectedId) ?? null;

  const selectNews = (id: string) => {
    setSelectedId(id);
    setAnalyzed(false);
  };

  const analyze = async () => {
    if (!selectedNews) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1500)); // Mock 분석 딜레이
    setIsAnalyzing(false);
    setAnalyzed(true);
  };

  return { news, selectedNews, selectedId, selectNews, analyze, isAnalyzing, analyzed };
}
