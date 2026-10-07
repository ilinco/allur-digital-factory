import { IconArrowNarrowRight, IconLayersIntersect } from '@tabler/icons-react';
import type { SectionNode } from '@/types/schema';
import { ConveyorNodeCard } from './ConveyorNodeCard';

interface ConveyorPipelineFlowProps {
  sections: SectionNode[];
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
}

export const ConveyorPipelineFlow = ({
  sections,
  selectedSectionId,
  onSelectSection,
}: ConveyorPipelineFlowProps) => {
  const sortedSections = [...sections].sort(
    (a, b) => a.step_order - b.step_order,
  );

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  const totalSections = sections.length;
  const normalCount = sections.filter((s) => s.status === 'normal').length;
  const issuesCount = sections.filter(
    (s) => s.status === 'critical' || s.status === 'warning',
  ).length;
  const totalDowntimeMin = sections.reduce(
    (acc, s) => acc + (s.downtime_min || 0),
    0,
  );

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
      {/* Header with summary stats (no badges, no legends) */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50 text-slate-800">
            <IconLayersIntersect size={20} stroke={1.75} />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Технологический маршрут конвейера
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Сквозная цепочка переделов сборки кузовов Allur: от склада деталей до выдачи готовых авто
            </p>
          </div>
        </div>

        {/* Micro stats summary */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
          <div>
            <span>Цепочка: </span>
            <strong className="text-slate-900">{totalSections} участков</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>В норме: </span>
            <strong className="text-slate-900">{normalCount}</strong>
          </div>
          {issuesCount > 0 && (
            <div className="flex items-center gap-1.5 text-rose-600">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Отклонения: </span>
              <strong className="font-bold">{issuesCount}</strong>
            </div>
          )}
          <div>
            <span>Простой: </span>
            <strong className={totalDowntimeMin > 60 ? 'text-rose-600 font-bold' : 'text-slate-900'}>
              {totalDowntimeMin} мин
            </strong>
          </div>
        </div>
      </div>

      {/* Nodes Horizontal Conveyor Flow with Pipeline Connectors */}
      <div className="overflow-x-auto p-5">
        <div className="flex items-stretch gap-2 min-w-max pb-1">
          {sortedSections.map((section, index) => {
            const isLast = index === sortedSections.length - 1;
            return (
              <div key={section.id} className="flex items-center">
                <ConveyorNodeCard
                  section={section}
                  isSelected={section.id === selectedSectionId}
                  onSelect={onSelectSection}
                />
                {!isLast && (
                  <div className="hidden shrink-0 items-center justify-center px-1.5 text-slate-300 xl:flex">
                    <IconArrowNarrowRight size={20} stroke={2} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer bar with context & selected section info */}
      <div className="flex flex-col gap-1 border-t border-slate-100 px-5 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-slate-500">
          Нажмите на передел в схеме для просмотра оборудования, фиксации простоев и событий ОТК
        </span>
        {selectedSection && (
          <span className="font-semibold text-slate-700">
            Выбран: <span className="text-primary">{selectedSection.name}</span>
          </span>
        )}
      </div>
    </div>
  );
};
