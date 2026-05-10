import { useTopologyStore } from '../../store/topologyStore';
import { Row } from './PropertiesPanel';

interface Props { fiberId: string; }

export function FiberProperties({ fiberId }: Props) {
  const fiber = useTopologyStore(s => s.fibers[fiberId]);
  const updateFiber = useTopologyStore(s => s.updateFiber);
  if (!fiber) return null;

  return (
    <div style={{ padding: 12 }}>
      <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 12, marginBottom: 8 }}>Fiber Segment</div>
      <Row label="Total Loss" value={fiber.totalLoss_dB !== undefined ? `${fiber.totalLoss_dB.toFixed(2)} dB` : '--'} />

      <div style={{ marginTop: 12 }}>
        <label style={{ color: '#64748b', fontSize: 10 }}>Length (km)</label>
        <input
          type="number" step="0.1" min="0.01" value={fiber.lengthKm}
          onChange={e => updateFiber(fiberId, { lengthKm: parseFloat(e.target.value) || 0.1 })}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', fontSize: 11 }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label style={{ color: '#64748b', fontSize: 10 }}>Attenuation (dB/km)</label>
        <input
          type="number" step="0.01" min="0.1" value={fiber.attenuationCoeff_dBpkm}
          onChange={e => updateFiber(fiberId, { attenuationCoeff_dBpkm: parseFloat(e.target.value) || 0.35 })}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', fontSize: 11 }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label style={{ color: '#64748b', fontSize: 10 }}>Connector count</label>
        <input
          type="number" step="1" min="0" value={fiber.connectorCount}
          onChange={e => updateFiber(fiberId, { connectorCount: parseInt(e.target.value) || 0 })}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', fontSize: 11 }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <label style={{ color: '#64748b', fontSize: 10 }}>Splice count</label>
        <input
          type="number" step="1" min="0" value={fiber.spliceCount}
          onChange={e => updateFiber(fiberId, { spliceCount: parseInt(e.target.value) || 0 })}
          style={{ display: 'block', width: '100%', marginTop: 4, padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', fontSize: 11 }}
        />
      </div>

      <div style={{ marginTop: 12, padding: 8, background: '#0f172a', borderRadius: 4, border: '1px solid #1e293b' }}>
        <div style={{ color: '#64748b', fontSize: 9, marginBottom: 4 }}>Computed loss:</div>
        <div style={{ color: '#94a3b8', fontSize: 10 }}>
          Fiber: {(fiber.lengthKm * fiber.attenuationCoeff_dBpkm).toFixed(2)} dB<br/>
          Connectors: {(fiber.connectorCount * fiber.connectorLoss_dB).toFixed(2)} dB<br/>
          Splices: {(fiber.spliceCount * fiber.spliceLoss_dB).toFixed(2)} dB
        </div>
      </div>
    </div>
  );
}
