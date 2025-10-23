"use client"

import React, { useState, useEffect } from 'react';
import { Trash2, Copy, Clipboard, Square, MousePointer, Settings, CopyPlus } from 'lucide-react';
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
  onDuplicate?: () => void;
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
  onDuplicate,
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
          {/* Header based on selection type */}
          {selectionType === 'single' && nodeId && (
            <div className="px-2 py-1 text-xs text-muted-foreground border-b border-border">
              Node: {nodeId}
            </div>
          )}
          {selectionType === 'multiple' && (
            <div className="px-2 py-1 text-xs text-muted-foreground border-b border-border">
              {selectedCount} nodes selected
            </div>
          )}
          {selectionType === 'none' && (
            <div className="px-2 py-1 text-xs text-muted-foreground border-b border-border">
              Canvas
            </div>
          )}

          {/* Copy - only show if something is selected */}
          {selectionType !== 'none' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(onCopy)}
              className="justify-start gap-2 h-8 px-2"
            >
              <Copy className="h-4 w-4" />
              <span className="text-sm">
                {selectionType === 'multiple' ? `Copy ${selectedCount} nodes` : 'Copy'}
              </span>
            </Button>
          )}
          
          {/* Duplicate - only show for single node */}
          {selectionType === 'single' && onDuplicate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(onDuplicate)}
              className="justify-start gap-2 h-8 px-2"
            >
              <CopyPlus className="h-4 w-4" />
              <span className="text-sm">Duplicate</span>
            </Button>
          )}
          
          {/* Paste - always show if clipboard has content */}
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
          
          {/* Delete - only show if something is selected */}
          {selectionType !== 'none' && (
            <>
              <div className="border-t border-border my-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(onDelete)}
                className="justify-start gap-2 h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm">
                  {selectionType === 'multiple' ? `Delete ${selectedCount} nodes` : 'Delete'}
                </span>
              </Button>
            </>
          )}
          
          {/* Configure - only show for single node */}
          {selectionType === 'single' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(onConfigure || (() => {}))}
              className="justify-start gap-2 h-8 px-2"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm">Configure</span>
            </Button>
          )}
          
          <div className="border-t border-border my-1" />
          
          {/* Select All - always show */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction(onSelectAll)}
            className="justify-start gap-2 h-8 px-2"
          >
            <Square className="h-4 w-4" />
            <span className="text-sm">Select All</span>
          </Button>
          
          {/* Deselect All - only show if something is selected */}
          {selectionType !== 'none' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(onDeselectAll)}
              className="justify-start gap-2 h-8 px-2"
            >
              <MousePointer className="h-4 w-4" />
              <span className="text-sm">Deselect All</span>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
