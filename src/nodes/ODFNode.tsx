import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ODF } from '../types/network';

export const ODFNode = memo(({ data, selected }: NodeProps) => {
  const odf = data as unknown as ODF;
  return (
    <div
      className={`pon-node${selected ? ' selected' : ''}`}
      style={{ width: 100, background: '#1c1917', borderColor: selected ? '#3b82f6' : '#78716c' }}
    >
      <Handle type="target" position={Position.Top} id="in" style={{ top: -5, background: '#78716c', border: '2px solid #57534e', width: 10, height: 10 }} />

      <div style={{ padding: '5px 8px', textAlign: 'center' }}>
        <div style={{ color: '#a8a29e', fontSize: 9, letterSpacing: 0.5, fontWeight: 600 }}>ODF</div>
        <svg width="28" height="20" viewBox="0 0 28 20" style={{ margin: '2px auto', display: 'block' }}>
          <rect x="1" y="1" width="26" height="18" rx="2" fill="none" stroke="#78716c" strokeWidth="1.5"/>
          {Array.from({ length: 6 }, (_, i) => (
            <circle key={i} cx={4 + i * 4} cy="10" r="1.5" fill="#57534e"/>
          ))}
        </svg>
        <div style={{ color: '#a8a29e', fontWeight: 700, fontSize: 10 }}>{odf.label}</div>
        <div style={{ color: '#57534e', fontSize: 8 }}>{odf.portCount}F patch</div>
      </div>

      <Handle type="source" position={Position.Bottom} id="out" style={{ bottom: -5, background: '#78716c', border: '2px solid #57534e', width: 10, height: 10 }} />
    </div>
  );
});
ODFNode.displayName = 'ODFNode';
