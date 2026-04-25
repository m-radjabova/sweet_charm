import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { createCourse, deleteCourse, listCourses, updateCourse, type CoursePayload } from "../api/courses";
import { invalidateGroupDependentQueries } from "./queryInvalidation";
import type { Course } from "../types/types";
import useContextPro from "./useContextPro";

export default function useCourses() {
  const queryClient = useQueryClient();
  const {
    state: { user },
  } = useContextPro();
  const [searchTerm, setSearchTerm] = useState("");
  const scopeKey = user?.course_center_id ?? user?.id ?? "guest";

  const coursesQuery = useQuery({
    queryKey: ["courses", scopeKey],
    queryFn: listCourses,
  });

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: async (createdCourse) => {
      toast.success("Kurs yaratildi");
      queryClient.setQueryData<Course[]>(["courses", scopeKey], (previous = []) => [createdCourse, ...previous]);
      await invalidateGroupDependentQueries(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Kurs yaratib bo'lmadi")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: Partial<CoursePayload> }) =>
      updateCourse(courseId, payload),
    onSuccess: async (updatedCourse) => {
      toast.success("Kurs yangilandi");
      queryClient.setQueryData<Course[]>(
        ["courses", scopeKey],
        (previous = []) => previous.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)),
      );
      await invalidateGroupDependentQueries(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Kursni yangilab bo'lmadi")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: async (_, deletedCourseId) => {
      toast.success("Kurs o'chirildi");
      queryClient.setQueryData<Course[]>(
        ["courses", scopeKey],
        (previous = []) => previous.filter((course) => course.id !== deletedCourseId),
      );
      await invalidateGroupDependentQueries(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Kursni o'chirib bo'lmadi")),
  });

  const courses = useMemo(() => {
    const list = coursesQuery.data ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter((course) =>
      [course.name, course.description].filter(Boolean).some((value) => value?.toLowerCase().includes(term)),
    );
  }, [coursesQuery.data, searchTerm]);

  return {
    courses,
    loading: coursesQuery.isLoading,
    isFetching: coursesQuery.isFetching,
    searchTerm,
    setSearchTerm,
    createCourse: (payload: CoursePayload) => createMutation.mutateAsync(payload),
    updateCourse: (courseId: string, payload: Partial<CoursePayload>) =>
      updateMutation.mutateAsync({ courseId, payload }),
    deleteCourse: (courseId: string) => deleteMutation.mutateAsync(courseId),
  };
}
