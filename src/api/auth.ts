import apiClient from "../apiClient/apiClient";
import type { CustomerAuthPayload, CustomerLoginPayload, LoginPayload, LoginResponse, User } from "../types/types";
export { clearStoredAuth, getStoredAccessToken, getStoredRefreshToken, persistTokens } from "./authStorage";

export async function loginUser(payload: LoginPayload) {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function loginCustomer(payload: CustomerAuthPayload) {
  const { data } = await apiClient.post<LoginResponse>("/auth/customer", payload);
  return data;
}

export async function loginCustomerByPhone(payload: CustomerLoginPayload) {
  const { data } = await apiClient.post<LoginResponse>("/auth/customer/login", payload);
  return data;
}

export async function registerCustomer(payload: CustomerAuthPayload) {
  const { data } = await apiClient.post<LoginResponse>("/auth/customer/register", payload);
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
    specialty: user.specialty ?? null,
    bio: user.bio ?? null,
    location_text: user.location_text ?? null,
    location_lat: user.location_lat ?? null,
    location_lng: user.location_lng ?? null,
    work_start_time: user.work_start_time ?? null,
    work_end_time: user.work_end_time ?? null,
    services: user.services ?? [],
    telegram_connected: user.telegram_connected ?? false,
    telegram_notifications_enabled: user.telegram_notifications_enabled ?? false,
    telegram_marketing_enabled: user.telegram_marketing_enabled ?? false,
    telegram_connected_at: user.telegram_connected_at ?? null,
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
