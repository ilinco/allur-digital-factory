import {
  IconAlertTriangle,
  IconClockPause,
  IconCpu,
  IconHierarchy2,
} from '@tabler/icons-react';
import { KpiCard } from '@/components/ui/KpiCard';

interface SchemaKpiCardsProps {
  stats: {
    totalSections: number;
    criticalCount: number;
    warningCount: number;
    normalCount: number;
    totalEquipment: number;
    totalDowntimeMin: number;
    systemStatus: 'normal' | 'warning' | 'critical';
  };
}

export const SchemaKpiCards = ({ stats }: SchemaKpiCardsProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 lg:grid-cols-4 sm:divide-y-0 lg:divide-x">
        <KpiCard
          icon={<IconHierarchy2 size={22} stroke={1.75} />}
          title="Технологическая цепочка"
          value={`${stats.totalSections} участков`}
          delta={
            stats.systemStatus === 'critical'
              ? 'Критический сбой'
              : stats.systemStatus === 'warning'
                ? 'Предупреждение'
                : 'Штатный режим'
          }
          deltaPeriod="статус конвейера"
          deltaType={
            stats.systemStatus === 'critical'
              ? 'negative'
              : stats.systemStatus === 'warning'
                ? 'neutral'
                : 'positive'
          }
        />

        <KpiCard
          icon={<IconCpu size={22} stroke={1.75} />}
          title="Оборудование в схеме"
          value={`${stats.totalEquipment} ед.`}
          delta={`${stats.normalCount} уч. в норме`}
          deltaPeriod="контроль телеметрии"
          deltaType="positive"
        />

        <KpiCard
          icon={<IconClockPause size={22} stroke={1.75} />}
          title="Суммарный простой схемы"
          value={`${stats.totalDowntimeMin} мин`}
          delta={
            stats.totalDowntimeMin > 60
              ? `Превышение лимита`
              : `В пределах SLA`
          }
          deltaPeriod="порог 60 мин"
          deltaType={stats.totalDowntimeMin > 60 ? 'negative' : 'positive'}
        />

        <KpiCard
          icon={<IconAlertTriangle size={22} stroke={1.75} />}
          title="Инциденты и дефекты"
          value={`${stats.criticalCount + stats.warningCount} участков`}
          delta={`${stats.criticalCount} критических`}
          deltaPeriod={`и ${stats.warningCount} предупрежд.`}
          deltaType={stats.criticalCount > 0 ? 'negative' : 'positive'}
        />
      </div>
    </div>
  );
};
