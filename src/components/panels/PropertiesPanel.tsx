import { useTopologyStore } from '../../store/topologyStore';
import { ONUProperties } from './ONUProperties';
import { OLTProperties } from './OLTProperties';
import { FiberProperties } from './FiberProperties';

export function PropertiesPanel() {
  const selectedId = useTopologyStore(s => s.selectedNodeId);
  const onus = useTopologyStore(s => s.onus);
  const olts = useTopologyStore(s => s.olts);
  const splitters = useTopologyStore(s => s.splitters);
  const fibers = useTopologyStore(s => s.fibers);

  if (!selectedId) {
    return (
      <div style={{ padding: 16, color: '#475569', fontSize: 11 }}>
        <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 8 }}>Properties</div>
        <div>Click a device or fiber on the canvas to view and edit its properties.</div>
        <div style={{ marginTop: 16, color: '#334155', fontSize: 10 }}>
          <div style={{ marginBottom: 4 }}>Keyboard shortcuts:</div>
          <div>  Delete — remove selected</div>
          <div>  Ctrl+S — save project</div>
          <div>  Space — pause/resume sim</div>
        </div>
      </div>
    );
  }

  if (onus[selectedId]) return <ONUProperties onuId={selectedId} />;
  if (olts[selectedId]) return <OLTProperties oltId={selectedId} />;
  if (fibers[selectedId]) return <FiberProperties fiberId={selectedId} />;
  if (splitters[selectedId]) {
    const s = splitters[selectedId];
    return (
      <div style={{ padding: 16 }}>
        <div style={{ color: '#a78bfa', fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
        <Row label="Ratio" value={`1:${s.ratio}`} />
        <Row label="Insertion Loss" value={`${s.insertionLoss_dB} dB`} />
      </div>
    );
  }

  return <div style={{ padding: 16, color: '#475569', fontSize: 11 }}>Unknown device selected.</div>;
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e293b', fontSize: 11 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{value}</span>
    </div>
  );
}
