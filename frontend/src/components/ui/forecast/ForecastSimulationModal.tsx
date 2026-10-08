import { useEffect } from 'react';
import { IconClockPause, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';
import type { PredictiveForecastResponse } from '@/types/forecast';

interface ForecastSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulateDowntimeMin: number;
  onDowntimeChange: (val: number) => void;
  targetModel: string;
  onModelChange: (model: string) => void;
  forecast: PredictiveForecastResponse;
  onApply: () => void;
  isApplying?: boolean;
}

export const ForecastSimulationModal = ({
  isOpen,
  onClose,
  simulateDowntimeMin,
  onDowntimeChange,
  targetModel,
  onModelChange,
  forecast,
  onApply,
  isApplying,
}: ForecastSimulationModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Симуляция сценария
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Оценка чувствительности OEE и сменного плана к сбоям
                оборудования
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <IconX size={18} stroke={1.75} />
          </button>
        </div>

        {/* Controls */}
        <div className="mt-5 space-y-4">
          {/* Target Model Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Целевая модель для анализа:
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {['Chevrolet Onix', 'Chevrolet Cobalt', 'JAC J7'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onModelChange(m)}
                  className={`rounded-xl border py-2 px-3 text-xs font-semibold transition-all ${
                    targetModel === m
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Downtime Slider */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <IconClockPause
                  size={16}
                  stroke={1.75}
                  className="text-primary"
                />
                <span>Имитация дополнительного простоя:</span>
              </div>
              <span className="rounded-md bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-900">
                +{simulateDowntimeMin} мин
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={120}
              step={5}
              value={simulateDowntimeMin}
              onChange={(e) => onDowntimeChange(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
            />

            <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-400">
              <span>0 мин (базовый)</span>
              <span>60 мин (критичный)</span>
              <span>120 мин</span>
            </div>
          </div>

          {/* Impact Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-xs font-medium text-slate-500">
                Прогнозируемый OEE
              </span>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {forecast.predicted_shift_oee}%
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  forecast.oee_target_met ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {forecast.oee_target_met
                  ? 'Цель 85% достигнута'
                  : 'Ниже целевого норматива'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-xs font-medium text-slate-500">
                Прогноз выпуска модели
              </span>
              <div className="mt-1 text-xl font-bold text-slate-900">
                {forecast.plan_completion_forecast.projected_fact} шт.
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                из {forecast.plan_completion_forecast.month_target} шт. плана
              </span>
            </div>
          </div>

          {/* AI Recommendations Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span>Рекомендации ИИ:</span>
            </div>
            <ul className="mt-2 space-y-2 text-xs font-medium text-slate-600">
              {forecast.ai_recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <Button variant="secondary" size="md" onClick={onClose}>
            Отмена
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isApplying}
            onClick={onApply}
          >
            Применить сценарий
          </Button>
        </div>
      </div>
    </div>
  );
};
