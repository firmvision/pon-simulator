import { useTopologyStore } from '../../store/topologyStore';
import { useSimulationStore } from '../../store/simulationStore';
import { ONU_STATE_LABELS } from '../../types/protocol';
import { formatPower, formatBandwidth } from '../../utils/formatters';

export interface CommandResult {
  lines: Array<{ text: string; type: 'output' | 'error' | 'success' | 'info' | 'table' }>;
}

function ok(...lines: string[]): CommandResult {
  return { lines: lines.map(text => ({ text, type: 'table' as const })) };
}
function err(msg: string): CommandResult {
  return { lines: [{ text: `Error: ${msg}`, type: 'error' as const }] };
}
function info(msg: string): CommandResult {
  return { lines: [{ text: msg, type: 'info' as const }] };
}

const HELP_TEXT = `
Available commands:
  display ont info <frame> <slot>          List all ONUs on a PON port
  display ont optical-info <f> <s>         Show RX/TX power levels
  display ont register-info <f> <s>        Show ONU state history
  display alarm active                     List active alarms
  display dba-profile all                  List DBA profiles
  ont add <f> <s> sn-auth <serial>         Provision ONU by serial number
  display service-port all                 Show configured service ports
  interface gpon <f>/<s>                   Enter PON interface context
  display version                          Show system information
  quit / exit                              Exit context
  clear terminal                           Clear terminal output
  help / ?                                 Show this help
`.trim();

