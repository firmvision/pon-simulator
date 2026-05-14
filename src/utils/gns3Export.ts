/**
 * GNS3 .gns3 project file exporter
 * Revision 9 / GNS3 2.2.x format
 */
import type { OLT, ONU, Splitter, ODF, EndDevice, FiberSegment, EthernetLink } from '../types/network';

// ── helpers ──────────────────────────────────────────────────────────────────

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function labelStyle() {
  return 'font-family: TypeWriter;font-size: 10.0;font-weight: bold;fill: #000000;fill-opacity: 1.0;';
}

function makeLabel(text: string, x = 0, y = -25) {
  return { rotation: 0, style: labelStyle(), text, x, y };
}

// ── GNS3 type shapes ─────────────────────────────────────────────────────────

interface GNS3NodeDef {
  compute_id: string;
  console: null;
  console_http_path: string;
  console_http_port: number;
  console_type: null;
  custom_adapters: unknown[];
  first_port_name: null | string;
  height: number;
  label: ReturnType<typeof makeLabel>;
  locked: boolean;
  name: string;
  node_id: string;
  node_type: string;
  port_name_format: string;
  port_segment_size: number;
  properties: Record<string, unknown>;
  symbol: string;
  width: number;
  x: number;
  y: number;
  z: number;
}

interface GNS3LinkEndpoint {
  adapter_number: number;
  label: ReturnType<typeof makeLabel>;
  node_id: string;
  port_number: number;
}

interface GNS3Link {
  link_id: string;
  link_type: 'ethernet';
  nodes: [GNS3LinkEndpoint, GNS3LinkEndpoint];
  suspend: false;
  filters: Record<string, unknown>;
  capturing: boolean;
}

interface GNS3Drawing {
  drawing_id: string;
  locked: boolean;
  rotation: number;
  svg: string;
  x: number;
  y: number;
  z: number;
}

interface GNS3Project {
  type: 'topology';
  revision: 9;
  version: string;
  name: string;
  project_id: string;
  supplier: null;
  topology: {
    nodes: GNS3NodeDef[];
    links: GNS3Link[];
    computes: unknown[];
    drawings: GNS3Drawing[];
  };
  variables: null;
  zoom: number;
  show_grid: boolean;
  show_interface_labels: boolean;
  show_layers: boolean;
  snap_to_grid: boolean;
}

// ── per-node port counters ────────────────────────────────────────────────────

class PortTracker {
  private counts = new Map<string, number>();
  next(nodeId: string): number {
    const n = this.counts.get(nodeId) ?? 0;
    this.counts.set(nodeId, n + 1);
    return n;
  }
}

// ── node factory ─────────────────────────────────────────────────────────────

function switchNode(id: string, name: string, symbol: string, x: number, y: number): GNS3NodeDef {
  return {
    compute_id: 'local',
    console: null,
    console_http_path: '/',
    console_http_port: 80,
    console_type: null,
    custom_adapters: [],
    first_port_name: null,
    height: 45,
    label: makeLabel(name),
    locked: false,
    name,
    node_id: id,
    node_type: 'ethernet_switch',
    port_name_format: 'Ethernet{0}',
    port_segment_size: 0,
    properties: { ports_mapping: [] },
    symbol,
    width: 45,
    x: Math.round(x),
    y: Math.round(y),
    z: 1,
  };
}

function vpcsNode(id: string, name: string, ip: string, x: number, y: number): GNS3NodeDef {
  return {
    compute_id: 'local',
    console: null,
    console_http_path: '/',
    console_http_port: 80,
    console_type: null,
    custom_adapters: [],
    first_port_name: null,
    height: 45,
    label: makeLabel(name),
    locked: false,
    name,
    node_id: id,
    node_type: 'vpcs',
    port_name_format: 'Ethernet{0}',
    port_segment_size: 0,
    properties: { startup_script: `ip ${ip}/24 192.168.1.1\n` },
    symbol: ':/symbols/computer.svg',
    width: 45,
    x: Math.round(x),
    y: Math.round(y),
    z: 1,
  };
}

