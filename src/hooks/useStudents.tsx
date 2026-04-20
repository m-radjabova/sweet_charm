import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  bulkEnrollStudents,
  createStudent,
  enrollStudent,
  type ListStudentsParams,
  listGroupEnrollments,
  listStudents,
  updateStudent,
  updateEnrollment,
  type BulkEnrollmentPayload,
  type EnrollmentPayload,
  type StudentCreatePayload,
  type StudentUpdatePayload,
} from "../api/students";
import { getErrorMessage } from "../api/auth";
import {
  invalidateStudentDependentQueries,
  syncGroupEnrollmentQueries,
} from "./queryInvalidation";
type UseStudentsOptions = {
  includeStudentLists?: boolean;
  studentListParams?: ListStudentsParams;
};

export default function useStudents(groupId?: string, options?: UseStudentsOptions) {
  const queryClient = useQueryClient();
  const includeStudentLists = options?.includeStudentLists ?? true;
  const studentListParams = options?.studentListParams ?? { page: 1, limit: 10000 };
  const enrollmentQueryKey = ["group-enrollments", groupId ?? "none"] as const;

  const studentsQuery = useQuery({
    queryKey: ["students", studentListParams],
    queryFn: () => listStudents(studentListParams),
    enabled: includeStudentLists,
  });

  const assignableStudentsQuery = useQuery({
    queryKey: ["students", "unassigned-only"],
    queryFn: () => listStudents({ unassignedOnly: true, page: 1, limit: 10000 }),
    enabled: includeStudentLists,
  });

  const enrollmentsQuery = useQuery({
    queryKey: enrollmentQueryKey,
    queryFn: () => listGroupEnrollments(groupId as string),
    enabled: Boolean(groupId),
  });

  const createStudentMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async (createdStudent) => {
      toast.success("Student yaratildi");
      await invalidateStudentDependentQueries(queryClient, [createdStudent.id]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Student yaratib bo'lmadi")),
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: StudentUpdatePayload }) =>
      updateStudent(userId, payload),
    onSuccess: async (updatedStudent) => {
      toast.success("Student ma'lumotlari yangilandi");
      await invalidateStudentDependentQueries(queryClient, [updatedStudent.id]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Studentni yangilab bo'lmadi")),
  });

  const enrollStudentMutation = useMutation({
    mutationFn: enrollStudent,
    onSuccess: async (createdEnrollment, payload) => {
      toast.success("Student guruhga biriktirildi");
      syncGroupEnrollmentQueries(queryClient, payload.group_id, (previous) => [
        createdEnrollment,
        ...previous.filter((enrollment) => enrollment.id !== createdEnrollment.id),
      ]);
      await invalidateStudentDependentQueries(queryClient, [payload.student_id]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Studentni guruhga biriktirib bo'lmadi")),
  });

  const bulkEnrollStudentsMutation = useMutation({
    mutationFn: bulkEnrollStudents,
    onSuccess: async (createdEnrollments, payload) => {
      toast.success("Studentlar guruhga biriktirildi");
      syncGroupEnrollmentQueries(queryClient, payload.group_id, (previous) => [
        ...createdEnrollments,
        ...previous.filter(
          (enrollment) =>
            !createdEnrollments.some((createdEnrollment) => createdEnrollment.id === enrollment.id),
        ),
      ]);
      await invalidateStudentDependentQueries(queryClient, payload.student_ids);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Studentlarni guruhga biriktirib bo'lmadi")),
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ enrollmentId, payload }: { enrollmentId: string; payload: Partial<EnrollmentPayload> }) =>
      updateEnrollment(enrollmentId, payload),
    onSuccess: async (updatedEnrollment) => {
      toast.success("Student guruhdan chetlashtirildi");
      syncGroupEnrollmentQueries(queryClient, updatedEnrollment.group_id, (previous) =>
        previous.map((enrollment) =>
          enrollment.id === updatedEnrollment.id ? updatedEnrollment : enrollment,
        ),
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["students", "unassigned-only"], exact: true }),
        queryClient.invalidateQueries({ queryKey: ["students"] }),
        invalidateStudentDependentQueries(queryClient, [updatedEnrollment.student_id]),
      ]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Studentni chetlashtirib bo'lmadi")),
  });

  return {
    students: studentsQuery.data?.items ?? [],
    studentsTotal: studentsQuery.data?.total ?? 0,
    activeStudentsTotal: studentsQuery.data?.active_total ?? 0,
    studentsPage: studentsQuery.data?.page ?? 1,
    studentsPages: studentsQuery.data?.pages ?? 1,
    studentsLimit: studentsQuery.data?.limit ?? studentListParams.limit ?? 20,
    assignableStudents: assignableStudentsQuery.data?.items ?? [],
    enrollments: enrollmentsQuery.data ?? [],
    loading: studentsQuery.isLoading || assignableStudentsQuery.isLoading || enrollmentsQuery.isLoading,
    studentsLoading: studentsQuery.isLoading,
    assignableStudentsLoading: assignableStudentsQuery.isLoading,
    enrollmentsLoading: enrollmentsQuery.isLoading,
    createStudent: (payload: StudentCreatePayload) => createStudentMutation.mutateAsync(payload),
    updateStudent: (userId: string, payload: StudentUpdatePayload) =>
      updateStudentMutation.mutateAsync({ userId, payload }),
    enrollStudent: (payload: EnrollmentPayload) => enrollStudentMutation.mutateAsync(payload),
    bulkEnrollStudents: (payload: BulkEnrollmentPayload) => bulkEnrollStudentsMutation.mutateAsync(payload),
    updateEnrollment: (enrollmentId: string, payload: Partial<EnrollmentPayload>) =>
      updateEnrollmentMutation.mutateAsync({ enrollmentId, payload }),
    creatingStudent: createStudentMutation.isPending,
    updatingStudent: updateStudentMutation.isPending,
    enrollingStudent: enrollStudentMutation.isPending,
    bulkEnrollingStudents: bulkEnrollStudentsMutation.isPending,
    updatingEnrollment: updateEnrollmentMutation.isPending,
  };
}
