import type { DowntimeIncident, StationStatus } from '@/types/dashboard';
import { IconBuildingFactory2, IconClockPause } from '@tabler/icons-react';
import { useState } from 'react';
import { DateStripSelector } from '@/components/ui/DateStripSelector';
import { CardTabs } from '@/components/ui/CardTabs';

interface ScheduleAndDowntimesCardProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  stations: StationStatus[];
  downtimes: DowntimeIncident[];
}

export const ScheduleAndDowntimesCard = ({
  selectedDate,
  onSelectDate,
  stations,
  downtimes,
}: ScheduleAndDowntimesCardProps) => {
  const [activeTab, setActiveTab] = useState<'stations' | 'downtimes'>(
    'stations',
  );

  const dates = [
    { label: '30 Сен', value: '2026-09-30' },
    { label: '1 Окт', value: '2026-10-01' },
    { label: '2 Окт', value: '2026-10-02' },
    { label: '3 Окт', value: '2026-10-03' },
  ];

  const getStatusBadge = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return (
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-md font-medium text-rose-700">
            Критично
          </span>
        );
      case 'warning':
        return (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-md font-medium text-amber-700">
            Внимание
          </span>
        );
      default:
        return (
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-md font-medium text-emerald-700">
            В норме
          </span>
        );
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Card Header with bottom border */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Оперативный статус
        </h2>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Date Selector Strip */}
          <DateStripSelector
            dates={dates}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
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
                  <p className="mt-0.5 text-md font-medium text-slate-500">
                    Факт: {st.fact} / {st.plan} шт. • Простой: {st.downtime_min}{' '}
                    мин
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(st.status)}
                  <span className="text-md font-medium text-slate-500">
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
                <div className="flex flex-col items-end gap-1">
                  {getStatusBadge(dt.status)}
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