export function executeCommand(raw: string): CommandResult {
  const input = raw.trim();
  if (!input) return { lines: [] };

  const lower = input.toLowerCase();
  const topo = useTopologyStore.getState();
  const simState = useSimulationStore.getState();
  const onuList = Object.values(topo.onus);
  const oltList = Object.values(topo.olts);

  // help
  if (lower === 'help' || lower === '?') {
    return { lines: HELP_TEXT.split('\n').map(t => ({ text: t, type: 'output' as const })) };
  }

  // clear terminal
  if (lower === 'clear terminal' || lower === 'clear') {
    return { lines: [{ text: '__CLEAR__', type: 'output' as const }] };
  }

  // quit / exit
  if (lower === 'quit' || lower === 'exit') {
    return info('Returning to enable mode...');
  }

  // display version
  if (lower === 'display version') {
    const olt = oltList[0];
    return ok(
      `MA5800-X17 V100R019C10SPC200 -- PON Simulator v1.0`,
      `Vendor: ${olt?.vendor ?? 'Huawei'}   Model: ${olt?.model ?? 'MA5800-X17'}`,
      `Standard: ${olt?.standard ?? 'GPON'}   Uptime: ${Math.floor(simState.simTimestamp / 1000)}s (sim)`,
    );
  }

  // interface gpon
  if (lower.startsWith('interface gpon')) {
    return info(`Entering GPON interface context... (type "quit" to exit)`);
  }

  // display ont info
  const ontInfoMatch = input.match(/display ont info\s+(\d+)\s+(\d+)/i);
  if (ontInfoMatch) {
    const lines: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────────────────────────────────', type: 'table' },
      { text: '  ONT    SN               State   ONU-ID   Model        Vendor   Signal(dBm)', type: 'table' },
      { text: '─────────────────────────────────────────────────────────────────────────────', type: 'table' },
    ];
    if (onuList.length === 0) {
      lines.push({ text: '  (no ONUs configured)', type: 'output' });
    } else {
      onuList.forEach((onu, i) => {
        const id = onu.onuIndex !== null ? String(onu.onuIndex).padStart(3) : '  -';
        const sn = onu.serialNumber.padEnd(16);
        const state = (ONU_STATE_LABELS[onu.state] ?? onu.state).padEnd(8);
        const model = (onu.model ?? '').padEnd(12);
        const vendor = (onu.vendor ?? '').padEnd(8);
        const rx = onu.rxPower_dBm !== undefined ? formatPower(onu.rxPower_dBm).padStart(8) : '  --';
        lines.push({ text: `  ${String(i).padStart(3)}  ${sn} ${state} ${id}   ${model} ${vendor} ${rx}`, type: 'table' });
      });
    }
    lines.push({ text: '─────────────────────────────────────────────────────────────────────────────', type: 'table' });
    lines.push({ text: `Total: ${onuList.length} ONT(s)`, type: 'output' });
    return { lines };
  }

  // display ont optical-info
  if (input.match(/display ont optical-info/i)) {
    const lines: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────────', type: 'table' },
      { text: '  ONT    Label        RX Power   Margin   State', type: 'table' },
      { text: '─────────────────────────────────────────────────────', type: 'table' },
    ];
    onuList.forEach((onu, i) => {
      const rx = onu.rxPower_dBm !== undefined ? formatPower(onu.rxPower_dBm) : '--';
      const mg = onu.signalMargin_dB !== undefined ? `${onu.signalMargin_dB.toFixed(1)} dB` : '--';
      lines.push({ text: `  ${String(i).padStart(3)}  ${onu.label.padEnd(12)} ${rx.padEnd(10)} ${mg.padEnd(8)} ${onu.state}`, type: 'table' });
    });
    lines.push({ text: '─────────────────────────────────────────────────────', type: 'table' });
    return { lines };
  }

  // display ont register-info
  if (input.match(/display ont register-info/i)) {
    const lines: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────', type: 'table' },
      { text: '  ONT    Label        Current-State   ONU-ID', type: 'table' },
      { text: '─────────────────────────────────────────────────', type: 'table' },
    ];
    onuList.forEach((onu, i) => {
      const state = ONU_STATE_LABELS[onu.state] ?? onu.state;
      lines.push({ text: `  ${String(i).padStart(3)}  ${onu.label.padEnd(12)} ${state.padEnd(16)} ${onu.onuIndex ?? '--'}`, type: 'table' });
    });
    lines.push({ text: '─────────────────────────────────────────────────', type: 'table' });
    return { lines };
  }

  // display alarm active
  if (lower === 'display alarm active') {
    const active = simState.alarms.filter(a => !a.clearedAt);
    if (active.length === 0) return ok('No active alarms.');
    const lines: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────────────────', type: 'table' },
      { text: '  Code   Severity  Device        Description', type: 'table' },
      { text: '─────────────────────────────────────────────────────────────', type: 'table' },
      ...active.map(a => ({
        text: `  ${a.code.padEnd(6)} ${a.severity.padEnd(9)} ${a.sourceName.padEnd(14)} ${a.description}`,
        type: 'error' as const,
      })),
      { text: '─────────────────────────────────────────────────────────────', type: 'table' },
      { text: `Total: ${active.length} alarm(s)`, type: 'output' },
    ];
    return { lines };
  }

  // display dba-profile all
  if (lower === 'display dba-profile all') {
    const profiles = Object.values(topo.dbaProfiles);
    const lines: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────────────────────', type: 'table' },
      { text: '  ID   Name            Type  Fixed(kbps)  Assured(kbps)  Max(kbps)', type: 'table' },
      { text: '─────────────────────────────────────────────────────────────────', type: 'table' },
      ...profiles.map(p => ({
        text: `  ${p.id.padEnd(5)} ${p.name.padEnd(16)} ${p.type}    ${String(p.fixedBandwidth_kbps).padEnd(12)} ${String(p.assuredBandwidth_kbps).padEnd(14)} ${p.maxBandwidth_kbps}`,
        type: 'table' as const,
      })),
      { text: '─────────────────────────────────────────────────────────────────', type: 'table' },
    ];
    return { lines };
  }

  // display service-port all
  if (lower.includes('service-port')) {
    const lines: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────────────────────', type: 'table' },
      { text: '  ONT    Label        S-VLAN  C-VLAN  Service   GEM-Port', type: 'table' },
      { text: '─────────────────────────────────────────────────────────────────', type: 'table' },
    ];
    onuList.forEach((onu, i) => {
      onu.serviceVlans.forEach(sv => {
        lines.push({ text: `  ${String(i).padStart(3)}  ${onu.label.padEnd(12)} ${sv.svlan.toString().padEnd(7)} ${sv.cvlan.toString().padEnd(7)} ${sv.serviceType.padEnd(9)} ${sv.gemPortId}`, type: 'table' });
      });
    });
    lines.push({ text: '─────────────────────────────────────────────────────────────────', type: 'table' });
    return { lines };
  }

  // ont add
  const ontAddMatch = input.match(/ont add\s+(\d+)\s+(\d+)\s+sn-auth\s+"?([A-Za-z0-9]+)"?/i);
  if (ontAddMatch) {
    const serial = ontAddMatch[3].toUpperCase();
    const existing = onuList.find(o => o.serialNumber.toUpperCase() === serial);
    if (existing) return err(`ONU with serial ${serial} already exists as ${existing.label}`);
    const id = topo.addONU({ x: 400, y: 400 });
    topo.updateONU(id, { serialNumber: serial });
    return { lines: [{ text: `ONU added: serial=${serial}, id=${id}. Drag it on the canvas to position it.`, type: 'success' as const }] };
  }

  return err(`Unknown command: "${input}". Type "help" for usage.`);
}