function cloudNode(id: string, name: string, x: number, y: number): GNS3NodeDef {
  return {
    compute_id: 'local',
    console: null,
    console_http_path: '/',
    console_http_port: 80,
    console_type: null,
    custom_adapters: [],
    first_port_name: null,
    height: 45,
    label: makeLabel(name),
    locked: false,
    name,
    node_id: id,
    node_type: 'cloud',
    port_name_format: 'nat{0}',
    port_segment_size: 0,
    properties: {},
    symbol: ':/symbols/cloud.svg',
    width: 45,
    x: Math.round(x),
    y: Math.round(y),
    z: 1,
  };
}

// ── legend SVG drawing ────────────────────────────────────────────────────────

function makeLegend(): GNS3Drawing {
  const svg = `<svg width="200" height="160">
<rect x="0" y="0" width="200" height="160" fill="#1e293b" stroke="#334155" stroke-width="1" rx="4"/>
<text x="10" y="18" fill="#94a3b8" font-size="10" font-weight="bold">PON Network Legend</text>
<rect x="10" y="28" width="12" height="12" fill="#1d4ed8"/>
<text x="28" y="39" fill="#60a5fa" font-size="9">OLT (multilayer_switch)</text>
<rect x="10" y="46" width="12" height="12" fill="#22c55e"/>
<text x="28" y="57" fill="#4ade80" font-size="9">ONU (ethernet_switch)</text>
<rect x="10" y="64" width="12" height="12" fill="#7c3aed"/>
<text x="28" y="75" fill="#a78bfa" font-size="9">Splitter (hub)</text>
<rect x="10" y="82" width="12" height="12" fill="#78716c"/>
<text x="28" y="93" fill="#a8a29e" font-size="9">ODF (ethernet_switch)</text>
<rect x="10" y="100" width="12" height="12" fill="#0891b2"/>
<text x="28" y="111" fill="#22d3ee" font-size="9">PC / Server (VPCS)</text>
<rect x="10" y="118" width="12" height="12" fill="#d97706"/>
<text x="28" y="129" fill="#fbbf24" font-size="9">Router (ethernet_switch)</text>
<rect x="10" y="136" width="12" height="12" fill="#64748b"/>
<text x="28" y="147" fill="#94a3b8" font-size="9">Cloud (cloud node)</text>
<text x="10" y="158" fill="#475569" font-size="8">Generated by PON Simulator</text>
</svg>`;
  return {
    drawing_id: uuidv4(),
    locked: true,
    rotation: 0,
    svg,
    x: -300,
    y: -80,
    z: 0,
  };
}

// ── main export function ──────────────────────────────────────────────────────

export interface TopologySnapshot {
  olts: OLT[];
  onus: ONU[];
  splitters: Splitter[];
  odfs: ODF[];
  endDevices: EndDevice[];
  fibers: FiberSegment[];
  ethernetLinks: EthernetLink[];
}

