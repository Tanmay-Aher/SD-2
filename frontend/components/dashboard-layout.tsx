"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen, Users, ClipboardList, Calendar, Megaphone,
  LayoutDashboard, GraduationCap, MessageSquare, BarChart3,
  Settings, FileText, UserCog, ChevronDown, LogOut, UserCircle2,
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
import { Separator } from "@/components/ui/separator"

const roleConfig: Record<Role, { label: string; tabs: { label: string; icon: React.ElementType; value: string }[] }> = {
  student: {
    label: "Student",
    tabs: [
      { label: "Overview", icon: LayoutDashboard, value: "overview" },
      { label: "Attendance", icon: BarChart3, value: "attendance" },
      { label: "Marks", icon: FileText, value: "marks" },
      { label: "Assignments", icon: ClipboardList, value: "assignments" },
      { label: "Timetable", icon: Calendar, value: "timetable" },
      { label: "Announcements", icon: Megaphone, value: "announcements" },
    ],
  },
  teacher: {
    label: "Teacher",
    tabs: [
      { label: "Dashboard", icon: LayoutDashboard, value: "overview" },
      { label: "Students", icon: Users, value: "students" },
      { label: "Attendance", icon: BarChart3, value: "attendance" },
      { label: "Assignments", icon: ClipboardList, value: "assignments" },
      { label: "Marks", icon: FileText, value: "marks" },
      { label: "Timetable", icon: Calendar, value: "timetable" },
      { label: "Announcements", icon: Megaphone, value: "announcements" },
    ],
  },
  admin: {
    label: "Administrator",
    tabs: [
      { label: "Dashboard", icon: LayoutDashboard, value: "overview" },
      { label: "Users", icon: UserCog, value: "users" },
      { label: "Students", icon: Users, value: "students" },
      { label: "Teachers", icon: GraduationCap, value: "teachers" },
      { label: "Subjects", icon: BookOpen, value: "subjects" },
      { label: "Assignments", icon: ClipboardList, value: "assignments" },
      { label: "Announcements", icon: Megaphone, value: "announcements" },
      { label: "Attendance Reports", icon: BarChart3, value: "attendance-reports" },
    ],
  },
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
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)
  const [meta, setMeta] = React.useState<{ name: string; email: string }>({
    name: "",
    email: "",
  })

  React.useEffect(() => {
    setMounted(true)
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const fullName =
        user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : ""
      setMeta({
        name: fullName,
        email: user.email || "",
      })
    } catch {
      setMeta({ name: "", email: "" })
    }
  }, [])

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
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="ml-auto flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <UserCircle2 className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:block">
                    {mounted ? (meta.name || config.label) : "Loading..."}
                  </span>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push('/auth/login')}><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
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
