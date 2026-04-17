import apiClient from "../apiClient/apiClient";
import type {
  TelegramLinkStatus,
  TelegramSendCredentialsResponse,
} from "../types/types";

export async function getStudentTelegramLink(userId: string) {
  const { data } = await apiClient.get<TelegramLinkStatus>(`/telegram/students/${userId}/link`);
  return data;
}

export async function createStudentTelegramLink(userId: string) {
  const { data } = await apiClient.post<TelegramLinkStatus>(`/telegram/students/${userId}/link`);
  return data;
}

export async function sendStudentCredentialsToTelegram(userId: string, temporaryPassword?: string) {
  const { data } = await apiClient.post<TelegramSendCredentialsResponse>(
    `/telegram/students/${userId}/send-credentials`,
    { temporary_password: temporaryPassword || null },
  );
  return data;
}
