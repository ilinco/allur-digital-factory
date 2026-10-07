import {
  IconAlertOctagon,
  IconBug,
  IconPlayerPause,
  IconRotateDot,
} from '@tabler/icons-react';
import type {
  SimulationActionRequest,
  SimulationActionType,
} from '@/types/schema';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '../StatusIndicator';

export interface SimulationQuickBarProps {
  onTrigger: (payload: SimulationActionRequest) => Promise<unknown>;
  isSimulating: boolean;
  activeAction?: string | null;
}

interface ScenarioItem {
  id: SimulationActionType;
  code: string;
  title: string;
  target: string;
  metricLabel: string;
  metricValue: string;
  reason: string;
  icon: typeof IconAlertOctagon;
  iconColor: string;
  payload: SimulationActionRequest;
}

const SCENARIOS: ScenarioItem[] = [
  {
    id: 'breakdown',
    code: 'SCN-01',
    title: 'Аварийный сбой ABB-04',
    target: 'Участок «Сварка-1»',
    metricLabel: 'Простой линии',
    metricValue: '75 мин',
    reason: 'Заклинивание поворотного редуктора робота',
    icon: IconAlertOctagon,
    iconColor: 'text-rose-600',
    payload: {
      action: 'breakdown',
      section_id: 'welding-1',
      duration_minutes: 75,
      reason:
        'Аварийный останов: заклинивание поворотного редуктора робота ABB-04',
    },
  },
  {
    id: 'defect_spike',
    code: 'SCN-02',
    title: 'Всплеск брака кузовов',
    target: 'Участок «Сварка-1»',
    metricLabel: 'Превышение дефектов',
    metricValue: '+8 шт',
    reason: 'Нарушение геометрии сварочных швов',
    icon: IconBug,
    iconColor: 'text-amber-600',
    payload: {
      action: 'defect_spike',
      section_id: 'welding-1',
    },
  },
  {
    id: 'critical_stop',
    code: 'SCN-03',
    title: 'Останов сборочной линии',
    target: 'Участок «Сборка-1»',
    metricLabel: 'Критический простой',
    metricValue: '90 мин',
    reason: 'Обрыв тяговой цепи главного конвейера',
    icon: IconPlayerPause,
    iconColor: 'text-slate-700',
    payload: {
      action: 'critical_stop',
      section_id: 'assembly-1',
      duration_minutes: 90,
      reason: 'Критический останов конвейера сборки (обрыв приводной цепи)',
    },
  },
];

export const SimulationQuickBar = ({
  onTrigger,
  isSimulating,
  activeAction,
}: SimulationQuickBarProps) => {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      {/* Header bar */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Демонстрация сценариев
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Стресс-тестирование цифрового двойника и моделирование реакции
              конвейера
            </p>
          </div>
        </div>

        {/* Status indicator & Reset button (no badges, unified StatusIndicator) */}
        <div className="flex flex-wrap items-center gap-4">
          {activeAction ? (
            <StatusIndicator
              status="warning"
              label={`Тест: ${activeAction}`}
              size="sm"
              pulse
            />
          ) : (
            <StatusIndicator
              status="normal"
              label="Базовый режим завода"
              size="sm"
            />
          )}

          <Button
            size="sm"
            variant="secondary"
            disabled={isSimulating}
            onClick={() => onTrigger({ action: 'reset' })}
            leftIcon={
              <IconRotateDot
                size={15}
                className={isSimulating ? 'animate-spin' : ''}
              />
            }
          >
            Сброс симуляции
          </Button>
        </div>
      </div>

      {/* Scenario cards grid */}
      <div className="mt-4 grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        {SCENARIOS.map((scenario) => {
          const isActive = activeAction === scenario.id;

          return (
            <div
              key={scenario.id}
              className={`group flex flex-col justify-between rounded-xl border p-4 transition-all ${
                isActive
                  ? 'border-primary/80 bg-primary/[0.02] ring-1 ring-primary/20 shadow-2xs'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/40'
              }`}
            >
              <div>
                {/* Scenario Title & Target */}
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {scenario.target}
                  </p>
                </div>

                {/* Parameter details panel */}
                <div className="mt-3 space-y-1.5 rounded-lg border border-slate-100 bg-[#f6f6f6] p-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">
                      {scenario.metricLabel}:
                    </span>
                    <span className="font-bold text-slate-900">
                      {scenario.metricValue}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="shrink-0 text-slate-500">Причина:</span>
                    <span className="text-right font-medium text-slate-700 wrap-break-word">
                      {scenario.reason}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Trigger action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {isActive ? (
                    <StatusIndicator
                      status="critical"
                      label="Имитация активна"
                      size="sm"
                      pulse
                    />
                  ) : (
                    <span className="text-xs font-medium text-slate-400">
                      Готов к запуску
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={isActive ? 'outline' : 'primary'}
                  disabled={isSimulating}
                  onClick={() => onTrigger(scenario.payload)}
                  className="text-xs"
                >
                  {isActive ? 'Повторить' : 'Запустить тест'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
