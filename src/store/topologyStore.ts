import { create } from 'zustand';
import {
  applyNodeChanges, applyEdgeChanges,
  type Node, type Edge, type NodeChange, type EdgeChange, type Connection,
} from '@xyflow/react';
import type { OLT, ONU, Splitter, ODF, FiberSegment, SplitterRatio, XYPosition, PONPort } from '../types/network';
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
  updateOLT: (id: string, patch: Partial<OLT>) => void;
  updateONU: (id: string, patch: Partial<ONU>) => void;
  updateSplitter: (id: string, patch: Partial<Splitter>) => void;
  updateFiber: (id: string, patch: Partial<FiberSegment>) => void;
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

function makeOLTNode(olt: OLT): Node {
  return { id: olt.id, type: 'olt', position: olt.position, data: olt };
}
function makeONUNode(onu: ONU): Node {
  return { id: onu.id, type: 'onu', position: onu.position, data: onu };
}
function makeSplitterNode(s: Splitter): Node {
  return { id: s.id, type: 'splitter', position: s.position, data: s };
}
function makeODFNode(o: ODF): Node {
  return { id: o.id, type: 'odf', position: o.position, data: o };
}
function makeFiberEdge(f: FiberSegment): Edge {
  return {
    id: f.id,
    source: f.sourceId,
    sourceHandle: f.sourceHandle || null,
    target: f.targetId,
    targetHandle: f.targetHandle || null,
    type: 'fiber',
    data: f,
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
  dbaProfiles: { ...initialDBAProfiles },
  selectedNodeId: null,

  onNodesChange: (changes) => {
    // Only update nodes array — do NOT sync to domain objects here to avoid infinite loops.
    // Positions are read from nodes[] at export time.
    set(s => ({ nodes: applyNodeChanges(changes, s.nodes) }));
  },

  onEdgesChange: (changes) => {
    set(s => ({ edges: applyEdgeChanges(changes, s.edges) }));
    changes.forEach(c => {
      if (c.type === 'remove') {
        set(s => {
          const fibers = { ...s.fibers };
          delete fibers[c.id];
          return { fibers };
        });
      }
    });
  },

  onConnect: (connection) => {
    const id = generateId('fiber');
    const fiber: FiberSegment = {
      id,
      sourceId: connection.source,
      sourceHandle: connection.sourceHandle || '',
      targetId: connection.target,
      targetHandle: connection.targetHandle || '',
      lengthKm: 1,
      attenuationCoeff_dBpkm: 0.35,
      connectorCount: 2,
      spliceCount: 0,
      connectorLoss_dB: 0.5,
      spliceLoss_dB: 0.1,
    };
    set(s => ({
      fibers: { ...s.fibers, [id]: fiber },
      edges: [...s.edges, makeFiberEdge(fiber)],
    }));
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
    const nodes = s.nodes.filter(n => n.id !== id);
    const edgesToRemove = s.edges.filter(e => e.source === id || e.target === id).map(e => e.id);
    const edges = s.edges.filter(e => e.source !== id && e.target !== id);
    const fibers = { ...s.fibers };
    edgesToRemove.forEach(eid => delete fibers[eid]);
    return { olts, onus, splitters, odfs, nodes, edges, fibers };
  }),

  removeEdge: (id) => set(s => {
    const fibers = { ...s.fibers }; delete fibers[id];
    return { fibers, edges: s.edges.filter(e => e.id !== id) };
  }),

  loadProject: (file) => {
    const olts: Record<string, OLT> = {};
    const onus: Record<string, ONU> = {};
    const splitters: Record<string, Splitter> = {};
    const odfs: Record<string, ODF> = {};
    const fibers: Record<string, FiberSegment> = {};
    const dbaProfiles: Record<string, DBAProfile> = { ...initialDBAProfiles };

    file.olts.forEach(o => { olts[o.id] = o; });
    file.onus.forEach(o => { onus[o.id] = o; });
    file.splitters.forEach(s => { splitters[s.id] = s; });
    file.odfs.forEach(o => { odfs[o.id] = o; });
    file.fibers.forEach(f => { fibers[f.id] = f; });
    file.dbaProfiles?.forEach(d => { dbaProfiles[d.id] = d; });

    const nodes = [
      ...file.olts.map(makeOLTNode),
      ...file.onus.map(makeONUNode),
      ...file.splitters.map(makeSplitterNode),
      ...file.odfs.map(makeODFNode),
    ];
    const edges = file.fibers.map(makeFiberEdge);

    set({ olts, onus, splitters, odfs, fibers, dbaProfiles, nodes, edges, selectedNodeId: null });
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
      dbaProfiles: Object.values(s.dbaProfiles),
      viewport: { x: 0, y: 0, zoom: 1 },
    };
  },

  reset: () => {
    oltCount = 0; onuCount = 0; splitterCount = 0; odfCount = 0;
    set({ nodes: [], edges: [], olts: {}, onus: {}, splitters: {}, odfs: {}, fibers: {}, selectedNodeId: null, dbaProfiles: { ...initialDBAProfiles } });
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
