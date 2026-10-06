import type { DowntimeIncident, StationStatus } from "@/types/dashboard";
import {
  IconBuildingFactory2,
  IconChevronLeft,
  IconChevronRight,
  IconClockPause,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState<"stations" | "downtimes">(
    "stations",
  );

  const dates = [
    { label: "30 Сен", value: "2026-09-30" },
    { label: "1 Окт", value: "2026-10-01" },
    { label: "2 Окт", value: "2026-10-02" },
    { label: "3 Окт", value: "2026-10-03" },
  ];

  const getStatusBadge = (status: "normal" | "warning" | "critical") => {
    switch (status) {
      case "critical":
        return (
          <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
            Критично
          </span>
        );
      case "warning":
        return (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
            Внимание
          </span>
        );
      default:
        return (
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
            В норме
          </span>
        );
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Оперативный статус
          </h2>
          <button
            type="button"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <IconDotsVertical size={18} stroke={1.75} />
          </button>
        </div>

        {/* Date Selector Strip */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-1 text-sm font-medium">
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700"
            title="Назад"
          >
            <IconChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-1">
            {dates.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => onSelectDate(d.value)}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  selectedDate === d.value
                    ? "bg-white font-semibold text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-700"
            title="Вперед"
          >
            <IconChevronRight size={18} />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="mt-3.5 flex border-b border-slate-200 text-sm font-medium text-slate-500">
          <button
            type="button"
            onClick={() => setActiveTab("stations")}
            className={`flex flex-1 items-center justify-center gap-2 pb-2.5 transition-colors ${
              activeTab === "stations"
                ? "border-b-2 border-[#ff2e1f] font-semibold text-[#ff2e1f]"
                : "hover:text-slate-700"
            }`}
          >
            <IconBuildingFactory2 size={17} />
            <span>Станции ({stations.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("downtimes")}
            className={`flex flex-1 items-center justify-center gap-2 pb-2.5 transition-colors ${
              activeTab === "downtimes"
                ? "border-b-2 border-[#ff2e1f] font-semibold text-[#ff2e1f]"
                : "hover:text-slate-700"
            }`}
          >
            <IconClockPause size={17} />
            <span>Простои ({downtimes.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {activeTab === "stations" ? (
          stations.map((st) => (
            <div
              key={st.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-sm transition-colors hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold text-slate-900">{st.name}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Факт: {st.fact} / {st.plan} шт. • Простой: {st.downtime_min} мин
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {getStatusBadge(st.status)}
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
  );
};
