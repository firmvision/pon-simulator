import { useTopologyStore } from '../../store/topologyStore';
import { computePowerBudget, calculatePathLoss } from '../../simulation/opticalBudget';
import type { FiberSegment, Splitter, ODF } from '../../types/network';

interface Props { onuId: string | null; }

export function PowerBudgetChart({ onuId }: Props) {
  const onus = useTopologyStore(s => s.onus);
  const olts = useTopologyStore(s => s.olts);
  const fibers = useTopologyStore(s => s.fibers);
  const splitters = useTopologyStore(s => s.splitters);

  if (!onuId) {
    return <div style={{ color: '#475569', fontSize: 11, padding: 12 }}>Select an ONU to view its power budget.</div>;
  }

  const onu = onus[onuId];
  if (!onu) return null;

  // Find OLT
  const olt = onu.oltId ? olts[onu.oltId] : null;
  const port = olt?.ponPorts[0];

  // Build path (simplified: find all fibers connecting OLT to ONU through splitters)
  const path: Array<FiberSegment | Splitter | ODF> = [];
  // Simple heuristic: collect fibers that include splitters
  if (olt) {
    const visited = new Set<string>();
    const queue = [olt.id];
    while (queue.length) {
      const cur = queue.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      Object.values(fibers).filter(f => f.sourceId === cur && !visited.has(f.targetId)).forEach(f => {
        path.push(f);
        if (splitters[f.targetId]) path.push(splitters[f.targetId]);
        if (f.targetId === onuId) return;
        queue.push(f.targetId);
      });
    }
  }

  const txPower = port?.txPower_dBm ?? 3;
  const rxSens = -28;
  const { segments } = calculatePathLoss(path as Array<FiberSegment | Splitter | ODF>, 1490);
  const totalLoss = segments.reduce((a, s) => a + s.loss_dB, 0);
  const rxPower = txPower - totalLoss;
  const margin = rxPower - rxSens;
  const marginColor = margin < 0 ? '#ef4444' : margin < 3 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ padding: '8px 12px', fontSize: 11, overflowY: 'auto' }}>
      <div style={{ color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
        Power Budget — {onu.label}
      </div>

      {/* TX */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #1e293b' }}>
        <span style={{ color: '#64748b' }}>OLT TX Power</span>
        <span style={{ color: '#3b82f6' }}>+{txPower.toFixed(1)} dBm</span>
      </div>

      {/* Segments */}
      {segments.map((seg, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #1e293b' }}>
          <span style={{ color: '#475569' }}>  {seg.label}</span>
          <span style={{ color: '#f59e0b' }}>−{seg.loss_dB.toFixed(1)} dB</span>
        </div>
      ))}

      {/* RX */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', marginTop: 4, borderTop: '1px solid #334155' }}>
        <span style={{ color: '#64748b' }}>ONU RX Power</span>
        <span style={{ color: marginColor }}>{rxPower.toFixed(1)} dBm</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
        <span style={{ color: '#475569' }}>RX Sensitivity</span>
        <span style={{ color: '#64748b' }}>{rxSens} dBm</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', marginTop: 4, borderTop: '1px solid #334155' }}>
        <span style={{ color: '#94a3b8', fontWeight: 600 }}>Margin</span>
        <span style={{ color: marginColor, fontWeight: 700 }}>
          {margin.toFixed(1)} dB {margin < 0 ? '⚠ OVER BUDGET' : margin < 3 ? '⚠ MARGINAL' : '✓ OK'}
        </span>
      </div>

      {/* Bar */}
      <div style={{ marginTop: 8, height: 8, background: '#1e293b', borderRadius: 4 }}>
        <div style={{
          height: '100%', borderRadius: 4, background: marginColor,
          width: `${Math.max(0, Math.min(100, (margin / 10) * 100))}%`,
          transition: 'width 0.4s',
        }} />
      </div>
      <div style={{ color: '#334155', fontSize: 9, marginTop: 2 }}>Total path loss: {totalLoss.toFixed(1)} dB</div>
    </div>
  );
}
