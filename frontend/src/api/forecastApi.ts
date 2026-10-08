import { api } from '@/api/axios';
import type {
  PredictiveForecastRequest,
  PredictiveForecastResponse,
} from '@/types/forecast';

export const fetchForecast = async (
  date?: string,
  targetModel: string = 'Chevrolet Onix',
): Promise<PredictiveForecastResponse> => {
  const response = await api.get<PredictiveForecastResponse>(
    '/api/v1/analytics/forecast',
    {
      params: {
        date: date || undefined,
        target_model: targetModel,
      },
      timeout: 60_000,
    },
  );
  return response.data;
};

export const postPredictiveForecast = async (
  request: PredictiveForecastRequest,
): Promise<PredictiveForecastResponse> => {
  const response = await api.post<PredictiveForecastResponse>(
    '/api/v1/analytics/predictive-forecast',
    request,
    {
      timeout: 60_000,
    },
  );
  return response.data;
};
