import { useMemo, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  HiMiniChartBar,
  HiOutlineBell,
  HiOutlineBellSlash,
  HiMiniArrowLeft,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../api/auth";
import { getBarberDashboard, updateBookingStatus } from "../../api/bookings";
import { getMyTelegramLink, refreshMyTelegramLink, sendTelegramPromotion } from "../../api/telegram";
import PromotionComposer from "../../components/PromotionComposer";
import TelegramConnectCard from "../../components/TelegramConnectCard";
import useContextPro from "../../hooks/useContextPro";
import { formatDisplayDate, formatDisplayTime, getTodayIsoDate } from "../home/bookingUtils";

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
  const { logout, state } = useContextPro();

  const dashboardQuery = useQuery({
    queryKey: ["barber-dashboard", today],
    queryFn: () => getBarberDashboard(today),
  });
  const telegramQuery = useQuery({
    queryKey: ["telegram-link", state.user?.id],
    queryFn: getMyTelegramLink,
    enabled: Boolean(state.user?.id),
    refetchInterval: (query) => (query.state.data?.connected ? false : 5000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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
  const refreshTelegramMutation = useMutation({
    mutationFn: refreshMyTelegramLink,
    onSuccess: async () => {
      toast.success("Telegram ulanish havolasi yangilandi");
      await queryClient.invalidateQueries({ queryKey: ["telegram-link", state.user?.id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Telegram havolasini yangilab bo'lmadi"));
    },
  });
  const promotionMutation = useMutation({
    mutationFn: sendTelegramPromotion,
    onSuccess: async (data) => {
      toast.success(
        `${data.delivered_recipients} ta mijozga yuborildi${data.failed_recipients ? `, ${data.failed_recipients} ta yuborilmadi` : ""}`,
      );
      await queryClient.invalidateQueries({ queryKey: ["telegram-link", state.user?.id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Aksiyani yuborib bo'lmadi"));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-300/20 to-orange-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-slate-400/10 to-indigo-400/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-300/5 to-rose-300/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {state.user?.avatar ? (
                  <img
                    src={state.user.avatar}
                    alt={state.user.full_name}
                    className="h-16 w-16 rounded-2xl object-cover shadow-xl ring-4 ring-white sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-2xl font-black text-white shadow-xl ring-4 ring-white sm:h-20 sm:w-20 lg:h-24 lg:w-24 lg:text-3xl">
                    {getInitials(state.user?.full_name ?? "B")}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1 ring-2 ring-white">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-amber-600 sm:text-base">
                  {t("barberDashboard.greeting")}
                </p>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  {state.user?.full_name?.split(" ")[0] ?? t("roles.barber")}
                </h1>
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 sm:mt-3 sm:px-4 sm:py-1.5">
                  <HiMiniSparkles className="h-3 w-3" />
                  {t("barberDashboard.title")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                          onClick={() => navigate("/")}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-md transition-all hover:scale-105 hover:shadow-lg sm:h-12 sm:w-12"
              >
                          <HiMiniArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        </button>
              <button
                type="button"
                onClick={() => navigate("/barber/settings")}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-md transition-all hover:scale-105 hover:shadow-lg sm:h-12 sm:w-12"
              >
                <HiMiniCog6Tooth className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-500 shadow-md transition-all hover:scale-105 hover:shadow-lg sm:h-12 sm:w-12"
              >
                <HiMiniArrowLeftOnRectangle className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              
            </div>
          </div>

          {/* Date Badge */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
            <HiMiniCalendarDays className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-600">
              {formatDisplayDate(today)}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Bugungi qabul"
            value={dashboard?.stats.total ?? 0}
            icon={<HiMiniUsers className="h-5 w-5" />}
            color="from-blue-500 to-indigo-600"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            title="Yakunlangan"
            value={dashboard?.stats.completed ?? 0}
            icon={<HiMiniCheckBadge className="h-5 w-5" />}
            color="from-emerald-500 to-teal-600"
            bgColor="bg-emerald-50"
            textColor="text-emerald-600"
          />
          <StatCard
            title="Kutilayotgan"
            value={dashboard?.stats.pending ?? 0}
            icon={<HiMiniClock className="h-5 w-5" />}
            color="from-amber-500 to-orange-600"
            bgColor="bg-amber-50"
            textColor="text-amber-600"
          />
        </div>

        {/* Progress Section */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 border border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                <HiMiniChartBar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Kunlik progress</h3>
                <p className="text-sm text-slate-500">
                  {dashboard?.stats.completed ?? 0} / {dashboard?.stats.total ?? 0} xizmat yakunlangan
                </p>
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">{progress}%</div>
          </div>
          <div className="mt-4 h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <TelegramConnectCard
            info={telegramQuery.data}
            role={state.user?.role ?? "barber"}
            loading={telegramQuery.isLoading}
            refreshing={refreshTelegramMutation.isPending}
            onRefreshLink={() => refreshTelegramMutation.mutate()}
          />
          <PromotionComposer
            subscribersCount={telegramQuery.data?.subscribers_count ?? 0}
            sending={promotionMutation.isPending}
            onSend={(payload) => promotionMutation.mutateAsync(payload)}
          />
        </div>

        {/* Next Client Section - Premium Card */}
        <div className="group relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 shadow-2xl lg:p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-300">
                <HiOutlineBell className="h-3 w-3" />
                NAVBATDAGI MIJOZ
              </div>
              
              {nextBooking ? (
                <>
                  <h2 className="mt-4 text-3xl font-black text-white lg:text-4xl">
                    {nextBooking.client_name}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-white/70">
                      <HiMiniPhone className="h-4 w-4" />
                      <span className="text-sm">{nextBooking.client_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-500 px-3 py-1 text-sm font-black text-white">
                        {formatDisplayTime(nextBooking.appointment_time)}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mt-4 text-2xl font-black text-white lg:text-3xl">
                    Bugun boshqa mijoz yo‘q
                  </h2>
                  <p className="mt-2 text-white/60">
                    Bugungi qabul yakunlandi. Dam olish vaqti!
                  </p>
                </>
              )}
            </div>

            {nextBooking && (
              <button
                type="button"
                onClick={() => completeMutation.mutate(nextBooking.id)}
                disabled={completeMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-black text-slate-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 lg:px-8 lg:py-4"
              >
                {completeMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    Yakunlanmoqda
                  </>
                ) : (
                  <>
                    <HiMiniCheckBadge className="h-5 w-5" />
                    Xizmatni yakunlash
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Schedule Button */}
        <button
          type="button"
          onClick={() => navigate("/barber/schedule")}
          className="group mb-8 flex w-full items-center justify-between rounded-2xl bg-white p-5 shadow-xl shadow-slate-900/5 border border-slate-100 transition-all hover:shadow-2xl hover:scale-[1.01]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg transition-transform group-hover:scale-110">
              <HiMiniCalendarDays className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="text-lg font-black text-slate-900">Kunlik jadval</p>
              <p className="text-sm text-slate-500">Barcha qabullarni ko‘rish va boshqarish</p>
            </div>
          </div>
          <HiMiniChevronRight className="h-6 w-6 text-slate-300 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Appointments List */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Bugungi qabullar</h2>
              <p className="text-sm text-slate-500">
                Jami {appointments.length} ta qabul
              </p>
            </div>
            <Link
              to="/barber/schedule"
              className="text-sm font-bold text-amber-600 transition hover:text-amber-700"
            >
              Hammasini ko‘rish →
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-md">
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
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <HiOutlineBellSlash className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900">
                Bugun qabul yo‘q
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Bugungi kunga hech qanday qabul mavjud emas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((booking, idx) => {
                const isCompleted = booking.status === "completed";
                return (
                  <div
                    key={booking.id}
                    className="group animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            isCompleted ? "bg-emerald-400" : "bg-amber-400"
                          }`}
                        />
                        <div>
                          <p
                            className={`font-black ${
                              isCompleted ? "text-slate-400 line-through" : "text-slate-900"
                            }`}
                          >
                            {booking.client_name}
                          </p>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="text-sm text-slate-500">
                              {formatDisplayTime(booking.appointment_time)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                          <HiMiniCheckBadge className="h-3 w-3" />
                          Yakunlangan
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => completeMutation.mutate(booking.id)}
                          disabled={completeMutation.isPending}
                          className="rounded-lg bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-2 text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                        >
                          Yakunlash
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
