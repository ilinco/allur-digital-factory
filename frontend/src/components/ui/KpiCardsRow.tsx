import {
  IconAlertCircle,
  IconClipboardCheck,
  IconClockPause,
  IconGauge,
  IconPackage,
} from '@tabler/icons-react';
import { KpiCard } from './KpiCard';
import type { KpiSummaryResponse, StationStatus } from '@/types/dashboard';

interface KpiCardsRowProps {
  kpi?: KpiSummaryResponse;
  stations: StationStatus[];
  totalDefects: number;
  avgDefectPercent: number;
}

export const KpiCardsRow = ({
  kpi,
  stations,
  totalDefects,
  avgDefectPercent,
}: KpiCardsRowProps) => {
  const oee = kpi?.overall_oee ?? 84.82;
  const targetOee = kpi?.target_oee ?? 85.0;
  const oeeDiff = Number((oee - targetOee).toFixed(2));
  const totalFact = kpi?.total_fact ?? 346;
  const totalPlan = kpi?.total_plan ?? 360;
  const downtimeMin = kpi?.total_downtime_min ?? 85;

  const planDiff = totalFact - totalPlan;
  const fulfillmentNum = totalPlan > 0 ? (totalFact / totalPlan) * 100 : 0;
  const fulfillmentPercent = fulfillmentNum.toFixed(1);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 lg:grid-cols-5 sm:divide-y-0 lg:divide-x">
        <KpiCard
          icon={<IconGauge size={22} stroke={1.75} />}
          title="Общий OEE"
          value={`${oee}%`}
          delta={oeeDiff >= 0 ? `+${oeeDiff}%` : `${oeeDiff}%`}
          deltaPeriod={`vs цели (${targetOee}%)`}
          deltaType={oeeDiff >= 0 ? 'positive' : 'negative'}
        />

        <KpiCard
          icon={<IconPackage stroke={1.75} size={22} />}
          title="Фактический выпуск"
          value={`${totalFact} шт.`}
          delta={
            planDiff === 0
              ? '100%'
              : planDiff > 0
                ? `+${planDiff} шт.`
                : `${planDiff} шт.`
          }
          deltaPeriod={
            planDiff >= 0
              ? `выполнение (${fulfillmentPercent}%)`
              : `от плана (${fulfillmentPercent}%)`
          }
          deltaType={planDiff >= 0 ? 'positive' : 'negative'}
        />

        <KpiCard
          icon={<IconClipboardCheck size={22} stroke={1.75} />}
          title="Сменный план"
          value={`${totalPlan} шт.`}
          delta={`${stations.length || 3}`}
          deltaPeriod="активных участка"
          deltaType="neutral"
        />

        <KpiCard
          icon={<IconClockPause size={22} stroke={1.75} />}
          title="Время простоев"
          value={`${downtimeMin} мин`}
          delta={
            downtimeMin > 60 ? `+${downtimeMin - 60} мин` : `${downtimeMin} мин`
          }
          deltaPeriod={
            downtimeMin > 60
              ? 'превышение лимита 60 мин'
              : 'в пределах нормы (≤60 мин)'
          }
          deltaType={downtimeMin > 60 ? 'negative' : 'positive'}
        />

        <KpiCard
          icon={<IconAlertCircle size={22} stroke={1.75} />}
          title="Уровень брака"
          value={`${avgDefectPercent}%`}
          delta={`${totalDefects} ед.`}
          deltaPeriod={
            avgDefectPercent <= 2.0 ? 'в норме (≤2.0%)' : 'превышение порога 2%'
          }
          deltaType={avgDefectPercent <= 2.0 ? 'positive' : 'negative'}
        />
      </div>
    </div>
  );
};
