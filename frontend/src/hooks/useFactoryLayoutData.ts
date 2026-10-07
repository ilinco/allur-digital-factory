import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchFactoryLayout,
  recordDowntime,
  recordSectionEvent,
  triggerSimulationAction,
} from '@/api/factoryLayoutApi';
import type {
  DowntimeCreateRequest,
  SectionEventRequest,
  SectionNode,
  SimulationActionRequest,
  SimulationActionResponse,
} from '@/types/schema';

export const useFactoryLayoutData = (selectedDate: string = '2026-10-02') => {
  const queryClient = useQueryClient();
  const [selectedSectionId, setSelectedSectionId] = useState<string>('welding-1');
  const [simulationResponse, setSimulationResponse] =
    useState<SimulationActionResponse | null>(null);

  const layoutQuery = useQuery({
    queryKey: ['factory-layout', selectedDate],
    queryFn: () => fetchFactoryLayout(selectedDate),
  });

  const sections: SectionNode[] = useMemo(
    () => layoutQuery.data?.sections ?? [],
    [layoutQuery.data],
  );

  const selectedSection = useMemo(() => {
    return (
      sections.find((s) => s.id === selectedSectionId) ??
      sections[0] ??
      null
    );
  }, [sections, selectedSectionId]);

  const stats = useMemo(() => {
    const total = sections.length;
    let critical = 0;
    let warning = 0;
    let normal = 0;
    let totalEq = 0;
    let totalDt = 0;

    for (const s of sections) {
      if (s.status === 'critical') critical += 1;
      else if (s.status === 'warning') warning += 1;
      else if (s.status === 'normal') normal += 1;

      totalEq += s.equipment.length;
      totalDt += s.downtime_min;
    }

    const systemStatus: 'normal' | 'warning' | 'critical' =
      critical > 0 ? 'critical' : warning > 0 ? 'warning' : 'normal';

    return {
      totalSections: total,
      criticalCount: critical,
      warningCount: warning,
      normalCount: normal,
      totalEquipment: totalEq,
      totalDowntimeMin: totalDt,
      systemStatus,
    };
  }, [sections]);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['factory-layout'] }),
      queryClient.invalidateQueries({ queryKey: ['pipeline'] }),
      queryClient.invalidateQueries({ queryKey: ['kpi'] }),
    ]);
  };

  const simulationMutation = useMutation({
    mutationFn: (payload: SimulationActionRequest) =>
      triggerSimulationAction({ ...payload, record_date: selectedDate }),
    onSuccess: async (data) => {
      setSimulationResponse(data);
      if (data.affected_section?.id) {
        setSelectedSectionId(data.affected_section.id);
      }
      await invalidateAll();
    },
  });

  const downtimeMutation = useMutation({
    mutationFn: (payload: DowntimeCreateRequest) =>
      recordDowntime({ ...payload, record_date: selectedDate }),
    onSuccess: async (data) => {
      if (data.section_id) {
        setSelectedSectionId(data.section_id);
      }
      await invalidateAll();
    },
  });

  const sectionEventMutation = useMutation({
    mutationFn: ({
      sectionId,
      payload,
    }: {
      sectionId: string;
      payload: SectionEventRequest;
    }) => recordSectionEvent(sectionId, { ...payload, record_date: selectedDate }),
    onSuccess: async (data) => {
      if (data.section_id) {
        setSelectedSectionId(data.section_id);
      }
      await invalidateAll();
    },
  });

  const refetchAll = async () => {
    await layoutQuery.refetch();
  };

  const clearSimulationAlert = () => {
    setSimulationResponse(null);
  };

  return {
    sections,
    selectedSection,
    selectedSectionId,
    setSelectedSectionId,
    stats,
    isLoading: layoutQuery.isLoading,
    isFetching: layoutQuery.isFetching,
    isError: layoutQuery.isError,
    refetchAll,
    simulationResponse,
    clearSimulationAlert,
    triggerSimulation: simulationMutation.mutateAsync,
    isSimulating: simulationMutation.isPending,
    recordDowntimeAction: downtimeMutation.mutateAsync,
    isRecordingDowntime: downtimeMutation.isPending,
    recordEventAction: sectionEventMutation.mutateAsync,
    isRecordingEvent: sectionEventMutation.isPending,
  };
};
