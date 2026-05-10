import type { ONUState } from '../types/network';

export interface StateTransition {
  from: ONUState;
  to: ONUState;
  trigger: string;
  delayMs: number;         // sim ms
  nextTrigger?: string;    // auto-fire next trigger after delay
}

export const TRANSITIONS: StateTransition[] = [
  { from: 'O1', to: 'O2', trigger: 'POWER_ON',            delayMs: 50,  nextTrigger: 'SYNC_ACQUIRED' },
  { from: 'O2', to: 'O3', trigger: 'SYNC_ACQUIRED',       delayMs: 200, nextTrigger: 'SN_SENT' },
  { from: 'O3', to: 'O4', trigger: 'SN_SENT',             delayMs: 100, nextTrigger: 'RANGING_DONE' },
  { from: 'O4', to: 'O5', trigger: 'RANGING_DONE',        delayMs: 300 },
  { from: 'O5', to: 'O6', trigger: 'LOSS_OF_SIGNAL',      delayMs: 0 },
  { from: 'O6', to: 'O2', trigger: 'SIGNAL_RESTORED',     delayMs: 100, nextTrigger: 'SYNC_ACQUIRED' },
];

export function getTransition(from: ONUState, trigger: string): StateTransition | undefined {
  return TRANSITIONS.find(t => t.from === from && t.trigger === trigger);
}
