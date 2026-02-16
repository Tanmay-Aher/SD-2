"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import {
  students as initialStudents, teachers as initialTeachers,
  assignments, announcements, exams as initialExams,
  systemAnalyticsData,
} from "@/lib/data"
import type { Student, Teacher } from "@/lib/data"
import {
  Users, GraduationCap, BookOpen, BarChart3, TrendingUp, Pencil,
  Trash2, Plus, Megaphone, Calendar, Settings, Shield, UserCog,
} from "lucide-react"

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

function AdminOverview() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">System-wide overview and analytics</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value="362" subtitle="Enrolled this semester" icon={Users} trend="+7 this month" />
        <StatCard title="Total Teachers" value="32" subtitle="Active faculty" icon={GraduationCap} trend="+2 this semester" />
        <StatCard title="Active Courses" value="52" subtitle="Across all departments" icon={BookOpen} />
        <StatCard title="Avg Performance" value="82%" subtitle="School-wide average" icon={BarChart3} trend="+3% from last month" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Growth Analytics</CardTitle>
          <CardDescription>Students, teachers, and courses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={systemAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Students" />
              <Line type="monotone" dataKey="teachers" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Teachers" />
              <Line type="monotone" dataKey="courses" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Courses" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <Megaphone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{a.title}</span>
                      <Badge variant={a.priority === "high" ? "destructive" : "secondary"} className="text-[10px] shrink-0">{a.priority}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{a.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {initialExams.slice(0, 3).map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{e.subject}</span>
                    <div className="text-xs text-muted-foreground">{e.date} at {e.time} - {e.room}</div>
                  </div>
                  <Badge variant="outline">{e.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminStudents() {
  const [studentList, setStudentList] = React.useState(initialStudents)
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [grade, setGrade] = React.useState("")

  const handleAdd = () => {
    if (!name || !email || !grade) return
    setStudentList(prev => [...prev, {
      id: String(Date.now()), name, email, grade, attendance: 100, avgMarks: 0, status: "active" as const,
    }])
    setName(""); setEmail(""); setGrade(""); setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Students</h2>
          <p className="text-sm text-muted-foreground">Manage student records</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Student</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Student</DialogTitle>
              <DialogDescription>Register a new student</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2"><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Student name" /></div>
              <div className="flex flex-col gap-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@school.edu" /></div>
              <div className="flex flex-col gap-2">
                <Label>Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10A">10A</SelectItem>
                    <SelectItem value="10B">10B</SelectItem>
                    <SelectItem value="10C">10C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Avg Marks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentList.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{s.name}</span>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{s.grade}</TableCell>
                  <TableCell>
                    <span className={s.attendance >= 90 ? "text-emerald-600 font-medium" : s.attendance >= 80 ? "text-amber-600 font-medium" : "text-red-600 font-medium"}>
                      {s.attendance}%
                    </span>
                  </TableCell>
                  <TableCell>{s.avgMarks}%</TableCell>
                  <TableCell><Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setStudentList(prev => prev.filter(x => x.id !== s.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminTeachers() {
  const [teacherList, setTeacherList] = React.useState(initialTeachers)
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [subject, setSubject] = React.useState("")

  const handleAdd = () => {
    if (!name || !email || !subject) return
    setTeacherList(prev => [...prev, {
      id: String(Date.now()), name, email, subject, students: 0, status: "active" as const,
    }])
    setName(""); setEmail(""); setSubject(""); setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Teachers</h2>
          <p className="text-sm text-muted-foreground">Manage faculty members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Teacher</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Teacher</DialogTitle>
              <DialogDescription>Register a new teacher</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2"><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Teacher name" /></div>
              <div className="flex flex-col gap-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="teacher@school.edu" /></div>
              <div className="flex flex-col gap-2">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Teacher</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherList.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div>
                      <span className="font-medium">{t.name}</span>
                      <div className="text-xs text-muted-foreground">{t.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>{t.students}</TableCell>
                  <TableCell><Badge variant={t.status === "active" ? "default" : "secondary"}>{t.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setTeacherList(prev => prev.filter(x => x.id !== t.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminExams() {
  const [examList, setExamList] = React.useState(initialExams)
  const [open, setOpen] = React.useState(false)
  const [subject, setSubject] = React.useState("")
  const [date, setDate] = React.useState("")
  const [time, setTime] = React.useState("")
  const [room, setRoom] = React.useState("")

  const handleAdd = () => {
    if (!subject || !date || !time || !room) return
    setExamList(prev => [...prev, { id: String(Date.now()), subject, date, time, room, status: "upcoming" as const }])
    setSubject(""); setDate(""); setTime(""); setRoom(""); setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Exams</h2>
          <p className="text-sm text-muted-foreground">Schedule and manage examinations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Schedule Exam</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Exam</DialogTitle>
              <DialogDescription>Set a new exam date</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2"><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="flex flex-col gap-2"><Label>Time</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
              <div className="flex flex-col gap-2"><Label>Room</Label><Input value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g., Hall A" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exam Calendar</CardTitle>
            <CardDescription>Upcoming examination dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {examList.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-xs font-medium text-primary">{e.date.split("-")[1]}/{e.date.split("-")[2]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{e.subject}</span>
                    <div className="text-xs text-muted-foreground">{e.time} - {e.room}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline">{e.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setExamList(prev => prev.filter(x => x.id !== e.id))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exam Schedule Overview</CardTitle>
            <CardDescription>Distribution by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={examList.map(e => ({ subject: e.subject, count: 1 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="subject" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Exams" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminAssignments() {
  const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    submitted: "bg-blue-100 text-blue-800",
    graded: "bg-emerald-100 text-emerald-800",
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Assignments</h2>
        <p className="text-sm text-muted-foreground">View all assignments across the system</p>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminAnnouncements() {
  const [list, setList] = React.useState(announcements)
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [priority, setPriority] = React.useState("")

  const handlePost = () => {
    if (!title || !message || !priority) return
    setList(prev => [{ id: String(Date.now()), title, message, date: "2026-02-15", author: "Admin Office", priority: priority as "low" | "medium" | "high" }, ...prev])
    setTitle(""); setMessage(""); setPriority(""); setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground">System-wide announcements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post Announcement</DialogTitle>
              <DialogDescription>Broadcast a system-wide announcement</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" /></div>
              <div className="flex flex-col gap-2">
                <Label>Message</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your announcement..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handlePost}>Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-col gap-4">
        {list.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                    <Badge variant={a.priority === "high" ? "destructive" : a.priority === "medium" ? "default" : "secondary"} className="text-[10px]">{a.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>By {a.author}</span>
                    <span>{a.date}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => setList(prev => prev.filter(x => x.id !== a.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AdminSettings() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">System configuration and role management</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />Role Management</CardTitle>
            <CardDescription>Configure role-based access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {[
                { role: "Student", perms: "View grades, attendance, timetable" },
                { role: "Teacher", perms: "Manage students, assignments, marks" },
                { role: "Admin", perms: "Full system access" },
              ].map((r) => (
                <div key={r.role} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <UserCog className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">{r.role}</span>
                      <p className="text-xs text-muted-foreground">{r.perms}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" />System Preferences</CardTitle>
            <CardDescription>General system settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {[
                { label: "Email Notifications", desc: "Send email alerts for important updates", default: true },
                { label: "Auto-Grade Assignments", desc: "Automatically grade objective questions", default: false },
                { label: "Attendance Alerts", desc: "Alert when attendance drops below 75%", default: true },
                { label: "Maintenance Mode", desc: "Temporarily disable student and teacher access", default: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <span className="text-sm font-medium text-foreground">{s.label}</span>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <Switch defaultChecked={s.default} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AdminDashboard({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "students": return <AdminStudents />
    case "teachers": return <AdminTeachers />
    case "exams": return <AdminExams />
    case "assignments": return <AdminAssignments />
    case "announcements": return <AdminAnnouncements />
    case "settings": return <AdminSettings />
    default: return <AdminOverview />
  }
}
