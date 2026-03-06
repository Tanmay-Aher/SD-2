"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchMyAttendance, AttendanceRecord } from "@/lib/attendance";
import { connectSocket, disconnectSocket } from "@/lib/socket";

type SubjectSummary = {
  subject: string;
  present: number;
  total: number;
  percentage: number;
};

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

const isAccessDeniedError = (message: string) =>
  message.toLowerCase().includes("access denied");

const toUiError = (message: string) => {
  if (isAccessDeniedError(message)) {
    return "Unable to load attendance for this student account.";
  }
  return message;
};

const buildSummary = (records: AttendanceRecord[]): SubjectSummary[] => {
  const map = new Map<string, { present: number; total: number }>();

  for (const record of records) {
    const current = map.get(record.subject) ?? { present: 0, total: 0 };
    current.total += 1;
    if (record.status === "present") {
      current.present += 1;
    }
    map.set(record.subject, current);
  }

  return Array.from(map.entries())
    .map(([subject, value]) => ({
      subject,
      present: value.present,
      total: value.total,
      percentage: Number(((value.present / value.total) * 100).toFixed(1)),
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));
};

const upsertAttendance = (
  records: AttendanceRecord[],
  incoming: Partial<AttendanceRecord> & { attendanceId?: string }
): AttendanceRecord[] => {
  if (!incoming.attendanceId && !incoming._id) {
    return records;
  }

  const id = incoming.attendanceId || incoming._id!;
  const index = records.findIndex((item) => item._id === id);
  const normalized: AttendanceRecord = {
    _id: id,
    subject: incoming.subject || "Unknown",
    date: incoming.date || new Date().toISOString(),
    status: (incoming.status as "present" | "absent") || "absent",
    updatedAt: incoming.updatedAt || new Date().toISOString(),
    teacher: incoming.teacher,
    student: incoming.student,
  };

  if (index === -1) {
    return [normalized, ...records].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  const next = [...records];
  next[index] = { ...next[index], ...normalized };
  return next;
};

export function StudentAttendancePanel() {
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [lastLiveUpdateAt, setLastLiveUpdateAt] = React.useState<string | null>(null);

  const loadAttendance = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const attendance = await fetchMyAttendance();
      setRecords(attendance);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load attendance";
      setError(toUiError(message));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAttendance();
  }, [loadAttendance]);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    const socket = connectSocket(token);
    const onAttendanceUpdated = async (
      payload: Partial<AttendanceRecord> & { attendanceId?: string }
    ) => {
      setRecords((prev) => upsertAttendance(prev, payload));
      await loadAttendance();
      setLastLiveUpdateAt(new Date().toISOString());
    };

    socket.on("attendanceUpdated", onAttendanceUpdated);

    return () => {
      socket.off("attendanceUpdated", onAttendanceUpdated);
      disconnectSocket();
    };
  }, [loadAttendance]);

  const summary = React.useMemo(() => buildSummary(records), [records]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Attendance</h2>
          <p className="text-sm text-muted-foreground">
            Subject-wise attendance with real-time updates
          </p>
        </div>
        {lastLiveUpdateAt && (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
            Live update received at {new Date(lastLiveUpdateAt).toLocaleTimeString("en-IN")}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summary.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No attendance records available.
            </CardContent>
          </Card>
        )}
        {summary.map((item) => (
          <Card key={item.subject}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{item.subject}</CardTitle>
              <CardDescription>
                {item.present} present out of {item.total}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{item.percentage}%</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Marked By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading attendance...
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
              {!loading && !error && records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                !error &&
                records.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="font-medium">{record.subject}</TableCell>
                    <TableCell>{formatDate(record.date)}</TableCell>
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
                    <TableCell>
                      {record.teacher
                        ? `${record.teacher.firstName} ${record.teacher.lastName}`.trim()
                        : "-"}
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
