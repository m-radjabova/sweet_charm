import apiClient from "../apiClient/apiClient";
import type { DessertReview, FeaturedReview } from "../types/types";

function normalizeFeaturedReviews(payload: unknown): FeaturedReview[] {
  if (Array.isArray(payload)) {
    return payload as FeaturedReview[];
  }

  if (payload && typeof payload === "object") {
    const maybeObject = payload as {
      items?: unknown;
      data?: unknown;
      results?: unknown;
    };

    if (Array.isArray(maybeObject.items)) return maybeObject.items as FeaturedReview[];
    if (Array.isArray(maybeObject.data)) return maybeObject.data as FeaturedReview[];
    if (Array.isArray(maybeObject.results)) return maybeObject.results as FeaturedReview[];
  }

  return [];
}

export async function getFeaturedReviews(limit = 6) {
  const { data } = await apiClient.get("/reviews/featured", {
    params: { limit },
  });

  return normalizeFeaturedReviews(data);
}

function normalizeDessertReviews(payload: unknown): DessertReview[] {
  if (Array.isArray(payload)) {
    return payload as DessertReview[];
  }
  return [];
}

export interface CreateDessertReviewPayload {
  rating: number;
  text: string;
}

export async function getDessertReviews(dessertSlug: string) {
  const { data } = await apiClient.get(`/reviews/desserts/${dessertSlug}`);
  return normalizeDessertReviews(data);
}

export async function createDessertReview(dessertSlug: string, payload: CreateDessertReviewPayload) {
  const { data } = await apiClient.post<DessertReview>(`/reviews/desserts/${dessertSlug}`, payload);
  return data;
}
