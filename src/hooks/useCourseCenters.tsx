import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createCourseCenter, listCourseCenters, type CourseCenterPayload } from "../api/courseCenters";
import { getErrorMessage } from "../api/auth";

export default function useCourseCenters(enabled = true) {
  const queryClient = useQueryClient();

  const courseCentersQuery = useQuery({
    queryKey: ["course-centers"],
    queryFn: listCourseCenters,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: createCourseCenter,
    onSuccess: async () => {
      toast.success("Course center yaratildi");
      await queryClient.invalidateQueries({ queryKey: ["course-centers"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Course center yaratib bo'lmadi"));
    },
  });

  return {
    courseCenters: courseCentersQuery.data ?? [],
    loading: courseCentersQuery.isLoading,
    isFetching: courseCentersQuery.isFetching,
    createCourseCenter: (payload: CourseCenterPayload) => createMutation.mutateAsync(payload),
    creatingCourseCenter: createMutation.isPending,
  };
}
