import apiClient from "../apiClient/apiClient";
import type { User, UserRole } from "../types/types";

export interface CreateUserPayload {
  full_name: string;
  email?: string | null;
  password?: string;
  role: UserRole;
  avatar?: string | null;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export async function listUsers(role?: UserRole) {
  const { data } = await apiClient.get<User[]>("/users", {
    params: role ? { role } : undefined,
  });

  return data;
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await apiClient.post<User>("/users", payload);
  return data;
}

export async function updateUser(userId: string, payload: UpdateUserPayload) {
  const { data } = await apiClient.patch<User>(`/users/${userId}`, payload);
  return data;
}
