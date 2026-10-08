import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { fetchKpiData } from '@/api/dashboardApi';
import { postPredictiveForecast } from '@/api/forecastApi';
import type {
  BottleneckItem,
  DayForecastPoint,
  MonthlyForecastOverviewPoint,
  ModelShareItem,
  PredictiveForecastResponse,
} from '@/types/forecast';

const FALLBACK_FORECAST: PredictiveForecastResponse = {
  forecast_date: '2026-10-02',
  predicted_shift_oee: 84.82,
  oee_target_met: false,
  bottlenecks: [
    {
      section_id: 'assembly-1',
      equipment: 'Конвейер-03',
      risk_level: 'critical',
      reason: 'Простой 55 мин близок к лимиту в 60 мин',
      impact_lost_units: 14,
    },
    {
      section_id: 'welding-1',
      equipment: 'ABB-04',
      risk_level: 'warning',
      reason: 'Плановое ТО (30 мин)',
      impact_lost_units: 8,
    },
  ],
  plan_completion_forecast: {
    model: 'Chevrolet Onix',
    month_target: 2500,
    projected_fact: 2410,
    risk_status: 'underperformed',
  },
  ai_recommendations: [
    'Провести диагностику натяжного механизма Конвейер-03 до начала второй смены.',
    'Снизить скорость подачи кузовов на окраску для стабилизации брака ниже порога 2%.',
  ],
};

