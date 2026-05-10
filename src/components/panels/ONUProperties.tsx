import { useState } from 'react';
import { useTopologyStore } from '../../store/topologyStore';
import { ONU_STATE_LABELS, ONU_STATE_COLORS } from '../../types/protocol';
import { PowerBudgetChart } from '../charts/PowerBudgetChart';
import { Row } from './PropertiesPanel';
import { formatPower } from '../../utils/formatters';

interface Props { onuId: string; }
type Tab = 'identity' | 'tconts' | 'vlans' | 'optical';

export function ONUProperties({ onuId }: Props) {
  const [tab, setTab] = useState<Tab>('identity');
  const onu = useTopologyStore(s => s.onus[onuId]);
  const updateONU = useTopologyStore(s => s.updateONU);

  if (!onu) return null;

  const stateColor = ONU_STATE_COLORS[onu.state] ?? '#4b5563';
  const tabs: { id: Tab; label: string }[] = [
    { id: 'identity', label: 'Identity' },
    { id: 'tconts', label: 'T-CONTs' },
    { id: 'vlans', label: 'VLANs' },
    { id: 'optical', label: 'Optical' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 12 }}>{onu.label}</span>
          <span style={{
            padding: '1px 6px', borderRadius: 3, fontSize: 9,
            background: stateColor + '33', color: stateColor, fontWeight: 600,
          }}>{onu.state} — {ONU_STATE_LABELS[onu.state]}</span>
        </div>
        <div style={{ color: '#475569', fontSize: 9, marginTop: 2, fontFamily: 'monospace' }}>{onu.serialNumber}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '5px 2px', background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid #3b82f6' : '2px solid transparent',
            color: tab === t.id ? '#3b82f6' : '#475569',
            cursor: 'pointer', fontSize: 9, fontFamily: 'monospace',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'identity' && (
          <div style={{ padding: 10 }}>
            <Row label="Label" value={onu.label} />
            <Row label="Serial Number" value={onu.serialNumber} />
            <Row label="Vendor" value={onu.vendor} />
            <Row label="Model" value={onu.model} />
            <Row label="Standard" value={onu.standard} />
            <Row label="ONU-ID" value={onu.onuIndex !== null ? String(onu.onuIndex) : 'Not assigned'} />
            <Row label="OLT" value={onu.oltId ?? 'Not connected'} />
            <div style={{ marginTop: 12 }}>
              <label style={{ color: '#64748b', fontSize: 10 }}>Serial Number</label>
              <input
                value={onu.serialNumber}
                onChange={e => updateONU(onuId, { serialNumber: e.target.value.toUpperCase() })}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', fontSize: 11, fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ color: '#64748b', fontSize: 10 }}>Label</label>
              <input
                value={onu.label}
                onChange={e => updateONU(onuId, { label: e.target.value })}
                style={{ display: 'block', width: '100%', marginTop: 4, padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', fontSize: 11, fontFamily: 'monospace' }}
              />
            </div>
          </div>
        )}

        {tab === 'tconts' && (
          <div style={{ padding: 10 }}>
            <div style={{ color: '#64748b', fontSize: 10, marginBottom: 8 }}>T-CONT Configuration</div>
            {onu.tconts.map(tc => (
              <div key={tc.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, padding: 8, marginBottom: 8 }}>
                <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 4 }}>T-CONT #{tc.index} (Type {tc.type})</div>
                <Row label="Type" value={['', 'Fixed', 'Assured', 'Assured+Non', 'Best-Effort', 'Mixed'][tc.type] ?? String(tc.type)} />
                <Row label="Fixed BW" value={`${(tc.fixedBandwidth_kbps / 1000).toFixed(1)} Mbps`} />
                <Row label="Assured BW" value={`${(tc.assuredBandwidth_kbps / 1000).toFixed(1)} Mbps`} />
                <Row label="Max BW" value={`${(tc.maxBandwidth_kbps / 1000).toFixed(1)} Mbps`} />
                <Row label="DBA Profile" value={tc.dbaProfileId ?? '--'} />
              </div>
            ))}
          </div>
        )}

        {tab === 'vlans' && (
          <div style={{ padding: 10 }}>
            <div style={{ color: '#64748b', fontSize: 10, marginBottom: 8 }}>Service VLANs</div>
            {onu.serviceVlans.map(sv => (
              <div key={sv.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, padding: 8, marginBottom: 8 }}>
                <Row label="Service" value={sv.serviceType} />
                <Row label="S-VLAN" value={String(sv.svlan)} />
                <Row label="C-VLAN" value={String(sv.cvlan)} />
                <Row label="Priority" value={`CoS ${sv.priority}`} />
              </div>
            ))}
          </div>
        )}

        {tab === 'optical' && (
          <div>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #1e293b' }}>
              <Row label="RX Power" value={onu.rxPower_dBm !== undefined ? formatPower(onu.rxPower_dBm) : '-- dBm'} />
              <Row label="Signal Margin" value={onu.signalMargin_dB !== undefined ? `${onu.signalMargin_dB.toFixed(1)} dB` : '-- dB'} />
            </div>
            <PowerBudgetChart onuId={onuId} />
          </div>
        )}
      </div>
    </div>
  );
}
