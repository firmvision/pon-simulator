import { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';

export const WirelessEdge = memo(({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });
  const strokeColor = selected ? '#60a5fa' : '#10b981';
  const strokeWidth = selected ? 2.5 : 1.5;

  return (
    <>
      {/* Glow */}
      <path d={edgePath} fill="none" stroke={strokeColor} strokeWidth={strokeWidth + 6} strokeOpacity={0.08} />
      {/* Main wireless line - animated dots */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray="3 5"
        className="fiber-traffic-down"
        style={{ cursor: 'pointer' }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#071520',
            border: `1px solid ${strokeColor}55`,
            color: strokeColor,
            fontSize: 8,
            padding: '1px 4px',
            borderRadius: 3,
            pointerEvents: 'none',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}
          className="nodrag nopan"
        >
          📶 WiFi
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
WirelessEdge.displayName = 'WirelessEdge';
