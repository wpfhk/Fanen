import { useState } from 'react';
import { USE_MOCK } from '@/lib/mock';

/** AI 리포트 결과 타입 */
export interface AiReportResult {
  title: string;
  summary: string;
  sections: { heading: string; content: string }[];
  generatedAt: string;
}

/** AI 리포트 입력 타입 */
export interface ReportParams {
  period: '1m' | '3m' | '6m' | '1y';
  targetReturn: number;
}

/** AI 맞춤 리포트 훅 — Mock 모드에서는 샘플 리포트 반환 */
export function useAiReport() {
  const [report, setReport] = useState<AiReportResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateReport(params: ReportParams) {
    setLoading(true);

    if (USE_MOCK) {
      // Mock 리포트 생성
      await new Promise((r) => setTimeout(r, 1000));
      setReport({
        title: `${params.period} 투자 전략 리포트`,
        summary: `목표 수익률 ${params.targetReturn}% 달성을 위한 AI 맞춤 전략입니다.`,
        sections: [
          { heading: '시장 전망', content: '글로벌 반도체 시장 성장에 따라 관련 종목 비중 확대를 권장합니다. 미국 금리 인하 기대감으로 성장주 회복이 예상됩니다.' },
          { heading: '추천 섹터', content: 'AI/반도체, 2차전지, 바이오 섹터에 주목할 필요가 있습니다. 특히 HBM 관련 업체의 실적 개선이 기대됩니다.' },
          { heading: '리스크 요인', content: '미중 무역 갈등 심화, 환율 변동성 확대, 지정학적 리스크 등을 주의해야 합니다.' },
        ],
        generatedAt: new Date().toISOString(),
      });
      setLoading(false);
      return;
    }

    // TODO: Railway API 연동
    setLoading(false);
  }

  return { report, loading, generateReport };
}
