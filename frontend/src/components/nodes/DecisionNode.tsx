import React, { memo } from "react";
import { NodeProps, Position, Handle } from "@xyflow/react";
import { getNodeConfig } from "@/config/nodeTypes";

interface DecisionNodeData extends Record<string, unknown> {
  nodeId?: string;
  journeyId?: string;
  title?: string;
  description?: string;
  nodeType?: 'decision' | 'decision-point';
  status?: 'active' | 'inactive' | 'completed';
  branches?: number;
  branchConfigs?: Array<{
    title: string;
    description?: string;
  }>;
  onNodeClick?: (nodeId: string) => void;
}

interface DecisionNodeProps extends NodeProps {
  data: DecisionNodeData;
}

export const DecisionNode = memo((props: DecisionNodeProps) => {
  const { data, selected } = props;
  const { 
    title = "Decision", 
    nodeType = 'decision',
    branches = 2,
    branchConfigs = [
      { title: "Yes" },
      { title: "No" }
    ],
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

  // Calculate dynamic node size
  const getNodeSize = () => {
    const totalBranches = Math.max(branches || 2, branchConfigs?.length || 2, 2);
    const minHeight = 64; // Even smaller minimum height
    const calculatedHeight = Math.max(minHeight, totalBranches * 24 + 20);
    
    return {
      width: 80, // w-20
      height: calculatedHeight
    };
  };

  // Generate output handles for each branch
  const generateOutputHandles = () => {
    const handles = [];
    const totalBranches = Math.max(branches || 2, branchConfigs?.length || 2, 2);
    
    for (let i = 0; i < totalBranches; i++) {
      const branchTitle = branchConfigs?.[i]?.title || `Branch ${i + 1}`;
      const handleId = `output-${i}`;
      
      // Calculate position for each handle using actual node height
      const nodeHeight = getNodeSize().height;
      const padding = 12;
      const availableHeight = nodeHeight - (padding * 2);
      
      let topPosition;
      if (totalBranches === 1) {
        topPosition = nodeHeight / 2;
      } else {
        const handleSpacing = availableHeight / (totalBranches - 1);
        topPosition = padding + (i * handleSpacing);
      }
      
      handles.push(
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={Position.Right}
          className="!w-2 !h-2 !bg-red-500 !border-none hover:!w-2.5 hover:!h-2.5 transition-all"
          style={{
            top: `${topPosition}px`,
            right: '-4px',
          }}
        />
      );
      
      // Add label outside the node
      handles.push(
        <span
          key={`label-${handleId}`}
          className="absolute text-[8px] text-gray-500 whitespace-nowrap pointer-events-none"
          style={{
            top: `${topPosition}px`,
            right: '-4px',
            transform: 'translate(100%, -50%)',
            paddingLeft: '6px'
          }}
        >
          {branchTitle}
        </span>
      );
    }
    
    return handles;
  };

  return (
    <div 
      className={`
        relative flex flex-col items-center justify-center gap-0.5
        px-1.5 py-1.5
        bg-white dark:bg-gray-800
        border ${selected ? 'border-blue-500 border-2' : 'border-gray-200 dark:border-gray-600'}
        rounded-md
        shadow-sm hover:shadow-md
        transition-all duration-200
        cursor-pointer
        hover:-translate-y-0.5
        ${selected ? 'ring-2 ring-blue-200 dark:ring-blue-400' : ''}
      `}
      style={{
        width: getNodeSize().width,
        height: getNodeSize().height
      }}
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
      <div className="bg-orange-50 rounded-full p-1 flex items-center justify-center transition-all duration-200">
        <IconComponent className="w-4 h-4 text-orange-500" />
      </div>

      {/* Title */}
      <div className="text-[8px] font-medium text-gray-700 dark:text-gray-200 text-center leading-tight line-clamp-2">
        {title}
      </div>

      {/* Multiple Output Handles */}
      {generateOutputHandles()}
    </div>
  );
});

DecisionNode.displayName = "DecisionNode";
