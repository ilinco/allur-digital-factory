import { useState, useMemo } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import type { SectionNode } from '@/types/schema';
import { ConveyorNodeCard } from './ConveyorNodeCard';

interface ConveyorPipelineFlowProps {
  sections: SectionNode[];
  selectedSectionId: string;
  onSelectSection: (id: string) => void;
}

type FilterTab = 'all' | 'normal' | 'issues';

export const ConveyorPipelineFlow = ({
  sections,
  selectedSectionId,
  onSelectSection,
}: ConveyorPipelineFlowProps) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<'step' | 'downtime' | 'load'>('step');

  const sortedSections = useMemo(() => {
    const list = [...sections];
    if (sortBy === 'downtime') {
      return list.sort((a, b) => (b.downtime_min || 0) - (a.downtime_min || 0));
    }
    if (sortBy === 'load') {
      return list.sort(
        (a, b) =>
          (b.metrics?.load_percent || 0) - (a.metrics?.load_percent || 0),
      );
    }
    return list.sort((a, b) => a.step_order - b.step_order);
  }, [sections, sortBy]);

  const filteredSections = useMemo(() => {
    if (activeTab === 'normal') {
      return sortedSections.filter((s) => s.status === 'normal');
    }
    if (activeTab === 'issues') {
      return sortedSections.filter(
        (s) => s.status === 'critical' || s.status === 'warning',
      );
    }
    return sortedSections;
  }, [sortedSections, activeTab]);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const issuesCount = sections.filter(
    (s) => s.status === 'critical' || s.status === 'warning',
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Filter Navigation Tabs matching screenshot layout */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-3">
        {/* Left: Tab bar like 'Popular templates / Recently added / Newest' */}
        <div className="flex items-center gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`relative pb-2 transition-colors ${
              activeTab === 'all'
                ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Все ({sections.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('normal')}
            className={`relative pb-2 transition-colors ${
              activeTab === 'normal'
                ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            В строю
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('issues')}
            className={`relative pb-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'issues'
                ? 'text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Отклонения</span>
            {issuesCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-100 px-1.5 text-[11px] font-bold text-rose-700">
                {issuesCount}
              </span>
            )}
          </button>
        </div>

        {/* Right: Sort selector dropdown like on the screenshot */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              aria-label="Сортировка участков конвейера"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'step' | 'downtime' | 'load')
              }
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-none"
            >
              <option value="step">По порядку конвейера (01-06)</option>
              <option value="load">По загрузке линии</option>
              <option value="downtime">По времени простоя</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              <IconChevronDown size={14} stroke={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Stage Cards matching the screenshot's 3-column x 2-row layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSections.map((section) => (
          <ConveyorNodeCard
            key={section.id}
            section={section}
            isSelected={section.id === selectedSectionId}
            onSelect={onSelectSection}
          />
        ))}
      </div>

      {/* Selected section breadcrumb hint */}
      {selectedSection && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-2xs">
          <span>
            Выбранный передел для детального аудита оборудования:{' '}
            <strong className="text-slate-900">{selectedSection.name}</strong>
          </span>
          <span className="font-semibold text-primary">
            Участок 0{selectedSection.step_order}
          </span>
        </div>
      )}
    </div>
  );
};
