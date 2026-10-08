import {
  IconGauge,
  IconPackage,
  IconClockPause,
} from '@tabler/icons-react';
import { ForecastKpiCard } from './ForecastKpiCard';
import type { PredictiveForecastResponse } from '@/types/forecast';

interface ForecastKpiCardsRowProps {
  forecast: PredictiveForecastResponse;
  totalLostUnits: number;
}

export const ForecastKpiCardsRow = ({
  forecast,
  totalLostUnits,
}: ForecastKpiCardsRowProps) => {
  const oee = forecast.predicted_shift_oee;
  const targetOee = 85.0;
  const oeeDiff = Number((oee - targetOee).toFixed(2));
  const planForecast = forecast.plan_completion_forecast;
  const projectedFact = planForecast.projected_fact;
  const monthTarget = planForecast.month_target;
  const planFulfillment =
    monthTarget > 0 ? ((projectedFact / monthTarget) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
      <ForecastKpiCard
        icon={<IconGauge size={22} stroke={1.75} />}
        title="ИИ-прогноз OEE"
        value={`${oee}%`}
        delta={oeeDiff >= 0 ? `+${oeeDiff}%` : `${oeeDiff}%`}
        deltaType={oeeDiff >= 0 ? 'positive' : 'negative'}
        tooltipText="Предиктивный расчет OEE оборудования на основе телеметрии смен и плановых остановок"
        subtext={`Цель завода: ${targetOee}% OEE (доверие 95%)`}
      />

      <ForecastKpiCard
        icon={<IconPackage size={22} stroke={1.75} />}
        title="ИИ-прогноз выпуска"
        value={`${projectedFact.toLocaleString('ru-RU')} шт.`}
        delta={`${planFulfillment}% плана`}
        deltaType={Number(planFulfillment) >= 95 ? 'positive' : 'negative'}
        tooltipText="Нейросетевая экстраполяция фактического темпа сборки до конца отчетного периода"
        subtext={`План: ${monthTarget.toLocaleString('ru-RU')} шт. (${planForecast.model})`}
      />

      <ForecastKpiCard
        icon={<IconClockPause size={22} stroke={1.75} />}
        title="Оценка риска потерь"
        value={`${totalLostUnits} шт.`}
        delta={totalLostUnits > 20 ? 'Критичный риск' : 'Контролируемый риск'}
        deltaType={totalLostUnits > 20 ? 'negative' : 'positive'}
        tooltipText="Прогноз потерь готовой продукции из-за выявленных узких мест оборудования"
        subtext={`${forecast.bottlenecks.length} узких места (компенсация +${totalLostUnits} шт.)`}
      />
    </div>
  );
};
