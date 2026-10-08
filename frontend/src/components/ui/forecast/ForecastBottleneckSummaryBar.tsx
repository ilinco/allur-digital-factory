import { IconCheck } from '@tabler/icons-react';

interface ForecastBottleneckSummaryBarProps {
  totalLostUnits: number;
  criticalCount: number;
  warningCount: number;
  totalCount: number;
}

export const ForecastBottleneckSummaryBar = ({
  totalLostUnits,
  criticalCount,
  warningCount,
  totalCount,
}: ForecastBottleneckSummaryBarProps) => {
  if (totalCount === 0) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-700">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
          <IconCheck size={14} stroke={2} />
        </div>
        <span className="font-medium">
          Линия работает стабильно: узких мест с риском срыва суточного такта не зафиксировано.
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/70 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
      {/* 1. Потери выпуска */}
      <div className="p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Потери выпуска за смену
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-rose-600">
            -{totalLostUnits} шт.
          </span>
          <span className="text-xs text-slate-500">дефицит такта</span>
        </div>
        <p className="mt-1 text-xs text-slate-600 leading-snug">
          Потери от вынужденного простоя оборудования
        </p>
      </div>

      {/* 2. Зоны риска */}
      <div className="p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Сдерживающие узлы
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {totalCount}{' '}
            <span className="text-sm font-semibold text-slate-600">
              {totalCount === 1 ? 'станция' : 'станции'}
            </span>
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-600 leading-snug">
          {criticalCount > 0 ? (
            <span className="font-medium text-rose-600">
              {criticalCount} критический риск (простой &gt; 50 мин)
            </span>
          ) : (
            <span>Все узлы в диапазоне допустимого допуска</span>
          )}
          {warningCount > 0 && criticalCount > 0 && (
            <span>, {warningCount} под наблюдением</span>
          )}
        </p>
      </div>

      {/* 3. Потенциал компенсации */}
      <div className="p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Потенциал восстановления
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-emerald-700">
            +{totalLostUnits} шт.
          </span>
          <span className="text-xs font-medium text-emerald-700">
            100% возврат
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-600 leading-snug">
          При выполнении превентивных регламентов ИИ
        </p>
      </div>
    </div>
  );
};
