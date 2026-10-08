export type LayoutStatus = 'normal' | 'warning' | 'critical' | 'no_data';
export type StationSlaStatus = 'normal' | 'warning' | 'critical';
export type SectionType = 'process' | 'warehouse';

export interface DowntimeEvent {
  reason: string;
  duration_minutes: number;
}

export interface EquipmentNode {
  id: number;
  name: string;
  equipment_type: string;
  status: LayoutStatus;
  downtime_min: number;
  downtimes: DowntimeEvent[];
}

export interface SectionMetrics {
  fact: number;
  plan: number;
  load_percent: number;
  defect_percent: number;
}

export interface SectionNode {
  id: string;
  name: string;
  step_order: number;
  section_type: SectionType;
  status: LayoutStatus;
  downtime_min: number;
  metrics: SectionMetrics | null;
  equipment: EquipmentNode[];
}

export interface FactoryLayoutResponse {
  record_date: string;
  sections: SectionNode[];
}

export type SimulationActionType =
  | 'breakdown'
  | 'defect_spike'
  | 'critical_stop'
  | 'reset';

export interface SimulationActionRequest {
  action?: SimulationActionType;
  section_id?: string | null;
  reason?: string | null;
  duration_minutes?: number | null;
  record_date?: string | null;
}

export interface AiAssistantAlert {
  title: string;
  warning: string;
  severity: 'info' | 'warning' | 'critical';
  suggested_actions: string[];
}

export interface AffectedSectionInfo {
  id: string;
  name: string;
  status: StationSlaStatus;
  downtime_min: number;
  defect_percent: number;
}

export interface SimulationActionResponse {
  action: string;
  status: string;
  message: string;
  affected_section: AffectedSectionInfo;
  overall_oee: number;
  availability: number;
  is_oee_alert: boolean;
  ai_assistant: AiAssistantAlert;
}

export interface DowntimeCreateRequest {
  section_id: string;
  equipment: string;
  reason: string;
  duration_minutes: number;
  equipment_id?: number | null;
  record_date?: string | null;
}

export interface DowntimeCreateResponse {
  downtime: {
    id: number;
    record_date: string;
    section_id: string;
    section_name: string;
    equipment: string;
    equipment_id: number | null;
    reason: string;
    duration_minutes: number;
  };
  section_id: string;
  section_name: string;
  section_downtime_min: number;
  section_status: StationSlaStatus;
  oee_impact: {
    previous_availability: number;
    new_availability: number;
    previous_oee: number;
    new_oee: number;
    is_alert: boolean;
  };
}

export type SectionEventType = 'pass' | 'defect';

export interface SectionEventRequest {
  event_type: SectionEventType;
  count?: number;
  reason?: string | null;
  record_date?: string | null;
}

export interface SectionEventResponse {
  section_id: string;
  section_name: string;
  record_date: string;
  event_type: SectionEventType;
  count: number;
  fact: number;
  plan: number;
  defects_count: number;
  defect_percent: number;
  load_percent: number;
  status: StationSlaStatus;
  is_alert: boolean;
  alert_message: string | null;
}
