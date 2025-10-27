'use client';

import { BaseEdge, EdgeLabelRenderer, getStraightPath, MarkerType } from '@xyflow/react';

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data?: {
    label?: string;
  };
  selected?: boolean;
}

export function CustomEdge({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  data,
  selected = false 
}: CustomEdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath}
        className="react-flow__edge-path"
        style={{
          strokeWidth: 2,
          stroke: selected ? 'hsl(var(--primary))' : '#64748b',
        }}
        markerEnd={{
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: selected ? 'hsl(var(--primary))' : '#64748b',
        }}
      />
      <EdgeLabelRenderer>
        {data?.label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 500,
              color: 'hsl(var(--foreground))',
              zIndex: 10,
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
