"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  students, assignments, announcements, classPerformanceData,
} from "@/lib/data"
import type { Student } from "@/lib/data"
import { Users, BookOpen, BarChart3, TrendingUp, Eye, Pencil, Trash2, Plus, Megaphone, Send, MessageSquare } from "lucide-react"

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

function TeacherOverview() {
  const totalStudents = students.length
  const avgMarks = Math.round(students.reduce((s, st) => s + st.avgMarks, 0) / totalStudents)
  const avgAttendance = Math.round(students.reduce((s, st) => s + st.attendance, 0) / totalStudents)
  const activeAssignments = assignments.filter(a => a.status === "pending").length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Teacher Overview</h2>
        <p className="text-sm text-muted-foreground">Welcome back, Dr. Sarah Wilson</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={String(totalStudents)} subtitle="Across all classes" icon={Users} trend="+3 this semester" />
        <StatCard title="Average Marks" value={`${avgMarks}%`} subtitle="Class average" icon={BarChart3} trend="+4% from last month" />
        <StatCard title="Attendance" value={`${avgAttendance}%`} subtitle="Average rate" icon={BookOpen} />
        <StatCard title="Active Assignments" value={String(activeAssignments)} subtitle="Pending review" icon={BookOpen} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class Performance Over Time</CardTitle>
          <CardDescription>Average, highest, and lowest scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={classPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={[30, 100]} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Legend />
              <Line type="monotone" dataKey="average" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Average" />
              <Line type="monotone" dataKey="highest" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Highest" />
              <Line type="monotone" dataKey="lowest" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Lowest" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function ViewStudentDialog({ student }: { student: Student }) {
  const perfData = [
    { subject: "Math", score: student.avgMarks + 5 },
    { subject: "Physics", score: student.avgMarks - 3 },
    { subject: "English", score: student.avgMarks + 8 },
    { subject: "Chemistry", score: student.avgMarks - 8 },
    { subject: "Biology", score: student.avgMarks + 2 },
  ]

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{student.name}</DialogTitle>
        <DialogDescription>{student.email} - Grade {student.grade}</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-3 text-center">
          <div className="text-lg font-bold text-foreground">{student.attendance}%</div>
          <div className="text-xs text-muted-foreground">Attendance</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-lg font-bold text-foreground">{student.avgMarks}%</div>
          <div className="text-xs text-muted-foreground">Avg Marks</div>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <div className="text-lg font-bold text-foreground capitalize">{student.status}</div>
          <div className="text-xs text-muted-foreground">Status</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={perfData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="subject" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
          <Bar dataKey="score" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </DialogContent>
  )
}

function TeacherStudents() {
  const [studentList, setStudentList] = React.useState(students)
  const [viewingStudent, setViewingStudent] = React.useState<Student | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Students</h2>
          <p className="text-sm text-muted-foreground">Manage and view student records</p>
        </div>
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
                  <TableCell>
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingStudent(s)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {viewingStudent && <ViewStudentDialog student={viewingStudent} />}
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setStudentList(prev => prev.filter(st => st.id !== s.id))}>
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

function TeacherAssignments() {
  const [list, setList] = React.useState(assignments)
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [dueDate, setDueDate] = React.useState("")

  const handleCreate = () => {
    if (!title || !subject || !dueDate) return
    setList(prev => [...prev, { id: String(Date.now()), title, subject, dueDate, status: "pending" as const }])
    setTitle(""); setSubject(""); setDueDate(""); setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Assignments</h2>
          <p className="text-sm text-muted-foreground">Create and manage assignments</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Assignment</DialogTitle>
              <DialogDescription>Add a new assignment for your students</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="a-title">Title</Label>
                <Input id="a-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment title" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="a-subject">Subject</Label>
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="a-due">Due Date</Label>
                <Input id="a-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>{a.subject}</TableCell>
                  <TableCell>{a.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "graded" ? "default" : a.status === "submitted" ? "secondary" : "outline"}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setList(prev => prev.filter(x => x.id !== a.id))}>
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

function TeacherMarks() {
  const [selectedStudent, setSelectedStudent] = React.useState("")
  const [marksSubject, setMarksSubject] = React.useState("")
  const [marksValue, setMarksValue] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [entries, setEntries] = React.useState([
    { student: "Alice Johnson", subject: "Mathematics", marks: 87 },
    { student: "Bob Smith", subject: "Mathematics", marks: 72 },
    { student: "Carol White", subject: "Mathematics", marks: 91 },
    { student: "David Brown", subject: "Mathematics", marks: 65 },
    { student: "Eva Green", subject: "Mathematics", marks: 83 },
  ])

  const handleAdd = () => {
    if (!selectedStudent || !marksSubject || !marksValue) return
    setEntries(prev => [...prev, { student: selectedStudent, subject: marksSubject, marks: Number(marksValue) }])
    setSelectedStudent(""); setMarksSubject(""); setMarksValue(""); setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marks</h2>
          <p className="text-sm text-muted-foreground">Assign and view student marks</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Assign Marks</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Marks</DialogTitle>
              <DialogDescription>Enter marks for a student</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Subject</Label>
                <Select value={marksSubject} onValueChange={setMarksSubject}>
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
              <div className="flex flex-col gap-2">
                <Label>Marks</Label>
                <Input type="number" min={0} max={100} value={marksValue} onChange={e => setMarksValue(e.target.value)} placeholder="Enter marks (0-100)" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{e.student}</TableCell>
                  <TableCell>{e.subject}</TableCell>
                  <TableCell>{e.marks}</TableCell>
                  <TableCell>
                    <Badge variant={e.marks >= 90 ? "default" : e.marks >= 75 ? "secondary" : "outline"}>
                      {e.marks >= 90 ? "A" : e.marks >= 80 ? "B" : e.marks >= 70 ? "C" : e.marks >= 60 ? "D" : "F"}
                    </Badge>
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

function TeacherAnnouncements() {
  const [list, setList] = React.useState(announcements)
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [priority, setPriority] = React.useState("")

  const handlePost = () => {
    if (!title || !message || !priority) return
    setList(prev => [{ id: String(Date.now()), title, message, date: "2026-02-15", author: "Dr. Sarah Wilson", priority: priority as "low" | "medium" | "high" }, ...prev])
    setTitle(""); setMessage(""); setPriority(""); setOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground">Post and manage announcements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />New Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post Announcement</DialogTitle>
              <DialogDescription>Create a new announcement for your class</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" />
              </div>
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

function TeacherMessages() {
  const [messages] = React.useState([
    { id: "1", from: "Alice Johnson", message: "Dr. Wilson, I have a question about the quadratic equations homework.", time: "10:30 AM", unread: true },
    { id: "2", from: "Bob Smith", message: "Thank you for the extra study materials.", time: "Yesterday", unread: false },
    { id: "3", from: "Carol White", message: "Can I schedule a meeting to discuss my project?", time: "Yesterday", unread: false },
    { id: "4", from: "David Brown", message: "I will be absent tomorrow due to a medical appointment.", time: "2 days ago", unread: false },
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Messages</h2>
        <p className="text-sm text-muted-foreground">Communication with students</p>
      </div>
      <div className="flex flex-col gap-3">
        {messages.map((m) => (
          <Card key={m.id} className={m.unread ? "border-primary/30 bg-primary/[0.02]" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{m.from}</span>
                    {m.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <span className="ml-auto text-xs text-muted-foreground">{m.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{m.message}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function TeacherDashboard({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "students": return <TeacherStudents />
    case "assignments": return <TeacherAssignments />
    case "marks": return <TeacherMarks />
    case "announcements": return <TeacherAnnouncements />
    case "messages": return <TeacherMessages />
    default: return <TeacherOverview />
  }
}
