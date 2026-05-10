import type { ONU } from '../types/network';
import type { TrafficFlow } from '../types/simulation';
import { PON_CAPACITIES } from '../types/protocol';

export function runDBACycle(
  onus: ONU[],
  standard: 'GPON' | 'XG-PON' | 'XGS-PON',
): Record<string, number> {
  const capacity = PON_CAPACITIES[standard];
  // bytes per 125µs frame (upstream)
  const bytesPerFrame = Math.floor((capacity.up_kbps * 1000 / 8) * 0.000125);
  let remaining = bytesPerFrame;
  const allocations: Record<string, number> = {};

  const activeONUs = onus.filter(o => o.state === 'O5');

  // Pass 1 – Fixed (T-CONT type 1)
  for (const onu of activeONUs) {
    for (const tc of onu.tconts.filter(t => t.type === 1)) {
      const needed = Math.floor(tc.fixedBandwidth_kbps * 1000 / 8 * 0.000125);
      const alloc = Math.min(needed, remaining);
      remaining -= alloc;
      allocations[onu.id] = (allocations[onu.id] ?? 0) + alloc;
    }
  }

  // Pass 2 – Assured (T-CONT types 2 & 3)
  for (const onu of activeONUs) {
    for (const tc of onu.tconts.filter(t => t.type === 2 || t.type === 3)) {
      const needed = Math.floor(tc.assuredBandwidth_kbps * 1000 / 8 * 0.000125);
      const alloc = Math.min(needed, remaining);
      remaining -= alloc;
      allocations[onu.id] = (allocations[onu.id] ?? 0) + alloc;
    }
  }

  // Pass 3 – Best-effort (T-CONT type 4), split equally
  const bePairs = activeONUs.flatMap(o =>
    o.tconts.filter(t => t.type === 4).map(t => ({ onu: o, tc: t }))
  );
  if (bePairs.length > 0 && remaining > 0) {
    const share = Math.floor(remaining / bePairs.length);
    for (const { onu, tc } of bePairs) {
      const maxBytes = Math.floor(tc.maxBandwidth_kbps * 1000 / 8 * 0.000125);
      const alloc = Math.min(share, maxBytes);
      allocations[onu.id] = (allocations[onu.id] ?? 0) + alloc;
    }
  }

  return allocations; // bytes allocated per ONU per frame
}

// Convert bytes/frame to kbps
export function frameBytesToKbps(bytes: number): number {
  return (bytes / 0.000125) * 8 / 1000;
}

// Generate synthetic traffic for an active ONU (Poisson-like)
export function generateTrafficFlow(onu: ONU, allocBytes: number, simTime: number): TrafficFlow {
  const allocKbps = frameBytesToKbps(allocBytes);
  const maxUp = onu.tconts.reduce((a, t) => a + t.maxBandwidth_kbps, 0);
  // Simulate demand varying with sine wave + noise
  const demand = maxUp * (0.3 + 0.4 * Math.abs(Math.sin(simTime / 3000 + onu.id.charCodeAt(4))));
  const actualUp = Math.min(demand, allocKbps);
  const utilization = maxUp > 0 ? actualUp / maxUp : 0;

  return {
    onuId: onu.id,
    currentUpRate_kbps: actualUp,
    currentDownRate_kbps: actualUp * 1.5,  // downstream proportional to upstream
    allocatedUpRate_kbps: allocKbps,
    peakUpRate_kbps: maxUp,
    utilization,
  };
}
