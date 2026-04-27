import { useState } from "react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  HiMiniArrowLeft, 
  HiMiniChevronLeft, 
  HiMiniChevronRight,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineScissors,
  HiMiniStar,
  HiOutlineInformationCircle
} from "react-icons/hi2";
import { getBarberAvailability } from "../../api/bookings";
import { getTodayIsoDate } from "./bookingUtils";

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

// Skeleton Components
function BarberInfoSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="h-[84px] w-[84px] rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 mx-auto sm:mx-0"></div>
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="h-5 w-40 rounded-lg bg-slate-200 mx-auto sm:mx-0"></div>
          <div className="h-4 w-24 rounded-lg bg-slate-200 mx-auto sm:mx-0"></div>
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
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-[86px] rounded-xl bg-slate-200"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }
}

export default function SelectTime() {
  const navigate = useNavigate();
  const { barberId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get("date") ?? getTodayIsoDate();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const availabilityQuery = useQuery({
    queryKey: ["barber-availability", barberId, selectedDate],
    queryFn: () => getBarberAvailability(barberId, selectedDate),
    enabled: Boolean(barberId),
  });

  const availability = availabilityQuery.data;
  const isLoading = availabilityQuery.isLoading;
  const canContinue = Boolean(selectedTime && availability?.barber.id);

  const slots = availability?.slots ?? [];

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
  const displayDate = formatDate(selectedDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-amber-200/20 to-amber-100/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-l from-slate-200/20 to-slate-100/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-t from-amber-100/5 to-transparent blur-3xl"></div>
      </div>

      <div className="relative mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-start gap-4 border-b border-slate-200/70 pb-5 lg:mb-8 lg:border-b-0 lg:pb-0">
            <button
              onClick={() => navigate(-1)}
              className="group mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-md transition-all hover:scale-110 hover:shadow-lg"
              aria-label="Go back"
            >
              <HiMiniArrowLeft className="text-2xl text-slate-700 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Select Time
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                <HiOutlineClock className="hidden h-4 w-4 sm:block" />
                Choose your preferred slot
              </p>
            </div>
          </div>

          {/* Two Column Layout for Desktop */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Left Column - Barber Info & Date */}
            <div className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
              {isLoading ? (
                <BarberInfoSkeleton />
              ) : availability ? (
                <>
                  {/* Barber Info Card */}
                  <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
                    <div className="relative rounded-[28px] bg-white p-4 shadow-lg transition-all duration-300 group-hover:shadow-xl sm:p-5">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        {availability.barber.avatar ? (
                          <img 
                            src={availability.barber.avatar} 
                            alt={availability.barber.full_name} 
                            className="mx-auto h-[64px] w-[64px] rounded-2xl object-cover ring-2 ring-white shadow-md transition-transform duration-300 group-hover:scale-105 sm:mx-0 sm:h-[84px] sm:w-[84px]" 
                          />
                        ) : (
                          <div className="mx-auto flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-600 text-xl font-black text-white shadow-md transition-transform duration-300 group-hover:scale-105 sm:mx-0 sm:h-[84px] sm:w-[84px] sm:text-2xl">
                            {getInitials(availability.barber.full_name)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h2 className="text-xl font-black text-slate-950">
                            {availability.barber.full_name}
                          </h2>
                          <div className="mt-1 flex items-center gap-2">
                            <HiOutlineScissors className="h-4 w-4 text-amber-500" />
                            <p className="text-sm font-semibold text-slate-600">
                              Fade & Line-ups Specialist
                            </p>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
                              <HiMiniStar className="h-3.5 w-3.5" />
                              4.9 ★
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                              <HiOutlineUser className="h-3.5 w-3.5" />
                              150+ bookings
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date Picker */}
                  <div className="rounded-[28px] bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => handleDateChange(-1)}
                        className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:shadow-md hover:scale-105"
                      >
                        <HiMiniChevronLeft className="text-2xl transition-transform group-hover:-translate-x-0.5" />
                      </button>

                      <div className="flex-1 text-center">
                        <p className="text-3xl font-black text-slate-950">{isToday ? "Today" : displayDate}</p>
                        <p className="mt-1 text-base font-semibold text-slate-400">{formatDate(selectedDate)}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDateChange(1)}
                        className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:shadow-md hover:scale-105"
                      >
                        <HiMiniChevronRight className="text-2xl transition-transform group-hover:translate-x-0.5" />
                      </button>
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
                <div className="rounded-[28px] bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-black uppercase tracking-wider text-slate-400">
                        Available Times
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {slots.length} slots available
                      </p>
                    </div>
                    {selectedTime && (
                      <div className="rounded-full bg-emerald-50 px-3 py-1 self-start sm:self-center animate-fadeIn">
                        <p className="text-xs font-semibold text-emerald-600">
                          Selected: {selectedTime}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                    {slots.length === 0 ? (
                      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-8 text-center backdrop-blur-sm">
                        <HiOutlineInformationCircle className="mx-auto h-12 w-12 text-slate-400" />
                        <p className="mt-3 font-semibold text-slate-700">No Available Slots</p>
                        <p className="text-sm text-slate-500">Try selecting another date</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3 lg:grid-cols-4">
                        {slots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          const isBooked = slot.status === "booked";

                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`group relative h-[72px] overflow-hidden rounded-2xl font-bold transition-all duration-300 sm:h-[86px] ${
                                isSelected
                                  ? "scale-105 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg ring-2 ring-amber-400"
                                  : isBooked
                                    ? "cursor-not-allowed bg-slate-100 text-slate-300"
                                    : "border-2 border-transparent bg-white text-slate-700 shadow-sm hover:scale-105 hover:border-amber-400 hover:shadow-xl"
                              }`}
                            >
                              {!isSelected && !isBooked && (
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"></div>
                              )}

                              <div className="relative flex h-full flex-col items-center justify-center px-1">
                                <span className="text-base font-black sm:text-lg">{slot.label}</span>
                                {isSelected && <span className="mt-1 hidden text-[11px] opacity-80 sm:inline">Selected</span>}
                                {isBooked && <span className="mt-1 hidden text-[11px] sm:inline">Booked</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-xl bg-slate-50/50 p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-md bg-gradient-to-r from-slate-900 to-slate-800 shadow-sm"></div>
                      <span className="text-xs font-medium text-slate-600">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-md border-2 border-slate-300 bg-white shadow-sm"></div>
                      <span className="text-xs font-medium text-slate-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-md bg-slate-100"></div>
                      <span className="text-xs font-medium text-slate-600">Booked</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-red-50 p-6 text-center">
                  <HiOutlineInformationCircle className="mx-auto h-12 w-12 text-red-400" />
                  <p className="mt-2 font-semibold text-red-600">Failed to load availability</p>
                  <p className="mt-1 text-sm text-red-500">Please try again later</p>
                </div>
              )}

              {/* Continue Button */}
              <div className="sticky bottom-0 mt-6 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pt-4 lg:static lg:bg-none lg:pt-0">
                <button
                  type="button"
                  disabled={!canContinue || isNavigating}
                  onClick={handleContinue}
                  className="group relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-slate-500/25 disabled:opacity-50 disabled:hover:shadow-none"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {isNavigating ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Redirecting...
                      </>
                    ) : (
                      <>
                        Continue to Details
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
    </div>
  );
}
