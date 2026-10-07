import { api } from '@/api/axios';
import type { KpiSummaryResponse, PipelineResponse } from '@/types/dashboard';

export const fetchPipelineData = async (
  date?: string,
): Promise<PipelineResponse> => {
  const response = await api.get<PipelineResponse>('/api/v1/factory/pipeline', {
    params: date ? { date } : undefined,
  });
  return response.data;
};

export const fetchKpiData = async (
  date?: string,
): Promise<KpiSummaryResponse> => {
  const response = await api.get<KpiSummaryResponse>('/api/v1/analytics/kpi', {
    params: date ? { date } : undefined,
  });
  return response.data;
};
