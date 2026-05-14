import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ONU } from '../types/network';
import { ONU_STATE_COLORS, ONU_STATE_LABELS } from '../types/protocol';
import { useSimulationStore } from '../store/simulationStore';

export const ONUNode = memo(({ data, selected }: NodeProps) => {
  const onu = data as unknown as ONU;
  const alarms = useSimulationStore(s => s.alarms);
  const flow = useSimulationStore(s => s.trafficFlows[onu.id]);
  const hasAlarm = alarms.some(a => a.sourceId === onu.id && !a.clearedAt);

  const stateColor = ONU_STATE_COLORS[onu.state] ?? '#4b5563';
  const isRanging = onu.state === 'O3' || onu.state === 'O4';
  const isOp = onu.state === 'O5';

  const rxText = onu.rxPower_dBm !== undefined ? `${onu.rxPower_dBm.toFixed(1)} dBm` : '-- dBm';
  const marginText = onu.signalMargin_dB !== undefined ? `${onu.signalMargin_dB.toFixed(1)} dB` : '';
  const marginColor = (onu.signalMargin_dB ?? 99) < 0 ? '#ef4444' : (onu.signalMargin_dB ?? 99) < 3 ? '#f59e0b' : '#22c55e';

  return (
    <div
      className={`pon-node${selected ? ' selected' : ''}${isRanging ? ' onu-ranging' : ''}${hasAlarm ? ' has-alarm' : ''}`}
      style={{ width: 130, borderColor: hasAlarm ? '#ef4444' : selected ? '#3b82f6' : stateColor + '88' }}
    >
      {/* PON uplink handle (fiber from splitter/OLT) */}
      <Handle type="target" position={Position.Top} id="pon-in" style={{ top: -5, background: stateColor, border: `2px solid ${stateColor}88`, width: 10, height: 10 }} />
      {/* Also allow source connections from top (for reverse path) */}
      <Handle type="source" position={Position.Top} id="pon-out" style={{ top: -5, background: stateColor, border: `2px solid ${stateColor}88`, width: 10, height: 10, opacity: 0 }} />

      {/* Header */}
      <div style={{
        background: stateColor + '33', padding: '3px 6px',
        borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={stateColor} strokeWidth="2">
          <rect x="3" y="9" width="18" height="12" rx="2"/>
          <path d="M3 13h18M7 9V7a5 5 0 0 1 10 0v2"/>
        </svg>
        <span style={{ color: stateColor, fontWeight: 600, fontSize: 9, letterSpacing: 0.5 }}>ONU</span>
        <span style={{
          marginLeft: 'auto', fontSize: 8, padding: '1px 4px',
          background: stateColor + '44', color: stateColor, borderRadius: 3,
        }}>
          {onu.state}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '5px 7px' }}>
        <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 11 }}>{onu.label}</div>
        <div style={{ color: '#64748b', fontSize: 9, fontFamily: 'monospace', marginTop: 1 }}>
          {onu.serialNumber}
        </div>
        <div style={{ color: '#475569', fontSize: 9 }}>{ONU_STATE_LABELS[onu.state]}</div>

        {onu.onuIndex !== null && (
          <div style={{ color: '#64748b', fontSize: 9 }}>ONU-ID: {onu.onuIndex}</div>
        )}

        {/* Signal strength indicator */}
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#475569', fontSize: 8 }}>RX:</span>
          <span style={{ color: marginColor, fontSize: 8 }}>{rxText}</span>
          {marginText && <span style={{ color: marginColor, fontSize: 8 }}>({marginText})</span>}
        </div>

        {/* Traffic indicator */}
        {isOp && flow && (
          <div style={{ marginTop: 3, display: 'flex', gap: 3, alignItems: 'center' }}>
            <div style={{ height: 3, flex: 1, background: '#1e293b', borderRadius: 2 }}>
              <div style={{
                height: '100%', borderRadius: 2, background: '#3b82f6',
                width: `${Math.min(100, (flow.utilization ?? 0) * 100)}%`,
                transition: 'width 0.5s',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Active light */}
      <div style={{
        position: 'absolute', top: 6, right: 6,
        width: 6, height: 6, borderRadius: '50%',
        background: stateColor,
        boxShadow: isOp ? `0 0 6px ${stateColor}` : 'none',
      }} />

      {/* LAN port handles at bottom (for connecting end devices) */}
      {['lan-0','lan-1','lan-2','lan-3'].map((id, i) => (
        <Handle key={id} type="source" position={Position.Bottom} id={id}
          style={{ left: `${20 + i * 20}%`, bottom: -5, background: '#0891b2', border: '2px solid #0e7490', width: 8, height: 8 }} />
      ))}
      {/* Also accept incoming connections from end devices */}
      {['lan-in-0','lan-in-1','lan-in-2','lan-in-3'].map((id, i) => (
        <Handle key={id} type="target" position={Position.Bottom} id={id}
          style={{ left: `${20 + i * 20}%`, bottom: -5, background: '#0891b2', border: '2px solid #0e7490', width: 8, height: 8, opacity: 0 }} />
      ))}
    </div>
  );
});
ONUNode.displayName = 'ONUNode';
