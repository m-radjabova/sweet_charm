import { useEffect, useMemo, useState } from "react";
import type { CartItem, FeaturedDessert } from "../types/types";

const CART_KEY = "sweet_charm_cart_items";
const CART_EVENT = "sweet-charm-cart-updated";

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is CartItem => Boolean(item && typeof item === "object" && "id" in item))
      .map((item) => ({
        id: String(item.id),
        slug: String(item.slug ?? item.id),
        name: String(item.name ?? "Sweet dessert"),
        price: String(item.price ?? "0"),
        image_url: typeof item.image_url === "string" ? item.image_url : null,
        category_name: typeof item.category_name === "string" ? item.category_name : null,
        quantity: Math.max(1, Number(item.quantity ?? 1)),
      }));
  } catch {
    return [];
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readCart());

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT));
  }, [items]);

  useEffect(() => {
    const syncCart = () => {
      const next = readCart();
      setItems((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
    };

    window.addEventListener("storage", syncCart);
    window.addEventListener(CART_EVENT, syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener(CART_EVENT, syncCart);
    };
  }, []);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
    [items],
  );

  function addItem(dessert: FeaturedDessert, quantity = 1) {
    setItems((current) => {
      const nextQuantity = Math.max(1, quantity);
      const existing = current.find((item) => item.id === dessert.id);
      if (existing) {
        return current.map((item) =>
          item.id === dessert.id ? { ...item, quantity: item.quantity + nextQuantity } : item,
        );
      }

      return [
        {
          id: dessert.id,
          slug: dessert.slug,
          name: dessert.name,
          price: dessert.price,
          image_url: dessert.image_url ?? dessert.image_urls?.[0] ?? null,
          category_name: dessert.category_name ?? null,
          quantity: nextQuantity,
        },
        ...current,
      ];
    });
  }

  function updateQuantity(itemId: string, quantity: number) {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item)),
    );
  }

  function removeItem(itemId: string) {
    setItems((current) => current.filter((item) => item.id !== itemId));
  }

  function clearCart() {
    setItems([]);
  }

  return { items, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart };
}
