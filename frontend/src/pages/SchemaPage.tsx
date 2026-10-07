import { useState } from 'react';
import { PageContent } from '@/components/layout/PageContent';
import { ConveyorPipelineFlow } from '@/components/ui/schema/ConveyorPipelineFlow';
import { RecordDowntimeModal } from '@/components/ui/schema/RecordDowntimeModal';
import { RecordEventModal } from '@/components/ui/schema/RecordEventModal';
import { SchemaHeader } from '@/components/ui/schema/SchemaHeader';
import { SchemaKpiCards } from '@/components/ui/schema/SchemaKpiCards';
import { SectionEquipmentGrid } from '@/components/ui/schema/SectionEquipmentGrid';
import { SimulationAlertBanner } from '@/components/ui/schema/SimulationAlertBanner';
import { SimulationQuickBar } from '@/components/ui/schema/SimulationQuickBar';
import { StatusGuideModal } from '@/components/ui/StatusGuideModal';
import { StatusLegendBar } from '@/components/ui/StatusLegendBar';
import { ErrorCard } from '@/components/ui/error/ErrorCard';
import { useFactoryLayoutData } from '@/hooks/useFactoryLayoutData';
import { useLockedBody } from '@/hooks/useLockedBody';

export const SchemaPage = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-02');
  const [isDowntimeModalOpen, setIsDowntimeModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const isAnyModalOpen = isDowntimeModalOpen || isEventModalOpen || isGuideOpen;
  const [modalEquipment, setModalEquipment] = useState<{
    name?: string;
    id?: number;
  }>({});

  useLockedBody(isAnyModalOpen);

  const {
    sections,
    selectedSection,
    selectedSectionId,
    setSelectedSectionId,
    stats,
    isLoading,
    isFetching,
    isError,
    refetchAll,
    simulationResponse,
    clearSimulationAlert,
    triggerSimulation,
    isSimulating,
    recordDowntimeAction,
    isRecordingDowntime,
    recordEventAction,
    isRecordingEvent,
  } = useFactoryLayoutData(selectedDate);

  const handleOpenDowntimeModal = (
    equipmentName?: string,
    equipmentId?: number,
  ) => {
    setModalEquipment({ name: equipmentName, id: equipmentId });
    setIsDowntimeModalOpen(true);
  };

  return (
    <>
      <SchemaHeader
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onRefresh={refetchAll}
        isRefreshing={isFetching}
        onOpenDowntimeModal={() => handleOpenDowntimeModal()}
        onOpenEventModal={() => setIsEventModalOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <PageContent>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 rounded-2xl border border-slate-200 bg-white" />
            <div className="h-44 rounded-2xl border border-slate-200 bg-white" />
            <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
          </div>
        ) : isError ? (
          <ErrorCard
            title="Не удалось загрузить схему производства"
            message="Проверьте соединение с API цифрового двойника завода Allur и повторите попытку."
            onRetry={refetchAll}
          />
        ) : (
          <>
            {/* Top Aggregate KPI row */}
            <SchemaKpiCards stats={stats} />

            {/* AI Assistant incident alert if simulation triggered */}
            {simulationResponse && (
              <SimulationAlertBanner
                response={simulationResponse}
                onDismiss={clearSimulationAlert}
              />
            )}

            {/* Simulation Quick Bar for Jury Demo */}
            <SimulationQuickBar
              onTrigger={triggerSimulation}
              isSimulating={isSimulating}
              activeAction={simulationResponse?.action ?? null}
            />

            {/* SLA Criteria Legend Bar explaining what each status means */}
            <StatusLegendBar onOpenGuide={() => setIsGuideOpen(true)} />

            {/* Visual Conveyor Pipeline Flow (Stage 1 to N) */}
            <ConveyorPipelineFlow
              sections={sections}
              selectedSectionId={selectedSectionId}
              onSelectSection={setSelectedSectionId}
            />

            {/* Selected Section Detail and Equipment Registry */}
            <SectionEquipmentGrid
              section={selectedSection}
              onRecordDowntime={(eqName, eqId) =>
                handleOpenDowntimeModal(eqName, eqId)
              }
              onRecordEvent={() => setIsEventModalOpen(true)}
            />
          </>
        )}
      </PageContent>

      {isDowntimeModalOpen && (
        <RecordDowntimeModal
          onClose={() => setIsDowntimeModalOpen(false)}
          sections={sections}
          initialSectionId={selectedSectionId}
          initialEquipmentName={modalEquipment.name}
          initialEquipmentId={modalEquipment.id}
          onSubmit={recordDowntimeAction}
          isSubmitting={isRecordingDowntime}
        />
      )}

      {isEventModalOpen && (
        <RecordEventModal
          onClose={() => setIsEventModalOpen(false)}
          sections={sections}
          initialSectionId={selectedSectionId}
          onSubmit={(sectionId, payload) =>
            recordEventAction({ sectionId, payload })
          }
          isSubmitting={isRecordingEvent}
        />
      )}

      <StatusGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
};
