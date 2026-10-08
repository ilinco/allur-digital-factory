import { IconCalendar } from '@tabler/icons-react';
import { Select } from '@/components/ui/Select';

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

const DEFAULT_DATE_OPTIONS: DateOption[] = [
  { value: '2026-10-08', label: '08 Окт 2026 (Сегодня)' },
  { value: '2026-10-07', label: '07 Окт 2026' },
  { value: '2026-10-06', label: '06 Окт 2026' },
  { value: '2026-10-05', label: '05 Окт 2026' },
  { value: '2026-10-04', label: '04 Окт 2026' },
  { value: '2026-10-03', label: '03 Окт 2026' },
  { value: '2026-10-02', label: '02 Окт 2026' },
  { value: '2026-10-01', label: '01 Окт 2026' },
];

export const DateSelector = ({
  selectedDate,
  onSelectDate,
  options = DEFAULT_DATE_OPTIONS,
  className = '',
}: DateSelectorProps) => {
  return (
    <div className={`min-w-44 sm:min-w-52 ${className}`}>
      <Select<string>
        options={options}
        value={selectedDate}
        onChange={onSelectDate}
        leftIcon={<IconCalendar size={16} className="text-slate-500" />}
        aria-label="Выбор рабочей смены"
        size="md"
      />
    </div>
  );
};
