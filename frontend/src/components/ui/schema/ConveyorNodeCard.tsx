import {
  IconArrowRight,
  IconBuildingWarehouse,
  IconTools,
} from '@tabler/icons-react';
import type { SectionNode } from '@/types/schema';

interface ConveyorNodeCardProps {
  section: SectionNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isLast: boolean;
}

export const ConveyorNodeCard = ({
  section,
  isSelected,
  onSelect,
  isLast,
}: ConveyorNodeCardProps) => {
  const isWarehouse = section.section_type === 'warehouse';
  const isCritical = section.status === 'critical';
  const isWarning = section.status === 'warning';

  const SectionIcon = isWarehouse ? IconBuildingWarehouse : IconTools;

  return (
    <div className="flex flex-1 items-center min-w-60">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(section.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onSelect(section.id);
          }
        }}
        className={`group relative flex w-full cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all min-h-50 ${
          isSelected
            ? 'border-primary border-2 bg-slate-50/70 shadow-xs'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40'
        }`}
      >
        {/* Middle: Icon & Name */}
        <div className="my-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-700 shadow-2xs">
            <SectionIcon size={18} stroke={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">
              {section.name}
            </p>
            <p className="truncate text-xs font-medium text-slate-500">
              {section.equipment.length} ед. оборудования
            </p>
          </div>
        </div>

        {/* Metrics Bar / Summary */}
        <div className="border-t border-slate-100 pt-2.5">
          {section.metrics ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>
                  {section.metrics.fact} / {section.metrics.plan} шт.
                </span>
                <span className="font-semibold text-slate-900">
                  {section.metrics.load_percent}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  style={{
                    width: `${Math.min(100, section.metrics.load_percent)}%`,
                  }}
                  className={`h-full rounded-full ${
                    isCritical
                      ? 'bg-rose-500'
                      : isWarning
                        ? 'bg-amber-500'
                        : 'bg-primary'
                  }`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span>Брак: {section.metrics.defect_percent}%</span>
                <span>Простой: {section.downtime_min}м</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between py-1 text-xs font-medium text-slate-500">
              <span>Буферный накопитель</span>
              <span>{section.downtime_min} мин</span>
            </div>
          )}
        </div>
      </div>

      {!isLast && (
        <div className="hidden shrink-0 px-2 text-slate-300 xl:block">
          <IconArrowRight size={18} />
        </div>
      )}
    </div>
  );
};
