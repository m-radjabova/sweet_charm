import { isAxiosError } from "axios";
import apiClient from "../apiClient/apiClient";
import type { TokenResponse, User } from "../types/types";
import { getPrimaryRole } from "../utils/roles";

export const ACCESS_TOKEN_KEY = "cc-access-token";
export const REFRESH_TOKEN_KEY = "cc-refresh-token";

export type LoginPayload = {
  email: string;
  password: string;
};

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function persistTokens(tokens: TokenResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function loginUser(payload: LoginPayload) {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", payload);
  return data;
}

export async function refreshAccessToken(refreshToken: string) {
  const { data } = await apiClient.post<TokenResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return data;
}

export async function logoutUser() {
  await apiClient.post("/auth/logout");
}

export async function getMe() {
  const { data } = await apiClient.get<User>("/users/me");
  return normalizeUser(data);
}

export function normalizeUser(user: User): User {
  const normalizedRoles = user.roles?.length ? user.roles : user.role ? [user.role] : [];
  const effectiveRole = getPrimaryRole({ ...user, roles: normalizedRoles });

  return {
    ...user,
    roles: normalizedRoles,
    role: effectiveRole,
  };
}

export function getErrorMessage(error: unknown, fallback = "So'rov bajarilmadi") {
  if (isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
