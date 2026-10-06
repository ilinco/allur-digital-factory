import type { StationStatus } from '@/types/dashboard';
import { IconDotsVertical } from '@tabler/icons-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DefectDistributionCardProps {
  stations: StationStatus[];
  totalDefects: number;
}

const COLORS = ['#ff2e1f', '#ff6b5f', '#ffb4ad', '#cbd5e1'];

export const DefectDistributionCard = ({
  stations,
  totalDefects,
}: DefectDistributionCardProps) => {
  const chartData = stations.map((st) => {
    const defects = Math.max(
      1,
      Math.round((st.fact * st.defect_percent) / 100),
    );
    return {
      name: st.name,
      value: defects,
      defectPercent: st.defect_percent,
    };
  });

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-900">
          Распределение дефектов
        </h2>
        <button
          type="button"
          className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <IconDotsVertical size={18} stroke={1.75} />
        </button>
      </div>

      {/* Donut Chart with center label */}
      <div className="relative my-3 flex h-48 items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} шт.`, `${name}`]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                borderColor: '#e2e8f0',
                fontSize: '13px',
                fontWeight: 500,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {totalDefects} шт.
          </span>
          <span className="text-xs font-medium text-slate-500">Всего брак</span>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-slate-100 pt-3.5 text-sm font-medium">
        {stations.map((st, idx) => {
          const defects = Math.round((st.fact * st.defect_percent) / 100);
          const share =
            totalDefects > 0
              ? ((defects / totalDefects) * 100).toFixed(0)
              : '0';

          return (
            <div
              key={st.id}
              className="flex items-center justify-between text-slate-700"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: COLORS[idx % COLORS.length],
                  }}
                />
                <span className="font-medium text-slate-800">{st.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  {defects} шт. ({st.defect_percent}%)
                </span>
                <span className="text-xs font-medium text-slate-400">
                  [{share}%]
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
