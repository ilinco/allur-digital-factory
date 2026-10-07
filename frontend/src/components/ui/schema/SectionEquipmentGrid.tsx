import { IconClipboardCheck, IconClockPause } from '@tabler/icons-react';
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

  return (
    <div className="flex flex-col gap-4">
      {/* Section Actions & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Оборудование: {section.name}
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Реестр станков и технологических постов (этап 0{section.step_order}{' '}
            конвейера)
          </p>
        </div>
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
            События
          </Button>
        </div>
      </div>

      {/* Metrics Row (if available) */}
      {section.metrics && (
        <div className="grid grid-cols-2 divide-x divide-slate-100 rounded-xl border border-slate-200 bg-white sm:grid-cols-4 shadow-2xs">
          <div className="p-3.5 text-center">
            <span className="text-xs font-medium text-slate-500">
              Выпуск продукции
            </span>
            <p className="mt-0.5 text-lg font-bold text-slate-900">
              {section.metrics.fact} из {section.metrics.plan} шт.
            </p>
          </div>
          <div className="p-3.5 text-center">
            <span className="text-xs font-medium text-slate-500">
              Загрузка линии
            </span>
            <p className="mt-0.5 text-lg font-bold text-slate-900">
              {section.metrics.load_percent}%
            </p>
          </div>
          <div className="p-3.5 text-center">
            <span className="text-xs font-medium text-slate-500">
              Процент брака
            </span>
            <p
              className={`mt-0.5 text-lg font-bold ${section.metrics.defect_percent > 2 ? 'text-rose-600' : 'text-slate-900'}`}
            >
              {section.metrics.defect_percent}%
            </p>
          </div>
          <div className="p-3.5 text-center">
            <span className="text-xs font-medium text-slate-500">
              Простой смены
            </span>
            <p
              className={`mt-0.5 text-lg font-bold ${section.downtime_min > 60 ? 'text-rose-600' : 'text-slate-900'}`}
            >
              {section.downtime_min} мин
            </p>
          </div>
        </div>
      )}

      {/* Equipment Grid */}
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
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-2xs">
          <p className="text-xs font-medium text-slate-500">
            Для данного логистического узла отдельное оборудование не
            зарегистрировано
          </p>
        </div>
      )}
    </div>
  );
};
