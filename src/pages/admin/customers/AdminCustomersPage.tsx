import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiMiniCheckBadge,
  HiMiniMagnifyingGlass,
  HiMiniUserGroup,
  HiMiniUserPlus,
  HiMiniXMark,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniShoppingBag,
  HiMiniStar,
  HiMiniEnvelope,
  HiMiniPhone,
  HiMiniCalendarDays,
  HiMiniFunnel,
  HiMiniArrowPath,
  HiMiniExclamationTriangle,
} from "react-icons/hi2";
import { getAdminCustomers, type AdminCustomer } from "../../../api/admin";
import { useDebounce } from "../../../hooks/useDebounce";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSurface from "../components/AdminSurface";

const pageSize = 10;

/* ── Stat card config ───────────────────────────────────── */
const statCards = [
  {
    icon: HiMiniUserGroup,
    iconWrap: "bg-[#FFF0F4] text-[#F25D88]",
    label: "Total Customers",
    caption: "Registered shoppers",
  },
  {
    icon: HiMiniCheckBadge,
    iconWrap: "bg-[#ECFAEE] text-[#59B56A]",
    label: "Active",
    caption: "Currently enabled",
  },
  {
    icon: HiMiniXMark,
    iconWrap: "bg-[#FFF1F3] text-[#FF6F8A]",
    label: "Inactive",
    caption: "Temporarily disabled",
  },
  {
    icon: HiMiniUserPlus,
    iconWrap: "bg-[#F5F0FF] text-[#9B7BF7]",
    label: "New This Month",
    caption: "Fresh signups",
  },
];

/* ── Helpers ────────────────────────────────────────────── */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ── Animated Counter ────────────────────────────────────── */
function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const prev = prevRef.current;
    if (prev === value) return;
    prevRef.current = value;

    const diff = value - prev;
    const duration = 400;
    const steps = 20;
    const increment = diff / steps;
    const stepDuration = duration / steps;
    let current = prev;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

/* ── Skeleton for stat card ──────────────────────────────── */
function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] border border-[#F2E1D2] bg-white p-5">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-[24px] bg-[#F0E0D0]" />
        <div className="space-y-3">
          <div className="h-3 w-24 rounded-full bg-[#F0E0D0]" />
          <div className="h-8 w-20 rounded-full bg-[#F0E0D0]" />
          <div className="h-3 w-16 rounded-full bg-[#F0E0D0]" />
        </div>
      </div>
    </div>
  );
}

/* ── Table row skeleton ──────────────────────────────────── */
function TableRowSkeleton() {
  return (
    <tr className="border-b border-[#F8EDE1]">
      <td className="px-6 py-5">
        <div className="flex animate-pulse items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#F0E0D0]" />
          <div className="space-y-2">
            <div className="h-4 w-36 rounded-full bg-[#F0E0D0]" />
            <div className="h-3 w-20 rounded-full bg-[#F0E0D0]" />
          </div>
        </div>
      </td>
      <td className="px-5 py-5">
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-32 rounded-full bg-[#F0E0D0]" />
          <div className="h-3 w-24 rounded-full bg-[#F0E0D0]" />
        </div>
      </td>
      <td className="px-5 py-5">
        <div className="h-6 w-16 animate-pulse rounded-full bg-[#F0E0D0]" />
      </td>
      <td className="px-5 py-5">
        <div className="h-6 w-14 animate-pulse rounded-full bg-[#F0E0D0]" />
      </td>
      <td className="px-5 py-5">
        <div className="h-6 w-14 animate-pulse rounded-full bg-[#F0E0D0]" />
      </td>
      <td className="px-5 py-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-[#F0E0D0]" />
      </td>
    </tr>
  );
}

/* ── Mobile card skeleton ────────────────────────────────── */
function MobileCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] border border-[#F2E1D2] bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 rounded-full bg-[#F0E0D0]" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-5 w-36 rounded-full bg-[#F0E0D0]" />
          <div className="h-3 w-44 rounded-full bg-[#F0E0D0]" />
          <div className="flex gap-4">
            <div className="h-3 w-16 rounded-full bg-[#F0E0D0]" />
            <div className="h-3 w-16 rounded-full bg-[#F0E0D0]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#FFF0F4]">
        <HiMiniUserGroup className="h-10 w-10 text-[#F25D88]" />
      </div>
      <h4 className="mt-5 text-lg font-bold text-[#341B08]">
        {hasFilters ? "No matching customers" : "No customers yet"}
      </h4>
      <p className="mt-2 max-w-xs text-sm text-[#A58161]">
        {hasFilters
          ? "Try adjusting your search or filter to find what you're looking for."
          : "Your customer community will appear here once shoppers start placing orders."}
      </p>
    </div>
  );
}

