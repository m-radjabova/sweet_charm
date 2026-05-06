import { useEffect, useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HiMiniCalendarDays,
  HiMiniCheckBadge,
  HiMiniChevronRight,
  HiMiniCog6Tooth,
  HiMiniClock,
  HiMiniPhone,
  HiMiniSparkles,
  HiMiniUsers,
  HiMiniChartBar,
  HiMiniBolt,
  HiMiniArrowTopRightOnSquare,
  HiMiniXCircle,
  HiOutlineBell,
  HiOutlineBellSlash,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../api/auth";
import { createBarberBookingsSocket, getBarberDashboard, updateBookingStatus } from "../../api/bookings";
import { getMyTelegramLink, refreshMyTelegramLink, sendTelegramPromotion } from "../../api/telegram";
import PromotionComposer from "../../components/PromotionComposer";
import useContextPro from "../../hooks/useContextPro";
import { formatDisplayDate, formatDisplayTime, getTodayIsoDate } from "../home/bookingUtils";
import type { BookingStatus } from "../../types/types";

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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { state } = useContextPro();

  const dashboardQuery = useQuery({
    queryKey: ["barber-dashboard", today],
    queryFn: () => getBarberDashboard(today),
  });

  useEffect(() => {
    if (!state.user?.id) return;

    const socket = createBarberBookingsSocket();
    if (!socket) return;

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "booking.created" || payload?.type === "booking.status_updated") {
          void queryClient.invalidateQueries({ queryKey: ["barber-dashboard"] });
          void queryClient.invalidateQueries({ queryKey: ["barber-bookings"] });
          if (payload.type === "booking.created") {
            toast.info(t("barberDashboard.toast.newBooking"), { position: "top-right", autoClose: 3000 });
          }
        }
      } catch {
        void queryClient.invalidateQueries({ queryKey: ["barber-dashboard"] });
      }
    };

    return () => {
      socket.close();
    };
  }, [queryClient, state.user?.id]);
  const telegramQuery = useQuery({
    queryKey: ["telegram-link", state.user?.id],
    queryFn: getMyTelegramLink,
    enabled: Boolean(state.user?.id),
    refetchInterval: (query) => (query.state.data?.connected ? false : 5000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const statusMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: BookingStatus }) =>
      updateBookingStatus(bookingId, status),
    onSuccess: async (booking) => {
      const toastKey =
        booking.status === "confirmed"
          ? "barberDashboard.toast.confirmed"
          : booking.status === "cancelled"
            ? "barberDashboard.toast.cancelled"
            : "barberDashboard.toast.completed";
      toast.success(t(toastKey));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["barber-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["barber-bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["barber-availability"] }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("barberDashboard.toast.error")));
    },
  });
  const refreshTelegramMutation = useMutation({
    mutationFn: refreshMyTelegramLink,
    onSuccess: async () => {
      toast.success(t("barberDashboard.telegramLinkRefreshed"));
      await queryClient.invalidateQueries({ queryKey: ["telegram-link", state.user?.id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("barberDashboard.telegramLinkError")));
    },
  });
  const promotionMutation = useMutation({
    mutationFn: sendTelegramPromotion,
    onSuccess: async (data) => {
      toast.success(
        t("barberDashboard.promotionSent", {
          delivered: data.delivered_recipients,
          failed: data.failed_recipients ?? 0,
        }),
      );
      await queryClient.invalidateQueries({ queryKey: ["telegram-link", state.user?.id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("barberDashboard.promotionError")));
    },
  });

  const dashboard = dashboardQuery.data;
  const appointments = dashboard?.appointments ?? [];
  const nextBooking = dashboard?.next_booking ?? null;

  const progress = useMemo(() => {
    if (!dashboard?.stats.total) return 0;
    return Math.round(dashboard.stats.completion_ratio * 100);
  }, [dashboard]);

  const isLoading = dashboardQuery.isLoading;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#fde68a_0%,_#f8fafc_35%,_#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <div className="pointer-events-none absolute" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative">
                {state.user?.avatar ? (
                  <img
                    src={state.user.avatar}
                    alt={state.user.full_name}
                    className="h-16 w-16 rounded-2xl object-cover shadow-md ring-4 ring-slate-100 sm:h-20 sm:w-20"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-black text-white shadow-md ring-4 ring-slate-100 sm:h-20 sm:w-20">
                    {getInitials(state.user?.full_name ?? "B")}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 ring-2 ring-white">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-amber-600">
                  {t("barberDashboard.greeting")}
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {state.user?.full_name?.split(" ")[0] ?? t("roles.barber")}
                </h1>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  <HiMiniSparkles className="h-3 w-3" />
                  {t("barberDashboard.title")}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm">
                <HiMiniCalendarDays className="h-4 w-4 text-amber-500" />
                {formatDisplayDate(today)}
              </div>
              <button
                type="button"
                onClick={() => navigate("/barber/settings")}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800"
              >
                <HiMiniCog6Tooth className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={t("barberDashboard.statsToday")}
            value={dashboard?.stats.total ?? 0}
            icon={<HiMiniUsers className="h-5 w-5" />}
            color="from-blue-500 to-indigo-600"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            title={t("barberDashboard.awaitingApproval")}
            value={dashboard?.stats.pending ?? 0}
            icon={<HiOutlineBell className="h-5 w-5" />}
            color="from-sky-500 to-blue-600"
            bgColor="bg-sky-50"
            textColor="text-sky-600"
          />
          <StatCard
            title={t("barberDashboard.confirmed")}
            value={dashboard?.stats.confirmed ?? 0}
            icon={<HiMiniClock className="h-5 w-5" />}
            color="from-amber-500 to-orange-600"
            bgColor="bg-amber-50"
            textColor="text-amber-600"
          />
          <StatCard
            title={t("barberDashboard.done")}
            value={dashboard?.stats.completed ?? 0}
            icon={<HiMiniCheckBadge className="h-5 w-5" />}
            color="from-emerald-500 to-teal-600"
            bgColor="bg-emerald-50"
            textColor="text-emerald-600"
          />
        </div>

        <div className="mb-6 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                <HiMiniChartBar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">{t("barberDashboard.dailyProgress")}</h3>
                <p className="text-sm text-slate-500">
                  {t("barberDashboard.completedCount", {
                    completed: dashboard?.stats.completed ?? 0,
                    total: dashboard?.stats.total ?? 0,
                  })}
                </p>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{progress}%</div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-900 via-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(350px,0.8fr)]">
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
              <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-amber-500/20 to-transparent" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-300">
                    <HiOutlineBell className="h-3 w-3" />
                    {t("barberDashboard.nextClient").toUpperCase()}
                  </div>

                  {nextBooking ? (
                    <>
                      <h2 className="mt-4 truncate text-3xl font-black text-white">
                        {nextBooking.client_name}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-white/70">
                          <HiMiniPhone className="h-4 w-4" />
                          <span className="text-sm">{nextBooking.client_phone}</span>
                        </div>
                        <div className="rounded-full bg-amber-500 px-3 py-1 text-sm font-black text-white shadow-lg shadow-amber-500/30">
                          {formatDisplayTime(nextBooking.appointment_time)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-4 text-2xl font-black text-white">
                        {t("barberDashboard.noPendingClients")}
                      </h2>
                      <p className="mt-2 text-sm text-white/60">
                        {t("barberDashboard.noPendingClientsText")}
                      </p>
                    </>
                  )}
                </div>

                {nextBooking && (
                  <button
                    type="button"
                    onClick={() => statusMutation.mutate({ bookingId: nextBooking.id, status: "completed" })}
                    disabled={statusMutation.isPending}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-slate-900 shadow-lg transition hover:bg-amber-50 disabled:opacity-50"
                  >
                    {statusMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                        {t("barberDashboard.completing")}
                      </>
                    ) : (
                      <>
                        <HiMiniCheckBadge className="h-5 w-5" />
                        {t("barberDashboard.completeService")}
                      </>
                    )}
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{t("barberDashboard.todayAppointments")}</h2>
                  <p className="text-sm text-slate-500">
                    {t("barberDashboard.totalAppointments", { count: appointments.length })}
                  </p>
                </div>
                <Link
                  to="/barber/schedule"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  {t("barberDashboard.viewAppointments")}
                  <HiMiniChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-3 w-3 rounded-full bg-slate-200" />
                        <div className="flex-1">
                          <div className="h-5 w-32 rounded bg-slate-200" />
                          <div className="mt-2 h-4 w-20 rounded bg-slate-100" />
                        </div>
                        <div className="h-10 w-24 rounded-lg bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                    <HiOutlineBellSlash className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-900">
                    {t("barberDashboard.noAppointments")}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {t("barberDashboard.noAppointmentsText")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((booking, idx) => {
                    const isCompleted = booking.status === "completed";
                    const isCancelled = booking.status === "cancelled";
                    const isPending = booking.status === "pending";
                    const isConfirmed = booking.status === "confirmed";
                    const isBusy = statusMutation.isPending && statusMutation.variables?.bookingId === booking.id;
                    return (
                      <div
                        key={booking.id}
                        className="animate-in rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 duration-300"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                isCompleted
                                  ? "bg-emerald-400"
                                  : isCancelled
                                    ? "bg-rose-400"
                                    : isPending
                                      ? "bg-sky-400"
                                      : "bg-amber-400"
                              }`}
                            />
                            <div>
                              <p className={`font-black ${isCompleted ? "text-slate-400 line-through" : "text-slate-900"}`}>
                                {booking.client_name}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span>{formatDisplayTime(booking.appointment_time)}</span>
                                <span>{booking.client_phone}</span>
                              </div>
                            </div>
                          </div>

                          {isCompleted || isCancelled ? (
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                              isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            }`}>
                              {isCompleted ? <HiMiniCheckBadge className="h-3 w-3" /> : <HiMiniXCircle className="h-3 w-3" />}
                              {isCompleted ? t("barberDashboard.done") : t("barberDashboard.cancelled")}
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => statusMutation.mutate({ bookingId: booking.id, status: "confirmed" })}
                                  disabled={isBusy}
                                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  {t("barberDashboard.confirmButton")}
                                </button>
                              )}
                              {isConfirmed && (
                                <button
                                  type="button"
                                  onClick={() => statusMutation.mutate({ bookingId: booking.id, status: "completed" })}
                                  disabled={isBusy}
                                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                                >
                                  {t("barberDashboard.completeButton")}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => statusMutation.mutate({ bookingId: booking.id, status: "cancelled" })}
                                disabled={isBusy}
                                className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                              >
                                {t("barberDashboard.rejectButton")}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-sky-600">Telegram</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">{t("barberDashboard.telegram.statusTitle")}</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    telegramQuery.data?.connected
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {telegramQuery.data?.connected
                    ? t("barberDashboard.telegram.connected")
                    : t("barberDashboard.telegram.disconnected")}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">{t("barberDashboard.telegram.recipients")}</p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {telegramQuery.data?.subscribers_count ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">{t("barberDashboard.telegram.realtime")}</p>
                  <p className="mt-2 text-sm font-black text-emerald-600">{t("barberDashboard.telegram.realtimeWorking")}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <button
                  type="button"
                  onClick={() => refreshTelegramMutation.mutate()}
                  disabled={refreshTelegramMutation.isPending}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <HiMiniBolt className="h-4 w-4 text-sky-500" />
                  {refreshTelegramMutation.isPending ? t("common.refreshing") : t("barberDashboard.telegram.refreshLink")}
                </button>
                <Link
                  to="/barber/settings"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  {t("barberDashboard.telegram.settings")}
                  <HiMiniArrowTopRightOnSquare className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <PromotionComposer
              subscribersCount={telegramQuery.data?.subscribers_count ?? 0}
              sending={promotionMutation.isPending}
              onSend={(payload) => promotionMutation.mutateAsync(payload)}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
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
  suffix = "",
}: {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  bgColor: string;
  textColor: string;
  suffix?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg shadow-slate-900/5 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity group-hover:opacity-5`} />
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {value}
            {suffix && <span className="text-lg font-bold text-slate-400">{suffix}</span>}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor} ${textColor} shadow-md`}>
          {icon}
        </div>
      </div>
      
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${color} transition-all duration-300 group-hover:w-full`} />
    </div>
  );
}
