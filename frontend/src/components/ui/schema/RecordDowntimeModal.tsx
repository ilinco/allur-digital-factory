import { useEffect, useState } from 'react';
import { IconX } from '@tabler/icons-react';
import type { DowntimeCreateRequest, SectionNode } from '@/types/schema';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { parseApiError } from '@/api/errorParser';

interface RecordDowntimeModalProps {
  onClose: () => void;
  sections: SectionNode[];
  initialSectionId?: string;
  initialEquipmentName?: string;
  initialEquipmentId?: number;
  onSubmit: (payload: DowntimeCreateRequest) => Promise<unknown>;
  isSubmitting: boolean;
}

export const RecordDowntimeModal = ({
  onClose, sections, initialSectionId, initialEquipmentName, initialEquipmentId, onSubmit, isSubmitting,
}: RecordDowntimeModalProps) => {
  const [sectionId, setSectionId] = useState(initialSectionId || sections[0]?.id || 'welding-1');
  const [equipment, setEquipment] = useState(initialEquipmentName || '');
  const [equipmentId, setEquipmentId] = useState<number | undefined>(initialEquipmentId);
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<string>('30');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const currentSection = sections.find((s) => s.id === sectionId);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const parsedDuration = Number(duration);

    if (!equipment.trim()) errors.equipment = 'Укажите или выберите оборудование';
    if (!reason.trim()) errors.reason = 'Укажите причину остановки оборудования';
    else if (reason.trim().length < 3) errors.reason = 'Причина должна содержать от 3 символов';

    if (!duration || Number.isNaN(parsedDuration) || parsedDuration <= 0 || !Number.isInteger(parsedDuration)) {
      errors.duration = 'Длительность должна быть целым числом от 1 мин';
    } else if (parsedDuration > 960) {
      errors.duration = 'Максимальная длительность — 960 минут';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const parsedDuration = Number(duration);

    try {
      setError(null);
      await onSubmit({
        section_id: sectionId,
        equipment: equipment.trim(),
        equipment_id: equipmentId,
        reason: reason.trim(),
        duration_minutes: parsedDuration,
      });
      onClose();
    } catch (err) {
      setError(parseApiError(err).message);
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
          <h3 className="text-base font-bold text-slate-900">Фиксация простоя</h3>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose} title="Закрыть" aria-label="Закрыть">
            <IconX size={18} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <Select
            label="Участок производства"
            fullWidth
            value={sectionId}
            onChange={(val) => {
              setSectionId(val);
              setEquipment('');
              setEquipmentId(undefined);
            }}
            options={sections.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.id})`,
            }))}
          />

          <div>
            {currentSection && currentSection.equipment.length > 0 ? (
              <div>
                <Select
                  label="Оборудование"
                  fullWidth
                  placeholder="-- Выберите оборудование из реестра --"
                  value={equipmentId !== undefined ? String(equipmentId) : ''}
                  onChange={(val) => {
                    if (!val) {
                      setEquipment('');
                      setEquipmentId(undefined);
                      return;
                    }
                    const idNum = Number(val);
                    setEquipmentId(idNum);
                    const found = currentSection.equipment.find((eq) => eq.id === idNum);
                    setEquipment(found ? found.name : '');
                    if (fieldErrors.equipment) {
                      setFieldErrors((prev) => ({ ...prev, equipment: '' }));
                    }
                  }}
                  options={[
                    { value: '', label: '-- Выберите оборудование из реестра --' },
                    ...currentSection.equipment.map((eq) => ({
                      value: String(eq.id),
                      label: `[ID #${eq.id}] ${eq.name} (${eq.equipment_type})`,
                    })),
                  ]}
                />
                {fieldErrors.equipment && (
                  <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.equipment}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Оборудование <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => {
                    setEquipment(e.target.value);
                    if (fieldErrors.equipment) setFieldErrors((p) => ({ ...p, equipment: '' }));
                  }}
                  placeholder="Например, Конвейерная линия-01"
                  className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-colors ${
                    fieldErrors.equipment ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500' : 'border-slate-200 focus:border-slate-400'
                  }`}
                />
                {fieldErrors.equipment && (
                  <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.equipment}</p>
                )}
              </div>
            )}
            {equipmentId && (
              <p className="mt-1 text-xs font-medium text-slate-500">
                Привязка к внешнему ключу: equipment_id #{equipmentId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Причина остановки <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (fieldErrors.reason) setFieldErrors((p) => ({ ...p, reason: '' }));
              }}
              placeholder="Например: Замена фильтров, сбой позиционирования"
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
              {['Плановое ТО', 'Ошибка датчика', 'Перегрев привода', 'Сбой калибровки', 'Замена расходников'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setReason(preset);
                    if (fieldErrors.reason) setFieldErrors((p) => ({ ...p, reason: '' }));
                  }}
                  className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Длительность (минуты) <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-1">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setDuration(String(m));
                      if (fieldErrors.duration) setFieldErrors((p) => { const n = { ...p }; delete n.duration; return n; });
                    }}
                    className={`cursor-pointer rounded-md border px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                      duration === String(m)
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {m}м
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min={1}
              max={960}
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                if (fieldErrors.duration) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.duration;
                    return next;
                  });
                }
              }}
              className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-colors ${
                fieldErrors.duration
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                  : 'border-slate-200 focus:border-slate-400'
              }`}
            />
            {fieldErrors.duration && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {fieldErrors.duration}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Отмена</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting} isLoading={isSubmitting}>
              Зарегистрировать
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
