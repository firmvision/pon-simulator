import { useTopologyStore, tracePathTo } from '../store/topologyStore';
import { useSimulationStore } from '../store/simulationStore';
import { getTransition } from './onuStateMachine';
import { computePowerBudget } from './opticalBudget';
import { runDBACycle, generateTrafficFlow } from './dbaAlgorithm';
import type { FiberSegment, Splitter, ODF } from '../types/network';
import type { CaptureFrame } from '../types/simulation';

// ── Capture frame factories ──────────────────────────────────────────────────
function hex(n: number, w = 2) { return '0x' + n.toString(16).toUpperCase().padStart(w, '0'); }
function rand16() { return hex(Math.floor(Math.random() * 0xFFFF), 4); }

function makePLOAM(onuLabel: string, onuSN: string, toState: string, simTime: number): CaptureFrame {
  type PloamMsg = { msg: string; dir: 'upstream' | 'downstream'; info: string; fields: CaptureFrame['detail']; len: number; };
  const msgMap: Record<string, PloamMsg> = {
    O2: { msg: 'Upstream_Overhead', dir: 'downstream', info: 'OLT→broadcast: Configure upstream parameters', len: 48,
      fields: [
        { name: 'Message Type', value: 'Upstream_Overhead (0x01)', bytes: '01' },
        { name: 'ONU-ID', value: '0xFF (broadcast)', bytes: 'FF' },
        { name: 'Pre-assigned delay', value: '0 chips', bytes: '00 00' },
        { name: 'SN response time', value: '64 chips', bytes: '00 40' },
      ]},
    O3: { msg: 'Serial_Number_ONU', dir: 'upstream', info: `${onuLabel} → OLT: Respond with serial number`, len: 48,
      fields: [
        { name: 'Message Type', value: 'Serial_Number_ONU (0x01)', bytes: '01' },
        { name: 'ONU Serial Number', value: onuSN, bytes: onuSN.slice(-8).split('').map(c => c.charCodeAt(0).toString(16)).join(' ') },
        { name: 'Random Delay', value: rand16(), bytes: rand16() },
      ]},
    O4: { msg: 'Assign_ONU-ID', dir: 'downstream', info: `OLT assigns ONU-ID to ${onuLabel}`, len: 48,
      fields: [
        { name: 'Message Type', value: 'Assign_ONU-ID (0x03)', bytes: '03' },
        { name: 'ONU Serial Number', value: onuSN, bytes: '...' },
        { name: 'Assigned ONU-ID', value: hex(Math.floor(Math.random() * 63)), bytes: hex(Math.floor(Math.random() * 63)) },
      ]},
    O5: { msg: 'Ranging_Time', dir: 'downstream', info: `OLT completes ranging — ${onuLabel} is OPERATIONAL`, len: 48,
      fields: [
        { name: 'Message Type', value: 'Ranging_Time (0x04)', bytes: '04' },
        { name: 'Equalization Delay', value: `${Math.floor(Math.random() * 6000 + 1000)} chips`, bytes: rand16() },
        { name: 'ONU-ID', value: hex(Math.floor(Math.random() * 63)), bytes: hex(Math.floor(Math.random() * 63)) },
      ]},
  };
  const m = msgMap[toState] ?? msgMap['O5'];
  return {
    no: 0, simTime_ms: simTime, source: m.dir === 'upstream' ? onuLabel : 'OLT',
    destination: m.dir === 'upstream' ? 'OLT' : (toState === 'O2' ? 'Broadcast' : onuLabel),
    protocol: 'PLOAM', length: m.len, info: `${m.msg} — ${m.info}`,
    direction: m.dir, detail: m.fields,
  };
}

function makeOMCI(onuLabel: string, msgType: string, simTime: number, index: number): CaptureFrame {
  const isResponse = msgType.includes('Response');
  const meClass = ['ONU-G', 'ONU2-G', 'GEM Port CTP', 'GEM IW TP', 'MAC Bridge SP', 'VLAN Tag Filter'][index % 6];
  return {
    no: 0, simTime_ms: simTime + index * 2,
    source: isResponse ? onuLabel : 'OLT',
    destination: isResponse ? 'OLT' : onuLabel,
    protocol: 'OMCI', length: 48,
    info: `${msgType} — ME Class: ${meClass} (instance ${index})`,
    direction: isResponse ? 'upstream' : 'downstream',
    detail: [
      { name: 'Transaction ID', value: rand16(), bytes: rand16() },
      { name: 'Message Type', value: msgType + ` (${hex(index + 0x44)})`, bytes: hex(index + 0x44) },
      { name: 'Device ID', value: '0x0A (baseline)', bytes: '0A' },
      { name: 'ME Class', value: meClass, bytes: hex(0x100 + index, 4) },
      { name: 'ME Instance', value: `${index}`, bytes: hex(index, 4) },
    ],
  };
}

