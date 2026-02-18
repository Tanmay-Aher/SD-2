"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Role = "student" | "teacher" | "admin";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // simulate API call
    await new Promise((res) => setTimeout(res, 1500));

    setIsLoading(false);
    
    // Redirect to dashboard with role
    localStorage.setItem("userRole", role);
    router.push("/dashboard");
  };

  const roleTitle =
    role.charAt(0).toUpperCase() + role.slice(1) + " Portal";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg space-y-6">

    
       {/* Role Tabs */}
<div className="grid grid-cols-3 gap-4">
  {(["student", "teacher", "admin"] as Role[]).map((r) => {
    const isActive = role === r;

    return (
      <button
        key={r}
        onClick={() => setRole(r)}
        className={`
          h-12 rounded-xl font-semibold transition-all duration-300
          flex items-center justify-center gap-2
          ${
            isActive
              ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg scale-[1.03]"
              : "bg-white text-slate-700 border border-slate-300 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-md"
          }
        `}
      >
        {r.charAt(0).toUpperCase() + r.slice(1)}
      </button>
    );
  })}
</div>


        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="h-1.5 bg-indigo-600" />

          <div className="p-8 space-y-6">

            {/* Icon */}
            <div className="flex justify-center">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <Shield className="text-indigo-600" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center">
              <h1 className="text-2xl font-semibold">{roleTitle}</h1>
              <p className="text-sm text-slate-600">
                Sign in to your {role} account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="email"
                    placeholder={`${role}@school.edu`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-slate-600">
                  Remember me
                </span>
              </div>

              {/* Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
