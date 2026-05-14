import { useTopologyStore } from '../../store/topologyStore';
import { ONUProperties } from './ONUProperties';
import { OLTProperties } from './OLTProperties';
import { FiberProperties } from './FiberProperties';
import { EndDeviceProperties } from './EndDeviceProperties';

export function PropertiesPanel() {
  const selectedId   = useTopologyStore(s => s.selectedNodeId);
  const selectedEdgeId = useTopologyStore(s => s.selectedEdgeId);
  const onus         = useTopologyStore(s => s.onus);
  const olts         = useTopologyStore(s => s.olts);
  const splitters    = useTopologyStore(s => s.splitters);
  const odfs         = useTopologyStore(s => s.odfs);
  const fibers       = useTopologyStore(s => s.fibers);
  const ethernetLinks = useTopologyStore(s => s.ethernetLinks);
  const endDevices   = useTopologyStore(s => s.endDevices);

  // ── Cable / edge selected ──────────────────────────────────────────────────
  if (selectedEdgeId) {
    if (fibers[selectedEdgeId]) return <FiberProperties fiberId={selectedEdgeId} />;

    if (ethernetLinks[selectedEdgeId]) {
      const link = ethernetLinks[selectedEdgeId];
      return (
        <div style={{ padding: 12 }}>
          <div style={{ color: '#0891b2', fontWeight: 700, fontSize: 12, marginBottom: 10 }}>
            🔗 Ethernet Link
          </div>
          <Row label="Speed"  value={`${link.speedMbps} Mbps`} />
          <Row label="Source" value={link.sourceId.slice(0, 12) + '…'} />
          <Row label="Target" value={link.targetId.slice(0, 12) + '…'} />
          <div style={{ marginTop: 10, color: '#334155', fontSize: 10 }}>
            Click <strong style={{ color: '#f97316' }}>✂ Del Cable</strong> in the toolbar to remove this link.
          </div>
        </div>
      );
    }

    // Wireless edge — no domain record, just show info
    return (
      <div style={{ padding: 12 }}>
        <div style={{ color: '#10b981', fontWeight: 700, fontSize: 12, marginBottom: 10 }}>
          〜 Wireless Link
        </div>
        <div style={{ color: '#64748b', fontSize: 11 }}>
          This is a WiFi association between an Access Point and a wireless client.
        </div>
        <div style={{ marginTop: 10, color: '#334155', fontSize: 10 }}>
          Click <strong style={{ color: '#f97316' }}>✂ Del Cable</strong> in the toolbar to remove this link.
        </div>
      </div>
    );
  }

  // ── Nothing selected ──────────────────────────────────────────────────────
  if (!selectedId) {
    return (
      <div style={{ padding: 16, color: '#475569', fontSize: 11 }}>
        <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 8 }}>Properties</div>
        <div>Click a device or cable on the canvas to view and edit its properties.</div>
        <div style={{ marginTop: 16, color: '#334155', fontSize: 10, lineHeight: 1.8 }}>
          <div style={{ marginBottom: 4, color: '#475569', fontWeight: 600 }}>Keyboard shortcuts:</div>
          <div>Delete — remove selected node</div>
          <div>Ctrl+S — save project</div>
          <div>Space — pause / resume simulation</div>
        </div>
        <div style={{ marginTop: 16, color: '#1e293b', fontSize: 10, lineHeight: 1.8 }}>
          <div style={{ marginBottom: 4, color: '#475569', fontWeight: 600 }}>Tips:</div>
          <div style={{ color: '#334155' }}>• Drag devices from the toolbar onto the canvas</div>
          <div style={{ color: '#334155' }}>• Connect handles by dragging from one node to another</div>
          <div style={{ color: '#334155' }}>• Select a cable to see its properties here</div>
        </div>
      </div>
    );
  }

  // ── Node selected ─────────────────────────────────────────────────────────
  if (onus[selectedId])        return <ONUProperties onuId={selectedId} />;
  if (olts[selectedId])        return <OLTProperties oltId={selectedId} />;
  if (endDevices[selectedId])  return <EndDeviceProperties deviceId={selectedId} />;
  if (fibers[selectedId])      return <FiberProperties fiberId={selectedId} />;

  if (splitters[selectedId]) {
    const s = splitters[selectedId];
    return (
      <div style={{ padding: 12 }}>
        <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
          ◆ {s.label}
        </div>
        <Row label="Ratio"          value={`1:${s.ratio}`} />
        <Row label="Insertion Loss" value={`${s.insertionLoss_dB} dB`} />
        <Row label="Output Ports"   value={`${s.ratio}`} />
        <div style={{ marginTop: 10, padding: 8, background: '#0a0f1e', borderRadius: 4, border: '1px solid #1e293b', color: '#64748b', fontSize: 10 }}>
          Each output port gets a {(10 * Math.log10(s.ratio)).toFixed(1)} dB theoretical split loss.
          Actual insertion loss includes manufacturing overhead ({s.insertionLoss_dB} dB total).
        </div>
      </div>
    );
  }

  if (odfs[selectedId]) {
    const o = odfs[selectedId];
    return (
      <div style={{ padding: 12 }}>
        <div style={{ color: '#78716c', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
          🗂 {o.label}
        </div>
        <Row label="Port Count"     value={`${o.portCount}`} />
        <Row label="Connector Loss" value={`${o.connectorLoss_dB} dB/port`} />
        <div style={{ marginTop: 10, color: '#475569', fontSize: 10 }}>
          Optical Distribution Frame — patch panel for fiber management.
          Each connector adds {o.connectorLoss_dB} dB insertion loss.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, color: '#475569', fontSize: 11 }}>
      Selected element has no property editor.
    </div>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '4px 0', borderBottom: '1px solid #1e293b', fontSize: 11,
    }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}
