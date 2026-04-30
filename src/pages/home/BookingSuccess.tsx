import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  HiOutlineCalendarDays, 
  HiOutlineClock, 
  HiOutlineShare,
  HiOutlineCheckBadge,
  HiOutlineScissors,
  HiOutlinePhone,
  HiOutlineClipboard,
  HiMiniStar,
  HiOutlineArrowRight,
  HiOutlineSparkles
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
        <div className="h-32 w-32 rounded-full bg-slate-200"></div>
        <div className="mt-6 h-8 w-48 rounded-lg bg-slate-200"></div>
        <div className="mt-2 h-5 w-64 rounded-lg bg-slate-200"></div>
      </div>
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-xl">
        <div className="space-y-4">
          <div className="h-24 rounded-xl bg-slate-100"></div>
          <div className="h-24 rounded-xl bg-slate-100"></div>
          <div className="h-24 rounded-xl bg-slate-100"></div>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccess() {
  const { t } = useTranslation();
  const { bookingCode = "" } = useParams();
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
      toast.success(t("bookingSuccess.ratingSaved"), {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#10b981", color: "white", borderRadius: "16px" }
      });
    },
    onError: () => {
      toast.error(t("bookingSuccess.ratingError"), {
        position: "top-right",
        autoClose: 4000,
        style: { background: "#ef4444", color: "white", borderRadius: "16px" }
      });
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingCode);
    toast.success(t("bookingSuccess.idCopied"), {
      position: "top-right",
      autoClose: 2000,
      style: { background: "#3b82f6", color: "white", borderRadius: "16px" }
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: t("bookingSuccess.shareTitle"),
        text: t("bookingSuccess.shareText", { code: bookingCode }),
        url: window.location.href,
      });
    } catch {
      toast.info(t("bookingSuccess.shareUnsupported"), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-300/20 to-teal-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-slate-400/10 to-indigo-400/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-300/5 to-teal-300/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {isLoading ? (
          <SuccessSkeleton />
        ) : booking ? (
          <>
            {/* Success Animation Header */}
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 animate-ping opacity-20" />
                {/* Main checkmark circle */}
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl animate-bounceIn">
                  <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {/* Decorative icon */}
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg animate-zoomIn">
                  <HiOutlineScissors className="h-5 w-5 text-white" />
                </div>
              </div>
              
              <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl animate-fadeIn">
                {t("bookingSuccess.successTitle")}
              </h1>
              <p className="mt-2 text-slate-500 animate-fadeIn animation-delay-200">
                {t("bookingSuccess.successSubtitle")}
              </p>
            </div>

            {/* Main Booking Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 border border-slate-100 transition-all hover:shadow-2xl sm:p-8 animate-slideUp">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="relative">
                {/* Header with Booking ID */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                      {t("bookingSuccess.bookingId")}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-2xl font-black text-slate-900 font-mono">
                        {booking.booking_code}
                      </p>
                      <button
                        onClick={handleCopyCode}
                        className="rounded-lg bg-slate-100 p-2 transition-all hover:bg-slate-200 hover:scale-105"
                      >
                        <HiOutlineClipboard className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
                    isCompleted ? "bg-emerald-50" : "bg-amber-50"
                  }`}>
                    <HiOutlineCheckBadge className={`h-5 w-5 ${isCompleted ? "text-emerald-600" : "text-amber-600"}`} />
                    <span className={`text-sm font-bold ${isCompleted ? "text-emerald-700" : "text-amber-700"}`}>
                      {isCompleted ? t("bookingSuccess.completed") : t("common.confirmed")}
                    </span>
                  </div>
                </div>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Barber Profile */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  {booking.barber_avatar ? (
                    <img 
                      src={booking.barber_avatar} 
                      alt={booking.barber_name} 
                      className="h-20 w-20 rounded-xl object-cover shadow-lg ring-4 ring-white transition-transform group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-2xl font-black text-white shadow-lg ring-4 ring-white">
                      {getInitials(booking.barber_name)}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-900">
                      {booking.barber_name}
                    </h2>
                    {booking.barber_specialty?.trim() && (
                      <div className="mt-1 flex items-center gap-2">
                        <HiOutlineScissors className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-slate-600">
                          {booking.barber_specialty.trim()}
                        </span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600">
                        <HiMiniStar className="h-3.5 w-3.5" />
                        {Number(booking.barber_rating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {t("bookingSuccess.reviewsCount", { count: booking.barber_reviews_count ?? 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                {/* Appointment Details */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="rounded-lg bg-emerald-100 p-2.5">
                      <HiOutlineCalendarDays className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">{t("common.date")}</p>
                      <p className="font-bold text-slate-900">
                        {formatDisplayDate(booking.appointment_date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="rounded-lg bg-blue-100 p-2.5">
                      <HiOutlineClock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">{t("common.time")}</p>
                      <p className="font-bold text-slate-900">
                        {formatDisplayTime(booking.appointment_time)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client & Location */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="rounded-lg bg-purple-100 p-2.5">
                      <HiOutlinePhone className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">{t("bookingSuccess.client")}</p>
                      <p className="font-bold text-slate-900">{booking.client_name}</p>
                    </div>
                  </div>
                </div>

                {/* Rating Section (only for completed bookings) */}
                {isCompleted && (
                  <div className="mt-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-5">
                    <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <HiMiniStar className="h-5 w-5 text-amber-500" />
                          <span className="text-sm font-bold text-amber-700">{t("bookingSuccess.ratingTitle")}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {t("bookingSuccess.ratingSubtitle")}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() => ratingMutation.mutate(value)}
                            disabled={ratingMutation.isPending}
                            className={`group transition-all hover:scale-110 ${
                              (selectedRating ?? 0) >= value
                                ? "text-amber-500"
                                : "text-slate-300 hover:text-amber-400"
                            }`}
                          >
                            <HiMiniStar className="h-8 w-8" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {selectedRating && (
                      <div className="mt-3 text-center text-sm text-emerald-600">
                        <HiOutlineCheckBadge className="inline h-4 w-4 mr-1" />
                        {t("bookingSuccess.youRated", { count: selectedRating })}
                      </div>
                    )}
                  </div>
                )}

                {/* Info Notice */}
                <div className="mt-6 rounded-xl bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <HiOutlineSparkles className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-800">{t("bookingSuccess.infoTitle")}</p>
                      <p className="text-xs text-emerald-700 mt-1">
                        {t("bookingSuccess.infoText", { code: booking.booking_code })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                {t("bookingSuccess.bookAnother")}
                <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <button
                onClick={handleShare}
                className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                <HiOutlineShare className="h-4 w-4 transition-transform group-hover:scale-110" />
                {t("bookingSuccess.shareDetails")}
              </button>
            </div>

            {/* Back to Home Link */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-slate-600"
              >
                {t("common.goHome")}
                <HiOutlineArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </>
        ) : (
          // Error State
          <div className="rounded-2xl bg-white p-12 text-center shadow-xl border border-slate-100">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
              <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900">{t("bookingSuccess.notFound")}</h3>
            <p className="mt-2 text-slate-500">
              {t("bookingSuccess.notFoundText")}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105"
            >
              {t("common.goHome")}
              <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
