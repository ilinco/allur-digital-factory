import {
  IconBuildingWarehouse,
  IconEngine,
  IconFlame,
  IconPaint,
  IconShieldCheck,
  IconTools,
} from '@tabler/icons-react';
import type { SectionNode } from '@/types/schema';

interface ConveyorNodeCardProps {
  section: SectionNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const renderSectionIcon = (id: string, type: string) => {
  if (id.includes('warehouse')) {
    return <IconBuildingWarehouse size={20} stroke={1.75} />;
  }
  if (id.includes('welding')) {
    return <IconFlame size={20} stroke={1.75} />;
  }
  if (id.includes('paint')) {
    return <IconPaint size={20} stroke={1.75} />;
  }
  if (id.includes('assembly')) {
    return <IconEngine size={20} stroke={1.75} />;
  }
  if (id.includes('qc')) {
    return <IconShieldCheck size={20} stroke={1.75} />;
  }
  return type === 'warehouse' ? (
    <IconBuildingWarehouse size={20} stroke={1.75} />
  ) : (
    <IconTools size={20} stroke={1.75} />
  );
};

export const ConveyorNodeCard = ({
  section,
  isSelected,
  onSelect,
}: ConveyorNodeCardProps) => {
  const isCritical = section.status === 'critical';
  const isWarning = section.status === 'warning';

  const progressBarColor = isCritical
    ? 'bg-rose-500'
    : isWarning
      ? 'bg-amber-500'
      : 'bg-primary';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(section.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(section.id);
        }
      }}
      className={`group relative flex w-full min-w-[230px] flex-col justify-between rounded-xl border p-4 transition-all ${
        isSelected
          ? 'border-primary bg-primary/[0.02] shadow-xs ring-2 ring-primary/20'
          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/40 hover:shadow-2xs'
      }`}
    >
      <div>
        {/* Top: Step Order & Status (no badges, no legends) */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold text-slate-400">
            0{section.step_order}
          </span>

          {isCritical ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Авария</span>
            </div>
          ) : isWarning ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Внимание</span>
            </div>
          ) : section.status === 'normal' ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>В строю</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span>Буфер</span>
            </div>
          )}
        </div>

        {/* Middle: Icon & Name */}
        <div className="my-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50 text-slate-700 shadow-2xs group-hover:bg-white transition-colors">
            {renderSectionIcon(section.id, section.section_type)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
              {section.name}
            </h3>
            <p className="truncate text-xs font-medium text-slate-500">
              {section.equipment.length > 0
                ? `${section.equipment.length} ед. оборудования`
                : 'Накопитель кузовов'}
            </p>
          </div>
        </div>

        {/* Metrics & Progress Bar */}
        <div className="border-t border-slate-100 pt-3">
          {section.metrics ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>
                  Выпуск: <strong className="text-slate-900">{section.metrics.fact}</strong> / {section.metrics.plan}
                </span>
                <span className="font-bold text-slate-900">
                  {section.metrics.load_percent}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  style={{
                    width: `${Math.min(100, section.metrics.load_percent)}%`,
                  }}
                  className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>
                  Брак:{' '}
                  <strong
                    className={
                      section.metrics.defect_percent > 2
                        ? 'text-rose-600 font-bold'
                        : 'text-slate-700'
                    }
                  >
                    {section.metrics.defect_percent}%
                  </strong>
                </span>
                <span>
                  Простой:{' '}
                  <strong
                    className={
                      section.downtime_min > 60
                        ? 'text-rose-600 font-bold'
                        : 'text-slate-700'
                    }
                  >
                    {section.downtime_min}м
                  </strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Буферный накопитель</span>
                <span className="font-bold text-slate-900">
                  {section.downtime_min}м
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-full rounded-full bg-slate-300" />
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                <span>Готовность к перемещению</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
