import { useSimulationStore } from '../../store/simulationStore';

const SEV_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  MAJOR: '#ef4444',
  MINOR: '#f59e0b',
  WARNING: '#fbbf24',
  INFO: '#22c55e',
};

export function EventLog() {
  // Do NOT call .filter() inside the selector — it creates a new array ref every call
  const events = useSimulationStore(s => s.events);
  const alarms = useSimulationStore(s => s.alarms);
  const activeAlarms = alarms.filter(a => !a.clearedAt);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {activeAlarms.length > 0 && (
        <div style={{ padding: '4px 8px', background: '#450a0a', borderBottom: '1px solid #7f1d1d', flexShrink: 0 }}>
          <span style={{ color: '#fca5a5', fontSize: 10 }}>
            ⚠ {activeAlarms.length} active alarm{activeAlarms.length > 1 ? 's' : ''}
          </span>
          {activeAlarms.slice(0, 3).map(a => (
            <div key={a.id} style={{ color: '#f87171', fontSize: 9, marginTop: 1 }}>
              [{a.code}] {a.description}
            </div>
          ))}
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {events.length === 0 && (
          <div style={{ color: '#475569', fontSize: 11, padding: '12px 8px', textAlign: 'center' }}>
            No events yet. Start simulation to see activity.
          </div>
        )}
        {events.map(ev => (
          <div key={ev.id} style={{
            display: 'flex', gap: 6, padding: '2px 8px',
            borderBottom: '1px solid #1e293b',
            fontSize: 10, alignItems: 'flex-start',
          }}>
            <span style={{ color: '#334155', flexShrink: 0, fontSize: 9 }}>{ev.wallTime}</span>
            <span style={{
              color: SEV_COLORS[ev.severity] ?? '#94a3b8',
              flexShrink: 0, fontSize: 9, width: 14, textAlign: 'center',
            }}>
              {ev.severity === 'INFO' ? '●' : ev.severity === 'MAJOR' ? '▲' : '■'}
            </span>
            <span style={{ color: '#64748b', flexShrink: 0 }}>[{ev.sourceName}]</span>
            <span style={{ color: '#94a3b8' }}>{ev.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
