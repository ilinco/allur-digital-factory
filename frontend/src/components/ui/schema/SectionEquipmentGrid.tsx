import {
  IconClipboardCheck,
  IconClockPause,
  IconCpu,
} from '@tabler/icons-react';
import type { SectionNode } from '@/types/schema';
import { Button } from '@/components/ui/Button';
import { EquipmentCard } from './EquipmentCard';

interface SectionEquipmentGridProps {
  section: SectionNode | null;
  onRecordDowntime: (equipmentName?: string, equipmentId?: number) => void;
  onRecordEvent: () => void;
}

export const SectionEquipmentGrid = ({
  section,
  onRecordDowntime,
  onRecordEvent,
}: SectionEquipmentGridProps) => {
  if (!section) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <p className="text-sm font-medium text-slate-500">
          Выберите участок на карте для просмотра оборудования
        </p>
      </div>
    );
  }

  const statusLabel =
    section.status === 'critical'
      ? 'Критический сбой'
      : section.status === 'warning'
        ? 'Предупреждение'
        : section.status === 'normal'
          ? 'Штатный режим'
          : 'Ожидание данных';

  const statusDotClass =
    section.status === 'critical'
      ? 'bg-rose-500'
      : section.status === 'warning'
        ? 'bg-amber-500'
        : section.status === 'normal'
          ? 'bg-emerald-500'
          : 'bg-slate-400';

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
            <IconCpu size={20} stroke={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {section.name}
              </h3>
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700">
                <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />
                <span>{statusLabel}</span>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Этап 0{section.step_order} в цепочке • Реестр оборудования ({section.equipment.length} ед.)
            </p>
          </div>
        </div>

        {/* Action triggers for this section */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRecordDowntime()}
            leftIcon={<IconClockPause size={15} />}
          >
            Внести простой
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={onRecordEvent}
            leftIcon={<IconClipboardCheck size={15} />}
          >
            Событие ОТК
          </Button>
        </div>
      </div>

      {/* Metrics Row (if available) */}
      {section.metrics && (
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50 sm:grid-cols-4">
          <div className="p-3.5 text-center">
            <span className="text-xs font-medium text-slate-500">Выпуск факт</span>
            <p className="mt-0.5 text-lg font-bold text-slate-900">
              {section.metrics.fact} из {section.metrics.plan} шт.
            </p>
          </div>
          <div className="p-3.5 text-center">
            <span className="text-xs font-medium text-slate-500">Загрузка линии</span>
            <p className="mt-0.5 text-lg font-bold text-slate-900">
              {section.metrics.load_percent}%
            </p>
          </div>
          <div className="p-3.5 text-center">
            <span className="text-xs font-medium text-slate-500">Процент брака</span>
            <p className={`mt-0.5 text-lg font-bold ${section.metrics.defect_percent > 2 ? 'text-rose-600' : 'text-slate-900'}`}>
              {section.metrics.defect_percent}%
            </p>
          </div>
          <div className="p-3.5 text-center">
            <span className="text-xs font-medium text-slate-500">Простой смены</span>
            <p className={`mt-0.5 text-lg font-bold ${section.downtime_min > 60 ? 'text-rose-600' : 'text-slate-900'}`}>
              {section.downtime_min} мин
            </p>
          </div>
        </div>
      )}

      {/* Equipment Grid */}
      <div className="p-5">
        {section.equipment.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {section.equipment.map((eq) => (
              <EquipmentCard
                key={eq.id}
                equipment={eq}
                onRecordDowntimeForEquipment={(eqName, eqId) =>
                  onRecordDowntime(eqName, eqId)
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
            <p className="text-xs font-medium text-slate-500">
              Для данного логистического узла отдельное оборудование не зарегистрировано
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
