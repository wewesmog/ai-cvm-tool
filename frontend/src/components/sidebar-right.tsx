import * as React from "react"

import { NavUser } from "@/components/nav-user"
import { AIChatbox } from "@/components/ai-chatbox"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="h-full border-l"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <div className="flex-1 p-4">
          <AIChatbox />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
