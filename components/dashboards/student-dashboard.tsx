"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import {
  assignments, announcements, timetable, attendanceData,
  performanceData, goalsData, weeklyProgressData,
} from "@/lib/data"
import { BookOpen, CheckCircle2, Clock, TrendingUp, CalendarDays, Megaphone } from "lucide-react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

function StatCard({ title, value, subtitle, icon: Icon, trend }: {
  title: string; value: string; subtitle: string; icon: React.ElementType; trend?: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className="text-2xl font-bold text-foreground">{value}</span>
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="h-3 w-3" /> {trend}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StudentOverview() {
  const pending = assignments.filter(a => a.status === "pending").length
  const submitted = assignments.filter(a => a.status === "submitted").length
  const graded = assignments.filter(a => a.status === "graded").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome back, Alice</h2>
        <p className="text-sm text-muted-foreground">Here is an overview of your academic progress</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Attendance" value="91%" subtitle="This semester" icon={CalendarDays} trend="+2.3% from last month" />
        <StatCard title="Pending Tasks" value={String(pending)} subtitle="Assignments due" icon={Clock} />
        <StatCard title="Submitted" value={String(submitted)} subtitle="Awaiting review" icon={BookOpen} />
        <StatCard title="Graded" value={String(graded)} subtitle="Assignments graded" icon={CheckCircle2} trend="A avg grade" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Trend</CardTitle>
            <CardDescription>Monthly attendance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[70, 100]} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="rate" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subject Performance</CardTitle>
            <CardDescription>Average marks by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="subject" type="category" fontSize={12} tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="score" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Megaphone className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground truncate">{a.title}</h4>
                    <Badge variant={a.priority === "high" ? "destructive" : a.priority === "medium" ? "default" : "secondary"} className="shrink-0 text-[10px]">
                      {a.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.message}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{a.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StudentAttendance() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Attendance</h2>
        <p className="text-sm text-muted-foreground">Track your attendance records</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <span className="text-sm text-muted-foreground">Overall Rate</span>
            <div className="text-3xl font-bold text-foreground mt-1">91%</div>
            <Progress value={91} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-sm text-muted-foreground">Days Present</span>
            <div className="text-3xl font-bold text-foreground mt-1">109</div>
            <span className="text-xs text-muted-foreground">out of 120 school days</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <span className="text-sm text-muted-foreground">Days Absent</span>
            <div className="text-3xl font-bold text-foreground mt-1">11</div>
            <span className="text-xs text-muted-foreground">5 excused, 6 unexcused</span>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[70, 100]} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-1))", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function StudentAssignments() {
  const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    submitted: "bg-blue-100 text-blue-800",
    graded: "bg-emerald-100 text-emerald-800",
  }
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Assignments</h2>
        <p className="text-sm text-muted-foreground">View and track all your assignments</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>{a.subject}</TableCell>
                  <TableCell>{a.dueDate}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[a.status]}`}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{a.grade || "---"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function StudentGoals() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Goals & Accuracy</h2>
        <p className="text-sm text-muted-foreground">Monitor your learning goals and accuracy trends</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Goal Completion</CardTitle>
            <CardDescription>Distribution of your learning goals</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={goalsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {goalsData.map((_, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Accuracy Trend</CardTitle>
            <CardDescription>Your accuracy improvement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StudentTimetable() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const subjectColors: Record<string, string> = {
    Mathematics: "bg-blue-50 border-blue-200 text-blue-900",
    Physics: "bg-orange-50 border-orange-200 text-orange-900",
    English: "bg-emerald-50 border-emerald-200 text-emerald-900",
    Chemistry: "bg-rose-50 border-rose-200 text-rose-900",
    Biology: "bg-teal-50 border-teal-200 text-teal-900",
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Timetable</h2>
        <p className="text-sm text-muted-foreground">Your weekly class schedule</p>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {days.map((day) => {
          const dayClasses = timetable.filter(t => t.day === day)
          return (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">{day}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {dayClasses.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-lg border p-2.5 ${subjectColors[entry.subject] || "bg-muted"}`}
                  >
                    <div className="text-xs font-semibold">{entry.subject}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{entry.time}</div>
                    <div className="text-[11px] opacity-70">{entry.room}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function StudentAnnouncements() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
        <p className="text-sm text-muted-foreground">Latest news and updates</p>
      </div>
      <div className="flex flex-col gap-4">
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                      <Badge variant={a.priority === "high" ? "destructive" : a.priority === "medium" ? "default" : "secondary"} className="text-[10px]">
                        {a.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>By {a.author}</span>
                      <span>{a.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function StudentDashboard({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "attendance": return <StudentAttendance />
    case "assignments": return <StudentAssignments />
    case "goals": return <StudentGoals />
    case "timetable": return <StudentTimetable />
    case "announcements": return <StudentAnnouncements />
    default: return <StudentOverview />
  }
}
