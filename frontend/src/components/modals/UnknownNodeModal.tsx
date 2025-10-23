"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Pen, AlertTriangle } from "lucide-react"

interface UnknownNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  nodeData?: any;
  nodeType?: string;
}

export function UnknownNodeModal({ isOpen, onClose, onSave, nodeData, nodeType }: UnknownNodeModalProps) {
  const [title, setTitle] = useState(nodeData?.title || 'Untitled Node');
  const [description, setDescription] = useState(nodeData?.description || 'Click to add description');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  // Update state when nodeData changes
  useEffect(() => {
    setTitle(nodeData?.title || 'Untitled Node');
    setDescription(nodeData?.description || 'Click to add description');
  }, [nodeData]);

  const handleSave = () => {
    const updatedData = {
      ...nodeData,
      title,
      description
    };
    console.log('💾 Saving Unknown Node configuration:', updatedData);
    onSave(updatedData);
    onClose();
  };

  const handleCancel = () => {
    setTitle(nodeData?.title || 'Untitled Node');
    setDescription(nodeData?.description || 'Click to add description');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-1/2 !max-w-none" style={{ width: '50vw', maxWidth: 'none' }}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <DialogTitle>Unknown Node Type</DialogTitle>
          </div>
          <DialogDescription>
            This node type "{nodeType}" doesn't have a dedicated configuration modal yet.
            You can still edit the basic information below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            {isEditingTitle ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingTitle(false);
                  }
                }}
                className="mt-1"
                autoFocus
              />
            ) : (
              <div
                className="mt-1 p-2 border rounded cursor-pointer hover:bg-gray-50"
                onClick={() => setIsEditingTitle(true)}
              >
                {title} <Pen className="w-4 h-4 inline ml-2" />
              </div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            {isEditingDescription ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => setIsEditingDescription(false)}
                className="mt-1"
                autoFocus
              />
            ) : (
              <div
                className="mt-1 p-2 border rounded cursor-pointer hover:bg-gray-50 min-h-[60px]"
                onClick={() => setIsEditingDescription(true)}
              >
                {description} <Pen className="w-3 h-3 inline ml-2" />
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Node Type Not Supported</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  The node type "{nodeType}" doesn't have a dedicated configuration modal yet. 
                  Only basic title and description editing is available.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
