import { create } from 'zustand';

export type RightPanel = 'properties' | 'terminal' | 'learn';
export type BottomPanel = 'eventlog' | 'bandwidth' | 'powerbudget' | 'capture';

export interface TerminalLine {
  id: string;
  text: string;
  type: 'output' | 'input' | 'error' | 'success' | 'info' | 'table';
}

export type ModuleSubTab = 'theory' | 'lab' | 'quiz';

interface UIStore {
  activeRightPanel: RightPanel;
  activeBottomPanel: BottomPanel;
  terminalLines: TerminalLine[];
  terminalHistory: string[];
  activeModuleId: string;
  moduleSubTab: ModuleSubTab;
  setActiveRightPanel: (panel: RightPanel) => void;
  setActiveBottomPanel: (panel: BottomPanel) => void;
  appendTerminalLine: (line: Omit<TerminalLine, 'id'>) => void;
  addToHistory: (cmd: string) => void;
  clearTerminal: () => void;
  setActiveModule: (id: string) => void;
  setModuleSubTab: (tab: ModuleSubTab) => void;
}

let lineId = 0;

export const useUIStore = create<UIStore>((set) => ({
  activeRightPanel: 'properties',
  activeBottomPanel: 'eventlog',
  activeModuleId: 'pon-fundamentals',
  moduleSubTab: 'theory',
  terminalLines: [
    { id: 'w0', text: '────────────────────────────────────────', type: 'output' },
    { id: 'w1', text: '  PON Network Simulator — OLT Terminal  ', type: 'info' },
    { id: 'w2', text: '  Huawei MA5800-X17 Compatible CLI       ', type: 'output' },
    { id: 'w3', text: '────────────────────────────────────────', type: 'output' },
    { id: 'w4', text: 'Type "help" for available commands.', type: 'output' },
    { id: 'w5', text: '', type: 'output' },
  ],
  terminalHistory: [],

  setActiveRightPanel: (panel) => set({ activeRightPanel: panel }),
  setActiveBottomPanel: (panel) => set({ activeBottomPanel: panel }),

  appendTerminalLine: (line) => set(s => ({
    terminalLines: [...s.terminalLines, { ...line, id: `line-${++lineId}` }].slice(-300),
  })),

  addToHistory: (cmd) => set(s => ({
    terminalHistory: [cmd, ...s.terminalHistory.filter(h => h !== cmd)].slice(0, 50),
  })),

  clearTerminal: () => set({ terminalLines: [] }),
  setActiveModule: (id) => set({ activeModuleId: id, moduleSubTab: 'theory' }),
  setModuleSubTab: (tab) => set({ moduleSubTab: tab }),
}));
