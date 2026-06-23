import apiClient from "../apiClient/apiClient";
import type { FeaturedDessert } from "../types/types";

function normalizeFeaturedDesserts(payload: unknown): FeaturedDessert[] {
  if (Array.isArray(payload)) {
    return payload as FeaturedDessert[];
  }

  if (payload && typeof payload === "object") {
    const maybeObject = payload as {
      items?: unknown;
      data?: unknown;
      results?: unknown;
    };

    if (Array.isArray(maybeObject.items)) return maybeObject.items as FeaturedDessert[];
    if (Array.isArray(maybeObject.data)) return maybeObject.data as FeaturedDessert[];
    if (Array.isArray(maybeObject.results)) return maybeObject.results as FeaturedDessert[];
  }

  return [];
}

export async function getFeaturedDesserts(limit = 8) {
  const { data } = await apiClient.get("/desserts/featured", {
    params: { limit },
  });

  return normalizeFeaturedDesserts(data);
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
