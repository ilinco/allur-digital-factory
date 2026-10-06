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

  const fulfillmentPercent =
    totalPlan > 0 ? ((totalFact / totalPlan) * 100).toFixed(1) : '0.0';

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
          delta={`+${fulfillmentPercent}%`}
          deltaPeriod="выполнение плана"
          deltaType={Number(fulfillmentPercent) >= 95 ? 'positive' : 'neutral'}
        />

        <KpiCard
          icon={<IconClipboardCheck size={22} stroke={1.75} />}
          title="Сменный план"
          value={`${totalPlan} шт.`}
          delta={`${stations.length || 3}`}
          deltaPeriod="активных участка"
          deltaType="positive"
        />

        <KpiCard
          icon={<IconClockPause size={22} stroke={1.75} />}
          title="Время простоев"
          value={`${downtimeMin} мин`}
          delta={downtimeMin > 60 ? '+25 мин' : '-15 мин'}
          deltaPeriod={downtimeMin > 60 ? 'превышение SLA' : 'в норме SLA'}
          deltaType={downtimeMin > 60 ? 'negative' : 'positive'}
        />

        <KpiCard
          icon={<IconAlertCircle size={22} stroke={1.75} />}
          title="Уровень брака"
          value={`${avgDefectPercent}%`}
          delta={`${totalDefects} ед.`}
          deltaPeriod="отбраковано"
          deltaType={avgDefectPercent <= 2.5 ? 'positive' : 'negative'}
        />
      </div>
    </div>
  );
};
