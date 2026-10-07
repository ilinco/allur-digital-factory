import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardHeader } from "@/components/ui/DashboardHeader";
import { PageContent } from "@/components/layout/PageContent";
import { KpiCardsRow } from "@/components/ui/KpiCardsRow";
import { ProductionTrendChart } from "@/components/ui/ProductionTrendChart";
import { ModelsProgressCard } from "@/components/ui/ModelsProgressCard";
import { DefectDistributionCard } from "@/components/ui/DefectDistributionCard";
import { ScheduleAndDowntimesCard } from "@/components/ui/ScheduleAndDowntimesCard";
import { StationsLoadCard } from "@/components/ui/StationsLoadCard";

export const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-02");
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

  return (
    <>
      <DashboardHeader
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onRefresh={refetchAll}
        isRefreshing={isFetching}
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
                Проверьте соединение с API (http://localhost:8000)
              </p>
              <button
                type="button"
                onClick={refetchAll}
                className="mt-4 cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Повторить попытку
              </button>
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
    </>
  );
};
