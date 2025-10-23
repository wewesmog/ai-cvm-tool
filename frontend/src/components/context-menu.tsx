"use client"

import React, { useState, useEffect } from 'react';
import { Trash2, Copy, Clipboard, Square, MousePointer, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onConfigure?: () => void;
  hasClipboard: boolean;
  nodeId?: string;
  selectionType: 'none' | 'single' | 'multiple';
  selectedCount?: number;
}

export function ContextMenu({
  x,
  y,
  onClose,
  onCopy,
  onPaste,
  onDelete,
  onSelectAll,
  onDeselectAll,
  onConfigure,
  hasClipboard,
  nodeId,
  selectionType,
  selectedCount = 0
}: ContextMenuProps) {
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div
        className="fixed z-50 bg-background border border-border rounded-lg shadow-lg p-1 min-w-[160px]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="flex flex-col gap-1">
          {nodeId && (
            <>
              <div className="px-2 py-1 text-xs text-muted-foreground border-b border-border">
                Node: {nodeId}
              </div>
            </>
          )}
           <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(onConfigure || (() => {}))}
            className="justify-start gap-2 h-8 px-2"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm">Configure</span>
          </Button>
          
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(onCopy)}
            className="justify-start gap-2 h-8 px-2"
          >
            <Copy className="h-4 w-4" />
            <span className="text-sm">Copy</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(onPaste)}
            disabled={!hasClipboard}
            className="justify-start gap-2 h-8 px-2"
          >
            <Clipboard className="h-4 w-4" />
            <span className="text-sm">Paste</span>
          </Button>
          
          <div className="border-t border-border my-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(onDelete)}
            className="justify-start gap-2 h-8 px-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">Delete</span>
          </Button>
          
         
          <div className="border-t border-border my-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(onSelectAll)}
            className="justify-start gap-2 h-8 px-2"
          >
            <Square className="h-4 w-4" />
            <span className="text-sm">Select All</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(onDeselectAll)}
            className="justify-start gap-2 h-8 px-2"
          >
            <MousePointer className="h-4 w-4" />
            <span className="text-sm">Deselect All</span>
          </Button>
        </div>
      </div>
    </>
  );
}
