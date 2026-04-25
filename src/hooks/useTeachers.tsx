import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import {
  createTeacher,
  listTeachers,
  updateTeacherProfile,
  type TeacherCreatePayload,
  type TeacherProfilePayload,
} from "../api/teachers";
import { invalidateGroupDependentQueries } from "./queryInvalidation";
import useContextPro from "./useContextPro";
import { isSuperAdmin } from "../utils/roles";

export default function useTeachers(enabled = true) {
  const queryClient = useQueryClient();
  const {
    state: { user },
  } = useContextPro();
  const [searchTerm, setSearchTerm] = useState("");
  const scopeKey = user?.course_center_id ?? user?.id ?? "guest";

  const teachersQuery = useQuery({
    queryKey: ["teachers", scopeKey],
    queryFn: listTeachers,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: async () => {
      toast.success("O'qituvchi yaratildi");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["teachers"] }),
        invalidateGroupDependentQueries(queryClient),
      ]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "O'qituvchini yaratib bo'lmadi")),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: TeacherProfilePayload }) =>
      updateTeacherProfile(userId, payload),
    onSuccess: async () => {
      toast.success("O'qituvchi profili yangilandi");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["teachers"] }),
        invalidateGroupDependentQueries(queryClient),
      ]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "O'qituvchi profilini yangilab bo'lmadi")),
  });

  const teachers = useMemo(() => {
    const list = (teachersQuery.data ?? []).filter((teacher) => {
      if (!user?.course_center_id || isSuperAdmin(user)) return true;
      return teacher.course_center_id === user.course_center_id;
    });
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;

    return list.filter((teacher) =>
      [teacher.full_name, teacher.email, teacher.phone, teacher.teacher_profile?.specialization]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [searchTerm, teachersQuery.data, user?.course_center_id, user?.role, user?.roles]);

  return {
    teachers,
    loading: teachersQuery.isLoading,
    isFetching: teachersQuery.isFetching,
    searchTerm,
    setSearchTerm,
    createTeacher: (payload: TeacherCreatePayload) => createMutation.mutateAsync(payload),
    updateTeacherProfile: (userId: string, payload: TeacherProfilePayload) =>
      updateProfileMutation.mutateAsync({ userId, payload }),
    creatingTeacher: createMutation.isPending,
    updatingTeacherProfile: updateProfileMutation.isPending,
  };
}
