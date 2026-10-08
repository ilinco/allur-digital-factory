import {
  IconAlertTriangle,
  IconClock,
  IconSparkles,
} from '@tabler/icons-react';

interface ForecastBottleneckFactorSummaryProps {
  totalLostUnits: number;
  criticalCount: number;
}

export const ForecastBottleneckFactorSummary = ({
  totalLostUnits,
  criticalCount,
}: ForecastBottleneckFactorSummaryProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Factor 1: Equipment failure risk */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <IconAlertTriangle size={15} className="text-rose-500" />
          <span>Отказы механизмов</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-lg font-bold text-slate-900">
            {criticalCount > 0 ? '-14 шт.' : '0 шт.'}
          </span>
          <span className="text-[11px] font-medium text-rose-600">
            64% влияния
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-tight">
          Критический риск: натяжитель Конвейер-03
        </p>
      </div>

      {/* Factor 2: Planned maintenance schedule */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <IconClock size={15} className="text-amber-500" />
          <span>Окна регламентного ТО</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-lg font-bold text-slate-900">-8 шт.</span>
          <span className="text-[11px] font-medium text-amber-600">
            36% влияния
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-tight">
          Сварочный пост ABB-04 (30 мин)
        </p>
      </div>

      {/* Factor 3: AI optimization potential */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <IconSparkles size={15} className="text-primary" />
          <span>Потенциал компенсации</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-lg font-bold text-emerald-700">
            +{totalLostUnits} шт.
          </span>
          <span className="text-[11px] font-medium text-emerald-700">
            100% возврат
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 leading-tight">
          При реализации рекомендаций ИИ
        </p>
      </div>
    </div>
  );
};
