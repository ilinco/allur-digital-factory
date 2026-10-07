export interface StationStatus {
  id: string;
  name: string;
  status: "normal" | "warning" | "critical";
  fact: number;
  plan: number;
  load_percent: number;
  defect_percent: number;
  downtime_min: number;
}

export interface PipelineResponse {
  record_date: string;
  stations: StationStatus[];
}

export interface ModelProgress {
  model_name: string;
  target_monthly: number;
  produced_fact: number;
  target: number;
  fact: number;
  percent: number;
}

export interface KpiSummaryResponse {
  record_date: string;
  overall_oee: number;
  target_oee: number;
  total_fact: number;
  total_plan: number;
  total_downtime_min: number;
  models_progress: ModelProgress[];
}

export interface DowntimeIncident {
  id: string;
  section: string;
  equipment: string;
  reason: string;
  durationMinutes: number;
  status: "normal" | "warning" | "critical";
}

export interface HourlyPacePoint {
  time: string;
  fact: number;
  plan: number;
  weldingFact: number;
  paintingFact: number;
  assemblyFact: number;
}
