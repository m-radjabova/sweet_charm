import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  HiMiniSparkles,
  HiOutlineArrowRight,
  HiOutlineBell,
  HiOutlineCalendarDays,
  HiOutlineCheckBadge,
  HiOutlineChevronDown,
  HiOutlineClock,
  HiOutlineMagnifyingGlass,
  HiOutlinePaperAirplane,
  HiOutlinePhone,
  HiOutlineTicket,
  HiOutlineXCircle,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../api/auth";
import { cancelMyBooking, createCustomerBookingsSocket, listMyBookings } from "../../api/bookings";
import { getMyTelegramLink, refreshMyTelegramLink } from "../../api/telegram";
import useContextPro from "../../hooks/useContextPro";
import type { Booking, BookingStatus, TelegramLinkInfo } from "../../types/types";
import { maskStoredPhone } from "../../utils/phone";
import { clearStoredConfirmedBooking, formatDisplayDate, formatDisplayTime } from "../home/bookingUtils";

type DashboardTab = "bookings" | "telegram";
type StatusFilter = "all" | BookingStatus;
type SortOrder = "newest" | "oldest";

const statusFilters: StatusFilter[] = ["all", "pending", "confirmed", "completed", "cancelled"];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getStatusConfig(status: BookingStatus) {
  switch (status) {
    case "completed":
      return {
        icon: HiOutlineCheckBadge,
        labelKey: "customerDashboard.status.completed",
        badgeClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      };
    case "cancelled":
      return {
        icon: HiOutlineXCircle,
        labelKey: "customerDashboard.status.cancelled",
        badgeClass: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
      };
    case "confirmed":
      return {
        icon: HiOutlineCheckBadge,
        labelKey: "customerDashboard.status.confirmed",
        badgeClass: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
      };
    case "pending":
      return {
        icon: HiOutlineClock,
        labelKey: "customerDashboard.status.awaitingApproval",
        badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      };
  }
}

