import {
  IconCalendar,
  IconChevronDown,
  IconRefresh,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';

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
          {/* Date Range Selector matching screenshot */}
          <div className="relative inline-flex items-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50">
              <IconCalendar
                size={16}
                stroke={1.75}
                className="text-slate-400"
              />
              <span>
                {selectedDate === '2026-10-02'
                  ? '01 Окт — 31 Окт 2026'
                  : '01 Сен — 30 Сен 2026'}
              </span>
              <select
                aria-label="Период прогноза"
                value={selectedDate}
                onChange={(e) => onSelectDate(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                <option value="2026-10-02">01 Окт — 31 Окт 2026</option>
                <option value="2026-10-01">01 Сен — 30 Сен 2026</option>
              </select>
              <IconChevronDown size={14} className="text-slate-400" />
            </div>
          </div>

          {/* Horizon Dropdown matching screenshot (Monthly ˅) */}
          <div className="relative inline-flex items-center">
            <select
              aria-label="Горизонт планирования"
              value={horizon}
              onChange={(e) =>
                onChangeHorizon(
                  e.target.value as 'monthly' | 'weekly' | 'shift',
                )
              }
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-3.5 text-xs font-semibold text-slate-700 shadow-2xs outline-none hover:bg-slate-50 focus:border-slate-400"
            >
              <option value="monthly">Месячный</option>
              <option value="weekly">Понедельный</option>
              <option value="shift">Посменный</option>
            </select>
            <IconChevronDown
              size={14}
              className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
            />
          </div>

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
