import { IconCalendar, IconRefresh } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';

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
    <PageHeader
      title="Аналитика производства"
      actions={
        <>
        <div className="flex items-center rounded-xl border border-neutral-200/90 bg-white p-1 text-sm font-medium text-slate-600 shadow-2xs">
          <button
            type="button"
            onClick={() => onSelectDate('2026-10-01')}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 transition-colors ${
              selectedDate === '2026-10-01'
                ? 'bg-neutral-100 text-[#ff2e1f] font-semibold'
                : 'text-slate-500 hover:text-[#ff2e1f]'
            }`}
          >
            01 Окт 2026
          </button>
          <button
            type="button"
            onClick={() => onSelectDate('2026-10-02')}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 transition-colors ${
              selectedDate === '2026-10-02'
                ? 'bg-neutral-100 text-[#ff2e1f] font-semibold'
                : 'text-slate-500 hover:text-[#ff2e1f]'
            }`}
          >
            02 Окт 2026
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-2xs">
          <IconCalendar size={17} className="text-slate-400" />
          <span>Обновлено: {formattedDate}</span>
          <button
            type="button"
            onClick={onRefresh}
            title="Обновить данные"
            className="cursor-pointer ml-1 rounded-md p-1 text-slate-400 transition-colors hover:bg-neutral-100 hover:text-slate-700"
          >
            <IconRefresh
              size={17}
              className={isRefreshing ? 'animate-spin text-[#ff2e1f]' : ''}
            />
          </button>
        </div>
        </>
      }
    />
  );
};
