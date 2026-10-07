import {
  IconCalendar,
  IconRefresh,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Select } from '@/components/ui/Select';

interface ForecastHeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  horizon: 'monthly' | 'weekly' | 'shift';
  onChangeHorizon: (horizon: 'monthly' | 'weekly' | 'shift') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSimulation: () => void;
}

export const ForecastHeader = ({
  selectedDate,
  onSelectDate,
  horizon,
  onChangeHorizon,
  onRefresh,
  isRefreshing,
}: ForecastHeaderProps) => {
  return (
    <PageHeader
      title="ИИ прогноз производства"
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <Select
            size="sm"
            value={selectedDate}
            onChange={onSelectDate}
            leftIcon={<IconCalendar size={15} stroke={1.75} />}
            options={[
              { value: '2026-10-02', label: '01 Окт — 31 Окт 2026' },
              { value: '2026-10-01', label: '01 Сен — 30 Сен 2026' },
            ]}
            aria-label="Период прогноза"
            className="w-56"
          />

          {/* Horizon Dropdown */}
          <Select
            size="sm"
            value={horizon}
            onChange={(val) =>
              onChangeHorizon(val as 'monthly' | 'weekly' | 'shift')
            }
            options={[
              { value: 'monthly', label: 'Месячный' },
              { value: 'weekly', label: 'Понедельный' },
              { value: 'shift', label: 'Посменный' },
            ]}
            aria-label="Горизонт планирования"
            className="w-36"
          />

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Обновить данные с завода"
            className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <IconRefresh
              size={15}
              stroke={1.75}
              className={isRefreshing ? 'animate-spin text-primary' : ''}
            />
          </button>
        </div>
      }
    />
  );
};