/* ── Error state ─────────────────────────────────────────── */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#FFF1F3]">
        <HiMiniExclamationTriangle className="h-10 w-10 text-[#FF6F8A]" />
      </div>
      <h4 className="mt-5 text-lg font-bold text-[#341B08]">Failed to load customers</h4>
      <p className="mt-2 max-w-xs text-sm text-[#A58161]">
        Something went wrong while fetching your customer list. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F25D88] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(242,93,136,0.25)] transition-all hover:bg-[#e04d78] hover:shadow-[0_12px_30px_rgba(242,93,136,0.35)]"
      >
        <HiMiniArrowPath className="h-4 w-4" />
        Retry
      </button>
    </div>
  );
}

/* ── Status badge ────────────────────────────────────────── */
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        isActive
          ? "bg-[#EAF8E8] text-[#5CA15A]"
          : "bg-[#FFF1F3] text-[#F25D88]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-[#5CA15A]" : "bg-[#F25D88]"
        }`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

/* ── Stat card component ─────────────────────────────────── */
function StatCard({
  icon: Icon,
  iconWrap,
  label,
  caption,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconWrap: string;
  label: string;
  caption: string;
  value: number;
}) {
  return (
    <AdminSurface className="p-0">
      <div className="flex items-center gap-4 p-5">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-[24px] ${iconWrap}`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#8C6A49]">{label}</p>
          <p className="mt-1 text-[2rem] font-black leading-none text-[#341B08]">
            <AnimatedCounter value={value} />
          </p>
          <p className="mt-2 text-sm text-[#B69473]">{caption}</p>
        </div>
      </div>
    </AdminSurface>
  );
}

