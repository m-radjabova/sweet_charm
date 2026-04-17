import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { createLesson, listLessons, updateLesson, type LessonPayload } from "../api/lessons";

type LessonsParams = {
  groupId?: string;
  year?: number;
  month?: number;
};

export default function useLessons(params?: LessonsParams) {
  const queryClient = useQueryClient();
  const lessonsQueryKey = ["lessons", params?.groupId ?? "all", params?.year ?? "all-years", params?.month ?? "all-months"] as const;

  const lessonsQuery = useQuery({
    queryKey: lessonsQueryKey,
    queryFn: () => listLessons(params),
    enabled: Boolean(params?.groupId),
  });

  const createMutation = useMutation({
    mutationFn: createLesson,
    onSuccess: async (createdLesson) => {
      toast.success("Dars qo'shildi");
      queryClient.setQueryData([ "lessons", params?.groupId ?? "all", params?.year ?? "all-years", params?.month ?? "all-months" ], (previous: unknown) => {
        const list = Array.isArray(previous) ? previous : [];
        return [createdLesson, ...list];
      });
      await queryClient.invalidateQueries({ queryKey: lessonsQueryKey, exact: true, refetchType: "none" });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Dars qo'shib bo'lmadi")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: Partial<LessonPayload> }) =>
      updateLesson(lessonId, payload),
    onSuccess: async (updatedLesson) => {
      toast.success("Dars yangilandi");
      queryClient.setQueryData(lessonsQueryKey, (previous: unknown) => {
        const list = Array.isArray(previous) ? previous : [];
        return list.map((lesson) => (lesson.id === updatedLesson.id ? updatedLesson : lesson));
      });
      await queryClient.invalidateQueries({ queryKey: ["lessons"], refetchType: "none" });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Darsni yangilab bo'lmadi")),
  });

  return {
    lessons: lessonsQuery.data ?? [],
    loading: lessonsQuery.isLoading,
    isFetching: lessonsQuery.isFetching,
    createLesson: (payload: LessonPayload) => createMutation.mutateAsync(payload),
    updateLesson: (lessonId: string, payload: Partial<LessonPayload>) =>
      updateMutation.mutateAsync({ lessonId, payload }),
  };
}
