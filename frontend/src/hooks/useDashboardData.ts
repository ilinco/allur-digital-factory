import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchAvailableDates,
  fetchDowntimes,
  fetchKpiData,
  fetchPipelineData,
} from "../api/dashboardApi";
import type { DowntimeIncident, HourlyPacePoint } from "@/types/dashboard";

const FALLBACK_OCTOBER_DATES = [
  "2026-10-01",
  "2026-10-02",
  "2026-10-03",
  "2026-10-04",
  "2026-10-05",
  "2026-10-06",
  "2026-10-07",
  "2026-10-08",
];

export const useDashboardData = (selectedDate: string = "2026-10-08") => {
  const datesQuery = useQuery({
    queryKey: ["factory-dates"],
    queryFn: fetchAvailableDates,
    staleTime: 60_000,
  });

  const pipelineQuery = useQuery({
    queryKey: ["pipeline", selectedDate],
    queryFn: () => fetchPipelineData(selectedDate),
  });

  const kpiQuery = useQuery({
    queryKey: ["kpi", selectedDate],
    queryFn: () => fetchKpiData(selectedDate),
  });

  const downtimesQuery = useQuery({
    queryKey: ["downtimes", selectedDate],
    queryFn: () => fetchDowntimes(selectedDate),
  });

  const availableDates = datesQuery.data?.dates ?? FALLBACK_OCTOBER_DATES;
  const currentIndex = availableDates.indexOf(selectedDate);
  const previousDate = currentIndex > 0 ? availableDates[currentIndex - 1] : undefined;

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
    const totalFact = kpi?.total_fact ?? 345;
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
    if (downtimesQuery.data && downtimesQuery.data.length > 0) {
      return downtimesQuery.data.map((d) => ({
        id: `dt-${d.id}`,
        section: d.section_name || d.section_id,
        equipment: d.equipment,
        reason: d.reason,
        durationMinutes: d.duration_minutes,
        status:
          d.duration_minutes > 60
            ? "critical"
            : d.duration_minutes >= 30
              ? "warning"
              : "normal",
      }));
    }

    return [
      {
        id: "dt-fallback",
        section: "Все участки",
        equipment: "Конвейерная линия",
        reason: "Штатный технологический перерыв",
        durationMinutes: kpi?.total_downtime_min ?? 0,
        status: "normal",
      },
    ];
  }, [downtimesQuery.data, kpi?.total_downtime_min]);

  const refetchAll = async () => {
    await Promise.all([
      pipelineQuery.refetch(),
      kpiQuery.refetch(),
      downtimesQuery.refetch(),
      datesQuery.refetch(),
    ]);
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
    availableDates,
    isLoading: pipelineQuery.isLoading || kpiQuery.isLoading,
    isFetching:
      pipelineQuery.isFetching ||
      kpiQuery.isFetching ||
      downtimesQuery.isFetching,
    isError: pipelineQuery.isError || kpiQuery.isError,
    refetchAll,
  };
};
