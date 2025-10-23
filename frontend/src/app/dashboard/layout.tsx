'use client';

import { SidebarLeft } from "@/components/sidebar-left"
import { AIChatbox } from "@/components/ai-chatbox"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { usePathname } from 'next/navigation';
import { useDnD, DnDProvider } from "@/hooks/useDnD";
import { useState } from 'react';
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

function DashboardWithDnD({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const { onDragStart } = useDnD();
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);

  return (
    <SidebarProvider>
      <SidebarLeft onDragStart={onDragStart} showNodePalette={pathname === '/dashboard/journey' || pathname === '/dashboard/new-journey'} />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      Safarys - AI Journey Orchestrator
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            {/* Theme Toggle */}
            <div className="px-2">
              <ModeToggle />
            </div>
            
            {/* Right Panel Toggle */}
            <div className="px-3">
              <button
                onClick={() => setIsRightPanelVisible(!isRightPanelVisible)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                {isRightPanelVisible ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
                {isRightPanelVisible ? 'Hide' : 'Show'} AI
              </button>
            </div>
          </header>
          
          {/* Resizable Layout */}
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Main Content Area */}
            <ResizablePanel defaultSize={isRightPanelVisible ? 75 : 100} minSize={30}>
              {children}
            </ResizablePanel>
            {isRightPanelVisible && (
              <>
                <ResizableHandle />
                {/* Right Panel - AI Chat */}
                <ResizablePanel defaultSize={25} minSize={20}>
                  <div className="flex flex-1 flex-col gap-4 p-4 h-full">
                    <AIChatbox />
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </SidebarInset>
      </SidebarProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DnDProvider>
      <DashboardWithDnD>
        {children}
      </DashboardWithDnD>
    </DnDProvider>
  )
}
