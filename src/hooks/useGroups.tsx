import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { createGroup, deleteGroup, listGroups, updateGroup, type GroupPayload } from "../api/groups";
import type { Group } from "../types/types";

export default function useGroups() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: listGroups,
  });

  const createMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: (createdGroup) => {
      toast.success("Guruh yaratildi");
      queryClient.setQueryData<Group[]>(["groups"], (previous = []) => [createdGroup, ...previous]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Guruh yaratib bo'lmadi")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ groupId, payload }: { groupId: string; payload: Partial<GroupPayload> }) =>
      updateGroup(groupId, payload),
    onSuccess: (updatedGroup) => {
      toast.success("Guruh yangilandi");
      queryClient.setQueryData<Group[]>(
        ["groups"],
        (previous = []) => previous.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)),
      );
    },
    onError: (error) => toast.error(getErrorMessage(error, "Guruhni yangilab bo'lmadi")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: (_, deletedGroupId) => {
      toast.success("Guruh o'chirildi");
      queryClient.setQueryData<Group[]>(
        ["groups"],
        (previous = []) => previous.filter((group) => group.id !== deletedGroupId),
      );
    },
    onError: (error) => toast.error(getErrorMessage(error, "Guruhni o'chirib bo'lmadi")),
  });

  const groups = useMemo(() => {
    const list = groupsQuery.data ?? [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;

    return list.filter((group) =>
      [group.name, group.course?.name, group.teacher?.full_name]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [groupsQuery.data, searchTerm]);

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
