export interface DateOption {
  value: string;
  label: string;
}

export interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  options?: DateOption[];
  className?: string;
}

const DEFAULT_OPTIONS: DateOption[] = [
  { value: '2026-10-01', label: '01 Окт 2026' },
  { value: '2026-10-02', label: '02 Окт 2026' },
];

export const DateSelector = ({
  selectedDate,
  onSelectDate,
  options = DEFAULT_OPTIONS,
  className = '',
}: DateSelectorProps) => {
  return (
    <div
      role="group"
      aria-label="Выбор даты"
      className={`flex items-center rounded-xl border border-neutral-200/90 bg-white p-1 text-sm font-medium text-slate-600 shadow-2xs ${className}`}
    >
      {options.map((option) => {
        const isSelected = selectedDate === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelectDate(option.value)}
            aria-pressed={isSelected}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 transition-colors outline-none focus:outline-none ${
              isSelected
                ? 'bg-neutral-100 font-semibold text-primary'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
