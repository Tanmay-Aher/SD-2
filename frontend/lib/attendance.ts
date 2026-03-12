import { api } from "./api";

export type AttendanceStatus = "present" | "absent";

export interface AttendanceTeacher {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface AttendanceStudent {
  _id: string;
  firstName: string;
  lastName: string;
  rollNumber: number;
}

export interface AttendanceRecord {
  _id: string;
  student?: AttendanceStudent;
  teacher?: AttendanceTeacher;
  subject: string;
  date: string;
  status: AttendanceStatus;
  updatedAt: string;
}

export interface AttendanceSessionRecord {
  studentId: string;
  status: AttendanceStatus;
}

export interface AttendanceSession {
  _id: string;
  date: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  records: AttendanceSessionRecord[];
}

export interface SaveAttendancePayload {
  date: string;
  classId: string;
  subjectId: string;
  records: AttendanceSessionRecord[];
}

export const fetchMyAttendance = async (): Promise<AttendanceRecord[]> => {
  const { data, error } = await api.get<{ attendance: AttendanceRecord[] }>(
    "/api/attendance/my"
  );
  if (error) {
    throw new Error(error);
  }
  return data?.attendance ?? [];
};

export const fetchTeacherAttendance = async (): Promise<AttendanceRecord[]> => {
  const { data, error } = await api.get<{ attendance: AttendanceRecord[] }>(
    "/api/attendance/teacher"
  );
  if (error) {
    throw new Error(error);
  }
  return data?.attendance ?? [];
};

export const fetchAttendanceForDate = async (
  date: string,
  classId: string,
  subjectId: string
): Promise<AttendanceSession | null> => {
  const params = new URLSearchParams({
    date,
    classId,
    subjectId,
  });
  const { data, error } = await api.get<{ attendance: AttendanceSession | null }>(
    `/api/attendance/teacher/date?${params.toString()}`
  );

  if (error) {
    throw new Error(error);
  }

  return data?.attendance ?? null;
};

export const saveAttendanceSession = async (
  payload: SaveAttendancePayload
): Promise<{ message: string; action: "created" | "updated"; attendance: AttendanceSession }> => {
  const { data, error } = await api.post<{
    message: string;
    action: "created" | "updated";
    attendance: AttendanceSession;
  }>("/api/attendance/save", payload);

  if (error) {
    throw new Error(error);
  }

  if (!data) {
    throw new Error("Unexpected empty response");
  }

  return data;
};
