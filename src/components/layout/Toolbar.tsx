import { useTopologyStore } from '../../store/topologyStore';
import { useSimulationStore } from '../../store/simulationStore';
import { useUIStore } from '../../store/uiStore';
import { simEngine } from '../../simulation/engine';
import { saveProjectToFile, loadProjectFromFile } from '../../utils/persistence';
import { SAMPLE_TOPOLOGIES } from '../../data/sampleTopologies';
import { downloadGNS3 } from '../../utils/gns3Export';

const DEVICES = [
  { type: 'olt',         label: 'OLT',    color: '#1d4ed8', desc: 'Optical Line Terminal' },
  { type: 'onu',         label: 'ONU',    color: '#22c55e', desc: 'Optical Network Unit' },
  { type: 'splitter-2',  label: '1:2',    color: '#7c3aed', desc: '1:2 Passive Splitter' },
  { type: 'splitter-4',  label: '1:4',    color: '#7c3aed', desc: '1:4 Passive Splitter' },
  { type: 'splitter-8',  label: '1:8',    color: '#7c3aed', desc: '1:8 Passive Splitter' },
  { type: 'splitter-16', label: '1:16',   color: '#7c3aed', desc: '1:16 Passive Splitter' },
  { type: 'splitter-32', label: '1:32',   color: '#7c3aed', desc: '1:32 Passive Splitter' },
  { type: 'odf',         label: 'ODF',    color: '#78716c', desc: 'Optical Distribution Frame' },
];
const END_DEVICES = [
  { type: 'dev-pc',          label: '🖥 PC',         color: '#0891b2' },
  { type: 'dev-laptop',      label: '💻 Laptop',     color: '#0891b2' },
  { type: 'dev-router',      label: '📶 Router',     color: '#d97706' },
  { type: 'dev-server',      label: '🗄 Server',     color: '#7c3aed' },
  { type: 'dev-cloud',       label: '☁️ Cloud',      color: '#64748b' },
  { type: 'dev-phone',       label: '📱 Phone',      color: '#0891b2' },
  { type: 'dev-wifi-ap',     label: '📡 WiFi AP',    color: '#10b981' },
  { type: 'dev-wifi-client', label: '📲 WiFi Client',color: '#06b6d4' },
];

