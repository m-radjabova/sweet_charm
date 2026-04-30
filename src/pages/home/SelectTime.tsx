import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  HiMiniArrowLeft, 
  HiMiniChevronLeft, 
  HiMiniChevronRight,
  HiMiniMapPin,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineScissors,
  HiMiniStar,
  HiOutlineInformationCircle
} from "react-icons/hi2";
import { getBarberAvailability, listMyBookings } from "../../api/bookings";
import useContextPro from "../../hooks/useContextPro";
import {
  clearStoredSelection,
  formatDisplayDate,
  formatDisplayTime,
  getStoredConfirmedBooking,
  getStoredSelection,
  getTodayIsoDate,
  normalizeTimeValue,
  setStoredSelection,
} from "./bookingUtils";

function shiftDate(date: string, offset: number) {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + offset);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMoney(value?: number | null) {
  if (value == null) return "Narx ko'rsatilmagan";
  return `${value.toLocaleString("ru-RU")} so'm`;
}

function formatWorkingHours(start?: string | null, end?: string | null) {
  if (!start || !end) return "Jadval kiritilmagan";
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

// Skeleton Components
function BarberInfoSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 mx-auto sm:mx-0"></div>
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="h-6 w-48 rounded-lg bg-slate-200 mx-auto sm:mx-0"></div>
          <div className="h-4 w-32 rounded-lg bg-slate-200 mx-auto sm:mx-0"></div>
          <div className="flex justify-center sm:justify-start gap-2">
            <div className="h-3 w-16 rounded bg-slate-200"></div>
            <div className="h-3 w-16 rounded bg-slate-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeSlotsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 w-40 rounded bg-slate-200"></div>
        <div className="h-8 w-24 rounded-full bg-slate-200"></div>
      </div>
      <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-[72px] rounded-xl bg-slate-200"></div>
        ))}
      </div>
    </div>
  );
}

