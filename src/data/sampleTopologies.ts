import type { ProjectFile } from '../types/topology';
import { DEFAULT_DBA_PROFILES } from '../types/protocol';

const gponSimple: ProjectFile = {
  version: '1.0',
  metadata: { name: 'Simple GPON', description: '1 OLT, 1:8 splitter, 8 ONUs — starter topology', author: 'Demo', createdAt: '', modifiedAt: '' },
  endDevices: [],
  ethernetLinks: [],
  dbaProfiles: DEFAULT_DBA_PROFILES,
  olts: [{
    id: 'olt-demo', label: 'OLT-1', vendor: 'Huawei', model: 'MA5800-X17',
    standard: 'GPON', managementIP: '10.0.0.1',
    position: { x: 300, y: 50 },
    ponPorts: [{
      id: 'port-demo-0', oltId: 'olt-demo', portIndex: 0,
      txPower_dBm: 3, rxSensitivity_dBm: -28,
      wavelengthDown_nm: 1490, wavelengthUp_nm: 1310,
      maxONUs: 64, connectedONUIds: [],
    }],
  }],
  splitters: [{
    id: 'spl-demo', label: 'SPL-1 (1:8)', ratio: 8,
    insertionLoss_dB: 10.7, position: { x: 280, y: 200 },
  }],
  odfs: [],
  onus: Array.from({ length: 8 }, (_, i) => ({
    id: `onu-demo-${i}`,
    label: `ONU-${i + 1}`,
    serialNumber: `HWTC${(0x12345678 + i).toString(16).toUpperCase().padStart(8, '0')}`,
    vendor: 'Huawei', model: 'HG8546M',
    standard: 'GPON' as const,
    state: 'O1' as const,
    stateEnteredAt: 0,
    oltId: 'olt-demo', ponPortId: 'port-demo-0', onuIndex: null,
    tconts: [{ id: `tc-${i}`, onuId: `onu-demo-${i}`, index: 0, type: 4 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 0, maxBandwidth_kbps: 102400, dbaProfileId: 'dba-1', allocId: null }],
    gemPorts: [{ id: `gem-${i}`, onuId: `onu-demo-${i}`, tcntId: `tc-${i}`, portId: i * 10, direction: 'bidirectional' as const, serviceType: 'HSI' as const }],
    serviceVlans: [{ id: `vlan-${i}`, onuId: `onu-demo-${i}`, svlan: 100, cvlan: i + 1, gemPortId: `gem-${i}`, serviceType: 'HSI' as const, priority: 0 as const }],
    position: { x: 50 + i * 90, y: 360 },
  })),
  fibers: [
    { id: 'f-olt-spl', sourceId: 'olt-demo', sourceHandle: 'port-demo-0', targetId: 'spl-demo', targetHandle: 'in', lengthKm: 3, attenuationCoeff_dBpkm: 0.22, connectorCount: 2, spliceCount: 1, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1 },
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `f-spl-onu-${i}`, sourceId: 'spl-demo', sourceHandle: `out-${i}`, targetId: `onu-demo-${i}`, targetHandle: 'pon-in',
      lengthKm: 0.3, attenuationCoeff_dBpkm: 0.35, connectorCount: 1, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
    })),
  ],
  viewport: { x: 0, y: 0, zoom: 0.9 },
};

