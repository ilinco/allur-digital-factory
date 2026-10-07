import { useState } from 'react';
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
  const [count, setCount] = useState(1);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count <= 0 || count > 1000) {
      setError('Количество должно быть от 1 до 1000');
      return;
    }

    try {
      setError(null);
      await onSubmit(sectionId, {
        event_type: eventType,
        count,
        reason: eventType === 'defect' && reason ? reason.trim() : undefined,
      });
      onClose();
    } catch {
      setError('Ошибка при отправке события в API');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">
              Событие контроля ОТК
            </h3>
          </div>
          <Button
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
            <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <Button
                size="sm"
                variant={eventType === 'defect' ? 'secondary' : 'ghost'}
                onClick={() => setEventType('defect')}
                className={
                  eventType === 'defect'
                    ? 'bg-white text-rose-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }
              >
                Фиксация брака
              </Button>
              <Button
                size="sm"
                variant={eventType === 'pass' ? 'secondary' : 'ghost'}
                onClick={() => setEventType('pass')}
                className={
                  eventType === 'pass'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }
              >
                Прохождение детали
              </Button>
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
              Количество единиц
            </label>
            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400"
            />
          </div>

          {eventType === 'defect' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Причина брака (ОТК)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Например: Непровар шва, сорность ЛКП"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400"
              />
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
                    onClick={() => setReason(preset)}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>
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
