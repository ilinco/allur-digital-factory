import { IconCalendar, IconRefresh } from '@tabler/icons-react';

interface DashboardHeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardHeader = ({
  selectedDate,
  onSelectDate,
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) => {
  const formattedDate =
    selectedDate === '2026-10-02'
      ? '02 Окт 2026'
      : selectedDate === '2026-10-01'
        ? '01 Окт 2026'
        : selectedDate;

  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-slate-900">
          Аналитика производства
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onSelectDate('2026-10-01')}
            className={`rounded-lg px-3.5 py-1.5 transition-colors ${
              selectedDate === '2026-10-01'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            01 Окт 2026
          </button>
          <button
            type="button"
            onClick={() => onSelectDate('2026-10-02')}
            className={`rounded-lg px-3.5 py-1.5 transition-colors ${
              selectedDate === '2026-10-02'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            02 Окт 2026
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-xs">
          <IconCalendar size={17} className="text-slate-400" />
          <span>Обновлено: {formattedDate}</span>
          <button
            type="button"
            onClick={onRefresh}
            title="Обновить данные"
            className="ml-1 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <IconRefresh
              size={17}
              className={isRefreshing ? "animate-spin text-[#ff2e1f]" : ""}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
