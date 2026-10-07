import {
  IconAlertTriangle,
  IconCpu,
  IconDeviceAnalytics,
  IconPaint,
  IconRobot,
} from '@tabler/icons-react';
import type { BottleneckItem } from '@/types/forecast';
import { Button } from '../Button';

interface ForecastBottlenecksTableCardProps {
  bottlenecks: BottleneckItem[];
  onOpenSimulation: () => void;
}

const getEquipmentStyle = (name: string, level: string) => {
  if (name.includes('Конвейер')) {
    return {
      icon: <IconCpu size={20} stroke={1.75} className="text-rose-500" />,
      bg: 'bg-rose-50/70 border-rose-100/90',
    };
  }
  if (name.includes('ABB') || name.includes('Робот')) {
    return {
      icon: <IconRobot size={20} stroke={1.75} className="text-amber-500" />,
      bg: 'bg-amber-50/70 border-amber-100/90',
    };
  }
  if (name.includes('Камера') || name.includes('ЛКП')) {
    return {
      icon: <IconPaint size={20} stroke={1.75} className="text-amber-600" />,
      bg: 'bg-amber-50/60 border-amber-100',
    };
  }
  return {
    icon: (
      <IconDeviceAnalytics
        size={20}
        stroke={1.75}
        className={level === 'critical' ? 'text-rose-500' : 'text-slate-600'}
      />
    ),
    bg: 'bg-slate-50 border-slate-100',
  };
};

const renderRiskBadge = (level: string) => {
  if (level === 'critical') {
    return (
      <span className="inline-flex items-center rounded-lg border border-rose-200/80 bg-rose-50/70 px-3 py-1 text-xs font-semibold text-rose-600">
        Критический
      </span>
    );
  }
  if (level === 'warning') {
    return (
      <span className="inline-flex items-center rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-1 text-xs font-semibold text-amber-600">
        Предупреждение
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
      Низкий
    </span>
  );
};

export const ForecastBottlenecksTableCard = ({
  bottlenecks,
  onOpenSimulation,
}: ForecastBottlenecksTableCardProps) => {
  return (
    <div className="flex h-full min-h-[340px] flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <IconAlertTriangle size={20} stroke={1.75} />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Факторы риска и узкие места
          </h2>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenSimulation}
          className="rounded-xl px-6 py-2 text-sm font-semibold shadow-xs"
        >
          Симуляция
        </Button>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs font-medium">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 pr-4 pl-13 text-left">
                Оборудование
              </th>
              <th className="py-3.5 px-6 text-left">
                Уровень риска
              </th>
              <th className="py-3.5 px-6 text-left">
                Нагрузка
              </th>
              <th className="py-3.5 pr-4 pl-6 text-right">
                Потери
              </th>
            </tr>
          </thead>
          <tbody>
            {bottlenecks.map((item) => {
              const style = getEquipmentStyle(item.equipment, item.risk_level);
              const loadPercent =
                item.risk_level === 'critical'
                  ? 80
                  : item.risk_level === 'warning'
                    ? 45
                    : 20;

              return (
                <tr
                  key={item.equipment}
                  className="border-b border-slate-100/80 transition-colors hover:bg-slate-50/40"
                >
                  {/* Оборудование: Иконка + Название + Причина */}
                  <td className="py-4.5 pr-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.bg}`}
                      >
                        {style.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900">
                          {item.equipment}
                        </div>
                        <div className="mt-0.5 text-xs font-normal text-slate-400">
                          {item.reason}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Уровень риска */}
                  <td className="py-4.5 px-6">
                    {renderRiskBadge(item.risk_level)}
                  </td>

                  {/* Нагрузка с прогресс-баром и процентом */}
                  <td className="py-4.5 px-6">
                    <div className="flex items-center gap-3.5">
                      <div className="h-2 w-36 sm:w-44 overflow-hidden rounded-full bg-slate-100">
                        <div
                          style={{ width: `${loadPercent}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.risk_level === 'critical'
                              ? 'bg-primary'
                              : item.risk_level === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {loadPercent}%
                      </span>
                    </div>
                  </td>

                  {/* Потери выпуска */}
                  <td className="py-4.5 pr-4 pl-6 text-right">
                    <span className="text-sm font-bold text-rose-600">
                      -{item.impact_lost_units} шт.
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
