import type { StationStatus } from '@/types/dashboard';
import { IconDotsVertical } from '@tabler/icons-react';

interface StationsLoadCardProps {
  stations: StationStatus[];
}

export const StationsLoadCard = ({ stations }: StationsLoadCardProps) => {
  // Sort by load_percent descending to showcase highest loaded lines first
  const sortedStations = [...stations].sort(
    (a, b) => b.load_percent - a.load_percent,
  );

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">
            Загрузка участков
          </h2>
          <button
            type="button"
            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <IconDotsVertical size={18} stroke={1.75} />
          </button>
        </div>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Коэффициент загрузки мощностей по сборочным линиям
        </p>
      </div>

      <div className="my-4 space-y-4">
        {sortedStations.map((st) => (
          <div key={st.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="font-semibold text-slate-900">{st.name}</span>
              <span className="font-bold text-slate-900">
                {st.load_percent.toFixed(1)}%
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                style={{ width: `${Math.min(100, st.load_percent)}%` }}
                className="h-full rounded-full bg-[#ff2e1f] transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>
                Выпуск: {st.fact} из {st.plan} шт.
              </span>
              <span>Брак: {st.defect_percent}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-3 text-center text-xs font-medium text-slate-400">
        Лимиты такта: 120 авто/смену на линию
      </div>
    </div>
  );
};
