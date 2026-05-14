import { useTopologyStore } from '../../store/topologyStore';
import { useSimulationStore } from '../../store/simulationStore';
import { useUIStore } from '../../store/uiStore';
import { ONU_STATE_LABELS } from '../../types/protocol';
import { formatPower } from '../../utils/formatters';
import type { EndDevice } from '../../types/network';

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
function success(msg: string): CommandResult {
  return { lines: [{ text: msg, type: 'success' as const }] };
}
function lines(...texts: string[]): CommandResult {
  return { lines: texts.map(text => ({ text, type: 'output' as const })) };
}

// ── Simulated ping ────────────────────────────────────────────────────────────
function simulatePing(srcDevice: EndDevice, targetIp: string): CommandResult {
  const topo = useTopologyStore.getState();
  const allDevices = Object.values(topo.endDevices);
  const target = allDevices.find(d => d.ipAddress === targetIp);
  const reachable = target || targetIp.startsWith('8.8') || targetIp.startsWith('1.1');

  const result: CommandResult['lines'] = [];
  result.push({ text: `\nPinging ${targetIp} from ${srcDevice.ipAddress}:`, type: 'info' });

  if (!reachable) {
    for (let i = 0; i < 4; i++) {
      result.push({ text: `Request timeout for icmp_seq ${i}`, type: 'error' });
    }
    result.push({ text: `\n--- ${targetIp} ping statistics ---`, type: 'output' });
    result.push({ text: `4 packets transmitted, 0 received, 100% packet loss`, type: 'error' });
  } else {
    const baseRtt = target ? 2 + Math.random() * 3 : 15 + Math.random() * 25;
    const rtts: number[] = [];
    for (let i = 0; i < 4; i++) {
      const rtt = baseRtt + (Math.random() - 0.5) * 2;
      rtts.push(rtt);
      result.push({ text: `Reply from ${targetIp}: bytes=32 time=${rtt.toFixed(1)}ms TTL=64`, type: 'success' });
    }
    const avg = rtts.reduce((a, b) => a + b, 0) / rtts.length;
    result.push({ text: `\n--- ${targetIp} ping statistics ---`, type: 'output' });
    result.push({ text: `4 packets transmitted, 4 received, 0% packet loss`, type: 'success' });
    result.push({ text: `rtt min/avg/max = ${Math.min(...rtts).toFixed(1)}/${avg.toFixed(1)}/${Math.max(...rtts).toFixed(1)} ms`, type: 'output' });
  }
  return { lines: result };
}

// ── Simulated traceroute ──────────────────────────────────────────────────────
function simulateTraceroute(srcDevice: EndDevice, targetIp: string): CommandResult {
  const topo = useTopologyStore.getState();
  const onus = Object.values(topo.onus);
  const result: CommandResult['lines'] = [];
  result.push({ text: `\ntraceroute to ${targetIp} (${targetIp}), 30 hops max:`, type: 'info' });

  // Build hop path: device → ONU gateway → OLT → internet
  let hop = 1;
  const gateway = srcDevice.ipAddress.replace(/\.\d+$/, '.1');
  result.push({ text: `  ${hop++}  ${gateway} (ONU Gateway)  ${(1 + Math.random()).toFixed(1)} ms`, type: 'output' });

  const onu = onus.find(o => o.state === 'O5');
  if (onu) {
    result.push({ text: `  ${hop++}  10.0.0.1 (OLT-${onu.oltId?.slice(-1) ?? '1'})  ${(2 + Math.random() * 2).toFixed(1)} ms`, type: 'output' });
  }

  const isExternal = !targetIp.startsWith('192.168') && !targetIp.startsWith('10.');
  if (isExternal) {
    result.push({ text: `  ${hop++}  172.16.0.1 (ISP Edge)  ${(8 + Math.random() * 4).toFixed(1)} ms`, type: 'output' });
    result.push({ text: `  ${hop++}  203.0.113.1 (Transit)  ${(18 + Math.random() * 8).toFixed(1)} ms`, type: 'output' });
    result.push({ text: `  ${hop++}  ${targetIp}  ${(22 + Math.random() * 10).toFixed(1)} ms`, type: 'success' });
  } else {
    result.push({ text: `  ${hop++}  ${targetIp}  ${(1 + Math.random()).toFixed(1)} ms`, type: 'success' });
  }
  return { lines: result };
}

