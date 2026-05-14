import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { EndDevice, EndDeviceType } from '../types/network';

const ICONS: Record<EndDeviceType, string> = {
  pc: '🖥', laptop: '💻', router: '📶', server: '🗄', cloud: '☁️', phone: '📱',
};
const COLORS: Record<EndDeviceType, string> = {
  pc: '#0891b2', laptop: '#0891b2', router: '#d97706', server: '#7c3aed', cloud: '#64748b', phone: '#0891b2',
};
const LABELS: Record<EndDeviceType, string> = {
  pc: 'PC', laptop: 'Laptop', router: 'Router', server: 'Server', cloud: 'Cloud/WAN', phone: 'Phone',
};

export const EndDeviceNode = memo(({ data, selected }: NodeProps) => {
  const dev = data as unknown as EndDevice;
  const color = COLORS[dev.deviceType] ?? '#0891b2';
  const icon = ICONS[dev.deviceType] ?? '🖥';
  const typeLabel = LABELS[dev.deviceType] ?? 'Device';

  return (
    <div style={{
      width: 90, background: '#071520', border: `1.5px solid ${selected ? '#3b82f6' : color + '88'}`,
      borderRadius: 6, fontFamily: 'monospace', fontSize: 9, cursor: 'pointer',
      boxShadow: selected ? `0 0 8px ${color}55` : 'none',
    }}>
      {/* Header */}
      <div style={{ background: color + '22', padding: '3px 6px', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ color: color, fontWeight: 600, fontSize: 8, letterSpacing: 0.5 }}>{typeLabel}</span>
      </div>
      {/* Body */}
      <div style={{ padding: '4px 6px' }}>
        <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 10, marginBottom: 2 }}>{dev.label}</div>
        <div style={{ color: '#475569', fontSize: 8 }}>{dev.ipAddress}</div>
        <div style={{ color: '#334155', fontSize: 7, marginTop: 1 }}>{dev.macAddress}</div>
      </div>
      {/* Handles */}
      <Handle type="source" position={Position.Top} style={{ background: color, width: 7, height: 7 }} />
      <Handle type="target" position={Position.Top} style={{ background: color, width: 7, height: 7 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: color, width: 7, height: 7 }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ background: color, width: 7, height: 7 }} />
    </div>
  );
});
EndDeviceNode.displayName = 'EndDeviceNode';
