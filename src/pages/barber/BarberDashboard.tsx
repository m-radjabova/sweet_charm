import { useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  HiMiniArrowLeftOnRectangle,
  HiMiniCalendarDays,
  HiMiniCheckBadge,
  HiMiniChevronRight,
  HiMiniCog6Tooth,
  HiMiniClock,
  HiMiniPhone,
  HiMiniSparkles,
  HiMiniUsers,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../api/auth";
import { getBarberDashboard, updateBookingStatus } from "../../api/bookings";
import useContextPro from "../../hooks/useContextPro";
import { formatDisplayTime, getTodayIsoDate } from "../home/bookingUtils";

const today = getTodayIsoDate();

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function BarberDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, state } = useContextPro();

  const dashboardQuery = useQuery({
    queryKey: ["barber-dashboard", today],
    queryFn: () => getBarberDashboard(today),
  });

  const completeMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, "completed"),
    onSuccess: async () => {
      toast.success("Appointment completed");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["barber-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["barber-bookings"] }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Appointment status yangilanmadi"));
    },
  });

  const dashboard = dashboardQuery.data;
  const appointments = dashboard?.appointments ?? [];
  const nextBooking = dashboard?.next_booking ?? null;

  const progress = useMemo(() => {
    if (!dashboard?.stats.total) return 0;
    return Math.round(dashboard.stats.completion_ratio * 100);
  }, [dashboard]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f7f2_0%,#f7f7f5_45%,#efede6_100%)] px-4 py-4 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <section className="rounded-2xl sm:rounded-[30px] border border-white/70 bg-white/88 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-5 md:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start sm:gap-6 md:gap-4">
            <div className="flex items-center gap-3 sm:gap-5">
              {state.user?.avatar ? (
                <img 
                  src={state.user.avatar} 
                  alt={state.user.full_name} 
                  className="h-14 w-14 rounded-xl object-cover sm:h-16 sm:w-16 sm:rounded-[22px] md:h-24 md:w-24" 
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black text-lg font-black text-white sm:h-16 sm:w-16 sm:rounded-[22px] sm:text-xl md:h-24 md:w-24 md:text-3xl">
                  {getInitials(state.user?.full_name ?? "B")}
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-400 sm:text-base md:text-xl">Good day,</p>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl md:text-5xl">
                  {state.user?.full_name?.split(" ")[0] ?? "Barber"}
                </h1>
                <div className="mt-2 hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 sm:mt-3 sm:inline-flex sm:px-4 sm:py-1.5 sm:text-sm md:px-5 md:text-base">
                  <HiMiniSparkles className="text-sm sm:text-base" />
                  Barber dashboard
                </div>
              </div>
            </div>

            <div className="absolute right-4 top-4 flex items-center gap-2 sm:relative sm:right-0 sm:top-0 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate("/barber/settings")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-400 transition hover:border-slate-300 hover:text-slate-700 sm:h-12 sm:w-12 sm:rounded-2xl md:h-14 md:w-14"
                aria-label="Open settings"
              >
                <HiMiniCog6Tooth className="text-xl sm:text-2xl md:text-3xl" />
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-400 transition hover:border-slate-300 hover:text-slate-700 sm:h-12 sm:w-12 sm:rounded-2xl md:h-14 md:w-14"
                aria-label="Logout"
              >
                <HiMiniArrowLeftOnRectangle className="text-xl sm:text-2xl md:text-3xl" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-base font-semibold text-slate-400 sm:mt-6 sm:gap-3 sm:text-lg md:mt-8 md:text-xl">
            <HiMiniCalendarDays className="text-xl sm:text-2xl md:text-3xl" />
            <span>{dashboard?.display_date ?? "Today schedule"}</span>
          </div>
        </section>

        {/* Metric Cards - Responsive Grid */}
        <section className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3 md:mt-8 md:gap-5">
          <MetricCard icon={<HiMiniUsers className="text-xl sm:text-2xl md:text-3xl" />} value={dashboard?.stats.total ?? 0} label="Today" tone="dark" />
          <MetricCard icon={<HiMiniCheckBadge className="text-xl sm:text-2xl md:text-3xl" />} value={dashboard?.stats.completed ?? 0} label="Done" tone="success" />
          <MetricCard icon={<HiMiniClock className="text-xl sm:text-2xl md:text-3xl" />} value={dashboard?.stats.pending ?? 0} label="Pending" tone="light" />
        </section>

        {/* Progress Section */}
        <section className="mt-4 rounded-2xl border border-white/70 bg-white/88 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:mt-6 sm:rounded-[28px] sm:p-5 md:mt-8 md:p-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center sm:gap-3 md:gap-4">
            <p className="text-base font-black text-slate-700 sm:text-lg md:text-2xl">Today's Progress</p>
            <p className="text-sm font-semibold text-slate-400 sm:text-base md:text-xl">
              {dashboard?.stats.completed ?? 0}/{dashboard?.stats.total ?? 0} completed
            </p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100 sm:mt-4 md:mt-5 md:h-3">
            <div className="h-2 rounded-full bg-black transition-all md:h-3" style={{ width: `${progress}%` }} />
          </div>
        </section>

        {/* Next Client Section - Responsive */}
        <section className="mb-4 mt-4 rounded-2xl bg-black p-5 text-white shadow-[0_30px_70px_rgba(15,23,42,0.24)] sm:mb-6 sm:mt-6 sm:rounded-[30px] sm:p-6 md:mt-8 md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between md:gap-6">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45 sm:text-sm md:text-base">Next Client</p>
              {nextBooking ? (
                <>
                  <h2 className="mt-3 text-2xl font-black sm:mt-4 sm:text-3xl md:mt-8 md:text-5xl lg:text-6xl">{nextBooking.client_name}</h2>
                  <div className="mt-2 flex items-center gap-2 text-base text-white/70 sm:mt-3 sm:text-lg md:mt-5 md:text-2xl">
                    <HiMiniPhone className="text-lg sm:text-xl md:text-2xl" />
                    <span className="text-sm sm:text-base">{nextBooking.client_phone}</span>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mt-4 text-2xl font-black sm:mt-5 sm:text-3xl md:mt-8 md:text-4xl">No pending clients</h2>
                  <p className="mt-2 text-sm text-white/60 sm:mt-3 sm:text-base md:text-lg">All current appointments are handled for today.</p>
                </>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 sm:items-end">
              <div className="rounded-full bg-white/16 px-4 py-2 text-lg font-black sm:px-5 sm:py-2.5 sm:text-xl md:px-8 md:py-4 md:text-3xl">
                {nextBooking ? formatDisplayTime(nextBooking.appointment_time) : "--:--"}
              </div>
              {nextBooking && (
                <button
                  type="button"
                  onClick={() => completeMutation.mutate(nextBooking.id)}
                  disabled={completeMutation.isPending}
                  className="h-12 w-full rounded-xl bg-white px-6 text-base font-black text-slate-950 transition hover:bg-slate-100 disabled:opacity-60 sm:h-14 sm:rounded-[22px] sm:px-7 sm:text-lg md:h-16 md:w-auto md:min-w-[200px] md:px-8 md:text-xl"
                >
                  {completeMutation.isPending ? "Updating..." : "Mark as Complete"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Daily Schedule Button - Responsive */}
        <button
          type="button"
          onClick={() => navigate("/barber/schedule")}
          className="group mt-4 flex w-full items-center justify-between rounded-2xl border border-white/70 bg-white/88 px-4 py-4 text-left shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:mt-6 sm:rounded-[28px] sm:px-5 sm:py-5 md:mt-8 md:px-8"
        >
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white transition group-hover:scale-105 sm:h-16 sm:w-16 sm:rounded-[22px] md:h-20 md:w-20">
              <HiMiniCalendarDays className="text-2xl sm:text-3xl md:text-4xl" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-950 sm:text-xl md:text-3xl">Daily Schedule</p>
              <p className="mt-0.5 text-xs text-slate-400 sm:mt-1 sm:text-sm md:text-lg">View all appointments</p>
            </div>
          </div>
          <HiMiniChevronRight className="text-2xl text-slate-300 transition group-hover:translate-x-1 sm:text-3xl md:text-4xl" />
        </button>

        {/* Appointments Section - Responsive */}
        <section className="mt-6 sm:mt-8 md:mt-10">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:mb-6 sm:flex-row sm:items-center sm:gap-4 md:mb-8">
            <h2 className="text-xl font-black text-slate-950 sm:text-2xl md:text-4xl">Today's Appointments</h2>
            <Link to="/barber/schedule" className="text-sm font-semibold text-slate-400 transition hover:text-slate-700 sm:text-base md:text-lg">
              {appointments.length} total appointments
            </Link>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:gap-6">
            {appointments.map((booking) => {
              const isDone = booking.status === "completed";
              return (
                <article
                  key={booking.id}
                  className={`flex flex-col items-start justify-between gap-3 rounded-xl border p-4 shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)] sm:flex-row sm:items-center sm:gap-4 sm:rounded-[28px] sm:p-5 sm:px-6 ${
                    isDone ? "border-emerald-100 bg-white/70" : "border-white/80 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-5">
                    <span className={`h-3 w-3 rounded-full sm:h-4 sm:w-4 ${isDone ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <div>
                      <p className={`text-base font-black sm:text-lg md:text-2xl ${isDone ? "text-slate-400 line-through" : "text-slate-950"}`}>
                        {booking.client_name}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-400 sm:mt-1 sm:text-base md:text-lg">{formatDisplayTime(booking.appointment_time)}</p>
                    </div>
                  </div>

                  {isDone ? (
                    <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 sm:px-4 sm:py-2 sm:text-sm md:px-6 md:py-3 md:text-base">
                      Done
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => completeMutation.mutate(booking.id)}
                      disabled={completeMutation.isPending}
                      className="w-full rounded-xl bg-black px-4 py-2 text-sm font-black text-white transition hover:scale-105 hover:bg-slate-900 disabled:opacity-60 sm:w-auto sm:rounded-[18px] sm:px-5 sm:py-2.5 sm:text-base md:px-7 md:py-3.5 md:text-lg"
                    >
                      Done
                    </button>
                  )}
                </article>
              );
            })}

            {!dashboardQuery.isLoading && appointments.length === 0 && (
              <article className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-center text-slate-400 sm:rounded-[28px] sm:px-6 sm:py-12 md:py-16">
                No appointments scheduled for today.
              </article>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  tone: "dark" | "success" | "light";
}) {
  const className =
    tone === "dark"
      ? "border-black bg-black text-white shadow-[0_20px_45px_rgba(15,23,42,0.2)]"
      : tone === "success"
        ? "border-emerald-100 bg-[#ecfff7] text-slate-950 shadow-[0_20px_45px_rgba(16,185,129,0.08)]"
        : "border-slate-100 bg-[#f8fafc] text-slate-950 shadow-[0_20px_45px_rgba(148,163,184,0.1)]";

  const iconClassName =
    tone === "dark"
      ? "bg-white/12 text-white/70 ring-1 ring-white/10"
      : tone === "success"
        ? "bg-white text-emerald-500 ring-1 ring-emerald-100"
        : "bg-white text-slate-400 ring-1 ring-slate-100";

  const labelClassName =
    tone === "dark"
      ? "text-white/80"
      : "text-slate-400";

  return (
    <article
      className={`flex min-h-[140px] flex-col rounded-2xl border p-3 transition hover:-translate-y-0.5 sm:min-h-[188px] sm:rounded-[34px] sm:p-4 md:min-h-[220px] md:rounded-[30px] md:p-6 ${className}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-14 sm:w-14 sm:rounded-[22px] md:h-16 md:w-16 md:rounded-2xl ${iconClassName}`}>
        {icon}
      </div>
      <div className="mt-auto">
        <div className="text-2xl font-black leading-none sm:text-4xl md:text-6xl">{value}</div>
        <p className={`mt-2 text-xs font-bold sm:mt-3 sm:text-sm md:text-2xl ${labelClassName}`}>{label}</p>
      </div>
    </article>
  );
}
