import apiClient from "../apiClient/apiClient";
import type { LoginResponse, User } from "../types/types";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearStoredAuth } from "./authStorage";

export { clearStoredAuth };

const AUTH_ROUTES = {
  login: "/auth/login",
  register: "/auth/register",
  google: "/auth/google",
} as const;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  full_name: string;
  phone: string;
}

export interface GoogleLoginPayload {
  id_token: string;
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
  return null;
}

export function persistStoredUser(_user: User) {
  // User data intentionally stays in memory only; tokens are enough to fetch /users/me.
}

export function clearStoredUser() {
  localStorage.removeItem("sweet_charm_user");
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

export async function loginWithGoogle(payload: GoogleLoginPayload) {
  const { data } = await apiClient.post<LoginResponse>(AUTH_ROUTES.google, payload);
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
