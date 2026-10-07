import {
  IconAlertOctagon,
  IconBug,
  IconPlayerPlay,
  IconRotateDot,
} from '@tabler/icons-react';
import type { SimulationActionRequest } from '@/types/schema';
import { Button } from '@/components/ui/Button';

interface SimulationQuickBarProps {
  onTrigger: (payload: SimulationActionRequest) => Promise<unknown>;
  isSimulating: boolean;
}

export const SimulationQuickBar = ({
  onTrigger,
  isSimulating,
}: SimulationQuickBarProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-primary" />
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
            Демонстрация сценариев (Simulation API)
          </h2>
        </div>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Управляемый триггер внештатных ситуаций: проверка реакции конвейера и рекомендаций ИИ
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          size="sm"
          variant="secondary"
          disabled={isSimulating}
          onClick={() =>
            onTrigger({
              action: 'breakdown',
              section_id: 'welding-1',
              duration_minutes: 75,
              reason: 'Аварийный останов: заклинивание поворотного редуктора робота ABB-04',
            })
          }
          leftIcon={<IconAlertOctagon size={16} className="text-rose-600" />}
        >
          Авария ABB-04 (75м)
        </Button>

        <Button
          size="sm"
          variant="secondary"
          disabled={isSimulating}
          onClick={() =>
            onTrigger({
              action: 'defect_spike',
              section_id: 'welding-1',
            })
          }
          leftIcon={<IconBug size={16} className="text-amber-600" />}
        >
          Всплеск брака (+8 шт)
        </Button>

        <Button
          size="sm"
          variant="secondary"
          disabled={isSimulating}
          onClick={() =>
            onTrigger({
              action: 'critical_stop',
              section_id: 'assembly-1',
              duration_minutes: 90,
              reason: 'Критический останов конвейера сборки (обрыв приводной цепи)',
            })
          }
          leftIcon={<IconPlayerPlay size={16} className="text-slate-600" />}
        >
          Останов конвейера (90м)
        </Button>

        <Button
          size="sm"
          variant="secondary"
          disabled={isSimulating}
          onClick={() => onTrigger({ action: 'reset' })}
          leftIcon={
            <IconRotateDot
              size={16}
              className={`text-slate-500 ${isSimulating ? 'animate-spin' : ''}`}
            />
          }
        >
          Сброс симуляции
        </Button>
      </div>
    </div>
  );
};
