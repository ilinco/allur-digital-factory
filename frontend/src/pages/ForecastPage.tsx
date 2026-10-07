import { useState } from 'react';
import { PageContent } from '@/components/layout/PageContent';
import { Button } from '@/components/ui/Button';
import { ForecastHeader } from '@/components/ui/forecast/ForecastHeader';
import { ForecastKpiCardsRow } from '@/components/ui/forecast/ForecastKpiCardsRow';
import { ForecastOverviewChartCard } from '@/components/ui/forecast/ForecastOverviewChartCard';
import { ForecastDailyPaceCard } from '@/components/ui/forecast/ForecastDailyPaceCard';
import { ForecastDistributionCard } from '@/components/ui/forecast/ForecastDistributionCard';
import { ForecastBottlenecksTableCard } from '@/components/ui/forecast/ForecastBottlenecksTableCard';
import { ForecastSimulationModal } from '@/components/ui/forecast/ForecastSimulationModal';
import { useForecastData } from '@/hooks/useForecastData';

export const ForecastPage = () => {
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  const {
    forecast,
    selectedDate,
    setSelectedDate,
    targetModel,
    setTargetModel,
    simulateDowntimeMin,
    setSimulateDowntimeMin,
    horizon,
    setHorizon,
    overviewData,
    dailyPaceData,
    distributionData,
    bottlenecks,
    totalLostUnits,
    isLoading,
    isFetching,
    isError,
    refetchAll,
  } = useForecastData();

  return (
    <>
      <ForecastHeader
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        horizon={horizon}
        onChangeHorizon={setHorizon}
        onRefresh={refetchAll}
        isRefreshing={isFetching}
        onOpenSimulation={() => setIsSimulationOpen(true)}
      />

      <PageContent>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="h-32 rounded-2xl border border-slate-200 bg-white" />
              <div className="h-32 rounded-2xl border border-slate-200 bg-white" />
              <div className="h-32 rounded-2xl border border-slate-200 bg-white" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="h-96 rounded-2xl border border-slate-200 bg-white lg:col-span-8" />
              <div className="h-96 rounded-2xl border border-slate-200 bg-white lg:col-span-4" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="h-80 rounded-2xl border border-slate-200 bg-white lg:col-span-4" />
              <div className="h-80 rounded-2xl border border-slate-200 bg-white lg:col-span-8" />
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
            <p className="text-base font-semibold text-rose-600">
              Не удалось загрузить прогноз с сервера завода
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-500">
              Проверьте соединение с API
            </p>
            <Button variant="primary" onClick={refetchAll} className="mt-4">
              Повторить попытку
            </Button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {/* Top KPI Cards Row (3 cards matching screenshot) */}
            <ForecastKpiCardsRow
              forecast={forecast}
              totalLostUnits={totalLostUnits}
            />

            {/* Middle Row: Overview Stacked Bar Chart (8 cols) + Daily Pace Bar Chart (4 cols) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7 xl:col-span-8">
                <ForecastOverviewChartCard data={overviewData} />
              </div>
              <div className="lg:col-span-5 xl:col-span-4">
                <ForecastDailyPaceCard data={dailyPaceData} />
              </div>
            </div>

            {/* Bottom Row: Distribution Donut Chart (4 cols) + Bottlenecks List/Table (8 cols) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
              <div className="lg:col-span-5 xl:col-span-4">
                <ForecastDistributionCard data={distributionData} />
              </div>
              <div className="lg:col-span-7 xl:col-span-8">
                <ForecastBottlenecksTableCard
                  bottlenecks={bottlenecks}
                  onOpenSimulation={() => setIsSimulationOpen(true)}
                />
              </div>
            </div>
          </div>
        )}
      </PageContent>

      <ForecastSimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        simulateDowntimeMin={simulateDowntimeMin}
        onDowntimeChange={setSimulateDowntimeMin}
        targetModel={targetModel}
        onModelChange={setTargetModel}
        forecast={forecast}
        onApply={() => {
          setIsSimulationOpen(false);
          refetchAll();
        }}
        isApplying={isFetching}
      />
    </>
  );
};
