import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchKpiData, fetchPipelineData } from "../api/dashboardApi";
import type { DowntimeIncident, HourlyPacePoint } from "@/types/dashboard";

const DOWNTIME_RECORDS: Record<string, DowntimeIncident[]> = {
  "2026-10-02": [
    {
      id: "dt-1",
      section: "Сборка-1",
      equipment: "Конвейер-03",
      reason: "Обрыв цепи привода",
      durationMinutes: 55,
      status: "critical",
    },
    {
      id: "dt-2",
      section: "Сварка-1",
      equipment: "Робот ABB-04",
      reason: "Плановое ТО сервопривода",
      durationMinutes: 30,
      status: "warning",
    },
  ],
  "2026-10-01": [
    {
      id: "dt-3",
      section: "Окраска-1",
      equipment: "Камера-02",
      reason: "Замена фильтрующих элементов",
      durationMinutes: 40,
      status: "warning",
    },
    {
      id: "dt-4",
      section: "Сварка-1",
      equipment: "Робот ABB-01",
      reason: "Калибровка оптического датчика",
      durationMinutes: 25,
      status: "normal",
    },
  ],
};

export const useDashboardData = (selectedDate: string = "2026-10-02") => {
  const pipelineQuery = useQuery({
    queryKey: ["pipeline", selectedDate],
    queryFn: () => fetchPipelineData(selectedDate),
  });

  const kpiQuery = useQuery({
    queryKey: ["kpi", selectedDate],
    queryFn: () => fetchKpiData(selectedDate),
  });

  const previousDate = selectedDate === "2026-10-02" ? "2026-10-01" : undefined;

  const prevKpiQuery = useQuery({
    queryKey: ["kpi", previousDate],
    queryFn: () => (previousDate ? fetchKpiData(previousDate) : null),
    enabled: Boolean(previousDate),
  });

  const stations = useMemo(
    () => pipelineQuery.data?.stations ?? [],
    [pipelineQuery.data],
  );
  const kpi = kpiQuery.data;
  const prevKpi = prevKpiQuery.data;

  const totalDefects = useMemo(() => {
    return stations.reduce((sum, s) => {
      const defects = Math.round((s.fact * s.defect_percent) / 100);
      return sum + defects;
    }, 0);
  }, [stations]);

  const avgDefectPercent = useMemo(() => {
    if (!stations.length) return 0;
    const totalFact = stations.reduce((acc, s) => acc + s.fact, 0);
    if (!totalFact) return 0;
    return Number(((totalDefects / totalFact) * 100).toFixed(2));
  }, [stations, totalDefects]);

  const hourlyPace = useMemo<HourlyPacePoint[]>(() => {
    const totalFact = kpi?.total_fact ?? 346;
    const totalPlan = kpi?.total_plan ?? 360;

    const intervals = [
      { time: "08:00", factor: 0.12 },
      { time: "10:00", factor: 0.28 },
      { time: "12:00", factor: 0.46 },
      { time: "14:00", factor: 0.62 },
      { time: "16:00", factor: 0.78 },
      { time: "18:00", factor: 0.91 },
      { time: "20:00", factor: 1.0 },
    ];

    return intervals.map((interval) => {
      const planVal = Math.round(totalPlan * interval.factor);
      const factVal = Math.round(totalFact * interval.factor);
      return {
        time: interval.time,
        fact: factVal,
        plan: planVal,
        weldingFact: Math.round(factVal * 0.32),
        paintingFact: Math.round(factVal * 0.34),
        assemblyFact: Math.round(factVal * 0.34),
      };
    });
  }, [kpi]);

  const downtimes = useMemo<DowntimeIncident[]>(() => {
    return (
      DOWNTIME_RECORDS[selectedDate] ?? [
        {
          id: "dt-fallback",
          section: "Все участки",
          equipment: "Конвейерная линия",
          reason: "Штатный технологический перерыв",
          durationMinutes: kpi?.total_downtime_min ?? 0,
          status: "normal",
        },
      ]
    );
  }, [selectedDate, kpi?.total_downtime_min]);

  const refetchAll = async () => {
    await Promise.all([pipelineQuery.refetch(), kpiQuery.refetch()]);
  };

  return {
    pipeline: pipelineQuery.data,
    kpi: kpiQuery.data,
    prevKpi,
    stations,
    totalDefects,
    avgDefectPercent,
    hourlyPace,
    downtimes,
    isLoading: pipelineQuery.isLoading || kpiQuery.isLoading,
    isFetching: pipelineQuery.isFetching || kpiQuery.isFetching,
    isError: pipelineQuery.isError || kpiQuery.isError,
    refetchAll,
  };
};
