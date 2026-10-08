import { Select } from '@/components/ui/Select';
import type { HourlyPacePoint } from '@/types/dashboard';
import { useMemo, useState } from 'react';
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

  const { chartData, displayFact, displayPlan } = useMemo(() => {
    if (interval === 'shift2') {
      const shift2Plan = Math.round(totalPlan / 2);
      const shift2Fact = totalFact - Math.round(totalFact * 0.51);
      const times = ['20:00', '22:00', '00:00', '02:00', '04:00', '06:00', '08:00'];
      const factors = [0.11, 0.26, 0.44, 0.60, 0.76, 0.89, 1.0];
      const pts = times.map((t, i) => {
        const fact = Math.round(shift2Fact * factors[i]);
        const plan = Math.round(shift2Plan * factors[i]);
        return {
          time: t,
          fact,
          plan,
          weldingFact: Math.round(fact * 0.32),
          paintingFact: Math.round(fact * 0.34),
          assemblyFact: Math.round(fact * 0.34),
        };
      });
      return { chartData: pts, displayFact: shift2Fact, displayPlan: shift2Plan };
    }

    if (interval === 'hourly') {
      const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
      const hourlyPlan = Math.round(totalPlan / hours.length);
      const hourlyBase = Math.round(totalFact / hours.length);
      const variance = [-2, 1, 3, -1, 2, 0, -1];
      const pts = hours.map((t, i) => {
        const fact = Math.max(1, hourlyBase + variance[i]);
        return {
          time: t,
          fact,
          plan: hourlyPlan,
          weldingFact: Math.round(fact * 0.32),
          paintingFact: Math.round(fact * 0.34),
          assemblyFact: Math.round(fact * 0.34),
        };
      });
      return { chartData: pts, displayFact: totalFact, displayPlan: totalPlan };
    }

    // Default: shift1 (Day shift: 08:00 - 20:00)
    const shift1Plan = Math.round(totalPlan / 2);
    const shift1Fact = Math.round(totalFact * 0.51);
    const pts = data.map((d) => ({
      ...d,
      plan: Math.round((d.plan / totalPlan) * shift1Plan),
      fact: Math.round((d.fact / totalFact) * shift1Fact),
      weldingFact: Math.round((d.weldingFact / totalFact) * shift1Fact),
      paintingFact: Math.round((d.paintingFact / totalFact) * shift1Fact),
      assemblyFact: Math.round((d.assemblyFact / totalFact) * shift1Fact),
    }));
    return {
      chartData: pts.length > 0 ? pts : data,
      displayFact: shift1Fact,
      displayPlan: shift1Plan,
    };
  }, [interval, data, totalFact, totalPlan]);

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
                Факт: {displayFact} шт.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              <span className="font-medium text-slate-500">
                План: {displayPlan} шт.
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Интервал:</span>
          <Select
            size="sm"
            variant="subtle"
            value={interval}
            onChange={(val) => setInterval(val)}
            options={[
              { value: 'shift1', label: 'Смена 1 (08:00 - 20:00)' },
              { value: 'shift2', label: 'Смена 2 (20:00 - 08:00)' },
              { value: 'hourly', label: 'Почасовой такт' },
            ]}
            aria-label="Интервал графика"
            className="w-52"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
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
