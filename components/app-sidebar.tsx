"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"

const navMain = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Analytic",
      url: "/admin/analytic",
      icon: IconChartBar,
    },
    {
      title: "Talent Details",
      url: "/admin/talents_details",
      icon: IconUsers,
    },
    {
      title: "Guest List",
      url: "/admin/guest_list",
      icon: IconListDetails,
    },
    {
      title: "Groups Performances",
      url: "/admin/group_performances",
      icon: IconFolder,
    },
    {
      title: "Singles Performances",
      url: "/admin/singles_performances",
      icon: IconFileDescription,
    },
  ]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth()

  // Debug: Log user data
  React.useEffect(() => {
    console.log('AppSidebar - User:', user)
    console.log('AppSidebar - Loading:', loading)
  }, [user, loading])

  // Create user data with placeholder avatar
  const userData = {
    name: user?.full_name || "Guest",
    email: user?.email || "",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.email || "Guest")}&background=0D8ABC&color=fff`,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Maritime Talent Quest</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {!loading && <NavUser user={userData} />}
      </SidebarFooter>
    </Sidebar>
  )
}