function makeGEMFrame(onuLabel: string, simTime: number, allocBytes: number, oltLabel: string): CaptureFrame {
  const proto = Math.random() > 0.5 ? 'IPv4' : 'Ethernet';
  const srcIp = `192.168.1.${Math.floor(Math.random() * 200 + 10)}`;
  const dstIp = `8.8.${Math.floor(Math.random() * 8)}.${Math.floor(Math.random() * 4)}`;
  const portId = Math.floor(Math.random() * 1000 + 100);
  const len = Math.min(allocBytes, 1500);
  return {
    no: 0, simTime_ms: simTime,
    source: onuLabel, destination: oltLabel,
    protocol: proto, length: len,
    info: proto === 'IPv4'
      ? `${srcIp} → ${dstIp} TTL=64 Len=${len}`
      : `Ethernet Frame GEM Port ${portId} Len=${len}`,
    direction: 'upstream',
    detail: proto === 'IPv4' ? [
      { name: 'Version', value: 'IPv4', bytes: '45' },
      { name: 'Total Length', value: `${len}`, bytes: hex(len, 4) },
      { name: 'Source IP', value: srcIp, bytes: srcIp.split('.').map(n => hex(+n)).join(' ') },
      { name: 'Destination IP', value: dstIp, bytes: dstIp.split('.').map(n => hex(+n)).join(' ') },
      { name: 'Protocol', value: Math.random() > 0.5 ? 'TCP (6)' : 'UDP (17)', bytes: Math.random() > 0.5 ? '06' : '11' },
      { name: 'GEM Port ID', value: `${portId}`, bytes: hex(portId, 4) },
    ] : [
      { name: 'GEM Port ID', value: `${portId}`, bytes: hex(portId, 4) },
      { name: 'Frame Length', value: `${len}`, bytes: hex(len, 4) },
      { name: 'Payload Type', value: 'Ethernet (0x0001)', bytes: '00 01' },
      { name: 'VLAN', value: `S-VLAN 100 C-VLAN ${Math.floor(Math.random() * 100 + 1)}`, bytes: rand16() },
    ],
  };
}

interface ScheduledEvent {
  fireAt: number;
  type: string;
  payload: Record<string, unknown>;
}

class SimulationEngine {
  private queue: ScheduledEvent[] = [];
  private rafHandle: number | null = null;
  private lastWallTime = 0;
  private initialized = false;

