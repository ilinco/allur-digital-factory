import { useEffect, useState } from 'react';
import { IconX } from '@tabler/icons-react';
import type {
  SectionEventRequest,
  SectionEventType,
  SectionNode,
} from '@/types/schema';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface RecordEventModalProps {
  onClose: () => void;
  sections: SectionNode[];
  initialSectionId?: string;
  onSubmit: (
    sectionId: string,
    payload: SectionEventRequest,
  ) => Promise<unknown>;
  isSubmitting: boolean;
}

export const RecordEventModal = ({
  onClose,
  sections,
  initialSectionId,
  onSubmit,
  isSubmitting,
}: RecordEventModalProps) => {
  const [sectionId, setSectionId] = useState(
    initialSectionId || sections[0]?.id || 'welding-1',
  );
  const [eventType, setEventType] = useState<SectionEventType>('defect');
  const [count, setCount] = useState<string>('1');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const parsedCount = Number(count);

    if (
      !count ||
      Number.isNaN(parsedCount) ||
      parsedCount <= 0 ||
      !Number.isInteger(parsedCount)
    ) {
      errors.count = 'Укажите целое положительное число (от 1)';
    } else if (parsedCount > 1000) {
      errors.count = 'Максимально допустимое количество: 1000 единиц';
    }

    if (eventType === 'defect' && !reason.trim()) {
      errors.reason = 'Обязательно укажите причину дефекта для службы ОТК';
    } else if (eventType === 'defect' && reason.trim().length < 3) {
      errors.reason = 'Причина дефекта должна содержать не менее 3 символов';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const parsedCount = Number(count);

    try {
      setError(null);
      await onSubmit(sectionId, {
        event_type: eventType,
        count: parsedCount,
        reason: eventType === 'defect' && reason ? reason.trim() : undefined,
      });
      onClose();
    } catch {
      setError('Ошибка при отправке события в API');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">
              События контроля
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            title="Закрыть"
            aria-label="Закрыть"
          >
            <IconX size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Тип события
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setEventType('defect');
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.reason;
                    return next;
                  });
                }}
                className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  eventType === 'defect'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Фиксация брака
              </button>
              <button
                type="button"
                onClick={() => {
                  setEventType('pass');
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.reason;
                    return next;
                  });
                }}
                className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  eventType === 'pass'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Прохождение детали
              </button>
            </div>
          </div>

          <Select
            label="Участок"
            fullWidth
            value={sectionId}
            onChange={(val) => setSectionId(val)}
            options={sections.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.id})`,
            }))}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Количество единиц <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => {
                setCount(e.target.value);
                if (fieldErrors.count) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.count;
                    return next;
                  });
                }
              }}
              className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-colors ${
                fieldErrors.count
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                  : 'border-slate-200 focus:border-slate-400'
              }`}
            />
            {fieldErrors.count && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {fieldErrors.count}
              </p>
            )}
          </div>

          {eventType === 'defect' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Причина брака (ОТК) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (fieldErrors.reason) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.reason;
                      return next;
                    });
                  }
                }}
                placeholder="Например: Непровар шва, сорность ЛКП"
                className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-colors ${
                  fieldErrors.reason
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                    : 'border-slate-200 focus:border-slate-400'
                }`}
              />
              {fieldErrors.reason && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {fieldErrors.reason}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[
                  'Непровар шва',
                  'Сорность ЛКП',
                  'Геометрия кузова',
                  'Задир панели',
                  'Момент затяжки',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setReason(preset);
                      if (fieldErrors.reason) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.reason;
                          return next;
                        });
                      }
                    }}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Зафиксировать
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
