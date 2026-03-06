"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard-layout";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [isAuthorized, setIsAuthorized] = React.useState(false);

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
        return;
      }
      setIsAuthorized(true);
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  if (!isAuthorized) {
    return null;
  }

  return (
    <DashboardLayout
      role="student"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRoleChange={() => {}} // Not needed for role-specific pages
    >
      <StudentDashboard activeTab={activeTab} />
    </DashboardLayout>
  );
}
