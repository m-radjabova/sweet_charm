import apiClient from "../apiClient/apiClient";
import type { CourseCenter } from "../types/types";

export type CourseCenterPayload = {
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
};

export async function listCourseCenters() {
  const { data } = await apiClient.get<CourseCenter[]>("/course-centers/");
  return data;
}

export async function createCourseCenter(payload: CourseCenterPayload) {
  const { data } = await apiClient.post<CourseCenter>("/course-centers/", payload);
  return data;
}