const xgsPonEnterprise: ProjectFile = {
  version: '1.0',
  metadata: { name: 'XGS-PON Enterprise', description: '1 OLT, 1:16 splitter, 16 business ONUs with Type 1+4 T-CONTs', author: 'Demo', createdAt: '', modifiedAt: '' },
  endDevices: [],
  ethernetLinks: [],
  dbaProfiles: DEFAULT_DBA_PROFILES,
  olts: [{
    id: 'olt-xgs', label: 'OLT-1', vendor: 'Nokia', model: 'ISAM FX-4',
    standard: 'XGS-PON', managementIP: '10.1.0.1',
    position: { x: 350, y: 50 },
    ponPorts: [{
      id: 'port-xgs-0', oltId: 'olt-xgs', portIndex: 0,
      txPower_dBm: 4, rxSensitivity_dBm: -29,
      wavelengthDown_nm: 1577, wavelengthUp_nm: 1270,
      maxONUs: 128, connectedONUIds: [],
    }],
  }],
  splitters: [{
    id: 'spl-xgs', label: 'SPL-1 (1:16)', ratio: 16,
    insertionLoss_dB: 13.8, position: { x: 300, y: 210 },
  }],
  odfs: [],
  onus: Array.from({ length: 16 }, (_, i) => ({
    id: `onu-xgs-${i}`,
    label: `SBU-${i + 1}`,
    serialNumber: `NOKI${(0xABCD0000 + i).toString(16).toUpperCase().padStart(8, '0')}`,
    vendor: 'Nokia', model: 'G-240G-A',
    standard: 'XGS-PON' as const,
    state: 'O1' as const,
    stateEnteredAt: 0,
    oltId: 'olt-xgs', ponPortId: 'port-xgs-0', onuIndex: null,
    tconts: [
      { id: `tc-xgs-${i}-0`, onuId: `onu-xgs-${i}`, index: 0, type: 1 as const, fixedBandwidth_kbps: 50000, assuredBandwidth_kbps: 50000, maxBandwidth_kbps: 50000, dbaProfileId: 'dba-5', allocId: null },
      { id: `tc-xgs-${i}-1`, onuId: `onu-xgs-${i}`, index: 1, type: 4 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 0, maxBandwidth_kbps: 500000, dbaProfileId: 'dba-2', allocId: null },
    ],
    gemPorts: [{ id: `gem-xgs-${i}`, onuId: `onu-xgs-${i}`, tcntId: `tc-xgs-${i}-0`, portId: i * 100, direction: 'bidirectional' as const, serviceType: 'HSI' as const }],
    serviceVlans: [{ id: `vlan-xgs-${i}`, onuId: `onu-xgs-${i}`, svlan: 200, cvlan: i + 1, gemPortId: `gem-xgs-${i}`, serviceType: 'HSI' as const, priority: 5 as const }],
    position: { x: 30 + (i % 8) * 120, y: 380 + Math.floor(i / 8) * 130 },
  })),
  fibers: [
    { id: 'f-xgs-spl', sourceId: 'olt-xgs', sourceHandle: 'port-xgs-0', targetId: 'spl-xgs', targetHandle: 'in', lengthKm: 5, attenuationCoeff_dBpkm: 0.22, connectorCount: 2, spliceCount: 2, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1 },
    ...Array.from({ length: 16 }, (_, i) => ({
      id: `f-xgs-onu-${i}`, sourceId: 'spl-xgs', sourceHandle: `out-${i}`, targetId: `onu-xgs-${i}`, targetHandle: 'pon-in',
      lengthKm: 0.5, attenuationCoeff_dBpkm: 0.35, connectorCount: 1, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
    })),
  ],
  viewport: { x: 0, y: 0, zoom: 0.75 },
};

