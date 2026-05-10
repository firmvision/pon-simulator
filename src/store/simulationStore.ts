import { create } from 'zustand';
import type { SimEvent, AlarmRecord, TrafficFlow, SimulationState } from '../types/simulation';
import { generateId } from '../utils/idGenerator';

interface SimulationStore extends SimulationState {
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSpeed: (multiplier: number) => void;
  addEvent: (event: Omit<SimEvent, 'id' | 'wallTime'>) => void;
  raiseAlarm: (alarm: Omit<AlarmRecord, 'id' | 'raisedAt' | 'clearedAt'>) => void;
  clearAlarm: (alarmId: string, simTime: number) => void;
  clearAlarmsForDevice: (deviceId: string, simTime: number) => void;
  updateTrafficFlow: (flow: TrafficFlow) => void;
  removeTrafficFlow: (onuId: string) => void;
  advanceTime: (delta: number) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  running: false,
  simTimestamp: 0,
  speedMultiplier: 1,
  events: [],
  alarms: [],
  trafficFlows: {},

  startSimulation: () => set({ running: true }),
  pauseSimulation: () => set({ running: false }),

  resetSimulation: () => set({
    running: false,
    simTimestamp: 0,
    events: [],
    alarms: [],
    trafficFlows: {},
  }),

  setSpeed: (multiplier) => set({ speedMultiplier: multiplier }),

  advanceTime: (delta) => set(s => ({ simTimestamp: s.simTimestamp + delta })),

  addEvent: (event) => set(s => ({
    events: [{
      ...event,
      id: generateId('evt'),
      wallTime: new Date().toLocaleTimeString(),
    }, ...s.events].slice(0, 500),
  })),

  raiseAlarm: (alarm) => {
    const s = get();
    // Don't duplicate same alarm on same device
    const existing = s.alarms.find(a => a.code === alarm.code && a.sourceId === alarm.sourceId && !a.clearedAt);
    if (existing) return;
    set(st => ({
      alarms: [{
        ...alarm,
        id: generateId('alarm'),
        raisedAt: st.simTimestamp,
        clearedAt: null,
      }, ...st.alarms],
    }));
  },

  clearAlarm: (alarmId, simTime) => set(s => ({
    alarms: s.alarms.map(a => a.id === alarmId ? { ...a, clearedAt: simTime } : a),
  })),

  clearAlarmsForDevice: (deviceId, simTime) => set(s => ({
    alarms: s.alarms.map(a =>
      a.sourceId === deviceId && !a.clearedAt ? { ...a, clearedAt: simTime } : a
    ),
  })),

  updateTrafficFlow: (flow) => set(s => ({
    trafficFlows: { ...s.trafficFlows, [flow.onuId]: flow },
  })),

  removeTrafficFlow: (onuId) => set(s => {
    const trafficFlows = { ...s.trafficFlows };
    delete trafficFlows[onuId];
    return { trafficFlows };
  }),
}));
