import { api } from '@/api/axios';
import type {
  DowntimeCreateRequest,
  DowntimeCreateResponse,
  FactoryLayoutResponse,
  SectionEventRequest,
  SectionEventResponse,
  SimulationActionRequest,
  SimulationActionResponse,
} from '@/types/schema';

export const fetchFactoryLayout = async (
  date?: string,
): Promise<FactoryLayoutResponse> => {
  const response = await api.get<FactoryLayoutResponse>(
    '/api/v1/factory/layout',
    {
      params: date ? { date } : undefined,
    },
  );
  return response.data;
};

export const triggerSimulationAction = async (
  payload: SimulationActionRequest,
): Promise<SimulationActionResponse> => {
  const response = await api.post<SimulationActionResponse>(
    '/api/v1/simulation/action',
    payload,
  );
  return response.data;
};

export const recordDowntime = async (
  payload: DowntimeCreateRequest,
): Promise<DowntimeCreateResponse> => {
  const response = await api.post<DowntimeCreateResponse>(
    '/api/v1/downtimes',
    payload,
  );
  return response.data;
};

export const recordSectionEvent = async (
  sectionId: string,
  payload: SectionEventRequest,
): Promise<SectionEventResponse> => {
  const response = await api.post<SectionEventResponse>(
    `/api/v1/sections/${sectionId}/events`,
    payload,
  );
  return response.data;
};
