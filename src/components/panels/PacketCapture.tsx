import { useState, useRef, useEffect, useCallback } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { useTopologyStore } from '../../store/topologyStore';
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

/** Given a frame source/dest string like "OLT-1 (port 0)" or "ONU-3", try to find
 *  the matching topology node id so we can highlight it on the canvas. */
function resolveNodeId(addr: string): string | null {
  const { olts, onus } = useTopologyStore.getState();
  const label = addr.split('(')[0].trim();
  const olt = Object.values(olts).find(o => o.label === label || o.id === label);
  if (olt) return olt.id;
  const onu = Object.values(onus).find(o => o.label === label || o.id === label);
  if (onu) return onu.id;
  return null;
}

export function PacketCapture() {
  const frames = useSimulationStore(s => s.captureFrames);
  const captureRunning = useSimulationStore(s => s.captureRunning);
  const replayIndex = useSimulationStore(s => s.replayIndex);
  const replayPlaying = useSimulationStore(s => s.replayPlaying);
  const replayFps = useSimulationStore(s => s.replayFps);

  const {
    clearCapture, toggleCapture,
    enterReplay, exitReplay, setReplayIndex, stepReplay, toggleReplayPlay, setReplayFps,
  } = useSimulationStore();

  const [selected, setSelected] = useState<CaptureFrame | null>(null);
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);
  const replayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll to bottom on new live frames
  useEffect(() => {
    if (autoScroll && replayIndex < 0 && tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [frames, autoScroll, replayIndex]);

  // Scroll replay frame into view
  useEffect(() => {
    if (replayIndex >= 0 && tableRef.current) {
      const el = tableRef.current.querySelector<HTMLElement>(`[data-replay="true"]`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [replayIndex]);

  // Highlight source node on canvas when replay frame changes
  useEffect(() => {
    if (replayIndex >= 0 && frames[replayIndex]) {
      const frame = frames[replayIndex];
      const nodeId = resolveNodeId(frame.source) ?? resolveNodeId(frame.destination);
      if (nodeId) useTopologyStore.getState().setSelectedNode(nodeId);
    }
  }, [replayIndex, frames]);

  // Auto-play interval
  useEffect(() => {
    if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
      replayIntervalRef.current = null;
    }
    if (replayPlaying && replayIndex >= 0) {
      replayIntervalRef.current = setInterval(() => {
        const { replayIndex: cur, captureFrames } = useSimulationStore.getState();
        if (cur >= captureFrames.length - 1) {
          useSimulationStore.getState().toggleReplayPlay(); // stop at end
        } else {
          useSimulationStore.getState().setReplayIndex(cur + 1);
        }
      }, 1000 / replayFps);
    }
    return () => {
      if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    };
  }, [replayPlaying, replayFps, replayIndex]);

  const filtered = filter
    ? frames.filter(f =>
        f.protocol.toLowerCase().includes(filter.toLowerCase()) ||
        f.source.toLowerCase().includes(filter.toLowerCase()) ||
        f.destination.toLowerCase().includes(filter.toLowerCase()) ||
        f.info.toLowerCase().includes(filter.toLowerCase())
      )
    : frames;

  const isReplaying = replayIndex >= 0;
  const replayFrame = isReplaying ? frames[replayIndex] : null;

  const btn = useCallback((label: string, onClick: () => void, color: string, active = false, title = '') => (
    <button onClick={onClick} title={title} style={{
      padding: '3px 8px', background: active ? color + '33' : 'none',
      border: `1px solid ${active ? color : '#1e293b'}`, borderRadius: 3,
      color: active ? color : '#475569', cursor: 'pointer', fontSize: 9, fontFamily: 'monospace',
      whiteSpace: 'nowrap',
    }}>{label}</button>
  ), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#060d18', fontFamily: 'monospace' }}>

      {/* ── Live capture toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderBottom: '1px solid #1e293b', flexShrink: 0, flexWrap: 'wrap' }}>
        {btn(captureRunning ? '⏸ Stop' : '▶ Capture', toggleCapture, captureRunning ? '#f59e0b' : '#22c55e', captureRunning)}
        {btn('🗑 Clear', clearCapture, '#ef4444')}
        {btn(autoScroll ? '⬇ Auto' : '⬇ Off', () => setAutoScroll(v => !v), '#3b82f6', autoScroll, 'Auto-scroll')}
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter (protocol / IP / info)…"
          style={{
            flex: 1, minWidth: 80, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 3,
            color: '#94a3b8', fontSize: 9, padding: '3px 6px', fontFamily: 'monospace',
          }}
        />
        <span style={{ color: '#334155', fontSize: 8 }}>{filtered.length} frames</span>
      </div>

      {/* ── Replay controls ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
        borderBottom: '1px solid #1e293b', flexShrink: 0, background: isReplaying ? '#0a1628' : '#060d18',
        flexWrap: 'wrap',
      }}>
        <span style={{ color: isReplaying ? '#60a5fa' : '#334155', fontSize: 9, marginRight: 2 }}>
          {isReplaying ? '🔴 REPLAY' : '📼 REPLAY'}
        </span>

        {/* Jump to start */}
        <button
          onClick={() => { enterReplay(0); }}
          disabled={frames.length === 0}
          title="Jump to first frame"
          style={{ padding: '2px 6px', background: 'none', border: '1px solid #1e293b', borderRadius: 3, color: frames.length ? '#94a3b8' : '#1e293b', cursor: frames.length ? 'pointer' : 'not-allowed', fontSize: 12 }}
        >⏮</button>

        {/* Step back */}
        <button
          onClick={() => stepReplay('backward')}
          disabled={!isReplaying || replayIndex <= 0}
          title="Step backward one frame"
          style={{ padding: '2px 6px', background: 'none', border: '1px solid #1e293b', borderRadius: 3, color: (isReplaying && replayIndex > 0) ? '#94a3b8' : '#1e293b', cursor: (isReplaying && replayIndex > 0) ? 'pointer' : 'not-allowed', fontSize: 12 }}
        >◀</button>

        {/* Play / Pause */}
        <button
          onClick={toggleReplayPlay}
          disabled={frames.length === 0}
          title={replayPlaying ? 'Pause replay' : 'Play replay'}
          style={{ padding: '2px 8px', background: replayPlaying ? '#1d3a5f' : 'none', border: `1px solid ${replayPlaying ? '#3b82f6' : '#1e293b'}`, borderRadius: 3, color: frames.length ? (replayPlaying ? '#60a5fa' : '#94a3b8') : '#1e293b', cursor: frames.length ? 'pointer' : 'not-allowed', fontSize: 12 }}
        >{replayPlaying ? '⏸' : '▶'}</button>

        {/* Step forward */}
        <button
          onClick={() => stepReplay('forward')}
          disabled={!isReplaying || replayIndex >= frames.length - 1}
          title="Step forward one frame"
          style={{ padding: '2px 6px', background: 'none', border: '1px solid #1e293b', borderRadius: 3, color: (isReplaying && replayIndex < frames.length - 1) ? '#94a3b8' : '#1e293b', cursor: (isReplaying && replayIndex < frames.length - 1) ? 'pointer' : 'not-allowed', fontSize: 12 }}
        >▶</button>

        {/* Jump to end */}
        <button
          onClick={() => enterReplay(frames.length - 1)}
          disabled={frames.length === 0}
          title="Jump to last frame"
          style={{ padding: '2px 6px', background: 'none', border: '1px solid #1e293b', borderRadius: 3, color: frames.length ? '#94a3b8' : '#1e293b', cursor: frames.length ? 'pointer' : 'not-allowed', fontSize: 12 }}
        >⏭</button>

        {/* Scrubber */}
        {isReplaying && frames.length > 0 && (
          <input
            type="range"
            min={0}
            max={frames.length - 1}
            value={replayIndex}
            onChange={e => setReplayIndex(Number(e.target.value))}
            style={{ flex: 1, minWidth: 60, accentColor: '#3b82f6', cursor: 'pointer' }}
          />
        )}

        {/* FPS selector */}
        <div style={{ display: 'flex', gap: 2, marginLeft: 2 }}>
          {[0.5, 1, 2, 5].map(fps => (
            <button
              key={fps}
              onClick={() => setReplayFps(fps)}
              style={{
                padding: '2px 5px', background: replayFps === fps ? '#1d4ed8' : 'none',
                border: `1px solid ${replayFps === fps ? '#3b82f6' : '#1e293b'}`, borderRadius: 3,
                color: replayFps === fps ? '#bfdbfe' : '#475569', cursor: 'pointer', fontSize: 8, fontFamily: 'monospace',
              }}
            >{fps}fps</button>
          ))}
        </div>

        {/* Exit replay */}
        {isReplaying && btn('✕ Live', exitReplay, '#ef4444', false, 'Return to live capture')}

        {/* Frame counter */}
        {isReplaying && (
          <span style={{ color: '#60a5fa', fontSize: 9, marginLeft: 4 }}>
            {replayIndex + 1} / {frames.length}
          </span>
        )}
      </div>

      {/* ── Column headers ── */}
      <div style={{ display: 'flex', background: '#0a0f1e', borderBottom: '1px solid #1e293b', flexShrink: 0, fontSize: 8, color: '#334155' }}>
        <span style={{ width: 36, padding: '3px 6px', flexShrink: 0 }}>No.</span>
        <span style={{ width: 64, padding: '3px 4px', flexShrink: 0 }}>Time (ms)</span>
        <span style={{ width: 90, padding: '3px 4px', flexShrink: 0 }}>Source</span>
        <span style={{ width: 90, padding: '3px 4px', flexShrink: 0 }}>Destination</span>
        <span style={{ width: 60, padding: '3px 4px', flexShrink: 0 }}>Protocol</span>
        <span style={{ width: 36, padding: '3px 4px', flexShrink: 0 }}>Len</span>
        <span style={{ flex: 1, padding: '3px 4px' }}>Info</span>
      </div>

      {/* ── Frame list ── */}
      <div ref={tableRef} style={{ flex: selected ? '0 0 40%' : 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {filtered.length === 0 && (
          <div style={{ padding: 16, color: '#334155', fontSize: 10, textAlign: 'center' }}>
            {captureRunning ? 'Waiting for packets… Start the simulation.' : 'Capture stopped.'}
          </div>
        )}
        {filtered.map(f => {
          const colors = PROTO_COLORS[f.protocol] ?? { bg: '#0f172a', fg: '#94a3b8' };
          const isReplayFrame = isReplaying && f === replayFrame;
          const isSelected = selected?.no === f.no;
          return (
            <div
              key={f.no}
              data-replay={isReplayFrame ? 'true' : undefined}
              onClick={() => {
                setSelected(isSelected ? null : f);
                // entering replay on click
                const idx = frames.indexOf(f);
                if (idx >= 0) enterReplay(idx);
              }}
              style={{
                display: 'flex', alignItems: 'center', cursor: 'pointer',
                background: isReplayFrame ? '#1e3a5f' : isSelected ? '#162032' : colors.bg,
                borderBottom: '1px solid #0f172a08',
                borderLeft: isReplayFrame ? '3px solid #3b82f6' : isSelected ? '2px solid #1d4ed8' : '2px solid transparent',
                opacity: isReplaying && !isReplayFrame ? 0.45 : 1,
              }}
            >
              <span style={{ width: 36, padding: '2px 6px', color: isReplayFrame ? '#60a5fa' : '#334155', fontSize: 8, flexShrink: 0, fontWeight: isReplayFrame ? 700 : 400 }}>{f.no}</span>
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

      {/* ── Detail panel ── */}
      {selected && (
        <div style={{ flex: 1, borderTop: '2px solid #1e3a5f', overflowY: 'auto', background: '#0a0f1e' }}>
          <div style={{ padding: '4px 8px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#60a5fa', fontSize: 9, fontWeight: 700 }}>
              Frame {selected.no} — {selected.protocol} — {selected.info}
            </span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12 }}>✕</button>
          </div>
          <div style={{ padding: '4px 0' }}>
            <div style={{ padding: '2px 6px 4px', borderBottom: '1px solid #0f172a' }}>
              <div style={{ color: '#22c55e', fontSize: 9, fontWeight: 700, marginBottom: 2 }}>Frame Summary</div>
              <FieldRow name="Arrival Time (sim)" value={`${selected.simTime_ms.toFixed(3)} ms`} bytes="" />
              <FieldRow name="Frame Length" value={`${selected.length} bytes`} bytes={`0x${selected.length.toString(16).toUpperCase().padStart(4,'0')}`} />
              <FieldRow name="Direction" value={selected.direction} bytes="" />
            </div>
            {selected.detail.map((field, i) => (
              <FieldRow key={i} name={field.name} value={field.value} bytes={field.bytes} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
