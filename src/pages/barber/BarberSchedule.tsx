import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HiMiniArrowLeft,
  HiMiniCheckCircle,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniClock,
  HiMiniCog6Tooth,
  HiMiniPhone,
  HiMiniCalendarDays,
  HiMiniUserGroup,
  HiMiniCheckBadge,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../api/auth";
import { getBarberDashboard, updateBookingStatus } from "../../api/bookings";
import useContextPro from "../../hooks/useContextPro";
import type { Booking } from "../../types/types";
import { formatDisplayDate, formatDisplayTime, getTodayIsoDate } from "../home/bookingUtils";

function shiftDate(date: string, offset: number) {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + offset);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const tabs = ["all", "confirmed", "completed"] as const;

export default function BarberSchedule() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { state } = useContextPro();
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate());
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("all");

  const dashboardQuery = useQuery({
    queryKey: ["barber-dashboard", selectedDate],
    queryFn: () => getBarberDashboard(selectedDate),
  });

  const completeMutation = useMutation({
    mutationFn: (bookingId: string) => updateBookingStatus(bookingId, "completed"),
    onSuccess: async () => {
      toast.success(t("barberDashboard.toast.completed"));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["barber-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["barber-bookings"] }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("barberDashboard.toast.error")));
    },
  });

  const appointments = dashboardQuery.data?.appointments ?? [];

  const filteredAppointments = useMemo(() => {
    if (activeTab === "all") return appointments;
    return appointments.filter((booking) => booking.status === activeTab);
  }, [activeTab, appointments]);

  const stats = useMemo(() => {
    const completed = appointments.filter((booking) => booking.status === "completed").length;
    const pending = appointments.filter((booking) => booking.status === "confirmed").length;
    return {
      total: appointments.length,
      completed,
      pending,
    };
  }, [appointments]);

  const getTabCount = (tab: typeof tabs[number]) => {
    if (tab === "all") return stats.total;
    if (tab === "confirmed") return stats.pending;
    return stats.completed;
  };

  return (
    <div className="barber-theme min-h-screen bg-white px-4 py-20 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <section className="rounded-[30px] border border-white/70 bg-white/88 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/barber"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-white md:h-14 md:w-14"
                aria-label="Back to barber dashboard"
              >
                <HiMiniArrowLeft className="text-2xl md:text-3xl" />
              </Link>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{t("barberDashboard.schedule")}</h1>
                <p className="mt-1 text-sm font-medium text-slate-400 md:text-lg">{state.user?.full_name ?? t("roles.barber")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 md:px-5 md:py-2.5 md:text-base">
                <HiMiniCalendarDays className="text-lg md:text-xl" />
                <span>{formatDisplayDate(selectedDate)}</span>
              </div>
              <Link
                to="/barber/settings"
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-700 md:h-14 md:w-14"
                aria-label="Open settings"
              >
                <HiMiniCog6Tooth className="text-2xl md:text-3xl" />
              </Link>
            </div>
          </div>
        </section>

        {/* Date Navigation & Stats */}
        <section className="mt-6 rounded-[28px] border border-white/70 bg-white/88 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:mt-8 md:p-8">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            <button
              type="button"
              onClick={() => setSelectedDate((current) => shiftDate(current, -1))}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-300 transition hover:border-slate-300 hover:bg-white hover:text-slate-700 md:h-14 md:w-14"
            >
              <HiMiniChevronLeft className="text-2xl md:text-3xl" />
            </button>

            <div className="text-center">
              <p className="text-2xl font-black text-slate-950 md:text-4xl">{t("common.today")}</p>
              <p className="mt-1 text-sm text-slate-400 md:text-lg">{formatDisplayDate(selectedDate)}</p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate((current) => shiftDate(current, 1))}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-white md:h-14 md:w-14"
            >
              <HiMiniChevronRight className="text-2xl md:text-3xl" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-3 gap-3 md:grid-cols-3 md:gap-4">
            <StatCard
              icon={<HiMiniUserGroup className="text-2xl" />}
              value={stats.total}
              label={t("barberSchedule.totalAppointments")}
              color="slate"
            />
            <StatCard
              icon={<HiMiniClock className="text-2xl" />}
              value={stats.pending}
              label={t("barberDashboard.pending")}
              color="amber"
            />
            <StatCard
              icon={<HiMiniCheckBadge className="text-2xl" />}
              value={stats.completed}
              label={t("common.confirmed")}
              color="emerald"
            />
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mt-6 rounded-[28px] border border-white/70 bg-white/88 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:mt-8 md:p-4">
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`group relative rounded-[20px] px-4 py-4 text-center transition-all duration-200 ${
                  activeTab === tab 
                    ? "bg-white text-slate-950 shadow-sm" 
                    : "text-slate-400 hover:bg-white/50 hover:text-slate-700"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-base font-black capitalize md:text-2xl">{tab === "all" ? t("barberSchedule.all") : tab === "confirmed" ? t("barberDashboard.pending") : t("common.confirmed")}</span>
                  <span className={`text-[11px] font-semibold md:text-sm ${activeTab === tab ? "text-slate-500" : "text-slate-400"}`}>
                    {t("barberSchedule.appointmentsCount", { count: getTabCount(tab) })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Appointments Grid */}
        <section className="mt-8">
          {dashboardQuery.isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[400px] animate-pulse rounded-[34px] bg-white/50 p-6">
                  <div className="h-8 w-3/4 rounded-lg bg-slate-200"></div>
                  <div className="mt-4 h-6 w-1/2 rounded-lg bg-slate-200"></div>
                  <div className="mt-8 space-y-4">
                    <div className="h-6 w-full rounded-lg bg-slate-200"></div>
                    <div className="h-6 w-full rounded-lg bg-slate-200"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <article className="rounded-[30px] border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center">
              <div className="mx-auto max-w-md">
                <div className="mb-4 text-6xl">📅</div>
                <p className="text-xl font-semibold text-slate-600">{t("barberDashboard.noAppointments")}</p>
                <p className="mt-2 text-base text-slate-400">
                  {activeTab === "all" 
                    ? t("barberSchedule.noAppointmentsForDay")
                    : t("barberSchedule.noAppointmentsForStatus", { status: activeTab })}
                </p>
              </div>
            </article>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
              {filteredAppointments.map((booking) => (
                <ScheduleCard
                  key={booking.id}
                  booking={booking}
                  onComplete={() => completeMutation.mutate(booking.id)}
                  loading={completeMutation.isPending}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: ReactNode; value: number; label: string; color: "slate" | "amber" | "emerald" }) {
  const colorClasses = {
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  const iconClasses = {
    slate: "bg-white text-slate-500",
    amber: "bg-white text-amber-500",
    emerald: "bg-white text-emerald-500",
  };

  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-5 transition hover:scale-105 ${colorClasses[color]}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClasses[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black">{value}</p>
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
}

function ScheduleCard({
  booking,
  onComplete,
  loading,
}: {
  booking: Booking;
  onComplete: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const isDone = booking.status === "completed";

  return (
    <article className={`group relative overflow-hidden rounded-[34px] border transition-all duration-300 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] ${
      isDone 
        ? "border-emerald-100 bg-white/70" 
        : "border-white/80 bg-white hover:border-slate-200"
    }`}>
      {/* Status Badge - Desktop Optimized */}
      <div className="absolute right-5 top-5">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
            isDone ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isDone ? "bg-emerald-500" : "bg-amber-500"}`} />
          {isDone ? t("common.confirmed") : t("barberDashboard.pending")}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <div className="pr-24">
          <p className={`text-3xl font-black md:text-4xl ${isDone ? "text-slate-400 line-through" : "text-slate-950"}`}>
            {booking.client_name}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-400 md:text-xl">#{booking.booking_code}</p>
        </div>

        <div className="mt-8 space-y-4">
          <InfoRow 
            icon={<HiMiniClock className="text-xl text-slate-400 md:text-2xl" />} 
            text={formatDisplayTime(booking.appointment_time)} 
          />
          <InfoRow 
            icon={<HiMiniPhone className="text-xl text-slate-400 md:text-2xl" />} 
            text={booking.client_phone} 
          />
        </div>

        {isDone ? (
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-emerald-50 px-5 py-3 text-base font-semibold text-emerald-600 md:text-lg">
            <HiMiniCheckCircle className="text-xl text-emerald-500 md:text-2xl" />
            {t("barberDashboard.toast.completed")}
          </div>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            disabled={loading}
            className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-[22px] bg-black text-lg font-black text-white transition hover:bg-slate-800 hover:scale-[1.02] disabled:opacity-60 md:h-16 md:text-xl"
          >
            <HiMiniCheckCircle className="text-xl md:text-2xl" />
            {loading ? t("settings.updating") : t("barberSchedule.markCompleted")}
          </button>
        )}
      </div>
    </article>
  );
}

function InfoRow({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-4 text-base text-slate-600 md:text-lg">
      {icon}
      <span className="font-medium">{text}</span>
    </div>
  );
}
