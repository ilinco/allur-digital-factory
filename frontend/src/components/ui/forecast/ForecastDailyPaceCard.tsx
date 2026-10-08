import { useState } from 'react';
import {
  IconBrain,
  IconSparkles,
  IconTrendingUp,
  IconArrowRight,
  IconAdjustments,
  IconLoader2,
} from '@tabler/icons-react';
import type { DayForecastPoint } from '@/types/forecast';
import { Button } from '@/components/ui/Button';

interface ForecastDailyPaceCardProps {
  data: DayForecastPoint[];
  aiRecommendations?: string[];
  onOpenSimulation?: () => void;
  isAnalyzing?: boolean;
}

export const ForecastDailyPaceCard = ({
  data,
  aiRecommendations = [],
  onOpenSimulation,
  isAnalyzing = false,
}: ForecastDailyPaceCardProps) => {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(2); // Tuesday (Вт)

  const totalWeekly = data.reduce((sum, d) => sum + d.units, 0);
  const activeDay = data[activeDayIndex] || data[2];
  const maxUnits = Math.max(...data.map((d) => d.units), 4000);
  const baselineDailyTarget = 2550; // Reference daily target for 1.8 min takt

  const isMeaningfulText = (text: unknown): boolean => {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    if (trimmed.length < 15) return false;
    if (/^rec\s*\d*$/i.test(trimmed)) return false;
    if (/^рекомендаци[яи]\s*\d*$/i.test(trimmed)) return false;
    if (/^recommendation\s*\d*$/i.test(trimmed)) return false;
    return true;
  };

  const validRecs = aiRecommendations.filter(isMeaningfulText);
  const displayRecs =
    validRecs.length >= 2
      ? validRecs.slice(0, 2)
      : [
          'Сгладить пик вторника (3 874 шт.): перенести партию кузовов JAC на среду во избежание затора сварки.',
          'Диагностика натяжного механизма Конвейер-03 до начала 2-й смены (сохранение +14 авто).',
        ];

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header with AI Model Indicator */}
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              {isAnalyzing ? (
                <IconLoader2 size={18} className="animate-spin text-primary" />
              ) : (
                <IconBrain size={18} stroke={1.75} />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ИИ-прогноз такта и ритмичности
              </h2>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
            {isAnalyzing ? (
              <>
                <IconLoader2 size={12} className="animate-spin text-primary" />
                AI: Анализ...
              </>
            ) : (
              <>
                <IconSparkles size={12} className="text-primary" />
                AI: 94.8% точность
              </>
            )}
          </span>
        </div>

        {/* Core Metrics Summary */}
        <div className="mt-3.5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="text-[11px] font-medium text-slate-500">
              Недельный объем
            </span>
            <div className="mt-0.5 text-xl font-bold text-slate-900">
              {totalWeekly.toLocaleString('ru-RU')} шт.
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <IconTrendingUp size={13} />
              <span>+8.3% к прошлой нед.</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <span className="text-[11px] font-medium text-slate-500">
              Расчетный такт линии
            </span>
            <div className="mt-0.5 text-xl font-bold text-slate-900">
              1.85 мин/ед.
            </div>
            <div className="mt-1 text-[11px] font-medium text-slate-500">
              Норматив: 1.80 мин
            </div>
          </div>
        </div>

        {/* Daily Pace Bar Chart with Fixed Height Container */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Суточный ритм выпуска</span>
            <span className="text-[11px] font-normal text-slate-400">
              Норма: {baselineDailyTarget.toLocaleString('ru-RU')} шт./сут.
            </span>
          </div>

          {/* Chart Area */}
          <div className="relative mt-2 h-32 rounded-xl border border-slate-100 bg-slate-50/40 p-2.5">
            {/* Baseline Reference Line */}
            <div
              style={{
                bottom: `${Math.round((baselineDailyTarget / maxUnits) * 100)}%`,
              }}
              className="pointer-events-none absolute left-2 right-2 border-b border-dashed border-slate-300 z-0"
              title="Нормативный суточный план"
            />

            {/* Bars Column Container */}
            <div className="relative z-10 flex h-full items-end justify-between gap-1.5 sm:gap-2">
              {data.map((item, index) => {
                const isSelected = index === activeDayIndex;
                const isOverload = item.units > baselineDailyTarget * 1.25;
                const heightPercent = Math.min(
                  100,
                  Math.max(18, Math.round((item.units / maxUnits) * 100)),
                );

                return (
                  <div
                    key={item.dayShort}
                    onClick={() => setActiveDayIndex(index)}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end cursor-pointer"
                  >
                    {/* Tooltip on Active/Hover Day */}
                    {isSelected && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs z-20">
                        {item.units.toLocaleString('ru-RU')} шт.
                      </div>
                    )}

                    {/* Bar track and fill */}
                    <div className="flex h-20 w-full items-end justify-center">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-7 rounded-t-md transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary shadow-xs ring-2 ring-primary/25'
                            : isOverload
                              ? 'bg-amber-400/90 hover:bg-amber-500'
                              : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                        title={`${item.day}: ${item.units} шт.`}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      className={`mt-1.5 text-[11px] font-semibold ${
                        isSelected
                          ? 'font-bold text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.dayShort}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day status callout */}
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>
              Выбран день: <strong className="text-slate-900">{activeDay.day}</strong>
            </span>
            <span className="font-semibold text-slate-900">
              {activeDay.units.toLocaleString('ru-RU')} шт.{' '}
              {activeDay.units > baselineDailyTarget && (
                <span className="text-primary font-bold">
                  (+{activeDay.units - baselineDailyTarget} к норме)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Actionable AI Recommendations Section */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            {isAnalyzing ? (
              <IconLoader2 size={14} className="animate-spin text-primary" />
            ) : (
              <IconSparkles size={14} className="text-primary" />
            )}
            <span>Рекомендации ИИ по ритму:</span>
          </div>
          {isAnalyzing ? (
            <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
              Расчет рекомендаций...
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-700">
              Эффект: +22 авто
            </span>
          )}
        </div>

        <div className="mt-2 space-y-2 text-xs text-slate-700">
          {displayRecs.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="leading-snug">{rec}</span>
            </div>
          ))}
        </div>

        {onOpenSimulation && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/70">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSimulation}
              leftIcon={<IconAdjustments size={14} stroke={1.75} />}
              rightIcon={<IconArrowRight size={13} stroke={1.75} />}
              className="w-full justify-between text-xs font-semibold"
            >
              Смоделировать устранение узких мест
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
