'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, NodeChange, EdgeChange, Connection, Node, Edge, Background, Controls, BackgroundVariant, useReactFlow, ReactFlowProvider, MarkerType, MiniMap, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
// @ts-ignore - html-to-image types may not be available
import { toPng, toSvg } from 'html-to-image';
import { JourneyNode } from "@/components/nodes/JourneyNode";
import { DecisionNode } from "@/components/nodes/DecisionNode";
import { LoopNode } from "@/components/nodes/LoopNode";
import { useNodeActions } from "@/hooks/useNodeActions";
import { useDnD } from "@/hooks/useDnD";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContextMenu } from "@/components/context-menu-v2";
import { EntryNodeModal } from "@/components/modals/EntryNodeModal";
import { DecisionNodeModal } from "@/components/modals/DecisionNodeModal";
import { WaitNodeModal } from "@/components/modals/WaitNodeModal";
import { LoopNodeModal } from "@/components/modals/LoopNodeModal";
import { DecisionPointNodeModal } from "@/components/modals/DecisionPointNodeModal";
import { UnknownNodeModal } from "@/components/modals/UnknownNodeModal";
import { GoalNodeModal } from "@/components/modals/GoalNodeModal";
import { MilestoneNodeModal } from "@/components/modals/MilestoneNodeModal";
import { MergeNodeModal } from "@/components/modals/MergeNodeModal";
import { Copy, Clipboard, Trash2, MousePointer, Square, Layout, Download, Image, FileJson, Undo2, Redo2, Grid3x3, Save, ZoomIn, ZoomOut, Maximize, Clock, Minus, Plus } from "lucide-react";
import * as dagre from 'dagre';
import useJourneyStore from '@/stores/journey-store';
import { ModeToggle } from "@/components/mode-toggle";
import { CustomEdge } from "@/components/edges/CustomEdge";

// Memoized node types - defined outside component to prevent recreation
const nodeTypes = {
  journeyNode: JourneyNode as any,
  decisionNode: DecisionNode as any,
  loopNode: LoopNode as any,
};

// Edge types
const edgeTypes = {
  custom: CustomEdge as any,
};

// Start with empty canvas - no initial nodes or edges
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Default edge styles with arrows
const defaultEdgeStyle = {
  stroke: '#64748b',
  strokeWidth: 2,
  markerEnd: 'url(#arrowclosed)',
};

