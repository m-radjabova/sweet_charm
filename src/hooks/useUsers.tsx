import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import {
  createUser,
  listUsers,
  updateUser,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../api/users";
import { useDebounce } from "./useDebounce";
import type { UserRole } from "../types/types";

export default function useUsers(role?: UserRole) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  const usersQuery = useQuery({
    queryKey: ["users", role ?? "all"],
    queryFn: () => listUsers(role),
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      toast.success("User created successfully");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not create user"));
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      updateUser(userId, payload),
    onSuccess: async () => {
      toast.success("User details updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update user"));
    },
  });

  const users = useMemo(() => {
    const list = usersQuery.data ?? [];
    const term = debouncedSearch.trim().toLowerCase();

    if (!term) return list;

    return list.filter((user) =>
      [user.full_name, user.email]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [debouncedSearch, usersQuery.data]);

  return {
    users,
    loading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    searchTerm,
    setSearchTerm,
    createUser: (payload: CreateUserPayload) => createUserMutation.mutateAsync(payload),
    updateUser: (userId: string, payload: UpdateUserPayload) =>
      updateUserMutation.mutateAsync({ userId, payload }),
    creatingUser: createUserMutation.isPending,
  };
}
