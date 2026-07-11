export type UserRole = "admin" | "user";

export interface User {
  id?: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  role?: UserRole | null;
  is_active?: boolean | null;
  sweet_points?: number | null;
  current_level?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  birthday?: string | null;
  bio?: string | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string | null;
}

export interface FeaturedDessert {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  ingredients?: string | null;
  price: string;
  image_url?: string | null;
  image_urls?: string[];
  rating_avg?: number;
  reviews_count?: number;
  category_name?: string | null;
  stock?: number;
  status?: "active" | "inactive" | "out_of_stock";
  is_chef_choice?: boolean;
}

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: string;
  image_url?: string | null;
  category_name?: string | null;
  quantity: number;
}

export interface FeaturedReview {
  id: string;
  customer_name: string;
  rating: number;
  text: string;
  created_at: string;
  dessert_name?: string | null;
}

export interface DessertReview {
  id: string;
  customer_name: string;
  rating: number;
  text: string;
  created_at: string;
  avatar?: string | null;
  is_mine?: boolean;
}

export interface GalleryImage {
  id: string;
  title?: string | null;
  image_url: string;
  sort_order: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}
