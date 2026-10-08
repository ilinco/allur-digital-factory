import { IconHelpCircle } from '@tabler/icons-react';
import { StatusIndicator } from './StatusIndicator';

interface StatusLegendBarProps {
  onOpenGuide?: () => void;
  className?: string;
}

export const StatusLegendBar = ({
  onOpenGuide,
  className = '',
}: StatusLegendBarProps) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-2xs ${className}`}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="font-semibold text-slate-800">Критерии SLA:</span>

        <span
          className="cursor-help"
          title="Все параметры в норме: суммарный простой смены ≤ 30 мин, уровень брака ≤ 2.0%"
        >
          <StatusIndicator
            status="normal"
            label="Штатно (≤30м / брак ≤2%)"
            size="sm"
          />
        </span>

        <span
          className="cursor-help"
          title="Требуется внимание: простой > 30 мин или брак > 2.0%"
        >
          <StatusIndicator
            status="warning"
            label="Внимание (>30м / брак >2%)"
            size="sm"
          />
        </span>

        <span
          className="cursor-help"
          title="Критический сбой: простой > 60 мин или брак > 5.0%"
        >
          <StatusIndicator
            status="critical"
            label="Критично (>60м / брак >5%)"
            size="sm"
            pulse
          />
        </span>
      </div>

      {onOpenGuide && (
        <button
          type="button"
          onClick={onOpenGuide}
          className="flex cursor-pointer items-center gap-1.5 font-semibold text-primary transition-colors hover:underline outline-none focus:outline-none"
        >
          <IconHelpCircle size={15} />
          <span>Справка по статусам</span>
        </button>
      )}
    </div>
  );
};
