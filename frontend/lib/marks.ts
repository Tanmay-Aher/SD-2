import { api } from "./api";

export interface MarksStudent {
  _id: string;
  firstName: string;
  lastName: string;
  rollNumber: number;
  class: string;
}

export interface MarksTeacher {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface MarksRecord {
  _id: string;
  student: string | MarksStudent;
  teacher: string | MarksTeacher;
  subject: string;
  class: string;
  ct1: number;
  ct2: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMarksPayload {
  studentId: string;
  subject: string;
  ct1: number;
  ct2: number;
}

export const updateMarks = async (
  payload: UpdateMarksPayload
): Promise<{ message: string; marks: MarksRecord }> => {
  const { data, error } = await api.post<{ message: string; marks: MarksRecord }>(
    "/api/marks/update",
    payload
  );

  if (error) {
    throw new Error(error);
  }

  if (!data) {
    throw new Error("Unexpected empty response");
  }

  return data;
};

export const fetchMyMarks = async (): Promise<MarksRecord[]> => {
  const { data, error } = await api.get<{ marks: MarksRecord[] }>("/api/marks/my");

  if (error) {
    throw new Error(error);
  }

  return data?.marks ?? [];
};
