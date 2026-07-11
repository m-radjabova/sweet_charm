import { useEffect, useMemo, useState } from "react";
import useContextPro from "../../../hooks/useContextPro";
import type { FeaturedDessert } from "../../../types/types";

const FAVORITES_KEY = "sweet_charm_favorite_dessert_ids";
const FAVORITES_EVENT = "sweet-charm-favorites-updated";

function getFavoritesStorageKey(userId?: string | null) {
  return userId ? `${FAVORITES_KEY}:${userId}` : `${FAVORITES_KEY}:guest`;
}

function parseFavorites(rawValue: string | null) {
  try {
    const parsed = JSON.parse(rawValue ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is FeaturedDessert => Boolean(item && typeof item === "object" && "id" in item))
      .map((item) => ({
        ...item,
        id: String(item.id),
        name: String(item.name ?? "Sweet dessert"),
        slug: String(item.slug ?? item.id),
        price: String(item.price ?? "0"),
        description: typeof item.description === "string" ? item.description : null,
        image_url: typeof item.image_url === "string" ? item.image_url : null,
        image_urls: Array.isArray(item.image_urls) ? item.image_urls.map(String) : [],
        rating_avg: typeof item.rating_avg === "number" ? item.rating_avg : 0,
        reviews_count: typeof item.reviews_count === "number" ? item.reviews_count : 0,
        category_name: typeof item.category_name === "string" ? item.category_name : null,
      }));
  } catch {
    return [];
  }
}

function readFavorites(storageKey: string) {
  const scopedFavorites = parseFavorites(localStorage.getItem(storageKey));
  if (scopedFavorites.length > 0) return scopedFavorites;

  // Fallback for older builds that stored all favorites in one shared key.
  if (storageKey !== FAVORITES_KEY) {
    return parseFavorites(localStorage.getItem(FAVORITES_KEY));
  }

  return scopedFavorites;
}

export function useFavorites(desserts: FeaturedDessert[]) {
  const {
    state: { user },
  } = useContextPro();
  const currentStorageKey = getFavoritesStorageKey(user?.id);
  const [storageKey, setStorageKey] = useState(() => getFavoritesStorageKey(user?.id));
  const [favoriteDesserts, setFavoriteDesserts] = useState<FeaturedDessert[]>(() =>
    readFavorites(getFavoritesStorageKey(user?.id)),
  );

  useEffect(() => {
    setStorageKey((current) => (current === currentStorageKey ? current : currentStorageKey));
  }, [currentStorageKey]);

  useEffect(() => {
    setFavoriteDesserts(readFavorites(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (desserts.length === 0) return;

    setFavoriteDesserts((current) =>
      current.map((favorite) => desserts.find((dessert) => dessert.id === favorite.id) ?? favorite),
    );
  }, [desserts]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(favoriteDesserts));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }, [favoriteDesserts, storageKey]);

  useEffect(() => {
    const syncFavorites = () => {
      const nextStorageKey = getFavoritesStorageKey(user?.id);
      if (nextStorageKey !== storageKey) {
        setStorageKey(nextStorageKey);
        return;
      }

      const nextFavorites = readFavorites(nextStorageKey);
      setFavoriteDesserts((current) =>
        JSON.stringify(current) === JSON.stringify(nextFavorites) ? current : nextFavorites,
      );
    };

    window.addEventListener("storage", syncFavorites);
    window.addEventListener(FAVORITES_EVENT, syncFavorites);

    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener(FAVORITES_EVENT, syncFavorites);
    };
  }, [storageKey, user?.id]);

  const favoriteIds = useMemo(() => favoriteDesserts.map((dessert) => dessert.id), [favoriteDesserts]);

  function toggleFavorite(dessertId: string, dessertData?: FeaturedDessert) {
    setFavoriteDesserts((current) => {
      if (current.some((item) => item.id === dessertId)) {
        return current.filter((item) => item.id !== dessertId);
      }

      const dessert = dessertData ?? desserts.find((item) => item.id === dessertId);
      if (!dessert) return current;

      return [dessert, ...current];
    });
  }

  return { favoriteIds, favoriteDesserts, toggleFavorite };
}
