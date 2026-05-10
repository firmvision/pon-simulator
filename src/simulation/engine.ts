import { useTopologyStore, tracePathTo } from '../store/topologyStore';
import { useSimulationStore } from '../store/simulationStore';
import { getTransition } from './onuStateMachine';
import { computePowerBudget } from './opticalBudget';
import { runDBACycle, generateTrafficFlow } from './dbaAlgorithm';
import type { FiberSegment, Splitter, ODF } from '../types/network';

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

    onuList.filter(o => o.state === 'O5').forEach(onu => {
      const bytes = allocations[onu.id] ?? 0;
      const flow = generateTrafficFlow(onu, bytes, simTimestamp);
      useSimulationStore.getState().updateTrafficFlow(flow);
    });

    // Reschedule DBA every 125ms sim time
    this.schedule(125, 'DBA_CYCLE', {});
  }
}

export const simEngine = new SimulationEngine();
