import type { ReactNode } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';

export interface ForecastKpiCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  delta: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  tooltipText?: string;
  subtext?: string;
}

export const ForecastKpiCard = ({
  icon,
  title,
  value,
  delta,
  deltaType = 'positive',
  tooltipText,
  subtext,
}: ForecastKpiCardProps) => {
  const deltaColorClass =
    deltaType === 'positive'
      ? 'text-emerald-600'
      : deltaType === 'negative'
        ? 'text-rose-600'
        : 'text-slate-600';

  const arrow = deltaType === 'positive' ? '↑' : deltaType === 'negative' ? '↓' : '';

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            {icon}
          </div>
          <span className="text-sm font-medium text-slate-600">{title}</span>
        </div>
        {tooltipText && (
          <button
            type="button"
            title={tooltipText}
            className="text-slate-400 hover:text-slate-600"
          >
            <IconInfoCircle size={18} stroke={1.75} />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${deltaColorClass}`}>
          {arrow ? `${arrow} ` : ''}{delta}
        </span>
      </div>

      {subtext && (
        <p className="mt-2 text-xs font-medium text-slate-400">{subtext}</p>
      )}
    </div>
  );
};