// ── Simulated ARP ─────────────────────────────────────────────────────────────
function simulateArp(srcDevice: EndDevice): CommandResult {
  const topo = useTopologyStore.getState();
  const allDevices = Object.values(topo.endDevices).filter(d => d.id !== srcDevice.id);
  const gateway = srcDevice.ipAddress.replace(/\.\d+$/, '.1');
  const result: CommandResult['lines'] = [
    { text: '\nARP cache:', type: 'info' },
    { text: '  Internet Address      Physical Address      Type', type: 'table' },
    { text: `  ${gateway.padEnd(22)}${randomMac().padEnd(22)}dynamic`, type: 'output' },
  ];
  allDevices.slice(0, 4).forEach(d => {
    result.push({ text: `  ${d.ipAddress.padEnd(22)}${d.macAddress.padEnd(22)}dynamic`, type: 'output' });
  });
  return { lines: result };
}

function randomMac() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':');
}

// ── Simulated ipconfig ────────────────────────────────────────────────────────
function simulateIpconfig(dev: EndDevice): CommandResult {
  const gateway = dev.ipAddress.replace(/\.\d+$/, '.1');
  const subnet = '255.255.255.0';
  const dns1 = '8.8.8.8';
  const dns2 = '8.8.4.4';

  return lines(
    '',
    `${dev.label} Ethernet adapter:`,
    `   Description . . . . : Virtual Ethernet (PON Sim)`,
    `   Physical Address. . : ${dev.macAddress}`,
    `   DHCP Enabled. . . . : Yes`,
    `   IPv4 Address. . . . : ${dev.ipAddress}`,
    `   Subnet Mask . . . . : ${subnet}`,
    `   Default Gateway . . : ${gateway}`,
    `   DNS Servers . . . . : ${dns1}`,
    `                         ${dns2}`,
    '',
  );
}

// ── Router show ip route ──────────────────────────────────────────────────────
function showIpRoute(dev: EndDevice): CommandResult {
  const gateway = dev.ipAddress.replace(/\.\d+$/, '.1');
  return lines(
    '',
    'Codes: C - connected, S - static, R - RIP, O - OSPF',
    '',
    `C    192.168.1.0/24 is directly connected, GigabitEthernet0/0`,
    `S*   0.0.0.0/0 [1/0] via ${gateway}`,
    '',
  );
}

// ── HELP texts ────────────────────────────────────────────────────────────────
const OLT_HELP = `
OLT MA5800 Commands:
  display ont info <frame> <slot>       List all ONUs
  display ont optical-info <f> <s>      Show RX/TX power
  display ont register-info <f> <s>     Show ONU state history
  display alarm active                  Active alarms
  display dba-profile all               DBA profiles
  display service-port all              Service VLANs
  display version                       System info
  ont add <f> <s> sn-auth "<serial>"    Provision ONU
  interface gpon <f>/<s>                Enter PON interface
  connect <device-name>                 Switch to device terminal
  clear terminal / clear                Clear screen
  help / ?                              This help`.trim();

const PC_HELP = `
PC / Host Commands:
  ping <ip>                             Send ICMP echo (4 packets)
  ping <ip> -t                          Continuous ping
  traceroute <ip>  / tracert <ip>       Trace network path
  ipconfig  / ip addr                   Show IP configuration
  arp -a                                Show ARP cache
  nslookup <domain>                     DNS lookup
  netstat                               Active connections
  connect <device-name>                 Switch to another device
  back / exit                           Return to OLT terminal
  clear                                 Clear screen
  help / ?                              This help`.trim();

const ROUTER_HELP = `
Router Commands:
  show ip route                         Routing table
  show interfaces                       Interface list
  show arp                              ARP table
  ping <ip>                             Ping test
  traceroute <ip>                       Trace path
  ipconfig / show ip int brief          Interface IPs
  enable                                Privileged mode
  connect <device-name>                 Switch to another device
  back / exit                           Return to OLT
  clear                                 Clear screen
  help / ?                              This help`.trim();

