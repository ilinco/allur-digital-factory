import { useMemo, useState } from 'react';
import {
  IconAdjustments,
  IconAlertTriangle,
  IconCheck,
} from '@tabler/icons-react';
import type { BottleneckItem, RiskLevel } from '@/types/forecast';
import { Button } from '../Button';
import { ForecastBottleneckSummaryBar } from './ForecastBottleneckSummaryBar';
import { ForecastBottleneckItemCard } from './ForecastBottleneckItemCard';

interface ForecastBottlenecksTableCardProps {
  bottlenecks: BottleneckItem[];
  aiRecommendations?: string[];
  onOpenSimulation: () => void;
}

const findMatchingAiRecommendation = (
  item: BottleneckItem,
  aiRecommendations: string[],
): string | null => {
  if (!aiRecommendations || aiRecommendations.length === 0) return null;
  const eqLower = item.equipment.toLowerCase();
  const secLower = item.section_id.toLowerCase();

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
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>('all');

  const totalLostUnits = bottlenecks.reduce(
    (sum, b) => sum + b.impact_lost_units,
    0,
  );
  const criticalCount = bottlenecks.filter(
    (b) => b.risk_level === 'critical',
  ).length;
  const warningCount = bottlenecks.filter(
    (b) => b.risk_level === 'warning',
  ).length;

  const filteredBottlenecks = useMemo(() => {
    if (filterLevel === 'all') return bottlenecks;
    return bottlenecks.filter((b) => b.risk_level === filterLevel);
  }, [bottlenecks, filterLevel]);

  return (
    <div className="flex h-full min-h-[360px] flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      {/* Шапка карточки */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <IconAlertTriangle size={20} stroke={1.75} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Факторы риска и узкие места
            </h2>
            <p className="text-xs text-slate-500">
              Оперативный анализ сдерживающих факторов с расчетом потерь выпуска и превентивных мер
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenSimulation}
          leftIcon={<IconAdjustments size={15} />}
          className="rounded-xl px-3.5 py-2 text-xs font-semibold"
        >
          Смоделировать сценарий
        </Button>
      </div>

      {/* Динамическая аналитическая сводка рисков */}
      <div className="pt-4">
        <ForecastBottleneckSummaryBar
          totalLostUnits={totalLostUnits}
          criticalCount={criticalCount}
          warningCount={warningCount}
          totalCount={bottlenecks.length}
        />
      </div>

      {/* Фильтры по уровням риска (если позиций > 1) */}
      {bottlenecks.length > 1 && (
        <div className="mt-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setFilterLevel('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterLevel === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            Все ({bottlenecks.length})
          </button>
          {criticalCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterLevel('critical')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                filterLevel === 'critical'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Критично ({criticalCount})
            </button>
          )}
          {warningCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterLevel('warning')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                filterLevel === 'warning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Внимание ({warningCount})
            </button>
          )}
        </div>
      )}

      {/* Список узких мест */}
      <div className="mt-4 flex-1 space-y-3 max-h-[620px] overflow-y-auto pr-1">
        {filteredBottlenecks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <IconCheck size={20} stroke={2} />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              Узких мест не зафиксировано
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              Все производственные участки и конвейерные узлы функционируют в рамках допустимого такта выпуска.
            </p>
          </div>
        ) : (
          filteredBottlenecks.map((item, idx) => {
            const matchedAiRec = findMatchingAiRecommendation(
              item,
              aiRecommendations,
            );
            const aiRec = matchedAiRec || aiRecommendations[idx];

            return (
              <ForecastBottleneckItemCard
                key={`${item.equipment}-${item.section_id}`}
                item={item}
                aiRecommendation={aiRec}
                onOpenSimulation={onOpenSimulation}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
