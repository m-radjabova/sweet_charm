import apiClient from "../apiClient/apiClient";
import type { GalleryImage } from "../types/types";

function normalizeGalleryImages(payload: unknown): GalleryImage[] {
  if (Array.isArray(payload)) {
    return payload as GalleryImage[];
  }

  if (payload && typeof payload === "object") {
    const maybeObject = payload as {
      items?: unknown;
      data?: unknown;
      results?: unknown;
    };

    if (Array.isArray(maybeObject.items)) return maybeObject.items as GalleryImage[];
    if (Array.isArray(maybeObject.data)) return maybeObject.data as GalleryImage[];
    if (Array.isArray(maybeObject.results)) return maybeObject.results as GalleryImage[];
  }

  return [];
}

export async function getGalleryImages(limit = 7) {
  const { data } = await apiClient.get("/gallery-images/active", {
    params: { limit },
  });

  return normalizeGalleryImages(data);
}
