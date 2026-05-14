import { useState } from 'react';
import { useTopologyStore } from '../../store/topologyStore';
import type { EndDevice, EndDeviceType } from '../../types/network';
import { Row } from './PropertiesPanel';

const TYPE_META: Record<EndDeviceType, { icon: string; label: string; color: string }> = {
  pc:           { icon: '🖥',  label: 'PC',          color: '#0891b2' },
  laptop:       { icon: '💻',  label: 'Laptop',      color: '#0891b2' },
  router:       { icon: '📶', label: 'Router',       color: '#d97706' },
  server:       { icon: '🗄',  label: 'Server',       color: '#7c3aed' },
  cloud:        { icon: '☁️', label: 'Cloud / WAN',  color: '#64748b' },
  phone:        { icon: '📱',  label: 'Phone',        color: '#0891b2' },
  'wifi-ap':    { icon: '📡',  label: 'WiFi AP',      color: '#10b981' },
  'wifi-client':{ icon: '📲',  label: 'WiFi Client',  color: '#06b6d4' },
};

function Field({
  label, value, onChange, type = 'text', placeholder = '', options,
}: {
  label: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}) {
  const inputStyle: React.CSSProperties = {
    display: 'block', width: '100%', marginTop: 3,
    padding: '4px 8px', background: '#0a0f1e',
    border: '1px solid #334155', borderRadius: 4,
    color: '#e2e8f0', fontSize: 11, fontFamily: 'monospace',
    boxSizing: 'border-box',
  };
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={{ color: '#64748b', fontSize: 10 }}>{label}</label>
      {options ? (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type} value={value ?? ''} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
    </div>
  );
}

interface Props { deviceId: string; }

