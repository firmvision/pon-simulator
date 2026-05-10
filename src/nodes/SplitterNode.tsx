import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Splitter } from '../types/network';

export const SplitterNode = memo(({ data, selected }: NodeProps) => {
  const splitter = data as unknown as Splitter;
  const ratio = splitter.ratio;

  // Generate evenly-spaced bottom handles for each output port
  const handles = Array.from({ length: ratio }, (_, i) => ({
    id: `out-${i}`,
    left: `${((i + 1) / (ratio + 1)) * 100}%`,
  }));

  return (
    <div
      className={`pon-node${selected ? ' selected' : ''}`}
      style={{
        width: Math.max(80, ratio * 10 + 40),
        background: '#1a1a2e',
        borderColor: selected ? '#3b82f6' : '#7c3aed',
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} id="in" style={{ top: -5, background: '#7c3aed', border: '2px solid #5b21b6', width: 10, height: 10 }} />

      <div style={{ padding: '6px 8px' }}>
        {/* Triangle icon */}
        <svg width="32" height="20" viewBox="0 0 32 20" style={{ margin: '0 auto', display: 'block' }}>
          <polygon points="16,2 2,18 30,18" fill="none" stroke="#7c3aed" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="18" stroke="#4c1d95" strokeWidth="1" strokeDasharray="2"/>
        </svg>

        <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: 13, lineHeight: 1 }}>
          1:{ratio}
        </div>
        <div style={{ color: '#6d28d9', fontSize: 9, marginTop: 2 }}>
          -{splitter.insertionLoss_dB} dB
        </div>
        <div style={{ color: '#475569', fontSize: 9 }}>{splitter.label}</div>
      </div>

      {/* Output handles */}
      {handles.map(h => (
        <Handle
          key={h.id}
          type="source"
          position={Position.Bottom}
          id={h.id}
          style={{ left: h.left, bottom: -5, background: '#7c3aed', border: '2px solid #5b21b6', width: 8, height: 8 }}
        />
      ))}
    </div>
  );
});
SplitterNode.displayName = 'SplitterNode';
