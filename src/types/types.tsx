export type UserRole = "admin" | "barber" | "user";

export interface BarberServiceItem {
  name: string;
  price: number;
  discount_price?: number | null;
  promotion_text?: string | null;
  duration_minutes: number;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  avatar?: string | null;
  specialty?: string | null;
  bio?: string | null;
  location_text?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  work_start_time?: string | null;
  work_end_time?: string | null;
  services?: BarberServiceItem[];
  telegram_connected?: boolean;
  telegram_notifications_enabled?: boolean;
  telegram_marketing_enabled?: boolean;
  telegram_connected_at?: string | null;
  role: UserRole;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TelegramLinkInfo {
  connected: boolean;
  bot_username?: string | null;
  bot_url?: string | null;
  deep_link_url?: string | null;
  token_expires_at?: string | null;
  telegram_connected_at?: string | null;
  telegram_notifications_enabled: boolean;
  telegram_marketing_enabled: boolean;
  subscribers_count: number;
}

export interface TelegramPromotionPayload {
  title?: string | null;
  message: string;
}

export interface TelegramPromotionResult {
  total_recipients: number;
  delivered_recipients: number;
  failed_recipients: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CustomerAuthPayload {
  full_name: string;
  phone_number: string;
  location_text?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

export interface BarberCreatePayload {
  full_name: string;
  email: string;
  password: string;
}

export interface UpdateBarberPayload {
  full_name?: string;
  email?: string;
  specialty?: string | null;
  bio?: string | null;
  location_text?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  work_start_time?: string | null;
  work_end_time?: string | null;
  services?: BarberServiceItem[];
  password?: string;
  is_active?: boolean;
}

export interface UpdateCurrentUserPayload {
  full_name?: string;
  email?: string;
  phone_number?: string | null;
  specialty?: string | null;
  bio?: string | null;
  location_text?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  work_start_time?: string | null;
  work_end_time?: string | null;
  services?: BarberServiceItem[];
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface PublicBarber {
  id: string;
  full_name: string;
  avatar?: string | null;
  specialty?: string | null;
  bio?: string | null;
  location_text?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  distance_km?: number | null;
  work_start_time?: string | null;
  work_end_time?: string | null;
  services?: BarberServiceItem[];
  price_from?: number | null;
  average_rating: number;
  reviews_count: number;
  completed_bookings_count: number;
  is_active: boolean;
}

export interface AvailabilitySlot {
  time: string;
  label: string;
  status: "available" | "booked" | "past";
}

export interface BarberAvailability {
  barber: PublicBarber;
  date: string;
  display_date: string;
  slots: AvailabilitySlot[];
}

export interface BookingCreatePayload {
  barber_id: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_phone: string;
}

export interface CustomerBookingCreatePayload {
  barber_id: string;
  appointment_date: string;
  appointment_time: string;
}

export interface Booking {
  id: string;
  booking_code: string;
  barber_id: string;
  customer_id?: string | null;
  barber_name: string;
  barber_avatar?: string | null;
  barber_specialty?: string | null;
  barber_rating?: number;
  barber_reviews_count?: number;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  rating?: number | null;
  status: BookingStatus;
  created_at: string;
}

export interface BarberDashboardStats {
  total: number;
  confirmed: number;
  completed: number;
  pending: number;
  cancelled: number;
  completion_ratio: number;
}

export interface BarberDashboard {
  barber: PublicBarber;
  date: string;
  display_date: string;
  stats: BarberDashboardStats;
  next_booking?: Booking | null;
  appointments: Booking[];
}