export function Toolbar() {
  const { running, speedMultiplier, setSpeed } = useSimulationStore();
  const { exportProject, loadProject, reset, removeNode, selectedNodeId, selectedEdgeId, removeEdge, setSelectedEdge } = useTopologyStore();
  useUIStore();

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/pon-device', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleStart = () => {
    useSimulationStore.getState().startSimulation();
    simEngine.start();
  };

  const handlePause = () => {
    useSimulationStore.getState().pauseSimulation();
    simEngine.pause();
  };

  const handleReset = () => {
    simEngine.reset();
  };

  const handleSave = () => {
    const project = exportProject();
    saveProjectToFile(project);
  };

  const handleLoad = async () => {
    try {
      const project = await loadProjectFromFile();
      reset();
      loadProject(project);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNew = () => {
    if (confirm('Start a new project? Unsaved changes will be lost.')) {
      simEngine.reset();
      reset();
    }
  };

  const handleExportGNS3 = () => {
    const s = useTopologyStore.getState();
    downloadGNS3({
      olts: Object.values(s.olts),
      onus: Object.values(s.onus),
      splitters: Object.values(s.splitters),
      odfs: Object.values(s.odfs),
      endDevices: Object.values(s.endDevices),
      fibers: Object.values(s.fibers),
      ethernetLinks: Object.values(s.ethernetLinks),
    });
  };

  const loadSample = (idx: number) => {
    simEngine.reset();
    reset();
    loadProject(SAMPLE_TOPOLOGIES[idx].data);
  };

  const btn = (label: string, onClick: () => void, color: string, disabled = false) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '4px 10px', background: disabled ? '#1e293b' : color + '22',
      border: `1px solid ${color}55`, borderRadius: 4, color: disabled ? '#334155' : color,
      cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 10, fontFamily: 'monospace',
    }}>{label}</button>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px',
      background: '#0a0f1e', borderBottom: '1px solid #1e293b', height: '100%',
      overflowX: 'auto',
    }}>
      {/* PON Device Palette */}
      <div style={{ display: 'flex', gap: 3, marginRight: 4, flexShrink: 0 }}>
        {DEVICES.map(d => (
          <div key={d.type} draggable onDragStart={e => onDragStart(e, d.type)} title={d.desc}
            style={{ padding: '3px 7px', background: d.color + '22', border: `1px solid ${d.color}55`,
              borderRadius: 4, color: d.color, fontSize: 9, cursor: 'grab', userSelect: 'none', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
            {d.label}
          </div>
        ))}
      </div>

      <div style={{ width: 1, height: 20, background: '#1e293b', flexShrink: 0 }} />

      {/* End Device Palette */}
      <div style={{ display: 'flex', gap: 3, marginRight: 4, flexShrink: 0 }}>
        {END_DEVICES.map(d => (
          <div key={d.type} draggable onDragStart={e => onDragStart(e, d.type)} title={`Drag to add ${d.label}`}
            style={{ padding: '3px 7px', background: d.color + '18', border: `1px dashed ${d.color}55`,
              borderRadius: 4, color: d.color, fontSize: 9, cursor: 'grab', userSelect: 'none', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
            {d.label}
          </div>
        ))}
      </div>

      <div style={{ width: 1, height: 24, background: '#1e293b', flexShrink: 0 }} />

      {/* File Ops */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {btn('New', handleNew, '#94a3b8')}
        {btn('Open', handleLoad, '#94a3b8')}
        {btn('Save', handleSave, '#94a3b8')}
        {btn('GNS3↗', handleExportGNS3, '#f59e0b')}
      </div>

      {/* Examples dropdown (static buttons) */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {SAMPLE_TOPOLOGIES.map((t, i) => (
          <button key={t.id} onClick={() => loadSample(i)} style={{
            padding: '4px 8px', background: '#0f2744', border: '1px solid #1d4ed855',
            borderRadius: 4, color: '#60a5fa', fontSize: 9, cursor: 'pointer', fontFamily: 'monospace',
          }}>{t.name}</button>
        ))}
      </div>

      <div style={{ width: 1, height: 24, background: '#1e293b', flexShrink: 0 }} />

      {/* Delete selected node */}
      {selectedNodeId && (
        <>
          <div style={{ width: 1, height: 20, background: '#1e293b', flexShrink: 0 }} />
          {btn('🗑 Delete', () => removeNode(selectedNodeId), '#ef4444')}
        </>
      )}
      {/* Delete selected cable/edge */}
      {selectedEdgeId && btn('✂ Del Cable', () => { removeEdge(selectedEdgeId); setSelectedEdge(null); }, '#f97316')}

      {/* Simulation controls */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        {running
          ? btn('⏸ Pause', handlePause, '#f59e0b')
          : btn('▶ Start', handleStart, '#22c55e')}
        {btn('⏹ Reset', handleReset, '#ef4444')}

        {/* Speed selector */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <span style={{ color: '#475569', fontSize: 9 }}>Speed:</span>
          {[0.1, 0.25, 1, 5, 10, 100].map(s => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              padding: '2px 6px', background: speedMultiplier === s ? '#1d4ed8' : 'transparent',
              border: `1px solid ${speedMultiplier === s ? '#3b82f6' : '#1e293b'}`,
              borderRadius: 3, color: speedMultiplier === s ? '#bfdbfe' : '#475569',
              cursor: 'pointer', fontSize: 9, fontFamily: 'monospace',
            }}>{s}x</button>
          ))}
        </div>
      </div>
    </div>
  );
}