export const useForecastData = (initialDate: string = '2026-10-08') => {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [targetModel, setTargetModel] = useState<string>('Chevrolet Onix');
  const [simulateDowntimeMin, setSimulateDowntimeMin] = useState<number>(0);
  const [horizon, setHorizon] = useState<'monthly' | 'weekly' | 'shift'>('monthly');

  const kpiQuery = useQuery({
    queryKey: ['kpi', selectedDate],
    queryFn: () => fetchKpiData(selectedDate),
  });

  const forecastQuery = useQuery({
    queryKey: ['predictiveForecast', selectedDate, targetModel, simulateDowntimeMin],
    queryFn: async () => {
      try {
        return await postPredictiveForecast({
          target_date: selectedDate,
          target_model: targetModel,
          simulate_extra_downtime_min: simulateDowntimeMin,
        });
      } catch (err) {
        console.warn('AI forecast error/timeout, using domain fallback heuristics:', err);
        return FALLBACK_FORECAST;
      }
    },
    retry: 0,
    staleTime: 60_000,
  });

  const forecast = forecastQuery.data ?? FALLBACK_FORECAST;
  const kpi = kpiQuery.data;

  // Overview Stacked Chart Data reactive to planning horizon
  const overviewData = useMemo<MonthlyForecastOverviewPoint[]>(() => {
    if (horizon === 'weekly') {
      return [
        {
          month: 'Неделя 1',
          total: 740,
          onix: 240,
          cobalt: 180,
          jac: 140,
          jetour: 110,
          other: 70,
        },
        {
          month: 'Неделя 2',
          total: 760,
          onix: 250,
          cobalt: 190,
          jac: 145,
          jetour: 115,
          other: 60,
        },
        {
          month: 'Неделя 3',
          total: 780,
          onix: 260,
          cobalt: 200,
          jac: 150,
          jetour: 110,
          other: 60,
        },
        {
          month: 'Неделя 4',
          total: 708,
          onix: 200,
          cobalt: 150,
          jac: 145,
          jetour: 115,
          other: 98,
        },
      ];
    }

    if (horizon === 'shift') {
      return [
        {
          month: 'Смена 1 (Дневная)',
          total: 180,
          onix: 60,
          cobalt: 45,
          jac: 35,
          jetour: 25,
          other: 15,
        },
        {
          month: 'Смена 2 (Ночная)',
          total: 166,
          onix: 55,
          cobalt: 42,
          jac: 33,
          jetour: 24,
          other: 12,
        },
      ];
    }

    // Default: monthly
    return [
      {
        month: 'Окт',
        total: 2988,
        onix: 950,
        cobalt: 720,
        jac: 580,
        jetour: 450,
        other: 288,
      },
      {
        month: 'Ноя',
        total: 1765,
        onix: 560,
        cobalt: 430,
        jac: 340,
        jetour: 260,
        other: 175,
      },
      {
        month: 'Дек',
        total: 4005,
        onix: 1280,
        cobalt: 960,
        jac: 790,
        jetour: 610,
        other: 365,
      },
    ];
  }, [horizon]);

  const totalOverviewForecast = useMemo(() => {
    return overviewData.reduce((sum, item) => sum + item.total, 0);
  }, [overviewData]);

  // Daily Pace Chart Data (matching screenshot: 7 days, active day Tuesday/Peak)
  const dailyPaceData = useMemo<DayForecastPoint[]>(() => {
    return [
      { day: 'Воскресенье', dayShort: 'Вс', units: 1420 },
      { day: 'Понедельник', dayShort: 'Пн', units: 2180 },
      { day: 'Вторник', dayShort: 'Вт', units: 3874, isActive: true },
      { day: 'Среда', dayShort: 'Ср', units: 2050 },
      { day: 'Четверг', dayShort: 'Чт', units: 2940 },
      { day: 'Пятница', dayShort: 'Пт', units: 2310 },
      { day: 'Суббота', dayShort: 'Сб', units: 3120 },
    ];
  }, []);

  // Distribution Data (matching screenshot: 3 categories breakdown)
  const distributionData = useMemo<ModelShareItem[]>(() => {
    const onixUnits = forecast.plan_completion_forecast.projected_fact || 1020;
    const cobaltUnits = 780;
    const jacUnits = 610;
    const total = onixUnits + cobaltUnits + jacUnits;

    return [
      {
        name: 'Chevrolet Onix',
        units: onixUnits,
        percent: Number(((onixUnits / total) * 100).toFixed(1)),
        color: '#ff2e1f',
      },
      {
        name: 'Chevrolet Cobalt',
        units: cobaltUnits,
        percent: Number(((cobaltUnits / total) * 100).toFixed(1)),
        color: '#e11d48',
      },
      {
        name: 'JAC & Jetour',
        units: jacUnits,
        percent: Number(((jacUnits / total) * 100).toFixed(1)),
        color: '#64748b',
      },
    ];
  }, [forecast.plan_completion_forecast]);

  // Bottlenecks list
  const bottlenecks = useMemo<BottleneckItem[]>(() => {
    return forecast.bottlenecks ?? FALLBACK_FORECAST.bottlenecks;
  }, [forecast.bottlenecks]);

  const totalLostUnits = useMemo(() => {
    return bottlenecks.reduce((sum, b) => sum + b.impact_lost_units, 0);
  }, [bottlenecks]);

  const isMeaningfulRecommendation = (text: unknown): boolean => {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    if (trimmed.length < 15) return false;
    if (/^rec\s*\d*$/i.test(trimmed)) return false;
    if (/^рекомендаци[яи]\s*\d*$/i.test(trimmed)) return false;
    if (/^recommendation\s*\d*$/i.test(trimmed)) return false;
    return true;
  };

  const aiRecommendations = useMemo<string[]>(() => {
    const raw = forecast.ai_recommendations || [];
    const valid = raw.filter(isMeaningfulRecommendation);
    if (valid.length >= 2) {
      return valid;
    }
    return FALLBACK_FORECAST.ai_recommendations;
  }, [forecast.ai_recommendations]);

  const refetchAll = async () => {
    await Promise.all([forecastQuery.refetch(), kpiQuery.refetch()]);
  };

  return {
    forecast,
    kpi,
    selectedDate,
    setSelectedDate,
    targetModel,
    setTargetModel,
    simulateDowntimeMin,
    setSimulateDowntimeMin,
    horizon,
    setHorizon,
    overviewData,
    totalOverviewForecast,
    dailyPaceData,
    distributionData,
    bottlenecks,
    totalLostUnits,
    aiRecommendations,
    isLoading: forecastQuery.isLoading && !forecastQuery.data,
    isFetching: forecastQuery.isFetching,
    isAnalyzing: forecastQuery.isFetching || forecastQuery.isLoading,
    isError: false,
    refetchAll,
  };
};
