export type FaultSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type FaultStatus = 'Open' | 'In Progress' | 'Resolved';

export type FaultCategory =
  | 'Mechanical'
  | 'Electrical'
  | 'Network'
  | 'Software'
  | 'Hydraulics'
  | 'HVAC & Power'
  | 'Safety';

export interface FaultItem {
  id: string;
  title: string;
  asset: string;
  severity: FaultSeverity;
  category: FaultCategory;
  status: FaultStatus;
  reported_at: string; // ISO string
  acknowledged_at?: string | null;
  resolved_at: string | null;
  responder: string;
  root_cause: string;
  action_taken: string;
  parts_replaced?: string;
  notes?: string;
}

export interface MetricSummary {
  total: number;
  active: number;
  open: number;
  inProgress: number;
  resolved: number;
  criticalActive: number;
  mttrMinutes: number;
  totalDowntimeMinutes: number;
  availabilityPercent: number;
}