// Cascaded 2-stage splitter: OLT → 1:4 feeder splitter → 2× 1:4 distribution splitters → 8 ONUs
// Demonstrates realistic greenfield FTTH cascaded ODN architecture
const cascadedSplitter: ProjectFile = {
  version: '1.0',
  metadata: { name: 'Cascaded Splitter', description: '2-stage ODN: OLT → 1:4 → 2×(1:4) → 8 ONUs — real-world cascaded architecture', author: 'Demo', createdAt: '', modifiedAt: '' },
  endDevices: [],
  ethernetLinks: [],
  dbaProfiles: DEFAULT_DBA_PROFILES,
  olts: [{
    id: 'olt-cas', label: 'OLT-1', vendor: 'Huawei', model: 'MA5800-X7',
    standard: 'GPON', managementIP: '10.2.0.1',
    position: { x: 400, y: 40 },
    ponPorts: [{
      id: 'port-cas-0', oltId: 'olt-cas', portIndex: 0,
      txPower_dBm: 5, rxSensitivity_dBm: -28,
      wavelengthDown_nm: 1490, wavelengthUp_nm: 1310,
      maxONUs: 64, connectedONUIds: [],
    }],
  }],
  splitters: [
    // Stage 1: feeder splitter (1:4)
    { id: 'spl-cas-feed', label: 'SPL-F (1:4) Feeder', ratio: 4, insertionLoss_dB: 7.2, position: { x: 380, y: 180 } },
    // Stage 2: two distribution splitters (1:4 each → 4 ONUs per cabinet)
    { id: 'spl-cas-d1', label: 'SPL-D1 (1:4) Dist', ratio: 4, insertionLoss_dB: 7.2, position: { x: 140, y: 330 } },
    { id: 'spl-cas-d2', label: 'SPL-D2 (1:4) Dist', ratio: 4, insertionLoss_dB: 7.2, position: { x: 620, y: 330 } },
  ],
  odfs: [],
  onus: [
    // 4 ONUs under SPL-D1 (left cabinet)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `onu-cas-a${i}`,
      label: `ONU-A${i + 1}`,
      serialNumber: `HWTCA${(0xAA000000 + i).toString(16).toUpperCase().padStart(8, '0')}`,
      vendor: 'Huawei', model: 'HG8546M',
      standard: 'GPON' as const,
      state: 'O1' as const,
      stateEnteredAt: 0,
      oltId: 'olt-cas', ponPortId: 'port-cas-0', onuIndex: null,
      tconts: [{ id: `tc-ca${i}`, onuId: `onu-cas-a${i}`, index: 0, type: 4 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 0, maxBandwidth_kbps: 102400, dbaProfileId: 'dba-1', allocId: null }],
      gemPorts: [{ id: `gem-ca${i}`, onuId: `onu-cas-a${i}`, tcntId: `tc-ca${i}`, portId: i * 10, direction: 'bidirectional' as const, serviceType: 'HSI' as const }],
      serviceVlans: [{ id: `vlan-ca${i}`, onuId: `onu-cas-a${i}`, svlan: 100, cvlan: i + 1, gemPortId: `gem-ca${i}`, serviceType: 'HSI' as const, priority: 0 as const }],
      position: { x: 20 + i * 110, y: 490 },
    })),
    // 4 ONUs under SPL-D2 (right cabinet)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `onu-cas-b${i}`,
      label: `ONU-B${i + 1}`,
      serialNumber: `HWTCB${(0xBB000000 + i).toString(16).toUpperCase().padStart(8, '0')}`,
      vendor: 'ZTE', model: 'F660',
      standard: 'GPON' as const,
      state: 'O1' as const,
      stateEnteredAt: 0,
      oltId: 'olt-cas', ponPortId: 'port-cas-0', onuIndex: null,
      tconts: [{ id: `tc-cb${i}`, onuId: `onu-cas-b${i}`, index: 0, type: 4 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 0, maxBandwidth_kbps: 102400, dbaProfileId: 'dba-1', allocId: null }],
      gemPorts: [{ id: `gem-cb${i}`, onuId: `onu-cas-b${i}`, tcntId: `tc-cb${i}`, portId: 100 + i * 10, direction: 'bidirectional' as const, serviceType: 'HSI' as const }],
      serviceVlans: [{ id: `vlan-cb${i}`, onuId: `onu-cas-b${i}`, svlan: 100, cvlan: 10 + i + 1, gemPortId: `gem-cb${i}`, serviceType: 'HSI' as const, priority: 0 as const }],
      position: { x: 500 + i * 110, y: 490 },
    })),
  ],
  fibers: [
    // OLT → feeder splitter (long haul trunk)
    { id: 'f-cas-trunk', sourceId: 'olt-cas', sourceHandle: 'port-cas-0', targetId: 'spl-cas-feed', targetHandle: 'in', lengthKm: 8, attenuationCoeff_dBpkm: 0.22, connectorCount: 4, spliceCount: 4, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1 },
    // Feeder splitter → distribution splitters (distribution fibers)
    { id: 'f-cas-fd1', sourceId: 'spl-cas-feed', sourceHandle: 'out-0', targetId: 'spl-cas-d1', targetHandle: 'in', lengthKm: 1.5, attenuationCoeff_dBpkm: 0.35, connectorCount: 2, spliceCount: 1, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1 },
    { id: 'f-cas-fd2', sourceId: 'spl-cas-feed', sourceHandle: 'out-1', targetId: 'spl-cas-d2', targetHandle: 'in', lengthKm: 2.0, attenuationCoeff_dBpkm: 0.35, connectorCount: 2, spliceCount: 1, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1 },
    // Distribution splitter D1 → ONUs A (drop cables)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `f-cas-da${i}`, sourceId: 'spl-cas-d1', sourceHandle: `out-${i}`, targetId: `onu-cas-a${i}`, targetHandle: 'pon-in',
      lengthKm: 0.2 + i * 0.1, attenuationCoeff_dBpkm: 0.35, connectorCount: 1, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
    })),
    // Distribution splitter D2 → ONUs B (drop cables)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `f-cas-db${i}`, sourceId: 'spl-cas-d2', sourceHandle: `out-${i}`, targetId: `onu-cas-b${i}`, targetHandle: 'pon-in',
      lengthKm: 0.3 + i * 0.15, attenuationCoeff_dBpkm: 0.35, connectorCount: 1, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
    })),
  ],
  viewport: { x: 0, y: 0, zoom: 0.8 },
};

