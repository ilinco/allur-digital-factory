import type { HourlyPacePoint } from '@/types/dashboard';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ProductionTrendChartProps {
  data: HourlyPacePoint[];
  totalFact?: number;
  totalPlan?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    payload: HourlyPacePoint;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const current = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium shadow-md">
      <div className="font-semibold text-slate-900">Время: {current.time}</div>
      <div className="mt-1.5 flex items-center justify-between gap-4 text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Факт:
        </span>
        <span className="font-bold text-slate-900">{current.fact} шт.</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-4 text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          План:
        </span>
        <span className="font-semibold text-slate-700">{current.plan} шт.</span>
      </div>
      <div className="mt-2.5 border-t border-slate-100 pt-1.5 text-xs font-medium text-slate-500">
        Сварка: {current.weldingFact} • Окраска: {current.paintingFact} •
        Сборка: {current.assemblyFact}
      </div>
    </div>
  );
};

export const ProductionTrendChart = ({
  data,
  totalFact = 346,
  totalPlan = 360,
}: ProductionTrendChartProps) => {
  const [interval, setInterval] = useState<string>('shift1');

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Динамика выпуска продукции
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="font-medium text-slate-700">
                Факт: {totalFact} шт.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              <span className="font-medium text-slate-500">
                План: {totalPlan} шт.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Интервал:</span>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
          >
            <option value="shift1">Смена 1 (08:00 - 20:00)</option>
            <option value="shift2">Смена 2 (20:00 - 08:00)</option>
            <option value="hourly">Почасовой такт</option>
          </select>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="factGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff2e1f" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ff2e1f" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }}
                domain={[0, 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="plan"
                stroke="#cbd5e1"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="transparent"
              />
              <Area
                type="monotone"
                dataKey="fact"
                stroke="#ff2e1f"
                strokeWidth={2.5}
                fill="url(#factGradient)"
                activeDot={{
                  r: 6,
                  fill: '#ff2e1f',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
