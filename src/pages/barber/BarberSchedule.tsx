import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  HiMiniUserGroup,
  HiMiniCheckBadge,
  HiMiniUser,
  HiMiniInformationCircle,
  HiMiniXCircle,
  HiMiniPlusCircle,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../api/auth";
import { blockMyTime, getBarberAvailability, getBarberDashboard, updateBookingStatus } from "../../api/bookings";
import useContextPro from "../../hooks/useContextPro";
import type { Booking } from "../../types/types";
import type { BookingStatus } from "../../types/types";
import { formatDisplayDate, formatDisplayTime, getTodayIsoDate } from "../home/bookingUtils";

function shiftDate(date: string, offset: number) {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + offset);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const tabs = ["all", "pending", "confirmed", "completed", "cancelled", "blocked"] as const;


export default function BarberSchedule() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { state } = useContextPro();
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate());
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("all");
  const [blockTime, setBlockTime] = useState("");

  const dashboardQuery = useQuery({
    queryKey: ["barber-dashboard", selectedDate],
    queryFn: () => getBarberDashboard(selectedDate),
  });
  const availabilityQuery = useQuery({
    queryKey: ["barber-availability", state.user?.id, selectedDate],
    queryFn: () => getBarberAvailability(state.user?.id ?? "", selectedDate),
    enabled: Boolean(state.user?.id),
    placeholderData: (previousData) => previousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: BookingStatus }) =>
      updateBookingStatus(bookingId, status),
    onSuccess: async (booking) => {
      const toastKey =
        booking.status === "confirmed"
          ? "barberSchedule.toast.confirmed"
          : booking.status === "cancelled"
            ? "barberSchedule.toast.cancelled"
            : "barberSchedule.toast.completed";
      toast.success(t(toastKey), {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#10b981", color: "white", borderRadius: "16px" }
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["barber-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["barber-bookings"] }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("barberSchedule.toast.error")), {
        position: "top-right",
        autoClose: 4000,
        style: { background: "#ef4444", color: "white", borderRadius: "16px" }
      });
    },
  });

  const blockMutation = useMutation({
    mutationFn: blockMyTime,
    onSuccess: async () => {
      toast.success(t("barberSchedule.toast.blocked"), {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#0f172a", color: "white", borderRadius: "16px" },
      });
      setBlockTime("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["barber-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["barber-availability"] }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("barberSchedule.toast.blockError")), {
        position: "top-right",
        autoClose: 4000,
        style: { background: "#ef4444", color: "white", borderRadius: "16px" },
      });
    },
  });

  const appointments = dashboardQuery.data?.appointments ?? [];
  const slots = availabilityQuery.data?.slots ?? [];

  const filteredAppointments = useMemo(() => {
    if (activeTab === "all") return appointments;
    return appointments.filter((booking) => booking.status === activeTab);
  }, [activeTab, appointments]);

  const stats = useMemo(() => {
    const completed = appointments.filter((booking) => booking.status === "completed").length;
    const pending = appointments.filter((booking) => booking.status === "pending").length;
    const confirmed = appointments.filter((booking) => booking.status === "confirmed").length;
    const cancelled = appointments.filter((booking) => booking.status === "cancelled").length;
    const blocked = appointments.filter((booking) => booking.status === "blocked").length;
    return {
      total: appointments.length,
      completed,
      confirmed,
      pending,
      cancelled,
      blocked,
    };
  }, [appointments]);

  const getTabCount = (tab: typeof tabs[number]) => {
    if (tab === "all") return stats.total;
    if (tab === "pending") return stats.pending;
    if (tab === "confirmed") return stats.confirmed;
    if (tab === "completed") return stats.completed;
    if (tab === "cancelled") return stats.cancelled;
    return stats.blocked;
  };

  const isToday = selectedDate === getTodayIsoDate();

  useEffect(() => {
    if (!blockTime) return;
    const selectedSlot = slots.find((slot) => slot.time === blockTime);
    if (!selectedSlot || selectedSlot.status !== "available") {
      setBlockTime("");
    }
  }, [blockTime, slots]);

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
          <Link
            to="/barber"
            className="group mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
          >
            <HiMiniArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("barberSchedule.backToDashboard")}
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">
                {t("barberSchedule.title")}
              </h1>
              <p className="mt-2 text-slate-500">
                {t("barberSchedule.subtitle")}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-md">
                <HiMiniUser className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-700">
                  {state.user?.full_name?.split(" ")[0] ?? t("roles.barber")}
                </span>
              </div>
              <Link
                to="/barber/settings"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-md transition-all hover:scale-105 hover:shadow-lg"
              >
                <HiMiniCog6Tooth className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Date Picker Card */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 border border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setSelectedDate((current) => shiftDate(current, -1))}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:scale-105"
            >
              <HiMiniChevronLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">
                {isToday ? t("common.today") : formatDisplayDate(selectedDate)}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {formatDisplayDate(selectedDate)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate((current) => shiftDate(current, 1))}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:scale-105"
            >
              <HiMiniChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700">{t("barberSchedule.blockTimeTitle")}</p>
            <p className="mt-1 text-xs text-slate-500">{t("barberSchedule.blockTimeSubtitle")}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {slots.map((slot) => {
                const isSelected = blockTime === slot.time;
                const isBooked = slot.status === "booked";
                const isPast = slot.status === "past";
                const isDisabled = isBooked || isPast;

                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setBlockTime(slot.time)}
                    className={`rounded-xl border px-2 py-2 text-center text-xs font-bold transition ${
                      isSelected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : isDisabled
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <div>{formatDisplayTime(slot.time)}</div>
                    <div className="mt-1 text-[10px] font-semibold">
                      {isPast ? t("selectTime.past") : isBooked ? t("common.booked") : t("common.available")}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  blockMutation.mutate({
                    appointment_date: selectedDate,
                    appointment_time: blockTime,
                  })
                }
                disabled={!blockTime || blockMutation.isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                <HiMiniPlusCircle className="h-5 w-5" />
                {blockMutation.isPending ? t("common.saving") : t("barberSchedule.blockTimeButton")}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            title={t("barberSchedule.statsTotal")}
            value={stats.total}
            icon={<HiMiniUserGroup className="h-5 w-5" />}
            color="from-slate-500 to-slate-600"
            bgColor="bg-slate-50"
            textColor="text-slate-600"
          />
          <StatCard
            title={t("barberSchedule.statsPending")}
            value={stats.pending}
            icon={<HiMiniClock className="h-5 w-5" />}
            color="from-amber-500 to-orange-600"
            bgColor="bg-amber-50"
            textColor="text-amber-600"
          />
          <StatCard
            title={t("barberSchedule.statsConfirmed")}
            value={stats.confirmed}
            icon={<HiMiniClock className="h-5 w-5" />}
            color="from-blue-500 to-indigo-600"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            title={t("barberSchedule.statsCompleted")}
            value={stats.completed}
            icon={<HiMiniCheckBadge className="h-5 w-5" />}
            color="from-emerald-500 to-teal-600"
            bgColor="bg-emerald-50"
            textColor="text-emerald-600"
          />
          <StatCard
            title={t("barberSchedule.statsBlocked")}
            value={stats.blocked}
            icon={<HiMiniXCircle className="h-5 w-5" />}
            color="from-slate-600 to-slate-700"
            bgColor="bg-slate-100"
            textColor="text-slate-600"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-bold transition-all relative ${
                activeTab === tab
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab === "all" && t("barberSchedule.all")}
              {tab === "pending" && t("barberSchedule.pendingApproval")}
              {tab === "confirmed" && t("barberSchedule.confirmed")}
              {tab === "completed" && t("barberSchedule.completed")}
              {tab === "cancelled" && t("barberSchedule.cancelled")}
              {tab === "blocked" && t("barberSchedule.blocked")}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
              )}
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                {getTabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {/* Appointments Grid */}
        {dashboardQuery.isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex justify-between">
                  <div className="h-7 w-40 rounded bg-slate-200"></div>
                  <div className="h-7 w-24 rounded-full bg-slate-200"></div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="h-5 w-32 rounded bg-slate-200"></div>
                  <div className="h-5 w-36 rounded bg-slate-200"></div>
                </div>
                <div className="mt-6 h-12 rounded-xl bg-slate-200"></div>
              </div>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <HiMiniInformationCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {t("barberSchedule.emptyTitle")}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === "all" 
                ? t("barberSchedule.noAppointmentsForDay")
                : t("barberSchedule.noAppointmentsForStatus", {
                    status:
                      activeTab === "pending"
                        ? t("barberSchedule.pendingApproval")
                        : activeTab === "confirmed"
                        ? t("barberSchedule.confirmed")
                        : activeTab === "completed"
                          ? t("barberSchedule.completed")
                          : activeTab === "cancelled"
                            ? t("barberSchedule.cancelled")
                            : t("barberSchedule.blocked"),
                  })}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredAppointments.map((booking, idx) => (
              <ScheduleCard
                key={booking.id}
                booking={booking}
                onChangeStatus={(status) => statusMutation.mutate({ bookingId: booking.id, status })}
                loading={statusMutation.isPending && statusMutation.variables?.bookingId === booking.id}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
  bgColor,
  textColor,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-md shadow-slate-900/5 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity group-hover:opacity-5`} />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor} ${textColor} shadow-md`}>
          {icon}
        </div>
      </div>
      
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${color} transition-all duration-300 group-hover:w-full`} />
    </div>
  );
}

