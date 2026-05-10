import type { PONStandard } from './network';

export const PON_CAPACITIES: Record<PONStandard, { down_kbps: number; up_kbps: number }> = {
  'GPON':     { down_kbps: 2_488_320, up_kbps: 1_244_160 },
  'XG-PON':   { down_kbps: 9_953_280, up_kbps: 2_488_320 },
  'XGS-PON':  { down_kbps: 9_953_280, up_kbps: 9_953_280 },
};

export const SPLITTER_LOSS: Record<number, number> = {
  2:  3.7,
  4:  7.2,
  8:  10.7,
  16: 13.8,
  32: 17.2,
  64: 20.8,
};

export interface DBAProfile {
  id: string;
  name: string;
  type: 1 | 2 | 3 | 4 | 5;
  fixedBandwidth_kbps: number;
  assuredBandwidth_kbps: number;
  maxBandwidth_kbps: number;
}

export const DEFAULT_DBA_PROFILES: DBAProfile[] = [
  { id: 'dba-1', name: 'HSI-100M',   type: 4, fixedBandwidth_kbps: 0,      assuredBandwidth_kbps: 0,      maxBandwidth_kbps: 102_400  },
  { id: 'dba-2', name: 'HSI-500M',   type: 4, fixedBandwidth_kbps: 0,      assuredBandwidth_kbps: 0,      maxBandwidth_kbps: 512_000  },
  { id: 'dba-3', name: 'VoIP-2M',    type: 1, fixedBandwidth_kbps: 2_048,  assuredBandwidth_kbps: 2_048,  maxBandwidth_kbps: 2_048    },
  { id: 'dba-4', name: 'IPTV-20M',   type: 2, fixedBandwidth_kbps: 0,      assuredBandwidth_kbps: 20_480, maxBandwidth_kbps: 30_720   },
  { id: 'dba-5', name: 'Enterprise', type: 3, fixedBandwidth_kbps: 50_000, assuredBandwidth_kbps: 50_000, maxBandwidth_kbps: 200_000  },
];

export const ONU_STATE_LABELS: Record<string, string> = {
  O1: 'Initial',
  O2: 'Standby',
  O3: 'Serial-Number',
  O4: 'Ranging',
  O5: 'Operational',
  O6: 'Loss-of-Signal',
};

export const ONU_STATE_COLORS: Record<string, string> = {
  O1: '#4b5563',
  O2: '#6b7280',
  O3: '#f59e0b',
  O4: '#f59e0b',
  O5: '#22c55e',
  O6: '#ef4444',
};
