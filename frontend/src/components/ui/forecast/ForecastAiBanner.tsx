import { useEffect, useState } from 'react';
import {
  IconAdjustments,
  IconBrain,
  IconLoader2,
  IconShieldCheck,
  IconSparkles,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';

export interface ForecastAiBannerProps {
  onOpenSimulation: () => void;
  bottlenecksCount: number;
  isAnalyzing?: boolean;
}

const ANALYSIS_STAGES = [
  'Агрегация телеметрии SCADA по 4 цехам завода (сварка, окраска, сборка)...',
  'Анализ отклонений сменного такта и локализация узких мест оборудования...',
  'Генерация предиктивных инженерных рекомендаций через модель Allur AI...',
];

export const ForecastAiBanner = ({
  onOpenSimulation,
  bottlenecksCount,
  isAnalyzing = false,
}: ForecastAiBannerProps) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(20);

  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % ANALYSIS_STAGES.length);
      setProgressPercent((prev) => Math.min(94, prev + 25));
    }, 7000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: AI Model Badge & Description */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800">
            {isAnalyzing ? (
              <IconLoader2 size={24} className="animate-spin text-primary" />
            ) : (
              <IconBrain size={24} stroke={1.75} />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-800">
                <IconSparkles size={13} className="text-primary" />
                Цифровой двойник Allur AI
              </span>
              <span className="text-xs font-medium text-slate-400">
                {isAnalyzing
                  ? 'Выполняется предиктивный расчет (~25-30 сек)'
                  : 'Версия предиктивной модели 2.4'}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-900">
              {isAnalyzing
                ? 'Нейросеть рассчитывает суточный такт и риски простоев'
                : 'Предиктивный расчет сменного такта и рисков срыва производственного плана'}
            </p>

            {isAnalyzing ? (
              <p className="text-xs text-primary font-medium flex items-center gap-1.5 animate-pulse">
                <span>[Этап {stageIndex + 1}/3]</span>
                <span>{ANALYSIS_STAGES[stageIndex]}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Расчет выполнен на основе телеметрии SCADA по 4 цехам завода с
                учетом регламентов ТО и накопленных простоев.
              </p>
            )}
          </div>
        </div>

        {/* Right: Confidence Indicators or Live Progress */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:shrink-0">
          {isAnalyzing ? (
            <div className="flex flex-col gap-1.5 min-w-56 sm:min-w-64 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  Расчет рекомендаций
                </span>
                <span className="font-bold text-slate-900">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs">
                <IconShieldCheck size={16} className="text-emerald-600" />
                <div>
                  <span className="block text-[11px] font-medium text-slate-400">
                    Точность прогноза
                  </span>
                  <span className="font-bold text-slate-900">94.8% (±2.8%)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <div>
                  <span className="block text-[11px] font-medium text-slate-400">
                    Факторы риска
                  </span>
                  <span className="font-bold text-slate-900">
                    {bottlenecksCount} узких места
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={onOpenSimulation}
                leftIcon={<IconAdjustments size={16} stroke={1.75} />}
                className="rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
              >
                Симуляция «Что-если»
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
