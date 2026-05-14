import { useRef, useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useTopologyStore } from '../../store/topologyStore';
import { executeCommand } from './commandParser';

const OLT_PROMPT = 'MA5800-X17(config)# ';

export function CliTerminal() {
  const lines = useUIStore(s => s.terminalLines);
  const history = useUIStore(s => s.terminalHistory);
  const terminalContext = useUIStore(s => s.terminalContext);
  const { appendTerminalLine, addToHistory, clearTerminal } = useUIStore();

  // Read context device label for the prompt
  const contextDevice = useTopologyStore(s => terminalContext ? s.endDevices[terminalContext] : null);
  const selectedNodeId = useTopologyStore(s => s.selectedNodeId);
  const selectedEndDevice = useTopologyStore(s => selectedNodeId ? s.endDevices[selectedNodeId] : null);

  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const [showConnectHint, setShowConnectHint] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new lines arrive
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  // Show hint when user selects an end device on canvas
  useEffect(() => {
    if (selectedEndDevice && !terminalContext) {
      setShowConnectHint(true);
      const t = setTimeout(() => setShowConnectHint(false), 4000);
      return () => clearTimeout(t);
    } else {
      setShowConnectHint(false);
    }
  }, [selectedEndDevice, terminalContext]);

  const prompt = contextDevice
    ? `${contextDevice.label}> `
    : OLT_PROMPT;

  const handleSubmit = useCallback(() => {
    const cmd = input.trim();
    appendTerminalLine({ text: prompt + cmd, type: 'input' });
    addToHistory(cmd);
    setInput('');
    setHistIdx(-1);

    const result = executeCommand(cmd);
    result.lines.forEach(l => {
      if (l.text === '__CLEAR__') {
        clearTerminal();
      } else {
        appendTerminalLine(l);
      }
    });
  }, [input, prompt, appendTerminalLine, addToHistory, clearTerminal]);

  // Tab completion
  const getCompletions = useCallback(() => {
    if (terminalContext) {
      return ['ping ', 'traceroute ', 'ipconfig', 'arp -a', 'tracert ', 'netstat', 'nslookup ', 'back', 'help', 'clear',
              'show ip route', 'show interfaces', 'show arp', 'enable'];
    }
    return ['display ont info 0 0', 'display ont optical-info 0 0', 'display ont register-info 0 0',
            'display alarm active', 'display dba-profile all', 'display service-port all',
            'display end-devices', 'display version', 'ont add 0 0 sn-auth "', 'interface gpon 0/0',
            'connect ', 'help', 'clear'];
  }, [terminalContext]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : history[next] ?? '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const cmds = getCompletions();
      const match = cmds.find(c => c.startsWith(input));
      if (match) setInput(match);
    }
  };

  const lineColor: Record<string, string> = {
    output: '#64748b', input: '#60a5fa', error: '#ef4444',
    success: '#22c55e', info: '#f59e0b', table: '#94a3b8',
  };

  const isDeviceCtx = !!terminalContext;

  return (
    <div className="terminal-wrap" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      onClick={() => inputRef.current?.focus()}>

      {/* Context banner */}
      {isDeviceCtx && (
        <div style={{
          padding: '3px 8px', background: '#0c2a0c', borderBottom: '1px solid #16a34a44',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <span style={{ color: '#22c55e', fontSize: 9, fontFamily: 'monospace' }}>
            🖥 {contextDevice?.deviceType?.toUpperCase().replace('-', ' ')} terminal: <strong>{contextDevice?.label}</strong>
            &nbsp;({contextDevice?.ipAddress})
          </span>
          <button
            onClick={() => { useUIStore.getState().setTerminalContext(null); }}
            style={{ marginLeft: 'auto', background: 'none', border: '1px solid #16a34a44', borderRadius: 3, color: '#4ade80', cursor: 'pointer', fontSize: 8, padding: '1px 5px', fontFamily: 'monospace' }}
          >✕ back to OLT</button>
        </div>
      )}

      {/* Connect hint */}
      {showConnectHint && selectedEndDevice && (
        <div
          style={{
            padding: '4px 8px', background: '#0c1a2e', borderBottom: '1px solid #1d4ed844',
            cursor: 'pointer', flexShrink: 0,
          }}
          onClick={() => {
            setInput(`connect ${selectedEndDevice.label}`);
            inputRef.current?.focus();
            setShowConnectHint(false);
          }}
        >
          <span style={{ color: '#60a5fa', fontSize: 9, fontFamily: 'monospace' }}>
            💡 Click to connect to <strong>{selectedEndDevice.label}</strong> ({selectedEndDevice.ipAddress})
          </span>
        </div>
      )}

      {/* Output area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '6px 8px', userSelect: 'text' }}>
        {lines.map(l => (
          <div key={l.id} style={{ color: lineColor[l.type] ?? '#94a3b8', whiteSpace: 'pre', lineHeight: '1.5', fontSize: 12 }}>
            {l.text}
          </div>
        ))}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', alignItems: 'center', borderTop: '1px solid #1e293b', padding: '4px 8px', background: '#0c0c0c' }}>
        <span style={{ color: isDeviceCtx ? '#22c55e' : '#22c55e', fontSize: 12, marginRight: 4, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {prompt}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: '#e2e8f0', fontFamily: 'Consolas, monospace', fontSize: 12,
            caretColor: '#22c55e',
          }}
        />
      </div>
    </div>
  );
}
