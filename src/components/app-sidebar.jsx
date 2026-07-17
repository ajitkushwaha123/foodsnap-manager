"use client";

import * as React from "react";
import { LayoutGrid, ImageIcon, Star } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { NavProjects } from "@/components/nav-projects";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { ProjectSwitcher } from "./project-switcher";

export function AppSidebar({ ...props }) {
  const data = {
    navMain: [
      // {
      //   title: "Playground",
      //   url: "#",
      //   icon: SquareTerminal,
      //   isActive: true,
      //   items: [
      //     {
      //       title: "History",
      //       url: "#",
      //     },
      //     {
      //       title: "Starred",
      //       url: "#",
      //     },
      //     {
      //       title: "Settings",
      //       url: "#",
      //     },
      //   ],
      // },
    ],
    projects: [
      {
        title: "Restaurants",
        url: "/image-manager",
        icon: LayoutGrid,
        isActive: true,
      },
      {
        title: "Image",
        url: "/image",
        icon: ImageIcon,
        isActive: true,
      },
      {
        title: "Premium",
        url: "/premium-manager",
        icon: Star,
        isActive: true,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
