import { FaultItem, MetricSummary } from '../types/fault';

const STORAGE_KEY = 'faultsData_v2';

// Helper to generate dynamic relative timestamps so seed data always appears fresh
function getRelativeIso(minutesAgo: number): string {
  const date = new Date(Date.now() - minutesAgo * 60 * 1000);
  return date.toISOString();
}

export const INITIAL_FAULTS: FaultItem[] = [
  {
    id: 'FLT-1094',
    title: 'Main Conveyor Drive Inverter Fault (E-04 Overcurrent)',
    asset: 'Assembly Line 02 / Bay 3',
    severity: 'Critical',
    category: 'Electrical',
    status: 'Open',
    reported_at: getRelativeIso(24), // 24 mins ago
    acknowledged_at: null,
    resolved_at: null,
    responder: 'Unassigned',
    root_cause: '',
    action_taken: '',
    notes: 'Line is halted. High pitch whistle noted before motor trip.'
  },
  {
    id: 'FLT-1093',
    title: 'Core Switch Cisco Catalyst SFP Trunk Unreachable',
    asset: 'Server Room / Rack 04',
    severity: 'High',
    category: 'Network',
    status: 'In Progress',
    reported_at: getRelativeIso(58), // 58 mins ago
    acknowledged_at: getRelativeIso(50),
    resolved_at: null,
    responder: 'Alex Mercer (NetOps)',
    root_cause: '',
    action_taken: 'Swapped optical patch cable; investigating GBIC transceiver link status.',
    notes: 'Secondary failover path active with 15% packet jitter.'
  },
  {
    id: 'FLT-1092',
    title: 'Coolant Chiller Loop B Low Pressure Alarm',
    asset: 'CNC Mill 07 / Precision Shop',
    severity: 'Medium',
    category: 'Mechanical',
    status: 'In Progress',
    reported_at: getRelativeIso(38), // 38 mins ago
    acknowledged_at: getRelativeIso(30),
    resolved_at: null,
    responder: 'Sarah Jenkins (Maint)',
    root_cause: '',
    action_taken: 'Inspecting secondary bypass line and intake filter cartridge.',
    notes: 'Feed rate throttled to 50% until pressure restores above 4.2 bar.'
  },
  {
    id: 'FLT-1091',
    title: 'Hydraulic Pack Solenoid Valve Sticking',
    asset: 'Stamping Press #4 / Heavy Fab',
    severity: 'Critical',
    category: 'Hydraulics',
    status: 'Resolved',
    reported_at: getRelativeIso(210), // ~3.5h ago
    acknowledged_at: getRelativeIso(205),
    resolved_at: getRelativeIso(168), // took 42 mins
    responder: 'Carlos Mendez (Hydraulics)',
    root_cause: 'Particulate contamination caused pilot spool seizure in directional control valve.',
    action_taken: 'Flushed pilot manifold, replaced 24V DC solenoid valve assembly and changed inline 10-micron filter.',
    parts_replaced: 'Parker D1VW001CNYW Solenoid Valve + Donaldson P164375 Filter',
    notes: 'Oil sample pulled for particle count spectroscopy.'
  },
  {
    id: 'FLT-1090',
    title: 'Laser Distance Sensor Optical Occlusion',
    asset: 'Robotic Palletizer #1 / Logistics',
    severity: 'Medium',
    category: 'Software',
    status: 'Resolved',
    reported_at: getRelativeIso(420), // 7h ago
    acknowledged_at: getRelativeIso(415),
    resolved_at: getRelativeIso(392), // took 28 mins
    responder: 'Dave Miller (Automation)',
    root_cause: 'Aerosolized film buildup on front optical lens triggered false obstruction trip.',
    action_taken: 'Cleaned optic lens with lint-free isopropanol wipe and adjusted sensitivity threshold in S7 PLC.',
    parts_replaced: 'None',
    notes: 'Added weekly lens wipe to PM schedule.'
  },
  {
    id: 'FLT-1089',
    title: 'Emergency Stop Aux Contact Intermittent Chatter',
    asset: 'Sub-assembly Station 04',
    severity: 'Low',
    category: 'Safety',
    status: 'Resolved',
    reported_at: getRelativeIso(720), // 12h ago
    acknowledged_at: getRelativeIso(715),
    resolved_at: getRelativeIso(701), // took 19 mins
    responder: 'Sarah Jenkins (Maint)',
    root_cause: 'Vibration caused screw clamp terminal #14 to back out slightly.',
    action_taken: 'Torqued contact block terminals to 1.2 Nm and verified safety relay channel feedback.',
    parts_replaced: 'None',
    notes: 'Checked all adjacent E-stops in sector B.'
  }
];

