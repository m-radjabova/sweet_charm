import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { createLesson, listLessons, updateLesson, type LessonPayload } from "../api/lessons";
import type { Lesson } from "../types/types";

type LessonsParams = {
  groupId?: string;
  year?: number;
  month?: number;
};

type LessonsQueryKey = readonly ["lessons", string, number | "all-years", number | "all-months"];

function parseLessonDateParts(lessonDate: string) {
  const [yearRaw = "", monthRaw = ""] = lessonDate.split("-");
  return {
    year: Number.parseInt(yearRaw, 10),
    month: Number.parseInt(monthRaw, 10),
  };
}

function lessonMatchesQuery(lesson: Lesson, queryKey: LessonsQueryKey) {
  const [, groupId, year, month] = queryKey;
  if (lesson.group_id !== groupId) return false;

  const dateParts = parseLessonDateParts(lesson.lesson_date);
  if (year !== "all-years" && dateParts.year !== year) return false;
  if (month !== "all-months" && dateParts.month !== month) return false;

  return true;
}

function upsertLesson(list: Lesson[], lesson: Lesson) {
  const existingIndex = list.findIndex((item) => item.id === lesson.id);
  if (existingIndex === -1) {
    return [lesson, ...list];
  }

  return list.map((item) => (item.id === lesson.id ? lesson : item));
}

export default function useLessons(params?: LessonsParams) {
  const queryClient = useQueryClient();
  const lessonsQueryKey = ["lessons", params?.groupId ?? "all", params?.year ?? "all-years", params?.month ?? "all-months"] as const;

  const syncLessonCaches = (lesson: Lesson) => {
    const lessonQueries = queryClient.getQueriesData<Lesson[]>({ queryKey: ["lessons"] });

    lessonQueries.forEach(([queryKey, previous]) => {
      if (!Array.isArray(queryKey) || queryKey.length !== 4 || queryKey[0] !== "lessons") {
        return;
      }

      const typedQueryKey = queryKey as unknown as LessonsQueryKey;
      const list = Array.isArray(previous) ? previous : [];

      queryClient.setQueryData<Lesson[]>(typedQueryKey, () => {
        if (lessonMatchesQuery(lesson, typedQueryKey)) {
          return upsertLesson(list, lesson);
        }

        return list.filter((item) => item.id !== lesson.id);
      });
    });
  };

  const lessonsQuery = useQuery({
    queryKey: lessonsQueryKey,
    queryFn: () => listLessons(params),
    enabled: Boolean(params?.groupId),
  });

  const createMutation = useMutation({
    mutationFn: createLesson,
    onSuccess: async (createdLesson) => {
      toast.success("Dars qo'shildi");
      syncLessonCaches(createdLesson);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Dars qo'shib bo'lmadi")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: Partial<LessonPayload> }) =>
      updateLesson(lessonId, payload),
    onSuccess: async (updatedLesson) => {
      toast.success("Dars yangilandi");
      syncLessonCaches(updatedLesson);
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
