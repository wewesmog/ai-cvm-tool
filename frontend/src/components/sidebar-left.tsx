"use client"

import * as React from "react"
import {
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  Home,
  Inbox,
  MessageCircleQuestion,
  Milestone,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NodePalette } from "@/components/node-palette"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
     // {
    //   title: "Home",
    //   url: "/dashboard/home",
    //   icon: Home,
    //   isActive: true,
    // },
    // {
    //   title: "Journey",
    //   url: "/dashboard/journey",
    //   icon: Home,
    //   isActive: true,
    // },
    // {
    //   title: "Goals",
    //   url: "/dashboard/goals",
    //   icon: Target,
    //   isActive: true,
    // },
    // {
    //   title: "Milestones",
    //   url: "/dashboard/milestones",
    //   icon: Milestone,
    //   isActive: true,
    // },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "New Journey",
      url: "/dashboard/new-journey",
      icon: Plus,
    },
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Templates",
      url: "#",
      icon: Blocks,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
}

interface SidebarLeftProps extends React.ComponentProps<typeof Sidebar> {
  onDragStart?: (event: React.DragEvent, nodeType: any) => void;
  showNodePalette?: boolean;
}

export function SidebarLeft({
  onDragStart,
  showNodePalette = false,
  ...props
}: SidebarLeftProps) {
  
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        {showNodePalette && onDragStart && <NodePalette onDragStart={onDragStart} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
