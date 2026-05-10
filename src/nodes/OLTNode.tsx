import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { OLT } from '../types/network';
import { useSimulationStore } from '../store/simulationStore';

export const OLTNode = memo(({ data, selected }: NodeProps) => {
  const olt = data as unknown as OLT;
  const alarms = useSimulationStore(s => s.alarms);
  const hasAlarm = alarms.some(a => a.sourceId === olt.id && !a.clearedAt);

  return (
    <div
      className={`pon-node${selected ? ' selected' : ''}${hasAlarm ? ' has-alarm' : ''}`}
      style={{ width: 160, background: '#0f2744', borderColor: hasAlarm ? '#ef4444' : selected ? '#3b82f6' : '#1d4ed8' }}
    >
      {/* Header */}
      <div style={{
        background: '#1d4ed8', padding: '4px 8px',
        borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2">
          <rect x="2" y="3" width="20" height="4" rx="1"/><rect x="2" y="10" width="20" height="4" rx="1"/>
          <rect x="2" y="17" width="20" height="4" rx="1"/>
          <circle cx="20" cy="5" r="1" fill="#4ade80"/>
          <circle cx="20" cy="12" r="1" fill="#4ade80"/>
          <circle cx="20" cy="19" r="1" fill="#f59e0b"/>
        </svg>
        <span style={{ color: '#bfdbfe', fontWeight: 600, fontSize: 10, letterSpacing: 0.5 }}>OLT</span>
        {hasAlarm && <span style={{ color: '#fca5a5', marginLeft: 'auto', fontSize: 9 }}>⚠</span>}
      </div>

      {/* Body */}
      <div style={{ padding: '6px 8px' }}>
        <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: 11 }}>{olt.label}</div>
        <div style={{ color: '#64748b', fontSize: 9, marginTop: 1 }}>{olt.vendor} {olt.model}</div>
        <div style={{ color: '#475569', fontSize: 9 }}>{olt.standard}</div>
        <div style={{ marginTop: 5, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {olt.ponPorts.map((port) => (
            <div key={port.id} style={{
              width: 8, height: 8, borderRadius: 2,
              background: port.connectedONUIds.length > 0 ? '#4ade80' : '#334155',
              border: '1px solid #1e3a5f',
              title: `PON ${port.portIndex}`,
            }} />
          ))}
        </div>
      </div>

      {/* Handles — one per PON port at bottom */}
      {olt.ponPorts.map((port, i) => (
        <Handle
          key={port.id}
          type="source"
          position={Position.Bottom}
          id={port.id}
          style={{
            left: `${((i + 1) / (olt.ponPorts.length + 1)) * 100}%`,
            bottom: -5,
            background: '#3b82f6',
            border: '2px solid #1d4ed8',
            width: 10,
            height: 10,
          }}
        />
      ))}
      <Handle type="target" position={Position.Top} id="uplink" style={{ top: -5, background: '#8b5cf6', border: '2px solid #6d28d9', width: 10, height: 10 }} />
    </div>
  );
});
OLTNode.displayName = 'OLTNode';
