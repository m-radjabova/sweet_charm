import apiClient from "../apiClient/apiClient";
import type {
  BarberApplication,
  BarberApplicationApprovePayload,
  BarberApplicationConfig,
  BarberApplicationRejectPayload,
  BarberApplicationStatus,
} from "../types/types";

export async function getBarberApplicationConfig() {
  const { data } = await apiClient.get<BarberApplicationConfig>("/barber-applications/config");
  return data;
}

export async function getMyBarberApplication() {
  const { data } = await apiClient.get<BarberApplication | null>("/barber-applications/me");
  return data;
}

export async function submitMyBarberApplication(payload: {
  full_name: string;
  phone_number: string;
  location_text: string;
  passport_series: string;
  comment: string;
  payment_note: string;
  receipt: File;
}) {
  const formData = new FormData();
  formData.append("full_name", payload.full_name);
  formData.append("phone_number", payload.phone_number);
  formData.append("location_text", payload.location_text);
  formData.append("passport_series", payload.passport_series);
  formData.append("comment", payload.comment);
  formData.append("payment_note", payload.payment_note);
  formData.append("receipt", payload.receipt);

  const { data } = await apiClient.post<BarberApplication>("/barber-applications/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function listBarberApplications(status_value?: BarberApplicationStatus) {
  const { data } = await apiClient.get<BarberApplication[]>("/barber-applications", {
    params: status_value ? { status_value } : undefined,
  });
  return data;
}

export async function approveBarberApplication(applicationId: string, payload: BarberApplicationApprovePayload) {
  const { data } = await apiClient.post<BarberApplication>(`/barber-applications/${applicationId}/approve`, payload);
  return data;
}

export async function rejectBarberApplication(applicationId: string, payload: BarberApplicationRejectPayload) {
  const { data } = await apiClient.post<BarberApplication>(`/barber-applications/${applicationId}/reject`, payload);
  return data;
}