export function EndDeviceProperties({ deviceId }: Props) {
  const dev = useTopologyStore(s => s.endDevices[deviceId]) as EndDevice | undefined;
  const update = useTopologyStore(s => s.updateEndDevice);
  const edges = useTopologyStore(s => s.edges);
  const olts = useTopologyStore(s => s.olts);
  const onus = useTopologyStore(s => s.onus);
  const endDevices = useTopologyStore(s => s.endDevices);

  const [activeTab, setActiveTab] = useState<'identity' | 'network' | 'specific' | 'connections'>('identity');
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [pinging, setPinging] = useState(false);

  if (!dev) return null;

  const meta = TYPE_META[dev.deviceType] ?? TYPE_META.pc;

  // Find connected nodes
  const connectedEdges = edges.filter(e => e.source === deviceId || e.target === deviceId);
  const connectedNodes = connectedEdges.map(e => {
    const otherId = e.source === deviceId ? e.target : e.source;
    return {
      edgeType: (e as { type?: string }).type ?? 'ethernet',
      node: onus[otherId] ?? olts[otherId] ?? endDevices[otherId] ?? null,
      nodeId: otherId,
    };
  }).filter(c => c.node !== null);

  const patch = (p: Partial<EndDevice>) => update(deviceId, p);

  const simulatePing = () => {
    setPinging(true);
    setPingResult(null);
    const rtt = () => (Math.random() * 3 + 0.5).toFixed(1);
    setTimeout(() => {
      const target = dev.gateway || '192.168.1.1';
      setPingResult(
        `Pinging ${target} with 32 bytes of data:\n` +
        `Reply from ${target}: bytes=32 time=${rtt()}ms TTL=64\n` +
        `Reply from ${target}: bytes=32 time=${rtt()}ms TTL=64\n` +
        `Reply from ${target}: bytes=32 time=${rtt()}ms TTL=64\n` +
        `Reply from ${target}: bytes=32 time=${rtt()}ms TTL=64\n\n` +
        `Ping statistics for ${target}:\n` +
        `  Packets: Sent=4, Received=4, Lost=0 (0% loss)`
      );
      setPinging(false);
    }, 1200);
  };

  const tabStyle = (id: string): React.CSSProperties => ({
    flex: 1, padding: '5px 2px', background: 'none', border: 'none',
    borderBottom: `2px solid ${activeTab === id ? meta.color : 'transparent'}`,
    color: activeTab === id ? meta.color : '#475569',
    cursor: 'pointer', fontSize: 9, fontFamily: 'monospace',
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: meta.color + '18', padding: '10px 12px', borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <span style={{ fontSize: 28 }}>{meta.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: meta.color, fontWeight: 700, fontSize: 13 }}>{dev.label}</div>
          <div style={{ color: '#64748b', fontSize: 10 }}>{meta.label} · {dev.ipAddress}</div>
        </div>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connectedNodes.length > 0 ? '#22c55e' : '#ef4444',
          boxShadow: connectedNodes.length > 0 ? '0 0 6px #22c55e' : 'none',
        }} title={connectedNodes.length > 0 ? 'Connected' : 'Not connected'} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <button style={tabStyle('identity')} onClick={() => setActiveTab('identity')}>Identity</button>
        <button style={tabStyle('network')} onClick={() => setActiveTab('network')}>Network</button>
        <button style={tabStyle('specific')} onClick={() => setActiveTab('specific')}>
          {dev.deviceType === 'wifi-ap' ? 'WiFi' :
           dev.deviceType === 'router' ? 'Routing' :
           dev.deviceType === 'server' ? 'Services' : 'Config'}
        </button>
        <button style={tabStyle('connections')} onClick={() => setActiveTab('connections')}>Links</button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>

        {/* ── Identity tab ── */}
        {activeTab === 'identity' && (
          <>
            <Field label="Label / Hostname" value={dev.label}
              onChange={v => patch({ label: v, hostname: v })} />
            <Field label="IP Address" value={dev.ipAddress} type="text"
              placeholder="e.g. 192.168.1.10"
              onChange={v => patch({ ipAddress: v })} />
            <Field label="MAC Address" value={dev.macAddress} type="text"
              placeholder="e.g. AA:BB:CC:DD:EE:FF"
              onChange={v => patch({ macAddress: v })} />
            <Row label="Device Type" value={meta.label} />
            <Row label="Device ID" value={dev.id.slice(0, 16) + '…'} />
          </>
        )}

        {/* ── Network tab ── */}
        {activeTab === 'network' && (
          <>
            <Field label="IP Address" value={dev.ipAddress}
              placeholder="192.168.1.10" onChange={v => patch({ ipAddress: v })} />
            <Field label="Subnet Mask" value={dev.subnetMask ?? '255.255.255.0'}
              placeholder="255.255.255.0" onChange={v => patch({ subnetMask: v })} />
            <Field label="Default Gateway" value={dev.gateway ?? ''}
              placeholder="192.168.1.1" onChange={v => patch({ gateway: v })} />
            <Field label="DNS Server" value={dev.dnsServer ?? ''}
              placeholder="8.8.8.8" onChange={v => patch({ dnsServer: v })} />

            {/* Simulated ping */}
            <div style={{ marginTop: 12 }}>
              <button onClick={simulatePing} disabled={pinging} style={{
                width: '100%', padding: '6px', background: pinging ? '#1e293b' : meta.color + '22',
                border: `1px solid ${meta.color}55`, borderRadius: 5,
                color: pinging ? '#475569' : meta.color, cursor: pinging ? 'wait' : 'pointer',
                fontSize: 11, fontFamily: 'monospace',
              }}>
                {pinging ? '⏳ Pinging…' : `🏓 Ping gateway (${dev.gateway || '192.168.1.1'})`}
              </button>
              {pingResult && (
                <pre style={{
                  marginTop: 8, padding: 8, background: '#020a14',
                  border: '1px solid #1e293b', borderRadius: 4,
                  color: '#22c55e', fontSize: 9, fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                }}>{pingResult}</pre>
              )}
            </div>
          </>
        )}

        {/* ── Device-specific tab ── */}
        {activeTab === 'specific' && (
          <>
            {/* WiFi AP */}
            {dev.deviceType === 'wifi-ap' && (
              <>
                <div style={{ color: '#10b981', fontSize: 10, fontWeight: 700, marginBottom: 8 }}>📡 WiFi Settings</div>
                <Field label="SSID (Network Name)" value={dev.ssid ?? ''}
                  placeholder="My-PON-WiFi" onChange={v => patch({ ssid: v })} />
                <Field label="Password" value={dev.wifiPassword ?? ''}
                  placeholder="(leave blank for open)" onChange={v => patch({ wifiPassword: v })} />
                <Field label="Security" value={dev.wifiSecurity ?? 'WPA2'}
                  onChange={v => patch({ wifiSecurity: v as 'open' | 'WPA2' | 'WPA3' })}
                  options={[
                    { value: 'WPA3', label: 'WPA3 (recommended)' },
                    { value: 'WPA2', label: 'WPA2-PSK' },
                    { value: 'open', label: 'Open (no password)' },
                  ]} />
                <Field label="Frequency Band" value={dev.wifiFrequency ?? 'dual-band'}
                  onChange={v => patch({ wifiFrequency: v as '2.4GHz' | '5GHz' | 'dual-band' })}
                  options={[
                    { value: 'dual-band', label: 'Dual-band (2.4 + 5 GHz)' },
                    { value: '5GHz', label: '5 GHz only' },
                    { value: '2.4GHz', label: '2.4 GHz only' },
                  ]} />
                <Field label="Channel (2.4GHz)" value={dev.wifiChannel ?? 6}
                  type="number" placeholder="1–13"
                  onChange={v => patch({ wifiChannel: parseInt(v) || 6 })} />
                <div style={{ marginTop: 8, padding: 8, background: '#0a0f1e', borderRadius: 4, border: '1px solid #1e293b' }}>
                  <div style={{ color: '#64748b', fontSize: 9 }}>📶 Broadcasting:</div>
                  <div style={{ color: '#10b981', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>
                    {dev.ssid || '(no SSID set)'} {dev.wifiSecurity && dev.wifiSecurity !== 'open' ? '🔒' : '🔓'}
                  </div>
                </div>
              </>
            )}

            {/* Router */}
            {dev.deviceType === 'router' && (
              <>
                <div style={{ color: '#d97706', fontSize: 10, fontWeight: 700, marginBottom: 8 }}>📶 Router / Gateway Settings</div>
                <Field label="WAN IP (from ONU/ISP)" value={dev.ipAddress}
                  onChange={v => patch({ ipAddress: v })} />
                <Field label="LAN Subnet (CIDR)" value={dev.lanCidr ?? '192.168.1.0/24'}
                  placeholder="192.168.1.0/24" onChange={v => patch({ lanCidr: v })} />
                <Field label="DHCP" value={dev.dhcpEnabled !== false ? 'enabled' : 'disabled'}
                  onChange={v => patch({ dhcpEnabled: v === 'enabled' })}
                  options={[
                    { value: 'enabled', label: 'DHCP enabled (automatic IP)' },
                    { value: 'disabled', label: 'DHCP disabled (static only)' },
                  ]} />
                <div style={{ marginTop: 8, padding: 8, background: '#0a0f1e', borderRadius: 4, border: '1px solid #1e293b' }}>
                  <div style={{ color: '#64748b', fontSize: 9 }}>NAT / Routing info:</div>
                  <div style={{ color: '#94a3b8', fontSize: 10, marginTop: 2 }}>
                    WAN: {dev.ipAddress || '--'}<br />
                    LAN: {dev.lanCidr || '192.168.1.0/24'}<br />
                    Gateway: {dev.gateway || 'auto (from ONU)'}
                  </div>
                </div>
              </>
            )}

            {/* Server */}
            {dev.deviceType === 'server' && (
              <>
                <div style={{ color: '#7c3aed', fontSize: 10, fontWeight: 700, marginBottom: 8 }}>🗄 Server Settings</div>
                <Field label="Hostname / FQDN" value={dev.hostname ?? dev.label}
                  placeholder="server.local" onChange={v => patch({ hostname: v })} />
                <Field label="Running Services" value={dev.services ?? ''}
                  placeholder="HTTP, FTP, DNS, SSH…" onChange={v => patch({ services: v })} />
                <Field label="Notes" value={dev.notes ?? ''}
                  placeholder="Any notes about this server"
                  onChange={v => patch({ notes: v })} />
              </>
            )}

            {/* Cloud */}
            {dev.deviceType === 'cloud' && (
              <>
                <div style={{ color: '#64748b', fontSize: 10, fontWeight: 700, marginBottom: 8 }}>☁️ Cloud / WAN Endpoint</div>
                <Field label="Hostname / Domain" value={dev.hostname ?? ''}
                  placeholder="isp-gateway.net" onChange={v => patch({ hostname: v })} />
                <Field label="Notes" value={dev.notes ?? ''}
                  placeholder="e.g. ISP upstream, CDN…" onChange={v => patch({ notes: v })} />
              </>
            )}

            {/* WiFi client / Phone */}
            {(dev.deviceType === 'wifi-client' || dev.deviceType === 'phone') && (
              <>
                <div style={{ color: '#06b6d4', fontSize: 10, fontWeight: 700, marginBottom: 8 }}>
                  {dev.deviceType === 'phone' ? '📱' : '📲'} Wireless Client Settings
                </div>
                <Field label="Label" value={dev.label} onChange={v => patch({ label: v })} />
                <div style={{ padding: 8, background: '#0a0f1e', borderRadius: 4, border: '1px solid #1e293b', marginTop: 4 }}>
                  <div style={{ color: '#64748b', fontSize: 9 }}>Connected WiFi:</div>
                  {connectedNodes.filter(c => c.edgeType === 'wireless').length > 0 ? (
                    connectedNodes.filter(c => c.edgeType === 'wireless').map(c => {
                      const ap = c.node as { label?: string; ssid?: string };
                      return (
                        <div key={c.nodeId} style={{ color: '#10b981', fontSize: 10, marginTop: 2 }}>
                          📡 {ap.label || 'WiFi AP'} {ap.ssid ? `(${ap.ssid})` : ''}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>Not connected to any AP</div>
                  )}
                </div>
              </>
            )}

            {/* PC / Laptop */}
            {(dev.deviceType === 'pc' || dev.deviceType === 'laptop') && (
              <>
                <div style={{ color: '#0891b2', fontSize: 10, fontWeight: 700, marginBottom: 8 }}>
                  {dev.deviceType === 'pc' ? '🖥' : '💻'} {meta.label} Settings
                </div>
                <Field label="Hostname" value={dev.hostname ?? dev.label}
                  placeholder="PC-name" onChange={v => patch({ hostname: v })} />
                <Field label="Notes" value={dev.notes ?? ''}
                  placeholder="User, location, role…" onChange={v => patch({ notes: v })} />
              </>
            )}
          </>
        )}

        {/* ── Connections tab ── */}
        {activeTab === 'connections' && (
          <>
            <div style={{ color: '#64748b', fontSize: 10, marginBottom: 8 }}>
              {connectedNodes.length} connection(s)
            </div>
            {connectedNodes.length === 0 ? (
              <div style={{ color: '#334155', fontSize: 11, padding: 8, background: '#0a0f1e', borderRadius: 4 }}>
                No connections yet. Draw a cable from a handle on this device to an ONU LAN port.
              </div>
            ) : (
              connectedNodes.map((c, i) => {
                const n = c.node as { label?: string; id?: string; deviceType?: string };
                const isONU = !!onus[c.nodeId];
                const isOLT = !!olts[c.nodeId];
                const isEd = !!endDevices[c.nodeId];
                const nodeLabel = n.label ?? c.nodeId;
                const edgeIcon = c.edgeType === 'wireless' ? '〜' : c.edgeType === 'fiber' ? '━' : '━';
                const edgeColor = c.edgeType === 'wireless' ? '#10b981' : c.edgeType === 'fiber' ? '#f97316' : '#0891b2';
                return (
                  <div key={i} style={{
                    padding: 8, marginBottom: 6, background: '#0a0f1e',
                    border: '1px solid #1e293b', borderRadius: 5,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: edgeColor, fontSize: 14 }}>{edgeIcon}</span>
                      <div>
                        <div style={{ color: '#e2e8f0', fontSize: 11, fontWeight: 600 }}>{nodeLabel}</div>
                        <div style={{ color: '#475569', fontSize: 9 }}>
                          {isONU ? 'ONU' : isOLT ? 'OLT' : isEd ? (n.deviceType ?? 'Device') : 'Node'}
                          {' · '}
                          <span style={{ color: edgeColor }}>{c.edgeType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div style={{ marginTop: 12, padding: 8, background: '#020a14', borderRadius: 4, border: '1px solid #1e293b' }}>
              <div style={{ color: '#64748b', fontSize: 9, marginBottom: 4 }}>How to connect:</div>
              <div style={{ color: '#334155', fontSize: 9, lineHeight: 1.6 }}>
                • Drag from the handle at the <b style={{ color: '#94a3b8' }}>top</b> of this device to an ONU's bottom LAN port<br />
                • For WiFi: drag from a WiFi AP's bottom handle to this device's top handle<br />
                • Cable type is chosen automatically (ethernet / wireless)
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
