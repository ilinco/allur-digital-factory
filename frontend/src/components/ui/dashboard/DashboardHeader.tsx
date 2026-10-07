import { PageHeader } from '@/components/layout/PageHeader';
import { DateSelector } from '@/components/ui/DateSelector';
import { HeaderUpdateBadge } from '@/components/ui/HeaderUpdateBadge';

interface DashboardHeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardHeader = ({
  selectedDate,
  onSelectDate,
  onRefresh,
  isRefreshing,
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
        </>
      }
    />
  );
};
