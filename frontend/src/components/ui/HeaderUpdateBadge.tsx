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
      className={`flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-2xs ${className}`}
    >
      <IconCalendar size={16} className="text-slate-400" />
      <span className="text-xs sm:text-sm">
        {isRefreshing ? 'Синхронизация...' : `Обновлено: ${formattedDate}`}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        title="Синхронизировать данные"
        aria-label="Синхронизировать данные"
        className="ml-1 cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 outline-none focus:outline-none"
      >
        <IconRefresh
          size={16}
          className={isRefreshing ? 'animate-spin text-primary' : ''}
        />
      </button>
    </div>
  );
};
