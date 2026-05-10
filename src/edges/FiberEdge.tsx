import { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import type { FiberSegment } from '../types/network';
import { useSimulationStore } from '../store/simulationStore';
import { useTopologyStore } from '../store/topologyStore';

export const FiberEdge = memo(({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected,
}: EdgeProps) => {
  const fiber = data as unknown as FiberSegment;
  const running = useSimulationStore(s => s.running);
  // For drop fibers (target is an ONU), color by the ONU's signal margin
  const targetOnuMargin = useTopologyStore(s => {
    const onu = fiber?.targetId ? s.onus[fiber.targetId] : undefined;
    return onu?.signalMargin_dB;
  });

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const totalLoss = fiber?.totalLoss_dB;
  let strokeColor = '#475569';
  let margin = '';

  if (targetOnuMargin !== undefined) {
    // Drop fiber — color by ONU signal margin
    if (targetOnuMargin < 0)  strokeColor = '#ef4444';
    else if (targetOnuMargin < 3) strokeColor = '#f59e0b';
    else strokeColor = '#22c55e';
  } else if (totalLoss !== undefined) {
    // Intermediate fiber — color by per-segment loss (informational green scale)
    strokeColor = '#22c55e';
  }

  if (totalLoss !== undefined) {
    margin = `${fiber.lengthKm ? '' : ''}${totalLoss.toFixed(1)} dB`;
  }

  if (selected) strokeColor = '#60a5fa';

  const strokeWidth = selected ? 3 : 2;
  const isActive = running && fiber?.trafficActive;

  return (
    <>
      {/* Shadow/glow */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 4}
          strokeOpacity={0.15}
        />
      )}
      {/* Main fiber */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isActive ? '8 4' : 'none'}
        className={isActive ? 'fiber-traffic-down' : ''}
        style={{ cursor: 'pointer' }}
      />
      {/* Label */}
      {margin && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: '#0f172a',
              border: `1px solid ${strokeColor}55`,
              color: strokeColor,
              fontSize: 9,
              padding: '1px 4px',
              borderRadius: 3,
              pointerEvents: 'none',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
            className="nodrag nopan"
          >
            {fiber?.lengthKm ? `${fiber.lengthKm}km · ` : ''}{margin}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
FiberEdge.displayName = 'FiberEdge';
