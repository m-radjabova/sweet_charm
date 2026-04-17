import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { listUsers, updateUser, type UpdateUserPayload } from "../api/users";
import type { UserRole } from "../types/types";

export default function useUsers(role?: UserRole) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const usersQuery = useQuery({
    queryKey: ["users", role ?? "all"],
    queryFn: () => listUsers(role),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      updateUser(userId, payload),
    onSuccess: async () => {
      toast.success("Foydalanuvchi ma'lumotlari yangilandi");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Foydalanuvchini yangilab bo'lmadi"));
    },
  });

  const users = useMemo(() => {
    const list = usersQuery.data ?? [];
    const term = searchTerm.trim().toLowerCase();

    if (!term) return list;

    return list.filter((user) =>
      [user.full_name, user.email]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [searchTerm, usersQuery.data]);

  return {
    users,
    loading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    searchTerm,
    setSearchTerm,
    updateUser: (userId: string, payload: UpdateUserPayload) =>
      updateUserMutation.mutateAsync({ userId, payload }),
  };
}