/* ── Dynamic pagination ──────────────────────────────────── */
function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  total: number;
}) {
  const pages = useMemo(() => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(maxVisible / 2);
    let start = page - half;
    let end = page + half;
    if (start < 1) {
      start = 1;
      end = maxVisible;
    }
    if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxVisible + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="flex flex-col gap-4 border-t border-[#F5E6D8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-[#8D6B4D]">
        Showing{" "}
        <span className="font-semibold text-[#341B08]">
          {total === 0 ? 0 : (page - 1) * pageSize + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-[#341B08]">
          {Math.min(page * pageSize, total)}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[#341B08]">{total}</span> results
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F0DECE] bg-white text-[#8B6237] transition-all hover:bg-[#FFF9F3] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <HiMiniChevronLeft className="h-4 w-4" />
        </button>

        {pages[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F0DECE] bg-white text-sm font-bold text-[#8B6237] transition-all hover:bg-[#FFF9F3]"
            >
              1
            </button>
            {pages[0] > 2 && (
              <span className="flex h-11 items-center px-1 text-sm font-bold text-[#C5A688]">
                ...
              </span>
            )}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-bold transition-all ${
              p === page
                ? "scale-110 border-[#F25D88] bg-[#F25D88] text-white shadow-[0_12px_24px_rgba(242,93,136,0.25)]"
                : "border-[#F0DECE] bg-white text-[#8B6237] hover:bg-[#FFF9F3] hover:shadow-sm"
            }`}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="flex h-11 items-center px-1 text-sm font-bold text-[#C5A688]">
                ...
              </span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F0DECE] bg-white text-sm font-bold text-[#8B6237] transition-all hover:bg-[#FFF9F3]"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F0DECE] bg-white text-[#8B6237] transition-all hover:bg-[#FFF9F3] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <HiMiniChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Desktop table ───────────────────────────────────────── */
function DesktopTable({
  customers,
  isLoading,
  isError,
  hasFilters,
  onRetry,
}: {
  customers: AdminCustomer[];
  isLoading: boolean;
  isError: boolean;
  hasFilters: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div className="hidden overflow-x-auto xl:block">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#F6EBDD] bg-[#FFF9F3] text-sm font-bold text-[#7A5530]">
              <th className="px-6 py-5">Customer</th>
              <th className="px-5 py-5">Contact</th>
              <th className="px-5 py-5">Status</th>
              <th className="px-5 py-5">Orders</th>
              <th className="px-5 py-5">Reviews</th>
              <th className="px-5 py-5">Joined</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="hidden xl:block">
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (!customers.length) {
    return (
      <div className="hidden xl:block">
        <EmptyState hasFilters={hasFilters} />
      </div>
    );
  }

  return (
    <div className="hidden overflow-x-auto xl:block">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-[#F6EBDD] bg-[#FFF9F3] text-sm font-bold text-[#7A5530]">
            <th className="px-6 py-5">Customer</th>
            <th className="px-5 py-5">Contact</th>
            <th className="px-5 py-5">Status</th>
            <th className="px-5 py-5">Orders</th>
            <th className="px-5 py-5">Reviews</th>
            <th className="px-5 py-5">Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="border-b border-[#F8EDE1] text-sm text-[#6F4B29] transition hover:bg-[#FFFDF9]"
            >
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#FF7E9F] to-[#F25D88] text-sm font-black text-white shadow-md">
                    {customer.avatar ? (
                      <img
                        src={customer.avatar}
                        alt={customer.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(customer.full_name)
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#341B08]">
                      {customer.full_name}
                    </p>
                    <p className="mt-0.5 text-sm text-[#AC8764]">
                      {customer.bio || "Sweet Charm customer"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-5">
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#5E3906]">
                    <HiMiniEnvelope className="h-3.5 w-3.5 shrink-0 text-[#C39A72]" />
                    {customer.email}
                  </span>
                  {customer.phone && (
                    <span className="inline-flex items-center gap-1.5 text-sm text-[#AC8764]">
                      <HiMiniPhone className="h-3.5 w-3.5 shrink-0 text-[#C39A72]" />
                      {customer.phone}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-5 py-5">
                <StatusBadge isActive={customer.is_active} />
              </td>
              <td className="px-5 py-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1F5] px-3 py-1 text-xs font-bold text-[#F25D88]">
                  <HiMiniShoppingBag className="h-3.5 w-3.5" />
                  {customer.orders_count}
                </span>
              </td>
              <td className="px-5 py-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF6E7] px-3 py-1 text-xs font-bold text-[#F2AE43]">
                  <HiMiniStar className="h-3.5 w-3.5" />
                  {customer.reviews_count}
                </span>
              </td>
              <td className="px-5 py-5">
                <span className="inline-flex items-center gap-1.5 font-medium text-[#805B37]">
                  <HiMiniCalendarDays className="h-3.5 w-3.5 shrink-0 text-[#C39A72]" />
                  {formatDate(customer.created_at)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Mobile cards ────────────────────────────────────────── */
function MobileCards({
  customers,
  isLoading,
  isError,
  hasFilters,
  onRetry,
}: {
  customers: AdminCustomer[];
  isLoading: boolean;
  isError: boolean;
  hasFilters: boolean;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4 px-4 py-4 xl:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <MobileCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 py-4 xl:hidden">
        <ErrorState onRetry={onRetry} />
      </div>
    );
  }

  if (!customers.length) {
    return (
      <div className="px-4 py-4 xl:hidden">
        <EmptyState hasFilters={hasFilters} />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-4 xl:hidden">
      {customers.map((customer) => (
        <article
          key={customer.id}
          className="group rounded-[28px] border border-[#F2E1D2] bg-[#FFF9F3] p-4 shadow-[0_18px_40px_rgba(229,205,178,0.18)] transition-all hover:border-[#E6CDBA] hover:shadow-[0_18px_48px_rgba(229,205,178,0.28)]"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#FF7E9F] to-[#F25D88] text-sm font-black text-white shadow-md">
              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(customer.full_name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-lg font-bold text-[#341B08]">
                  {customer.full_name}
                </h4>
                <StatusBadge isActive={customer.is_active} />
              </div>

              <div className="mt-2 space-y-1">
                <p className="flex items-center gap-1.5 text-sm text-[#A67E59]">
                  <HiMiniEnvelope className="h-3.5 w-3.5 shrink-0 text-[#C39A72]" />
                  <span className="truncate">{customer.email}</span>
                </p>
                {customer.phone && (
                  <p className="flex items-center gap-1.5 text-sm text-[#A67E59]">
                    <HiMiniPhone className="h-3.5 w-3.5 shrink-0 text-[#C39A72]" />
                    {customer.phone}
                  </p>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1F5] px-3 py-1 text-xs font-bold text-[#F25D88]">
                  <HiMiniShoppingBag className="h-3 w-3" />
                  {customer.orders_count} orders
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6E7] px-3 py-1 text-xs font-bold text-[#F2AE43]">
                  <HiMiniStar className="h-3 w-3" />
                  {customer.reviews_count} reviews
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F0FF] px-3 py-1 text-xs font-bold text-[#9B7BF7]">
                  <HiMiniCalendarDays className="h-3 w-3" />
                  {formatDate(customer.created_at)}
                </span>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(searchTerm, 400);

  const customersQuery = useQuery({
    queryKey: ["admin-customers", page, debouncedSearch, statusFilter],
    queryFn: () =>
      getAdminCustomers({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter,
      }),
  });

  const customersResponse = customersQuery.data;
  const customers = customersResponse?.items ?? [];
  const hasFilters = !!debouncedSearch || statusFilter !== "all";

  const stats = useMemo(() => {
    const total = customersResponse?.stats.total ?? 0;
    const active = customersResponse?.stats.active ?? 0;
    const inactive = customersResponse?.stats.inactive ?? 0;
    const newThisMonth = customersResponse?.stats.new_this_month ?? 0;
    return [total, active, inactive, newThisMonth];
  }, [customersResponse]);

  const totalPages = Math.max(1, customersResponse?.total_pages ?? 1);

  const handleRetry = useCallback(() => {
    customersQuery.refetch();
  }, [customersQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setPage(1);
  }, []);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Admin / Customers"
        title="Customers"
        description="Browse your customer base with server-side search, clean pagination, and quick insight into order and review activity."
      />

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {customersQuery.isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map((card, index) => (
              <StatCard
                key={card.label}
                icon={card.icon}
                iconWrap={card.iconWrap}
                label={card.label}
                caption={card.caption}
                value={stats[index]}
              />
            ))}
      </div>

      {/* ── Customer directory surface ─────────────────────── */}
      <AdminSurface className="overflow-hidden p-0">
        {/* Header with search + filter */}
        <div className="border-b border-[#F5E6D8] px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-[1.75rem] font-black text-[#341B08]">
                Customer Directory
              </h3>
              <p className="mt-1 text-sm text-[#A58161]">
                Showing{" "}
                <span className="font-bold text-[#341B08]">
                  {customersResponse?.total ?? 0}
                </span>{" "}
                customers in your sweet community.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* Search input */}
              <div className="relative">
                <label className="flex h-14 min-w-[240px] items-center gap-3 rounded-[22px] border border-[#F1E0D1] bg-white px-4 text-[#B28D6A] shadow-[0_10px_30px_rgba(221,196,168,0.12)] transition-all focus-within:border-[#F25D88]/40 focus-within:shadow-[0_10px_30px_rgba(242,93,136,0.08)]">
                  <HiMiniMagnifyingGlass className="h-5 w-5 shrink-0 text-[#8B6237]" />
                  <input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search customers..."
                    className="w-full bg-transparent text-sm font-medium text-[#5E3906] outline-none placeholder:text-[#C5A688]"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1E0D1] text-[#8B6237] transition-colors hover:bg-[#E6CDBA]"
                      aria-label="Clear search"
                    >
                      <HiMiniXMark className="h-3.5 w-3.5" />
                    </button>
                  )}
                </label>
              </div>

              {/* Status filter */}
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                  <HiMiniFunnel className="h-4 w-4 text-[#8B6237]" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as "all" | "active" | "inactive"
                    );
                    setPage(1);
                  }}
                  className="h-14 min-w-[170px] appearance-none rounded-[22px] border border-[#F1E0D1] bg-white pl-10 pr-10 text-sm font-semibold text-[#6C4522] shadow-[0_10px_30px_rgba(221,196,168,0.12)] outline-none transition-all focus:border-[#F25D88]/40"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-[#8B6237]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Desktop table ──────────────────────────────── */}
        <DesktopTable
          customers={customers}
          isLoading={customersQuery.isLoading}
          isError={customersQuery.isError}
          hasFilters={hasFilters}
          onRetry={handleRetry}
        />

        {/* ── Mobile cards ───────────────────────────────── */}
        <MobileCards
          customers={customers}
          isLoading={customersQuery.isLoading}
          isError={customersQuery.isError}
          hasFilters={hasFilters}
          onRetry={handleRetry}
        />

        {/* ── Pagination ──────────────────────────────────── */}
        {!customersQuery.isLoading && !customersQuery.isError && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={customersResponse?.total ?? 0}
          />
        )}
      </AdminSurface>
    </div>
  );
}