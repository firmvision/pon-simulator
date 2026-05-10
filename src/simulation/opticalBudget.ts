import type { FiberSegment, Splitter, ODF } from '../types/network';
import { SPLITTER_LOSS } from '../types/protocol';

export interface PathSegment {
  type: 'fiber' | 'splitter' | 'odf';
  label: string;
  loss_dB: number;
  cumulative_dB: number;
}

export interface PowerBudgetResult {
  txPower_dBm: number;
  totalLoss_dB: number;
  rxPower_dBm: number;
  rxSensitivity_dBm: number;
  margin_dB: number;
  isViable: boolean;
  segments: PathSegment[];
}

export function calculatePathLoss(
  path: Array<FiberSegment | Splitter | ODF>,
  wavelength_nm: 1310 | 1490 | 1577 = 1490,
): { totalLoss: number; segments: PathSegment[] } {
  const attenCoeff = wavelength_nm === 1490 ? 0.22 : wavelength_nm === 1577 ? 0.20 : 0.35;
  const segments: PathSegment[] = [];
  let cumulative = 0;

  for (const element of path) {
    if ('lengthKm' in element) {
      const f = element as FiberSegment;
      const fiberLoss = f.lengthKm * (f.attenuationCoeff_dBpkm || attenCoeff);
      const connLoss  = f.connectorCount * f.connectorLoss_dB;
      const spliceLoss = f.spliceCount * f.spliceLoss_dB;
      const seg = fiberLoss + connLoss + spliceLoss;
      cumulative += seg;
      segments.push({
        type: 'fiber',
        label: `Fiber ${f.lengthKm}km`,
        loss_dB: seg,
        cumulative_dB: cumulative,
      });
    } else if ('ratio' in element) {
      const s = element as Splitter;
      const loss = SPLITTER_LOSS[s.ratio] ?? s.insertionLoss_dB;
      cumulative += loss;
      segments.push({
        type: 'splitter',
        label: `1:${s.ratio} Splitter`,
        loss_dB: loss,
        cumulative_dB: cumulative,
      });
    } else if ('portCount' in element) {
      const o = element as ODF;
      cumulative += o.connectorLoss_dB;
      segments.push({
        type: 'odf',
        label: `ODF (${o.portCount}F)`,
        loss_dB: o.connectorLoss_dB,
        cumulative_dB: cumulative,
      });
    }
  }

  return { totalLoss: cumulative, segments };
}

export function computePowerBudget(
  path: Array<FiberSegment | Splitter | ODF>,
  txPower_dBm: number,
  rxSensitivity_dBm: number,
  wavelength_nm: 1310 | 1490 | 1577 = 1490,
): PowerBudgetResult {
  const { totalLoss, segments } = calculatePathLoss(path, wavelength_nm);
  const rxPower_dBm = txPower_dBm - totalLoss;
  const margin_dB = rxPower_dBm - rxSensitivity_dBm;
  return {
    txPower_dBm,
    totalLoss_dB: totalLoss,
    rxPower_dBm,
    rxSensitivity_dBm,
    margin_dB,
    isViable: margin_dB > 0,
    segments,
  };
}
