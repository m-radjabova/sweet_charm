import apiClient from "../apiClient/apiClient";
import type {
  BarberDashboard,
  BarberAvailability,
  Booking,
  BookingCreatePayload,
  BookingStatus,
  PublicBarber,
} from "../types/types";

export async function listPublicBarbers() {
  const { data } = await apiClient.get<PublicBarber[]>("/public/barbers");
  return data;
}

export async function getBarberAvailability(barberId: string, date: string) {
  const { data } = await apiClient.get<BarberAvailability>(`/public/barbers/${barberId}/availability`, {
    params: { date },
  });
  return data;
}

export async function createPublicBooking(payload: BookingCreatePayload) {
  const { data } = await apiClient.post<Booking>("/public/bookings", payload);
  return data;
}

export async function getPublicBooking(bookingCode: string) {
  const { data } = await apiClient.get<Booking>(`/public/bookings/${bookingCode}`);
  return data;
}

export async function listAdminBookings(params?: {
  date?: string;
  barber_id?: string;
  status?: string;
  search?: string;
}) {
  const { data } = await apiClient.get<Booking[]>("/bookings", {
    params,
  });
  return data;
}

export async function getBarberDashboard(date: string) {
  const { data } = await apiClient.get<BarberDashboard>("/bookings/dashboard", {
    params: { date },
  });
  return data;
}

export async function listMyBookings(params?: {
  date?: string;
  status?: BookingStatus;
}) {
  const { data } = await apiClient.get<Booking[]>("/bookings/me", {
    params,
  });
  return data;
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  const { data } = await apiClient.patch<Booking>(`/bookings/${bookingId}/status`, {
    status,
  });
  return data;
}
