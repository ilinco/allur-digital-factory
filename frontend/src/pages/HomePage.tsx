import { useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardHeader } from '@/components/ui/dashboard/DashboardHeader';
import { PageContent } from '@/components/layout/PageContent';
import { KpiCardsRow } from '@/components/ui/KpiCardsRow';
import { ProductionTrendChart } from '@/components/ui/ProductionTrendChart';
import { ModelsProgressCard } from '@/components/ui/ModelsProgressCard';
import { DefectDistributionCard } from '@/components/ui/DefectDistributionCard';
import { ScheduleAndDowntimesCard } from '@/components/ui/ScheduleAndDowntimesCard';
import { StationsLoadCard } from '@/components/ui/StationsLoadCard';
import { StatusGuideModal } from '@/components/ui/StatusGuideModal';
import { Button } from '@/components/ui/Button';
import { useLockedBody } from '@/hooks/useLockedBody';

export const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-02');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const {
    kpi,
    stations,
    totalDefects,
    avgDefectPercent,
    hourlyPace,
    downtimes,
    isLoading,
    isFetching,
    isError,
    refetchAll,
  } = useDashboardData(selectedDate);

  useLockedBody(isGuideOpen);

  return (
    <>
      <DashboardHeader
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onRefresh={refetchAll}
        isRefreshing={isFetching}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <PageContent>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 rounded-2xl border border-slate-200 bg-white" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="h-80 rounded-2xl border border-slate-200 bg-white lg:col-span-8" />
              <div className="h-80 rounded-2xl border border-slate-200 bg-white lg:col-span-4" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
              <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
              <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
            <p className="text-base font-semibold text-rose-600">
              Не удалось загрузить данные с сервера завода
            </p>
            <p className="mt-1.5 text-sm font-medium text-slate-500">
              Проверьте соединение с API
            </p>
            <Button variant="primary" onClick={refetchAll} className="mt-4">
              Повторить попытку
            </Button>
          </div>
        ) : (
          <>
            {/* Top KPI Cards Row */}
            <KpiCardsRow
              kpi={kpi}
              stations={stations}
              totalDefects={totalDefects}
              avgDefectPercent={avgDefectPercent}
            />

            {/* Middle Section: Main Chart (65%) + Models Progress (35%) */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7 xl:col-span-8">
                <ProductionTrendChart
                  data={hourlyPace}
                  totalFact={kpi?.total_fact}
                  totalPlan={kpi?.total_plan}
                />
              </div>
              <div className="lg:col-span-5 xl:col-span-4">
                <ModelsProgressCard models={kpi?.models_progress ?? []} />
              </div>
            </div>

            {/* Bottom Section: 3 equal cards */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
              <DefectDistributionCard
                stations={stations}
                totalDefects={totalDefects}
              />
              <ScheduleAndDowntimesCard
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                stations={stations}
                downtimes={downtimes}
              />
              <StationsLoadCard stations={stations} />
            </div>
          </>
        )}
      </PageContent>

      <StatusGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};
