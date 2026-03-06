"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { markAttendance, fetchTeacherAttendance, AttendanceRecord } from "@/lib/attendance";

type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: number;
};

const isAccessDeniedError = (message: string) =>
  message.toLowerCase().includes("access denied");

export function TeacherAttendancePanel() {
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [students, setStudents] = React.useState<StudentOption[]>([]);
  const [assignedSubject, setAssignedSubject] = React.useState("");
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    studentId: "",
    status: "present" as "present" | "absent",
    date: today,
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [
        { data: studentsData, error: studentsError },
        { data: subjectData, error: subjectError },
        attendance,
      ] = await Promise.all([
        api.get<{
          students: {
            id: string;
            firstName: string;
            lastName: string;
            rollNumber: number;
          }[];
        }>("/api/students"),
        api.get<{ subject: string }>("/api/announcements/teacher/subject"),
        fetchTeacherAttendance(),
      ]);

      if (studentsError) {
        throw new Error(studentsError);
      }
      if (subjectError) {
        throw new Error(subjectError);
      }

      setStudents(studentsData?.students ?? []);
      setAssignedSubject(subjectData?.subject ?? "");
      setRecords(attendance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const autoSubject = assignedSubject;
    if (!autoSubject) {
      setError("No subject assigned to this teacher.");
      return;
    }

    if (!form.studentId || !form.date || !form.status) {
      setError("Please complete all fields.");
      return;
    }

    if (form.date > today) {
      setError("Future dates are not allowed for attendance.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await markAttendance({
        studentId: form.studentId,
        subject: autoSubject,
        date: form.date,
        status: form.status,
      });

      setMessage(response.message);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mark Attendance</h2>
        <p className="text-sm text-muted-foreground">
          Subject is auto-fetched from the system. Existing entries are updated.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Form</CardTitle>
          <CardDescription>Teacher-only action</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
                <Label>Auto Subject</Label>
              <div className="h-10 rounded-md border px-3 py-2 text-sm">
                {assignedSubject || "No subject assigned"}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="student">Student</Label>
              <Select
                value={form.studentId}
                onValueChange={(studentId) => setForm((prev) => ({ ...prev, studentId }))}
              >
                <SelectTrigger id="student">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.rollNumber} - {student.firstName} {student.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(status: "present" | "absent") =>
                  setForm((prev) => ({ ...prev, status }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                max={today}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, date: event.target.value }))
                }
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Mark Attendance"}
              </Button>
              {message && <span className="text-sm text-emerald-600">{message}</span>}
              {error && !isAccessDeniedError(error) && (
                <span className="text-sm text-destructive">{error}</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading records...
                  </TableCell>
                </TableRow>
              )}
              {!loading && records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No attendance records yet.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                records.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell>
                      {record.student
                        ? `${record.student.rollNumber} - ${record.student.firstName} ${record.student.lastName}`
                        : "-"}
                    </TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          record.status === "present"
                            ? "bg-emerald-600 text-white hover:bg-emerald-600"
                            : "bg-red-600 text-white hover:bg-red-600"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