export default function SelectTime() {
  const navigate = useNavigate();
  const { barberId = "" } = useParams();
  const {
    state: { user },
  } = useContextPro();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get("date") ?? getTodayIsoDate();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const availabilityQuery = useQuery({
    queryKey: ["barber-availability", barberId, selectedDate],
    queryFn: () => getBarberAvailability(barberId, selectedDate),
    enabled: Boolean(barberId),
    placeholderData: (previousData) => previousData,
  });

  const myBookingsQuery = useQuery({
    queryKey: ["my-bookings", user?.id, barberId, selectedDate],
    queryFn: () => listMyBookings({ date: selectedDate }),
    enabled: Boolean(user?.id && barberId),
    refetchOnWindowFocus: true,
  });

  const availability = availabilityQuery.data;
  const isLoading = availabilityQuery.isLoading && !availability;
  const isRefreshing = availabilityQuery.isFetching && Boolean(availability);
  const canContinue = Boolean(selectedTime && availability?.barber.id);
  const slots = availability?.slots ?? [];
  const confirmedBooking = getStoredConfirmedBooking();
  const ownedBookedTimes = useMemo(() => {
    const times = new Set<string>();

    myBookingsQuery.data
      ?.filter((booking) => booking.barber_id === barberId && booking.status !== "cancelled")
      .forEach((booking) => {
        times.add(normalizeTimeValue(booking.appointment_time));
      });

    if (
      confirmedBooking?.barberId === barberId &&
      confirmedBooking.date === selectedDate &&
      !times.size
    ) {
      times.add(normalizeTimeValue(confirmedBooking.time));
    }

    return times;
  }, [barberId, confirmedBooking, myBookingsQuery.data, selectedDate]);
  const ownedBookedTimeList = Array.from(ownedBookedTimes).sort();
  const ownedBookedTime = ownedBookedTimeList[0] ?? null;
  const selectedSummaryTime = selectedTime
    ? selectedTime
    : ownedBookedTime ?? "";
  const selectedSummaryLabel = selectedSummaryTime
    ? formatDisplayTime(selectedSummaryTime)
    : "";

  useEffect(() => {
    const storedSelection = getStoredSelection();
    if (!storedSelection) return;
    if (storedSelection.barberId !== barberId || storedSelection.date !== selectedDate) return;

    const matchingSlot = slots.find(
      (slot) => normalizeTimeValue(slot.time) === normalizeTimeValue(storedSelection.time) && slot.status === "available",
    );

    if (matchingSlot) {
      setSelectedTime((current) => current || matchingSlot.time);
    }
  }, [barberId, selectedDate, slots]);

  useEffect(() => {
    if (!selectedTime) return;

    const selectedSlot = slots.find((slot) => normalizeTimeValue(slot.time) === normalizeTimeValue(selectedTime));
    if (!selectedSlot || selectedSlot.status !== "available") {
      setSelectedTime("");
    }
  }, [selectedTime, slots]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!selectedTime) {
      const storedSelection = getStoredSelection();
      if (storedSelection?.barberId === barberId && storedSelection.date === selectedDate) {
        clearStoredSelection();
      }
      return;
    }

    const selectedSlot = slots.find((slot) => slot.time === selectedTime);
    setStoredSelection({
      barberId,
      date: selectedDate,
      time: selectedTime,
      label: selectedSlot?.label ?? formatDisplayTime(selectedTime),
    });
  }, [barberId, selectedDate, selectedTime, slots]);

  const handleContinue = () => {
    if (!canContinue) return;
    setIsNavigating(true);
    navigate(
      `/book/${barberId}/details?date=${selectedDate}&time=${encodeURIComponent(selectedTime)}`,
    );
  };

  const handleDateChange = (offset: number) => {
    setSelectedDate((current) => shiftDate(current, offset));
    setSelectedTime("");
  };

  const isToday = selectedDate === getTodayIsoDate();
  const displayDate = formatDisplayDate(selectedDate);
  const selectedTimeLabel = selectedTime ? formatDisplayTime(selectedTime) : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-300/20 to-orange-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-slate-400/10 to-indigo-400/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-300/5 to-rose-300/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="group mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
          >
            <HiMiniArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Orqaga
          </button>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Vaqt tanlash
            </h1>
            <p className="mt-2 text-slate-500">
              Qulay vaqtingizni belgilang va bron qilishni yakunlang
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
            {isLoading ? (
              <BarberInfoSkeleton />
            ) : availability ? (
              <>
                {/* Barber Profile Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 border border-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {availability.barber.avatar ? (
                      <img 
                        src={availability.barber.avatar} 
                        alt={availability.barber.full_name} 
                        className="h-20 w-20 rounded-xl object-cover shadow-lg ring-4 ring-white" 
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-2xl font-black text-white shadow-lg ring-4 ring-white">
                        {getInitials(availability.barber.full_name)}
                      </div>
                    )}

                    <div className="flex-1">
                      <h2 className="text-xl font-black text-slate-900">
                        {availability.barber.full_name}
                      </h2>
                      {availability.barber.specialty?.trim() && (
                        <div className="mt-1 flex items-center gap-2">
                          <HiOutlineScissors className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium text-slate-600">
                            {availability.barber.specialty.trim()}
                          </span>
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                          <HiMiniStar className="h-3.5 w-3.5" />
                          {availability.barber.average_rating.toFixed(1)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          <HiOutlineUser className="h-3.5 w-3.5" />
                          {availability.barber.completed_bookings_count} ta qabul
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <HiMiniMapPin className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Manzil</p>
                        <p className="text-sm font-medium text-slate-700">
                          {availability.barber.location_text || "Kiritilmagan"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <HiOutlineClock className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-400">Ish vaqti</p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatWorkingHours(availability.barber.work_start_time, availability.barber.work_end_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {availability.barber.bio && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Sartarosh haqida
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {availability.barber.bio}
                      </p>
                    </div>
                  )}

                  {/* Services */}
                  <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                          Xizmatlar
                        </p>
                        <p className="text-xs text-amber-600">Narx va vaqt</p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                        {formatMoney(availability.barber.price_from)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(availability.barber.services?.length ? availability.barber.services : [{ name: "Xizmatlar tez orada qo'shiladi", price: 0, duration_minutes: 30 }]).map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                          <div>
                            <p className="font-bold text-slate-900">{service.name}</p>
                            <p className="text-xs text-slate-500">{service.duration_minutes} daqiqa</p>
                            {service.promotion_text ? (
                              <p className="mt-1 text-xs font-semibold text-rose-500">{service.promotion_text}</p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            {service.discount_price != null ? (
                              <>
                                <p className="text-xs text-slate-400 line-through">{formatMoney(service.price)}</p>
                                <p className="text-sm font-black text-rose-600">
                                  {formatMoney(service.discount_price)}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-black text-slate-900">
                                {service.price ? formatMoney(service.price) : "-"}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date Picker */}
                <div className="rounded-2xl bg-white p-5 shadow-xl shadow-slate-900/5 border border-slate-100">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => handleDateChange(-1)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:scale-105"
                    >
                      <HiMiniChevronLeft className="h-5 w-5" />
                    </button>

                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">
                        {isToday ? "Bugun" : displayDate}
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        {displayDate}
                      </p>
                      {isRefreshing ? (
                        <p className="mt-1 text-xs font-medium text-amber-600">
                          Yangilanmoqda...
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDateChange(1)}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:scale-105"
                    >
                      <HiMiniChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Selected Summary */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-white p-2 shadow-sm">
                      <HiOutlineClock className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
                        Tanlangan vaqt
                      </p>
                      {selectedTime ? (
                        <>
                          <p className="mt-1 text-xl font-black text-slate-900">
                            {selectedTimeLabel}
                          </p>
                          <p className="text-sm text-emerald-600">
                            {formatDisplayDate(selectedDate)}
                          </p>
                        </>
                      ) : ownedBookedTime ? (
                        <>
                          <p className="mt-1 text-xl font-black text-slate-900">
                            {ownedBookedTimeList.length === 1
                              ? selectedSummaryLabel
                              : `${ownedBookedTimeList.length} ta bron vaqtingiz bor`}
                          </p>
                          <p className="text-sm text-emerald-600">
                            {ownedBookedTimeList.length === 1
                              ? "Avvalgi bron qilgan vaqtingiz"
                              : ownedBookedTimeList.map((time) => formatDisplayTime(time)).join(", ")}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-slate-500">
                          Hali vaqt tanlanmagan
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Right Column - Time Slots */}
          <div className="mt-6 lg:mt-0">
            {isLoading ? (
              <TimeSlotsSkeleton />
            ) : availability ? (
              <div className="rounded-2xl bg-white p-5 shadow-xl shadow-slate-900/5 border border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-slate-400">
                      Bo'sh vaqtlar
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {slots.length} ta vaqt mavjud
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {isRefreshing ? (
                      <div className="rounded-full bg-amber-50 px-3 py-1">
                        <p className="text-xs font-semibold text-amber-600">
                          Vaqtlar yangilanmoqda...
                        </p>
                      </div>
                    ) : null}
                    {selectedTime && (
                      <div className="rounded-full bg-emerald-50 px-3 py-1 animate-in fade-in duration-300">
                        <p className="text-xs font-semibold text-emerald-600">
                          Tanlandi: {selectedTimeLabel}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                  {slots.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                      <HiOutlineInformationCircle className="mx-auto h-12 w-12 text-slate-400" />
                      <p className="mt-3 font-semibold text-slate-700">
                        Bo'sh vaqtlar mavjud emas
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Boshqa sanani tanlang
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
                      {slots.map((slot, idx) => {
                        const normalizedSlotTime = normalizeTimeValue(slot.time);
                        const isSelected = selectedTime === slot.time;
                        const isBooked = slot.status === "booked";
                        const isPast = slot.status === "past";
                        const isDisabled = slot.status !== "available";
                        const isOwnedBooking = isBooked && ownedBookedTimes.has(normalizedSlotTime);

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setSelectedTime(slot.time)}
                            className={`
                              relative overflow-hidden rounded-xl py-3 px-2 text-center font-bold transition-all duration-300
                              animate-in fade-in slide-in-from-bottom-2
                              ${isSelected 
                                ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg scale-105 ring-2 ring-amber-400" 
                                : isOwnedBooking
                                ? "bg-emerald-50 text-emerald-700 cursor-not-allowed shadow-md"
                                : isDisabled
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                : "bg-white text-slate-700 shadow-md hover:scale-105 hover:shadow-lg hover:border-amber-300 border border-slate-200"
                              }
                            `}
                            style={{ animationDelay: `${idx * 30}ms` }}
                          >
                            {isSelected && (
                              <span className="absolute top-1 right-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-black uppercase">
                                Tanlangan
                              </span>
                            )}
                            {isOwnedBooking && (
                              <span className="absolute top-1 right-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                                Sizniki
                              </span>
                            )}
                            <div className="text-base font-black sm:text-lg">
                              {formatDisplayTime(slot.time)}
                            </div>
                            <div className="text-[10px] opacity-70 mt-0.5">
                              {isSelected && "✓"}
                              {isOwnedBooking && "Bron qilingan"}
                              {isBooked && !isOwnedBooking && "Band"}
                              {isPast && "O'tgan"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap justify-center gap-4 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gradient-to-r from-slate-800 to-slate-900 shadow-sm" />
                    <span className="text-xs text-slate-600">Tanlangan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded border border-slate-300 bg-white shadow-sm" />
                    <span className="text-xs text-slate-600">Bo'sh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-slate-100" />
                    <span className="text-xs text-slate-600">Band</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-emerald-100" />
                    <span className="text-xs text-slate-600">Sizniki</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-rose-50 p-8 text-center">
                <HiOutlineInformationCircle className="mx-auto h-12 w-12 text-rose-400" />
                <p className="mt-3 font-semibold text-rose-600">
                  Ma'lumot yuklanmadi
                </p>
                <p className="mt-1 text-sm text-rose-500">
                  Iltimos, qayta urinib ko'ring
                </p>
              </div>
            )}

            {/* Continue Button */}
            <div className="sticky bottom-4 mt-6 bg-gradient-to-t from-white via-white/95 to-transparent pt-4 lg:static lg:bg-none lg:pt-0">
              <button
                type="button"
                disabled={!canContinue || isNavigating}
                onClick={handleContinue}
                className="group relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:hover:shadow-none"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                <span className="relative flex items-center justify-center gap-2">
                  {isNavigating ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Yonalmoqda...
                    </>
                  ) : (
                    <>
                      Davom etish
                      <HiMiniChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
