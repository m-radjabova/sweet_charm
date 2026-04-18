import type { QueryClient } from "@tanstack/react-query";
import type { Enrollment } from "../types/types";

type EnrollmentListUpdater = (previous: Enrollment[]) => Enrollment[];

export function syncGroupEnrollmentQueries(
  queryClient: QueryClient,
  groupId: string,
  updater: EnrollmentListUpdater,
) {
  const enrollmentQueries = queryClient.getQueriesData<Enrollment[]>({
    queryKey: ["group-enrollments", groupId],
  });

  enrollmentQueries.forEach(([queryKey, previous]) => {
    queryClient.setQueryData<Enrollment[]>(
      queryKey,
      updater(Array.isArray(previous) ? previous : []),
    );
  });
}

export async function invalidateGroupDependentQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["groups"] }),
    queryClient.invalidateQueries({ queryKey: ["group-enrollments"] }),
    queryClient.invalidateQueries({ queryKey: ["lessons"] }),
    queryClient.invalidateQueries({ queryKey: ["student-overview"] }),
  ]);
}

export async function invalidateStudentDependentQueries(
  queryClient: QueryClient,
  studentIds?: string[],
) {
  const overviewIds = Array.from(
    new Set((studentIds ?? []).filter(Boolean)),
  );

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["students"] }),
    queryClient.invalidateQueries({ queryKey: ["group-enrollments"] }),
    queryClient.invalidateQueries({ queryKey: ["attendance"] }),
    queryClient.invalidateQueries({ queryKey: ["grades"] }),
    queryClient.invalidateQueries({ queryKey: ["payments"] }),
    ...overviewIds.map((studentId) =>
      queryClient.invalidateQueries({
        queryKey: ["student-overview", studentId],
        exact: true,
      }),
    ),
  ]);
}
