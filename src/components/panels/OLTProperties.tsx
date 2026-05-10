import { useTopologyStore } from '../../store/topologyStore';
import { Row } from './PropertiesPanel';
import { PON_CAPACITIES } from '../../types/protocol';
import { formatBandwidth } from '../../utils/formatters';

interface Props { oltId: string; }

export function OLTProperties({ oltId }: Props) {
  const olt = useTopologyStore(s => s.olts[oltId]);
  const onus = useTopologyStore(s => s.onus);
  if (!olt) return null;

  const connectedCount = Object.values(onus).filter(o => o.oltId === oltId).length;
  const cap = PON_CAPACITIES[olt.standard];

  return (
    <div style={{ padding: 12 }}>
      <div style={{ color: '#93c5fd', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{olt.label}</div>
      <Row label="Vendor" value={olt.vendor} />
      <Row label="Model" value={olt.model} />
      <Row label="Standard" value={olt.standard} />
      <Row label="Mgmt IP" value={olt.managementIP} />
      <Row label="PON Ports" value={String(olt.ponPorts.length)} />
      <Row label="Connected ONUs" value={String(connectedCount)} />
      <Row label="DS Capacity" value={formatBandwidth(cap.down_kbps)} />
      <Row label="US Capacity" value={formatBandwidth(cap.up_kbps)} />

      <div style={{ marginTop: 12, color: '#64748b', fontSize: 10 }}>PON Port Details</div>
      {olt.ponPorts.map(p => (
        <div key={p.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 4, padding: 8, marginTop: 6 }}>
          <div style={{ color: '#94a3b8', fontSize: 10, marginBottom: 4 }}>Port {p.portIndex}</div>
          <Row label="TX Power" value={`${p.txPower_dBm} dBm`} />
          <Row label="RX Sensitivity" value={`${p.rxSensitivity_dBm} dBm`} />
          <Row label="λ Down" value={`${p.wavelengthDown_nm} nm`} />
          <Row label="λ Up" value={`${p.wavelengthUp_nm} nm`} />
          <Row label="Max ONUs" value={String(p.maxONUs)} />
        </div>
      ))}
    </div>
  );
}
