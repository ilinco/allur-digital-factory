import { IconClipboardCheck, IconClockPause, IconHelpCircle } from '@tabler/icons-react';
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
  onOpenGuide?: () => void;
}

export const SchemaHeader = ({
  selectedDate,
  onSelectDate,
  onRefresh,
  isRefreshing,
  onOpenDowntimeModal,
  onOpenEventModal,
  onOpenGuide,
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

          {onOpenGuide && (
            <Button
              variant="secondary"
              onClick={onOpenGuide}
              leftIcon={<IconHelpCircle size={17} />}
              title="Открыть регламент статусов SLA"
            >
              Справка SLA
            </Button>
          )}

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
            События
          </Button>
        </>
      }
    />
  );
};
