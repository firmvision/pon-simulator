import { useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useSimulationStore } from '../../store/simulationStore';
import { useTopologyStore } from '../../store/topologyStore';
import { simEngine } from '../../simulation/engine';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import { TopologyCanvas } from '../canvas/TopologyCanvas';
import { PropertiesPanel } from '../panels/PropertiesPanel';
import { CliTerminal } from '../terminal/CliTerminal';
import { LearningPanel } from '../learning/LearningPanel';
import { EventLog } from '../log/EventLog';
import { BandwidthChart } from '../charts/BandwidthChart';
import { PowerBudgetChart } from '../charts/PowerBudgetChart';
import { InstallPrompt } from '../pwa/InstallPrompt';

export function AppShell() {
  const { activeRightPanel, activeBottomPanel, setActiveRightPanel, setActiveBottomPanel } = useUIStore();
  const selectedId = useTopologyStore(s => s.selectedNodeId);
  const onus = useTopologyStore(s => s.onus);
  const selectedOnu = selectedId && onus[selectedId] ? selectedId : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        useTopologyStore.getState().exportProject();
      }
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        const running = useSimulationStore.getState().running;
        if (running) {
          useSimulationStore.getState().pauseSimulation();
          simEngine.pause();
        } else {
          useSimulationStore.getState().startSimulation();
          simEngine.start();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const tabBtn = (label: string, active: boolean, onClick: () => void) => (
    <button onClick={onClick} style={{
      padding: '4px 10px', background: 'none', border: 'none',
      borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
      color: active ? '#3b82f6' : '#475569', cursor: 'pointer',
      fontSize: 10, fontFamily: 'monospace',
    }}>{label}</button>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: '48px 1fr 220px 26px',
      gridTemplateColumns: '1fr 300px',
      gridTemplateAreas: `"toolbar toolbar" "canvas rightpanel" "bottom rightpanel" "statusbar statusbar"`,
      height: '100vh', background: '#0f172a', overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{ gridArea: 'toolbar' }}>
        <Toolbar />
      </div>

      {/* Canvas */}
      <div style={{ gridArea: 'canvas', position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <TopologyCanvas />
      </div>

      {/* Right Panel */}
      <div style={{ gridArea: 'rightpanel', borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Right panel tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          {tabBtn('Properties', activeRightPanel === 'properties', () => setActiveRightPanel('properties'))}
          {tabBtn('Terminal', activeRightPanel === 'terminal', () => setActiveRightPanel('terminal'))}
          {tabBtn('📚 Learn', activeRightPanel === 'learn', () => setActiveRightPanel('learn'))}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeRightPanel === 'properties' && <PropertiesPanel />}
          {activeRightPanel === 'terminal' && <CliTerminal />}
          {activeRightPanel === 'learn' && <LearningPanel />}
        </div>
      </div>

      {/* Bottom Panel */}
      <div style={{ gridArea: 'bottom', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
          {tabBtn('Event Log', activeBottomPanel === 'eventlog', () => setActiveBottomPanel('eventlog'))}
          {tabBtn('Bandwidth', activeBottomPanel === 'bandwidth', () => setActiveBottomPanel('bandwidth'))}
          {tabBtn('Power Budget', activeBottomPanel === 'powerbudget', () => setActiveBottomPanel('powerbudget'))}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeBottomPanel === 'eventlog' && <EventLog />}
          {activeBottomPanel === 'bandwidth' && <BandwidthChart />}
          {activeBottomPanel === 'powerbudget' && <PowerBudgetChart onuId={selectedOnu} />}
        </div>
      </div>

      {/* Status Bar */}
      <div style={{ gridArea: 'statusbar' }}>
        <StatusBar />
      </div>

      <InstallPrompt />
    </div>
  );
}
