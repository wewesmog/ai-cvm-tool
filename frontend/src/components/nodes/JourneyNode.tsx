import React, { memo } from "react";
import { NodeProps, Position, Handle } from "@xyflow/react";
import { getNodeConfig } from "@/config/nodeTypes";

interface JourneyNodeData extends Record<string, unknown> {
  nodeId?: string;
  journeyId?: string;
  title?: string;
  description?: string;
  nodeType?: 'entry' | 'action' | 'decision' | 'wait' | 'end' | 'split' | 'join' | 'goal' | 'milestone' | 'email' | 'sms' | 'webhook' | 'database';
  status?: 'active' | 'inactive' | 'completed';
  actionType?: 'email' | 'sms' | 'push' | 'webhook' | 'database';
  onNodeClick?: (nodeId: string) => void;
}

interface JourneyNodeProps extends NodeProps {
  data: JourneyNodeData;
}

export const JourneyNode = memo((props: JourneyNodeProps) => {
  const { data, selected } = props;
  const { title = "Node", nodeType = 'action', onNodeClick } = data;

  // Get node configuration from centralized config
  const nodeConfig = getNodeConfig(nodeType);
  
  if (!nodeConfig) {
    console.warn(`Node type ${nodeType} not found in configuration`);
    return null;
  }

  const { icon: IconComponent, color } = nodeConfig;

  const handleNodeClick = () => {
    if (onNodeClick && props.id) {
      onNodeClick(props.id);
    }
  };

  // Minimalist color scheme - mostly based on node type
  const getIconColor = () => {
    switch(nodeType) {
      case 'entry': return 'text-orange-500';
      case 'email': return 'text-blue-500';
      case 'sms': return 'text-blue-500';
      case 'decision': return 'text-orange-500';
      case 'wait': return 'text-orange-400';
      case 'goal': return 'text-red-500';
      case 'milestone': return 'text-purple-500';
      case 'end': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const getBackgroundColor = () => {
    switch(nodeType) {
      case 'entry': return 'bg-orange-50';
      case 'email': return 'bg-blue-50';
      case 'sms': return 'bg-blue-50';
      case 'decision': return 'bg-orange-50';
      case 'wait': return 'bg-orange-50';
      case 'goal': return 'bg-green-50';
      case 'milestone': return 'bg-purple-50';
      case 'end': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center gap-0.5
        w-20 h-16 px-1.5 py-1.5
        bg-white dark:bg-gray-800
        border ${selected ? 'border-blue-500 border-2' : 'border-gray-200 dark:border-gray-600'}
        rounded-md
        shadow-sm hover:shadow-md
        transition-all duration-200
        cursor-pointer
        hover:-translate-y-0.5
        ${selected ? 'ring-2 ring-blue-200 dark:ring-blue-400' : ''}
      `}
      onClick={handleNodeClick}
    >
      {/* Input Handle - Left */}
      {nodeType !== 'entry' && (
        <Handle
          id="input"
          type="target"
          position={Position.Left}
          className="!w-2 !h-2 !bg-green-500 !border-none hover:!w-2.5 hover:!h-2.5 transition-all"
          style={{
            left: '-4px',
          }}
        />
      )}

      {/* Icon with colored background circle */}
      <div className={`
        ${getBackgroundColor()}
        rounded-full p-1
        flex items-center justify-center
        transition-all duration-200
      `}>
        <IconComponent className={`w-4 h-4 ${getIconColor()}`} />
      </div>

      {/* Title */}
      <div className="text-[8px] font-medium text-gray-700 dark:text-gray-200 text-center leading-tight line-clamp-2">
        {title}
      </div>

      {/* Output Handle - Right */}
      {nodeType !== 'end' && (
        <Handle
          id="output"
          type="source"
          position={Position.Right}
          className="!w-2 !h-2 !bg-red-500 !border-none hover:!w-2.5 hover:!h-2.5 transition-all"
          style={{
            right: '-4px',
          }}
        />
      )}
    </div>
  );
});

JourneyNode.displayName = "JourneyNode";
