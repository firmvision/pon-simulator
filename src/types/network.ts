export type PONStandard = 'GPON' | 'XG-PON' | 'XGS-PON';
export type ONUState = 'O1' | 'O2' | 'O3' | 'O4' | 'O5' | 'O6';
export type SplitterRatio = 2 | 4 | 8 | 16 | 32 | 64;
export type OLTVendor = 'Huawei' | 'ZTE' | 'Nokia' | 'Calix' | 'Generic';

export interface XYPosition { x: number; y: number; }

export interface PONPort {
  id: string;
  oltId: string;
  portIndex: number;
  txPower_dBm: number;
  rxSensitivity_dBm: number;
  wavelengthDown_nm: 1490 | 1577;
  wavelengthUp_nm: 1310 | 1270;
  maxONUs: number;
  connectedONUIds: string[];
}

export interface OLT {
  id: string;
  label: string;
  vendor: OLTVendor;
  model: string;
  standard: PONStandard;
  ponPorts: PONPort[];
  managementIP: string;
  position: XYPosition;
}

export interface TCONT {
  id: string;
  onuId: string;
  index: number;
  type: 1 | 2 | 3 | 4 | 5;
  fixedBandwidth_kbps: number;
  assuredBandwidth_kbps: number;
  maxBandwidth_kbps: number;
  dbaProfileId: string | null;
  allocId: number | null;
}

export interface GEMPort {
  id: string;
  onuId: string;
  tcntId: string;
  portId: number;
  direction: 'upstream' | 'downstream' | 'bidirectional';
  serviceType: 'HSI' | 'VOIP' | 'IPTV' | 'OMCI';
}

export interface ServiceVLAN {
  id: string;
  onuId: string;
  svlan: number;
  cvlan: number;
  gemPortId: string;
  serviceType: 'HSI' | 'VOIP' | 'IPTV';
  priority: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export interface ONU {
  id: string;
  label: string;
  serialNumber: string;
  vendor: string;
  model: string;
  standard: PONStandard;
  state: ONUState;
  stateEnteredAt: number;
  oltId: string | null;
  ponPortId: string | null;
  onuIndex: number | null;
  tconts: TCONT[];
  gemPorts: GEMPort[];
  serviceVlans: ServiceVLAN[];
  rxPower_dBm?: number;
  signalMargin_dB?: number;
  position: XYPosition;
}

export interface Splitter {
  id: string;
  label: string;
  ratio: SplitterRatio;
  insertionLoss_dB: number;
  position: XYPosition;
}

export interface ODF {
  id: string;
  label: string;
  portCount: number;
  connectorLoss_dB: number;
  position: XYPosition;
}

export interface FiberSegment {
  id: string;
  sourceId: string;
  sourceHandle: string;
  targetId: string;
  targetHandle: string;
  lengthKm: number;
  attenuationCoeff_dBpkm: number;
  connectorCount: number;
  spliceCount: number;
  connectorLoss_dB: number;
  spliceLoss_dB: number;
  totalLoss_dB?: number;
  trafficActive?: boolean;
}
