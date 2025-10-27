'use client';

import { useJourneyStore } from '@/stores/journey-store';

export function EdgeDebugger() {
  const { edges } = useJourneyStore();
  
  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">Edge Debug Info</h3>
      <div className="text-xs space-y-1">
        <div>Total Edges: {edges.length}</div>
        {edges.map((edge, index) => (
          <div key={edge.id} className="border-l-2 border-blue-400 pl-2">
            <div>ID: {edge.id}</div>
            <div>Source: {edge.source} → Target: {edge.target}</div>
            <div>Type: {edge.type || 'default'}</div>
            <div>Label: {edge.data?.label || 'No label'}</div>
            <div>Selected: {edge.selected ? 'Yes' : 'No'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
