import React, { memo } from "react";
import { NodeProps, Position, Handle } from "@xyflow/react";
import { getNodeConfig } from "@/config/nodeTypes";

interface LoopNodeData extends Record<string, unknown> {
  nodeId?: string;
  journeyId?: string;
  title?: string;
  description?: string;
  nodeType?: 'loop';
  status?: 'active' | 'inactive' | 'completed';
  maxLoops?: number;
  currentLoop?: number;
  continueLabel?: string;
  exitLabel?: string;
  onNodeClick?: (nodeId: string) => void;
}

interface LoopNodeProps extends NodeProps {
  data: LoopNodeData;
}

export const LoopNode = memo((props: LoopNodeProps) => {
  const { data, selected } = props;
  const { 
    title = "Loop", 
    nodeType = 'loop',
    maxLoops = 3,
    continueLabel = "Continue",
    exitLabel = "Exit",
    onNodeClick 
  } = data;

  // Get node configuration from centralized config
  const nodeConfig = getNodeConfig(nodeType);
  
  if (!nodeConfig) {
    console.warn(`Node type ${nodeType} not found in configuration`);
    return null;
  }

  const { icon: IconComponent } = nodeConfig;

  const handleNodeClick = () => {
    if (onNodeClick && props.id) {
      onNodeClick(props.id);
    }
  };

  // Generate output handles for loop exits
  const generateOutputHandles = () => {
    const handles = [];
    
    const handleConfigs = [
      {
        id: "continue",
        label: continueLabel,
        color: "!bg-blue-500"
      },
      {
        id: "exit", 
        label: exitLabel,
        color: "!bg-red-500"
      }
    ];

    const nodeHeight = 64; // Updated to match h-16
    const padding = 12;
    const availableHeight = nodeHeight - (padding * 2);
    
    handleConfigs.forEach((config, i) => {
      const totalHandles = handleConfigs.length;
      let topPosition;
      
      if (totalHandles === 1) {
        topPosition = nodeHeight / 2;
      } else {
        const handleSpacing = availableHeight / (totalHandles - 1);
        topPosition = padding + (i * handleSpacing);
      }
      
      handles.push(
        <Handle
          key={config.id}
          id={config.id}
          type="source"
          position={Position.Right}
          className={`!w-2 !h-2 ${config.color} !border-none hover:!w-2.5 hover:!h-2.5 transition-all`}
          style={{
            top: `${topPosition}px`,
            right: '-4px',
          }}
        />
      );

      handles.push(
        <span
          key={`label-${config.id}`}
          className="absolute text-[8px] text-gray-500 whitespace-nowrap pointer-events-none"
          style={{
            right: '-4px',
            top: `${topPosition}px`,
            transform: 'translate(100%, -50%)',
            paddingLeft: '6px'
          }}
        >
          {config.label}
        </span>
      );
    });

    return handles;
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
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-green-500 !border-none hover:!w-2.5 hover:!h-2.5 transition-all"
        style={{
          left: '-4px',
        }}
      />

      {/* Icon with colored background circle */}
      <div className="bg-purple-50 rounded-full p-1 flex items-center justify-center transition-all duration-200">
        <IconComponent className="w-4 h-4 text-purple-500" />
      </div>

      {/* Title */}
      <div className="text-[8px] font-medium text-gray-700 dark:text-gray-200 text-center leading-tight line-clamp-2">
        {title}
      </div>

      {/* Max loops indicator */}
      <div className="absolute -bottom-3 text-[7px] text-gray-400">
        Max: {maxLoops}
      </div>

      {/* Output handles */}
      {generateOutputHandles()}
    </div>
  );
});

LoopNode.displayName = "LoopNode";
