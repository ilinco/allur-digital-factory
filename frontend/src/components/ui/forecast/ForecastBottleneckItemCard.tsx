import { useState } from 'react';
import {
  IconArrowUpRight,
  IconCheck,
  IconClock,
  IconCopy,
  IconCpu,
  IconDeviceAnalytics,
  IconPaint,
  IconRobot,
  IconSparkles,
} from '@tabler/icons-react';
import { Link } from 'react-router';
import type { BottleneckItem } from '@/types/forecast';
import { StatusIndicator } from '../StatusIndicator';
import { StaticLinks } from '@/config/StaticLinks';
import { toast } from '@/context/notificationStore';

interface ForecastBottleneckItemCardProps {
  item: BottleneckItem;
  aiRecommendation?: string;
  onOpenSimulation: () => void;
}

const getSectionName = (sectionId: string): string => {
  switch (sectionId) {
    case 'assembly-1':
      return 'Цех финишной сборки';
    case 'welding-1':
      return 'Сварочный цех';
    case 'paint-1':
      return 'Окрасочный комплекс';
    case 'quality-1':
      return 'Контроль качества (ОТК)';
    default:
      return sectionId ? `Линия ${sectionId}` : 'Производственный пост';
  }
};

const getEquipmentIcon = (name: string) => {
  if (name.includes('Конвейер')) {
    return <IconCpu size={17} stroke={1.75} />;
  }
  if (name.includes('ABB') || name.includes('Робот')) {
    return <IconRobot size={17} stroke={1.75} />;
  }
  if (name.includes('Камера') || name.includes('ЛКП')) {
    return <IconPaint size={17} stroke={1.75} />;
  }
  return <IconDeviceAnalytics size={17} stroke={1.75} />;
};

const extractDowntimeMinutes = (reason: string): number | null => {
  const match = reason.match(/(\d+)\s*мин/i);
  return match ? parseInt(match[1], 10) : null;
};

export const ForecastBottleneckItemCard = ({
  item,
  aiRecommendation,
  onOpenSimulation,
}: ForecastBottleneckItemCardProps) => {
  const [copied, setCopied] = useState(false);

  const durationMin = extractDowntimeMinutes(item.reason);
  const maxSlaLimitMin = 60;
  const slaPercentage = durationMin
    ? Math.min(100, Math.round((durationMin / maxSlaLimitMin) * 100))
    : item.risk_level === 'critical'
      ? 83
      : 50;

  const fallbackRec = `Провести диагностику оборудования ${item.equipment} в межсменный интервал для исключения внеплановых остановок.`;
  const finalRecommendation = aiRecommendation || fallbackRec;

  const handleCopyRecommendation = () => {
    navigator.clipboard.writeText(finalRecommendation).then(() => {
      setCopied(true);
      toast.success('Предписание скопировано в буфер обмена', {
        title: item.equipment,
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:border-slate-300">
      {/* Верхняя строка: Оборудование + Статус + Потери */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            {getEquipmentIcon(item.equipment)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {item.equipment}
              </h3>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {getSectionName(item.section_id)}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              <StatusIndicator
                status={item.risk_level === 'critical' ? 'critical' : 'warning'}
                label={item.risk_level === 'critical' ? 'Критично' : 'Внимание'}
                pulse={item.risk_level === 'critical'}
              />
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{item.reason}</span>
            </div>
          </div>
        </div>

        {/* Индикатор потерь */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <span className="text-[10px] font-medium text-slate-400 sm:text-right">
            Потери выпуска
          </span>
          <span className="text-sm sm:text-base font-bold text-rose-600">
            -{item.impact_lost_units} шт.
          </span>
        </div>
      </div>

      {/* Шкала лимита SLA простоя */}
      {durationMin && (
        <div className="mt-2.5 rounded-lg bg-slate-50/80 px-2.5 py-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <IconClock size={12} className="text-slate-500" />
              Лимит простоя SLA: {durationMin} из {maxSlaLimitMin} мин
            </span>
            <span
              className={`font-semibold ${
                slaPercentage >= 80 ? 'text-rose-600' : 'text-amber-600'
              }`}
            >
              {slaPercentage}% критического порога
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              style={{ width: `${slaPercentage}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                slaPercentage >= 80 ? 'bg-rose-500' : 'bg-amber-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* Блок рекомендации ИИ */}
      <div className="mt-2.5 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 sm:p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <IconSparkles size={13} className="text-primary" />
            <span>Рекомендованное инженерное решение:</span>
          </div>
          <button
            type="button"
            onClick={handleCopyRecommendation}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-slate-900"
            title="Скопировать предписание"
          >
            {copied ? (
              <>
                <IconCheck size={12} className="text-emerald-600" />
                <span className="text-emerald-700">Скопировано</span>
              </>
            ) : (
              <>
                <IconCopy size={12} />
                <span>Копировать</span>
              </>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs font-medium text-slate-700 leading-relaxed">
          {finalRecommendation}
        </p>
      </div>

      {/* Быстрые действия */}
      <div className="mt-2.5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-2">
        <button
          type="button"
          onClick={onOpenSimulation}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <span>Моделировать сценарий</span>
        </button>
        <Link
          to={`${StaticLinks.schema}?section=${item.section_id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-primary"
        >
          <span>К посту на схеме</span>
          <IconArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  );
};