function StatCard({
  title,
  value,
  icon,
  active,
  onClick,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group min-h-28 rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? "border-slate-900 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${active ? "text-slate-300" : "text-slate-500"}`}>{title}</p>
          <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition group-hover:scale-105 ${
            active ? "bg-white/15 text-white" : "bg-slate-50 text-slate-600"
          }`}
        >
          {icon}
        </span>
      </div>
    </button>
  );
}

function BookingCard({
  booking,
  cancelling,
  onCancel,
  t,
}: {
  booking: Booking;
  cancelling: boolean;
  onCancel: (bookingId: string) => void;
  t: TFunction;
}) {
  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const canCancel = booking.status === "pending" || booking.status === "confirmed";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-black text-slate-950">{booking.barber_name}</h3>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusConfig.badgeClass}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {t(statusConfig.labelKey)}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs font-semibold text-slate-400">#{booking.booking_code}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancel(booking.id)}
              disabled={cancelling}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
            >
              <HiOutlineXCircle className="h-4 w-4" />
              {cancelling ? t("customerDashboard.cancelling") : t("customerDashboard.cancelBooking")}
            </button>
          )}
          <Link
            to={`/book/success/${booking.booking_code}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            {t("customerDashboard.details")}
            <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <InfoTile icon={<HiOutlineCalendarDays className="h-4 w-4 text-amber-500" />} label={t("common.date")} value={formatDisplayDate(booking.appointment_date)} />
        <InfoTile icon={<HiOutlineClock className="h-4 w-4 text-amber-500" />} label={t("common.time")} value={formatDisplayTime(booking.appointment_time)} />
        <InfoTile icon={<HiOutlinePhone className="h-4 w-4 text-amber-500" />} label={t("customerDashboard.phoneLabel")} value={maskStoredPhone(booking.client_phone)} />
      </div>
    </article>
  );
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl bg-slate-50 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
        <p className="truncate font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function TelegramPanel({
  info,
  loading,
  refreshing,
  onRefresh,
  t,
}: {
  info?: TelegramLinkInfo;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  t: TFunction;
}) {
  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-24 rounded-xl bg-slate-100" />
      </div>
    );
  }

  const connected = Boolean(info?.connected);

  return (
    <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <HiOutlinePaperAirplane className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-xl font-black text-slate-950">{t("customerDashboard.telegramTitle")}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {connected ? t("customerDashboard.telegramConnected") : t("customerDashboard.telegramNotConnected")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-black ${connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                {connected ? t("customerDashboard.telegramStatusConnected") : t("customerDashboard.telegramStatusWaiting")}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                {t("customerDashboard.telegramSubscribers", { count: info?.subscribers_count ?? 0 })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {!connected && info?.deep_link_url && (
            <a
              href={info.deep_link_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-sky-700"
            >
              <HiOutlinePaperAirplane className="h-4 w-4" />
              {t("customerDashboard.telegramOpenBot")}
            </a>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-sky-200 bg-white px-5 text-sm font-black text-sky-700 transition hover:bg-sky-50 disabled:opacity-50"
          >
            {refreshing ? t("common.refreshing") : t("customerDashboard.telegramRefresh")}
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-white/80 p-4 text-sm text-slate-700 ring-1 ring-slate-200">
        <HiOutlineBell className="mr-2 inline h-4 w-4 text-sky-600" />
        {t("customerDashboard.telegramBenefit")}
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const {
    state: { user },
    logout,
  } = useContextPro();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DashboardTab>("bookings");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const bookingsQuery = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: () => listMyBookings(),
    enabled: Boolean(user?.id),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
  });

  const telegramQuery = useQuery({
    queryKey: ["telegram-link", user?.id],
    queryFn: getMyTelegramLink,
    enabled: Boolean(user?.id),
    refetchInterval: (query) => (query.state.data?.connected ? false : 5000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const refreshTelegramMutation = useMutation({
    mutationFn: refreshMyTelegramLink,
    onSuccess: async () => {
      toast.success(t("customerDashboard.telegramRefreshSuccess"));
      await queryClient.invalidateQueries({ queryKey: ["telegram-link", user?.id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("customerDashboard.telegramRefreshError")));
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: cancelMyBooking,
    onSuccess: async () => {
      clearStoredConfirmedBooking();
      toast.success(t("customerDashboard.cancelSuccess"));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["barber-availability"] }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("customerDashboard.cancelError")));
    },
  });

  useEffect(() => {
    if (!user?.id) return;

    const socket = createCustomerBookingsSocket();
    if (!socket) return;

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const booking = payload?.booking as Booking | undefined;
        if (payload?.type !== "booking.created" && payload?.type !== "booking.status_updated") return;

        if (booking) {
          queryClient.setQueryData<Booking[]>(["my-bookings", user.id], (current) => {
            if (!current) return current;
            const exists = current.some((item) => item.id === booking.id);
            return exists ? current.map((item) => (item.id === booking.id ? booking : item)) : [booking, ...current];
          });
          void queryClient.invalidateQueries({ queryKey: ["public-booking", booking.booking_code] });
          void queryClient.invalidateQueries({ queryKey: ["barber-availability", booking.barber_id] });
        }

        void queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      } catch {
        void queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      }
    };

    return () => {
      socket.close();
    };
  }, [queryClient, user?.id]);

  const bookings = useMemo(() => bookingsQuery.data ?? [], [bookingsQuery.data]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "pending").length,
      confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
      completed: bookings.filter((booking) => booking.status === "completed").length,
      cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
    }),
    [bookings],
  );

  const filteredBookings = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return bookings
      .filter((booking) => statusFilter === "all" || booking.status === statusFilter)
      .filter((booking) => {
        if (!normalizedSearch) return true;
        return (
          booking.booking_code.toLowerCase().includes(normalizedSearch) ||
          booking.barber_name.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((left, right) => {
        const leftDate = new Date(`${left.appointment_date}T${left.appointment_time}`).getTime();
        const rightDate = new Date(`${right.appointment_date}T${right.appointment_time}`).getTime();
        return sortOrder === "newest" ? rightDate - leftDate : leftDate - rightDate;
      });
  }, [bookings, searchQuery, sortOrder, statusFilter]);

  const selectedFilterLabel =
    statusFilter === "all" ? t("customerDashboard.filter.all") : t(`customerDashboard.status.${statusFilter === "pending" ? "awaitingApproval" : statusFilter}`);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="h-16 w-16 rounded-xl object-cover ring-4 ring-slate-100" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-950 text-2xl font-black text-white ring-4 ring-slate-100">
                  {getInitials(user?.full_name ?? "U")}
                </div>
              )}
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
                  <HiMiniSparkles className="h-3 w-3" />
                  {t("customerDashboard.customerBadge")}
                </span>
                <h1 className="mt-2 truncate text-2xl font-black text-slate-950 sm:text-3xl">{user?.full_name}</h1>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <HiOutlinePhone className="h-4 w-4" />
                    {maskStoredPhone(user?.phone_number)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <HiOutlineTicket className="h-4 w-4" />
                    {t("customerDashboard.bookingsCount", { count: stats.total })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800"
              >
                {t("customerDashboard.newBooking")}
                <HiOutlineArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-60"
              >
                {isLoggingOut ? t("common.signingOut") : t("home.signOut")}
              </button>
            </div>
          </div>
        </section>

        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <TabButton active={activeTab === "bookings"} onClick={() => setActiveTab("bookings")} icon={<HiOutlineTicket className="h-4 w-4" />}>
            {t("customerDashboard.tabs.bookings")}
          </TabButton>
          <TabButton active={activeTab === "telegram"} onClick={() => setActiveTab("telegram")} icon={<HiOutlinePaperAirplane className="h-4 w-4" />}>
            {t("customerDashboard.tabs.telegram")}
          </TabButton>
        </div>

        {activeTab === "bookings" ? (
          <>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard title={t("customerDashboard.stats.total")} value={stats.total} icon={<HiOutlineTicket className="h-5 w-5" />} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
              <StatCard title={t("customerDashboard.stats.pending")} value={stats.pending} icon={<HiOutlineClock className="h-5 w-5" />} active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} />
              <StatCard title={t("customerDashboard.stats.confirmed")} value={stats.confirmed} icon={<HiOutlineCheckBadge className="h-5 w-5" />} active={statusFilter === "confirmed"} onClick={() => setStatusFilter("confirmed")} />
              <StatCard title={t("customerDashboard.stats.completed")} value={stats.completed} icon={<HiOutlineCheckBadge className="h-5 w-5" />} active={statusFilter === "completed"} onClick={() => setStatusFilter("completed")} />
              <StatCard title={t("customerDashboard.stats.cancelled")} value={stats.cancelled} icon={<HiOutlineXCircle className="h-5 w-5" />} active={statusFilter === "cancelled"} onClick={() => setStatusFilter("cancelled")} />
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">{t("customerDashboard.title")}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t("customerDashboard.subtitle")}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={t("customerDashboard.searchPlaceholder")}
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100 sm:w-72"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={sortOrder}
                      onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                      className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-bold text-slate-700 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100 sm:w-40"
                    >
                      <option value="newest">{t("customerDashboard.sort.newest")}</option>
                      <option value="oldest">{t("customerDashboard.sort.oldest")}</option>
                    </select>
                    <HiOutlineChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                      statusFilter === filter ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter === "all" ? t("customerDashboard.filter.all") : t(`customerDashboard.filter.${filter}`)}
                  </button>
                ))}
              </div>

              {statusFilter !== "all" && (
                <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                  {t("customerDashboard.activeFilter")}: {selectedFilterLabel}
                </div>
              )}

              <div className="space-y-4">
                {bookingsQuery.isLoading ? (
                  [...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
                      <div className="h-6 w-44 rounded bg-slate-200" />
                      <div className="mt-5 grid gap-3 md:grid-cols-3">
                        <div className="h-16 rounded-xl bg-slate-100" />
                        <div className="h-16 rounded-xl bg-slate-100" />
                        <div className="h-16 rounded-xl bg-slate-100" />
                      </div>
                    </div>
                  ))
                ) : filteredBookings.length ? (
                  filteredBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      cancelling={cancelBookingMutation.isPending && cancelBookingMutation.variables === booking.id}
                      onCancel={(bookingId) => cancelBookingMutation.mutate(bookingId)}
                      t={t}
                    />
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <HiOutlineTicket className="mx-auto h-10 w-10 text-slate-400" />
                    <h3 className="mt-4 text-lg font-black text-slate-950">
                      {searchQuery || statusFilter !== "all" ? t("customerDashboard.noResultsTitle") : t("customerDashboard.emptyTitle")}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {searchQuery || statusFilter !== "all" ? t("customerDashboard.noResultsDescription") : t("customerDashboard.emptyDescription")}
                    </p>
                    {searchQuery || statusFilter !== "all" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                        }}
                        className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-black text-white"
                      >
                        {t("customerDashboard.clearFilters")}
                      </button>
                    ) : (
                      <Link to="/" className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-black text-white">
                        {t("customerDashboard.bookNow")}
                        <HiOutlineArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <TelegramPanel
            info={telegramQuery.data}
            loading={telegramQuery.isLoading}
            refreshing={refreshTelegramMutation.isPending}
            onRefresh={() => refreshTelegramMutation.mutate()}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-black transition ${
        active ? "text-slate-950" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon}
      {children}
      {active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-950" />}
    </button>
  );
}
