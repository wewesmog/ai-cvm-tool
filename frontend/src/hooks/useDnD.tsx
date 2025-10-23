"use client"

import React, { createContext, useContext, useCallback, useRef } from 'react';
import { Node, addEdge, applyNodeChanges, NodeChange, EdgeChange, applyEdgeChanges, Connection } from '@xyflow/react';
import { NodeTypeConfig } from '@/config/nodeTypes';

interface DnDContextType {
  onDragStart: (event: React.DragEvent, nodeType: NodeTypeConfig) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent, reactFlowBounds: DOMRect | null) => Node | null;
  setNodeClickHandler: (handler: (nodeId: string) => void) => void;
}

const DnDContext = createContext<DnDContextType | null>(null);

export function DnDProvider({ children }: { children: React.ReactNode }) {
  const draggedNodeType = useRef<NodeTypeConfig | null>(null);
  const nodeClickHandler = useRef<((nodeId: string) => void) | null>(null);

  const onDragStart = useCallback((event: React.DragEvent, nodeType: NodeTypeConfig) => {
    draggedNodeType.current = nodeType;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent, reactFlowBounds: DOMRect | null): Node | null => {
    event.preventDefault();

    if (!draggedNodeType.current || !reactFlowBounds) {
      return null;
    }

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    const timestamp = Date.now();
    const nodeId = `${draggedNodeType.current.nodeType}_1_${timestamp}`;
    
    // Determine the correct React Flow node type based on the nodeType
    const getNodeType = (nodeType: string) => {
      switch (nodeType) {
        case 'decision':
        case 'decision-point':
          return 'decisionNode';
        case 'loop':
          return 'loopNode';
        default:
          return 'journeyNode';
      }
    };

    const newNode: Node = {
      id: nodeId,
      type: getNodeType(draggedNodeType.current.nodeType),
      position,
      draggable: true,
      data: {
        nodeId: nodeId,
        journeyId: '1', // Hardcoded as 1 for now
        title: draggedNodeType.current.title,
        description: draggedNodeType.current.description,
        nodeType: draggedNodeType.current.nodeType,
        status: 'active',
        onNodeClick: nodeClickHandler.current,
        // Add decision-specific data
        ...((draggedNodeType.current.nodeType === 'decision' || draggedNodeType.current.nodeType === 'decision-point') && {
          branches: draggedNodeType.current.nodeType === 'decision-point' ? 2 : 5,
          branchConfigs: draggedNodeType.current.nodeType === 'decision-point' 
            ? [
                { title: "Yes", description: "" },
                { title: "No", description: "" }
              ]
            : [
                { title: "Branch 1", description: "" },
                { title: "Branch 2", description: "" },
                { title: "Branch 3", description: "" },
                { title: "Branch 4", description: "" },
                { title: "Branch 5", description: "" }
              ]
        })
      },
    };

    draggedNodeType.current = null;
    return newNode;
  }, []);

  const setNodeClickHandler = useCallback((handler: (nodeId: string) => void) => {
    nodeClickHandler.current = handler;
  }, []);

  return (
    <DnDContext.Provider value={{ onDragStart, onDragOver, onDrop, setNodeClickHandler }}>
      {children}
    </DnDContext.Provider>
  );
}

export function useDnD() {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error('useDnD must be used within a DnDProvider');
  }
  return context;
}
