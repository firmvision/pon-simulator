import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { EndDevice, EndDeviceType } from '../types/network';

const ICONS: Record<EndDeviceType, string> = {
  pc:          '🖥',
  laptop:      '💻',
  router:      '📶',
  server:      '🗄',
  cloud:       '☁️',
  phone:       '📱',
  'wifi-ap':   '📡',
  'wifi-client': '📲',
};
const COLORS: Record<EndDeviceType, string> = {
  pc:          '#0891b2',
  laptop:      '#0891b2',
  router:      '#d97706',
  server:      '#7c3aed',
  cloud:       '#64748b',
  phone:       '#0891b2',
  'wifi-ap':   '#10b981',
  'wifi-client': '#06b6d4',
};
const LABELS: Record<EndDeviceType, string> = {
  pc:          'PC',
  laptop:      'Laptop',
  router:      'Router',
  server:      'Server',
  cloud:       'Cloud/WAN',
  phone:       'Phone',
  'wifi-ap':   'WiFi AP',
  'wifi-client': 'WiFi Client',
};

/** Whether a device type connects wirelessly (to a wifi-ap) */
const IS_WIRELESS: Partial<Record<EndDeviceType, boolean>> = {
  'wifi-client': true,
  phone: true,
};

export const EndDeviceNode = memo(({ data, selected }: NodeProps) => {
  const dev = data as unknown as EndDevice;
  const color = COLORS[dev.deviceType] ?? '#0891b2';
  const icon = ICONS[dev.deviceType] ?? '🖥';
  const typeLabel = LABELS[dev.deviceType] ?? 'Device';
  const isWireless = IS_WIRELESS[dev.deviceType] ?? false;
  const isAP = dev.deviceType === 'wifi-ap';

  return (
    <div style={{ position: 'relative' }}>
      {/* WiFi broadcast range rings */}
      {isAP && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 120, height: 120,
          border: `2px dashed ${color}44`,
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'wifi-pulse 2s ease-in-out infinite',
          zIndex: -1,
        }} />
      )}
      {isAP && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 80, height: 80,
          border: `1px dashed ${color}33`,
          borderRadius: '50%',
          pointerEvents: 'none',
          animation: 'wifi-pulse 2s ease-in-out infinite',
          animationDelay: '0.5s',
          zIndex: -1,
        }} />
      )}
    <div style={{
      width: 96, background: '#071520',
      border: `1.5px ${isWireless ? 'dashed' : 'solid'} ${selected ? '#3b82f6' : color + '88'}`,
      borderRadius: 6, fontFamily: 'monospace', fontSize: 9, cursor: 'pointer',
      boxShadow: selected ? `0 0 8px ${color}55` : (isAP ? `0 0 6px ${color}33` : 'none'),
      position: 'relative',
    }}>
      {/* Uplink handle (Ethernet/WiFi connection to ONU/AP) */}
      <Handle
        type="target"
        position={Position.Top}
        id="uplink"
        style={{ top: -5, background: color, border: `2px solid ${color}aa`, width: 8, height: 8 }}
      />
      {/* Also source from top for reverse connections */}
      <Handle
        type="source"
        position={Position.Top}
        id="uplink-src"
        style={{ top: -5, background: color, border: `2px solid ${color}aa`, width: 8, height: 8, opacity: 0 }}
      />

      {/* Header */}
      <div style={{
        background: color + '22', padding: '3px 6px',
        borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ color, fontWeight: 600, fontSize: 8, letterSpacing: 0.5 }}>{typeLabel}</span>
        {isWireless && (
          <span style={{ marginLeft: 'auto', color: color, fontSize: 8 }}>〜</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '4px 6px' }}>
        <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 10, marginBottom: 2 }}>{dev.label}</div>
        <div style={{ color: '#475569', fontSize: 8 }}>{dev.ipAddress}</div>
        <div style={{ color: '#334155', fontSize: 7, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dev.macAddress}</div>
      </div>

      {/* WiFi AP: downlink handles for wireless clients */}
      {isAP && (
        <div style={{ padding: '0 4px 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ color: color, fontSize: 7, opacity: 0.7 }}>📶 2.4/5 GHz</div>
        </div>
      )}

      {/* Router/switch: downlink LAN handles at bottom */}
      {(dev.deviceType === 'router' || isAP) && (
        <>
          {['dn-0','dn-1','dn-2'].map((id, i) => (
            <Handle key={id} type="source" position={Position.Bottom} id={id}
              style={{ left: `${25 + i * 25}%`, bottom: -5, background: color, border: `2px solid ${color}88`, width: 7, height: 7 }} />
          ))}
          {['dn-in-0','dn-in-1','dn-in-2'].map((id, i) => (
            <Handle key={id} type="target" position={Position.Bottom} id={id}
              style={{ left: `${25 + i * 25}%`, bottom: -5, background: color, border: `2px solid ${color}88`, width: 7, height: 7, opacity: 0 }} />
          ))}
        </>
      )}

      {/* Generic bottom handle for simple devices (PC, laptop, server, phone) */}
      {!isAP && dev.deviceType !== 'router' && (
        <>
          <Handle type="source" position={Position.Bottom} id="dn-0"
            style={{ bottom: -5, background: color, border: `2px solid ${color}88`, width: 7, height: 7 }} />
          <Handle type="target" position={Position.Bottom} id="dn-in-0"
            style={{ bottom: -5, background: color, border: `2px solid ${color}88`, width: 7, height: 7, opacity: 0 }} />
        </>
      )}
    </div>
    </div>
  );
});
EndDeviceNode.displayName = 'EndDeviceNode';
