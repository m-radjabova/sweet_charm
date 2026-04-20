import apiClient from "../apiClient/apiClient";
import type {
  Enrollment,
  PaginatedResult,
  StudentDetail,
  UserRole,
  UserStatus,
} from "../types/types";

export type ListStudentsParams = {
  unassignedOnly?: boolean;
  page?: number;
  limit?: number;
  search?: string;
};

export async function listStudents(params?: ListStudentsParams) {
  const { data } = await apiClient.get<PaginatedResult<StudentDetail> | StudentDetail[]>("/students/", {
    params: {
      ...(params?.unassignedOnly ? { unassigned_only: true } : {}),
      ...(params?.page ? { page: params.page } : {}),
      ...(params?.limit ? { limit: params.limit } : {}),
      ...(params?.search ? { search: params.search } : {}),
    },
  });

  // Backward compatibility: old backend may return a plain array.
  if (Array.isArray(data)) {
    const searchTerm = params?.search?.trim().toLowerCase() ?? "";
    const filtered = searchTerm
      ? data.filter((student) =>
          [
            student.full_name,
            student.email,
            student.phone,
            student.student_profile?.parent_phone,
          ]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(searchTerm)),
        )
      : data;

    const limit = Math.max(1, params?.limit ?? 20);
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(Math.max(params?.page ?? 1, 1), pages);
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      active_total: filtered.filter((student) => student.status === "active").length,
      page,
      limit,
      pages,
    } satisfies PaginatedResult<StudentDetail>;
  }

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

  try {
    const { data: updatedStudent } = await apiClient.get<StudentDetail>(`/students/${userId}`);
    return updatedStudent;
  } catch {
    const fallbackList = await listStudents({ page: 1, limit: 10000 });
    const updatedStudent = fallbackList.items.find((student) => student.id === userId);
    if (!updatedStudent) {
      throw new Error("Yangilangan student topilmadi");
    }
    return updatedStudent;
  }
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