// Schedule Card Component
function ScheduleCard({
  booking,
  onChangeStatus,
  loading,
  index,
}: {
  booking: Booking;
  onChangeStatus: (status: BookingStatus) => void;
  loading: boolean;
  index: number;
}) {
  const { t } = useTranslation();
  const isCompleted = booking.status === "completed";
  const isPending = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed";
  const isCancelled = booking.status === "cancelled";
  const isBlocked = booking.status === "blocked";

  return (
    <div
      className="group animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-900/5 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
        {/* Status Badge */}
        <div className="absolute right-4 top-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700"
                : isPending
                  ? "bg-sky-50 text-sky-700"
                  : isBlocked
                    ? "bg-slate-100 text-slate-700"
                  : isCancelled
                    ? "bg-rose-50 text-rose-700"
                    : "bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isCompleted
                  ? "bg-emerald-500"
                  : isPending
                    ? "bg-sky-500"
                    : isBlocked
                      ? "bg-slate-500"
                    : isCancelled
                      ? "bg-rose-500"
                      : "bg-amber-500"
              }`}
            />
            {isCompleted && t("barberSchedule.completed")}
            {isPending && t("barberSchedule.pendingApproval")}
            {isConfirmed && t("barberSchedule.confirmed")}
            {isCancelled && t("barberSchedule.cancelled")}
            {isBlocked && t("barberSchedule.blocked")}
          </span>
        </div>

        {/* Client Info */}
        <div className="pr-24">
          <h3 className="text-xl font-black text-slate-900">
            {booking.client_name}
          </h3>
          <p className="mt-1 font-mono text-sm text-slate-400">
            #{booking.booking_code}
          </p>
        </div>

        {/* Details */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="rounded-lg bg-amber-50 p-2">
              <HiMiniClock className="h-4 w-4 text-amber-500" />
            </div>
            <span className="font-medium">
              {formatDisplayTime(booking.appointment_time)}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-600">
            <div className="rounded-lg bg-amber-50 p-2">
              <HiMiniPhone className="h-4 w-4 text-amber-500" />
            </div>
            <span className="font-medium">{booking.client_phone}</span>
          </div>
        </div>

        {/* Action Button */}
        {isCompleted || isCancelled ? (
          <div className={`mt-6 flex items-center gap-2 rounded-xl px-4 py-3 ${
            isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          }`}>
            {isCompleted ? <HiMiniCheckCircle className="h-5 w-5" /> : <HiMiniXCircle className="h-5 w-5" />}
            <span className="text-sm font-bold">
              {isCompleted ? t("barberSchedule.serviceCompleted") : t("barberSchedule.serviceCancelled")}
            </span>
          </div>
        ) : (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {isPending && (
              <button
                type="button"
                onClick={() => onChangeStatus("confirmed")}
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 disabled:opacity-50"
              >
                <HiMiniCheckCircle className="h-5 w-5" />
                {loading ? t("common.saving") : t("barberSchedule.confirmBooking")}
              </button>
            )}
            {isConfirmed && (
              <button
                type="button"
                onClick={() => onChangeStatus("completed")}
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 disabled:opacity-50"
              >
                <HiMiniCheckCircle className="h-5 w-5" />
                {loading ? t("barberSchedule.completing") : t("barberSchedule.completeService")}
              </button>
            )}
            {isBlocked ? (
              <button
                type="button"
                onClick={() => onChangeStatus("cancelled")}
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                <HiMiniXCircle className="h-5 w-5" />
                {t("barberSchedule.unblockTime")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onChangeStatus("cancelled")}
                disabled={loading}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white text-sm font-bold text-rose-600 shadow-sm transition-all hover:bg-rose-50 disabled:opacity-50"
              >
                <HiMiniXCircle className="h-5 w-5" />
                {t("barberSchedule.rejectBooking")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
