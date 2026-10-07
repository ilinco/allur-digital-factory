import { IconClockPause, IconCpu } from '@tabler/icons-react';
import type { EquipmentNode } from '@/types/schema';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

interface EquipmentCardProps {
  equipment: EquipmentNode;
  onRecordDowntimeForEquipment: (
    equipmentName: string,
    equipmentId: number,
  ) => void;
}

const EQUIPMENT_TYPE_NAMES: Record<string, string> = {
  welding_robot: 'Сварочный робот',
  welding_jig: 'Сварочный кондуктор',
  paint_booth: 'Окрасочная камера',
  painting_robot: 'Робот окраски',
  drying_oven: 'Сушильная камера печи',
  cataphoretic_bath: 'Ванна катафореза KTL',
  conveyor: 'Конвейерная линия',
  marriage_station: 'Станция стыковки',
  assembly_manipulator: 'Манипулятор остекления',
  torquing_system: 'Винтовертный комплекс',
  reach_truck: 'Складской ричтрак',
  agv_tugger: 'Автономный тягач AGV',
  pallet_conveyor: 'Конвейер паллет',
  rfid_scanner: 'RFID портал',
  inspection_light_tunnel: 'Световой тоннель аудита',
  cmm_scanner: 'Координатно-измерительная машина',
  brake_test_bench: 'Тормозной стенд',
  water_leak_test_booth: 'Камера дождевания',
  adas_calibration_bench: 'Стенд калибровки ADAS',
  pdi_station: 'Пост финишного контроля PDI',
  vin_scanner: 'Скан-портал VIN-кодов',
};

export const EquipmentCard = ({
  equipment,
  onRecordDowntimeForEquipment,
}: EquipmentCardProps) => {
  const typeLabel =
    EQUIPMENT_TYPE_NAMES[equipment.equipment_type] || equipment.equipment_type;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-colors hover:bg-slate-50/50">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="truncate text-xs font-medium text-slate-500">
            {typeLabel}
          </span>
          <StatusIndicator
            status={equipment.status}
            label={
              equipment.status === 'critical'
                ? 'Критично'
                : equipment.status === 'warning'
                  ? 'Внимание'
                  : equipment.status === 'normal'
                    ? 'В строю'
                    : 'Ожидание'
            }
            size="sm"
            pulse={equipment.status === 'critical'}
          />
        </div>

        <div className="my-2.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
            <IconCpu size={17} stroke={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-bold text-slate-900">
              {equipment.name}
            </h4>
            <p className="text-xs font-medium text-slate-500">
              ID #{equipment.id}
            </p>
          </div>
        </div>

        {equipment.downtimes.length > 0 ? (
          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
            <p className="text-[11px] font-semibold text-slate-400">
              Зафиксированные инциденты:
            </p>
            {equipment.downtimes.map((dt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-[#f6f6f6] px-3 py-2 text-xs font-medium text-slate-700"
              >
                <span className="text-slate-600">{dt.reason}</span>
                <span className="shrink-0 font-bold text-rose-600">
                  {dt.duration_minutes} мин
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 border-t border-slate-100 pt-2.5 text-xs font-medium text-slate-400">
            Остановок не зафиксировано
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="text-xs font-medium text-slate-500">
          Простой: {equipment.downtime_min} мин
        </span>
        <Button
          size="sm"
          variant="primary"
          onClick={() =>
            onRecordDowntimeForEquipment(equipment.name, equipment.id)
          }
          leftIcon={<IconClockPause size={14} />}
        >
          Внести простой
        </Button>
      </div>
    </div>
  );
};
