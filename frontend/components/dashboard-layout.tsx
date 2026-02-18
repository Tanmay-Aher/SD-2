"use client"

import * as React from "react"
import {
  BookOpen, Users, ClipboardList, Target, Calendar, Megaphone,
  LayoutDashboard, GraduationCap, MessageSquare, BarChart3,
  Settings, FileText, UserCog, Bell, ChevronDown, Search, LogOut,
} from "lucide-react"
import type { Role } from "@/lib/data"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const roleConfig: Record<Role, { label: string; avatar: string; tabs: { label: string; icon: React.ElementType; value: string }[] }> = {
  student: {
    label: "Student",
    avatar: "AJ",
    tabs: [
      { label: "Overview", icon: LayoutDashboard, value: "overview" },
      { label: "Attendance", icon: BarChart3, value: "attendance" },
      { label: "Assignments", icon: ClipboardList, value: "assignments" },
      { label: "Goals & Accuracy", icon: Target, value: "goals" },
      { label: "Timetable", icon: Calendar, value: "timetable" },
      { label: "Announcements", icon: Megaphone, value: "announcements" },
    ],
  },
  teacher: {
    label: "Teacher",
    avatar: "SW",
    tabs: [
      { label: "Overview", icon: LayoutDashboard, value: "overview" },
      { label: "Students", icon: Users, value: "students" },
      { label: "Assignments", icon: ClipboardList, value: "assignments" },
      { label: "Marks", icon: FileText, value: "marks" },
      { label: "Announcements", icon: Megaphone, value: "announcements" },
      { label: "Messages", icon: MessageSquare, value: "messages" },
    ],
  },
  admin: {
    label: "Administrator",
    avatar: "AD",
    tabs: [
      { label: "Overview", icon: LayoutDashboard, value: "overview" },
      { label: "Students", icon: Users, value: "students" },
      { label: "Teachers", icon: GraduationCap, value: "teachers" },
      { label: "Exams", icon: BookOpen, value: "exams" },
      { label: "Assignments", icon: ClipboardList, value: "assignments" },
      { label: "Announcements", icon: Megaphone, value: "announcements" },
      { label: "Settings", icon: Settings, value: "settings" },
    ],
  },
}

const roleMeta: Record<Role, { name: string; email: string }> = {
  student: { name: "Alice Johnson", email: "alice@school.edu" },
  teacher: { name: "Dr. Sarah Wilson", email: "wilson@school.edu" },
  admin: { name: "Admin User", email: "admin@school.edu" },
}

interface DashboardLayoutProps {
  role: Role
  activeTab: string
  onTabChange: (tab: string) => void
  onRoleChange: (role: Role) => void
  children: React.ReactNode
}

export function DashboardLayout({ role, activeTab, onTabChange, onRoleChange, children }: DashboardLayoutProps) {
  const config = roleConfig[role]
  const meta = roleMeta[role]

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-sidebar-accent-foreground">EduDash</span>
              <span className="text-xs text-sidebar-foreground/60">{config.label} Portal</span>
            </div>
          </div>
        </SidebarHeader>
        <Separator className="mx-3 w-auto bg-sidebar-border" />
        <SidebarContent className="pt-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[11px] tracking-wider">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {config.tabs.map((tab) => (
                  <SidebarMenuItem key={tab.value}>
                    <SidebarMenuButton
                      isActive={activeTab === tab.value}
                      onClick={() => onTabChange(tab.value)}
                      tooltip={tab.label}
                      className="h-9"
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Separator className="mx-1 w-auto bg-sidebar-border" />
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="h-12">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">{config.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                      <span className="text-xs font-medium text-sidebar-accent-foreground">{meta.name}</span>
                      <span className="text-[11px] text-sidebar-foreground/60">{meta.email}</span>
                    </div>
                    <ChevronDown className="ml-auto h-4 w-4 text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuItem onClick={() => onRoleChange("student")}>
                    <UserCog className="mr-2 h-4 w-4" />Switch to Student
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRoleChange("teacher")}>
                    <UserCog className="mr-2 h-4 w-4" />Switch to Teacher
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRoleChange("admin")}>
                    <UserCog className="mr-2 h-4 w-4" />Switch to Admin
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="h-8 pl-8 bg-secondary border-0" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-md p-2 hover:bg-secondary transition-colors" aria-label="Notifications">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">{config.avatar}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:block">{meta.name}</span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onRoleChange("student")}>Student View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRoleChange("teacher")}>Teacher View</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRoleChange("admin")}>Admin View</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
