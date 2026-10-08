import { useState } from 'react';
import { PageContent } from '@/components/layout/PageContent';
import { ForecastHeader } from '@/components/ui/forecast/ForecastHeader';
import { ForecastKpiCardsRow } from '@/components/ui/forecast/ForecastKpiCardsRow';
import { ForecastAiAnalyzingState } from '@/components/ui/forecast/ForecastAiAnalyzingState';
import { ForecastAiBanner } from '@/components/ui/forecast/ForecastAiBanner';
import { ForecastOverviewChartCard } from '@/components/ui/forecast/ForecastOverviewChartCard';
import { ForecastDailyPaceCard } from '@/components/ui/forecast/ForecastDailyPaceCard';
import { ForecastDistributionCard } from '@/components/ui/forecast/ForecastDistributionCard';
import { ForecastBottlenecksTableCard } from '@/components/ui/forecast/ForecastBottlenecksTableCard';
import { ForecastSimulationModal } from '@/components/ui/forecast/ForecastSimulationModal';
import { StatusGuideModal } from '@/components/ui/StatusGuideModal';
import { ErrorCard } from '@/components/ui/error/ErrorCard';
import { toast } from '@/context/notificationStore';
import { useForecastData } from '@/hooks/useForecastData';

export const ForecastPage = () => {
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
    totalOverviewForecast,
    dailyPaceData,
    distributionData,
    bottlenecks,
    totalLostUnits,
    aiRecommendations,
    isLoading,
    isFetching,
    isAnalyzing,
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
        isRefreshing={isFetching || isAnalyzing}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <PageContent>
        {isLoading ? (
          <ForecastAiAnalyzingState />
        ) : isError ? (
          <ErrorCard
            title="Связь с сервером прогнозов ограничена"
            message="Используются расчетные эвристики цифрового двойника Allur. Нажмите кнопку для повторного запроса."
            onRetry={refetchAll}
          />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {/* AI Digital Twin Banner with live analysis tracker */}
            <ForecastAiBanner
              onOpenSimulation={() => setIsSimulationOpen(true)}
              bottlenecksCount={bottlenecks.length}
              isAnalyzing={isAnalyzing}
            />

            {/* Top KPI Cards Row */}
            <ForecastKpiCardsRow
              forecast={forecast}
              totalLostUnits={totalLostUnits}
            />

            {/* Middle Row: Overview Stacked Bar Chart (8 cols) + Daily Pace & AI Recs (4 cols) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7 xl:col-span-8">
                <ForecastOverviewChartCard
                  data={overviewData}
                  totalForecast={totalOverviewForecast}
                  horizon={horizon}
                />
              </div>
              <div className="lg:col-span-5 xl:col-span-4">
                <ForecastDailyPaceCard
                  data={dailyPaceData}
                  aiRecommendations={aiRecommendations}
                  onOpenSimulation={() => setIsSimulationOpen(true)}
                  isAnalyzing={isAnalyzing}
                />
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
                  aiRecommendations={aiRecommendations}
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
          toast.success(
            `Сценарий для «${targetModel}» применен (+${simulateDowntimeMin} мин простоя)`,
            { title: 'Предиктивный прогноз' },
          );
          refetchAll();
        }}
        isApplying={isFetching}
      />

      <StatusGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};
