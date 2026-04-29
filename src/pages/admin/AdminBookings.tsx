import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiMiniCalendarDays,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniMagnifyingGlass,
  HiMiniFunnel,
  HiMiniArrowPath,
  HiOutlineCheckBadge,
  HiOutlineClock,
  HiOutlineXMark,
  HiOutlinePhone,
} from "react-icons/hi2";
import { listAdminBookings, listPublicBarbers } from "../../api/bookings";
import { formatDisplayDate, formatDisplayTime, getTodayIsoDate } from "../home/bookingUtils";
import { toast } from "react-toastify";

function shiftDate(date: string, offset: number) {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + offset);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const filterTabs = [
  { id: "All", label: "All Bookings", icon: HiMiniCalendarDays, color: "slate", bgColor: "bg-slate-700", textColor: "text-white", hoverBg: "hover:bg-slate-800" },
  { id: "confirmed", label: "Pending", icon: HiOutlineClock, color: "amber", bgColor: "bg-amber-500", textColor: "text-white", hoverBg: "hover:bg-amber-600" },
  { id: "completed", label: "Completed", icon: HiOutlineCheckBadge, color: "emerald", bgColor: "bg-emerald-500", textColor: "text-white", hoverBg: "hover:bg-emerald-600" },
  { id: "cancelled", label: "Cancelled", icon: HiOutlineXMark, color: "rose", bgColor: "bg-rose-500", textColor: "text-white", hoverBg: "hover:bg-rose-600" },
] as const;

