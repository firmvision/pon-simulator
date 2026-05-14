import { create } from 'zustand';
import {
  applyNodeChanges, applyEdgeChanges,
  type Node, type Edge, type NodeChange, type EdgeChange, type Connection,
} from '@xyflow/react';
import type { OLT, ONU, Splitter, ODF, FiberSegment, SplitterRatio, XYPosition, EndDevice, EndDeviceType, EthernetLink } from '../types/network';
import type { DBAProfile } from '../types/protocol';
import type { ProjectFile } from '../types/topology';
import { generateId, generateSerialNumber } from '../utils/idGenerator';
import { DEFAULT_DBA_PROFILES, SPLITTER_LOSS } from '../types/protocol';

interface TopologyStore {
  nodes: Node[];
  edges: Edge[];
  olts: Record<string, OLT>;
  onus: Record<string, ONU>;
  splitters: Record<string, Splitter>;
  odfs: Record<string, ODF>;
  fibers: Record<string, FiberSegment>;
  endDevices: Record<string, EndDevice>;
  ethernetLinks: Record<string, EthernetLink>;
  dbaProfiles: Record<string, DBAProfile>;
  selectedNodeId: string | null;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setSelectedNode: (id: string | null) => void;

  addOLT: (position: XYPosition) => string;
  addONU: (position: XYPosition) => string;
  addSplitter: (ratio: SplitterRatio, position: XYPosition) => string;
  addODF: (position: XYPosition) => string;
  addEndDevice: (deviceType: EndDeviceType, position: XYPosition) => string;
  updateOLT: (id: string, patch: Partial<OLT>) => void;
  updateONU: (id: string, patch: Partial<ONU>) => void;
  updateSplitter: (id: string, patch: Partial<Splitter>) => void;
  updateFiber: (id: string, patch: Partial<FiberSegment>) => void;
  updateEndDevice: (id: string, patch: Partial<EndDevice>) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;

  loadProject: (file: ProjectFile) => void;
  exportProject: () => ProjectFile;
  reset: () => void;
}

let oltCount = 0;
let onuCount = 0;
let splitterCount = 0;
let odfCount = 0;
let endDeviceCount = 0;

type NodeData = Record<string, unknown>;

function makeOLTNode(olt: OLT): Node {
  return { id: olt.id, type: 'olt', position: olt.position, data: olt as unknown as NodeData };
}
function makeONUNode(onu: ONU): Node {
  return { id: onu.id, type: 'onu', position: onu.position, data: onu as unknown as NodeData };
}
function makeSplitterNode(s: Splitter): Node {
  return { id: s.id, type: 'splitter', position: s.position, data: s as unknown as NodeData };
}
function makeODFNode(o: ODF): Node {
  return { id: o.id, type: 'odf', position: o.position, data: o as unknown as NodeData };
}
function makeEndDeviceNode(d: EndDevice): Node {
  return { id: d.id, type: 'enddevice', position: d.position, data: d as unknown as NodeData };
}
function makeEthernetEdge(l: EthernetLink): Edge {
  return {
    id: l.id, source: l.sourceId, sourceHandle: l.sourceHandle || null,
    target: l.targetId, targetHandle: l.targetHandle || null,
    type: 'ethernet', data: l as unknown as NodeData,
  };
}

function makeFiberEdge(f: FiberSegment): Edge {
  return {
    id: f.id,
    source: f.sourceId,
    sourceHandle: f.sourceHandle || null,
    target: f.targetId,
    targetHandle: f.targetHandle || null,
    type: 'fiber',
    data: f as unknown as NodeData,
  };
}

const initialDBAProfiles: Record<string, DBAProfile> = {};
DEFAULT_DBA_PROFILES.forEach(p => { initialDBAProfiles[p.id] = p; });

