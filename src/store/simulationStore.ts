import { create } from 'zustand';
import type { SimEvent, AlarmRecord, TrafficFlow, SimulationState, CaptureFrame } from '../types/simulation';
import { generateId } from '../utils/idGenerator';

interface SimulationStore extends SimulationState {
  // replay state
  replayIndex: number;       // -1 = live (not in replay), ≥0 = index into captureFrames
  replayPlaying: boolean;    // auto-advancing replay
  replayFps: number;         // replay speed in frames-per-second

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
  addCaptureFrame: (frame: Omit<CaptureFrame, 'no'>) => void;
  clearCapture: () => void;
  toggleCapture: () => void;
  // replay actions
  enterReplay: (index?: number) => void;
  exitReplay: () => void;
  setReplayIndex: (index: number) => void;
  stepReplay: (dir: 'forward' | 'backward') => void;
  toggleReplayPlay: () => void;
  setReplayFps: (fps: number) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  running: false,
  simTimestamp: 0,
  speedMultiplier: 1,
  events: [],
  alarms: [],
  trafficFlows: {},
  captureFrames: [],
  captureRunning: true,
  replayIndex: -1,
  replayPlaying: false,
  replayFps: 2,

  startSimulation: () => set({ running: true }),
  pauseSimulation: () => set({ running: false }),

  resetSimulation: () => set({
    running: false,
    simTimestamp: 0,
    events: [],
    alarms: [],
    trafficFlows: {},
    captureFrames: [],
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

  addCaptureFrame: (frame) => set(s => {
    if (!s.captureRunning) return {};
    const no = s.captureFrames.length + 1;
    return { captureFrames: [...s.captureFrames, { ...frame, no }].slice(-2000) };
  }),

  clearCapture: () => set({ captureFrames: [], replayIndex: -1, replayPlaying: false }),
  toggleCapture: () => set(s => ({ captureRunning: !s.captureRunning })),

  enterReplay: (index) => {
    const s = get();
    const idx = index ?? Math.max(0, s.captureFrames.length - 1);
    set({ replayIndex: Math.min(idx, s.captureFrames.length - 1), replayPlaying: false });
  },

  exitReplay: () => set({ replayIndex: -1, replayPlaying: false }),

  setReplayIndex: (index) => {
    const s = get();
    const clamped = Math.max(0, Math.min(index, s.captureFrames.length - 1));
    set({ replayIndex: clamped });
  },

  stepReplay: (dir) => {
    const s = get();
    if (s.captureFrames.length === 0) return;
    const cur = s.replayIndex < 0 ? s.captureFrames.length - 1 : s.replayIndex;
    const next = dir === 'forward'
      ? Math.min(cur + 1, s.captureFrames.length - 1)
      : Math.max(cur - 1, 0);
    set({ replayIndex: next, replayPlaying: false });
  },

  toggleReplayPlay: () => {
    const s = get();
    if (!s.replayPlaying && s.replayIndex < 0) {
      // Start replay from beginning
      set({ replayIndex: 0, replayPlaying: true });
    } else {
      set(st => ({ replayPlaying: !st.replayPlaying }));
    }
  },

  setReplayFps: (fps) => set({ replayFps: fps }),
}));
