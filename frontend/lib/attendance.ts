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

export interface MarkAttendancePayload {
  studentId: string;
  subject: string;
  date: string;
  status: AttendanceStatus;
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

export const markAttendance = async (
  payload: MarkAttendancePayload
): Promise<{ message: string; action: "created" | "updated"; attendance: AttendanceRecord }> => {
  const { data, error } = await api.post<{
    message: string;
    action: "created" | "updated";
    attendance: AttendanceRecord;
  }>("/api/attendance/mark", payload);

  if (error) {
    throw new Error(error);
  }

  if (!data) {
    throw new Error("Unexpected empty response");
  }

  return data;
};
