import { formatDate } from "../../utils/date";

export const BOOKING_SELECTION_STORAGE_KEY = "barber_shop_selected_slot";
export const CONFIRMED_BOOKING_STORAGE_KEY = "barber_shop_confirmed_booking";

export type StoredBookingSelection = {
  barberId: string;
  date: string;
  time: string;
  label?: string;
};

export type StoredConfirmedBooking = {
  bookingCode: string;
  barberId: string;
  date: string;
  time: string;
  clientName?: string;
  clientPhone?: string;
  createdAt?: string;
};

export function formatDisplayDate(date: string) {
  return formatDate(date, date);
}

export function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayTime(time: string) {
  const [hoursText = "0", minutes = "00"] = normalizeTimeValue(time).split(":");
  const hours = String(Number(hoursText || 0)).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function normalizeTimeValue(time: string) {
  const [hoursText = "0", minutes = "00"] = time.split(":");
  const hours = String(Number(hoursText || 0)).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function readStorageValue<T>(key: string) {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) return null;
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

export function getStoredSelection() {
  const parsed = readStorageValue<Partial<StoredBookingSelection>>(BOOKING_SELECTION_STORAGE_KEY);
  if (!parsed?.barberId || !parsed.date || !parsed.time) return null;

  return {
    barberId: parsed.barberId,
    date: parsed.date,
    time: parsed.time,
    label: parsed.label,
  } satisfies StoredBookingSelection;
}

export function setStoredSelection(value: StoredBookingSelection) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BOOKING_SELECTION_STORAGE_KEY, JSON.stringify(value));
}

export function clearStoredSelection() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BOOKING_SELECTION_STORAGE_KEY);
}

export function getStoredConfirmedBooking() {
  const parsed = readStorageValue<Partial<StoredConfirmedBooking>>(CONFIRMED_BOOKING_STORAGE_KEY);
  if (!parsed?.bookingCode || !parsed.barberId || !parsed.date || !parsed.time) return null;

  return {
    bookingCode: parsed.bookingCode,
    barberId: parsed.barberId,
    date: parsed.date,
    time: parsed.time,
    clientName: parsed.clientName,
    clientPhone: parsed.clientPhone,
    createdAt: parsed.createdAt,
  } satisfies StoredConfirmedBooking;
}

export function setStoredConfirmedBooking(value: StoredConfirmedBooking) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONFIRMED_BOOKING_STORAGE_KEY, JSON.stringify(value));
}

export function clearStoredConfirmedBooking() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CONFIRMED_BOOKING_STORAGE_KEY);
}
