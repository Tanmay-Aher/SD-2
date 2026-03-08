"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import {
} from "@/lib/data"
import { BookOpen, CheckCircle2, Clock, TrendingUp, CalendarDays, Megaphone } from "lucide-react"
import { api } from "@/lib/api"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { StudentAttendancePanel } from "@/components/dashboards/student-attendance-panel"
import { fetchMyMarks, MarksRecord } from "@/lib/marks"

const isAccessDeniedError = (message: string) =>
  message.toLowerCase().includes("access denied")

const toUiError = (message: string, fallback: string) => {
  if (isAccessDeniedError(message)) {
    return "Unable to load data for this student account."
  }
  return message || fallback
}

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
  const [attendanceRate, setAttendanceRate] = useState(0)
  const [pending, setPending] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [attendanceTrend, setAttendanceTrend] = useState<Array<{ month: string; rate: number }>>([])
  const [marksList, setMarksList] = useState<MarksRecord[]>([])

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const { data, error } = await api.get<{
          stats: {
            attendanceRate: number
            pendingAssignments: number
            completedAssignments: number
          }
          charts: {
            attendanceTrend: Array<{ month: string; rate: number }>
          }
        }>("/api/dashboard/student-overview")
        if (error) {
          return
        }
        setAttendanceRate(Number(data?.stats?.attendanceRate || 0))
        setPending(Number(data?.stats?.pendingAssignments || 0))
        setCompleted(Number(data?.stats?.completedAssignments || 0))
        setAttendanceTrend(Array.isArray(data?.charts?.attendanceTrend) ? data!.charts.attendanceTrend : [])
      } catch {
        setAttendanceRate(0)
        setPending(0)
        setCompleted(0)
        setAttendanceTrend([])
      }
    }

    loadOverview()
  }, [])

  useEffect(() => {
    const loadMarks = async () => {
      try {
        const records = await fetchMyMarks()
        setMarksList(records)
      } catch {
        setMarksList([])
      }
    }

    loadMarks()
    const interval = setInterval(loadMarks, 10000)
    return () => clearInterval(interval)
  }, [])

  const marksChartData = marksList.map((mark) => ({
    subject: mark.subject,
    ct1: Number(mark.ct1 || 0),
    ct2: Number(mark.ct2 || 0),
    total: Number(mark.ct1 || 0) + Number(mark.ct2 || 0),
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Welcome Back!</h2>
        <p className="text-sm text-muted-foreground">Here is an overview of your academic progress</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Attendance" value={`${attendanceRate}%`} subtitle="From attendance records" icon={CalendarDays} />
        <StatCard title="Pending Tasks" value={String(pending)} subtitle="Assignments due" icon={Clock} />
        <StatCard title="Completed" value={String(completed)} subtitle="Assignments done" icon={BookOpen} />

      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Trend</CardTitle>
            <CardDescription>Monthly attendance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attendanceTrend}>
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
            <CardTitle className="text-base">Marks Breakdown</CardTitle>
            <CardDescription>CT1, CT2 and total marks by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={marksChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 60]} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend />
                <Bar dataKey="ct1" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="CT1" />
                <Bar dataKey="ct2" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="CT2" />
                <Bar dataKey="total" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StudentAttendance() {
  return <StudentAttendancePanel />
}

function StudentMarks() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [marksList, setMarksList] = useState<MarksRecord[]>([])

  useEffect(() => {
    const loadMarks = async () => {
      try {
        setError("")
        const records = await fetchMyMarks()
        setMarksList(records)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch marks"
        setError(toUiError(message, "Failed to fetch marks"))
        setMarksList([])
      } finally {
        setLoading(false)
      }
    }

    loadMarks()
    const interval = setInterval(loadMarks, 10000)
    return () => clearInterval(interval)
  }, [])

  const chartData = marksList.map((mark) => ({
    subject: mark.subject,
    ct1: Number(mark.ct1 || 0),
    ct2: Number(mark.ct2 || 0),
    total: Number(mark.ct1 || 0) + Number(mark.ct2 || 0),
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Marks</h2>
        <p className="text-sm text-muted-foreground">Your CT1 and CT2 marks by subject (auto-refresh every 10s)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marks Table</CardTitle>
          <CardDescription>Subject-wise marks summary</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>CT1</TableHead>
                <TableHead>CT2</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading marks...
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && marksList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No marks available.
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && marksList.map((mark) => (
                <TableRow key={mark._id}>
                  <TableCell className="font-medium">{mark.subject}</TableCell>
                  <TableCell>{mark.ct1}</TableCell>
                  <TableCell>{mark.ct2}</TableCell>
                  <TableCell>{Number(mark.ct1 || 0) + Number(mark.ct2 || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">CT1 vs CT2</CardTitle>
          <CardDescription>Bar chart by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="subject" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 60]} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend />
              <Bar dataKey="ct1" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="CT1" />
              <Bar dataKey="ct2" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="CT2" />
              <Bar dataKey="total" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function StudentAssignments() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [assignmentList, setAssignmentList] = useState<any[]>([])

  useEffect(() => {
    const loadAssignments = async () => {
      setLoading(true)
      setError("")
      try {
        const { data, error } = await api.get<{ assignments: any[] }>("/api/assignments/my")
        if (error) throw new Error(error)
        setAssignmentList(Array.isArray(data?.assignments) ? data.assignments : [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch assignments"
        setError(toUiError(message, "Failed to fetch assignments"))
        setAssignmentList([])
      } finally {
        setLoading(false)
      }
    }

    loadAssignments()
  }, [])

  const pendingCount = assignmentList.filter((item) => item.status === "pending").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Assignments</h2>
        <p className="text-sm text-muted-foreground">View and track all your assignments</p>
        <p className="text-sm text-muted-foreground mt-1">Pending count: {pendingCount}</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Loading assignments...
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && assignmentList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No assignments available.
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && assignmentList.map((a) => (
                <TableRow key={a.submissionId}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell className="max-w-[280px] truncate">{a.description}</TableCell>
                  <TableCell>{a.subject}</TableCell>
                  <TableCell>{new Date(a.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={a.status === "completed" ? "bg-green-600" : "bg-red-600"}>
                      {a.status === "completed" ? "Completed" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.completedAt ? new Date(a.completedAt).toLocaleString() : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

import { Download } from "lucide-react"

function StudentTimetable() {
  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
      
      <CardHeader className="pb-4 space-y-4">

        {/* Title + Download */}
        <div className="flex items-center justify-between">
          
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              📅 Timetable
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              View your official MSBTE Academic Year schedule below.
            </CardDescription>
          </div>

          {/* Download Button */}
          <a
            href="/timetable.pdf"
            download
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:shadow-md transition"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>

        </div>

        {/* Divider */}
        <div className="h-px bg-border w-full" />

      </CardHeader>

      <CardContent className="p-0">
        <div className="w-full h-[85vh]">
          <iframe
            src="/timetable.pdf#toolbar=0&navpanes=0&scrollbar=0"
            className="w-full h-full"
            title="Student Timetable"
          />
        </div>
      </CardContent>

    </Card>
  )
}
function StudentAnnouncements() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [announcementList, setAnnouncementList] = useState<any[]>([])

  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoading(true)
      setError("")
      try {
        const { data, error } = await api.get<{ announcements: any[] }>("/api/announcements/my")
        if (error) throw new Error(error)
        setAnnouncementList(Array.isArray(data?.announcements) ? data.announcements : [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch announcements"
        setError(toUiError(message, "Failed to fetch announcements"))
        setAnnouncementList([])
      } finally {
        setLoading(false)
      }
    }

    loadAnnouncements()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
        <p className="text-sm text-muted-foreground">Latest news and updates</p>
      </div>
      <div className="flex flex-col gap-4">
        {loading && <p className="text-sm text-muted-foreground">Loading announcements...</p>}
        {!loading && error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && announcementList.length === 0 && (
          <p className="text-sm text-muted-foreground">No announcements available.</p>
        )}
        {!loading && !error && announcementList.map((a) => (
          <Card key={a._id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                      <Badge variant="secondary" className="text-[10px]">
                        {a.subject}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>By {a.teacher?.firstName} {a.teacher?.lastName}</span>
                      <span>{new Date(a.createdAt).toLocaleString()}</span>
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
    case "marks": return <StudentMarks />
    case "assignments": return <StudentAssignments />
    case "timetable": return <StudentTimetable />
    case "announcements": return <StudentAnnouncements />
    default: return <StudentOverview />
  }
}
