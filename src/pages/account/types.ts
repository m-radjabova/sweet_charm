import type { FeaturedDessert, User } from "../../types/types";

export type ProfileTab = "dashboard" | "orders" | "favorites" | "rewards" | "coupons" | "addresses" | "settings";

export interface ProfileFormState {
  full_name: string;
  email: string;
  phone: string;
  birthday: string;
  bio: string;
}

export interface PasswordFormState {
  current_password: string;
  new_password: string;
}

export interface ProfileViewProps {
  profile: User | null | undefined;
  featuredDesserts: FeaturedDessert[];
  favoriteDesserts: FeaturedDessert[];
  favoriteIds: string[];
  toggleFavorite: (dessertId: string, dessert?: FeaturedDessert) => void;
  ordersCount: number;
  addressesCount: number;
  setActiveTab: (tab: ProfileTab) => void;
}
