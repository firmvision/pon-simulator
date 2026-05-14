import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { useTopologyStore } from '../../store/topologyStore';
import { useUIStore } from '../../store/uiStore';
import { simEngine } from '../../simulation/engine';
import { saveProjectToFile, loadProjectFromFile } from '../../utils/persistence';
import { SAMPLE_TOPOLOGIES } from '../../data/sampleTopologies';
import { TopologyCanvas } from '../canvas/TopologyCanvas';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { CliTerminal } from '../terminal/CliTerminal';
import { LearningPanel } from '../learning/LearningPanel';
import { EventLog } from '../log/EventLog';
import { BandwidthChart } from '../charts/BandwidthChart';
import { PowerBudgetChart } from '../charts/PowerBudgetChart';
import { PacketCapture } from '../panels/PacketCapture';
import { InstallPrompt } from '../pwa/InstallPrompt';

type MobileTab = 'canvas' | 'properties' | 'terminal' | 'learn' | 'log' | 'capture';

const DEVICES = [
  { type: 'olt',         label: 'OLT',     color: '#1d4ed8' },
  { type: 'onu',         label: 'ONU',     color: '#22c55e' },
  { type: 'splitter-8',  label: '1:8',     color: '#7c3aed' },
  { type: 'splitter-16', label: '1:16',    color: '#7c3aed' },
  { type: 'splitter-32', label: '1:32',    color: '#7c3aed' },
  { type: 'odf',         label: 'ODF',     color: '#78716c' },
  { type: 'dev-pc',      label: '🖥 PC',   color: '#0891b2' },
  { type: 'dev-router',  label: '📶 Router',color: '#d97706' },
  { type: 'dev-server',  label: '🗄 Server',color: '#7c3aed' },
  { type: 'dev-cloud',   label: '☁️ Cloud', color: '#64748b' },
];

