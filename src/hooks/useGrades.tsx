import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { bulkUpsertGrades, createGrade, listGrades, updateGrade, type GradeBulkPayload, type GradePayload } from "../api/grades";
import { getErrorMessage } from "../api/auth";
import type { Grade } from "../types/types";

type GradesParams = {
  lessonId?: string;
  studentId?: string;
};

type GradesHookOptions = {
  successToast?: boolean;
};

export default function useGrades(params?: GradesParams, options?: GradesHookOptions) {
  const queryClient = useQueryClient();
  const shouldShowSuccessToast = options?.successToast ?? true;
  const gradesQueryKey = ["grades", params?.lessonId ?? "all-lessons", params?.studentId ?? "all-students"] as const;

  const gradesQuery = useQuery({
    queryKey: gradesQueryKey,
    queryFn: () => listGrades(params),
    enabled: Boolean(params?.lessonId || params?.studentId),
  });

  const mergeGrades = (previous: unknown, changedGrades: Grade[]) => {
    const list = Array.isArray(previous) ? (previous as Grade[]) : [];
    const next = new Map(list.map((grade) => [grade.id, grade]));
    changedGrades.forEach((grade) => {
      next.set(grade.id, grade);
    });
    return Array.from(next.values());
  };

  const createMutation = useMutation({
    mutationFn: createGrade,
    onSuccess: (createdGrade) => {
      if (shouldShowSuccessToast) {
        toast.success("Baho saqlandi");
      }
      queryClient.setQueryData(gradesQueryKey, (previous: unknown) => {
        const list = Array.isArray(previous) ? previous : [];
        return [createdGrade, ...list];
      });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Bahoni saqlab bo'lmadi")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ gradeId, payload }: { gradeId: string; payload: Partial<GradePayload> }) =>
      updateGrade(gradeId, payload),
    onSuccess: (updatedGrade) => {
      if (shouldShowSuccessToast) {
        toast.success("Baho yangilandi");
      }
      queryClient.setQueryData(gradesQueryKey, (previous: unknown) => {
        const list = Array.isArray(previous) ? previous : [];
        return list.map((grade) => (grade.id === updatedGrade.id ? updatedGrade : grade));
      });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Bahoni yangilab bo'lmadi")),
  });

  const bulkMutation = useMutation({
    mutationFn: (payload: GradeBulkPayload) => bulkUpsertGrades(payload),
    onSuccess: (changedGrades) => {
      if (shouldShowSuccessToast) {
        toast.success("Baholar saqlandi");
      }
      queryClient.setQueryData(gradesQueryKey, (previous: unknown) =>
        mergeGrades(previous, changedGrades),
      );
    },
    onError: (error) => toast.error(getErrorMessage(error, "Baholarni saqlab bo'lmadi")),
  });

  return {
    grades: gradesQuery.data ?? [],
    loading: gradesQuery.isLoading,
    isFetching: gradesQuery.isFetching,
    createGrade: (payload: GradePayload) => createMutation.mutateAsync(payload),
    bulkUpsertGrades: (payload: GradeBulkPayload) => bulkMutation.mutateAsync(payload),
    updateGrade: (gradeId: string, payload: Partial<GradePayload>) =>
      updateMutation.mutateAsync({ gradeId, payload }),
  };
}
