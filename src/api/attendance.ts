import apiClient from "../apiClient/apiClient";
import type { Attendance } from "../types/types";

export type AttendancePayload = {
  lesson_id: string;
  enrollment_id: string;
  student_id: string;
  para: number;
  status?: string;
  note?: string | null;
};

export type AttendanceBulkPayload = {
  records: AttendancePayload[];
};

export async function listAttendance(lessonId: string) {
  const { data } = await apiClient.get<Attendance[]>(`/attendance/lessons/${lessonId}`);
  return data;
}

export async function createAttendance(payload: AttendancePayload) {
  const { data } = await apiClient.post<Attendance>("/attendance/", payload);
  return data;
}

export async function updateAttendance(attendanceId: string, payload: Partial<AttendancePayload>) {
  const { data } = await apiClient.patch<Attendance>(`/attendance/${attendanceId}`, payload);
  return data;
}

export async function bulkUpsertAttendance(payload: AttendanceBulkPayload) {
  const { data } = await apiClient.post<Attendance[]>("/attendance/save-many", payload);
  return data;
}
