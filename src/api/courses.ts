import apiClient from "../apiClient/apiClient";
import type { Course } from "../types/types";

export type CoursePayload = {
  name: string;
  description?: string | null;
  default_monthly_fee: number | string;
  fee_effective_from?: string | null;
  is_active?: boolean;
};

export async function listCourses() {
  const { data } = await apiClient.get<Course[]>("/courses/");
  return data;
}

export async function createCourse(payload: CoursePayload) {
  const { data } = await apiClient.post<Course>("/courses/", payload);
  return data;
}

export async function updateCourse(courseId: string, payload: Partial<CoursePayload>) {
  const { data } = await apiClient.patch<Course>(`/courses/${courseId}`, payload);
  return data;
}

export async function deleteCourse(courseId: string) {
  await apiClient.delete(`/courses/${courseId}`);
}
