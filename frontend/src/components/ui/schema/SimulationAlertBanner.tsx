import {
  IconAlertOctagon,
  IconAlertTriangle,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import type { SimulationActionResponse } from '@/types/schema';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '../StatusIndicator';

interface SimulationAlertBannerProps {
  response: SimulationActionResponse;
  onDismiss: () => void;
}

export const SimulationAlertBanner = ({
  response,
  onDismiss,
}: SimulationAlertBannerProps) => {
  const { ai_assistant, affected_section, overall_oee, availability } =
    response;
  const isCritical = ai_assistant.severity === 'critical';
  const isWarning = ai_assistant.severity === 'warning';

  const SeverityIcon = isCritical
    ? IconAlertOctagon
    : isWarning
      ? IconAlertTriangle
      : IconInfoCircle;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
            <SeverityIcon
              size={20}
              className={
                isCritical
                  ? 'text-rose-600'
                  : isWarning
                    ? 'text-amber-600'
                    : 'text-slate-600'
              }
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                {ai_assistant.title}
              </h3>
              <StatusIndicator
                status={isCritical ? 'critical' : isWarning ? 'warning' : 'normal'}
                label={isCritical ? 'Критично' : isWarning ? 'Внимание' : 'Инфо'}
                size="sm"
                pulse={isCritical}
              />
            </div>

            <p className="mt-1 text-sm text-slate-600">
              {ai_assistant.warning}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <span>
                Участок:{' '}
                <strong className="text-slate-900">
                  {affected_section?.name || 'Конвейер'}
                </strong>
              </span>
              <span>
                Простой:{' '}
                <strong className="text-slate-900">
                  {affected_section?.downtime_min ?? 0} мин
                </strong>
              </span>
              <span>
                OEE завода:{' '}
                <strong className="text-slate-900">{overall_oee}%</strong>
              </span>
              <span>
                Готовность (Availability):{' '}
                <strong className="text-slate-900">{availability}%</strong>
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          title="Скрыть оповещение"
          aria-label="Скрыть оповещение"
          className="shrink-0 text-slate-400 hover:text-slate-700"
        >
          <IconX size={18} />
        </Button>
      </div>

      {ai_assistant.suggested_actions?.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Рекомендуемые действия оператору:
          </p>
          <ul className="mt-2 space-y-1.5">
            {ai_assistant.suggested_actions.map((action, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-xs font-medium uppercase text-slate-700"
              >
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
