import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  bulkEnrollStudents,
  createStudent,
  enrollStudent,
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
import type { Enrollment, StudentDetail } from "../types/types";

type UseStudentsOptions = {
  includeStudentLists?: boolean;
};

export default function useStudents(groupId?: string, options?: UseStudentsOptions) {
  const queryClient = useQueryClient();
  const includeStudentLists = options?.includeStudentLists ?? true;
  const enrollmentQueryKey = ["group-enrollments", groupId ?? "none"] as const;

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => listStudents(),
    enabled: includeStudentLists,
  });

  const assignableStudentsQuery = useQuery({
    queryKey: ["students", "unassigned-only"],
    queryFn: () => listStudents({ unassignedOnly: true }),
    enabled: includeStudentLists,
  });

  const enrollmentsQuery = useQuery({
    queryKey: enrollmentQueryKey,
    queryFn: () => listGroupEnrollments(groupId as string),
    enabled: Boolean(groupId),
  });

  const createStudentMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: (createdStudent) => {
      toast.success("Student yaratildi");
      queryClient.setQueryData<StudentDetail[]>(["students"], (previous = []) => [createdStudent, ...previous]);
      queryClient.setQueryData<StudentDetail[]>(
        ["students", "unassigned-only"],
        (previous = []) => [createdStudent, ...previous],
      );
    },
    onError: (error) => toast.error(getErrorMessage(error, "Student yaratib bo'lmadi")),
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: StudentUpdatePayload }) =>
      updateStudent(userId, payload),
    onSuccess: (updatedStudent) => {
      toast.success("Student ma'lumotlari yangilandi");
      queryClient.setQueryData<StudentDetail[]>(
        ["students"],
        (previous = []) => previous.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)),
      );
      queryClient.setQueryData<StudentDetail[]>(
        ["students", "unassigned-only"],
        (previous = []) => previous.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)),
      );
    },
    onError: (error) => toast.error(getErrorMessage(error, "Studentni yangilab bo'lmadi")),
  });

  const enrollStudentMutation = useMutation({
    mutationFn: enrollStudent,
    onSuccess: (createdEnrollment, payload) => {
      toast.success("Student guruhga biriktirildi");
      queryClient.setQueryData<StudentDetail[]>(
        ["students", "unassigned-only"],
        (previous = []) => previous.filter((student) => student.id !== payload.student_id),
      );
      queryClient.setQueryData<Enrollment[]>(
        ["group-enrollments", payload.group_id],
        (previous = []) => [createdEnrollment, ...previous],
      );
    },
    onError: (error) => toast.error(getErrorMessage(error, "Studentni guruhga biriktirib bo'lmadi")),
  });

  const bulkEnrollStudentsMutation = useMutation({
    mutationFn: bulkEnrollStudents,
    onSuccess: (createdEnrollments, payload) => {
      toast.success("Studentlar guruhga biriktirildi");
      queryClient.setQueryData<StudentDetail[]>(
        ["students", "unassigned-only"],
        (previous = []) => previous.filter((student) => !payload.student_ids.includes(student.id)),
      );
      queryClient.setQueryData<Enrollment[]>(
        ["group-enrollments", payload.group_id],
        (previous = []) => [...createdEnrollments, ...previous],
      );
    },
    onError: (error) => toast.error(getErrorMessage(error, "Studentlarni guruhga biriktirib bo'lmadi")),
  });

  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ enrollmentId, payload }: { enrollmentId: string; payload: Partial<EnrollmentPayload> }) =>
      updateEnrollment(enrollmentId, payload),
    onSuccess: (updatedEnrollment) => {
      toast.success("Student guruhdan chetlashtirildi");
      queryClient.setQueryData<Enrollment[]>(
        ["group-enrollments", updatedEnrollment.group_id],
        (previous = []) =>
          previous.map((enrollment) =>
            enrollment.id === updatedEnrollment.id ? updatedEnrollment : enrollment,
          ),
      );
      queryClient.invalidateQueries({ queryKey: ["students", "unassigned-only"], exact: true });
      queryClient.invalidateQueries({ queryKey: ["students"], exact: true, refetchType: "none" });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Studentni chetlashtirib bo'lmadi")),
  });

  return {
    students: studentsQuery.data ?? [],
    assignableStudents: assignableStudentsQuery.data ?? [],
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
