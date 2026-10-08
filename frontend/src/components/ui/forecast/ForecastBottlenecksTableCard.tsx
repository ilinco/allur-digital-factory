import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconCpu,
  IconDeviceAnalytics,
  IconPaint,
  IconRobot,
  IconSparkles,
} from '@tabler/icons-react';
import { Link } from 'react-router';
import type { BottleneckItem } from '@/types/forecast';
import { Button } from '../Button';
import { StatusIndicator } from '../StatusIndicator';
import { StaticLinks } from '@/config/StaticLinks';
import { ForecastBottleneckFactorSummary } from './ForecastBottleneckFactorSummary';

interface ForecastBottlenecksTableCardProps {
  bottlenecks: BottleneckItem[];
  aiRecommendations?: string[];
  onOpenSimulation: () => void;
}

const getEquipmentStyle = (name: string, level: string) => {
  if (name.includes('Конвейер')) {
    return {
      icon: <IconCpu size={20} stroke={1.75} className="text-rose-500" />,
      bg: 'bg-rose-50/70 border-rose-100/90',
    };
  }
  if (name.includes('ABB') || name.includes('Робот')) {
    return {
      icon: <IconRobot size={20} stroke={1.75} className="text-amber-500" />,
      bg: 'bg-amber-50/70 border-amber-100/90',
    };
  }
  if (name.includes('Камера') || name.includes('ЛКП')) {
    return {
      icon: <IconPaint size={20} stroke={1.75} className="text-amber-600" />,
      bg: 'bg-amber-50/60 border-amber-100',
    };
  }
  return {
    icon: (
      <IconDeviceAnalytics
        size={20}
        stroke={1.75}
        className={level === 'critical' ? 'text-rose-500' : 'text-slate-600'}
      />
    ),
    bg: 'bg-slate-50 border-slate-100',
  };
};

const findMatchingAiRecommendation = (
  item: BottleneckItem,
  aiRecommendations: string[],
): string | null => {
  if (!aiRecommendations || aiRecommendations.length === 0) return null;
  const eqLower = item.equipment.toLowerCase();
  const secLower = item.section_id.toLowerCase();

  // Try finding an AI recommendation that mentions this equipment or section
  const directMatch = aiRecommendations.find((rec) => {
    const rLower = rec.toLowerCase();
    return rLower.includes(eqLower) || (secLower && rLower.includes(secLower));
  });
  if (directMatch) return directMatch;

  return null;
};

export const ForecastBottlenecksTableCard = ({
  bottlenecks,
  aiRecommendations = [],
  onOpenSimulation,
}: ForecastBottlenecksTableCardProps) => {
  const totalLostUnits = bottlenecks.reduce(
    (sum, b) => sum + b.impact_lost_units,
    0,
  );
  const criticalCount = bottlenecks.filter(
    (b) => b.risk_level === 'critical',
  ).length;

  return (
    <div className="flex h-full min-h-[340px] flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <IconAlertTriangle size={20} stroke={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Факторы риска и узкие места
              </h2>
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                <IconSparkles size={12} className="text-primary" />
                AI Root Cause
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Выявление сдерживающих факторов с расчетом потерь выпуска и
              превентивных мер
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenSimulation}
          className="rounded-xl px-5 py-2 text-xs font-semibold shadow-xs"
        >
          Симуляция
        </Button>
      </div>

      {/* Factor Breakdown Summary */}
      <div className="pb-4">
        <ForecastBottleneckFactorSummary
          totalLostUnits={totalLostUnits}
          criticalCount={criticalCount}
        />
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs font-medium">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-3 pr-4 pl-1 text-left">Оборудование и сбой</th>
              <th className="py-3 px-3 text-left">Статус</th>
              <th className="py-3 px-3 text-left">Нагрузка</th>
              <th className="py-3 px-3 text-left">Рекомендация ИИ</th>
              <th className="py-3 px-3 text-right">Потери</th>
              <th className="py-3 pr-2 pl-3 text-right">Действие</th>
            </tr>
          </thead>
          <tbody>
            {bottlenecks.map((item, idx) => {
              const style = getEquipmentStyle(item.equipment, item.risk_level);
              const loadPercent =
                item.risk_level === 'critical'
                  ? 80
                  : item.risk_level === 'warning'
                    ? 45
                    : 20;

              const statusMapped =
                item.risk_level === 'critical'
                  ? 'critical'
                  : item.risk_level === 'warning'
                    ? 'warning'
                    : 'normal';

              const matchedAiRec = findMatchingAiRecommendation(
                item,
                aiRecommendations,
              );
              // Fallback to indexed recommendation from AI list or fallback rule
              const aiRec =
                matchedAiRec ||
                aiRecommendations[idx] ||
                `Диагностика и устранение отклонений ${item.equipment}`;

              return (
                <tr
                  key={item.equipment}
                  className="border-b border-slate-100/80 transition-colors hover:bg-slate-50/40"
                >
                  {/* Оборудование: Иконка + Название + Причина */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${style.bg}`}
                      >
                        {style.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900">
                          {item.equipment}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.reason}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Статус */}
                  <td className="py-3.5 px-3">
                    <StatusIndicator
                      status={statusMapped}
                      label={
                        item.risk_level === 'critical'
                          ? 'Критично'
                          : item.risk_level === 'warning'
                            ? 'Внимание'
                            : 'Штатно'
                      }
                      description={`Узкое место: ${item.equipment} (${item.reason})`}
                      pulse={item.risk_level === 'critical'}
                    />
                  </td>

                  {/* Нагрузка */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          style={{ width: `${loadPercent}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.risk_level === 'critical'
                              ? 'bg-primary'
                              : item.risk_level === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">
                        {loadPercent}%
                      </span>
                    </div>
                  </td>

                  {/* Рекомендация ИИ */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <IconSparkles
                        size={13}
                        className="text-primary shrink-0"
                      />
                      <span className="line-clamp-2 max-w-xs">{aiRec}</span>
                    </div>
                  </td>

                  {/* Потери выпуска */}
                  <td className="py-3.5 px-3 text-right">
                    <span className="text-sm font-bold text-rose-600">
                      -{item.impact_lost_units} шт.
                    </span>
                  </td>

                  {/* Переход к мнемосхеме */}
                  <td className="py-3.5 pr-2 pl-3 text-right">
                    <Link
                      to={StaticLinks.schema}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-primary"
                      title="Открыть схему цеха"
                    >
                      <span>К схеме</span>
                      <IconArrowUpRight size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Summary Footer */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">ИИ-вердикт:</span>
          <span>
            {aiRecommendations[0] ||
              'Превентивное устранение риска узких мест стабилизирует сменный такт и снизит дефицит.'}
          </span>
        </div>
        <span className="font-semibold text-slate-900">
          Суммарный дефицит:{' '}
          <span className="text-rose-600">-{totalLostUnits} шт.</span>
        </span>
      </div>
    </div>
  );
};