export function MobileShell() {
  const [activeTab, setActiveTab] = useState<MobileTab>('canvas');
  const [showDevices, setShowDevices] = useState(false);
  const [showSamples, setShowSamples] = useState(false);

  const { running, speedMultiplier, setSpeed } = useSimulationStore();
  const { exportProject, loadProject, reset, removeNode, selectedNodeId, addOLT, addONU, addSplitter, addODF, addEndDevice } = useTopologyStore();
  const selectedId = useTopologyStore(s => s.selectedNodeId);
  const onus = useTopologyStore(s => s.onus);
  const selectedOnu = selectedId && onus[selectedId] ? selectedId : null;
  const { activeBottomPanel, setActiveBottomPanel } = useUIStore();

  const handleStart = () => { useSimulationStore.getState().startSimulation(); simEngine.start(); };
  const handlePause = () => { useSimulationStore.getState().pauseSimulation(); simEngine.pause(); };
  const handleReset = () => { simEngine.reset(); useTopologyStore.getState().reset(); };

  const handleSave = () => saveProjectToFile(exportProject());
  const handleLoad = async () => {
    try { const p = await loadProjectFromFile(); reset(); loadProject(p); } catch {}
  };

  const addDevice = (type: string) => {
    // Place near centre of canvas with a small random offset so stacked items don't overlap
    const x = 200 + Math.random() * 200;
    const y = 150 + Math.random() * 150;
    if (type === 'olt') addOLT({ x, y });
    else if (type === 'onu') addONU({ x, y });
    else if (type === 'odf') addODF({ x, y });
    else if (type === 'splitter-8') addSplitter(8, { x, y });
    else if (type === 'splitter-16') addSplitter(16, { x, y });
    else if (type === 'splitter-32') addSplitter(32, { x, y });
    else if (type.startsWith('dev-')) addEndDevice(type.replace('dev-', '') as import('../../types/network').EndDeviceType, { x, y });
    setShowDevices(false);
    setActiveTab('canvas');
  };

  const loadSample = (idx: number) => {
    simEngine.reset();
    useTopologyStore.getState().reset();
    loadProject(SAMPLE_TOPOLOGIES[idx].data);
    setShowSamples(false);
    setActiveTab('canvas');
  };

  const TAB_H = 56;
  const TOP_H = 44;

  const tabBtn = (id: MobileTab, icon: string, label: string) => (
    <button
      key={id}
      onClick={() => setActiveTab(id)}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 2, background: 'none', border: 'none',
        borderTop: `2px solid ${activeTab === id ? '#3b82f6' : 'transparent'}`,
        color: activeTab === id ? '#3b82f6' : '#475569',
        cursor: 'pointer', paddingBottom: 4, fontSize: 9, fontFamily: 'monospace',
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
      {label}
    </button>
  );

  const simBtn = (label: string, onClick: () => void, color: string, disabled = false) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '5px 10px', background: color + '22', border: `1px solid ${color}55`,
      borderRadius: 5, color: disabled ? '#334155' : color,
      cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'monospace',
      whiteSpace: 'nowrap',
    }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#0f172a', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{
        height: TOP_H, flexShrink: 0, background: '#0a0f1e',
        borderBottom: '1px solid #1e293b', display: 'flex',
        alignItems: 'center', gap: 6, padding: '0 8px', overflowX: 'auto',
      }}>
        <span style={{ color: '#3b82f6', fontFamily: 'monospace', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', marginRight: 4 }}>
          📡 PON Sim
        </span>

        {/* Sim controls */}
        {running
          ? simBtn('⏸', handlePause, '#f59e0b')
          : simBtn('▶', handleStart, '#22c55e')}
        {simBtn('⏹', handleReset, '#ef4444')}

        {/* Speed */}
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          {[1, 10, 100].map(s => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              padding: '3px 6px', background: speedMultiplier === s ? '#1d4ed8' : 'transparent',
              border: `1px solid ${speedMultiplier === s ? '#3b82f6' : '#1e293b'}`,
              borderRadius: 3, color: speedMultiplier === s ? '#bfdbfe' : '#475569',
              cursor: 'pointer', fontSize: 9, fontFamily: 'monospace',
            }}>{s}x</button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: '#1e293b', flexShrink: 0 }} />

        {/* File + sample */}
        {simBtn('💾', handleSave, '#94a3b8')}
        {simBtn('📂', handleLoad, '#94a3b8')}
        {selectedNodeId && simBtn('🗑', () => removeNode(selectedNodeId), '#ef4444')}
        <button onClick={() => { setShowSamples(v => !v); setShowDevices(false); }} style={{
          padding: '5px 8px', background: '#0f2744', border: '1px solid #1d4ed855',
          borderRadius: 5, color: '#60a5fa', cursor: 'pointer', fontSize: 11,
        }}>📋</button>
        <button onClick={() => { setShowDevices(v => !v); setShowSamples(false); }} style={{
          padding: '5px 8px', background: '#1e293b', border: '1px solid #334155',
          borderRadius: 5, color: '#94a3b8', cursor: 'pointer', fontSize: 11,
        }}>＋</button>
      </div>

      {/* ── Sample topology picker (dropdown) ── */}
      {showSamples && (
        <div style={{
          position: 'absolute', top: TOP_H, left: 0, right: 0, zIndex: 200,
          background: '#0a0f1e', borderBottom: '1px solid #1e293b',
          display: 'flex', flexWrap: 'wrap', gap: 6, padding: 10,
        }}>
          {SAMPLE_TOPOLOGIES.map((t, i) => (
            <button key={t.id} onClick={() => loadSample(i)} style={{
              padding: '6px 10px', background: '#0f2744', border: '1px solid #1d4ed855',
              borderRadius: 5, color: '#60a5fa', fontSize: 10, cursor: 'pointer', fontFamily: 'monospace',
            }}>{t.name}</button>
          ))}
        </div>
      )}

      {/* ── Device palette picker (dropdown) ── */}
      {showDevices && (
        <div style={{
          position: 'absolute', top: TOP_H, left: 0, right: 0, zIndex: 200,
          background: '#0a0f1e', borderBottom: '1px solid #1e293b',
          display: 'flex', flexWrap: 'wrap', gap: 6, padding: 10,
        }}>
          <span style={{ width: '100%', color: '#475569', fontSize: 9, fontFamily: 'monospace' }}>
            Tap a device to add it to the canvas:
          </span>
          {DEVICES.map(d => (
            <button key={d.type} onClick={() => addDevice(d.type)} style={{
              padding: '6px 12px', background: d.color + '22',
              border: `1px solid ${d.color}55`, borderRadius: 5,
              color: d.color, fontSize: 11, cursor: 'pointer', fontFamily: 'monospace',
            }}>{d.label}</button>
          ))}
        </div>
      )}

      {/* ── Main content area ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
        onClick={() => { setShowDevices(false); setShowSamples(false); }}
      >
        {/* Canvas always mounted so React Flow state is preserved */}
        <div style={{ position: 'absolute', inset: 0, display: activeTab === 'canvas' ? 'block' : 'none' }}>
          <TopologyCanvas />
        </div>

        {activeTab === 'properties' && (
          <div style={{ height: '100%', overflowY: 'auto' }}>
            <PropertiesPanel />
          </div>
        )}

        {activeTab === 'terminal' && (
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <CliTerminal />
          </div>
        )}

        {activeTab === 'learn' && (
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <LearningPanel />
          </div>
        )}

        {activeTab === 'capture' && (
          <div style={{ height: '100%', overflow: 'hidden' }}>
            <PacketCapture />
          </div>
        )}

        {activeTab === 'log' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Sub-tabs for log section */}
            <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
              {(['eventlog', 'bandwidth', 'powerbudget'] as const).map((p, i) => {
                const labels = ['Event Log', 'Bandwidth', 'Power Budget'];
                return (
                  <button key={p} onClick={() => setActiveBottomPanel(p)} style={{
                    flex: 1, padding: '6px 4px', background: 'none', border: 'none',
                    borderBottom: `2px solid ${activeBottomPanel === p ? '#3b82f6' : 'transparent'}`,
                    color: activeBottomPanel === p ? '#3b82f6' : '#475569',
                    cursor: 'pointer', fontSize: 9, fontFamily: 'monospace',
                  }}>{labels[i]}</button>
                );
              })}
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {activeBottomPanel === 'eventlog' && <EventLog />}
              {activeBottomPanel === 'bandwidth' && <BandwidthChart />}
              {activeBottomPanel === 'powerbudget' && <PowerBudgetChart onuId={selectedOnu} />}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom tab bar ── */}
      <div style={{
        height: TAB_H, flexShrink: 0, background: '#0a0f1e',
        borderTop: '1px solid #1e293b', display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {tabBtn('canvas',     '🗺',  'Canvas')}
        {tabBtn('properties', '📋',  'Props')}
        {tabBtn('terminal',   '💻',  'Term')}
        {tabBtn('learn',      '📚',  'Learn')}
        {tabBtn('capture',    '🦈',  'Capture')}
        {tabBtn('log',        '📊',  'Charts')}
      </div>

      <InstallPrompt />
    </div>
  );
}
