import { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import type { CaptureFrame, CaptureProtocol } from '../../types/simulation';

const PROTO_COLORS: Record<CaptureProtocol, { bg: string; fg: string }> = {
  PLOAM:    { bg: '#1e3a5f', fg: '#60a5fa' },
  OMCI:     { bg: '#1a2e4a', fg: '#93c5fd' },
  GEM:      { bg: '#052e16', fg: '#4ade80' },
  Ethernet: { bg: '#1c1917', fg: '#a8a29e' },
  IPv4:     { bg: '#0c1a2e', fg: '#7dd3fc' },
  ARP:      { bg: '#1e1b4b', fg: '#a5b4fc' },
  DBA:      { bg: '#1c1232', fg: '#c084fc' },
  ICMP:     { bg: '#1a1001', fg: '#fbbf24' },
  UDP:      { bg: '#0a1f0a', fg: '#86efac' },
  TCP:      { bg: '#0f1a2e', fg: '#38bdf8' },
};

function FieldRow({ name, value, bytes }: { name: string; value: string; bytes: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '2px 6px', borderBottom: '1px solid #0f172a', fontSize: 9 }}>
      <span style={{ color: '#475569', width: 140, flexShrink: 0, fontFamily: 'monospace' }}>{name}</span>
      <span style={{ color: '#94a3b8', flex: 1, fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</span>
      <span style={{ color: '#334155', width: 80, flexShrink: 0, fontFamily: 'monospace', textAlign: 'right' }}>{bytes}</span>
    </div>
  );
}

export function PacketCapture() {
  const frames = useSimulationStore(s => s.captureFrames);
  const captureRunning = useSimulationStore(s => s.captureRunning);
  const { clearCapture, toggleCapture } = useSimulationStore();

  const [selected, setSelected] = useState<CaptureFrame | null>(null);
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [frames, autoScroll]);

  const filtered = filter
    ? frames.filter(f =>
        f.protocol.toLowerCase().includes(filter.toLowerCase()) ||
        f.source.toLowerCase().includes(filter.toLowerCase()) ||
        f.destination.toLowerCase().includes(filter.toLowerCase()) ||
        f.info.toLowerCase().includes(filter.toLowerCase())
      )
    : frames;

  const btn = (label: string, onClick: () => void, color: string, active = false) => (
    <button onClick={onClick} style={{
      padding: '3px 8px', background: active ? color + '33' : 'none',
      border: `1px solid ${active ? color : '#1e293b'}`, borderRadius: 3,
      color: active ? color : '#475569', cursor: 'pointer', fontSize: 9, fontFamily: 'monospace',
    }}>{label}</button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#060d18', fontFamily: 'monospace' }}>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        {btn(captureRunning ? '⏸ Stop' : '▶ Start', toggleCapture, captureRunning ? '#f59e0b' : '#22c55e', captureRunning)}
        {btn('🗑 Clear', clearCapture, '#ef4444')}
        {btn(autoScroll ? '⬇ Scroll ON' : '⬇ Scroll OFF', () => setAutoScroll(v => !v), '#3b82f6', autoScroll)}
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter (protocol / IP / info)…"
          style={{
            flex: 1, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 3,
            color: '#94a3b8', fontSize: 9, padding: '3px 6px', fontFamily: 'monospace',
          }}
        />
        <span style={{ color: '#334155', fontSize: 8 }}>{filtered.length} frames</span>
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', background: '#0a0f1e', borderBottom: '1px solid #1e293b', flexShrink: 0, fontSize: 8, color: '#334155' }}>
        <span style={{ width: 36, padding: '3px 6px', flexShrink: 0 }}>No.</span>
        <span style={{ width: 64, padding: '3px 4px', flexShrink: 0 }}>Time (ms)</span>
        <span style={{ width: 90, padding: '3px 4px', flexShrink: 0 }}>Source</span>
        <span style={{ width: 90, padding: '3px 4px', flexShrink: 0 }}>Destination</span>
        <span style={{ width: 60, padding: '3px 4px', flexShrink: 0 }}>Protocol</span>
        <span style={{ width: 36, padding: '3px 4px', flexShrink: 0 }}>Len</span>
        <span style={{ flex: 1, padding: '3px 4px' }}>Info</span>
      </div>

      {/* Frame list */}
      <div ref={tableRef} style={{ flex: selected ? '0 0 45%' : 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {filtered.length === 0 && (
          <div style={{ padding: 16, color: '#334155', fontSize: 10, textAlign: 'center' }}>
            {captureRunning ? 'Waiting for packets… Start the simulation.' : 'Capture stopped.'}
          </div>
        )}
        {filtered.map(f => {
          const colors = PROTO_COLORS[f.protocol] ?? { bg: '#0f172a', fg: '#94a3b8' };
          const isSelected = selected?.no === f.no;
          return (
            <div
              key={f.no}
              onClick={() => setSelected(isSelected ? null : f)}
              style={{
                display: 'flex', alignItems: 'center', cursor: 'pointer',
                background: isSelected ? '#1e3a5f' : colors.bg,
                borderBottom: '1px solid #0f172a08',
                borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
              }}
            >
              <span style={{ width: 36, padding: '2px 6px', color: '#334155', fontSize: 8, flexShrink: 0 }}>{f.no}</span>
              <span style={{ width: 64, padding: '2px 4px', color: '#475569', fontSize: 8, flexShrink: 0 }}>{f.simTime_ms.toFixed(0)}</span>
              <span style={{ width: 90, padding: '2px 4px', color: '#64748b', fontSize: 8, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.source}</span>
              <span style={{ width: 90, padding: '2px 4px', color: '#64748b', fontSize: 8, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.destination}</span>
              <span style={{ width: 60, padding: '2px 4px', color: colors.fg, fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{f.protocol}</span>
              <span style={{ width: 36, padding: '2px 4px', color: '#475569', fontSize: 8, flexShrink: 0 }}>{f.length}</span>
              <span style={{ flex: 1, padding: '2px 4px', color: colors.fg, fontSize: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.info}</span>
            </div>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ flex: 1, borderTop: '2px solid #1e3a5f', overflowY: 'auto', background: '#0a0f1e' }}>
          <div style={{ padding: '4px 8px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#60a5fa', fontSize: 9, fontWeight: 700 }}>
              Frame {selected.no} — {selected.protocol} — {selected.info}
            </span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12 }}>✕</button>
          </div>
          <div style={{ padding: '4px 0' }}>
            {/* Frame summary fields */}
            <div style={{ padding: '2px 6px 4px', borderBottom: '1px solid #0f172a' }}>
              <div style={{ color: '#22c55e', fontSize: 9, fontWeight: 700, marginBottom: 2 }}>Frame Summary</div>
              <FieldRow name="Arrival Time (sim)" value={`${selected.simTime_ms.toFixed(3)} ms`} bytes="" />
              <FieldRow name="Frame Length" value={`${selected.length} bytes`} bytes={`0x${selected.length.toString(16).toUpperCase().padStart(4,'0')}`} />
              <FieldRow name="Direction" value={selected.direction} bytes="" />
            </div>
            {/* Protocol-specific fields */}
            {selected.detail.map((field, i) => (
              <FieldRow key={i} name={field.name} value={field.value} bytes={field.bytes} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
