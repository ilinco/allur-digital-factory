import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

export interface DateStripOption {
  value: string;
  label: string;
}

export interface DateStripSelectorProps {
  dates: DateStripOption[];
  selectedDate: string;
  onSelectDate: (value: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  disabledPrev?: boolean;
  disabledNext?: boolean;
  className?: string;
}

export const DateStripSelector = ({
  dates,
  selectedDate,
  onSelectDate,
  onPrev,
  onNext,
  disabledPrev = false,
  disabledNext = false,
  className = '',
}: DateStripSelectorProps) => {
  return (
    // h-9 задает единую фиксированную высоту всей строке (36px)
    <div className={`flex h-9 items-stretch gap-2 ${className}`}>
      {/* Кнопка "Назад" занимает h-full и пропорциональную ширину w-9 */}
      <button
        type="button"
        onClick={onPrev}
        disabled={disabledPrev || !onPrev}
        title="Предыдущая смена"
        aria-label="Предыдущая смена"
        className="flex h-full w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50/70 text-primary shadow-2xs transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none"
      >
        <IconChevronLeft size={16} stroke={2} />
      </button>

      {/* Центральный блок: h-full растягивает его ровно по высоте стрелок */}
      <div className="flex h-full flex-1 items-stretch gap-1 rounded-xl border border-slate-200 bg-slate-50/70 p-1 text-xs font-medium sm:text-sm">
        {dates.map((d) => {
          const isSelected = selectedDate === d.value;
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => onSelectDate(d.value)}
              aria-pressed={isSelected}
              // flex-1 выравнивает ширину кнопок, h-full — высоту
              className={`flex flex-1 cursor-pointer items-center justify-center rounded-lg px-2 transition-colors outline-none focus:outline-none ${
                isSelected
                  ? 'bg-white font-semibold text-primary shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Кнопка "Вперед" */}
      <button
        type="button"
        onClick={onNext}
        disabled={disabledNext || !onNext}
        title="Следующая смена"
        aria-label="Следующая смена"
        className="flex h-full w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-slate-50/70 text-primary shadow-2xs transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none"
      >
        <IconChevronRight size={16} stroke={2} />
      </button>
    </div>
  );
};
