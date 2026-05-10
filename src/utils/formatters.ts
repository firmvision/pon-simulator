export function formatPower(dBm: number): string {
  return `${dBm.toFixed(1)} dBm`;
}

export function formatBandwidth(kbps: number): string {
  if (kbps >= 1_000_000) return `${(kbps / 1_000_000).toFixed(2)} Gbps`;
  if (kbps >= 1_000)     return `${(kbps / 1_000).toFixed(1)} Mbps`;
  return `${kbps} kbps`;
}

export function formatSimTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatLoss(dB: number): string {
  return `${dB.toFixed(1)} dB`;
}
