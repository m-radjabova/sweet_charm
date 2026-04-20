import apiClient from "../apiClient/apiClient";
import type { Lesson } from "../types/types";

export type LessonPayload = {
  group_id: string;
  lesson_number?: number | null;
  lesson_date: string;
  topic?: string | null;
  homework?: string | null;
  notes?: string | null;
};

export async function listLessons(params?: { groupId?: string; year?: number; month?: number }) {
  const { data } = await apiClient.get<Lesson[]>("/lessons/", {
    params: {
      group_id: params?.groupId,
      year: params?.year,
      month: params?.month,
    },
  });
  return data;
}

export async function createLesson(payload: LessonPayload) {
  const { data } = await apiClient.post<Lesson>("/lessons/", payload);
  return data;
}

export async function updateLesson(lessonId: string, payload: Partial<LessonPayload>) {
  const { data } = await apiClient.patch<Lesson>(`/lessons/${lessonId}`, payload);
  return data;
}

export async function deleteLesson(lessonId: string) {
  await apiClient.delete(`/lessons/${lessonId}`);
}
