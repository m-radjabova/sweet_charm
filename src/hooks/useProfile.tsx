import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getErrorMessage } from "../api/auth";
import { deleteCurrentUserAvatar, updateCurrentUser, uploadCurrentUserAvatar } from "../api/users";
import apiClient from "../apiClient/apiClient";
import useContextPro from "./useContextPro";

type UpdateProfilePayload = {
  full_name?: string;
  email?: string;
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
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["users"] }), queryClient.invalidateQueries({ queryKey: ["barbers"] })]);
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

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadCurrentUserAvatar,
    onSuccess: async (data) => {
      dispatch({ type: "UPDATE_USER", payload: data });
      toast.success("Avatar yangilandi");
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["users"] }), queryClient.invalidateQueries({ queryKey: ["barbers"] })]);
      await refreshUser();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Avatarni yuklab bo'lmadi"));
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: deleteCurrentUserAvatar,
    onSuccess: async (data) => {
      dispatch({ type: "UPDATE_USER", payload: data });
      toast.success("Avatar o'chirildi");
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["users"] }), queryClient.invalidateQueries({ queryKey: ["barbers"] })]);
      await refreshUser();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Avatarni o'chirib bo'lmadi"));
    },
  });

  return {
    updateProfile: (payload: UpdateProfilePayload) => updateProfileMutation.mutateAsync(payload),
    changePassword: (payload: ChangePasswordPayload) => changePasswordMutation.mutateAsync(payload),
    uploadAvatar: (file: File) => uploadAvatarMutation.mutateAsync(file),
    deleteAvatar: () => deleteAvatarMutation.mutateAsync(),
    updatingProfile: updateProfileMutation.isPending,
    updatingPassword: changePasswordMutation.isPending,
    uploadingAvatar: uploadAvatarMutation.isPending,
    deletingAvatar: deleteAvatarMutation.isPending,
  };
}
