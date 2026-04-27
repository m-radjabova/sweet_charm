export type UserRole = "admin" | "barber" | "user";

export interface User {
  id: string;
  full_name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
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
  password?: string;
  is_active?: boolean;
}

export interface UpdateCurrentUserPayload {
  full_name?: string;
  email?: string;
}

export type BookingStatus = "confirmed" | "completed" | "cancelled";

export interface PublicBarber {
  id: string;
  full_name: string;
  avatar?: string | null;
  is_active: boolean;
}

export interface AvailabilitySlot {
  time: string;
  label: string;
  status: "available" | "booked";
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

export interface Booking {
  id: string;
  booking_code: string;
  barber_id: string;
  barber_name: string;
  barber_avatar?: string | null;
  client_name: string;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: BookingStatus;
  created_at: string;
}

export interface BarberDashboardStats {
  total: number;
  completed: number;
  pending: number;
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
