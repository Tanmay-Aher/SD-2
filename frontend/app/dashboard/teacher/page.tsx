"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard-layout";
import { TeacherDashboard } from "@/components/dashboards/teacher-dashboard";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("overview");

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "teacher") {
        router.push("/auth/login");
        return;
      }
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <DashboardLayout
      role="teacher"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRoleChange={() => {}} // Not needed for role-specific pages
    >
      <TeacherDashboard activeTab={activeTab} />
    </DashboardLayout>
  );
}