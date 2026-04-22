import apiClient from "../apiClient/apiClient";
import type { Grade } from "../types/types";

export type GradePayload = {
  lesson_id: string;
  enrollment_id: string;
  student_id: string;
  teacher_id?: string | null;
  score: number | string;
  note?: string | null;
};

export type GradeBulkPayload = {
  records: GradePayload[];
};

export async function listGrades(params?: { lessonId?: string; studentId?: string }) {
  const { data } = await apiClient.get<Grade[]>("/grades/", {
    params: {
      lesson_id: params?.lessonId,
      student_id: params?.studentId,
    },
  });
  return data;
}

export async function createGrade(payload: GradePayload) {
  const { data } = await apiClient.post<Grade>("/grades/", payload);
  return data;
}

export async function updateGrade(gradeId: string, payload: Partial<GradePayload>) {
  const { data } = await apiClient.patch<Grade>(`/grades/${gradeId}`, payload);
  return data;
}

export async function bulkUpsertGrades(payload: GradeBulkPayload) {
  const { data } = await apiClient.post<Grade[]>("/grades/save-many", payload);
  return data;
}