export const useTopologyStore = create<TopologyStore>((set, get) => ({
  nodes: [],
  edges: [],
  olts: {},
  onus: {},
  splitters: {},
  odfs: {},
  fibers: {},
  endDevices: {},
  ethernetLinks: {},
  dbaProfiles: { ...initialDBAProfiles },
  selectedNodeId: null,

  onNodesChange: (changes) => {
    // Apply node changes, and for 'remove' changes also clean up domain maps + connected edges
    set(s => {
      const removedIds = changes.filter(c => c.type === 'remove').map(c => c.id);
      let olts = s.olts, onus = s.onus, splitters = s.splitters, odfs = s.odfs, endDevices = s.endDevices;
      let edges = s.edges, fibers = s.fibers, ethernetLinks = s.ethernetLinks;
      if (removedIds.length > 0) {
        olts = { ...olts }; onus = { ...onus }; splitters = { ...splitters };
        odfs = { ...odfs }; endDevices = { ...endDevices };
        fibers = { ...fibers }; ethernetLinks = { ...ethernetLinks };
        removedIds.forEach(id => {
          delete olts[id]; delete onus[id]; delete splitters[id];
          delete odfs[id]; delete endDevices[id];
        });
        // Remove connected edges and their domain records
        const deadEdges = edges.filter(e => removedIds.includes(e.source) || removedIds.includes(e.target));
        deadEdges.forEach(e => { delete fibers[e.id]; delete ethernetLinks[e.id]; });
        edges = edges.filter(e => !removedIds.includes(e.source) && !removedIds.includes(e.target));
      }
      return {
        nodes: applyNodeChanges(changes, s.nodes),
        olts, onus, splitters, odfs, endDevices, edges, fibers, ethernetLinks,
      };
    });
  },

  onEdgesChange: (changes) => {
    set(s => {
      const removedIds = changes.filter(c => c.type === 'remove').map(c => c.id);
      const fibers = { ...s.fibers };
      const ethernetLinks = { ...s.ethernetLinks };
      removedIds.forEach(id => { delete fibers[id]; delete ethernetLinks[id]; });
      return { edges: applyEdgeChanges(changes, s.edges), fibers, ethernetLinks };
    });
  },

  onConnect: (connection) => {
    const s = get();
    const srcIsEndDevice = !!s.endDevices[connection.source];
    const tgtIsEndDevice = !!s.endDevices[connection.target];
    if (srcIsEndDevice || tgtIsEndDevice) {
      // Ethernet link between end device and ONU/router
      const id = generateId('eth');
      const link: EthernetLink = {
        id, sourceId: connection.source, sourceHandle: connection.sourceHandle || '',
        targetId: connection.target, targetHandle: connection.targetHandle || '',
        speedMbps: 1000,
      };
      set(st => ({ ethernetLinks: { ...st.ethernetLinks, [id]: link }, edges: [...st.edges, makeEthernetEdge(link)] }));
    } else {
      const id = generateId('fiber');
      const fiber: FiberSegment = {
        id, sourceId: connection.source, sourceHandle: connection.sourceHandle || '',
        targetId: connection.target, targetHandle: connection.targetHandle || '',
        lengthKm: 1, attenuationCoeff_dBpkm: 0.35,
        connectorCount: 2, spliceCount: 0, connectorLoss_dB: 0.5, spliceLoss_dB: 0.1,
      };
      set(st => ({ fibers: { ...st.fibers, [id]: fiber }, edges: [...st.edges, makeFiberEdge(fiber)] }));
    }
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  addOLT: (position) => {
    const id = generateId('olt');
    const portId = generateId('port');
    const olt: OLT = {
      id,
      label: `OLT-${++oltCount}`,
      vendor: 'Huawei',
      model: 'MA5800-X17',
      standard: 'GPON',
      managementIP: `10.0.0.${oltCount}`,
      ponPorts: [{
        id: portId,
        oltId: id,
        portIndex: 0,
        txPower_dBm: 3,
        rxSensitivity_dBm: -28,
        wavelengthDown_nm: 1490,
        wavelengthUp_nm: 1310,
        maxONUs: 64,
        connectedONUIds: [],
      }],
      position,
    };
    set(s => ({
      olts: { ...s.olts, [id]: olt },
      nodes: [...s.nodes, makeOLTNode(olt)],
    }));
    return id;
  },

  addONU: (position) => {
    const id = generateId('onu');
    const onu: ONU = {
      id,
      label: `ONU-${++onuCount}`,
      serialNumber: generateSerialNumber('HWTC'),
      vendor: 'Huawei',
      model: 'HG8546M',
      standard: 'GPON',
      state: 'O1',
      stateEnteredAt: 0,
      oltId: null,
      ponPortId: null,
      onuIndex: null,
      tconts: [{
        id: generateId('tcont'),
        onuId: id,
        index: 0,
        type: 4,
        fixedBandwidth_kbps: 0,
        assuredBandwidth_kbps: 0,
        maxBandwidth_kbps: 102_400,
        dbaProfileId: 'dba-1',
        allocId: null,
      }],
      gemPorts: [{
        id: generateId('gem'),
        onuId: id,
        tcntId: '',
        portId: onuCount * 10,
        direction: 'bidirectional',
        serviceType: 'HSI',
      }],
      serviceVlans: [{
        id: generateId('vlan'),
        onuId: id,
        svlan: 100,
        cvlan: onuCount,
        gemPortId: '',
        serviceType: 'HSI',
        priority: 0,
      }],
      position,
    };
    set(s => ({
      onus: { ...s.onus, [id]: onu },
      nodes: [...s.nodes, makeONUNode(onu)],
    }));
    return id;
  },

  addSplitter: (ratio, position) => {
    const id = generateId('splitter');
    const splitter: Splitter = {
      id,
      label: `SPL-${++splitterCount} (1:${ratio})`,
      ratio,
      insertionLoss_dB: SPLITTER_LOSS[ratio] ?? 17.2,
      position,
    };
    set(s => ({
      splitters: { ...s.splitters, [id]: splitter },
      nodes: [...s.nodes, makeSplitterNode(splitter)],
    }));
    return id;
  },

  addEndDevice: (deviceType, position) => {
    const id = generateId('dev');
    const n = ++endDeviceCount;
    const labels: Record<string, string> = { pc: 'PC', laptop: 'Laptop', router: 'Router', server: 'Server', cloud: 'Internet', phone: 'Phone' };
    const octets = [192, 168, 1, n % 254 || 1];
    const mac = Array.from({ length: 6 }, (_, i) => ((n * 7 + i * 13) & 0xff).toString(16).padStart(2, '0')).join(':');
    const dev: EndDevice = {
      id, label: `${labels[deviceType] ?? 'Device'}-${n}`,
      deviceType, ipAddress: octets.join('.'), macAddress: mac, position,
    };
    set(s => ({ endDevices: { ...s.endDevices, [id]: dev }, nodes: [...s.nodes, makeEndDeviceNode(dev)] }));
    return id;
  },

  addODF: (position) => {
    const id = generateId('odf');
    const odf: ODF = {
      id,
      label: `ODF-${++odfCount}`,
      portCount: 24,
      connectorLoss_dB: 0.5,
      position,
    };
    set(s => ({
      odfs: { ...s.odfs, [id]: odf },
      nodes: [...s.nodes, makeODFNode(odf)],
    }));
    return id;
  },

  updateOLT: (id, patch) => set(s => {
    const updated = { ...s.olts[id], ...patch };
    return {
      olts: { ...s.olts, [id]: updated },
      nodes: s.nodes.map(n => n.id === id ? { ...n, data: updated } : n),
    };
  }),

  updateONU: (id, patch) => set(s => {
    const updated = { ...s.onus[id], ...patch };
    return {
      onus: { ...s.onus, [id]: updated },
      nodes: s.nodes.map(n => n.id === id ? { ...n, data: updated } : n),
    };
  }),

  updateSplitter: (id, patch) => set(s => {
    const updated = { ...s.splitters[id], ...patch };
    return {
      splitters: { ...s.splitters, [id]: updated },
      nodes: s.nodes.map(n => n.id === id ? { ...n, data: updated } : n),
    };
  }),

  updateEndDevice: (id, patch) => set(s => {
    const updated = { ...s.endDevices[id], ...patch };
    return { endDevices: { ...s.endDevices, [id]: updated }, nodes: s.nodes.map(n => n.id === id ? { ...n, data: updated } : n) };
  }),

  updateFiber: (id, patch) => set(s => {
    const updated = { ...s.fibers[id], ...patch };
    return {
      fibers: { ...s.fibers, [id]: updated },
      edges: s.edges.map(e => e.id === id ? { ...e, data: updated } : e),
    };
  }),

  removeNode: (id) => set(s => {
    const olts = { ...s.olts }; delete olts[id];
    const onus = { ...s.onus }; delete onus[id];
    const splitters = { ...s.splitters }; delete splitters[id];
    const odfs = { ...s.odfs }; delete odfs[id];
    const endDevices = { ...s.endDevices }; delete endDevices[id];
    const nodes = s.nodes.filter(n => n.id !== id);
    const deadEdges = s.edges.filter(e => e.source === id || e.target === id).map(e => e.id);
    const edges = s.edges.filter(e => e.source !== id && e.target !== id);
    const fibers = { ...s.fibers };
    const ethernetLinks = { ...s.ethernetLinks };
    deadEdges.forEach(eid => { delete fibers[eid]; delete ethernetLinks[eid]; });
    return { olts, onus, splitters, odfs, endDevices, nodes, edges, fibers, ethernetLinks };
  }),

  removeEdge: (id) => set(s => {
    const fibers = { ...s.fibers }; delete fibers[id];
    const ethernetLinks = { ...s.ethernetLinks }; delete ethernetLinks[id];
    return { fibers, ethernetLinks, edges: s.edges.filter(e => e.id !== id) };
  }),

  loadProject: (file) => {
    const olts: Record<string, OLT> = {};
    const onus: Record<string, ONU> = {};
    const splitters: Record<string, Splitter> = {};
    const odfs: Record<string, ODF> = {};
    const fibers: Record<string, FiberSegment> = {};
    const endDevices: Record<string, EndDevice> = {};
    const ethernetLinks: Record<string, EthernetLink> = {};
    const dbaProfiles: Record<string, DBAProfile> = { ...initialDBAProfiles };

    file.olts.forEach(o => { olts[o.id] = o; });
    file.onus.forEach(o => { onus[o.id] = o; });
    file.splitters.forEach(s => { splitters[s.id] = s; });
    file.odfs.forEach(o => { odfs[o.id] = o; });
    file.fibers.forEach(f => { fibers[f.id] = f; });
    file.endDevices?.forEach(d => { endDevices[d.id] = d; });
    file.ethernetLinks?.forEach(l => { ethernetLinks[l.id] = l; });
    file.dbaProfiles?.forEach(d => { dbaProfiles[d.id] = d; });

    const nodes = [
      ...file.olts.map(makeOLTNode),
      ...file.onus.map(makeONUNode),
      ...file.splitters.map(makeSplitterNode),
      ...file.odfs.map(makeODFNode),
      ...(file.endDevices ?? []).map(makeEndDeviceNode),
    ];
    const edges = [
      ...file.fibers.map(makeFiberEdge),
      ...(file.ethernetLinks ?? []).map(makeEthernetEdge),
    ];

    set({ olts, onus, splitters, odfs, fibers, endDevices, ethernetLinks, dbaProfiles, nodes, edges, selectedNodeId: null });
  },

  exportProject: () => {
    const s = get();
    // Sync current node positions from React Flow nodes into domain objects before export
    const positionMap: Record<string, { x: number; y: number }> = {};
    s.nodes.forEach(n => { positionMap[n.id] = n.position; });
    return {
      version: '1.0',
      metadata: {
        name: 'PON Project',
        description: '',
        author: '',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      },
      olts: Object.values(s.olts).map(o => ({ ...o, position: positionMap[o.id] ?? o.position })),
      onus: Object.values(s.onus).map(o => ({ ...o, position: positionMap[o.id] ?? o.position })),
      splitters: Object.values(s.splitters).map(o => ({ ...o, position: positionMap[o.id] ?? o.position })),
      odfs: Object.values(s.odfs).map(o => ({ ...o, position: positionMap[o.id] ?? o.position })),
      fibers: Object.values(s.fibers),
      endDevices: Object.values(s.endDevices).map(d => ({ ...d, position: positionMap[d.id] ?? d.position })),
      ethernetLinks: Object.values(s.ethernetLinks),
      dbaProfiles: Object.values(s.dbaProfiles),
      viewport: { x: 0, y: 0, zoom: 1 },
    };
  },

  reset: () => {
    oltCount = 0; onuCount = 0; splitterCount = 0; odfCount = 0; endDeviceCount = 0;
    set({ nodes: [], edges: [], olts: {}, onus: {}, splitters: {}, odfs: {}, fibers: {}, endDevices: {}, ethernetLinks: {}, selectedNodeId: null, dbaProfiles: { ...initialDBAProfiles } });
  },
}));

// Helper: get all ONU ids connected downstream from an OLT port, traversing splitters
export function getConnectedONUs(
  sourceId: string,
  fibers: Record<string, FiberSegment>,
  onus: Record<string, ONU>,
  splitters: Record<string, Splitter>,
): ONU[] {
  const visited = new Set<string>();
  const result: ONU[] = [];
  const queue = [sourceId];
  while (queue.length) {
    const cur = queue.shift()!;
    if (visited.has(cur)) continue;
    visited.add(cur);
    if (onus[cur]) { result.push(onus[cur]); continue; }
    // Find fibers where this node is the source
    Object.values(fibers).filter(f => f.sourceId === cur || (splitters[cur] && f.targetId === cur)).forEach(f => {
      const next = f.sourceId === cur ? f.targetId : f.sourceId;
      queue.push(next);
    });
    Object.values(fibers).filter(f => f.sourceId === cur).forEach(f => queue.push(f.targetId));
  }
  return result;
}

// Helper: trace ODN path from a node to an ONU
export function tracePathTo(
  fromId: string,
  toId: string,
  fibers: Record<string, FiberSegment>,
  splitters: Record<string, Splitter>,
  odfs: Record<string, ODF>,
): Array<FiberSegment | Splitter | ODF> {
  // BFS to find path
  type Step = { nodeId: string; path: Array<FiberSegment | Splitter | ODF> };
  const visited = new Set<string>();
  const queue: Step[] = [{ nodeId: fromId, path: [] }];
  while (queue.length) {
    const { nodeId, path } = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    if (nodeId === toId) return path;
    // Find adjacent fibers
    Object.values(fibers).forEach(f => {
      if (f.sourceId === nodeId && !visited.has(f.targetId)) {
        const nextPath = [...path, f];
        if (splitters[f.targetId]) nextPath.push(splitters[f.targetId]);
        else if (odfs[f.targetId]) nextPath.push(odfs[f.targetId]);
        queue.push({ nodeId: f.targetId, path: nextPath });
      }
      if (f.targetId === nodeId && !visited.has(f.sourceId)) {
        const nextPath = [...path, f];
        if (splitters[f.sourceId]) nextPath.push(splitters[f.sourceId]);
        else if (odfs[f.sourceId]) nextPath.push(odfs[f.sourceId]);
        queue.push({ nodeId: f.sourceId, path: nextPath });
      }
    });
  }
  return [];
}