function FlowArea() {
  // Use canvas store instead of local state
  const { 
    nodes, 
    edges, 
    addNode, 
    addEdge, 
    updateNode, 
    updateNodePosition,
    removeNode, 
    removeEdge,
    clearJourney,
    saveCanvasToAPI,
    isLoading
  } = useJourneyStore();
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ 
    x: number; 
    y: number;
    nodeId?: string;
  } | null>(null);
  const { onDragStart, onDragOver, onDrop, setNodeClickHandler } = useDnD();
  const [clipboard, setClipboard] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  
  // Undo/Redo state
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);
  
  // Settings state
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false); // Disabled by default
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Get React Flow instance
  const { getNodes, getEdges, setViewport, fitView, screenToFlowPosition, zoomIn, zoomOut } = useReactFlow();

  // Modal states for different node types
  const [openEntryModal, setOpenEntryModal] = useState<boolean>(false);
  const [openDecisionModal, setOpenDecisionModal] = useState<boolean>(false);
  const [openWaitModal, setOpenWaitModal] = useState<boolean>(false);
  const [openLoopModal, setOpenLoopModal] = useState<boolean>(false);
  const [openDecisionPointModal, setOpenDecisionPointModal] = useState<boolean>(false);
  const [openUnknownModal, setOpenUnknownModal] = useState<boolean>(false);
  const [openGoalModal, setOpenGoalModal] = useState<boolean>(false);
  const [openMilestoneModal, setOpenMilestoneModal] = useState<boolean>(false);
  const [openMergeModal, setOpenMergeModal] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Clear all selections on initial load and log state
  useEffect(() => {
    console.log('🚀 Dashboard initialized with:', {
      nodes: nodes.length,
      edges: edges.length,
    });
    
    // Clear all node selections on load
    nodes.forEach(node => {
      if (node.selected) {
        updateNode(node.id, { selected: false });
      }
    });
    
    // Note: We'll need to add updateEdge method to store for edge deselection
    console.log('🧹 Cleared all selections on load');
  }, []);

  // Track history for undo/redo (skip during undo/redo actions)
  useEffect(() => {
    if (isUndoRedoAction) {
      setIsUndoRedoAction(false);
      return;
    }

    if (nodes.length === 0 && edges.length === 0) {
      return; // Don't track empty state on initial load
    }

    // Create new history entry
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  }, [nodes, edges]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveTimer = setTimeout(() => {
      if (nodes.length > 0 || edges.length > 0) {
        handleSaveCanvas();
        setLastSaved(new Date());
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [nodes, edges, autoSaveEnabled]);

  // Note: Node click handlers are now managed directly through ReactFlow onNodeClick and onNodeDoubleClick
  // Single click = select only, Double click = open modal

  // Save node configuration
  const handleSaveNodeConfig = useCallback((updatedData: any) => {
    if (selectedNode) {
      console.log('💾 Saving node configuration:');
      console.log('  Node ID:', selectedNode.id);
      console.log('  Node Type:', selectedNode.type);
      console.log('  Node Subtype:', (selectedNode as any)['node-subtype']);
      console.log('  Current Data:', selectedNode.data);
      console.log('  Updated Data:', updatedData);
      console.log('  Merged Data:', { ...selectedNode.data, ...updatedData });
      console.log('  Full Selected Node:', selectedNode);
      
      // Update node in store
      updateNode(selectedNode.id, {
        data: { ...selectedNode.data, ...updatedData }
      });
      
      // Close all modals
      setOpenEntryModal(false);
      setOpenDecisionModal(false);
      setOpenWaitModal(false);
      setOpenLoopModal(false);
      setOpenDecisionPointModal(false);
      setOpenUnknownModal(false);
      setOpenGoalModal(false);
      setOpenMilestoneModal(false);
      setOpenMergeModal(false);
      setSelectedNode(null);
      setContextMenu(null);
    }
  }, [selectedNode, updateNode]);

  // Configure function
  const handleConfigure = useCallback(() => {
    console.log('🔧 Configure/Settings clicked!');
    if (contextMenu?.nodeId) {
      console.log('📝 Configuring node:', contextMenu.nodeId);
      const node = nodes.find(n => n.id === contextMenu.nodeId);
      if (node) {
        setSelectedNode(node);
        const nodeSubtype = (node as any)['node-subtype'];
        console.log('📝 Opening modal for node subtype:', nodeSubtype);
        
        switch (nodeSubtype) {
          case 'entry':
            setOpenEntryModal(true);
            break;
          case 'decision':
            setOpenDecisionModal(true);
            break;
          case 'wait':
            setOpenWaitModal(true);
            break;
          case 'loop':
            setOpenLoopModal(true);
            break;
          case 'decision-point':
            setOpenDecisionPointModal(true);
            break;
          case 'goal':
            setOpenGoalModal(true);
            break;
          case 'milestone':
            setOpenMilestoneModal(true);
            break;
          default:
            setOpenUnknownModal(true);
            break;
            console.log('❌ Unknown node subtype:', nodeSubtype);
        }
      }
    } else {
      console.log('⚙️ General settings/configuration');
    }
  }, [contextMenu?.nodeId, nodes]);

  // Auto-organize function using Dagre
  const organizeNodes = useCallback(() => {
    console.log('🎯 Auto-organizing nodes...', { nodesCount: nodes.length, edgesCount: edges.length });
    
    if (nodes.length === 0) {
      console.log('No nodes to organize');
      return;
    }

    // Use simple grid layout to ensure all nodes are visible
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const spacing = 250;
    const startX = 100;
    const startY = 100;

    // Update each node position in the store
    nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = startX + (col * spacing);
      const y = startY + (row * spacing);
      
      updateNode(node.id, {
        position: { x, y }
      });
    });

    console.log('✅ Nodes organized in visible grid layout');
    
    // Center the view on organized nodes after a short delay
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 100);
  }, [nodes, edges, updateNode, fitView]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      console.log('🔄 Node changes detected:', changes);
      
      // Apply changes to each node in the store
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          // Position changes don't trigger saving - use dedicated method
          updateNodePosition(change.id, change.position);
        } else if (change.type === 'select') {
          updateNode(change.id, { selected: change.selected });
        } else if (change.type === 'remove') {
          removeNode(change.id);
        }
      });
      
      console.log('📊 Nodes updated:', { 
        changes: changes.length 
      });
    },
    [updateNode, updateNodePosition, removeNode],
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      console.log('🔄 Edge changes detected:', changes);
      
      // Apply changes to each edge in the store
      changes.forEach(change => {
        if (change.type === 'select') {
          // Note: We'll need to add updateEdge method to store for selection
          console.log('Edge selection change:', change.id, change.selected);
        } else if (change.type === 'remove') {
          removeEdge(change.id);
        }
      });
      
      console.log('📊 Edges updated:', { 
        changes: changes.length 
      });
    },
    [removeEdge],
  );
  
  const onConnect = useCallback(
    (params: Connection) => {
      console.log('🔗 New connection created:', params);
      
      // Get source handle label for default edge label
      let defaultLabel = '';
      if (params.sourceHandle) {
        const sourceNode = nodes.find(n => n.id === params.source);
        if (sourceNode) {
          const nodeData = sourceNode.data;
          // Extract label from source handle for decision/loop nodes
          if (params.sourceHandle.includes('yes')) defaultLabel = nodeData?.yesLabel || nodeData?.yesAction || 'Yes';
          else if (params.sourceHandle.includes('no')) defaultLabel = nodeData?.noLabel || nodeData?.noAction || 'No';
          else if (params.sourceHandle.includes('continue')) defaultLabel = 'Continue';
          else if (params.sourceHandle.includes('exit')) defaultLabel = 'Exit';
          else if (params.sourceHandle.startsWith('branch-')) {
            const branchIndex = parseInt(params.sourceHandle.replace('branch-', ''));
            const branchConfig = nodeData?.branchConfigs?.[branchIndex];
            defaultLabel = branchConfig?.title || `Branch ${branchIndex + 1}`;
          }
        }
      }
      
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'custom', // Use our custom edge type
        selected: false,
        data: {
          label: defaultLabel
        },
      };
      
      // Add edge to store
      addEdge(newEdge);
      
      console.log('📊 Edge added:', { 
        connection: `${params.source} → ${params.target}`,
        label: defaultLabel,
        edge: newEdge
      });
    },
    [addEdge, nodes],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      console.log('🎯 Drop event triggered');

      if (!reactFlowWrapper.current) {
        console.log('❌ No react flow wrapper found');
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      
      // Calculate center of the visible viewport in screen coordinates
      const centerScreenX = reactFlowBounds.left + reactFlowBounds.width / 2;
      const centerScreenY = reactFlowBounds.top + reactFlowBounds.height / 2;
      
      // Convert screen coordinates to flow coordinates (accounts for zoom and pan)
      const flowPosition = screenToFlowPosition({
        x: centerScreenX,
        y: centerScreenY,
      });

      console.log('📍 Dropping at center:', flowPosition);
      const newNode = onDrop(event, reactFlowBounds);
      
      if (newNode) {
        console.log('✅ Adding new node to canvas:', newNode);
        // Convert React Flow Node to our store Node format
        // Override position to be at center of viewport
        const storeNode = {
          id: newNode.id,
          type: newNode.type || 'journeyNode',
          'node-subtype': (newNode.data?.nodeType as string) || 'entry',
          position: flowPosition, // Use center position in flow coordinates
          data: newNode.data || {},
          selected: newNode.selected || false
        };
        addNode(storeNode);
      }
    },
    [onDrop, addNode, screenToFlowPosition]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    onDragOver(event);
  }, [onDragOver]);

  // Control bar functions
  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);
    console.log('📋 Copying:', { nodes: selectedNodes.length, edges: selectedEdges.length });
    
    if (selectedNodes.length > 0) {
      // Copy to clipboard state
      setClipboard({ nodes: selectedNodes, edges: selectedEdges });
      console.log('✅ Copied to clipboard:', { nodes: selectedNodes.length, edges: selectedEdges.length });
    }
  }, [nodes, edges]);

  const handlePaste = useCallback(() => {
    console.log('📋 Pasting...');
    
    if (clipboard.nodes.length === 0) {
      console.log('⚠️ Nothing to paste');
      return;
    }

    console.log('📋 Pasting from clipboard:', { nodes: clipboard.nodes.length, edges: clipboard.edges.length });
    
    // Create a mapping of old IDs to new IDs
    const idMap: { [key: string]: string } = {};
    
    // Paste nodes with new IDs and offset position
    clipboard.nodes.forEach(node => {
      const newId = `${node.id}_copy_${Date.now()}`;
      idMap[node.id] = newId;
      
      const newNode = {
        ...node,
        id: newId,
        type: node.type || 'journeyNode', // Ensure type is always defined
        'node-subtype': (node as any)['node-subtype'], // Preserve node subtype
        position: {
          x: node.position.x + 50, // Offset by 50px
          y: node.position.y + 50,
        },
        selected: false, // Don't select the pasted nodes
      };
      
      addNode(newNode);
    });
    
    // Paste edges with updated IDs
    clipboard.edges.forEach(edge => {
      // Only paste edges if both source and target nodes were copied
      if (idMap[edge.source] && idMap[edge.target]) {
        const newEdge = {
          ...edge,
          id: `edge_${Date.now()}_${Math.random()}`,
          source: idMap[edge.source],
          target: idMap[edge.target],
          selected: false,
          data: edge.data || {}, // Ensure data property exists
        };
        
        addEdge(newEdge);
      }
    });
    
    console.log('✅ Pasted:', { nodes: clipboard.nodes.length, edges: clipboard.edges.length });
  }, [clipboard, addNode, addEdge]);

  const handleDelete = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    const selectedEdges = edges.filter(edge => edge.selected);
    
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      console.log('🗑️ Deleting:', { nodes: selectedNodes.length, edges: selectedEdges.length });
      
      // Remove selected nodes
      selectedNodes.forEach(node => removeNode(node.id));
      
      // Remove selected edges
      selectedEdges.forEach(edge => removeEdge(edge.id));
    }
  }, [nodes, edges, removeNode, removeEdge]);

  const handleSelectAll = useCallback(() => {
    console.log('🎯 Selecting all nodes and edges');
    
    // Select all nodes
    nodes.forEach(node => {
      updateNode(node.id, { selected: true });
    });
    
    // Note: We'll need to add updateEdge method to store for edge selection
    console.log('Selected all nodes and edges');
  }, [nodes, updateNode]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setIsUndoRedoAction(true);
      setHistoryIndex(historyIndex - 1);
      
      // Clear current nodes and edges
      nodes.forEach(node => removeNode(node.id));
      edges.forEach(edge => removeEdge(edge.id));
      
      // Restore previous state
      prevState.nodes.forEach(node => addNode(node as any));
      prevState.edges.forEach(edge => addEdge({ ...edge, data: edge.data || {} } as any));
      
      console.log('⏪ Undo applied');
    }
  }, [history, historyIndex, nodes, edges, removeNode, removeEdge, addNode, addEdge]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setIsUndoRedoAction(true);
      setHistoryIndex(historyIndex + 1);
      
      // Clear current nodes and edges
      nodes.forEach(node => removeNode(node.id));
      edges.forEach(edge => removeEdge(edge.id));
      
      // Restore next state
      nextState.nodes.forEach(node => addNode(node as any));
      nextState.edges.forEach(edge => addEdge({ ...edge, data: edge.data || {} } as any));
      
      console.log('⏩ Redo applied');
    }
  }, [history, historyIndex, nodes, edges, removeNode, removeEdge, addNode, addEdge]);

  // Export handlers
  const handleExportPNG = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    
    if (viewport) {
      toPng(viewport, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      }).then((dataUrl: string) => {
        const a = document.createElement('a');
        a.setAttribute('download', `journey-canvas-${Date.now()}.png`);
        a.setAttribute('href', dataUrl);
        a.click();
        console.log('✅ Canvas exported as PNG');
      }).catch((error: any) => {
        console.error('❌ Failed to export PNG:', error);
      });
    }
  }, []);

  const handleExportSVG = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    
    if (viewport) {
      toSvg(viewport, {
        backgroundColor: '#ffffff',
      }).then((dataUrl: string) => {
        const a = document.createElement('a');
        a.setAttribute('download', `journey-canvas-${Date.now()}.svg`);
        a.setAttribute('href', dataUrl);
        a.click();
        console.log('✅ Canvas exported as SVG');
      }).catch((error: any) => {
        console.error('❌ Failed to export SVG:', error);
      });
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    const data = {
      nodes: getNodes(),
      edges: getEdges(),
      viewport: { x: 0, y: 0, zoom: 1 },
      exportedAt: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.setAttribute('download', `journey-canvas-${Date.now()}.json`);
    a.setAttribute('href', url);
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Canvas exported as JSON');
  }, [getNodes, getEdges]);

  // Duplicate node handler
  const handleDuplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) return;

    const newId = `${nodeToDuplicate.id}_duplicate_${Date.now()}`;
    const newNode = {
      ...nodeToDuplicate,
      id: newId,
      type: nodeToDuplicate.type || 'journeyNode',
      'node-subtype': (nodeToDuplicate as any)['node-subtype'],
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      selected: false,
    };

    addNode(newNode);
    console.log('✅ Node duplicated:', newId);
  }, [nodes, addNode]);

  const handleSaveCanvas = useCallback(async () => {
    try {
      await saveCanvasToAPI();
      console.log('✅ Canvas saved successfully');
    } catch (error) {
      console.error('❌ Failed to save canvas:', error);
    }
  }, [saveCanvasToAPI]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Shift+Z or Cmd+Shift+Z or Ctrl+Y
      if (((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') || 
          (event.ctrlKey && event.key === 'y')) {
        event.preventDefault();
        handleRedo();
      }

      // Copy: Ctrl+C or Cmd+C
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        handleCopy();
      }

      // Paste: Ctrl+V or Cmd+V
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        handlePaste();
      }

      // Delete: Delete or Backspace
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        handleDelete();
      }

      // Select All: Ctrl+A or Cmd+A
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        handleSelectAll();
      }

      // Save: Ctrl+S or Cmd+S
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSaveCanvas();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handlePaste, handleDelete, handleSelectAll, handleUndo, handleRedo, handleSaveCanvas]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Journey Canvas</h1>
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* History Controls */}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2" 
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2" 
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          
          {/* Edit Controls */}
          <div className="border-l pl-2 ml-2 flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleCopy} title="Copy (Ctrl+C)">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handlePaste} title="Paste (Ctrl+V)">
              <Clipboard className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20" onClick={handleDelete} title="Delete (Del)">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* View Controls */}
          <div className="border-l pl-2 ml-2 flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={() => zoomIn()}
              title="Zoom In"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={() => zoomOut()}
              title="Zoom Out"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={() => fitView({ padding: 0.2, duration: 300 })}
              title="Center View"
            >
              <Maximize className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={() => setSnapToGrid(!snapToGrid)}
              title={snapToGrid ? "Grid Snap: On" : "Grid Snap: Off"}
            >
              <Grid3x3 className={`h-4 w-4 ${snapToGrid ? 'text-blue-500' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              title={autoSaveEnabled ? "Auto-save: On (every 30s)" : "Auto-save: Off"}
            >
              <Clock className={`h-4 w-4 ${autoSaveEnabled ? 'text-green-500' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={organizeNodes}
              title="Auto-organize nodes"
            >
              <Layout className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleSelectAll} title="Select All (Ctrl+A)">
              <MousePointer className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Export Controls */}
          <div className="border-l pl-2 ml-2 flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleExportPNG} title="Export as PNG">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleExportJSON} title="Export as JSON">
              <FileJson className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Save */}
          <div className="border-l pl-2 ml-2">
          <Button 
            variant="primary" 
            size="sm" 
            className="flex items-center gap-2" 
            onClick={handleSaveCanvas}
            disabled={isLoading}
              title="Save (Ctrl+S)"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save'}
          </Button>
          </div>
          
          {/* Theme Toggle */}
          <div className="border-l pl-2 ml-2">
            <ModeToggle />
          </div>
        </div>
      </div>
      <div className="flex-1 border rounded-lg overflow-hidden relative">
        <div 
          ref={reactFlowWrapper}
          className="w-full h-full [&_.react-flow__edge-path]:stroke-slate-400 [&_.react-flow__edge-path]:stroke-[2px] [&_.react-flow__edge:hover_.react-flow__edge-path]:stroke-slate-500 [&_.react-flow__edge:hover_.react-flow__edge-path]:stroke-[2.5px] [&_.react-flow__edge.selected_.react-flow__edge-path]:stroke-blue-500 [&_.react-flow__edge.selected_.react-flow__edge-path]:stroke-[2.5px] [&_.react-flow__handle]:w-2 [&_.react-flow__handle]:h-2 [&_.react-flow__handle]:border-0 [&_.react-flow__handle:hover]:scale-110 [&_.react-flow__connectionline]:stroke-slate-400 [&_.react-flow__connectionline]:stroke-[2px] [&_.react-flow__connectionline]:stroke-dasharray-[5,5] [&_.react-flow__controls]:shadow-lg [&_.react-flow__controls]:rounded-lg [&_.react-flow__controls]:overflow-hidden [&_.react-flow__controls-button]:transition-all [&_.react-flow__controls-button]:border-b [&_.react-flow__controls-button]:border-slate-200 [&_.react-flow__controls-button:hover]:bg-slate-50 [&_.react-flow__controls-button:active]:bg-slate-100 [&_.react-flow__minimap]:shadow-lg [&_.react-flow__minimap]:bg-white [&_.react-flow__minimap-node]:fill-slate-400 [&_.react-flow__minimap-node]:stroke-slate-500 [&_.react-flow__minimap-node]:stroke-[2px] [&_.react-flow__minimap-mask]:fill-slate-200/60 [&_.react-flow__attribution]:opacity-50 [&_.react-flow__attribution:hover]:opacity-100 [&_.react-flow__node]:transition-all [&_.react-flow__node:hover]:-translate-y-0.5 [&_.react-flow__node.dragging]:opacity-80 [&_.react-flow__node.dragging]:cursor-grabbing [&_.react-flow.dragging]:cursor-grabbing [&_.react-flow.dragging_*]:cursor-grabbing [&_.react-flow__pane]:cursor-default [&_.react-flow__pane.selection]:cursor-crosshair [&_.react-flow__selection]:bg-blue-500/10 [&_.react-flow__selection]:border-2 [&_.react-flow__selection]:border-blue-500 [&_.react-flow__nodesselection-rect]:bg-blue-500/10 [&_.react-flow__nodesselection-rect]:border-2 [&_.react-flow__nodesselection-rect]:border-dashed [&_.react-flow__nodesselection-rect]:border-blue-500 [&_.react-flow__edge-text]:text-[10px] [&_.react-flow__edge-text]:font-medium [&_.react-flow__edge-text]:fill-foreground [&_.react-flow__edge-text]:z-10 [&_.react-flow__edge-textbg]:fill-card [&_.react-flow__edge-textbg]:stroke-border [&_.react-flow__edge-textbg]:stroke-[1px] [&_.react-flow__edge-textbg]:rounded [&_.react-flow__edge-textbg]:drop-shadow-sm [&_.react-flow__edge-textbg]:z-10 dark:[&_.react-flow__minimap]:bg-gray-800 dark:[&_.react-flow__minimap-mask]:fill-gray-800/70 dark:[&_.react-flow__controls]:bg-card dark:[&_.react-flow__controls]:border dark:[&_.react-flow__controls]:border-border dark:[&_.react-flow__controls-button]:border-border dark:[&_.react-flow__controls-button]:bg-card dark:[&_.react-flow__controls-button]:text-foreground dark:[&_.react-flow__controls-button:hover]:bg-accent dark:[&_.react-flow__controls-button:hover]:text-accent-foreground dark:[&_.react-flow__controls-button:active]:bg-muted dark:[&_.react-flow__controls-button_svg]:fill-foreground dark:[&_.react-flow__controls-button:hover_svg]:fill-accent-foreground"
        >
          <ReactFlow
            nodes={nodes}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            snapToGrid={snapToGrid}
            snapGrid={[15, 15]}
            selectNodesOnDrag={true}
            selectionOnDrag={true}
            panOnDrag={[1, 2]}
            onPaneContextMenu={(event) => {
              event.preventDefault();
              setContextMenu({
                x: event.clientX,
                y: event.clientY,
              });
            }}
            onNodeContextMenu={(event, node) => {
              event.preventDefault();
              setContextMenu({
                x: event.clientX,
                y: event.clientY,
                nodeId: node.id,
              });
            }}
            onPaneClick={() => setContextMenu(null)}
            onNodeClick={(event, node) => {
              console.log('🖱️ Node clicked (select only):', node.id);
              // Single click only selects the node
              setSelectedNode(node);
            }}
            onNodeDoubleClick={(event, node) => {
              console.log('🖱️🖱️ Node double-clicked:', node.id);
              setSelectedNode(node);
              const nodeSubtype = (node as any)['node-subtype'];
              console.log('📝 Opening modal for node subtype:', nodeSubtype);
              
              switch (nodeSubtype) {
                case 'entry':
                  setOpenEntryModal(true);
                  break;
                case 'decision':
                  setOpenDecisionModal(true);
                  break;
                case 'wait':
                  setOpenWaitModal(true);
                  break;
                case 'loop':
                  setOpenLoopModal(true);
                  break;
                case 'decision-point':
                  setOpenDecisionPointModal(true);
                  break;
                case 'goal':
                  setOpenGoalModal(true);
                  break;
                case 'milestone':
                  setOpenMilestoneModal(true);
                  break;
                case 'merge':
                  setOpenMergeModal(true);
                  break;
                default:
                  setOpenUnknownModal(true);
                  break;
              }
            }}
            fitView={nodes.length > 0}
            fitViewOptions={{ padding: 0.2, includeHiddenNodes: false, duration: 200 }}
          >
            <Background 
              color="#e2e8f0"
              gap={20}
              size={0.5}
              variant={BackgroundVariant.Dots}
            />
            {nodes.length > 0 && (
              <MiniMap 
                nodeStrokeColor={(n) => {
                  if (n.selected) return 'hsl(var(--primary))';
                  return 'hsl(var(--muted-foreground))';
                }}
                nodeColor={(n) => {
                  if (n.selected) return 'hsl(var(--primary))';
                  const subtype = (n as any)['node-subtype'];
                  // Color by node type with more vibrant colors
                  switch(subtype) {
                    case 'goal': return '#10b981';
                    case 'milestone': return '#f59e0b';
                    case 'entry': return '#6366f1';
                    case 'decision': return '#ec4899';
                    case 'loop': return '#8b5cf6';
                    case 'decision-point': return '#06b6d4';
                    case 'merge': return '#84cc16';
                    case 'wait': return '#f97316';
                    default: return 'hsl(var(--muted-foreground))';
                  }
                }}
                nodeBorderRadius={3}
                nodeStrokeWidth={3}
                maskColor="hsl(var(--muted) / 0.7)"
                zoomable
                pannable
                position="bottom-right"
                className="minimap-custom"
                style={{
                  width: 220,
                  height: 160,
                  backgroundColor: 'hsl(var(--card))',
                  border: '3px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                }}
              />
            )}
            <Panel position="top-left" className="bg-card/80 backdrop-blur-sm p-3 rounded-lg border shadow-sm">
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="success" className="text-xs">
                    <Save className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Canvas:</span>
                  <Badge variant="outline-info" className="text-xs">
                    {nodes.length} nodes
                  </Badge>
                  <Badge variant="outline-info" className="text-xs">
                    {edges.length} edges
                  </Badge>
                </div>
                <div className={`flex items-center gap-1 ${snapToGrid ? 'text-primary' : 'text-muted-foreground'}`}>
                  <Grid3x3 className="h-3 w-3" />
                  {snapToGrid ? 'Grid: On' : 'Grid: Off'}
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onDelete={handleDelete}
          onSelectAll={handleSelectAll}
          onDeselectAll={() => {
            nodes.forEach(node => {
              updateNode(node.id, { selected: false });
            });
            // Note: We'll need to add updateEdge method to store for edge deselection
          }}
          onDuplicate={contextMenu.nodeId ? () => handleDuplicateNode(contextMenu.nodeId!) : undefined}
          onConfigure={handleConfigure}
          hasClipboard={clipboard.nodes.length > 0}
          nodeId={contextMenu.nodeId}
          selectionType={contextMenu.nodeId ? 'single' : 'none'}
          selectedCount={nodes.filter(n => n.selected).length}
        />
      )}

      {/* Dedicated Node Modals */}
      <EntryNodeModal
        isOpen={openEntryModal}
        onClose={() => setOpenEntryModal(false)}
        onSave={handleSaveNodeConfig}
        nodeData={selectedNode?.data}
      />
      
      <DecisionNodeModal
        isOpen={openDecisionModal}
        onClose={() => setOpenDecisionModal(false)}
        onSave={handleSaveNodeConfig}
        nodeData={selectedNode?.data}
      />
      
      <WaitNodeModal
        isOpen={openWaitModal}
        onClose={() => setOpenWaitModal(false)}
        onSave={handleSaveNodeConfig}
        nodeData={selectedNode?.data}
      />
      
      <LoopNodeModal
        isOpen={openLoopModal}
        onClose={() => setOpenLoopModal(false)}
        onSave={handleSaveNodeConfig}
        nodeData={selectedNode?.data}
      />
      
      <DecisionPointNodeModal
        isOpen={openDecisionPointModal}
        onClose={() => setOpenDecisionPointModal(false)}
        onSave={handleSaveNodeConfig}
        nodeData={selectedNode?.data}
      />
      
      <GoalNodeModal
        isOpen={openGoalModal}
        onClose={() => setOpenGoalModal(false)}
        onSave={handleSaveNodeConfig}
        nodeData={selectedNode?.data}
      />
      
      <MilestoneNodeModal
        isOpen={openMilestoneModal}
        onClose={() => setOpenMilestoneModal(false)}
        onSave={handleSaveNodeConfig}
        nodeData={selectedNode?.data}
      />
      
      <MergeNodeModal
        isOpen={openMergeModal}
        onClose={() => setOpenMergeModal(false)}
        onSave={handleSaveNodeConfig}
        nodeData={selectedNode?.data}
      />
      
      <UnknownNodeModal
        isOpen={openUnknownModal}
        onClose={() => setOpenUnknownModal(false)}
        onSave={handleSaveNodeConfig}
         nodeData={selectedNode?.data}
        nodeType={(selectedNode as any)?.['node-subtype']}
      />
    </div>
  )
}

export default function CanvasPage() {
  return (
    <ReactFlowProvider>
      <FlowArea />
    </ReactFlowProvider>
  );
}