  private insertSorted(ev: ScheduledEvent) {
    let lo = 0, hi = this.queue.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.queue[mid].fireAt <= ev.fireAt) lo = mid + 1;
      else hi = mid;
    }
    this.queue.splice(lo, 0, ev);
  }

  schedule(delayMs: number, type: string, payload: Record<string, unknown>) {
    const simTime = useSimulationStore.getState().simTimestamp;
    this.insertSorted({ fireAt: simTime + delayMs, type, payload });
  }

  start() {
    if (this.rafHandle !== null) return;
    this.lastWallTime = performance.now();

    if (!this.initialized) {
      this.initialized = true;
      this.initializeONUs();
      this.schedule(125, 'DBA_CYCLE', {});
    }

    this.tick();
  }

  pause() {
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  reset() {
    this.pause();
    this.queue = [];
    this.initialized = false;
    useSimulationStore.getState().resetSimulation();
    // Reset all ONU states
    const { onus, updateONU } = useTopologyStore.getState();
    Object.values(onus).forEach(onu => {
      updateONU(onu.id, { state: 'O1', stateEnteredAt: 0, onuIndex: null, rxPower_dBm: undefined, signalMargin_dB: undefined });
    });
  }

  private initializeONUs() {
    const { onus } = useTopologyStore.getState();
    let delay = 0;
    Object.values(onus).forEach(onu => {
      // Stagger ONU power-on across 500ms sim time to make it visible
      this.schedule(delay, 'ONU_TRIGGER', { onuId: onu.id, trigger: 'POWER_ON' });
      delay += 200 + Math.random() * 300;
    });
    this.computeAllBudgets();
  }

  private computeAllBudgets() {
    const { onus, olts, fibers, splitters, odfs } = useTopologyStore.getState();
    let onuIndex = 0;

    Object.values(onus).forEach(onu => {
      // Find which OLT's port connects to this ONU (via fiber graph)
      let foundOLTPort = null;
      let foundOLT = null;
      for (const olt of Object.values(olts)) {
        for (const port of olt.ponPorts) {
          // Check if any fiber from this port leads to the ONU
          const path = tracePathTo(port.id.includes('port') ? olt.id : port.id, onu.id, fibers, splitters, odfs);
          if (path.length > 0) {
            foundOLTPort = port;
            foundOLT = olt;
            break;
          }
        }
        if (foundOLTPort) break;
      }

      // Trace from OLT to ONU through topology
      if (foundOLT) {
        const path = tracePathTo(foundOLT.id, onu.id, fibers, splitters, odfs);
        const pathElements = path as Array<FiberSegment | Splitter | ODF>;
        if (pathElements.length > 0) {
          const budget = computePowerBudget(
            pathElements,
            foundOLTPort!.txPower_dBm,
            onu.rxPower_dBm ?? -28,
            foundOLTPort!.wavelengthDown_nm,
          );
          useTopologyStore.getState().updateONU(onu.id, {
            rxPower_dBm: budget.rxPower_dBm,
            signalMargin_dB: budget.margin_dB,
            oltId: foundOLT.id,
            onuIndex: onuIndex++,
          });
          // Update fiber losses
          path.forEach(el => {
            if ('lengthKm' in el) {
              // it's a FiberSegment — compute its loss
              const f = el as FiberSegment;
              const fiberLoss = f.lengthKm * f.attenuationCoeff_dBpkm + f.connectorCount * f.connectorLoss_dB + f.spliceCount * f.spliceLoss_dB;
              useTopologyStore.getState().updateFiber(f.id, { totalLoss_dB: fiberLoss, trafficActive: false });
            }
          });
        }
      }
    });
  }

  private tick = () => {
    const now = performance.now();
    const wallDelta = now - this.lastWallTime;
    this.lastWallTime = now;

    const { speedMultiplier, simTimestamp } = useSimulationStore.getState();
    const simDelta = wallDelta * speedMultiplier;
    const newSimTime = simTimestamp + simDelta;
    useSimulationStore.getState().advanceTime(simDelta);

    // Drain events
    while (this.queue.length > 0 && this.queue[0].fireAt <= newSimTime) {
      const ev = this.queue.shift()!;
      this.processEvent(ev);
    }

    this.rafHandle = requestAnimationFrame(this.tick);
  };

  private processEvent(ev: ScheduledEvent) {
    switch (ev.type) {
      case 'ONU_TRIGGER': this.handleONUTrigger(ev.payload as { onuId: string; trigger: string }); break;
      case 'DBA_CYCLE': this.handleDBACycle(); break;
    }
  }

  private handleONUTrigger({ onuId, trigger }: { onuId: string; trigger: string }) {
    const { onus, updateONU } = useTopologyStore.getState();
    const simStore = useSimulationStore.getState();
    const onu = onus[onuId];
    if (!onu) return;

    const t = getTransition(onu.state, trigger);
    if (!t) return;

    // Apply transition after delay
    const doTransition = () => {
      const freshONU = useTopologyStore.getState().onus[onuId];
      if (!freshONU) return;
      const { simTimestamp } = useSimulationStore.getState();

      updateONU(onuId, { state: t.to, stateEnteredAt: simTimestamp });

      // Update fiber traffic animation when O5
      if (t.to === 'O5') {
        const { fibers } = useTopologyStore.getState();
        Object.values(fibers).forEach(f => {
          if (f.targetId === onuId || f.sourceId === onuId) {
            useTopologyStore.getState().updateFiber(f.id, { trafficActive: true });
          }
        });
      }

      // Emit event
      simStore.addEvent({
        timestamp: simTimestamp,
        type: t.to === 'O5' ? 'ONU_REGISTERED' : 'ONU_STATE_CHANGE',
        sourceId: onuId,
        sourceName: freshONU.label,
        message: `${freshONU.label} → ${t.to} (${trigger})`,
        severity: t.to === 'O5' ? 'INFO' : t.to === 'O6' ? 'MAJOR' : 'INFO',
      });

      // Clear alarms on recovery
      if (t.to === 'O5' || t.to === 'O2') {
        simStore.clearAlarmsForDevice(onuId, simTimestamp);
      }
      // Raise LOS alarm on O6
      if (t.to === 'O6') {
        simStore.raiseAlarm({
          code: 'LOS',
          description: `Loss of Signal on ${freshONU.label}`,
          severity: 'MAJOR',
          sourceId: onuId,
          sourceName: freshONU.label,
        });
        // Auto-restore after a while
        this.schedule(3000 + Math.random() * 5000, 'ONU_TRIGGER', { onuId, trigger: 'SIGNAL_RESTORED' });
        return;
      }

      // Chain next trigger
      if (t.nextTrigger) {
        this.schedule(t.delayMs, 'ONU_TRIGGER', { onuId, trigger: t.nextTrigger });
      }
    };

    if (t.delayMs > 0) {
      this.schedule(t.delayMs, 'ONU_TRIGGER', { onuId, trigger: t.nextTrigger ?? '__noop__' });
      // We need to do the state update immediately then chain
      // Actually update state now, schedule next trigger
      const { simTimestamp } = useSimulationStore.getState();
      updateONU(onuId, { state: t.to, stateEnteredAt: simTimestamp });
      simStore.addEvent({
        timestamp: simTimestamp,
        type: 'ONU_STATE_CHANGE',
        sourceId: onuId,
        sourceName: onu.label,
        message: `${onu.label} → ${t.to} (${trigger})`,
        severity: t.to === 'O5' ? 'INFO' : t.to === 'O6' ? 'MAJOR' : 'INFO',
      });
      if (t.to === 'O6') {
        simStore.raiseAlarm({ code: 'LOS', description: `Loss of Signal on ${onu.label}`, severity: 'MAJOR', sourceId: onuId, sourceName: onu.label });
        this.schedule(3000 + Math.random() * 5000, 'ONU_TRIGGER', { onuId, trigger: 'SIGNAL_RESTORED' });
        return;
      }
      if (t.to === 'O5') {
        const { fibers, updateFiber } = useTopologyStore.getState();
        Object.values(fibers).forEach(f => {
          if (f.targetId === onuId || f.sourceId === onuId) updateFiber(f.id, { trafficActive: true });
        });
        simStore.addEvent({ timestamp: simTimestamp, type: 'ONU_REGISTERED', sourceId: onuId, sourceName: onu.label, message: `${onu.label} registered — ONU-ID: ${onu.onuIndex ?? '?'}`, severity: 'INFO' });
        simStore.clearAlarmsForDevice(onuId, simTimestamp);
      }
      // Emit capture frames for state transitions O2-O5
      if (['O2','O3','O4','O5'].includes(t.to)) {
        simStore.addCaptureFrame(makePLOAM(onu.label, onu.serialNumber, t.to, simTimestamp));
      }
      // OMCI burst when reaching O5
      if (t.to === 'O5') {
        for (let i = 0; i < 8; i++) {
          const msgTypes = ['MIB_Reset', 'MIB_Reset_Response', 'MIB_Upload', 'MIB_Upload_Next', 'Get', 'Get_Response', 'Set', 'Set_Response'];
          simStore.addCaptureFrame(makeOMCI(onu.label, msgTypes[i], simTimestamp, i));
        }
      }
      if (t.nextTrigger) {
        this.schedule(t.delayMs, 'ONU_TRIGGER', { onuId, trigger: t.nextTrigger });
      }
    } else {
      doTransition();
    }
  }

  private handleDBACycle() {
    const { onus } = useTopologyStore.getState();
    const { simTimestamp } = useSimulationStore.getState();
    const onuList = Object.values(onus);

    // Run DBA for first OLT's standard (assume homogeneous for now)
    const standard = onuList[0]?.standard ?? 'GPON';
    const allocations = runDBACycle(onuList, standard);

    const { olts } = useTopologyStore.getState();
    const oltLabel = Object.values(olts)[0]?.label ?? 'OLT';
    let captureThisCycle = false;

    onuList.filter(o => o.state === 'O5').forEach(onu => {
      const bytes = allocations[onu.id] ?? 0;
      const flow = generateTrafficFlow(onu, bytes, simTimestamp);
      useSimulationStore.getState().updateTrafficFlow(flow);

      // Emit capture frames ~every 10 DBA cycles to avoid flooding (throttle to ~1 per second at 1x speed)
      if (!captureThisCycle && bytes > 0 && Math.random() < 0.15) {
        captureThisCycle = true;
        // DBA Report upstream
        useSimulationStore.getState().addCaptureFrame({
          simTime_ms: simTimestamp, source: onu.label, destination: oltLabel,
          protocol: 'DBA', length: 10, direction: 'upstream',
          info: `DBRu report — T-CONT alloc request ${Math.floor(bytes / 100)} kbps`,
          detail: [
            { name: 'Report Type', value: 'DBRu (SR-DBA)', bytes: '02' },
            { name: 'T-CONT Type', value: `Type ${onu.tconts[0]?.type ?? 4}`, bytes: hex(onu.tconts[0]?.type ?? 4) },
            { name: 'Buffer Occupancy', value: `${Math.floor(bytes / 100)} kbps`, bytes: hex(bytes & 0xFFFF, 4) },
          ],
        });
        // GEM frame with user traffic
        if (bytes > 200) {
          useSimulationStore.getState().addCaptureFrame(makeGEMFrame(onu.label, simTimestamp + 1, bytes, oltLabel));
        }
      }
    });

    // Reschedule DBA every 125ms sim time
    this.schedule(125, 'DBA_CYCLE', {});
  }
}

export const simEngine = new SimulationEngine();
