import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { bulkUpsertAttendance, createAttendance, listAttendance, updateAttendance, type AttendanceBulkPayload, type AttendancePayload } from "../api/attendance";
import { getErrorMessage } from "../api/auth";
import type { Attendance } from "../types/types";

type AttendanceHookOptions = {
  successToast?: boolean;
};

export default function useAttendance(lessonId?: string, options?: AttendanceHookOptions) {
  const queryClient = useQueryClient();
  const shouldShowSuccessToast = options?.successToast ?? true;
  const attendanceQueryKey = ["attendance", lessonId ?? "none"] as const;

  const attendanceQuery = useQuery({
    queryKey: attendanceQueryKey,
    queryFn: () => listAttendance(lessonId as string),
    enabled: Boolean(lessonId),
  });

  const mergeAttendances = (previous: unknown, changedAttendances: Attendance[]) => {
    const list = Array.isArray(previous) ? (previous as Attendance[]) : [];
    const next = new Map(list.map((attendance) => [attendance.id, attendance]));
    changedAttendances.forEach((attendance) => {
      next.set(attendance.id, attendance);
    });
    return Array.from(next.values());
  };

  const createMutation = useMutation({
    mutationFn: createAttendance,
    onSuccess: (createdAttendance) => {
      if (shouldShowSuccessToast) {
        toast.success("Davomat saqlandi");
      }
      queryClient.setQueryData(attendanceQueryKey, (previous: unknown) => {
        const list = Array.isArray(previous) ? previous : [];
        return [createdAttendance, ...list];
      });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Davomatni saqlab bo'lmadi")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ attendanceId, payload }: { attendanceId: string; payload: Partial<AttendancePayload> }) =>
      updateAttendance(attendanceId, payload),
    onSuccess: (updatedAttendance) => {
      if (shouldShowSuccessToast) {
        toast.success("Davomat yangilandi");
      }
      queryClient.setQueryData(attendanceQueryKey, (previous: unknown) => {
        const list = Array.isArray(previous) ? previous : [];
        return list.map((attendance) => (attendance.id === updatedAttendance.id ? updatedAttendance : attendance));
      });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Davomatni yangilab bo'lmadi")),
  });

  const bulkMutation = useMutation({
    mutationFn: (payload: AttendanceBulkPayload) => bulkUpsertAttendance(payload),
    onSuccess: (changedAttendances) => {
      if (shouldShowSuccessToast) {
        toast.success("Davomatlar saqlandi");
      }
      queryClient.setQueryData(attendanceQueryKey, (previous: unknown) =>
        mergeAttendances(previous, changedAttendances),
      );
    },
    onError: (error) => toast.error(getErrorMessage(error, "Davomatlarni saqlab bo'lmadi")),
  });

  return {
    attendance: attendanceQuery.data ?? [],
    loading: attendanceQuery.isLoading,
    isFetching: attendanceQuery.isFetching,
    createAttendance: (payload: AttendancePayload) => createMutation.mutateAsync(payload),
    bulkUpsertAttendance: (payload: AttendanceBulkPayload) => bulkMutation.mutateAsync(payload),
    updateAttendance: (attendanceId: string, payload: Partial<AttendancePayload>) =>
      updateMutation.mutateAsync({ attendanceId, payload }),
  };
}
