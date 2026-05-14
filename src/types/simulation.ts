export type SimEventType =
  | 'ONU_DISCOVERED'
  | 'ONU_RANGING_START'
  | 'ONU_RANGING_COMPLETE'
  | 'ONU_REGISTERED'
  | 'ONU_DEREGISTERED'
  | 'ONU_STATE_CHANGE'
  | 'LINK_UP'
  | 'LINK_DOWN'
  | 'ALARM_RAISED'
  | 'ALARM_CLEARED'
  | 'DBA_CYCLE'
  | 'TRAFFIC_BURST';

export type AlarmSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING' | 'INFO';

export interface SimEvent {
  id: string;
  timestamp: number;
  wallTime: string;
  type: SimEventType;
  sourceId: string;
  sourceName: string;
  message: string;
  severity: AlarmSeverity;
}

export interface AlarmRecord {
  id: string;
  raisedAt: number;
  clearedAt: number | null;
  severity: AlarmSeverity;
  code: string;
  description: string;
  sourceId: string;
  sourceName: string;
}

export interface TrafficFlow {
  onuId: string;
  currentUpRate_kbps: number;
  currentDownRate_kbps: number;
  allocatedUpRate_kbps: number;
  peakUpRate_kbps: number;
  utilization: number;
}

export type CaptureProtocol = 'PLOAM' | 'OMCI' | 'GEM' | 'Ethernet' | 'IPv4' | 'ARP' | 'DBA' | 'ICMP' | 'UDP' | 'TCP';

export interface FrameField {
  name: string;
  value: string;
  bytes: string;
}

export interface CaptureFrame {
  no: number;
  simTime_ms: number;
  source: string;
  destination: string;
  protocol: CaptureProtocol;
  length: number;
  info: string;
  direction: 'upstream' | 'downstream' | 'both';
  detail: FrameField[];
}

export interface SimulationState {
  running: boolean;
  simTimestamp: number;
  speedMultiplier: number;
  events: SimEvent[];
  alarms: AlarmRecord[];
  trafficFlows: Record<string, TrafficFlow>;
  captureFrames: CaptureFrame[];
  captureRunning: boolean;
}
