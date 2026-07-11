import apiClient from "../apiClient/apiClient";
import type { FeaturedDessert } from "../types/types";

function isFeaturedDessert(value: unknown): value is FeaturedDessert {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<FeaturedDessert>;
  return Boolean(item.id && item.slug && item.name && item.price !== undefined && item.price !== null);
}

function normalizeFeaturedDesserts(payload: unknown): FeaturedDessert[] {
  if (Array.isArray(payload)) {
    return payload.filter(isFeaturedDessert);
  }

  if (payload && typeof payload === "object") {
    const maybeObject = payload as {
      items?: unknown;
      data?: unknown;
      results?: unknown;
    };

    if (Array.isArray(maybeObject.items)) return maybeObject.items.filter(isFeaturedDessert);
    if (Array.isArray(maybeObject.data)) return maybeObject.data.filter(isFeaturedDessert);
    if (Array.isArray(maybeObject.results)) return maybeObject.results.filter(isFeaturedDessert);
  }

  return [];
}

export async function getBestSellers(limit = 6) {
  const { data } = await apiClient.get("/desserts/best-sellers", {
    params: { limit },
  });

  return normalizeFeaturedDesserts(data);
}

export async function getFeaturedDesserts(limit = 8) {
  const { data } = await apiClient.get("/desserts/featured", {
    params: { limit },
  });

  return normalizeFeaturedDesserts(data);
}

export async function getChefChoice() {
  const { data } = await apiClient.get<FeaturedDessert | null>("/desserts/chef-choice");
  return data ?? null;
}

export async function getAllDesserts(params?: {
  category?: string;
  min_price?: number;
  max_price?: number;
  dietary?: string;
  min_rating?: number;
  search?: string;
}) {
  const { data } = await apiClient.get("/desserts", { params });
  return normalizeFeaturedDesserts(data);
}

export async function getDessertCategories() {
  const { data } = await apiClient.get("/desserts/categories");
  return Array.isArray(data) ? (data as string[]) : [];
}
