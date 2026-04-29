import apiClient from "../apiClient/apiClient";
import type {
  TelegramLinkInfo,
  TelegramPromotionPayload,
  TelegramPromotionResult,
} from "../types/types";

export async function getMyTelegramLink() {
  const { data } = await apiClient.get<TelegramLinkInfo>("/telegram/me");
  return data;
}

export async function refreshMyTelegramLink() {
  const { data } = await apiClient.post<TelegramLinkInfo>("/telegram/me/link");
  return data;
}

export async function sendTelegramPromotion(payload: TelegramPromotionPayload) {
  const { data } = await apiClient.post<TelegramPromotionResult>("/telegram/promotions", payload);
  return data;
}
