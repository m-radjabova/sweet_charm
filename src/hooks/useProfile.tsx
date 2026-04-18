import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { updateCurrentUser } from "../api/users";
import apiClient from "../apiClient/apiClient";
import useContextPro from "./useContextPro";
import { invalidateGroupDependentQueries, invalidateStudentDependentQueries } from "./queryInvalidation";

type UpdateProfilePayload = {
  full_name?: string;
  email?: string;
  phone?: string | null;
  notes?: string | null;
};

type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

async function changeMyPassword(payload: ChangePasswordPayload) {
  const { data } = await apiClient.patch("/users/me/password", payload);
  return data;
}

export function useProfile() {
  const queryClient = useQueryClient();
  const { dispatch, refreshUser } = useContextPro();

  const updateProfileMutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: async (data) => {
      dispatch({ type: "UPDATE_USER", payload: data });
      toast.success("Profil yangilandi");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["teachers"] }),
        invalidateGroupDependentQueries(queryClient),
        invalidateStudentDependentQueries(queryClient, [data.id]),
      ]);
      await refreshUser();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Profilni yangilab bo'lmadi"));
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changeMyPassword,
    onSuccess: () => {
      toast.success("Parol muvaffaqiyatli yangilandi");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Parolni yangilab bo'lmadi"));
    },
  });

  return {
    updateProfile: (payload: UpdateProfilePayload) => updateProfileMutation.mutateAsync(payload),
    changePassword: (payload: ChangePasswordPayload) => changePasswordMutation.mutateAsync(payload),
    updatingProfile: updateProfileMutation.isPending,
    updatingPassword: changePasswordMutation.isPending,
  };
}
