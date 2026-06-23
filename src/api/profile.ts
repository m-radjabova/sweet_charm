import apiClient from "../apiClient/apiClient";
import type { User } from "../types/types";

export interface UpdateProfilePayload {
  full_name?: string;
  email?: string;
  phone?: string | null;
  birthday?: string | null;
  bio?: string | null;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export async function getMyProfile() {
  const { data } = await apiClient.get<User>("/users/me");
  return data;
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  const { data } = await apiClient.patch<User>("/users/me", payload);
  return data;
}

export async function uploadMyAvatar(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post<User>("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export async function deleteMyAvatar() {
  const { data } = await apiClient.delete<User>("/users/me/avatar");
  return data;
}

export async function changeMyPassword(payload: ChangePasswordPayload) {
  const { data } = await apiClient.patch<User>("/users/me/password", payload);
  return data;
}
