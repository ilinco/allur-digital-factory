import { IconLayersIntersect } from '@tabler/icons-react';
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

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            <IconLayersIntersect size={18} stroke={1.75} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Технологический маршрут конвейера
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Интерактивная карта участков и переделов сборки кузовов Allur
            </p>
          </div>
        </div>
      </div>

      {/* Nodes Horizontal Conveyor Flow */}
      <div className="overflow-x-auto p-5">
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:flex-row xl:items-stretch xl:gap-2">
          {sortedSections.map((section, index) => (
            <ConveyorNodeCard
              key={section.id}
              section={section}
              isSelected={section.id === selectedSectionId}
              onSelect={onSelectSection}
              isLast={index === sortedSections.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-2.5 text-xs font-medium text-slate-400">
        Выберите участок на схеме для детального просмотра оборудования,
        простоев и отправки телеметрии
      </div>
    </div>
  );
};
