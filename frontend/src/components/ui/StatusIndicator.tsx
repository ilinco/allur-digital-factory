export type StatusType =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'idle'
  | 'buffer'
  | 'neutral'
  | 'no_data';

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  StatusType,
  { dotColor: string; textColor: string; defaultLabel: string }
> = {
  normal: {
    dotColor: 'bg-emerald-500',
    textColor: 'text-slate-700',
    defaultLabel: 'Штатно',
  },
  warning: {
    dotColor: 'bg-amber-500',
    textColor: 'text-slate-800',
    defaultLabel: 'Внимание',
  },
  critical: {
    dotColor: 'bg-rose-500',
    textColor: 'text-rose-700 font-semibold',
    defaultLabel: 'Критично',
  },
  idle: {
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-600',
    defaultLabel: 'Ожидание',
  },
  buffer: {
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-600',
    defaultLabel: 'Буфер',
  },
  neutral: {
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-600',
    defaultLabel: 'Нейтрально',
  },
  no_data: {
    dotColor: 'bg-slate-300',
    textColor: 'text-slate-500',
    defaultLabel: 'Нет данных',
  },
};

export const StatusIndicator = ({
  status,
  label,
  size = 'md',
  pulse = false,
  className = '',
}: StatusIndicatorProps) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.neutral;
  const displayLabel = label ?? config.defaultLabel;

  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium select-none ${config.textColor} ${className}`}
    >
      <span className="relative flex shrink-0 items-center justify-center">
        {(pulse || status === 'critical') && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dotColor}`}
          />
        )}
        <span className={`inline-block rounded-full ${dotSize} ${config.dotColor}`} />
      </span>
      <span className={textSize}>{displayLabel}</span>
    </span>
  );
};
