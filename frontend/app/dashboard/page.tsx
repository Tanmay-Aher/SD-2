"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard-layout";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";

type Role = "student" | "teacher" | "admin";

export default function Page() {
  const router = useRouter();
  const [role, setRole] = React.useState<Role | null>(null);
  const [activeTab, setActiveTab] = React.useState("overview");

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      setRole(parsedUser.role as Role);
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <DashboardLayout
      role={role}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRoleChange={setRole}
    >
      {role === "student" && <StudentDashboard activeTab={activeTab} />}
      {role === "teacher" && <TeacherDashboard activeTab={activeTab} />}
      {role === "admin" && <AdminDashboard activeTab={activeTab} />}
    </DashboardLayout>
  );
}