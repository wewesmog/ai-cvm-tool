import { memo } from "react";
import { Handle, Position } from '@xyflow/react';
 
import { Button } from "@/components/ui/button";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { Rocket } from "lucide-react";
 
export const BaseNodeFullDemo = memo(() => {
  return (
    <BaseNode className="w-96">
      {/* Input Handle - Top */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      
      <BaseNodeHeader className="border-b">
        <Rocket className="size-4" />
        <BaseNodeHeaderTitle>Header</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent>
        <h3 className="text-lg font-bold">Content</h3>
        <p className="text-xs">
          This is a full-featured node with a header, content, and footer. You
          can customize it as needed.
        </p>
      </BaseNodeContent>
      <BaseNodeFooter>
        <h4 className="text-md self-start font-bold">Footer</h4>

        <Button variant="outline" className="nodrag w-full">
          Action 1
        </Button>
      </BaseNodeFooter>
      
      {/* Output Handle - Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </BaseNode>
  );
});
 
BaseNodeFullDemo.displayName = "BaseNodeFullDemo";