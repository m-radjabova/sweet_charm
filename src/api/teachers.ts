import apiClient from "../apiClient/apiClient";
import type { TeacherDetail, UserRole, UserStatus } from "../types/types";

export type TeacherCreatePayload = {
  user: {
    full_name: string;
    phone?: string | null;
    email: string;
    password: string;
    roles: UserRole[];
    status: UserStatus;
  };
  profile: {
    specialization?: string | null;
    bio?: string | null;
    hired_at?: string | null;
  };
};

export type TeacherProfilePayload = TeacherCreatePayload["profile"];

export async function listTeachers() {
  const { data } = await apiClient.get<TeacherDetail[]>("/teachers/");
  return data;
}

export async function createTeacher(payload: TeacherCreatePayload) {
  const { data } = await apiClient.post<TeacherDetail>("/teachers/", payload);
  return data;
}

export async function updateTeacherProfile(userId: string, payload: TeacherProfilePayload) {
  const { data } = await apiClient.patch<TeacherDetail["teacher_profile"]>(`/teachers/${userId}/profile`, payload);
  return data;
}
