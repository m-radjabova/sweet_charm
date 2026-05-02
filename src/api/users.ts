import apiClient from "../apiClient/apiClient";
import type {
  BarberCreatePayload,
  UpdateBarberPayload,
  UpdateCurrentUserPayload,
  User,
  UserRole,
} from "../types/types";

export type CreateUserPayload = BarberCreatePayload;
export type UpdateUserPayload = UpdateBarberPayload;

export async function listUsers(role?: UserRole) {
  if (role === "barber") {
    const { data } = await apiClient.get<User[]>("/barbers");
    return data;
  }

  const me = await apiClient.get<User>("/users/me");
  return [me.data];
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await apiClient.post<User>("/barbers", payload);
  return data;
}

export async function updateUser(userId: string, payload: UpdateUserPayload) {
  const { data } = await apiClient.patch<User>(`/barbers/${userId}`, payload);
  return data;
}

export async function updateCurrentUser(payload: UpdateCurrentUserPayload) {
  const { data } = await apiClient.patch<User>("/users/me", payload);
  return data;
}

export async function uploadCurrentUserAvatar(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await apiClient.post<User>("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function deleteCurrentUserAvatar() {
  const { data } = await apiClient.delete<User>("/users/me/avatar");
  return data;
}

export async function listBarbers() {
  const { data } = await apiClient.get<User[]>("/barbers");
  return data;
}

export async function createBarber(payload: BarberCreatePayload) {
  const { data } = await apiClient.post<User>("/barbers", payload);
  return data;
}

export async function updateBarber(barberId: string, payload: UpdateBarberPayload) {
  const { data } = await apiClient.patch<User>(`/barbers/${barberId}`, payload);
  return data;
}

export async function deleteBarber(barberId: string) {
  await apiClient.delete(`/barbers/${barberId}`);
}
