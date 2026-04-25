import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { createGroup, deleteGroup, listGroups, updateGroup, type GroupPayload } from "../api/groups";
import { invalidateGroupDependentQueries } from "./queryInvalidation";
import type { Group } from "../types/types";
import useContextPro from "./useContextPro";

export default function useGroups() {
  const queryClient = useQueryClient();
  const {
    state: { user },
  } = useContextPro();
  const [searchTerm, setSearchTerm] = useState("");
  const scopeKey = user?.course_center_id ?? user?.id ?? "guest";

  const groupsQuery = useQuery({
    queryKey: ["groups", scopeKey],
    queryFn: listGroups,
  });

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: async (createdGroup) => {
      toast.success("Guruh yaratildi");
      queryClient.setQueryData<Group[]>(["groups", scopeKey], (previous = []) => [createdGroup, ...previous]);
      await invalidateGroupDependentQueries(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Guruh yaratib bo'lmadi")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ groupId, payload }: { groupId: string; payload: Partial<GroupPayload> }) =>
      updateGroup(groupId, payload),
    onSuccess: async (updatedGroup) => {
      toast.success("Guruh yangilandi");
      queryClient.setQueryData<Group[]>(
        ["groups", scopeKey],
        (previous = []) => previous.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)),
      );
      await invalidateGroupDependentQueries(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Guruhni yangilab bo'lmadi")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: async (_, deletedGroupId) => {
      toast.success("Guruh o'chirildi");
      queryClient.setQueryData<Group[]>(
        ["groups", scopeKey],
        (previous = []) => previous.filter((group) => group.id !== deletedGroupId),
      );
      await invalidateGroupDependentQueries(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Guruhni o'chirib bo'lmadi")),
  });

  const groups = useMemo(() => {
    const list = (groupsQuery.data ?? []).filter((group) => {
      if (!user?.course_center_id || user.role === "super_admin") return true;
      return group.course_center_id === user.course_center_id;
    });
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;

    return list.filter((group) =>
      [group.name, group.course?.name, group.teacher?.full_name]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [groupsQuery.data, searchTerm, user?.course_center_id, user?.role]);

  return {
    groups,
    loading: groupsQuery.isLoading,
    isFetching: groupsQuery.isFetching,
    searchTerm,
    setSearchTerm,
    createGroup: (payload: GroupPayload) => createMutation.mutateAsync(payload),
    updateGroup: (groupId: string, payload: Partial<GroupPayload>) =>
      updateMutation.mutateAsync({ groupId, payload }),
    deleteGroup: (groupId: string) => deleteMutation.mutateAsync(groupId),
  };
}
