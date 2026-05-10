import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSimulationStore } from '../../store/simulationStore';
import { useTopologyStore } from '../../store/topologyStore';

export function BandwidthChart() {
  const flows = useSimulationStore(s => s.trafficFlows);
  const onus = useTopologyStore(s => s.onus);
  const running = useSimulationStore(s => s.running);

  const data = Object.values(flows).map(f => ({
    name: onus[f.onuId]?.label ?? f.onuId,
    'Up (Mbps)': +(f.currentUpRate_kbps / 1000).toFixed(1),
    'Down (Mbps)': +(f.currentDownRate_kbps / 1000).toFixed(1),
    'Alloc (Mbps)': +(f.allocatedUpRate_kbps / 1000).toFixed(1),
  }));

  if (!running || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', fontSize: 11 }}>
        {running ? 'Waiting for ONUs to register...' : 'Start simulation to view bandwidth allocation.'}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 9 }} unit=" M" />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 4, fontSize: 10 }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#e2e8f0' }}
        />
        <Legend wrapperStyle={{ fontSize: 10, color: '#64748b' }} />
        <Bar dataKey="Up (Mbps)" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Down (Mbps)" fill="#22c55e" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Alloc (Mbps)" fill="#f59e0b" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
