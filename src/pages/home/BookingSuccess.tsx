import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  HiOutlineCalendarDays, 
  HiOutlineClock, 
  HiOutlineShare,
  HiOutlineCheckBadge,
  HiOutlineScissors,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineClipboard,
  HiMiniStar
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { getPublicBooking, submitPublicBookingRating } from "../../api/bookings";
import { formatDisplayDate, formatDisplayTime, setStoredConfirmedBooking } from "./bookingUtils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Skeleton Component
function SuccessSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col items-center">
        <div className="h-40 w-40 rounded-full bg-slate-200"></div>
        <div className="mt-8 h-10 w-64 rounded-lg bg-slate-200"></div>
        <div className="mt-3 h-6 w-48 rounded-lg bg-slate-200"></div>
      </div>
      <div className="mt-10 rounded-2xl bg-white p-6 shadow-lg">
        <div className="space-y-4">
          <div className="h-20 rounded-xl bg-slate-200"></div>
          <div className="h-20 rounded-xl bg-slate-200"></div>
          <div className="h-20 rounded-xl bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccess() {
  const { bookingCode = "" } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const bookingQuery = useQuery({
    queryKey: ["public-booking", bookingCode],
    queryFn: () => getPublicBooking(bookingCode),
    enabled: Boolean(bookingCode),
    refetchInterval: (query) => {
      const currentBooking = query.state.data;
      return currentBooking?.status === "completed" ? false : 10000;
    },
    refetchOnWindowFocus: true,
  });

  const booking = bookingQuery.data;
  const isLoading = bookingQuery.isLoading;
  const navigate = useNavigate();
  const isCompleted = booking?.status === "completed";

  const ratingMutation = useMutation({
    mutationFn: (rating: number) => submitPublicBookingRating(bookingCode, rating),
    onSuccess: async (updatedBooking) => {
      setSelectedRating(updatedBooking.rating ?? null);
      queryClient.setQueryData(["public-booking", bookingCode], updatedBooking);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["public-booking", bookingCode] }),
        queryClient.invalidateQueries({ queryKey: ["public-barbers"] }),
        queryClient.invalidateQueries({ queryKey: ["barber-availability", updatedBooking.barber_id] }),
      ]);
      toast.success(t("bookingSuccess.ratingSaved"));
    },
    onError: () => {
      toast.error(t("bookingSuccess.ratingError"));
    },
  });

  useEffect(() => {
    if (!booking) return;

    setStoredConfirmedBooking({
      bookingCode: booking.booking_code,
      barberId: booking.barber_id,
      date: booking.appointment_date,
      time: booking.appointment_time,
      clientName: booking.client_name,
      clientPhone: booking.client_phone,
      createdAt: booking.created_at,
    });
    setSelectedRating(booking.rating ?? null);
  }, [booking]);

  return (
    <div className="home-theme min-h-screen bg-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-emerald-200/20 to-teal-100/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-l from-slate-200/20 to-slate-100/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-t from-emerald-100/5 to-transparent blur-3xl"></div>
      </div>

      <div className="relative mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <SuccessSkeleton />
          ) : booking ? (
            <>
              {/* Success Header with Animation */}
              <div className="animate-slideDown">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    {/* Animated checkmark circle */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 animate-pulse opacity-20"></div>
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl animate-bounceIn sm:h-32 sm:w-32">
                      <svg className="h-16 w-16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 12a9 9 0 1 1-3.28-6.95M8.5 12.5l2.5 2.5 5.5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 shadow-lg animate-zoomIn">
                      <HiOutlineScissors className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <h1 className="mt-8 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl animate-fadeIn">
                    {t("bookingSuccess.title")}
                  </h1>
                  <p className="mt-3 text-lg text-slate-500 animate-fadeIn animation-delay-200">
                    {t("bookingSuccess.subtitle")}
                  </p>
                </div>
              </div>

              {/* Booking Details Card */}
              <div className="mt-8 lg:mt-10 animate-slideUp">
                <div className="group relative overflow-hidden rounded-[28px] bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
                  {/* Decorative gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  
                  <div className="relative p-6 sm:p-8">
                    {/* Header with Booking ID */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                          {t("bookingSuccess.bookingId")}
                        </p>
                        <div className="mt-1 flex items-baseline gap-2">
                          <p className="text-2xl font-black text-slate-950 sm:text-3xl">
                            #{booking.booking_code}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(booking.booking_code);
                              toast.success(t("bookingSuccess.idCopied"));
                            }}
                            className="rounded-lg bg-slate-100 p-1.5 transition-colors hover:bg-slate-200"
                          >
                            <HiOutlineClipboard className="h-4 w-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-2 rounded-full px-4 py-2 ${
                          isCompleted ? "bg-emerald-50" : "bg-amber-50"
                        }`}
                      >
                        <HiOutlineCheckBadge className={`h-5 w-5 ${isCompleted ? "text-emerald-600" : "text-amber-600"}`} />
                        <span className={`text-sm font-bold ${isCompleted ? "text-emerald-700" : "text-amber-700"}`}>
                          {isCompleted ? t("barberDashboard.done") : t("common.confirmed")}
                        </span>
                      </div>
                    </div>

                    <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Barber Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {booking.barber_avatar ? (
                        <img 
                          src={booking.barber_avatar} 
                          alt={booking.barber_name} 
                          className="h-20 w-20 rounded-xl object-cover ring-2 ring-white shadow-md transition-transform duration-300 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 text-xl font-black text-white shadow-md">
                          {getInitials(booking.barber_name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-black text-slate-950">
                          {booking.barber_name}
                        </h2>
                        {booking.barber_specialty?.trim() ? (
                          <div className="mt-1 flex items-center gap-2">
                            <HiOutlineScissors className="h-4 w-4 text-amber-500" />
                            <p className="text-sm font-semibold text-slate-600">
                              {booking.barber_specialty.trim()}
                            </p>
                          </div>
                        ) : null}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-600">
                            <HiMiniStar className="h-3.5 w-3.5" />
                            {Number(booking.barber_rating ?? 0).toFixed(1)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                            {t("bookingSuccess.reviewsCount", { count: booking.barber_reviews_count ?? 0 })}
                          </span>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                            {t("bookingSuccess.ratingTitle")}
                          </p>
                          {isCompleted ? (
                            <>
                              <p className="mt-2 text-sm text-slate-600">
                                {t("bookingSuccess.ratingSubtitle")}
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5].map((value) => {
                                  const isActive = (selectedRating ?? 0) >= value;

                                  return (
                                    <button
                                      key={value}
                                      type="button"
                                      onClick={() => {
                                        setSelectedRating(value);
                                        ratingMutation.mutate(value);
                                      }}
                                      disabled={ratingMutation.isPending}
                                      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                                        isActive
                                          ? "border-amber-300 bg-amber-50 text-amber-500"
                                          : "border-slate-200 bg-white text-slate-300"
                                      } disabled:opacity-60`}
                                      aria-label={t("bookingSuccess.rateLabel", { count: value })}
                                    >
                                      <HiMiniStar className="h-5 w-5" />
                                    </button>
                                  );
                                })}
                              </div>
                              <p className="mt-3 text-xs text-slate-500">
                                {selectedRating
                                  ? t("bookingSuccess.currentRating", { count: selectedRating })
                                  : t("bookingSuccess.chooseRating")}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="mt-2 text-sm text-slate-600">
                                {t("bookingSuccess.ratingPending")}
                              </p>
                              <p className="mt-2 text-xs text-slate-500">
                                {t("bookingSuccess.ratingReturnHint")}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Appointment Details Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-slate-50 to-white p-4 shadow-sm">
                        <div className="rounded-lg bg-amber-50 p-2.5">
                          <HiOutlineCalendarDays className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-400">{t("common.date")}</p>
                          <p className="mt-0.5 text-base font-bold text-slate-900">
                            {formatDisplayDate(booking.appointment_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-slate-50 to-white p-4 shadow-sm">
                        <div className="rounded-lg bg-blue-50 p-2.5">
                          <HiOutlineClock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-400">{t("common.time")}</p>
                          <p className="mt-0.5 text-base font-bold text-slate-900">
                            {formatDisplayTime(booking.appointment_time)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Client Information */}
                    <div className="mt-6 rounded-xl bg-gradient-to-r from-slate-50 to-white p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-50 p-2.5">
                          <HiOutlinePhone className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-400">{t("bookingSuccess.client")}</p>
                          <p className="mt-0.5 text-base font-bold text-slate-900">
                            {booking.client_name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-amber-50 p-3 text-center">
                        <p className="text-xs text-amber-700">{t("bookingSuccess.duration")}</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <p className="text-xs text-blue-700">{t("bookingSuccess.arriveEarly")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reminder Message */}
              <div className="mt-6 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 animate-fadeIn animation-delay-400">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-emerald-100 p-2">
                    <HiOutlineCalendar className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {t("bookingSuccess.confirmationNotice")}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4 animate-slideUp animation-delay-600">
                <Link
                  to="/"
                  className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 py-4 text-center text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-slate-500/25"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {t("bookingSuccess.bookAnother")}
                    <HiOutlineCalendar className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </span>
                </Link>
                
                <button
                  type="button"
                  onClick={() => {navigate(`/`)}}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white py-4 text-base font-bold text-slate-700 transition-all hover:border-slate-300 hover:shadow-lg"
                >
                  <HiOutlineShare className="h-5 w-5 transition-transform group-hover:scale-110" />
                  {t("bookingSuccess.shareDetails")}
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-red-50 p-8 text-center">
              <HiOutlineCheckBadge className="mx-auto h-16 w-16 text-red-400" />
              <p className="mt-4 text-xl font-bold text-red-600">{t("bookingSuccess.notFound")}</p>
              <p className="mt-2 text-slate-600">{t("bookingSuccess.notFoundText")}</p>
              <Link
                to="/"
                className="mt-6 inline-block rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 text-white font-semibold"
              >
                {t("common.goHome")}
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-zoomIn {
          animation: zoomIn 0.3s ease-out 0.3s both;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
}
