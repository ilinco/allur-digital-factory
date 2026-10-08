import { useEffect, useState } from 'react';
import {
  IconActivity,
  IconBrain,
  IconCheck,
  IconCpu,
  IconLoader2,
  IconPaint,
  IconRobot,
} from '@tabler/icons-react';

const PIPELINE_STEPS = [
  {
    title: 'Сбор телеметрии SCADA',
    description: 'Агрегация сигналов с датчиков цехов сварки, окраски и сборки',
  },
  {
    title: 'Расчет суточного такта',
    description:
      'Оценка отклонений от норматива 1.80 мин/ед. и балансировки смен',
  },
  {
    title: 'Факторный анализ узких мест',
    description:
      'Локализация критических узлов оборудования (Конвейер-03, роботы ABB)',
  },
  {
    title: 'Инференс нейросети Allur AI',
    description: 'Генерация предиктивных рекомендаций по устранению рисков',
  },
];

const SHOP_MODULES = [
  {
    title: 'Цех сварки',
    icon: <IconRobot size={18} stroke={1.75} className="text-amber-600" />,
    status: 'Анализ сварочных манипуляторов',
    detail: 'Проверка регламентов ТО клещей ABB',
  },
  {
    title: 'Цех окраски',
    icon: <IconPaint size={18} stroke={1.75} className="text-amber-600" />,
    status: 'Мониторинг камер ЛКП',
    detail: 'Стабилизация темпа подачи кузовов',
  },
  {
    title: 'Цех сборки',
    icon: <IconCpu size={18} stroke={1.75} className="text-rose-600" />,
    status: 'Главный конвейер Allur',
    detail: 'Оценка натяжения приводов секции 03',
  },
  {
    title: 'Буферный накопитель',
    icon: <IconActivity size={18} stroke={1.75} className="text-slate-600" />,
    status: 'Балансировка партий CKD',
    detail: 'Сглаживание пика суточной загрузки',
  },
];

export const ForecastAiAnalyzingState = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => Math.min(PIPELINE_STEPS.length - 1, prev + 1));
      setProgressPercent((prev) => Math.min(94, prev + 25));
    }, 6500);

    return () => {
      clearInterval(timer);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Central AI Digital Twin Processing Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800">
              <IconBrain size={26} stroke={1.75} className="text-slate-900" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <IconLoader2 size={13} className="animate-spin" />
                  Выполняется расчет
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                ИИ анализирует телеметрию и рассчитывает прогноз такта
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl">
                Нейросетевая модель сопоставляет фактические параметры
                оборудования с нормативным тактом 1.80 мин/ед., выявляет
                потенциальные сбои и формирует предиктивные рекомендации.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
            <span className="text-xs font-medium text-slate-500">
              Время вычислений:{' '}
              <strong className="text-slate-900">{secondsElapsed} сек</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Расчет инференса занимает ~20-30 сек
            </span>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Прогресс предиктивного моделирования</span>
            <span className="text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            />
          </div>
        </div>

        {/* 4-Step Analysis Pipeline */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;

            return (
              <div
                key={step.title}
                className={`rounded-xl border p-3.5 transition-all ${
                  isCurrent
                    ? 'border-primary/40 bg-primary/5 shadow-2xs'
                    : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-100 bg-slate-50/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Этап 0{idx + 1}
                  </span>
                  {isCompleted ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <IconCheck size={12} stroke={2.5} />
                    </span>
                  ) : isCurrent ? (
                    <IconLoader2
                      size={16}
                      className="animate-spin text-primary"
                    />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                  )}
                </div>

                <div className="mt-2 text-xs font-bold text-slate-900">
                  {step.title}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 leading-tight">
                  {step.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shop Floor Monitoring Modules under Analysis */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Контролируемые технологические зоны завода
            </h3>
            <p className="text-xs text-slate-500">
              Потоковая верификация параметров с датчиков АСУТП цифровым
              двойником
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            4 активных цеха
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SHOP_MODULES.map((shop) => (
            <div
              key={shop.title}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white">
                  {shop.icon}
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {shop.title}
                </span>
              </div>
              <div className="mt-2 text-xs font-medium text-slate-700">
                {shop.status}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                {shop.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
