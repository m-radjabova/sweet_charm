import apiClient from "../apiClient/apiClient";
import type { LoginPayload, LoginResponse, User } from "../types/types";
export { clearStoredAuth, getStoredAccessToken, getStoredRefreshToken, persistTokens } from "./authStorage";

export async function loginUser(payload: LoginPayload) {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get<User>("/users/me");
  return data;
}

export async function logoutUser() {
  await apiClient.post("/auth/logout");
}

export function normalizeUser(user: User): User {
  return {
    ...user,
    role: user.role ?? "user",
    avatar: user.avatar ?? null,
  };
}

export function getErrorMessage(error: unknown, fallback = "Xatolik yuz berdi") {
  const maybeError = error as {
    response?: { data?: { detail?: string; message?: string } };
    message?: string;
  };

  return (
    maybeError?.response?.data?.detail ||
    maybeError?.response?.data?.message ||
    maybeError?.message ||
    fallback
  );
}
