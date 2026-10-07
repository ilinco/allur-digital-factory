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
  const formattedDate =
    selectedDate === '2026-10-02'
      ? '02 Окт 2026'
      : selectedDate === '2026-10-01'
        ? '01 Окт 2026'
        : selectedDate;

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
