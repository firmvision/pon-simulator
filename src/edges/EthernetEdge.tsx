import { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import type { EthernetLink } from '../types/network';
import { useSimulationStore } from '../store/simulationStore';

export const EthernetEdge = memo(({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected,
}: EdgeProps) => {
  const link = data as unknown as EthernetLink;
  const running = useSimulationStore(s => s.running);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const isActive = running && link?.trafficActive;
  const speed = link?.speedMbps ?? 1000;
  const speedLabel = speed >= 1000 ? `${speed / 1000}G` : `${speed}M`;
  const strokeColor = selected ? '#60a5fa' : isActive ? '#f59e0b' : '#92400e';
  const strokeWidth = selected ? 3 : 2;

  return (
    <>
      {isActive && (
        <path d={edgePath} fill="none" stroke={strokeColor} strokeWidth={strokeWidth + 4} strokeOpacity={0.12} />
      )}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isActive ? '6 3' : '4 3'}
        className={isActive ? 'fiber-traffic-down' : ''}
        style={{ cursor: 'pointer' }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#0f172a',
            border: `1px solid ${strokeColor}55`,
            color: strokeColor,
            fontSize: 8,
            padding: '1px 3px',
            borderRadius: 3,
            pointerEvents: 'none',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
          }}
          className="nodrag nopan"
        >
          ETH {speedLabel}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
EthernetEdge.displayName = 'EthernetEdge';