const tabAccentClasses = {
  slate: { icon: "text-slate-500", badge: "bg-slate-100 text-slate-700" },
  amber: { icon: "text-amber-500", badge: "bg-amber-100 text-amber-700" },
  emerald: { icon: "text-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  rose: { icon: "text-rose-500", badge: "bg-rose-100 text-rose-700" },
} as const;

// Skeleton Components
function BookingsTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 border-b border-slate-200 px-6 py-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-5 w-24 rounded bg-slate-200"></div>
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border-b border-slate-100 px-6 py-5">
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <div className="space-y-2">
              <div className="h-5 w-32 rounded bg-slate-200"></div>
              <div className="h-4 w-24 rounded bg-slate-200"></div>
            </div>
            <div className="h-5 w-28 rounded bg-slate-200"></div>
            <div className="space-y-2">
              <div className="h-5 w-20 rounded bg-slate-200"></div>
              <div className="h-4 w-28 rounded bg-slate-200"></div>
            </div>
            <div className="h-8 w-24 rounded-full bg-slate-200"></div>
            <div className="h-5 w-16 rounded bg-slate-200"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend }: { 
  label: string; 
  value: number; 
  icon: any; 
  color: string;
  trend?: string;
}) {
  const colorClasses = {
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    rose: "bg-rose-50 text-rose-600 border-rose-200",
  };

  return (
    <div className={`rounded-xl border ${colorClasses[color as keyof typeof colorClasses]} p-4 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className={`rounded-lg bg-white p-2 shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-2xl font-black">{value}</span>
      </div>
      <p className="mt-2 text-sm font-semibold">{label}</p>
      {trend && <p className="mt-1 text-xs opacity-70">{trend}</p>}
    </div>
  );
}

export default function AdminBookings() {
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate());
  const [query, setQuery] = useState("");
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof filterTabs)[number]["id"]>("All");
  const [showFilters, setShowFilters] = useState(false);

  const barbersQuery = useQuery({
    queryKey: ["public-barbers"],
    queryFn: () => listPublicBarbers(),
  });

  const bookingsQuery = useQuery({
    queryKey: ["admin-bookings", selectedDate, selectedBarberId, activeTab, query],
    queryFn: () =>
      listAdminBookings({
        date: selectedDate,
        barber_id: selectedBarberId || undefined,
        status: activeTab === "All" ? undefined : activeTab,
        search: query || undefined,
      }),
  });

  const bookings = bookingsQuery.data ?? [];
  const isLoading = bookingsQuery.isLoading;

  const stats = useMemo(() => {
    const completed = bookings.filter((item) => item.status === "completed").length;
    const confirmed = bookings.filter((item) => item.status === "confirmed").length;
    const cancelled = bookings.filter((item) => item.status === "cancelled").length;
    return {
      total: bookings.length,
      completed,
      confirmed,
      cancelled,
    };
  }, [bookings]);

  const handleRefresh = () => {
    bookingsQuery.refetch();
    toast.info("Refreshing bookings...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 lg:text-5xl">
              Bookings
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Monitor and manage all appointments
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            className="group inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:shadow-md"
          >
            <HiMiniArrowPath className={`h-4 w-4 transition-transform group-hover:rotate-180 ${bookingsQuery.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Date Picker & Stats */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Date Navigation */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSelectedDate((current) => shiftDate(current, -1))}
                className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-all hover:border-slate-800 hover:bg-slate-800 hover:text-white"
              >
                <HiMiniChevronLeft className="text-xl transition-transform group-hover:-translate-x-0.5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 p-2">
                  <HiMiniCalendarDays className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Selected Date</p>
                  <p className="text-lg font-black text-slate-950">{formatDisplayDate(selectedDate)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDate((current) => shiftDate(current, 1))}
                className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-all hover:border-slate-800 hover:bg-slate-800 hover:text-white"
              >
                <HiMiniChevronRight className="text-xl transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Total Bookings" value={stats.total} icon={HiMiniCalendarDays} color="slate" />
              <StatCard label="Completed" value={stats.completed} icon={HiOutlineCheckBadge} color="emerald" />
              <StatCard label="Pending" value={stats.confirmed} icon={HiOutlineClock} color="amber" />
              <StatCard label="Cancelled" value={stats.cancelled} icon={HiOutlineXMark} color="rose" />
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mt-6 space-y-4">
          {/* Search and Quick Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <HiMiniMagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by client name, phone number, or booking ID..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-800 focus:shadow-md"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:shadow-md"
            >
              <HiMiniFunnel className="h-4 w-4" />
              Filters
              {(selectedBarberId || activeTab !== "All") && (
                <span className="ml-1 rounded-full bg-slate-800 px-1.5 py-0.5 text-xs text-white">1</span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="animate-slideDown rounded-xl border border-slate-200 bg-white p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <select
                  value={selectedBarberId}
                  onChange={(event) => setSelectedBarberId(event.target.value)}
                  className="h-12 rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none focus:border-slate-800"
                >
                  <option value="">All Barbers</option>
                  {(barbersQuery.data ?? []).map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.full_name}
                    </option>
                  ))}
                </select>
                
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      setSelectedBarberId("");
                      setActiveTab("All");
                      setQuery("");
                    }}
                    className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status Tabs - FIXED VERSION */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = tab.id === "All" ? stats.total : stats[tab.id as keyof typeof stats];
              
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200
                    ${isActive 
                      ? `${tab.bgColor} ${tab.textColor} shadow-md scale-105` 
                      : `bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:shadow-sm hover:scale-[1.02]`
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : tabAccentClasses[tab.color].icon}`} />
                  {tab.label}
                  {!isActive && count > 0 && tab.id !== "All" && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-xs font-bold ${tabAccentClasses[tab.color].badge}`}>
                      {count}
                    </span>
                  )}
                  {isActive && count > 0 && tab.id !== "All" && (
                    <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold text-white">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          {/* Desktop Table Header */}
          <div className="hidden border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4 md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Client</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Barber</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Time</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">ID</div>
          </div>

          {/* Bookings List */}
          <div className="divide-y divide-slate-100">
            {isLoading ? (
              <BookingsTableSkeleton />
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                  <HiMiniCalendarDays className="text-4xl text-slate-400" />
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-950">No bookings found</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  {query || selectedBarberId || activeTab !== "All"
                    ? "Try adjusting your filters or search criteria"
                    : `No appointments scheduled for ${formatDisplayDate(selectedDate)}`}
                </p>
                {(query || selectedBarberId || activeTab !== "All") && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setSelectedBarberId("");
                      setActiveTab("All");
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <HiMiniArrowPath className="h-4 w-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="group transform px-6 py-4 transition-all hover:bg-slate-50/50"
                >
                  <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] md:items-center">
                    {/* Client Info */}
                    <div>
                      <p className="font-bold text-slate-900">{booking.client_name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <HiOutlinePhone className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500">{booking.client_phone}</p>
                      </div>
                    </div>

                    {/* Barber */}
                    <p className="font-semibold text-slate-700">{booking.barber_name}</p>

                    {/* Time */}
                    <div>
                      <p className="font-bold text-slate-900">{formatDisplayTime(booking.appointment_time)}</p>
                      <p className="text-xs text-slate-400">{formatDisplayDate(booking.appointment_date)}</p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                          booking.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : booking.status === "cancelled"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {booking.status === "completed" && <HiOutlineCheckBadge className="h-3 w-3" />}
                        {booking.status === "confirmed" && <HiOutlineClock className="h-3 w-3" />}
                        {booking.status === "cancelled" && <HiOutlineXMark className="h-3 w-3" />}
                        {booking.status === "confirmed" ? "pending" : booking.status}
                      </span>
                    </div>

                    {/* Booking ID */}
                    <div className="font-mono text-sm font-bold text-slate-500">
                      #{booking.booking_code}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with summary */}
          {!isLoading && bookings.length > 0 && (
            <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-3">
              <p className="text-xs text-slate-500">
                Showing {bookings.length} booking{bookings.length === 1 ? "" : "s"}
                {selectedBarberId && ` • Filtered by barber`}
                {activeTab !== "All" && ` • Status: ${activeTab}`}
                {query && ` • Search: "${query}"`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
