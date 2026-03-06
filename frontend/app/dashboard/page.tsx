"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Role = "student" | "teacher" | "admin";

export default function Page() {
  const router = useRouter();

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      const role = parsedUser.role as Role;
      router.push(`/dashboard/${role}`);
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}