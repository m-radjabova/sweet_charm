import apiClient from "../apiClient/apiClient";
import type { User, UserRole, UserStatus } from "../types/types";

export type CreateUserPayload = {
  full_name: string;
  email: string;
  password: string;
  roles: UserRole[];
  status: UserStatus;
  phone?: string | null;
  phone_number?: string | null;
  notes?: string | null;
  specialization?: string | null;
  bio?: string | null;
  hired_at?: string | null;
  avatar?: string | null;
};

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">> & {
  password?: string;
};

export async function listUsers(role?: UserRole) {
  const { data } = await apiClient.get<User[]>("/users/", {
    params: role ? { role } : undefined,
  });
  return data.map((user) => ({
    ...user,
    roles: user.roles ?? (user.role ? [user.role] : []),
    role: user.role ?? user.roles?.[0],
  }));
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await apiClient.post<User>("/users/", payload);
  return data;
}

export async function updateUser(userId: string, payload: UpdateUserPayload) {
  const { data } = await apiClient.patch<User>(`/users/${userId}`, payload);
  return data;
}

export async function updateCurrentUser(payload: Pick<UpdateUserPayload, "full_name" | "email" | "phone">) {
  const { data } = await apiClient.patch<User>("/users/me", payload);
  return data;
}
