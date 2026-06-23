import apiClient from "../apiClient/apiClient";
import type { LoginResponse, User } from "../types/types";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearStoredAuth } from "./authStorage";

export { clearStoredAuth };

const AUTH_USER_KEY = "sweet_charm_user";

const AUTH_ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
} as const;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  full_name: string;
  phone: string;
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function persistTokens(tokens: LoginResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);

  if (tokens.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }
}

export function getStoredUser() {
  const rawValue = localStorage.getItem(AUTH_USER_KEY);
  if (!rawValue) return null;

  try {
    return normalizeUser(JSON.parse(rawValue) as User);
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function persistStoredUser(user: User) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizeUser(user)));
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function normalizeUser(user: User): User {
  return {
    ...user,
    role: user.role ?? "user",
  };
}

export async function getMe() {
  const { data } = await apiClient.get<User>("/users/me");
  return normalizeUser(data);
}

export async function loginUser(payload: LoginPayload) {
  const { data } = await apiClient.post<LoginResponse>(AUTH_ROUTES.login, payload);
  return data;
}

export async function registerUser(payload: RegisterPayload) {
  const { data } = await apiClient.post<LoginResponse>(AUTH_ROUTES.register, payload);
  return data;
}

export async function logoutUser() {
  await apiClient.post("/auth/logout");
}

function formatErrorValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value ?? "");
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  const maybeError = error as {
    response?: { data?: { message?: unknown; detail?: unknown; error?: unknown } };
    message?: unknown;
  };

  return (
    formatErrorValue(maybeError.response?.data?.message) ||
    formatErrorValue(maybeError.response?.data?.detail) ||
    formatErrorValue(maybeError.response?.data?.error) ||
    formatErrorValue(maybeError.message) ||
    fallback
  );
}
