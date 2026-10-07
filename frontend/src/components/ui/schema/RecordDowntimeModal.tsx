import { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import type { DowntimeCreateRequest, SectionNode } from '@/types/schema';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

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
  onClose,
  sections,
  initialSectionId,
  initialEquipmentName,
  initialEquipmentId,
  onSubmit,
  isSubmitting,
}: RecordDowntimeModalProps) => {
  const [sectionId, setSectionId] = useState(
    initialSectionId || sections[0]?.id || 'welding-1',
  );
  const [equipment, setEquipment] = useState(initialEquipmentName || '');
  const [equipmentId, setEquipmentId] = useState<number | undefined>(
    initialEquipmentId,
  );
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState<string | null>(null);

  const currentSection = sections.find((s) => s.id === sectionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Укажите причину остановки оборудования');
      return;
    }
    if (!equipment.trim()) {
      setError('Укажите наименование оборудования');
      return;
    }
    if (duration <= 0 || duration > 960) {
      setError('Длительность должна быть от 1 до 960 минут');
      return;
    }

    try {
      setError(null);
      await onSubmit({
        section_id: sectionId,
        equipment: equipment.trim(),
        equipment_id: equipmentId,
        reason: reason.trim(),
        duration_minutes: duration,
      });
      onClose();
    } catch {
      setError('Ошибка при сохранении данных в API');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">
              Фиксация простоя
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
                  const found = currentSection.equipment.find(
                    (eq) => eq.id === idNum,
                  );
                  setEquipment(found ? found.name : '');
                }}
                options={[
                  { value: '', label: '-- Выберите оборудование из реестра --' },
                  ...currentSection.equipment.map((eq) => ({
                    value: String(eq.id),
                    label: `[ID #${eq.id}] ${eq.name} (${eq.equipment_type})`,
                  })),
                ]}
              />
            ) : (
              <>
                <label className="block text-xs font-semibold text-slate-700">
                  Оборудование
                </label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="Например, Конвейерная линия-01"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400"
                />
              </>
            )}
            {equipmentId && (
              <p className="mt-1 text-xs font-medium text-slate-500">
                Привязка к внешнему ключу: equipment_id #{equipmentId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Причина остановки
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Например: Замена фильтров, сбой позиционирования"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Длительность (минуты)
            </label>
            <input
              type="number"
              min={1}
              max={960}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-slate-400"
            />
          </div>

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
              Зарегистрировать
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
