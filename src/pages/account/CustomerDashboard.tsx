import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  HiOutlineCalendarDays, 
  HiOutlineClock, 
  HiOutlinePhone, 
  HiOutlineTicket,
  HiOutlineArrowRight,
  HiOutlineCheckBadge,
  HiOutlineXCircle,
  HiOutlineClock as HiOutlinePending,
  HiMiniSparkles
} from "react-icons/hi2";
import { listMyBookings } from "../../api/bookings";
import { refreshMyTelegramLink, getMyTelegramLink } from "../../api/telegram";
import useContextPro from "../../hooks/useContextPro";
import { formatDisplayDate, formatDisplayTime } from "../home/bookingUtils";
import { maskStoredPhone } from "../../utils/phone";
import TelegramConnectCard from "../../components/TelegramConnectCard";

function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return {
        icon: HiOutlineCheckBadge,
        label: "Yakunlangan",
        color: "emerald",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-200"
      };
    case "cancelled":
      return {
        icon: HiOutlineXCircle,
        label: "Bekor qilingan",
        color: "rose",
        bgColor: "bg-rose-50",
        textColor: "text-rose-700",
        borderColor: "border-rose-200"
      };
    default:
      return {
        icon: HiOutlinePending,
        label: "Kutilmoqda",
        color: "amber",
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-200"
      };
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CustomerDashboard() {
  const {
    state: { user },
    logout,
  } = useContextPro();
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: () => listMyBookings(),
    enabled: Boolean(user?.id),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
  });

  const bookings = bookingsQuery.data ?? [];
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
      await queryClient.invalidateQueries({ queryKey: ["telegram-link", user?.id] });
    },
  });
  const nextBooking = useMemo(
    () => bookings.find((booking) => booking.status === "confirmed") ?? bookings[0] ?? null,
    [bookings],
  );

  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === "completed").length;
    const pending = bookings.filter(b => b.status === "confirmed").length;
    const cancelled = bookings.filter(b => b.status === "cancelled").length;
    return { total, completed, pending, cancelled };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-300/20 to-orange-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-slate-400/10 to-indigo-400/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-300/5 to-rose-300/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header Profile Card */}
        <div className="group relative mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
          
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.full_name} 
                  className="h-16 w-16 rounded-xl object-cover shadow-lg ring-4 ring-white" 
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-2xl font-black text-white shadow-lg ring-4 ring-white">
                  {getInitials(user?.full_name ?? "U")}
                </div>
              )}
              
              <div>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600 mb-2">
                  <HiMiniSparkles className="h-3 w-3" />
                  Mijoz
                </div>
                <h1 className="text-2xl font-black text-slate-900 lg:text-3xl">
                  {user?.full_name}
                </h1>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <HiOutlinePhone className="h-3.5 w-3.5" />
                    {maskStoredPhone(user?.phone_number)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <HiOutlineTicket className="h-3.5 w-3.5" />
                    {stats.total} ta bron
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-md transition-all hover:shadow-lg hover:scale-105"
              >
                Yangi bron
                <HiOutlineArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Jami bronlar"
            value={stats.total}
            icon={<HiOutlineTicket className="h-5 w-5" />}
            color="from-blue-500 to-indigo-600"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            title="Yakunlangan"
            value={stats.completed}
            icon={<HiOutlineCheckBadge className="h-5 w-5" />}
            color="from-emerald-500 to-teal-600"
            bgColor="bg-emerald-50"
            textColor="text-emerald-600"
          />
          <StatCard
            title="Kutilayotgan"
            value={stats.pending}
            icon={<HiOutlinePending className="h-5 w-5" />}
            color="from-amber-500 to-orange-600"
            bgColor="bg-amber-50"
            textColor="text-amber-600"
          />
          <StatCard
            title="Bekor qilingan"
            value={stats.cancelled}
            icon={<HiOutlineXCircle className="h-5 w-5" />}
            color="from-rose-500 to-pink-600"
            bgColor="bg-rose-50"
            textColor="text-rose-600"
          />
        </div>

        <div className="mb-8">
          <TelegramConnectCard
            info={telegramQuery.data}
            role={user?.role ?? "user"}
            loading={telegramQuery.isLoading}
            refreshing={refreshTelegramMutation.isPending}
            onRefreshLink={() => refreshTelegramMutation.mutate()}
          />
        </div>

        {/* Next Booking Highlight */}
        {nextBooking && (
          <div className="group relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-6 shadow-lg transition-all hover:shadow-xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <HiMiniSparkles className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                  Navbatdagi bron
                </span>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-600/70">Sartarosh</p>
                  <p className="mt-1 text-xl font-black text-slate-900">
                    {nextBooking.barber_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-600/70">Sana</p>
                  <p className="mt-1 text-xl font-black text-slate-900">
                    {formatDisplayDate(nextBooking.appointment_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-600/70">Vaqt</p>
                  <p className="mt-1 text-xl font-black text-slate-900">
                    {formatDisplayTime(nextBooking.appointment_time)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 border border-slate-100">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Bronlarim</h2>
              <p className="mt-1 text-sm text-slate-500">
                Barcha bron qilgan uchrashuvlaringiz
              </p>
            </div>
            {bookings.length > 0 && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                Jami: {bookings.length}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {bookingsQuery.isLoading ? (
              // Skeleton Loaders
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="h-6 w-48 rounded bg-slate-200"></div>
                      <div className="h-4 w-32 rounded bg-slate-200"></div>
                    </div>
                    <div className="h-10 w-32 rounded-lg bg-slate-200"></div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="h-16 rounded-lg bg-slate-100"></div>
                    <div className="h-16 rounded-lg bg-slate-100"></div>
                    <div className="h-16 rounded-lg bg-slate-100"></div>
                  </div>
                </div>
              ))
            ) : bookings.length > 0 ? (
              bookings.map((booking, idx) => {
                const statusConfig = getStatusConfig(booking.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={booking.id}
                    className="group animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-black text-slate-900">
                            {booking.barber_name}
                          </h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-400 font-mono">
                          #{booking.booking_code}
                        </p>
                      </div>
                      
                      <Link
                        to={`/book/success/${booking.booking_code}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-slate-700 hover:scale-105"
                      >
                        Batafsil
                        <HiOutlineArrowRight className="h-4 w-4" />
                      </Link>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                        <div className="rounded-lg bg-white p-2 shadow-sm">
                          <HiOutlineCalendarDays className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">Sana</p>
                          <p className="font-bold text-slate-900">
                            {formatDisplayDate(booking.appointment_date)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                        <div className="rounded-lg bg-white p-2 shadow-sm">
                          <HiOutlineClock className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">Vaqt</p>
                          <p className="font-bold text-slate-900">
                            {formatDisplayTime(booking.appointment_time)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                        <div className="rounded-lg bg-white p-2 shadow-sm">
                          <HiOutlinePhone className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase text-slate-400">Telefon</p>
                          <p className="font-bold text-slate-900">
                            {maskStoredPhone(booking.client_phone)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Empty State
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                  <HiOutlineTicket className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Hech qanday bron topilmadi
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Hali hech qanday bron qilmagansiz
                </p>
                <Link
                  to="/"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
                >
                  Bron qilish
                  <HiOutlineArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
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
          animation: fadeIn 0.4s ease-out forwards;
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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-md shadow-slate-900/5 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity group-hover:opacity-5`} />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor} ${textColor} shadow-md`}>
          {icon}
        </div>
      </div>
      
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${color} transition-all duration-300 group-hover:w-full`} />
    </div>
  );
}
