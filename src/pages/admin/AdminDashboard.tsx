import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  HiMiniArrowTrendingUp,
  HiMiniCalendarDays,
  HiMiniCheckBadge,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniClock,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineUserCircle
} from "react-icons/hi2";
import { listAdminBookings } from "../../api/bookings";
import { getErrorMessage } from "../../api/auth";
import { listBarbers } from "../../api/users";
import { formatDisplayDate, getTodayIsoDate } from "../home/bookingUtils";

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
function MetricCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-10 flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-slate-200"></div>
        <div className="h-6 w-6 rounded bg-slate-200"></div>
      </div>
      <div className="h-12 w-24 rounded bg-slate-200"></div>
      <div className="mt-4 h-6 w-32 rounded bg-slate-200"></div>
      <div className="mt-1 h-4 w-40 rounded bg-slate-200"></div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex justify-around">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-[220px] w-16 rounded-xl bg-slate-200"></div>
            <div className="mt-4 h-4 w-16 rounded bg-slate-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-slate-200"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-slate-200"></div>
                <div className="h-3 w-24 rounded bg-slate-200"></div>
              </div>
            </div>
            <div className="h-5 w-12 rounded bg-slate-200"></div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200"></div>
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon,
  tone,
}: {
  label: string;
  value: number;
  note: string;
  icon: ReactNode;
  tone: "primary" | "light" | "success" | "warning";
}) {
  const toneClass = {
    primary: "border-slate-900 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl",
    light: "border-slate-200 bg-white text-slate-950 shadow-md",
    success: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50 text-slate-950 shadow-md",
    warning: "border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50 text-slate-950 shadow-md",
  } as const;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] ${toneClass[tone]}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="relative">
        <div className="mb-8 flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            tone === "primary" ? "bg-white/10" : "bg-white shadow-sm"
          }`}>
            {icon}
          </div>
          <HiMiniArrowTrendingUp className={`${tone === "primary" ? "text-white/30" : "text-slate-300"} group-hover:-rotate-12 transition-transform`} />
        </div>

        <div className="text-4xl font-black tracking-tight">{value.toLocaleString()}</div>
        <p className={`mt-3 font-bold ${tone === "primary" ? "text-white/90" : "text-slate-800"}`}>{label}</p>
        <p className={`mt-1 text-xs ${tone === "primary" ? "text-white/50" : "text-slate-400"}`}>{note}</p>
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[300px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
      <div className="max-w-sm">
        <HiOutlineChartBar className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-4 text-xl font-black text-slate-700">{title}</h3>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function SectionShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>
          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate());

  const barbersQuery = useQuery({
    queryKey: ["barbers"],
    queryFn: listBarbers,
  });

  const bookingsQuery = useQuery({
    queryKey: ["admin-dashboard-bookings", selectedDate],
    queryFn: () => listAdminBookings({ date: selectedDate }),
  });

  const dashboardData = useMemo(() => {
    const bookings = bookingsQuery.data ?? [];
    const barbers = barbersQuery.data ?? [];

    const barberMap = new Map(
      barbers.map((barber) => [
        barber.id,
        {
          barber,
          total: 0,
          completed: 0,
          pending: 0,
          cancelled: 0,
        },
      ]),
    );

    for (const booking of bookings) {
      const existing = barberMap.get(booking.barber_id) ?? {
        barber: {
          id: booking.barber_id,
          full_name: booking.barber_name,
          email: "",
          role: "barber" as const,
          avatar: booking.barber_avatar ?? null,
          is_active: true,
          created_at: booking.created_at,
          updated_at: booking.created_at,
        },
        total: 0,
        completed: 0,
        pending: 0,
        cancelled: 0,
      };

      existing.total += 1;
      if (booking.status === "completed") existing.completed += 1;
      if (booking.status === "confirmed") existing.pending += 1;
      if (booking.status === "cancelled") existing.cancelled += 1;
      barberMap.set(booking.barber_id, existing);
    }

    const barberPerformance = Array.from(barberMap.values())
      .map((entry) => ({
        ...entry,
        progress: entry.total ? Math.round((entry.completed / entry.total) * 100) : 0,
      }))
      .sort((left, right) => {
        if (right.total !== left.total) return right.total - left.total;
        return right.completed - left.completed;
      });

    const completed = bookings.filter((booking) => booking.status === "completed").length;
    const pending = bookings.filter((booking) => booking.status === "confirmed").length;
    const cancelled = bookings.filter((booking) => booking.status === "cancelled").length;
    const activeBarbers = barbers.filter((barber) => barber.is_active !== false).length;
    const maxChartValue = Math.max(...barberPerformance.flatMap((item) => [item.completed, item.pending]), 0);

    return {
      bookings,
      completed,
      pending,
      cancelled,
      activeBarbers,
      barberPerformance: barberPerformance.slice(0, 5),
      maxChartValue,
    };
  }, [barbersQuery.data, bookingsQuery.data]);

  const isLoading = barbersQuery.isLoading || bookingsQuery.isLoading;
  const errorMessage =
    (barbersQuery.error ? getErrorMessage(barbersQuery.error) : null) ??
    (bookingsQuery.error ? getErrorMessage(bookingsQuery.error) : null);

  const getBarHeight = (value: number, maxValue: number) => {
    if (!value || !maxValue) return 20;
    return Math.max(20, Math.round((value / maxValue) * 180));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {formatDisplayDate(selectedDate)} - Daily Overview
            </p>
          </div>

          {/* Date Picker */}
          <div className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedDate((current) => shiftDate(current, -1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <HiMiniChevronLeft className="text-lg" />
            </button>
            <div className="px-3 text-center min-w-[120px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected</p>
              <p className="text-sm font-bold text-slate-950">{formatDisplayDate(selectedDate)}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate((current) => shiftDate(current, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <HiMiniChevronRight className="text-lg" />
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <MetricCard
                label="Total Bookings"
                value={dashboardData.bookings.length}
                note={`${dashboardData.bookings.length} appointment${dashboardData.bookings.length === 1 ? "" : "s"}`}
                icon={<HiMiniCalendarDays className="text-2xl" />}
                tone="primary"
              />
              <MetricCard
                label="Active Barbers"
                value={dashboardData.activeBarbers}
                note="Available team members"
                icon={<HiOutlineUserGroup className="text-2xl" />}
                tone="light"
              />
              <MetricCard
                label="Completed"
                value={dashboardData.completed}
                note={dashboardData.bookings.length ? `${Math.round((dashboardData.completed / dashboardData.bookings.length) * 100)}% rate` : "No data"}
                icon={<HiMiniCheckBadge className="text-2xl" />}
                tone="success"
              />
              <MetricCard
                label="Pending"
                value={dashboardData.pending}
                note={`${dashboardData.cancelled} cancelled`}
                icon={<HiMiniClock className="text-2xl" />}
                tone="warning"
              />
            </>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && !isLoading && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700">
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Charts Section */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Barbers Chart */}
          <SectionShell
            title="Bookings by Barber"
            subtitle="Completed vs Pending"
          >
            {isLoading ? (
              <ChartSkeleton />
            ) : dashboardData.barberPerformance.length === 0 ? (
              <EmptyState
                title="No bookings today"
                description="Bookings will appear here when customers schedule appointments"
              />
            ) : (
              <div>
                <div className="grid min-h-[280px] grid-cols-[40px_1fr] gap-3">
                  <div className="flex flex-col justify-between py-2 text-xs font-semibold text-slate-400">
                    <span>{dashboardData.maxChartValue}</span>
                    <span>{Math.round(dashboardData.maxChartValue * 0.75)}</span>
                    <span>{Math.round(dashboardData.maxChartValue * 0.5)}</span>
                    <span>{Math.round(dashboardData.maxChartValue * 0.25)}</span>
                    <span>0</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {dashboardData.barberPerformance.slice(0, 3).map((entry) => (
                      <div key={entry.barber.id} className="flex flex-col items-center">
                        <div className="flex h-[200px] items-end gap-2">
                          <div 
                            className="w-8 rounded-t-lg bg-gradient-to-t from-slate-800 to-slate-700 transition-all duration-500 hover:w-10"
                            style={{ height: getBarHeight(entry.completed, dashboardData.maxChartValue) }}
                          />
                          <div 
                            className="w-8 rounded-t-lg bg-slate-200 transition-all duration-500 hover:w-10"
                            style={{ height: getBarHeight(entry.pending, dashboardData.maxChartValue) }}
                          />
                        </div>
                        <p className="mt-3 text-sm font-bold text-slate-600">
                          {entry.barber.full_name.split(" ")[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                    <span className="h-3 w-3 rounded-full bg-slate-800" />
                    Completed ({dashboardData.completed})
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-400">
                    <span className="h-3 w-3 rounded-full bg-slate-200" />
                    Pending ({dashboardData.pending})
                  </span>
                </div>
              </div>
            )}
          </SectionShell>

          {/* Performance List */}
          <SectionShell
            title="Barber Performance"
            subtitle="Daily completion progress"
            action={
              <Link 
                to="/admin/barbers" 
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <HiOutlineUserCircle className="h-4 w-4" />
                Manage
              </Link>
            }
          >
            {isLoading ? (
              <PerformanceSkeleton />
            ) : dashboardData.barberPerformance.length === 0 ? (
              <EmptyState
                title="No barber activity"
                description="Performance metrics will appear when bookings are made"
              />
            ) : (
              <div className="space-y-5">
                {dashboardData.barberPerformance.map((entry) => (
                  <div key={entry.barber.id} className="group">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        {entry.barber.avatar ? (
                          <img 
                            src={entry.barber.avatar} 
                            alt={entry.barber.full_name} 
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-600 text-sm font-black text-white">
                            {getInitials(entry.barber.full_name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">
                            {entry.barber.full_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {entry.pending} pending • {entry.cancelled} cancelled
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-lg font-bold text-slate-700">
                        {entry.completed}/{entry.total}
                      </span>
                    </div>

                    <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-slate-800 to-slate-700 transition-all duration-700 group-hover:from-slate-700 group-hover:to-slate-600"
                        style={{ width: `${Math.max(entry.progress, entry.total ? 4 : 0)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right text-xs font-semibold text-slate-500">
                      {entry.progress}% completion
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionShell>
        </div>
      </div>
    </div>
  );
}
