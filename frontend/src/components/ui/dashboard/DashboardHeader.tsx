import { IconHelpCircle } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { DateSelector } from '@/components/ui/DateSelector';
import { HeaderUpdateBadge } from '@/components/ui/HeaderUpdateBadge';

interface DashboardHeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenGuide?: () => void;
}

export const DashboardHeader = ({
  selectedDate,
  onSelectDate,
  onRefresh,
  isRefreshing,
  onOpenGuide,
}: DashboardHeaderProps) => {
  const formattedDate = (() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const months: Record<string, string> = {
        '01': 'Янв', '02': 'Фев', '03': 'Мар', '04': 'Апр',
        '05': 'Май', '06': 'Июн', '07': 'Июл', '08': 'Авг',
        '09': 'Сен', '10': 'Окт', '11': 'Ноя', '12': 'Дек',
      };
      return `${parts[2]} ${months[parts[1]] ?? parts[1]} ${parts[0]}`;
    }
    return selectedDate;
  })();

  return (
    <PageHeader
      title="Аналитика производства"
      actions={
        <>
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />

          <HeaderUpdateBadge
            formattedDate={formattedDate}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
          />

          {onOpenGuide && (
            <Button
              variant="secondary"
              onClick={onOpenGuide}
              leftIcon={<IconHelpCircle size={17} />}
              title="Открыть регламент статусов SLA"
            >
              Справка
            </Button>
          )}
        </>
      }
    />
  );
};
