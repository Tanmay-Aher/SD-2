"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { api } from "@/lib/api"
import { TeacherAttendancePanel } from "@/components/dashboards/teacher-attendance-panel"
import { updateMarks } from "@/lib/marks"
import { Users, BookOpen, BarChart3, TrendingUp, Plus, Megaphone, Send, MessageSquare, Download } from "lucide-react"

const isAccessDeniedError = (message: string) =>
  message.toLowerCase().includes("access denied")

const toUiErrorMessage = (message: string, fallback: string) => {
  if (isAccessDeniedError(message)) {
    return "You are not allowed to perform this action with the current account."
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

function TeacherOverview() {
  const [mounted, setMounted] = React.useState(false)
  const [teacherName, setTeacherName] = React.useState("")
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    averageMarks: 0,
    attendance: 0,
    activeAssignments: 0,
  })
  const [classPerformance, setClassPerformance] = React.useState<
    Array<{ month: string; average: number; highest: number; lowest: number }>
  >([])

  React.useEffect(() => {
    const loadOverview = async () => {
      setMounted(true)
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const fullName =
          user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : ""
        setTeacherName(fullName)
      } catch {
        setTeacherName("")
      }

      try {
        const { data, error } = await api.get<{
          stats: {
            totalStudents: number
            averageMarks: number
            attendance: number
            activeAssignments: number
          }
          charts: {
            classPerformance: Array<{ month: string; average: number; highest: number; lowest: number }>
          }
        }>("/api/dashboard/teacher-overview")

        if (error) {
          return
        }

        setStats({
          totalStudents: Number(data?.stats?.totalStudents || 0),
          averageMarks: Number(data?.stats?.averageMarks || 0),
          attendance: Number(data?.stats?.attendance || 0),
          activeAssignments: Number(data?.stats?.activeAssignments || 0),
        })
        setClassPerformance(
          Array.isArray(data?.charts?.classPerformance) ? data!.charts.classPerformance : []
        )
      } catch {
        setStats({
          totalStudents: 0,
          averageMarks: 0,
          attendance: 0,
          activeAssignments: 0,
        })
        setClassPerformance([])
      }
    }

    loadOverview()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Teacher Overview</h2>
        <p className="text-sm text-muted-foreground">
          {mounted ? `Welcome back, ${teacherName || "Teacher"}` : "Loading..."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={String(stats.totalStudents)} subtitle="In your department" icon={Users} />
        <StatCard title="Average Marks" value={`${stats.averageMarks}%`} subtitle="Submission completion rate" icon={BarChart3} />
        <StatCard title="Attendance" value={`${stats.attendance}%`} subtitle="From attendance marked by you" icon={BookOpen} />
        <StatCard title="Active Assignments" value={String(stats.activeAssignments)} subtitle="Pending review" icon={BookOpen} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class Performance Over Time</CardTitle>
          <CardDescription>Average, highest, and lowest scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={classPerformance}>
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

function TeacherStudents() {
  type StudentRow = {
    id: string
    firstName: string
    lastName: string
    email: string
    rollNumber: number
    class: string
  }

  type StudentProgress = {
    subject: string
    ct1: number
    ct2: number
    total: number
    maxTotal: number
    percentage: number
    hasMarks: boolean
    updatedAt: string | null
  }

  const [studentList, setStudentList] = React.useState<
    StudentRow[]
  >([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [isProgressDialogOpen, setIsProgressDialogOpen] = React.useState(false)
  const [selectedStudentName, setSelectedStudentName] = React.useState("")
  const [selectedProgress, setSelectedProgress] = React.useState<StudentProgress | null>(null)
  const [progressLoading, setProgressLoading] = React.useState(false)
  const [progressError, setProgressError] = React.useState("")

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        setError("")
        const { data, error } = await api.get<{ students: StudentRow[] }>("/api/students")

        if (error) {
          throw new Error(error)
        }

        const records = data?.students
        setStudentList(Array.isArray(records) ? records : [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch students")
        setStudentList([])
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const loadStudentProgress = async (student: StudentRow) => {
    const fullName = `${student.firstName} ${student.lastName}`.trim() || "Student"
    setSelectedStudentName(fullName)
    setIsProgressDialogOpen(true)
    setProgressLoading(true)
    setProgressError("")
    setSelectedProgress(null)
    try {
      const { data, error } = await api.get<{ progress: StudentProgress }>(
        `/api/marks/teacher/student/${student.id}/progress`
      )
      if (error) {
        throw new Error(error)
      }
      if (!data?.progress) {
        throw new Error("Progress data not found")
      }
      setSelectedProgress(data.progress)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load progress"
      setProgressError(toUiErrorMessage(message, "Failed to load progress"))
    } finally {
      setProgressLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Students</h2>
          <p className="text-sm text-muted-foreground">Students from the database</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Academic Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading students...
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-destructive">
                    {isAccessDeniedError(error) ? "Unable to load students." : error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && studentList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && studentList.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{`${student.firstName} ${student.lastName}`.trim() || "-"}</TableCell>
                  <TableCell>{student.email || "-"}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadStudentProgress(student)}
                    >
                      View Progress
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedStudentName} - Academic Progress</DialogTitle>
            <DialogDescription>
              Progress for the teacher's assigned subject
            </DialogDescription>
          </DialogHeader>

          {progressLoading && (
            <p className="text-sm text-muted-foreground">Loading progress...</p>
          )}

          {!progressLoading && progressError && (
            <p className="text-sm text-destructive">{progressError}</p>
          )}

          {!progressLoading && !progressError && selectedProgress && (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="text-base font-semibold text-foreground">
                  {selectedProgress.subject}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">CT1</p>
                  <p className="text-lg font-semibold">{selectedProgress.ct1}/30</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">CT2</p>
                  <p className="text-lg font-semibold">{selectedProgress.ct2}/30</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Average</p>
                  <p className="text-lg font-semibold">
                    {(selectedProgress.ct1 + selectedProgress.ct2) / 2}/30
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">
                    {selectedProgress.percentage}%
                  </span>
                </div>
                <Progress value={selectedProgress.percentage} />
              </div>
              {!selectedProgress.hasMarks && (
                <p className="text-sm text-muted-foreground">
                  No marks saved yet for this subject.
                </p>
              )}
              {selectedProgress.updatedAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(selectedProgress.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeacherAssignments() {
  const [list, setList] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [markingId, setMarkingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [dueDate, setDueDate] = React.useState("")
  const [subject, setSubject] = React.useState("")

  const loadData = React.useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [{ data: subjectData, error: subjectError }, { data: assignmentData, error: assignmentError }] = await Promise.all([
        api.get<{ subject: string }>("/api/announcements/teacher/subject"),
        api.get<{ assignments: any[] }>("/api/assignments/teacher"),
      ])

      if (assignmentError) throw new Error(assignmentError)

      setSubject(subjectData?.subject || "")
      if (subjectError) {
        setError(toUiErrorMessage(subjectError, "Unable to load subject"))
      }
      setList(Array.isArray(assignmentData?.assignments) ? assignmentData!.assignments : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load assignments"
      setError(toUiErrorMessage(message, "Failed to load assignments"))
      setList([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !dueDate) {
      setError("Title, description, and due date are required")
      return
    }
    if (!subject.trim()) {
      setError("Subject is not assigned. Ask admin to assign a subject to this teacher.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const { error } = await api.post("/api/assignments/create", {
        title: title.trim(),
        description: description.trim(),
        dueDate,
      })
      if (error) throw new Error(error)

      setTitle("")
      setDescription("")
      setDueDate("")
      await loadData()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create assignment"
      setError(toUiErrorMessage(message, "Failed to create assignment"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkCompleted = async (submissionId: string) => {
    setMarkingId(submissionId)
    setError("")
    try {
      const { error } = await api.patch(`/api/assignments/mark-completed/${submissionId}`, {})
      if (error) throw new Error(error)
      await loadData()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update submission"
      setError(toUiErrorMessage(message, "Failed to update submission"))
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Assignments</h2>
          <p className="text-sm text-muted-foreground">Create assignments and track student completion</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create Assignment</CardTitle>
          <CardDescription>Subject is automatically assigned from your profile</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="a-title">Title</Label>
            <Input id="a-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment title" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="a-subject">Subject</Label>
            <Input id="a-subject" value={subject} readOnly placeholder="Auto-filled subject" />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="a-description">Description</Label>
            <textarea
              id="a-description"
              className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Assignment details for students"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="a-due">Due Date</Label>
            <Input id="a-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreate} disabled={submitting} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {submitting ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {error && (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignment Management</CardTitle>
          <CardDescription>Mark submissions completed for each student</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Loading assignments...</p>}
          {!loading && list.length === 0 && <p className="text-sm text-muted-foreground">No assignments created yet.</p>}
          {!loading && list.map((assignment) => (
            <Card key={assignment._id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{assignment.title}</CardTitle>
                <CardDescription>
                  {assignment.subject} | Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed At</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(assignment.submissions || []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No student submissions found for this department.
                        </TableCell>
                      </TableRow>
                    )}
                    {(assignment.submissions || []).map((submission: any) => (
                      <TableRow key={submission._id}>
                        <TableCell className="font-medium">
                          {submission.student?.firstName} {submission.student?.lastName}
                        </TableCell>
                        <TableCell>{submission.student?.rollNumber || "-"}</TableCell>
                        <TableCell>
                          <Badge className={submission.status === "completed" ? "bg-green-600" : "bg-red-600"}>
                            {submission.status === "completed" ? "Completed" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {submission.completedAt
                            ? new Date(submission.completedAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleMarkCompleted(String(submission._id))}
                            disabled={submission.status === "completed" || markingId === String(submission._id)}
                          >
                            {markingId === String(submission._id) ? "Updating..." : "Mark Completed"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function TeacherMarks() {
  const [studentsList, setStudentsList] = React.useState<
    {
      id: string
      firstName: string
      lastName: string
      rollNumber: number
      class: string
    }[]
  >([])
  const [assignedSubject, setAssignedSubject] = React.useState("")
  const [marksByStudent, setMarksByStudent] = React.useState<
    Record<string, { ct1: string; ct2: string }>
  >({})
  const [loading, setLoading] = React.useState(true)
  const [savingByStudent, setSavingByStudent] = React.useState<Record<string, boolean>>({})
  const [messageByStudent, setMessageByStudent] = React.useState<Record<string, string>>({})
  const [errorByStudent, setErrorByStudent] = React.useState<Record<string, string>>({})
  const [globalError, setGlobalError] = React.useState("")

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setGlobalError("")

        const [{ data: studentsData, error: studentsError }, { data: subjectData, error: subjectError }] =
          await Promise.all([
            api.get<{
              students: {
                id: string
                firstName: string
                lastName: string
                rollNumber: number
                class: string
              }[]
            }>("/api/students"),
            api.get<{ subject: string }>("/api/announcements/teacher/subject"),
          ])

        if (studentsError) {
          throw new Error(studentsError)
        }
        if (subjectError) {
          throw new Error(subjectError)
        }

        const fetchedStudents = studentsData?.students ?? []
        const fetchedSubject = subjectData?.subject ?? ""
        setStudentsList(fetchedStudents)
        setAssignedSubject(fetchedSubject)

        const initialMarks: Record<string, { ct1: string; ct2: string }> = {}
        fetchedStudents.forEach((student) => {
          initialMarks[student.id] = { ct1: "", ct2: "" }
        })
        setMarksByStudent(initialMarks)
      } catch (err) {
        setStudentsList([])
        setAssignedSubject("")
        setGlobalError(err instanceof Error ? err.message : "Failed to load marks form")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const updateStudentMarksField = (
    studentId: string,
    key: "ct1" | "ct2",
    value: string
  ) => {
    setMarksByStudent((prev) => ({
      ...prev,
      [studentId]: {
        ct1: prev[studentId]?.ct1 ?? "",
        ct2: prev[studentId]?.ct2 ?? "",
        [key]: value,
      },
    }))
    setErrorByStudent((prev) => ({ ...prev, [studentId]: "" }))
    setMessageByStudent((prev) => ({ ...prev, [studentId]: "" }))
  }

  const handleSave = async (studentId: string) => {
    if (!assignedSubject) {
      setGlobalError("No subject assigned to this teacher.")
      return
    }

    const ct1Raw = marksByStudent[studentId]?.ct1 ?? ""
    const ct2Raw = marksByStudent[studentId]?.ct2 ?? ""
    const ct1 = Number(ct1Raw)
    const ct2 = Number(ct2Raw)

    if (ct1Raw === "" || ct2Raw === "" || Number.isNaN(ct1) || Number.isNaN(ct2)) {
      setErrorByStudent((prev) => ({
        ...prev,
        [studentId]: "CT1 and CT2 are required",
      }))
      return
    }

    if (ct1 < 0 || ct1 > 30 || ct2 < 0 || ct2 > 30) {
      setErrorByStudent((prev) => ({
        ...prev,
        [studentId]: "CT1 and CT2 must be between 0 and 30",
      }))
      return
    }

    try {
      setSavingByStudent((prev) => ({ ...prev, [studentId]: true }))
      setErrorByStudent((prev) => ({ ...prev, [studentId]: "" }))
      setMessageByStudent((prev) => ({ ...prev, [studentId]: "" }))

      const response = await updateMarks({
        studentId,
        subject: assignedSubject,
        ct1,
        ct2,
      })

      setMessageByStudent((prev) => ({
        ...prev,
        [studentId]: response.message || "Marks saved successfully",
      }))
    } catch (err) {
      setErrorByStudent((prev) => ({
        ...prev,
        [studentId]: err instanceof Error ? err.message : "Failed to save marks",
      }))
    } finally {
      setSavingByStudent((prev) => ({ ...prev, [studentId]: false }))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marks</h2>
          <p className="text-sm text-muted-foreground">Enter CT1 and CT2 marks (out of 30)</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-xs flex flex-col gap-2">
            <Label>Assigned Subject</Label>
            <Input value={assignedSubject || "No subject assigned"} readOnly />
          </div>
          {globalError && (
            <p className="text-sm text-destructive mt-3">{toUiErrorMessage(globalError, "Failed to load marks form")}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>CT1</TableHead>
                <TableHead>CT2</TableHead>
                <TableHead>Save</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading students...
                  </TableCell>
                </TableRow>
              )}
              {!loading && studentsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
              {!loading && studentsList.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={marksByStudent[student.id]?.ct1 ?? ""}
                      onChange={(event) =>
                        updateStudentMarksField(student.id, "ct1", event.target.value)
                      }
                      placeholder="0-30"
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={marksByStudent[student.id]?.ct2 ?? ""}
                      onChange={(event) =>
                        updateStudentMarksField(student.id, "ct2", event.target.value)
                      }
                      placeholder="0-30"
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleSave(student.id)}
                        disabled={savingByStudent[student.id] || !assignedSubject}
                      >
                        {savingByStudent[student.id] ? "Saving..." : "Save"}
                      </Button>
                      {messageByStudent[student.id] && (
                        <span className="text-xs text-emerald-600">
                          {messageByStudent[student.id]}
                        </span>
                      )}
                      {errorByStudent[student.id] && (
                        <span className="text-xs text-destructive">
                          {errorByStudent[student.id]}
                        </span>
                      )}
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

function TeacherTimetable() {
  return (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight">Timetable</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              View your official MSBTE Academic Year schedule below.
            </CardDescription>
          </div>
          <a
            href="/timetable.pdf"
            download
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:shadow-md transition"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        </div>
        <div className="h-px bg-border w-full" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-[85vh]">
          <iframe
            src="/timetable.pdf#toolbar=0&navpanes=0&scrollbar=0"
            className="w-full h-full"
            title="Teacher Timetable"
          />
        </div>
      </CardContent>
    </Card>
  )
}

function TeacherAnnouncements() {
  const [list, setList] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [subject, setSubject] = React.useState("")
  const [error, setError] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [message, setMessage] = React.useState("")

  const loadData = React.useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data, error } = await api.get<{ subject: string; announcements: any[] }>("/api/announcements/teacher")
      if (error) throw new Error(error)

      setSubject(data?.subject || "")
      setList(Array.isArray(data?.announcements) ? data!.announcements : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load announcements"
      setError(toUiErrorMessage(message, "Failed to load announcements"))
      setList([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handlePost = async () => {
    if (!title.trim() || !message.trim()) {
      setError("Title and message are required")
      return
    }
    if (!subject.trim()) {
      setError("Subject is not assigned. Ask admin to assign a subject to this teacher.")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const { error } = await api.post("/api/announcements/create", {
        title: title.trim(),
        message: message.trim(),
      })
      if (error) throw new Error(error)

      setTitle("")
      setMessage("")
      await loadData()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to post announcement"
      setError(toUiErrorMessage(message, "Failed to post announcement"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground">Create subject announcements for students</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Post Announcement</CardTitle>
          <CardDescription>Subject is auto-filled from your assigned subject</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="an-title">Title</Label>
            <Input id="an-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="an-subject">Subject</Label>
            <Input id="an-subject" value={subject} readOnly placeholder="Auto-filled subject" />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="an-message">Message</Label>
            <textarea
              id="an-message"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement..."
            />
          </div>
          <div className="md:col-span-2">
            <Button onClick={handlePost} disabled={submitting}>
              {submitting ? "Posting..." : "Post Announcement"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {error && (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}
      <div className="flex flex-col gap-4">
        {loading && <p className="text-sm text-muted-foreground">Loading announcements...</p>}
        {!loading && list.length === 0 && <p className="text-sm text-muted-foreground">No announcements posted yet.</p>}
        {!loading && list.map((a) => (
          <Card key={a._id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                    <Badge variant="secondary" className="text-[10px]">{a.subject}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>By {a.teacher?.firstName} {a.teacher?.lastName}</span>
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
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
    case "attendance": return <TeacherAttendancePanel />
    case "assignments": return <TeacherAssignments />
    case "marks": return <TeacherMarks />
    case "timetable": return <TeacherTimetable />
    case "announcements": return <TeacherAnnouncements />
    case "messages": return <TeacherMessages />
    default: return <TeacherOverview />
  }
}
