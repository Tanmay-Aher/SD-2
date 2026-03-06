"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";

export default function StudentAttendancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("attendance");

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/auth/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== "student") {
        router.push("/auth/login");
      }
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <DashboardLayout
      role="student"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRoleChange={() => {}}
    >
      <StudentDashboard activeTab={activeTab} />
    </DashboardLayout>
  );
}