export function exportToGNS3(snap: TopologySnapshot, projectName = 'pon-topology'): GNS3Project {
  const ports = new PortTracker();
  const gns3Nodes: GNS3NodeDef[] = [];

  // We need a GNS3 node_id for each topology node.
  // Use a deterministic UUID-ish id derived from the node id.
  // GNS3 requires proper UUIDs so we generate fresh ones keyed by topology id.
  const idMap = new Map<string, string>();
  const gnsId = (topId: string) => {
    if (!idMap.has(topId)) idMap.set(topId, uuidv4());
    return idMap.get(topId)!;
  };

  // OLTs → multilayer_switch
  for (const olt of snap.olts) {
    gns3Nodes.push(switchNode(
      gnsId(olt.id),
      olt.label,
      ':/symbols/multilayer_switch.svg',
      olt.position.x,
      olt.position.y,
    ));
  }

  // ONUs → ethernet_switch (modem-style)
  for (const onu of snap.onus) {
    gns3Nodes.push(switchNode(
      gnsId(onu.id),
      onu.label,
      ':/symbols/modem.svg',
      onu.position.x,
      onu.position.y,
    ));
  }

  // Splitters → ethernet_switch (hub symbol)
  for (const spl of snap.splitters) {
    gns3Nodes.push(switchNode(
      gnsId(spl.id),
      spl.label,
      ':/symbols/hub.svg',
      spl.position.x,
      spl.position.y,
    ));
  }

  // ODFs → ethernet_switch (patch_panel symbol)
  for (const odf of snap.odfs) {
    gns3Nodes.push(switchNode(
      gnsId(odf.id),
      odf.label,
      ':/symbols/patch_panel.svg',
      odf.position.x,
      odf.position.y,
    ));
  }

  // End devices
  for (const dev of snap.endDevices) {
    const gid = gnsId(dev.id);
    if (dev.deviceType === 'cloud') {
      gns3Nodes.push(cloudNode(gid, dev.label, dev.position.x, dev.position.y));
    } else if (dev.deviceType === 'router') {
      gns3Nodes.push(switchNode(gid, dev.label, ':/symbols/router.svg', dev.position.x, dev.position.y));
    } else {
      // pc, laptop, server, phone → VPCS
      gns3Nodes.push(vpcsNode(gid, dev.label, dev.ipAddress, dev.position.x, dev.position.y));
    }
  }

  // ── Links ───────────────────────────────────────────────────────────────────
  const gns3Links: GNS3Link[] = [];

  const makeLink = (srcTopId: string, tgtTopId: string): GNS3Link => {
    const srcId = gnsId(srcTopId);
    const tgtId = gnsId(tgtTopId);
    const srcPort = ports.next(srcId);
    const tgtPort = ports.next(tgtId);
    return {
      link_id: uuidv4(),
      link_type: 'ethernet',
      nodes: [
        {
          adapter_number: 0,
          label: makeLabel(`e${srcPort}`, 0, 0),
          node_id: srcId,
          port_number: srcPort,
        },
        {
          adapter_number: 0,
          label: makeLabel(`e${tgtPort}`, 0, 0),
          node_id: tgtId,
          port_number: tgtPort,
        },
      ],
      suspend: false,
      filters: {},
      capturing: false,
    };
  };

  for (const fiber of snap.fibers) {
    // Only create link if both ends have a GNS3 node
    const srcKnown = snap.olts.some(o => o.id === fiber.sourceId)
      || snap.onus.some(o => o.id === fiber.sourceId)
      || snap.splitters.some(s => s.id === fiber.sourceId)
      || snap.odfs.some(o => o.id === fiber.sourceId);
    const tgtKnown = snap.olts.some(o => o.id === fiber.targetId)
      || snap.onus.some(o => o.id === fiber.targetId)
      || snap.splitters.some(s => s.id === fiber.targetId)
      || snap.odfs.some(o => o.id === fiber.targetId);
    if (srcKnown && tgtKnown) {
      gns3Links.push(makeLink(fiber.sourceId, fiber.targetId));
    }
  }

  for (const eth of snap.ethernetLinks) {
    gns3Links.push(makeLink(eth.sourceId, eth.targetId));
  }

  return {
    type: 'topology',
    revision: 9,
    version: '2.2.47',
    name: projectName,
    project_id: uuidv4(),
    supplier: null,
    topology: {
      nodes: gns3Nodes,
      links: gns3Links,
      computes: [],
      drawings: [makeLegend()],
    },
    variables: null,
    zoom: 1.0,
    show_grid: false,
    show_interface_labels: true,
    show_layers: false,
    snap_to_grid: false,
  };
}

/** Trigger a file download of the .gns3 JSON */
export function downloadGNS3(snap: TopologySnapshot, name = 'pon-topology') {
  const project = exportToGNS3(snap, name);
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.gns3`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
