import {
  IconClipboardCheck,
  IconClockPause,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { DateSelector } from '@/components/ui/DateSelector';
import { HeaderUpdateBadge } from '@/components/ui/HeaderUpdateBadge';

interface SchemaHeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenDowntimeModal: () => void;
  onOpenEventModal: () => void;
}

export const SchemaHeader = ({
  selectedDate,
  onSelectDate,
  onRefresh,
  isRefreshing,
  onOpenDowntimeModal,
  onOpenEventModal,
}: SchemaHeaderProps) => {
  const formattedDate =
    selectedDate === '2026-10-02'
      ? '02 Окт 2026'
      : selectedDate === '2026-10-01'
        ? '01 Окт 2026'
        : selectedDate;

  return (
    <PageHeader
      title="Схема производства"
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

          <Button
            variant="outline"
            onClick={onOpenDowntimeModal}
            leftIcon={<IconClockPause size={17} />}
          >
            Внести простой
          </Button>

          <Button
            variant="primary"
            onClick={onOpenEventModal}
            leftIcon={<IconClipboardCheck size={17} />}
          >
            Событие ОТК
          </Button>
        </>
      }
    />
  );
};
