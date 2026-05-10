import { useRef, useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useTopologyStore } from '../../store/topologyStore';
import { executeCommand } from './commandParser';

const PROMPT = 'MA5800-X17(config)# ';

export function CliTerminal() {
  const lines = useUIStore(s => s.terminalLines);
  const history = useUIStore(s => s.terminalHistory);
  const { appendTerminalLine, addToHistory, clearTerminal } = useUIStore();
  const [input, setInput] = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const handleSubmit = useCallback(() => {
    const cmd = input.trim();
    appendTerminalLine({ text: PROMPT + cmd, type: 'input' });
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
  }, [input, appendTerminalLine, addToHistory, clearTerminal]);

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
      // Simple tab completion for first word
      const cmds = ['display ont info', 'display ont optical-info', 'display ont register-info', 'display alarm active', 'display dba-profile all', 'display service-port all', 'display version', 'ont add', 'interface gpon', 'help', 'quit'];
      const match = cmds.find(c => c.startsWith(input));
      if (match) setInput(match);
    }
  };

  const lineColor: Record<string, string> = {
    output: '#64748b', input: '#60a5fa', error: '#ef4444',
    success: '#22c55e', info: '#f59e0b', table: '#94a3b8',
  };

  return (
    <div className="terminal-wrap" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      onClick={() => inputRef.current?.focus()}>
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
        <span style={{ color: '#22c55e', fontSize: 12, marginRight: 4, flexShrink: 0 }}>{PROMPT}</span>
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
