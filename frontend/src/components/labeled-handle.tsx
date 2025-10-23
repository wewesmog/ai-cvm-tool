import React, { forwardRef, type HTMLAttributes } from "react";
import { type HandleProps } from "@xyflow/react";

import { cn } from "@/lib/utils";
import { BaseHandle } from "@/components/base-handle";

const flexDirections = {
  top: "flex-col",
  right: "flex-row-reverse justify-end",
  bottom: "flex-col-reverse justify-end",
  left: "flex-row",
};

export const LabeledHandle = forwardRef<
  HTMLDivElement,
  HandleProps &
    HTMLAttributes<HTMLDivElement> & {
      title: string;
      handleClassName?: string;
      labelClassName?: string;
      handleType?: 'input' | 'output';
    }
>(
  (
    { className, labelClassName, handleClassName, title, position, handleType, ...props },
    ref,
  ) => {
    // Determine color based on handle type
    const getHandleColor = () => {
      if (handleType === 'input') {
        return '!border-green-500 !bg-green-500 hover:!bg-green-600';
      } else if (handleType === 'output') {
        return '!border-red-500 !bg-red-500 hover:!bg-red-600';
      }
      return '!border-slate-500 !bg-slate-500 hover:!bg-slate-600';
    };

    return (
      <div
        ref={ref}
        title={title}
        className={cn(
          "relative flex items-center",
          flexDirections[position],
          className,
        )}
      >
        <BaseHandle 
          position={position} 
          className={cn(
            "!h-4 !w-4 !border-2", // Increased size from 11px to 16px (h-4 w-4) with !important
            getHandleColor(),
            handleClassName
          )} 
          {...props} 
        />
        {/* No labels for output handles - keep them clean */}
      </div>
    );
  },
);

LabeledHandle.displayName = "LabeledHandle";
