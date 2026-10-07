export type RiskLevel = 'critical' | 'warning' | 'low';
export type PlanRiskStatus = 'underperformed' | 'on_track' | 'exceeded';

export interface BottleneckItem {
  section_id: string;
  equipment: string;
  risk_level: RiskLevel;
  reason: string;
  impact_lost_units: number;
}

export interface PlanCompletionForecast {
  model: string;
  month_target: number;
  projected_fact: number;
  risk_status: PlanRiskStatus;
}

export interface PredictiveForecastRequest {
  target_date?: string;
  simulate_extra_downtime_min?: number;
  target_model?: string;
}

export interface PredictiveForecastResponse {
  forecast_date: string;
  predicted_shift_oee: number;
  oee_target_met: boolean;
  bottlenecks: BottleneckItem[];
  plan_completion_forecast: PlanCompletionForecast;
  ai_recommendations: string[];
}

export interface MonthlyForecastOverviewPoint {
  month: string;
  total: number;
  onix: number;
  cobalt: number;
  jac: number;
  jetour: number;
  other: number;
}

export interface DayForecastPoint {
  day: string;
  dayShort: string;
  units: number;
  isActive?: boolean;
}

export interface ModelShareItem {
  name: string;
  units: number;
  percent: number;
  color: string;
}
