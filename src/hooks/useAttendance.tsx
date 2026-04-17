import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createAttendance, listAttendance, updateAttendance, type AttendancePayload } from "../api/attendance";
import { getErrorMessage } from "../api/auth";

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

  return {
    attendance: attendanceQuery.data ?? [],
    loading: attendanceQuery.isLoading,
    isFetching: attendanceQuery.isFetching,
    createAttendance: (payload: AttendancePayload) => createMutation.mutateAsync(payload),
    updateAttendance: (attendanceId: string, payload: Partial<AttendancePayload>) =>
      updateMutation.mutateAsync({ attendanceId, payload }),
  };
}
