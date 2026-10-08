import { IconChartPie } from '@tabler/icons-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { ModelShareItem } from '@/types/forecast';

interface ForecastDistributionCardProps {
  data: ModelShareItem[];
}

export const ForecastDistributionCard = ({
  data,
}: ForecastDistributionCardProps) => {
  const totalUnits = data.reduce((sum, item) => sum + item.units, 0);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <IconChartPie size={18} stroke={1.75} />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            Структура распределения
          </h2>
        </div>
      </div>

      {/* 3 Metric Pills with colored left line (matching screenshot) */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-b border-slate-100 pb-4">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex flex-col pl-2 border-l-2"
            style={{ borderColor: item.color }}
          >
            <span className="truncate text-xs font-medium text-slate-400">
              {item.name.replace('Chevrolet ', '')}
            </span>
            <span className="mt-0.5 text-sm font-bold text-slate-900">
              {item.units.toLocaleString('ru-RU')} шт.
            </span>
          </div>
        ))}
      </div>

      {/* Donut Gauge Chart */}
      <div className="relative my-2 flex h-52 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="units"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              startAngle={180}
              endAngle={-180}
              paddingAngle={4}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0];
                return (
                  <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-md text-xs font-medium">
                    <span className="font-semibold text-slate-900">
                      {item.name}
                    </span>
                    :
                    <span className="ml-1 font-bold text-slate-800">
                      {item.value} шт.
                    </span>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {totalUnits.toLocaleString('ru-RU')}
          </span>
          <span className="text-xs font-medium text-slate-400">
            Всего прогноз
          </span>
        </div>
      </div>

      {/* Bottom Share breakdown */}
      <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-700">{item.name}</span>
            </div>
            <span className="font-semibold text-slate-900">
              {item.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
