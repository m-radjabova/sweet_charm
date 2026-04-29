import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  HiMiniArrowLeft, 
  HiOutlineCalendarDays, 
  HiOutlineClock, 
  HiOutlinePhone, 
  HiOutlineUser,
  HiOutlineArrowRight,
  HiOutlineScissors,
  HiOutlineCheckBadge,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
  HiMiniStar,
  HiMiniMapPin
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { createMyBooking, getBarberAvailability } from "../../api/bookings";
import { getErrorMessage } from "../../api/auth";
import useContextPro from "../../hooks/useContextPro";
import {
  formatDisplayDate,
  getTodayIsoDate,
  setStoredConfirmedBooking,
} from "./bookingUtils";
import { maskStoredPhone } from "../../utils/phone";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Skeleton Component
function BookingDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-xl">
        <div className="h-6 w-32 rounded bg-slate-200"></div>
        <div className="mt-5 flex items-center gap-4">
          <div className="h-20 w-20 rounded-xl bg-slate-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded bg-slate-200"></div>
            <div className="h-4 w-28 rounded bg-slate-200"></div>
          </div>
        </div>
        <div className="my-5 h-px bg-slate-200"></div>
        <div className="space-y-3">
          <div className="h-6 w-36 rounded bg-slate-200"></div>
          <div className="h-6 w-44 rounded bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
}

