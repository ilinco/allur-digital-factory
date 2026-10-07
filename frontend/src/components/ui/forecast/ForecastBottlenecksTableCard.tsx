import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconCpu,
  IconDeviceAnalytics,
  IconPaint,
  IconRobot,
} from '@tabler/icons-react';
import { Link } from 'react-router';
import type { BottleneckItem } from '@/types/forecast';
import { Button } from '../Button';
import { StatusIndicator } from '../StatusIndicator';
import { StaticLinks } from '@/config/StaticLinks';

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
              <th className="py-3.5 pr-4 pl-1 text-left">
                Оборудование
              </th>
              <th className="py-3.5 px-4 text-left">
                Статус
              </th>
              <th className="py-3.5 px-4 text-left">
                Нагрузка
              </th>
              <th className="py-3.5 px-4 text-right">
                Потери
              </th>
              <th className="py-3.5 pr-2 pl-4 text-right">
                Действие
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

              const statusMapped =
                item.risk_level === 'critical'
                  ? 'critical'
                  : item.risk_level === 'warning'
                    ? 'warning'
                    : 'normal';

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

                  {/* Статус (без badge) */}
                  <td className="py-4.5 px-4">
                    <StatusIndicator
                      status={statusMapped}
                      label={
                        item.risk_level === 'critical'
                          ? 'Критично'
                          : item.risk_level === 'warning'
                            ? 'Внимание'
                            : 'Штатно'
                      }
                      pulse={item.risk_level === 'critical'}
                    />
                  </td>

                  {/* Нагрузка с прогресс-баром и процентом */}
                  <td className="py-4.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 sm:w-36 overflow-hidden rounded-full bg-slate-100">
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
                  <td className="py-4.5 px-4 text-right">
                    <span className="text-sm font-bold text-rose-600">
                      -{item.impact_lost_units} шт.
                    </span>
                  </td>

                  {/* Переход к мнемосхеме */}
                  <td className="py-4.5 pr-2 pl-4 text-right">
                    <Link
                      to={StaticLinks.schema}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-primary"
                      title="Открыть схему цеха"
                    >
                      <span>К схеме</span>
                      <IconArrowUpRight size={13} />
                    </Link>
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
