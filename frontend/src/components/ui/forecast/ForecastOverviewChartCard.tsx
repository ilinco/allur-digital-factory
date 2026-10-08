import { IconChartBar } from '@tabler/icons-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyForecastOverviewPoint } from '@/types/forecast';

interface ForecastOverviewChartCardProps {
  data: MonthlyForecastOverviewPoint[];
  totalForecast?: number;
  horizon?: 'monthly' | 'weekly' | 'shift';
}

const MODEL_SERIES = [
  { key: 'onix', name: 'Chevrolet Onix', color: '#ff2e1f' },
  { key: 'cobalt', name: 'Chevrolet Cobalt', color: '#e11d48' },
  { key: 'jac', name: 'JAC J7', color: '#f59e0b' },
  { key: 'jetour', name: 'Jetour Dashing', color: '#475569' },
  { key: 'other', name: 'Прочие модели', color: '#cbd5e1' },
];

export const ForecastOverviewChartCard = ({
  data,
  totalForecast = 8758,
  horizon = 'monthly',
}: ForecastOverviewChartCardProps) => {
  const horizonSubtitle =
    horizon === 'weekly'
      ? 'по неделям'
      : horizon === 'shift'
        ? 'по сменам'
        : 'по месяцам';

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <IconChartBar size={18} stroke={1.75} />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            ИИ-обзор прогноза выпуска ({horizonSubtitle})
          </h2>
        </div>
      </div>

      {/* Main Metric Highlight */}
      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-slate-900">
          {totalForecast.toLocaleString('ru-RU')} шт.
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-600">
            ↑ 15.8%
          </span>
          <span className="text-xs font-medium text-slate-500">
            (+410 шт. превышение базового плана)
          </span>
        </div>
      </div>

      {/* Column Totals Preview (dynamic count) */}
      <div className="mt-4 flex items-center justify-around gap-2 text-center">
        {data.map((item) => (
          <div
            key={item.month}
            className="flex-1 text-xs font-semibold text-slate-700"
          >
            {item.total.toLocaleString('ru-RU')} шт.
          </div>
        ))}
      </div>

      {/* Stacked Bar Chart */}
      <div className="mt-2 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barSize={64}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const totalMonth = payload.reduce(
                  (sum, p) => sum + (Number(p.value) || 0),
                  0,
                );
                return (
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md text-xs font-medium">
                    <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1.5">
                      {label}: {totalMonth} шт.
                    </p>
                    <div className="space-y-1">
                      {payload.map((p) => (
                        <div
                          key={p.name}
                          className="flex items-center justify-between gap-3 text-slate-600"
                        >
                          <span className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            {p.name}:
                          </span>
                          <span className="font-semibold text-slate-900">
                            {p.value} шт.
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />
            {MODEL_SERIES.map((m, idx) => (
              <Bar
                key={m.key}
                dataKey={m.key}
                name={m.name}
                stackId="forecastStack"
                fill={m.color}
                radius={
                  idx === MODEL_SERIES.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
        {MODEL_SERIES.map((m) => (
          <div key={m.key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: m.color }}
            />
            <span>{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