function formatWorkingHours(start?: string | null, end?: string | null) {
  if (!start || !end) return "Jadval kiritilmagan";
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

function formatMoney(value?: number | null) {
  if (value == null) return "-";
  return `${value.toLocaleString("ru-RU")} so'm`;
}

export default function BookingDetails() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    state: { user },
  } = useContextPro();
  const { barberId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date") ?? getTodayIsoDate();
  const time = searchParams.get("time") ?? "";

  const availabilityQuery = useQuery({
    queryKey: ["barber-availability", barberId, date],
    queryFn: () => getBarberAvailability(barberId, date),
    enabled: Boolean(barberId),
  });

  const createBookingMutation = useMutation({
    mutationFn: createMyBooking,
    onSuccess: async (booking) => {
      setStoredConfirmedBooking({
        bookingCode: booking.booking_code,
        barberId: booking.barber_id,
        date: booking.appointment_date,
        time: booking.appointment_time,
        clientName: booking.client_name,
        clientPhone: booking.client_phone,
        createdAt: booking.created_at,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["public-barbers"] }),
        queryClient.invalidateQueries({ queryKey: ["barber-availability", barberId] }),
      ]);
      toast.success(t("bookingDetails.toast.success"), {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#10b981", color: "white", borderRadius: "16px" }
      });
      navigate(`/book/success/${booking.booking_code}`, { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("bookingDetails.toast.error")), {
        position: "top-right",
        autoClose: 4000,
        style: { background: "#ef4444", color: "white", borderRadius: "16px" }
      });
    },
  });

  const barber = availabilityQuery.data?.barber;
  const selectedSlot = availabilityQuery.data?.slots.find((slot) => slot.time === time);
  const isLoading = availabilityQuery.isLoading;
  const isUserReady = useMemo(
    () => user?.role === "user" && Boolean(user.full_name?.trim()) && Boolean(user.phone_number?.trim()),
    [user],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-300/20 to-orange-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-slate-400/10 to-indigo-400/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-300/5 to-rose-300/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/book/${barberId}?date=${date}`)}
            className="group mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
          >
            <HiMiniArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Orqaga
          </button>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Bronni tasdiqlash
            </h1>
            <p className="mt-2 text-slate-500">
              Ma'lumotlaringizni tekshirib, bronni tasdiqlang
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Column - Booking Summary */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
            {isLoading ? (
              <BookingDetailsSkeleton />
            ) : barber && selectedSlot ? (
              <>
                {/* Booking Summary Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 border border-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
                      <HiOutlineCheckBadge className="h-3 w-3" />
                      Bron ma'lumotlari
                    </span>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      Tasdiqlanmoqda
                    </span>
                  </div>

                  {/* Barber Info */}
                  <div className="flex items-center gap-4">
                    {barber.avatar ? (
                      <img 
                        src={barber.avatar} 
                        alt={barber.full_name} 
                        className="h-16 w-16 rounded-xl object-cover shadow-lg ring-4 ring-white transition-transform group-hover:scale-105" 
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-xl font-black text-white shadow-lg ring-4 ring-white transition-transform group-hover:scale-105">
                        {getInitials(barber.full_name)}
                      </div>
                    )}

                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        {barber.full_name}
                      </h2>
                      {barber.specialty?.trim() && (
                        <div className="mt-1 flex items-center gap-1">
                          <HiOutlineScissors className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-sm font-medium text-slate-600">
                            {barber.specialty.trim()}
                          </span>
                        </div>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
                          <HiMiniStar className="h-3 w-3" />
                          {barber.average_rating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {barber.completed_bookings_count} ta qabul
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                  {/* Appointment Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-amber-50 p-2.5">
                        <HiOutlineCalendarDays className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">Sana</p>
                        <p className="mt-0.5 font-bold text-slate-900">
                          {formatDisplayDate(date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-50 p-2.5">
                        <HiOutlineClock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">Vaqt</p>
                        <p className="mt-0.5 font-bold text-slate-900">
                          {selectedSlot?.label ?? time}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="mt-5 rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-xs text-slate-500">
                      Xizmat davomiyligi: 30-60 daqiqa
                    </p>
                  </div>
                </div>

                {/* Location & Hours */}
                <div className="rounded-2xl bg-white p-5 shadow-xl shadow-slate-900/5 border border-slate-100">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <HiMiniMapPin className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Manzil</p>
                        <p className="text-sm font-medium text-slate-700">
                          {barber.location_text || "Kiritilmagan"}
                        </p>
                      </div>
                    </div>
                    {barber.services?.length ? (
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-400">Xizmatlar va narxlar</p>
                        <div className="mt-2 space-y-2">
                          {barber.services.map((service, index) => (
                            <div key={`${service.name}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                              <div>
                                <p className="font-semibold text-slate-800">{service.name}</p>
                                {service.promotion_text ? (
                                  <p className="text-xs text-rose-500">{service.promotion_text}</p>
                                ) : null}
                              </div>
                              <div className="text-right">
                                {service.discount_price != null ? (
                                  <>
                                    <p className="text-xs text-slate-400 line-through">{formatMoney(service.price)}</p>
                                    <p className="font-black text-rose-600">{formatMoney(service.discount_price)}</p>
                                  </>
                                ) : (
                                  <p className="font-black text-slate-900">{formatMoney(service.price)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-3">
                      <HiOutlineClock className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Ish vaqti</p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatWorkingHours(barber.work_start_time, barber.work_end_time)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Badge */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <HiOutlineShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Xavfsiz bron</p>
                      <p className="mt-1 text-xs text-slate-600">
                        Ma'lumotlaringiz xavfsiz saqlanadi va faqat sartarosh bilan ko'riladi
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : !isLoading && (
              <div className="rounded-2xl bg-rose-50 p-8 text-center">
                <HiOutlineInformationCircle className="mx-auto h-12 w-12 text-rose-400" />
                <p className="mt-3 font-semibold text-rose-600">
                  Ma'lumot yuklanmadi
                </p>
                <p className="mt-1 text-sm text-rose-500">
                  Qayta urinib ko'ring
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div className="mt-6 lg:mt-0">
            <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 border border-slate-100">
              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-900">
                  {isUserReady ? "Sizning ma'lumotlaringiz" : "Tizimga kiring"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {isUserReady 
                    ? "Ma'lumotlaringiz to'g'riligini tekshiring" 
                    : "Bron qilish uchun tizimga kirishingiz kerak"}
                </p>
              </div>

              {isUserReady ? (
                <>
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-amber-200 hover:bg-white">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white p-2.5 shadow-sm">
                          <HiOutlineUser className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            To'liq ism
                          </p>
                          <p className="mt-1 font-bold text-slate-900">
                            {user?.full_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-amber-200 hover:bg-white">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-white p-2.5 shadow-sm">
                          <HiOutlinePhone className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Telefon raqam
                          </p>
                          <p className="mt-1 font-bold text-slate-900">
                            {maskStoredPhone(user?.phone_number)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="mt-5 rounded-xl bg-slate-50 p-3">
                    <p className="text-center text-xs text-slate-500">
                      ⚡ Bronni bekor qilish uchun profilingizdagi "Mening bronlarim" bo'limiga o'ting
                    </p>
                  </div>

                  {/* Confirm Button */}
                  <button
                    type="button"
                    onClick={() =>
                      void createBookingMutation.mutateAsync({
                        barber_id: barberId,
                        appointment_date: date,
                        appointment_time: time,
                      })
                    }
                    disabled={createBookingMutation.isPending}
                    className="group relative mt-6 h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-slate-500/25 disabled:opacity-50"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    <span className="relative flex items-center justify-center gap-2">
                      {createBookingMutation.isPending ? (
                        <>
                          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Tasdiqlanmoqda...
                        </>
                      ) : (
                        <>
                          Bronni tasdiqlash
                          <HiOutlineCheckBadge className="h-5 w-5 transition-transform group-hover:scale-110" />
                        </>
                      )}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {/* Login Required Card */}
                  <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                      <HiOutlineUser className="h-8 w-8 text-amber-500" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900">
                      Tizimga kiring
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      Bron qilish uchun hisobingizga kirishingiz yoki ro'yxatdan o'tishingiz kerak
                    </p>
                  </div>

                  {/* Register Button */}
                  <button
                    type="button"
                    onClick={() => navigate(`/user/access?redirect=${encodeURIComponent(`/book/${barberId}/details?date=${date}&time=${time}`)}`)}
                    className="group relative mt-6 h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    <span className="relative flex items-center justify-center gap-2">
                      Hisobga kirish
                      <HiOutlineArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>

                  {/* Info Text */}
                  <p className="mt-4 text-center text-xs text-slate-400">
                    Ro'yxatdan o'tish 1 daqiqa davom etadi
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
