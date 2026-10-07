import { IconCalendar, IconRefresh } from '@tabler/icons-react';

export interface HeaderUpdateBadgeProps {
  formattedDate: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  className?: string;
}

export const HeaderUpdateBadge = ({
  formattedDate,
  onRefresh,
  isRefreshing,
  className = '',
}: HeaderUpdateBadgeProps) => {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border border-neutral-200/90 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-2xs ${className}`}
    >
      <IconCalendar size={17} className="text-slate-400" />
      <span>Обновлено: {formattedDate}</span>
      <button
        type="button"
        onClick={onRefresh}
        title="Обновить данные"
        aria-label="Обновить данные"
        className="ml-1 cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-neutral-100 hover:text-slate-700 outline-none focus:outline-none"
      >
        <IconRefresh
          size={17}
          className={isRefreshing ? 'animate-spin text-primary' : ''}
        />
      </button>
    </div>
  );
};