export function getStoredFaults(): FaultItem[] {
  if (typeof window === 'undefined') return INITIAL_FAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FAULTS));
      return INITIAL_FAULTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty array stored, return it or reset
    return parsed;
  } catch (err) {
    console.error('Failed to parse faults data from localStorage', err);
    return INITIAL_FAULTS;
  }
}

export function saveFaultsToStorage(faults: FaultItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(faults));
  } catch (err) {
    console.error('Failed to save faults to localStorage', err);
  }
}

export function resetToDemoFaults(): FaultItem[] {
  // Re-stamp timestamps relative to right now
  const fresh = INITIAL_FAULTS.map((f, i) => {
    const minutes = [24, 58, 38, 210, 420, 720][i] || (i + 1) * 30;
    const reported = getRelativeIso(minutes);
    let resolved = null;
    if (f.status === 'Resolved') {
      const duration = [0, 0, 0, 42, 28, 19][i] || 30;
      resolved = new Date(new Date(reported).getTime() + duration * 60 * 1000).toISOString();
    }
    return {
      ...f,
      reported_at: reported,
      resolved_at: resolved
    };
  });
  saveFaultsToStorage(fresh);
  return fresh;
}

export function calculateMetrics(faults: FaultItem[], totalOperatingHours = 168): MetricSummary {
  const total = faults.length;
  const open = faults.filter(f => f.status === 'Open').length;
  const inProgress = faults.filter(f => f.status === 'In Progress').length;
  const active = open + inProgress;
  const resolvedList = faults.filter(f => f.status === 'Resolved' && f.resolved_at);
  const resolved = resolvedList.length;
  const criticalActive = faults.filter(f => f.status !== 'Resolved' && f.severity === 'Critical').length;

  let totalResolutionMinutes = 0;
  resolvedList.forEach(f => {
    const start = new Date(f.reported_at).getTime();
    const end = new Date(f.resolved_at!).getTime();
    const diff = Math.max(0, (end - start) / 60000);
    totalResolutionMinutes += diff;
  });

  const mttrMinutes = resolvedList.length > 0 ? totalResolutionMinutes / resolvedList.length : 0;

  // Total downtime includes resolved downtime + active ongoing downtime
  let totalDowntimeMinutes = totalResolutionMinutes;
  const now = Date.now();
  faults.filter(f => f.status !== 'Resolved').forEach(f => {
    const start = new Date(f.reported_at).getTime();
    const diff = Math.max(0, (now - start) / 60000);
    totalDowntimeMinutes += diff;
  });

  // Fleet availability over a baseline period (e.g., 7 days = 168 hours = 10,080 minutes across monitored assets)
  // Assuming 10 critical line assets * 10,080 = 100,800 asset-minutes
  const baselineAssetMinutes = 10 * totalOperatingHours * 60;
  const availabilityPercent = Math.max(0, Math.min(100, ((baselineAssetMinutes - totalDowntimeMinutes) / baselineAssetMinutes) * 100));

  return {
    total,
    active,
    open,
    inProgress,
    resolved,
    criticalActive,
    mttrMinutes: Math.round(mttrMinutes * 10) / 10,
    totalDowntimeMinutes: Math.round(totalDowntimeMinutes),
    availabilityPercent: Math.round(availabilityPercent * 100) / 100
  };
}

export function formatDuration(diffMs: number): string {
  if (diffMs <= 0 || isNaN(diffMs)) return '00:00:00';
  const totalSecs = Math.floor(diffMs / 1000);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatMinutesHuman(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${Math.round(totalMinutes)}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return `${hours}h ${mins}m`;
}

export function exportFaultsToCsv(faults: FaultItem[]): void {
  const headers = [
    'Fault ID',
    'Asset / Location',
    'Title / Issue',
    'Category',
    'Severity',
    'Status',
    'Reported At',
    'Resolved At',
    'Downtime (Minutes)',
    'Assigned Responder',
    'Root Cause',
    'Action Taken',
    'Parts Replaced'
  ];

  const rows = faults.map(f => {
    let downtimeMinutes = 0;
    const start = new Date(f.reported_at).getTime();
    const end = f.resolved_at ? new Date(f.resolved_at).getTime() : Date.now();
    if (!isNaN(start) && !isNaN(end)) {
      downtimeMinutes = Math.round(Math.max(0, (end - start) / 60000));
    }

    return [
      f.id,
      `"${(f.asset || '').replace(/"/g, '""')}"`,
      `"${(f.title || '').replace(/"/g, '""')}"`,
      f.category,
      f.severity,
      f.status,
      f.reported_at,
      f.resolved_at || '',
      downtimeMinutes,
      `"${(f.responder || '').replace(/"/g, '""')}"`,
      `"${(f.root_cause || '').replace(/"/g, '""')}"`,
      `"${(f.action_taken || '').replace(/"/g, '""')}"`,
      `"${(f.parts_replaced || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `fault_management_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
