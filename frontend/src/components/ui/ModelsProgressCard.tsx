import type { ModelProgress } from '@/types/dashboard';
import { IconDotsVertical } from '@tabler/icons-react';

interface ModelsProgressCardProps {
  models: ModelProgress[];
}

const MODEL_COLORS = [
  { bar: 'bg-[#ff2e1f]', dot: 'bg-[#ff2e1f]', text: 'text-[#ff2e1f]' },
  { bar: 'bg-[#ff6b5f]', dot: 'bg-[#ff6b5f]', text: 'text-[#ff6b5f]' },
  { bar: 'bg-[#ffb4ad]', dot: 'bg-[#ffb4ad]', text: 'text-[#ffb4ad]' },
];

export const ModelsProgressCard = ({ models }: ModelsProgressCardProps) => {
  const totalTarget = models.reduce(
    (sum, m) => sum + (m.target_monthly || m.target || 0),
    0,
  );

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">
            План производства по моделям
          </h2>
          <button
            type="button"
            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <IconDotsVertical size={18} stroke={1.75} />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {totalTarget.toLocaleString('ru-RU')} шт.
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-600">
            ↑ Месячная программа завода Allur
          </p>
        </div>

        {/* Segmented Progress Bar */}
        <div className="mt-4 flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
          {models.map((item, idx) => {
            const target = item.target_monthly || item.target || 0;
            const percent = totalTarget > 0 ? (target / totalTarget) * 100 : 0;
            const color = MODEL_COLORS[idx % MODEL_COLORS.length];
            return (
              <div
                key={item.model_name}
                style={{ width: `${percent}%` }}
                className={`h-full ${color.bar}`}
                title={`${item.model_name}: ${percent.toFixed(1)}%`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-5 space-y-3.5 border-t border-slate-100 pt-4">
        {models.map((item, idx) => {
          const target = item.target_monthly || item.target || 0;
          const sharePercent =
            totalTarget > 0 ? ((target / totalTarget) * 100).toFixed(1) : '0';
          const color = MODEL_COLORS[idx % MODEL_COLORS.length];

          return (
            <div
              key={item.model_name}
              className="flex items-center justify-between text-sm font-medium"
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${color.dot}`} />
                <span className="font-medium text-slate-800">
                  {item.model_name}
                </span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <span className="font-semibold text-slate-900">
                  {target.toLocaleString('ru-RU')} шт.
                </span>
                <span className="text-slate-400">({sharePercent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
