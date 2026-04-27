import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  HiMiniArrowLeft, 
  HiOutlineCalendarDays, 
  HiOutlineClock, 
  HiOutlinePhone, 
  HiOutlineUser,
  HiOutlineScissors,
  HiOutlineCheckBadge,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { createPublicBooking, getBarberAvailability } from "../../api/bookings";
import { getErrorMessage } from "../../api/auth";
import { formatDisplayDate, getTodayIsoDate } from "./bookingUtils";

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
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <div className="h-6 w-40 rounded bg-slate-200"></div>
        <div className="mt-5 flex items-center gap-4">
          <div className="h-20 w-20 rounded-xl bg-slate-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded bg-slate-200"></div>
            <div className="h-4 w-24 rounded bg-slate-200"></div>
          </div>
        </div>
        <div className="my-5 h-px bg-slate-200"></div>
        <div className="space-y-3">
          <div className="h-6 w-48 rounded bg-slate-200"></div>
          <div className="h-6 w-52 rounded bg-slate-200"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-32 rounded-xl bg-slate-200"></div>
        <div className="h-32 rounded-xl bg-slate-200"></div>
      </div>
    </div>
  );
}

export default function BookingDetails() {
  const navigate = useNavigate();
  const { barberId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const date = searchParams.get("date") ?? getTodayIsoDate();
  const time = searchParams.get("time") ?? "";
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [focusedField, setFocusedField] = useState<"name" | "phone" | null>(null);

  const availabilityQuery = useQuery({
    queryKey: ["barber-availability", barberId, date],
    queryFn: () => getBarberAvailability(barberId, date),
    enabled: Boolean(barberId),
  });

  const createBookingMutation = useMutation({
    mutationFn: createPublicBooking,
    onSuccess: (booking) => {
      toast.success("Booking confirmed successfully!", {
        position: "top-right",
        autoClose: 3000
      });
      navigate(`/book/success/${booking.booking_code}`, { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create booking"), {
        position: "top-right",
        autoClose: 4000
      });
    },
  });

  const barber = availabilityQuery.data?.barber;
  const selectedSlot = availabilityQuery.data?.slots.find((slot) => slot.time === time);
  const isLoading = availabilityQuery.isLoading;
  const isValid = clientName.trim().length >= 2 && clientPhone.trim().length >= 8;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-amber-200/20 to-amber-100/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-l from-slate-200/20 to-slate-100/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-t from-amber-100/5 to-transparent blur-3xl"></div>
      </div>

      <div className="relative mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-start gap-4 border-b border-slate-200/70 pb-5 lg:mb-8 lg:border-b-0 lg:pb-0">
            <button
              onClick={() => navigate(`/book/${barberId}?date=${date}`)}
              className="group mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
              aria-label="Go back"
            >
              <HiMiniArrowLeft className="text-2xl text-slate-700 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Your Details
              </h1>
              <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                <HiOutlineInformationCircle className="h-4 w-4" />
                Almost done! Complete your booking
              </p>
            </div>
          </div>

          {/* Two Column Layout for Desktop */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Left Column - Booking Summary */}
            <div className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
              {isLoading ? (
                <BookingDetailsSkeleton />
              ) : barber && selectedSlot ? (
                <>
                  {/* Booking Summary Card */}
                  <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
                    <div className="relative rounded-[28px] bg-white p-5 shadow-lg transition-all duration-300 group-hover:shadow-xl sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black uppercase tracking-wider text-amber-600">
                          Booking Summary
                        </p>
                        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1">
                          <HiOutlineCheckBadge className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-600">Confirming</span>
                        </div>
                      </div>

                      {/* Barber Info */}
                      <div className="flex items-center gap-4">
                        {barber.avatar ? (
                          <img 
                            src={barber.avatar} 
                            alt={barber.full_name} 
                            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white shadow-md transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20" 
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 text-lg font-black text-white shadow-md transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20 sm:text-xl">
                            {getInitials(barber.full_name)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-black text-slate-950 truncate">
                            {barber.full_name}
                          </h2>
                          <div className="mt-1 flex items-center gap-2">
                            <HiOutlineScissors className="h-4 w-4 text-amber-500" />
                            <p className="text-sm font-semibold text-slate-600">
                              Fade & Line-ups Specialist
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                      {/* Appointment Details */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-amber-50 p-2">
                            <HiOutlineCalendarDays className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-slate-400">Date</p>
                            <p className="mt-0.5 text-base font-bold text-slate-900">
                              {formatDisplayDate(date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-blue-50 p-2">
                            <HiOutlineClock className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-slate-400">Time</p>
                            <p className="mt-0.5 text-base font-bold text-slate-900">
                              {selectedSlot?.label ?? time}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Duration Info */}
                      <div className="mt-5 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-center text-slate-500">
                          ⏱️ Duration: ~45 minutes • Please arrive 5 minutes early
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Insurance/Badge Note */}
                  <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                    <div className="flex items-start gap-3">
                      <HiOutlineShieldCheck className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">Secure Booking</p>
                        <p className="text-xs text-slate-600 mt-1">
                          Your information is protected and will only be used for appointment confirmation
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl bg-red-50 p-6 text-center">
                  <HiOutlineInformationCircle className="mx-auto h-12 w-12 text-red-400" />
                  <p className="mt-2 font-semibold text-red-600">Failed to load booking details</p>
                  <p className="mt-1 text-sm text-red-500">Please go back and try again</p>
                </div>
              )}
            </div>

            {/* Right Column - Customer Form */}
            <div className="mt-6 lg:mt-0">
              <form
                className="rounded-[28px] bg-white p-5 shadow-lg transition-all duration-300 sm:p-6"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (isValid) {
                    await createBookingMutation.mutateAsync({
                      barber_id: barberId,
                      appointment_date: date,
                      appointment_time: time,
                      client_name: clientName,
                      client_phone: clientPhone,
                    });
                  }
                }}
              >
                <div className="mb-6">
                  <h3 className="text-xl font-black text-slate-950">Contact Information</h3>
                  <p className="text-sm text-slate-500 mt-1">We'll send confirmation to these details</p>
                </div>

                {/* Full Name Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Full Name
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <div className={`group relative transition-all duration-200 ${
                    focusedField === "name" ? "scale-[1.01]" : ""
                  }`}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <HiOutlineUser className={`h-5 w-5 transition-colors ${
                        focusedField === "name" ? "text-amber-500" : "text-slate-400"
                      }`} />
                    </div>
                    <input
                      value={clientName}
                      onChange={(event) => setClientName(event.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="John Smith"
                      className="h-14 w-full rounded-xl border-2 border-slate-200 pl-11 pr-4 text-base font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:shadow-lg hover:border-slate-300"
                    />
                  </div>
                  {clientName.trim() && clientName.trim().length < 2 && (
                    <p className="text-xs text-rose-500 animate-slideIn">
                      Please enter a valid name
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div className="mt-5 space-y-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Phone Number
                    <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <div className={`group relative transition-all duration-200 ${
                    focusedField === "phone" ? "scale-[1.01]" : ""
                  }`}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <HiOutlinePhone className={`h-5 w-5 transition-colors ${
                        focusedField === "phone" ? "text-amber-500" : "text-slate-400"
                      }`} />
                    </div>
                    <input
                      value={clientPhone}
                      onChange={(event) => setClientPhone(event.target.value)}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="(555) 000-0000"
                      type="tel"
                      className="h-14 w-full rounded-xl border-2 border-slate-200 pl-11 pr-4 text-base font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:shadow-lg hover:border-slate-300"
                    />
                  </div>
                  {clientPhone.trim() && clientPhone.trim().length < 8 && (
                    <p className="text-xs text-rose-500 animate-slideIn">
                      Please enter a valid phone number
                    </p>
                  )}
                </div>

                {/* Reminder Notice */}
                <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <HiOutlineClock className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      We'll send you a reminder before your appointment
                    </p>
                  </div>
                </div>

                {/* Cancelation Policy */}
                <div className="mt-5 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-center text-slate-500">
                    🔔 Free cancellation up to 2 hours before appointment
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isValid || createBookingMutation.isPending}
                  className="group sticky bottom-0 relative mt-6 h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-slate-500/25 disabled:opacity-50 disabled:hover:shadow-none lg:static"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {createBookingMutation.isPending ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Confirming Booking...
                      </>
                    ) : (
                      <>
                        Confirm Booking
                        <HiOutlineCheckBadge className="h-4 w-4 transition-transform group-hover:scale-110" />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
