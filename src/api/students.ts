import apiClient from "../apiClient/apiClient";
import type { Enrollment, StudentDetail, UserRole, UserStatus } from "../types/types";

export async function listStudents(params?: { unassignedOnly?: boolean }) {
  const { data } = await apiClient.get<StudentDetail[]>("/students/", {
    params: params?.unassignedOnly ? { unassigned_only: true } : undefined,
  });
  return data;
}

export type StudentCreatePayload = {
  user: {
    full_name: string;
    phone?: string | null;
    email: string;
    password: string;
    roles: UserRole[];
    status: UserStatus;
  };
  profile: {
    parent_name?: string | null;
    parent_phone?: string | null;
    notes?: string | null;
    extra_info?: string | null;
    created_by_teacher_id?: string | null;
  };
};

export type StudentUpdatePayload = {
  user: {
    full_name?: string;
    phone?: string | null;
    email?: string;
    password?: string;
    status?: UserStatus;
  };
  profile: {
    parent_phone?: string | null;
    notes?: string | null;
    extra_info?: string | null;
  };
};

export async function createStudent(payload: StudentCreatePayload) {
  const { data } = await apiClient.post<StudentDetail>("/students/", payload);
  return data;
}

export async function updateStudent(userId: string, payload: StudentUpdatePayload) {
  await Promise.all([
    apiClient.patch(`/users/${userId}`, payload.user),
    apiClient.patch(`/students/${userId}/profile`, payload.profile),
  ]);

  const { data } = await apiClient.get<StudentDetail[]>("/students/");
  const updatedStudent = data.find((student) => student.id === userId);

  if (!updatedStudent) {
    throw new Error("Yangilangan student topilmadi");
  }

  return updatedStudent;
}

export async function listGroupEnrollments(groupId: string) {
  const { data } = await apiClient.get<Enrollment[]>(`/students/groups/${groupId}/enrollments`);
  return data;
}

export type EnrollmentPayload = {
  student_id: string;
  group_id: string;
  enrolled_at: string;
  left_at?: string | null;
  status?: string;
};

export type BulkEnrollmentPayload = {
  student_ids: string[];
  group_id: string;
  enrolled_at: string;
  status?: string;
};

export async function enrollStudent(payload: EnrollmentPayload) {
  const { data } = await apiClient.post<Enrollment>("/students/enrollments", payload);
  return data;
}

export async function bulkEnrollStudents(payload: BulkEnrollmentPayload) {
  const { data } = await apiClient.post<Enrollment[]>("/students/enrollments/bulk", payload);
  return data;
}

export async function updateEnrollment(enrollmentId: string, payload: Partial<EnrollmentPayload>) {
  const { data } = await apiClient.patch<Enrollment>(`/students/enrollments/${enrollmentId}`, payload);
  return data;
}