// ── Main command dispatcher ───────────────────────────────────────────────────
export function executeCommand(raw: string): CommandResult {
  const input = raw.trim();
  if (!input) return { lines: [] };

  const lower = input.toLowerCase();
  const topo = useTopologyStore.getState();
  const simState = useSimulationStore.getState();
  const onuList = Object.values(topo.onus);
  const oltList = Object.values(topo.olts);

  // ── Current device context ────────────────────────────────────────────────
  const uiState = useUIStore.getState();
  const contextId = uiState.terminalContext ?? null;
  const contextDevice = contextId ? topo.endDevices[contextId] : null;

  // ── Universal commands ────────────────────────────────────────────────────
  if (lower === 'clear terminal' || lower === 'clear') {
    return { lines: [{ text: '__CLEAR__', type: 'output' as const }] };
  }

  if (lower === 'back' || (lower === 'exit' && contextDevice)) {
    useUIStore.getState().setTerminalContext(null);
    return info('Returned to OLT MA5800-X17 terminal.');
  }

  // connect <device> — switch terminal context to a specific device
  const connectMatch = input.match(/^connect\s+(.+)/i);
  if (connectMatch) {
    const name = connectMatch[1].trim().toLowerCase();
    const allDevs = Object.values(topo.endDevices);
    const found = allDevs.find(d =>
      d.label.toLowerCase() === name ||
      d.ipAddress === name ||
      d.id === name ||
      d.label.toLowerCase().includes(name)
    );
    if (!found) return err(`Device "${connectMatch[1]}" not found. Check label or IP.`);
    useUIStore.getState().setTerminalContext(found.id);
    const typeLabel = found.deviceType.toUpperCase().replace('-', ' ');
    return {
      lines: [
        { text: `Connected to ${found.label} (${typeLabel}) — IP: ${found.ipAddress}`, type: 'success' },
        { text: `Type "help" for ${typeLabel} commands, "back" to return to OLT.`, type: 'info' },
      ],
    };
  }

  // ── Device context commands ───────────────────────────────────────────────
  if (contextDevice) {
    const isRouter = contextDevice.deviceType === 'router' || contextDevice.deviceType === 'wifi-ap';

    if (lower === 'help' || lower === '?') {
      const helpText = isRouter ? ROUTER_HELP : PC_HELP;
      return { lines: helpText.split('\n').map(t => ({ text: t, type: 'output' as const })) };
    }

    if (lower === 'quit' || lower === 'exit') {
      return info('Use "back" to return to OLT terminal.');
    }

    // ping
    const pingMatch = input.match(/^ping\s+([\d.]+|[a-zA-Z0-9.-]+)(\s+-t)?/i);
    if (pingMatch) {
      let ip = pingMatch[1];
      // Resolve simple hostnames
      if (ip === 'google.com' || ip === 'www.google.com') ip = '8.8.8.8';
      else if (ip === 'cloudflare.com') ip = '1.1.1.1';
      else if (ip.includes('.') === false) {
        return err(`Could not resolve hostname: ${ip}`);
      }
      return simulatePing(contextDevice, ip);
    }

    // traceroute / tracert
    const traceMatch = input.match(/^(traceroute|tracert)\s+([\d.]+|[a-zA-Z0-9.-]+)/i);
    if (traceMatch) {
      let ip = traceMatch[2];
      if (ip === 'google.com' || ip === 'www.google.com') ip = '8.8.8.8';
      return simulateTraceroute(contextDevice, ip);
    }

    // ipconfig / ip addr / ip address
    if (lower === 'ipconfig' || lower === 'ipconfig /all' || lower === 'ip addr' || lower === 'ip address' || lower === 'ifconfig') {
      return simulateIpconfig(contextDevice);
    }

    // arp
    if (lower === 'arp -a' || lower === 'arp') {
      return simulateArp(contextDevice);
    }

    // nslookup
    const nslookupMatch = input.match(/^nslookup\s+(\S+)/i);
    if (nslookupMatch) {
      const domain = nslookupMatch[1];
      const fakeIp = `${93 + Math.floor(Math.random() * 30)}.${184 + Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
      return lines('', `Server:  8.8.8.8`, `Address: 8.8.8.8#53`, '', `Non-authoritative answer:`, `Name:    ${domain}`, `Address: ${fakeIp}`, '');
    }

    // netstat
    if (lower === 'netstat' || lower === 'netstat -an') {
      const gateway = contextDevice.ipAddress.replace(/\.\d+$/, '.1');
      return lines(
        '', 'Active Internet connections:',
        'Proto  Local Address           Foreign Address         State',
        `tcp    ${contextDevice.ipAddress}:52341   8.8.8.8:443             ESTABLISHED`,
        `tcp    ${contextDevice.ipAddress}:52342   ${gateway}:80            ESTABLISHED`,
        `udp    ${contextDevice.ipAddress}:68      0.0.0.0:*`,
        '',
      );
    }

    // Router-specific commands
    if (isRouter) {
      if (lower === 'show ip route') return showIpRoute(contextDevice);

      if (lower === 'show arp') return simulateArp(contextDevice);

      if (lower === 'enable') {
        return success(`${contextDevice.label}#  (privileged mode)`);
      }

      if (lower.startsWith('show interfaces') || lower === 'show ip int brief') {
        const gateway = contextDevice.ipAddress.replace(/\.\d+$/, '.1');
        return lines(
          '',
          'Interface       IP-Address      Status   Protocol',
          `Gi0/0           ${contextDevice.ipAddress}       up       up`,
          `Gi0/1           ${gateway}          up       up`,
          `Lo0             127.0.0.1         up       up (loopback)`,
          '',
        );
      }

      if (lower.startsWith('show running') || lower === 'show run') {
        return lines(
          '',
          '! Running configuration',
          `hostname ${contextDevice.label}`,
          'ip routing',
          `interface GigabitEthernet0/0`,
          ` ip address ${contextDevice.ipAddress} 255.255.255.0`,
          ` no shutdown`,
          `ip route 0.0.0.0 0.0.0.0 ${contextDevice.ipAddress.replace(/\.\d+$/, '.1')}`,
          '',
        );
      }
    }

    return err(`Unknown command: "${input}". Type "help" for ${isRouter ? 'router' : 'PC'} commands.`);
  }

  // ── OLT context commands ──────────────────────────────────────────────────

  if (lower === 'help' || lower === '?') {
    return { lines: OLT_HELP.split('\n').map(t => ({ text: t, type: 'output' as const })) };
  }

  if (lower === 'quit' || lower === 'exit') {
    return info('Returning to enable mode...');
  }

  // display version
  if (lower === 'display version') {
    const olt = oltList[0];
    return ok(
      `MA5800-X17 V100R019C10SPC200 — PON Simulator v1.0`,
      `Vendor: ${olt?.vendor ?? 'Huawei'}   Model: ${olt?.model ?? 'MA5800-X17'}`,
      `Standard: ${olt?.standard ?? 'GPON'}   Uptime: ${Math.floor(simState.simTimestamp / 1000)}s (sim)`,
      `ONUs online: ${onuList.filter(o => o.state === 'O5').length}/${onuList.length}`,
    );
  }

  // interface gpon
  if (lower.startsWith('interface gpon')) {
    return info(`Entering GPON interface context... (type "quit" to exit)`);
  }

  // display ont info
  const ontInfoMatch = input.match(/display ont info\s+(\d+)\s+(\d+)/i);
  if (ontInfoMatch) {
    const result: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────────────────────────────────', type: 'table' },
      { text: '  ONT    SN               State    ONU-ID   Model        Vendor   Signal(dBm)', type: 'table' },
      { text: '─────────────────────────────────────────────────────────────────────────────', type: 'table' },
    ];
    if (onuList.length === 0) {
      result.push({ text: '  (no ONUs configured)', type: 'output' });
    } else {
      onuList.forEach((onu, i) => {
        const id = onu.onuIndex !== null ? String(onu.onuIndex).padStart(3) : '  -';
        const sn = onu.serialNumber.padEnd(16);
        const state = (ONU_STATE_LABELS[onu.state] ?? onu.state).padEnd(9);
        const model = (onu.model ?? '').padEnd(12);
        const vendor = (onu.vendor ?? '').padEnd(8);
        const rx = onu.rxPower_dBm !== undefined ? formatPower(onu.rxPower_dBm).padStart(8) : '  --';
        result.push({ text: `  ${String(i).padStart(3)}  ${sn} ${state} ${id}   ${model} ${vendor} ${rx}`, type: 'table' });
      });
    }
    result.push({ text: '─────────────────────────────────────────────────────────────────────────────', type: 'table' });
    result.push({ text: `Total: ${onuList.length} ONT(s)   Online: ${onuList.filter(o => o.state === 'O5').length}`, type: 'output' });
    return { lines: result };
  }

  // display ont optical-info
  if (input.match(/display ont optical-info/i)) {
    const result: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────────', type: 'table' },
      { text: '  ONT    Label        RX Power   Margin   State', type: 'table' },
      { text: '─────────────────────────────────────────────────────', type: 'table' },
    ];
    onuList.forEach((onu, i) => {
      const rx = onu.rxPower_dBm !== undefined ? formatPower(onu.rxPower_dBm) : '--';
      const mg = onu.signalMargin_dB !== undefined ? `${onu.signalMargin_dB.toFixed(1)} dB` : '--';
      result.push({ text: `  ${String(i).padStart(3)}  ${onu.label.padEnd(12)} ${rx.padEnd(10)} ${mg.padEnd(8)} ${onu.state}`, type: 'table' });
    });
    result.push({ text: '─────────────────────────────────────────────────────', type: 'table' });
    return { lines: result };
  }

  // display ont register-info
  if (input.match(/display ont register-info/i)) {
    const result: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────', type: 'table' },
      { text: '  ONT    Label        Current-State   ONU-ID', type: 'table' },
      { text: '─────────────────────────────────────────────────', type: 'table' },
    ];
    onuList.forEach((onu, i) => {
      const state = ONU_STATE_LABELS[onu.state] ?? onu.state;
      result.push({ text: `  ${String(i).padStart(3)}  ${onu.label.padEnd(12)} ${state.padEnd(16)} ${onu.onuIndex ?? '--'}`, type: 'table' });
    });
    result.push({ text: '─────────────────────────────────────────────────', type: 'table' });
    return { lines: result };
  }

  // display end-devices
  if (lower.includes('display end-device') || lower === 'display devices' || lower === 'show devices') {
    const devList = Object.values(topo.endDevices);
    if (devList.length === 0) return info('No end devices configured.');
    const result: CommandResult['lines'] = [
      { text: '──────────────────────────────────────────────────────────────────', type: 'table' },
      { text: '  Device       Type          IP Address       MAC Address', type: 'table' },
      { text: '──────────────────────────────────────────────────────────────────', type: 'table' },
      ...devList.map(d => ({
        text: `  ${d.label.padEnd(13)} ${d.deviceType.padEnd(13)} ${d.ipAddress.padEnd(16)} ${d.macAddress}`,
        type: 'table' as const,
      })),
      { text: '──────────────────────────────────────────────────────────────────', type: 'table' },
      { text: `Total: ${devList.length} end device(s). Use "connect <name>" to access.`, type: 'output' },
    ];
    return { lines: result };
  }

  // display alarm active
  if (lower === 'display alarm active') {
    const active = simState.alarms.filter(a => !a.clearedAt);
    if (active.length === 0) return ok('No active alarms.');
    const result: CommandResult['lines'] = [
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
    return { lines: result };
  }

  // display dba-profile all
  if (lower === 'display dba-profile all') {
    const profiles = Object.values(topo.dbaProfiles);
    const result: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────────────────────', type: 'table' },
      { text: '  ID   Name            Type  Fixed(kbps)  Assured(kbps)  Max(kbps)', type: 'table' },
      { text: '─────────────────────────────────────────────────────────────────', type: 'table' },
      ...profiles.map(p => ({
        text: `  ${p.id.padEnd(5)} ${p.name.padEnd(16)} ${p.type}    ${String(p.fixedBandwidth_kbps).padEnd(12)} ${String(p.assuredBandwidth_kbps).padEnd(14)} ${p.maxBandwidth_kbps}`,
        type: 'table' as const,
      })),
      { text: '─────────────────────────────────────────────────────────────────', type: 'table' },
    ];
    return { lines: result };
  }

  // display service-port all
  if (lower.includes('service-port')) {
    const result: CommandResult['lines'] = [
      { text: '─────────────────────────────────────────────────────────────────', type: 'table' },
      { text: '  ONT    Label        S-VLAN  C-VLAN  Service   GEM-Port', type: 'table' },
      { text: '─────────────────────────────────────────────────────────────────', type: 'table' },
    ];
    onuList.forEach((onu, i) => {
      onu.serviceVlans.forEach(sv => {
        result.push({ text: `  ${String(i).padStart(3)}  ${onu.label.padEnd(12)} ${sv.svlan.toString().padEnd(7)} ${sv.cvlan.toString().padEnd(7)} ${sv.serviceType.padEnd(9)} ${sv.gemPortId}`, type: 'table' });
      });
    });
    result.push({ text: '─────────────────────────────────────────────────────────────────', type: 'table' });
    return { lines: result };
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
