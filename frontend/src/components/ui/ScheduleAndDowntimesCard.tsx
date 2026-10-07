import type { DowntimeIncident, StationStatus } from '@/types/dashboard';
import { IconArrowUpRight, IconBuildingFactory2, IconClockPause } from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { DateStripSelector } from '@/components/ui/DateStripSelector';
import { CardTabs } from '@/components/ui/CardTabs';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { StaticLinks } from '@/config/StaticLinks';

interface ScheduleAndDowntimesCardProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  stations: StationStatus[];
  downtimes: DowntimeIncident[];
}

const DATES = [
  { label: '30 Сен', value: '2026-09-30' },
  { label: '1 Окт', value: '2026-10-01' },
  { label: '2 Окт', value: '2026-10-02' },
  { label: '3 Окт', value: '2026-10-03' },
];

export const ScheduleAndDowntimesCard = ({
  selectedDate,
  onSelectDate,
  stations,
  downtimes,
}: ScheduleAndDowntimesCardProps) => {
  const [activeTab, setActiveTab] = useState<'stations' | 'downtimes'>('stations');

  const currentIndex = DATES.findIndex((d) => d.value === selectedDate);
  const safeIndex = currentIndex !== -1 ? currentIndex : 2;

  const handlePrevDate = () => {
    if (safeIndex > 0) {
      onSelectDate(DATES[safeIndex - 1].value);
    }
  };

  const handleNextDate = () => {
    if (safeIndex < DATES.length - 1) {
      onSelectDate(DATES[safeIndex + 1].value);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Оперативный статус
          </h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Срез по участкам сборки и журналу простоев
          </p>
        </div>
        <Link
          to={StaticLinks.schema}
          className="flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
          title="Открыть интерактивную схему производства"
        >
          <span>Мнемосхема</span>
          <IconArrowUpRight size={14} />
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Date Selector Strip with active Prev/Next handlers */}
          <DateStripSelector
            dates={DATES}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            onPrev={handlePrevDate}
            onNext={handleNextDate}
            disabledPrev={safeIndex <= 0}
            disabledNext={safeIndex >= DATES.length - 1}
          />

          {/* Tab switchers */}
          <CardTabs<'stations' | 'downtimes'>
            className="mt-3.5"
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                id: 'stations',
                label: 'Станции',
                icon: <IconBuildingFactory2 size={17} />,
                count: stations.length,
              },
              {
                id: 'downtimes',
                label: 'Простои',
                icon: <IconClockPause size={17} />,
                count: downtimes.length,
              },
            ]}
          />
        </div>

        {/* Tab Content */}
        <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
          {activeTab === 'stations' ? (
            stations.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-sm transition-colors hover:bg-slate-50"
              >
                <div>
                  <p className="font-semibold text-slate-900">{st.name}</p>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500">
                    Факт: {st.fact} / {st.plan} шт. • Простой: {st.downtime_min} мин
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusIndicator
                    status={st.status}
                    description={`Участок ${st.name}: простой ${st.downtime_min} мин, загрузка ${st.load_percent}%, брак ${st.defect_percent}%`}
                  />
                  <span className="text-xs font-medium text-slate-500">
                    Загрузка: {st.load_percent}%
                  </span>
                </div>
              </div>
            ))
          ) : downtimes.length > 0 ? (
            downtimes.map((dt) => (
              <div
                key={dt.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-sm transition-colors hover:bg-slate-50"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {dt.section}: {dt.equipment}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    Причина: {dt.reason}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusIndicator
                    status={dt.status}
                    description={`Простой агрегата ${dt.equipment} (${dt.section}): ${dt.reason}, длительность ${dt.durationMinutes} мин`}
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    {dt.durationMinutes} мин
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-sm font-medium text-slate-400">
              Зафиксированных простоев нет
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