// Link Budget Challenge: long feeder + 1:32 splitter — demonstrates amber/red budget warnings
// OLT TX=+1 dBm (low power unit), budget=29 dB. Long drops exceed budget.
const budgetChallenge: ProjectFile = {
  version: '1.0',
  metadata: { name: 'Budget Challenge', description: 'OLT (TX=+1 dBm) → 10 km feeder → 1:32 → ONUs with varying drop lengths (green/amber/red)', author: 'Demo', createdAt: '', modifiedAt: '' },
  endDevices: [],
  ethernetLinks: [],
  dbaProfiles: DEFAULT_DBA_PROFILES,
  olts: [{
    id: 'olt-bgt', label: 'OLT-Budget', vendor: 'ZTE', model: 'C600',
    standard: 'GPON', managementIP: '10.3.0.1',
    position: { x: 350, y: 40 },
    ponPorts: [{
      id: 'port-bgt-0', oltId: 'olt-bgt', portIndex: 0,
      txPower_dBm: 1,        // Low TX — reduces budget to 29 dB
      rxSensitivity_dBm: -28,
      wavelengthDown_nm: 1490, wavelengthUp_nm: 1310,
      maxONUs: 64, connectedONUIds: [],
    }],
  }],
  splitters: [{
    id: 'spl-bgt', label: 'SPL-1 (1:32)', ratio: 32,
    insertionLoss_dB: 17.2, position: { x: 320, y: 200 },
  }],
  odfs: [],
  onus: [
    // 4 ONUs with short drops (~0.3 km): budget healthy, margin ~7 dB — GREEN
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `onu-bgt-g${i}`,
      label: `ONU-G${i + 1}`,
      serialNumber: `ZTEG${(0x11000000 + i).toString(16).toUpperCase().padStart(8, '0')}`,
      vendor: 'ZTE', model: 'F601',
      standard: 'GPON' as const,
      state: 'O1' as const,
      stateEnteredAt: 0,
      oltId: 'olt-bgt', ponPortId: 'port-bgt-0', onuIndex: null,
      tconts: [{ id: `tc-bg${i}`, onuId: `onu-bgt-g${i}`, index: 0, type: 4 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 0, maxBandwidth_kbps: 102400, dbaProfileId: 'dba-1', allocId: null }],
      gemPorts: [{ id: `gem-bg${i}`, onuId: `onu-bgt-g${i}`, tcntId: `tc-bg${i}`, portId: i * 10, direction: 'bidirectional' as const, serviceType: 'HSI' as const }],
      serviceVlans: [{ id: `vlan-bg${i}`, onuId: `onu-bgt-g${i}`, svlan: 100, cvlan: i + 1, gemPortId: `gem-bg${i}`, serviceType: 'HSI' as const, priority: 0 as const }],
      position: { x: 30 + i * 100, y: 360 },
    })),
    // 2 ONUs with 12 km drops: margin ~1.5 dB — AMBER (marginal)
    ...Array.from({ length: 2 }, (_, i) => ({
      id: `onu-bgt-a${i}`,
      label: `ONU-A${i + 1}`,
      serialNumber: `ZTEA${(0x22000000 + i).toString(16).toUpperCase().padStart(8, '0')}`,
      vendor: 'ZTE', model: 'F601',
      standard: 'GPON' as const,
      state: 'O1' as const,
      stateEnteredAt: 0,
      oltId: 'olt-bgt', ponPortId: 'port-bgt-0', onuIndex: null,
      tconts: [{ id: `tc-ba${i}`, onuId: `onu-bgt-a${i}`, index: 0, type: 4 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 0, maxBandwidth_kbps: 102400, dbaProfileId: 'dba-1', allocId: null }],
      gemPorts: [{ id: `gem-ba${i}`, onuId: `onu-bgt-a${i}`, tcntId: `tc-ba${i}`, portId: 100 + i * 10, direction: 'bidirectional' as const, serviceType: 'HSI' as const }],
      serviceVlans: [{ id: `vlan-ba${i}`, onuId: `onu-bgt-a${i}`, svlan: 100, cvlan: 10 + i + 1, gemPortId: `gem-ba${i}`, serviceType: 'HSI' as const, priority: 0 as const }],
      position: { x: 460 + i * 120, y: 360 },
    })),
    // 2 ONUs with 18 km drops: margin ~-1 dB — RED (over budget)
    ...Array.from({ length: 2 }, (_, i) => ({
      id: `onu-bgt-r${i}`,
      label: `ONU-R${i + 1}`,
      serialNumber: `ZTER${(0x33000000 + i).toString(16).toUpperCase().padStart(8, '0')}`,
      vendor: 'ZTE', model: 'F601',
      standard: 'GPON' as const,
      state: 'O1' as const,
      stateEnteredAt: 0,
      oltId: 'olt-bgt', ponPortId: 'port-bgt-0', onuIndex: null,
      tconts: [{ id: `tc-br${i}`, onuId: `onu-bgt-r${i}`, index: 0, type: 4 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 0, maxBandwidth_kbps: 102400, dbaProfileId: 'dba-1', allocId: null }],
      gemPorts: [{ id: `gem-br${i}`, onuId: `onu-bgt-r${i}`, tcntId: `tc-br${i}`, portId: 200 + i * 10, direction: 'bidirectional' as const, serviceType: 'HSI' as const }],
      serviceVlans: [{ id: `vlan-br${i}`, onuId: `onu-bgt-r${i}`, svlan: 100, cvlan: 20 + i + 1, gemPortId: `gem-br${i}`, serviceType: 'HSI' as const, priority: 0 as const }],
      position: { x: 730 + i * 120, y: 360 },
    })),
  ],
  fibers: [
    // OLT → 1:32 splitter: 10 km feeder, 4 connectors, 3 splices
    // Loss: 10×0.22 + 4×0.5 + 3×0.1 = 2.2 + 2.0 + 0.3 = 4.5 dB
    { id: 'f-bgt-trunk', sourceId: 'olt-bgt', sourceHandle: 'port-bgt-0', targetId: 'spl-bgt', targetHandle: 'in', lengthKm: 10, attenuationCoeff_dBpkm: 0.22, connectorCount: 4, spliceCount: 3, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1 },
    // Green ONUs: 0.3 km drop, 1 connector — path loss = 4.5+17.2+0.605 = 22.3 dB, margin ≈ 6.7 dB
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `f-bgt-g${i}`, sourceId: 'spl-bgt', sourceHandle: `out-${i}`, targetId: `onu-bgt-g${i}`, targetHandle: 'pon-in',
      lengthKm: 0.3, attenuationCoeff_dBpkm: 0.35, connectorCount: 1, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
    })),
    // Amber ONUs: 12 km drop, 2 connectors — path loss = 4.5+17.2+5.2 = 26.9 dB, margin ≈ 2.1 dB
    ...Array.from({ length: 2 }, (_, i) => ({
      id: `f-bgt-a${i}`, sourceId: 'spl-bgt', sourceHandle: `out-${i + 4}`, targetId: `onu-bgt-a${i}`, targetHandle: 'pon-in',
      lengthKm: 12, attenuationCoeff_dBpkm: 0.35, connectorCount: 2, spliceCount: 1, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
    })),
    // Red ONUs: 18 km drop, 3 connectors — path loss = 4.5+17.2+7.8 = 29.5 dB, margin ≈ -0.5 dB (OVER!)
    ...Array.from({ length: 2 }, (_, i) => ({
      id: `f-bgt-r${i}`, sourceId: 'spl-bgt', sourceHandle: `out-${i + 6}`, targetId: `onu-bgt-r${i}`, targetHandle: 'pon-in',
      lengthKm: 18, attenuationCoeff_dBpkm: 0.35, connectorCount: 3, spliceCount: 2, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
    })),
  ],
  viewport: { x: 0, y: 0, zoom: 0.85 },
};

