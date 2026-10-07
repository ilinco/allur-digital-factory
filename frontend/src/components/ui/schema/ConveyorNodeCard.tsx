import type { SectionNode } from '@/types/schema';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import {
  AssemblyIllustration,
  FallbackConveyorIllustration,
  PaintingIllustration,
  QualityControlIllustration,
  WarehouseInIllustration,
  WarehouseOutIllustration,
  WeldingIllustration,
} from './StageIllustrations';

interface ConveyorNodeCardProps {
  section: SectionNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

interface StageMetaConfig {
  bgClass: string;
  titleColor: string;
  subtitleColor: string;
  metaColor: string;
  stepBg: string;
  stepText: string;
  title: string;
  subtitle: string;
  metaText: string;
  Illustration: React.ComponentType<{ className?: string }>;
}

const getStageConfig = (section: SectionNode): StageMetaConfig => {
  const id = section.id.toLowerCase();

  if (
    id.includes('warehouse-in') ||
    (id.includes('warehouse') && section.step_order === 1)
  ) {
    return {
      bgClass: 'bg-[#f0f9f8]',
      titleColor: 'text-[#0f766e]',
      subtitleColor: 'text-[#14b8a6]',
      metaColor: 'text-[#0f766e]/70',
      stepBg: 'bg-[#ccfbf1]',
      stepText: 'text-[#0f766e]',
      title: 'Склад деталей',
      subtitle: 'Приёмка и буфер штамповки',
      metaText: 'Этап 01 • Входной буфер',
      Illustration: WarehouseInIllustration,
    };
  }

  if (id.includes('welding')) {
    return {
      bgClass: 'bg-[#faf6f0]',
      titleColor: 'text-[#854d0e]',
      subtitleColor: 'text-[#b45309]',
      metaColor: 'text-[#854d0e]/70',
      stepBg: 'bg-[#fef3c7]',
      stepText: 'text-[#854d0e]',
      title: 'Сварочный цех',
      subtitle: 'Роботизированный остов кузова',
      metaText: 'Этап 02 • Сварка каркаса',
      Illustration: WeldingIllustration,
    };
  }

  if (id.includes('paint')) {
    return {
      bgClass: 'bg-[#f7f8ee]',
      titleColor: 'text-[#3f6212]',
      subtitleColor: 'text-[#65a30d]',
      metaColor: 'text-[#3f6212]/70',
      stepBg: 'bg-[#ecfccb]',
      stepText: 'text-[#3f6212]',
      title: 'Окрасочный цех',
      subtitle: 'Катафорез, грунтовка и лак',
      metaText: 'Этап 03 • Чистая зона 10K',
      Illustration: PaintingIllustration,
    };
  }

  if (id.includes('assembly')) {
    return {
      bgClass: 'bg-[#fdf2f2]',
      titleColor: 'text-[#881337]',
      subtitleColor: 'text-[#be123c]',
      metaColor: 'text-[#881337]/70',
      stepBg: 'bg-[#ffe4e6]',
      stepText: 'text-[#881337]',
      title: 'Главный конвейер',
      subtitle: 'Монтаж двигателя, подвески и салона',
      metaText: 'Этап 04 • Свадьба агрегатов',
      Illustration: AssemblyIllustration,
    };
  }

  if (id.includes('qc') || id.includes('quality')) {
    return {
      bgClass: 'bg-[#f0f6ff]',
      titleColor: 'text-[#1e40af]',
      subtitleColor: 'text-[#2563eb]',
      metaColor: 'text-[#1e40af]/70',
      stepBg: 'bg-[#dbeafe]',
      stepText: 'text-[#1e40af]',
      title: 'Контроль качества',
      subtitle: 'Лазерная геометрия, зазоры и стенды',
      metaText: 'Этап 05 • Финальный аудит',
      Illustration: QualityControlIllustration,
    };
  }

  if (
    id.includes('warehouse-out') ||
    (id.includes('warehouse') && section.step_order > 1)
  ) {
    return {
      bgClass: 'bg-[#fdf4f0]',
      titleColor: 'text-[#9a3412]',
      subtitleColor: 'text-[#ea580c]',
      metaColor: 'text-[#9a3412]/70',
      stepBg: 'bg-[#ffedd5]',
      stepText: 'text-[#9a3412]',
      title: 'Склад готовых авто',
      subtitle: 'Приёмка, оклейка и логистика',
      metaText: `Этап 0${section.step_order} • Выходной терминал`,
      Illustration: WarehouseOutIllustration,
    };
  }

  return {
    bgClass: 'bg-slate-50',
    titleColor: 'text-slate-800',
    subtitleColor: 'text-slate-500',
    metaColor: 'text-slate-400',
    stepBg: 'bg-slate-200',
    stepText: 'text-slate-800',
    title: section.name,
    subtitle: 'Технологический участок конвейера',
    metaText: `Этап 0${section.step_order} • Секция линии`,
    Illustration: FallbackConveyorIllustration,
  };
};

export const ConveyorNodeCard = ({
  section,
  isSelected,
  onSelect,
}: ConveyorNodeCardProps) => {
  const isCritical = section.status === 'critical';
  const isWarning = section.status === 'warning';
  const config = getStageConfig(section);
  const { Illustration } = config;

  const stepFormatted =
    section.step_order < 10
      ? `0${section.step_order}`
      : `${section.step_order}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(section.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect(section.id);
        }
      }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-slate-800 ring-2 ring-slate-800/10 shadow-md'
          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Upper Pastel Tinted Canvas with Title, Subtitle and Large Custom Illustration */}
      <div
        className={`relative flex flex-col justify-between p-5 min-h-[170px] ${config.bgClass}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 pr-2 z-10">
            <h3
              className={`text-base sm:text-lg font-bold tracking-tight truncate ${config.titleColor}`}
            >
              {config.title}
            </h3>
            <p
              className={`mt-0.5 text-xs font-medium leading-relaxed ${config.subtitleColor}`}
            >
              {config.subtitle}
            </p>
          </div>
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Illustration className="w-24 h-20 sm:w-28 sm:h-24 drop-shadow-xs" />
          </div>
        </div>
      </div>

      {/* Bottom Clean White Footer with Avatar Badge and Stage Status / Metrics */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar / Number badge */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold font-mono transition-transform group-hover:scale-105 ${config.stepBg} ${config.stepText}`}
          >
            {stepFormatted}
          </div>

          {/* Core Info */}
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
              {section.name}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
              {section.metrics ? (
                <>
                  <span>
                    Выпуск:{' '}
                    <strong className="text-slate-800">
                      {section.metrics.fact}
                    </strong>
                    /{section.metrics.plan}
                  </span>
                  <span>•</span>
                  <span>
                    Загрузка:{' '}
                    <strong className="text-slate-800">
                      {section.metrics.load_percent}%
                    </strong>
                  </span>
                </>
              ) : (
                <span>Буферный накопитель • {section.downtime_min}м</span>
              )}
            </div>
          </div>
        </div>

        {/* Status Indicator (unified without badge) */}
        <div className="shrink-0 pl-1">
          <StatusIndicator
            status={section.status}
            label={
              isCritical
                ? 'Критично'
                : isWarning
                  ? 'Внимание'
                  : section.status === 'normal'
                    ? 'Штатно'
                    : 'Буфер'
            }
            pulse={isCritical}
          />
        </div>
      </div>
    </div>
  );
};
