import { useEffect } from 'react';
import { IconBuildingFactory2, IconCheck, IconCpu, IconInfoCircle, IconTrendingDown, IconX } from '@tabler/icons-react';
import { Button } from './Button';
import { StatusIndicator } from './StatusIndicator';

interface StatusGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusGuideModal = ({ isOpen, onClose }: StatusGuideModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
              <IconInfoCircle size={20} stroke={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                Регламент статусов производства (SLA)
              </h3>
              <p className="text-xs font-medium text-slate-500">
                За что отвечают статусы в цифровом двойнике завода Allur
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            title="Закрыть"
            aria-label="Закрыть"
            className="text-slate-400 hover:text-slate-700"
          >
            <IconX size={18} />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1 text-xs sm:text-sm text-slate-600">
          {/* Section 1: Concept */}
          <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-4 text-xs font-medium leading-relaxed">
            <span className="font-bold text-slate-900">Как это работает:</span> Статусы
            вычисляются автоматически на основе регламента SLA завода по двум ключевым
            показателям смены — <strong className="text-slate-800">времени простоя линии (Downtime)</strong> и{' '}
            <strong className="text-slate-800">уровню дефектов ОТК (Defect Rate)</strong>.
          </div>

          {/* Section 2: SLA Thresholds Table */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide text-slate-500">
              Пороговые критерии статусов
            </h4>
            <div className="mt-2.5 divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
              {/* Normal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white">
                <div className="flex items-center gap-2.5 sm:w-40 shrink-0">
                  <StatusIndicator status="normal" label="Штатно" />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-slate-900">Простой ≤ 30 мин И брак ≤ 2.0%</span>
                  <p className="mt-0.5 text-slate-500">
                    Конвейер идет строго в такте. Все показатели в пределах нормы, план смены выполняется.
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white">
                <div className="flex items-center gap-2.5 sm:w-40 shrink-0">
                  <StatusIndicator status="warning" label="Внимание" />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-slate-900">Простой &gt; 30 мин ИЛИ брак &gt; 2.0%</span>
                  <p className="mt-0.5 text-slate-500">
                    Параметры приближаются к критическому лимиту. Требуется внимание мастера смены и инспекция ОТК.
                  </p>
                </div>
              </div>

              {/* Critical */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white">
                <div className="flex items-center gap-2.5 sm:w-40 shrink-0">
                  <StatusIndicator status="critical" label="Критично" pulse />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-rose-700">Простой &gt; 60 мин ИЛИ брак &gt; 5.0%</span>
                  <p className="mt-0.5 text-slate-500">
                    Аварийный сбой или брак выше допустимого порога. Риск остановки конвейера и падения OEE ниже 85%.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Where statuses appear */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide text-slate-500">
              Где отображаются статусы в интерфейсе
            </h4>
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <IconBuildingFactory2 size={16} className="text-primary" />
                  <span>Участки конвейера</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Интегральный статус цеха (Сварка, Окраска, Сборка). Отражает суммарную готовность передела.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <IconCpu size={16} className="text-primary" />
                  <span>Оборудование</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Техническое состояние конкретного робота или камеры (в строю, на ТО или в аварии).
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <IconTrendingDown size={16} className="text-primary" />
                  <span>AI-Прогноз</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Оценка узких мест и риск невыполнения сменного плана с расчетом потерь готовых авто.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4">
          <Button variant="primary" size="md" onClick={onClose} leftIcon={<IconCheck size={16} />}>
            Понятно
          </Button>
        </div>
      </div>
    </div>
  );
};