// FTTH MDU (Multi-Dwelling Unit): apartment building scenario
// Mixed services: HSI, VoIP, IPTV across 12 residential ONUs
const ftthMdu: ProjectFile = {
  version: '1.0',
  metadata: { name: 'FTTH MDU', description: 'Apartment building: OLT → ODF → 1:16 → 12 flats with mixed HSI/VoIP/IPTV services', author: 'Demo', createdAt: '', modifiedAt: '' },
  endDevices: [],
  ethernetLinks: [],
  dbaProfiles: DEFAULT_DBA_PROFILES,
  olts: [{
    id: 'olt-mdu', label: 'OLT-MDU', vendor: 'Huawei', model: 'MA5800-X2',
    standard: 'GPON', managementIP: '10.4.0.1',
    position: { x: 380, y: 40 },
    ponPorts: [{
      id: 'port-mdu-0', oltId: 'olt-mdu', portIndex: 0,
      txPower_dBm: 3, rxSensitivity_dBm: -28,
      wavelengthDown_nm: 1490, wavelengthUp_nm: 1310,
      maxONUs: 64, connectedONUIds: [],
    }],
  }],
  splitters: [{
    id: 'spl-mdu', label: 'SPL-MDU (1:16)', ratio: 16,
    insertionLoss_dB: 13.8, position: { x: 360, y: 210 },
  }],
  odfs: [{
    id: 'odf-mdu', label: 'ODF-CO', portCount: 24, connectorLoss_dB: 0.5,
    position: { x: 360, y: 125 },
  }],
  onus: [
    // Floor 1: 4 residents — HSI only
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `onu-mdu-f1-${i}`,
      label: `Flat-1${i + 1}`,
      serialNumber: `HWTCF${(0xF1000000 + i).toString(16).toUpperCase().padStart(8, '0')}`,
      vendor: 'Huawei', model: 'HG8310M',
      standard: 'GPON' as const,
      state: 'O1' as const,
      stateEnteredAt: 0,
      oltId: 'olt-mdu', ponPortId: 'port-mdu-0', onuIndex: null,
      tconts: [{ id: `tc-f1${i}`, onuId: `onu-mdu-f1-${i}`, index: 0, type: 4 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 0, maxBandwidth_kbps: 100000, dbaProfileId: 'dba-1', allocId: null }],
      gemPorts: [{ id: `gem-f1${i}`, onuId: `onu-mdu-f1-${i}`, tcntId: `tc-f1${i}`, portId: i * 10, direction: 'bidirectional' as const, serviceType: 'HSI' as const }],
      serviceVlans: [{ id: `vlan-f1${i}`, onuId: `onu-mdu-f1-${i}`, svlan: 100, cvlan: 10 + i + 1, gemPortId: `gem-f1${i}`, serviceType: 'HSI' as const, priority: 0 as const }],
      position: { x: 30 + i * 130, y: 380 },
    })),
    // Floor 2: 4 residents — HSI + VoIP
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `onu-mdu-f2-${i}`,
      label: `Flat-2${i + 1}`,
      serialNumber: `HWTCF${(0xF2000000 + i).toString(16).toUpperCase().padStart(8, '0')}`,
      vendor: 'Huawei', model: 'HG8245H',
      standard: 'GPON' as const,
      state: 'O1' as const,
      stateEnteredAt: 0,
      oltId: 'olt-mdu', ponPortId: 'port-mdu-0', onuIndex: null,
      tconts: [
        { id: `tc-f2v${i}`, onuId: `onu-mdu-f2-${i}`, index: 0, type: 1 as const, fixedBandwidth_kbps: 512, assuredBandwidth_kbps: 512, maxBandwidth_kbps: 512, dbaProfileId: 'dba-5', allocId: null },
        { id: `tc-f2d${i}`, onuId: `onu-mdu-f2-${i}`, index: 1, type: 4 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 0, maxBandwidth_kbps: 100000, dbaProfileId: 'dba-1', allocId: null },
      ],
      gemPorts: [
        { id: `gem-f2v${i}`, onuId: `onu-mdu-f2-${i}`, tcntId: `tc-f2v${i}`, portId: 100 + i * 10, direction: 'bidirectional' as const, serviceType: 'VOIP' as const },
        { id: `gem-f2d${i}`, onuId: `onu-mdu-f2-${i}`, tcntId: `tc-f2d${i}`, portId: 101 + i * 10, direction: 'bidirectional' as const, serviceType: 'HSI' as const },
      ],
      serviceVlans: [
        { id: `vlan-f2v${i}`, onuId: `onu-mdu-f2-${i}`, svlan: 200, cvlan: 20 + i + 1, gemPortId: `gem-f2v${i}`, serviceType: 'VOIP' as const, priority: 5 as const },
        { id: `vlan-f2d${i}`, onuId: `onu-mdu-f2-${i}`, svlan: 100, cvlan: 20 + i + 1, gemPortId: `gem-f2d${i}`, serviceType: 'HSI' as const, priority: 0 as const },
      ],
      position: { x: 30 + i * 130, y: 520 },
    })),
    // Floor 3: 4 residents — HSI + VoIP + IPTV
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `onu-mdu-f3-${i}`,
      label: `Flat-3${i + 1}`,
      serialNumber: `HWTCF${(0xF3000000 + i).toString(16).toUpperCase().padStart(8, '0')}`,
      vendor: 'Huawei', model: 'HG8245Q',
      standard: 'GPON' as const,
      state: 'O1' as const,
      stateEnteredAt: 0,
      oltId: 'olt-mdu', ponPortId: 'port-mdu-0', onuIndex: null,
      tconts: [
        { id: `tc-f3v${i}`, onuId: `onu-mdu-f3-${i}`, index: 0, type: 1 as const, fixedBandwidth_kbps: 512, assuredBandwidth_kbps: 512, maxBandwidth_kbps: 512, dbaProfileId: 'dba-5', allocId: null },
        { id: `tc-f3t${i}`, onuId: `onu-mdu-f3-${i}`, index: 1, type: 3 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 20000, maxBandwidth_kbps: 50000, dbaProfileId: 'dba-3', allocId: null },
        { id: `tc-f3d${i}`, onuId: `onu-mdu-f3-${i}`, index: 2, type: 4 as const, fixedBandwidth_kbps: 0, assuredBandwidth_kbps: 0, maxBandwidth_kbps: 100000, dbaProfileId: 'dba-1', allocId: null },
      ],
      gemPorts: [
        { id: `gem-f3v${i}`, onuId: `onu-mdu-f3-${i}`, tcntId: `tc-f3v${i}`, portId: 200 + i * 10, direction: 'bidirectional' as const, serviceType: 'VOIP' as const },
        { id: `gem-f3t${i}`, onuId: `onu-mdu-f3-${i}`, tcntId: `tc-f3t${i}`, portId: 201 + i * 10, direction: 'bidirectional' as const, serviceType: 'IPTV' as const },
        { id: `gem-f3d${i}`, onuId: `onu-mdu-f3-${i}`, tcntId: `tc-f3d${i}`, portId: 202 + i * 10, direction: 'bidirectional' as const, serviceType: 'HSI' as const },
      ],
      serviceVlans: [
        { id: `vlan-f3v${i}`, onuId: `onu-mdu-f3-${i}`, svlan: 200, cvlan: 30 + i + 1, gemPortId: `gem-f3v${i}`, serviceType: 'VOIP' as const, priority: 5 as const },
        { id: `vlan-f3t${i}`, onuId: `onu-mdu-f3-${i}`, svlan: 300, cvlan: 30 + i + 1, gemPortId: `gem-f3t${i}`, serviceType: 'IPTV' as const, priority: 4 as const },
        { id: `vlan-f3d${i}`, onuId: `onu-mdu-f3-${i}`, svlan: 100, cvlan: 30 + i + 1, gemPortId: `gem-f3d${i}`, serviceType: 'HSI' as const, priority: 0 as const },
      ],
      position: { x: 30 + i * 130, y: 660 },
    })),
  ],
  fibers: [
    // OLT → ODF → Splitter
    { id: 'f-mdu-odf', sourceId: 'olt-mdu', sourceHandle: 'port-mdu-0', targetId: 'odf-mdu', targetHandle: 'in', lengthKm: 0.5, attenuationCoeff_dBpkm: 0.22, connectorCount: 2, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1 },
    { id: 'f-mdu-spl', sourceId: 'odf-mdu', sourceHandle: 'out-0', targetId: 'spl-mdu', targetHandle: 'in', lengthKm: 0.2, attenuationCoeff_dBpkm: 0.35, connectorCount: 2, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1 },
    // Splitter → Floor 1 flats (vertical riser, ~20m per floor)
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `f-mdu-f1${i}`, sourceId: 'spl-mdu', sourceHandle: `out-${i}`, targetId: `onu-mdu-f1-${i}`, targetHandle: 'pon-in',
      lengthKm: 0.02 + i * 0.01, attenuationCoeff_dBpkm: 0.35, connectorCount: 1, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
    })),
    // Splitter → Floor 2 flats
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `f-mdu-f2${i}`, sourceId: 'spl-mdu', sourceHandle: `out-${i + 4}`, targetId: `onu-mdu-f2-${i}`, targetHandle: 'pon-in',
      lengthKm: 0.04 + i * 0.01, attenuationCoeff_dBpkm: 0.35, connectorCount: 1, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
    })),
    // Splitter → Floor 3 flats
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `f-mdu-f3${i}`, sourceId: 'spl-mdu', sourceHandle: `out-${i + 8}`, targetId: `onu-mdu-f3-${i}`, targetHandle: 'pon-in',
      lengthKm: 0.06 + i * 0.01, attenuationCoeff_dBpkm: 0.35, connectorCount: 1, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
    })),
  ],
  viewport: { x: 0, y: 0, zoom: 0.7 },
};

export const SAMPLE_TOPOLOGIES = [
  { id: 'simple-gpon', name: 'Simple GPON', description: '1 OLT · 1:8 splitter · 8 ONUs · 3 km feeder', data: gponSimple },
  { id: 'xgspon-enterprise', name: 'XGS-PON Enterprise', description: '1 OLT · 1:16 splitter · 16 SBUs · Type 1+4 T-CONTs', data: xgsPonEnterprise },
  { id: 'cascaded-splitter', name: 'Cascaded Splitter', description: '2-stage ODN: 1:4 → 2×(1:4) → 8 ONUs · greenfield architecture', data: cascadedSplitter },
  { id: 'budget-challenge', name: 'Budget Challenge', description: '1:32 splitter · long drops → green/amber/red link budget demo', data: budgetChallenge },
  { id: 'ftth-mdu', name: 'FTTH MDU', description: 'Apartment building · 12 flats · HSI, VoIP, IPTV mixed services', data: ftthMdu },
];
