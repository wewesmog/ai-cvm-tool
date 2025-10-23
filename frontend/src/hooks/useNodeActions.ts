import { useCallback, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';

interface NodeActionsProps {
  getNodes: () => Node[];
  getEdges: () => Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

export const useNodeActions = ({ getNodes, getEdges, setNodes, setEdges }: NodeActionsProps) => {
  const clipboardRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null);

  const copySelected = useCallback(() => {
    const selectedNodes = getNodes().filter(node => node.selected);
    const selectedEdges = getEdges().filter(edge => edge.selected);
    
    if (selectedNodes.length > 0 || selectedEdges.length > 0) {
      clipboardRef.current = { nodes: selectedNodes, edges: selectedEdges };
      console.log('Copied to clipboard:', { nodes: selectedNodes.length, edges: selectedEdges.length });
    }
  }, [getNodes, getEdges]);

  const paste = useCallback(() => {
    if (!clipboardRef.current) return;

    const { nodes: clipboardNodes, edges: clipboardEdges } = clipboardRef.current;
    const existingNodes = getNodes();
    const existingEdges = getEdges();
    
    // Generate new IDs for pasted nodes
    const nodeIdMap = new Map<string, string>();
    const pastedNodes = clipboardNodes.map(node => {
      const newId = `${node.id}_copy_${Date.now()}`;
      nodeIdMap.set(node.id, newId);
      
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        selected: false,
      };
    });

    // Update edge source/target IDs and generate new edge IDs
    const pastedEdges = clipboardEdges.map(edge => {
      const newSourceId = nodeIdMap.get(edge.source);
      const newTargetId = nodeIdMap.get(edge.target);
      
      if (newSourceId && newTargetId) {
        return {
          ...edge,
          id: `${edge.id}_copy_${Date.now()}`,
          source: newSourceId,
          target: newTargetId,
          selected: false,
        };
      }
      return null;
    }).filter(Boolean) as Edge[];

    // Add pasted nodes and edges
    setNodes([...existingNodes, ...pastedNodes]);
    setEdges([...existingEdges, ...pastedEdges]);
    
    console.log('Pasted:', { nodes: pastedNodes.length, edges: pastedEdges.length });
  }, [getNodes, getEdges, setNodes, setEdges]);

  const deleteSelected = useCallback(() => {
    const selectedNodes = getNodes().filter(node => node.selected);
    const selectedEdges = getEdges().filter(edge => edge.selected);
    
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

    const selectedNodeIds = new Set(selectedNodes.map(node => node.id));
    
    // Remove selected nodes and edges connected to selected nodes
    const remainingNodes = getNodes().filter(node => !node.selected);
    const remainingEdges = getEdges().filter(edge => 
      !edge.selected && 
      !selectedNodeIds.has(edge.source) && 
      !selectedNodeIds.has(edge.target)
    );

    setNodes(remainingNodes);
    setEdges(remainingEdges);
    
    console.log('Deleted:', { nodes: selectedNodes.length, edges: selectedEdges.length });
  }, [getNodes, getEdges, setNodes, setEdges]);

  const selectAll = useCallback(() => {
    const allNodes = getNodes().map(node => ({ ...node, selected: true }));
    const allEdges = getEdges().map(edge => ({ ...edge, selected: true }));
    
    setNodes(allNodes);
    setEdges(allEdges);
  }, [getNodes, getEdges, setNodes, setEdges]);

  const deselectAll = useCallback(() => {
    const allNodes = getNodes().map(node => ({ ...node, selected: false }));
    const allEdges = getEdges().map(edge => ({ ...edge, selected: false }));
    
    setNodes(allNodes);
    setEdges(allEdges);
  }, [getNodes, getEdges, setNodes, setEdges]);

  return {
    copySelected,
    paste,
    deleteSelected,
    selectAll,
    deselectAll,
    hasClipboard: clipboardRef.current !== null,
  };
};
