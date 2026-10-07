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
  description?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  StatusType,
  {
    dotColor: string;
    textColor: string;
    defaultLabel: string;
    defaultDescription: string;
  }
> = {
  normal: {
    dotColor: 'bg-emerald-500',
    textColor: 'text-slate-700',
    defaultLabel: 'Штатно',
    defaultDescription: 'Штатный режим: простой ≤ 30 мин, брак ≤ 2.0%',
  },
  warning: {
    dotColor: 'bg-amber-500',
    textColor: 'text-slate-800',
    defaultLabel: 'Внимание',
    defaultDescription: 'Внимание: простой > 30 мин или брак > 2.0%',
  },
  critical: {
    dotColor: 'bg-rose-500',
    textColor: 'text-rose-700 font-semibold',
    defaultLabel: 'Критично',
    defaultDescription:
      'Критический сбой: простой > 60 мин или брак > 5.0% (риск срыва плана)',
  },
  idle: {
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-600',
    defaultLabel: 'Ожидание',
    defaultDescription: 'Оборудование ожидает технологической загрузки',
  },
  buffer: {
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-600',
    defaultLabel: 'Буфер',
    defaultDescription: 'Промежуточный буферный накопитель конвейера',
  },
  neutral: {
    dotColor: 'bg-slate-400',
    textColor: 'text-slate-600',
    defaultLabel: 'Нейтрально',
    defaultDescription: 'Нейтральный статус',
  },
  no_data: {
    dotColor: 'bg-slate-300',
    textColor: 'text-slate-500',
    defaultLabel: 'Нет данных',
    defaultDescription: 'Телеметрические данные по объекту отсутствуют',
  },
};

export const StatusIndicator = ({
  status,
  label,
  description,
  size = 'md',
  pulse = false,
  className = '',
}: StatusIndicatorProps) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.neutral;
  const displayLabel = label ?? config.defaultLabel;
  const tooltip = description ?? config.defaultDescription;

  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs sm:text-sm';

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center gap-1.5 font-medium select-none cursor-help ${config.textColor} ${className}`}
    >
      <span className="relative flex shrink-0 items-center justify-center">
        {(pulse || status === 'critical') && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.dotColor}`}
          />
        )}
        <span
          className={`inline-block rounded-full ${dotSize} ${config.dotColor}`}
        />
      </span>
      <span className={textSize}>{displayLabel}</span>
    </span>
  );
};
