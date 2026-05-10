import { useSimulationStore } from '../../store/simulationStore';
import { useTopologyStore } from '../../store/topologyStore';
import { formatSimTime } from '../../utils/formatters';

export function StatusBar() {
  const simTimestamp  = useSimulationStore(s => s.simTimestamp);
  const running       = useSimulationStore(s => s.running);
  const speedMultiplier = useSimulationStore(s => s.speedMultiplier);
  const alarms        = useSimulationStore(s => s.alarms);
  const onus          = useTopologyStore(s => s.onus);
  const olts          = useTopologyStore(s => s.olts);

  const onuList = Object.values(onus);
  const registeredCount = onuList.filter(o => o.state === 'O5').length;
  const activeAlarms = alarms.filter(a => !a.clearedAt).length;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 12px',
      background: '#0a0f1e', borderTop: '1px solid #1e293b',
      height: '100%', fontSize: 10, color: '#475569',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: running ? '#22c55e' : '#475569',
          boxShadow: running ? '0 0 6px #22c55e' : 'none',
        }} />
        <span style={{ color: running ? '#22c55e' : '#475569' }}>
          {running ? 'RUNNING' : 'STOPPED'}
        </span>
      </div>
      <div>SIM: <span style={{ color: '#94a3b8' }}>{formatSimTime(simTimestamp)}</span></div>
      <div>SPEED: <span style={{ color: '#94a3b8' }}>{speedMultiplier}x</span></div>
      <div>OLTs: <span style={{ color: '#93c5fd' }}>{Object.keys(olts).length}</span></div>
      <div>ONUs: <span style={{ color: '#94a3b8' }}>{onuList.length}</span> / Registered: <span style={{ color: '#22c55e' }}>{registeredCount}</span></div>
      {activeAlarms > 0 && (
        <div style={{ color: '#ef4444' }}>⚠ {activeAlarms} alarm{activeAlarms > 1 ? 's' : ''}</div>
      )}
      <div style={{ marginLeft: 'auto', color: '#1e3a5f' }}>FTTH PON Simulator v1.0 | GPON · XG-PON · XGS-PON</div>
    </div>
  );
}
