"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import {
  AttendanceStatus,
  fetchAttendanceForDate,
  saveAttendanceSession,
} from "@/lib/attendance";
import { toast } from "sonner";

type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: number;
  class: string;
};

type AssignedSubject = {
  subjectId: string;
  subjectName: string;
  department?: string;
};

const isAccessDeniedError = (message: string) =>
  message.toLowerCase().includes("access denied");

const buildStatusMap = (
  students: StudentOption[],
  existing: { studentId: string; status: AttendanceStatus }[] | null
): Record<string, AttendanceStatus> => {
  const map: Record<string, AttendanceStatus> = {};
  const existingMap = new Map(
    (existing || []).map((item) => [item.studentId, item.status])
  );

  for (const student of students) {
    map[student.id] = existingMap.get(student.id) || "present";
  }

  return map;
};

export function TeacherAttendancePanel() {
  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [students, setStudents] = React.useState<StudentOption[]>([]);
  const [assignedSubject, setAssignedSubject] = React.useState<AssignedSubject>({
    subjectId: "",
    subjectName: "",
  });
  const [selectedClass, setSelectedClass] = React.useState("");
  const [date, setDate] = React.useState(today);
  const [statusByStudent, setStatusByStudent] = React.useState<
    Record<string, AttendanceStatus>
  >({});
  const [loading, setLoading] = React.useState(true);
  const [loadingAttendance, setLoadingAttendance] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadBaseData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [{ data: studentsData, error: studentsError }, { data: subjectData, error: subjectError }] =
        await Promise.all([
          api.get<{
            students: {
              id: string;
              firstName: string;
              lastName: string;
              rollNumber: number;
              class: string;
            }[];
          }>("/api/students"),
          api.get<{ subject: string; subjectId?: string; subjectName?: string; department?: string }>(
            "/api/announcements/teacher/subject"
          ),
        ]);

      if (studentsError) {
        throw new Error(studentsError);
      }
      if (subjectError) {
        throw new Error(subjectError);
      }

      const fetchedStudents = studentsData?.students ?? [];
      setStudents(fetchedStudents);

      const classes = Array.from(
        new Set(fetchedStudents.map((student) => student.class).filter(Boolean))
      ).sort();

      setSelectedClass((prev) =>
        prev && classes.includes(prev) ? prev : classes[0] || ""
      );

      setAssignedSubject({
        subjectId: subjectData?.subjectId || "",
        subjectName: subjectData?.subjectName || subjectData?.subject || "",
        department: subjectData?.department,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadBaseData();
  }, [loadBaseData]);

  const filteredStudents = React.useMemo(
    () => students.filter((student) => student.class === selectedClass),
    [students, selectedClass]
  );

  React.useEffect(() => {
    const loadAttendance = async () => {
      if (!assignedSubject.subjectId || !selectedClass || filteredStudents.length === 0) {
        setStatusByStudent(buildStatusMap(filteredStudents, null));
        return;
      }

      try {
        setLoadingAttendance(true);
        setError("");
        const attendance = await fetchAttendanceForDate(
          date,
          selectedClass,
          assignedSubject.subjectId
        );
        setStatusByStudent(buildStatusMap(filteredStudents, attendance?.records || null));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attendance");
      } finally {
        setLoadingAttendance(false);
      }
    };

    void loadAttendance();
  }, [assignedSubject.subjectId, date, filteredStudents, selectedClass]);

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setStatusByStudent((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setError("");

    if (!assignedSubject.subjectId) {
      setError("No subject assigned to this teacher.");
      return;
    }

    if (!selectedClass) {
      setError("Please select a class to mark attendance.");
      return;
    }

    if (date > today) {
      setError("Future dates are not allowed for attendance.");
      return;
    }

    try {
      setSaving(true);
      await saveAttendanceSession({
        date,
        classId: selectedClass,
        subjectId: assignedSubject.subjectId,
        records: filteredStudents
          .filter((student) => statusByStudent[student.id] === "absent")
          .map((student) => ({
            studentId: student.id,
            status: "absent",
          })),
      });
      toast.success("Attendance saved successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const summary = React.useMemo(() => {
    const total = filteredStudents.length;
    const present = filteredStudents.filter(
      (student) => statusByStudent[student.id] === "present"
    ).length;
    const absent = total - present;
    return { total, present, absent };
  }, [filteredStudents, statusByStudent]);

  const exportCsv = React.useCallback(() => {
    const headers = ["Date", "Class", "Subject", "Roll No", "Student", "Status"];
    const rows = [...filteredStudents]
      .sort((a, b) => (a.rollNumber ?? 0) - (b.rollNumber ?? 0))
      .map((student) => {
        const status = statusByStudent[student.id] || "present";
        return [
          date,
          selectedClass,
          assignedSubject.subjectName || assignedSubject.subjectId,
          String(student.rollNumber ?? ""),
          `${student.firstName} ${student.lastName}`.trim(),
          status === "absent" ? "Absent" : "Present",
        ];
      });

    const csv = [headers, ...rows]
      .map((line) => line.map((value) => `"${String(value).replace(/\"/g, '\"\"')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeSubject = (assignedSubject.subjectName || "subject").replace(/[^a-z0-9-_]+/gi, "-");
    const safeClass = (selectedClass || "class").replace(/[^a-z0-9-_]+/gi, "-");
    link.setAttribute("download", `attendance-${safeClass}-${safeSubject}-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [assignedSubject.subjectId, assignedSubject.subjectName, date, filteredStudents, selectedClass, statusByStudent]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Attendance</h2>
        <p className="text-sm text-muted-foreground">
          Select a date and class to mark attendance for every student.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Setup</CardTitle>
          <CardDescription>Subject is auto-fetched. Only mark absentees.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label>Subject</Label>
            <div className="h-10 rounded-md border px-3 py-2 text-sm">
              {assignedSubject.subjectName || "No subject assigned"}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="class">Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger id="class">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set(students.map((student) => student.class)))
                  .filter(Boolean)
                  .sort()
                  .map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              max={today}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              onClick={handleSave}
              disabled={saving || loading || loadingAttendance || filteredStudents.length === 0}
            >
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
            <Button
              variant="outline"
              onClick={exportCsv}
              disabled={loading || loadingAttendance || filteredStudents.length === 0}
            >
              Download CSV
            </Button>
          </div>
          <div className="md:col-span-4 flex flex-wrap items-center gap-3 text-sm">
            <Badge className="bg-red-600 text-white hover:bg-red-600">
              Absent: {summary.absent}
            </Badge>
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
              Present: {summary.present}
            </Badge>
            <Badge variant="outline">Total: {summary.total}</Badge>
            {loadingAttendance && (
              <span className="text-muted-foreground">Loading attendance...</span>
            )}
            {error && !isAccessDeniedError(error) && (
              <span className="text-sm text-destructive">{error}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Attendance</CardTitle>
          <CardDescription>
            Only mark absentees. Everyone is present by default.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead className="text-right">Absent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Loading students...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No students found for this class.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filteredStudents.map((student) => {
                  const status = statusByStudent[student.id] || "present";
                  const isAbsent = status === "absent";
                  return (
                    <TableRow
                      key={student.id}
                      className={
                        isAbsent
                          ? "bg-red-50/60"
                          : "bg-emerald-50/60"
                      }
                    >
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span
                            className={
                              isAbsent
                                ? "text-red-700 text-sm font-medium"
                                : "text-emerald-700 text-sm font-medium"
                            }
                          >
                            {isAbsent ? "Absent" : "Present"}
                          </span>
                          <Switch
                            checked={isAbsent}
                            onCheckedChange={(checked) =>
                              updateStatus(student.id, checked ? "absent" : "present")
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
