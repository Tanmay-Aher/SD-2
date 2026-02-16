"use client"

import * as React from "react"
import type { Role } from "@/lib/data"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StudentDashboard } from "@/components/dashboards/student-dashboard"
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
  const [role, setRole] = React.useState<Role | null>(null)
  const [activeTab, setActiveTab] = React.useState("overview")

  React.useEffect(() => {
    // Get role from localStorage
    const savedRole = localStorage.getItem("userRole") as Role | null
    
    if (!savedRole) {
      // Redirect to login if no role is found
      router.push("/auth/login")
    } else {
      setRole(savedRole)
    }
  }, [router])

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole)
    setActiveTab("overview")
    localStorage.setItem("userRole", newRole)
  }

  if (!role) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <DashboardLayout
      role={role}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRoleChange={handleRoleChange}
    >
      {role === "student" && <StudentDashboard activeTab={activeTab} />}
      {role === "teacher" && <TeacherDashboard activeTab={activeTab} />}
      {role === "admin" && <AdminDashboard activeTab={activeTab} />}
    </DashboardLayout>
  )
}
