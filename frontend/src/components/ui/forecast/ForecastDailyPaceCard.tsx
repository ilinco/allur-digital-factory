import { useState } from 'react';
import { IconCalendarStats } from '@tabler/icons-react';
import type { DayForecastPoint } from '@/types/forecast';

interface ForecastDailyPaceCardProps {
  data: DayForecastPoint[];
}

export const ForecastDailyPaceCard = ({ data }: ForecastDailyPaceCardProps) => {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(2); // Tuesday / Вт by default

  const totalWeekly = data.reduce((sum, d) => sum + d.units, 0);
  const activeDay = data[activeDayIndex] || data[2];
  const maxUnits = Math.max(...data.map((d) => d.units));

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <IconCalendarStats size={18} stroke={1.75} />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            Прогноз суточного такта
          </h2>
        </div>
      </div>

      {/* Main Metric Highlight */}
      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-slate-900">
          {totalWeekly.toLocaleString('ru-RU')} шт.
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            8.3% ↗
          </span>
          <span className="text-xs font-medium text-slate-500">
            +749 шт. к прошлой неделе
          </span>
        </div>
      </div>

      {/* Days of Week Bar Chart with highlighted active day */}
      <div className="mt-6 flex flex-1 flex-col justify-end">
        <div className="flex h-48 items-end justify-between gap-2 sm:gap-3 px-1">
          {data.map((item, index) => {
            const isSelected = index === activeDayIndex;
            const heightPercent = Math.max(
              16,
              Math.round((item.units / maxUnits) * 88),
            );

            return (
              <div
                key={item.dayShort}
                onClick={() => setActiveDayIndex(index)}
                className="group relative flex flex-1 flex-col items-center cursor-pointer"
              >
                {/* Value Callout on Active Day */}
                {isSelected && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-xs font-bold text-white shadow-xs">
                    {item.units.toLocaleString('ru-RU')}
                  </div>
                )}

                {/* Vertical Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-10 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary shadow-sm ring-2 ring-primary/20'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                  title={`${item.day}: ${item.units} шт.`}
                />

                {/* Day of Week Label */}
                <span
                  className={`mt-2 text-xs font-semibold ${
                    isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.dayShort}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Day Footer Info */}
        <div className="mt-4 border-t border-slate-100 pt-3 text-center text-xs font-medium text-slate-500">
          Пиковый прогноз:{' '}
          <span className="font-semibold text-slate-900">{activeDay.day}</span>{' '}
          (
          <span className="font-semibold text-primary">
            {activeDay.units} шт.
          </span>
          )
        </div>
      </div>
    </div>
  );
};
