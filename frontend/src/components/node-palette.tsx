"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { NODE_TYPES, getCategories, getNodesByCategory, NodeTypeConfig } from '@/config/nodeTypes';

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeTypeConfig) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  const [openCategories, setOpenCategories] = React.useState<Record<string, boolean>>({
    'Flow Control': true,
    'AI': true,
    'Communication': true,
    'Integration': true
  });
  
  const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const categories = getCategories();

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="px-3 py-2 border-b border-sidebar-border">
        <h2 className="text-sm font-bold text-sidebar-foreground">Node Palette</h2>
      </div>
      
      {categories.map(category => (
        <Collapsible
          key={category}
          open={openCategories[category]}
          onOpenChange={() => toggleCategory(category)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="text-sm font-medium">{category}</span>
              {openCategories[category] ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-1 px-3">
            {getNodesByCategory(category).map(node => {
              const IconComponent = node.icon;
              const isExpanded = expandedNodes[node.id];
              return (
                <div key={node.id} className="space-y-1">
                  <div
                    draggable
                    onDragStart={(e) => onDragStart(e, node)}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleNodeExpansion(node.id);
                    }}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
                        {node.title}
                      </div>
                      <div className={`text-xs text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/80 transition-all duration-200 ${
                        isExpanded ? 'line-clamp-none' : 'line-clamp-1'
                      }`}>
                        {node.description}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3 text-sidebar-foreground/50" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-sidebar-foreground/50" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="ml-7 p-2 bg-sidebar-accent/50 rounded-md border-l-2 border-sidebar-border">
                      <div className="text-xs text-sidebar-foreground/80 space-y-1">
                        <div><strong>Category:</strong> {node.category}</div>
                        <div><strong>Type:</strong> {node.nodeType}</div>
                        <div className="text-sidebar-foreground/70">{node.description}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
