import { useMemo, useState, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiMiniCheckBadge,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniClock,
  HiMiniGift,
  HiMiniMagnifyingGlass,
  HiMiniXCircle,
  HiMiniXMark,
} from "react-icons/hi2";
import { getAdminRewards, type AdminRewardStatus } from "../../../api/admin";
import { useDebounce } from "../../../hooks/useDebounce";
import { formatMoney } from "../../account/utils";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSurface from "../components/AdminSurface";

const pageSize = 10;

function formatShortDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

const statusConfig: Record<AdminRewardStatus, { label: string; tone: string }> = {
  unused: { label: "Unused", tone: "bg-[#ECFAEE] text-[#43A047]" },
  used: { label: "Used", tone: "bg-[#FFF6E7] text-[#F2AE43]" },
  expired: { label: "Expired", tone: "bg-[#FDEBEC] text-[#C84C6A]" },
};

function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  caption: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_14px_36px_rgba(149,91,28,0.06)]">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${tone}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#A58161]">{label}</p>
          <p className="mt-1 text-[1.75rem] font-black leading-none text-[#341B08]">{value}</p>
          <p className="mt-1 text-xs text-[#B69473]">{caption}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Table Skeleton ─────────────────────────────────── */
function TableRowSkeleton() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, cellIndex) => (
        <td key={cellIndex} className="px-6 py-5">
          <div className="h-5 w-24 animate-pulse rounded-lg bg-[#F5E6D8]/70" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminRewardsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const rewardsQuery = useQuery({
    queryKey: ["admin-rewards", page, debouncedSearch],
    queryFn: () =>
      getAdminRewards({
        page,
        page_size: pageSize,
        search: debouncedSearch.trim() || undefined,
      }),
  });

  const response = rewardsQuery.data;
  const rewards = response?.items ?? [];
  const totalPages = Math.max(1, response?.total_pages ?? 1);
  const currentPage = Math.min(page, totalPages);
  const stats = useMemo(
    () =>
      response?.stats ?? {
        total_rewards: 0,
        used_rewards: 0,
        unused_rewards: 0,
        expired_rewards: 0,
      },
    [response?.stats]
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Admin / Rewards"
        title="Rewards"
        description="Track system-generated Sweet Points rewards separately from marketing coupons."
      />

      {/* ── Stats Cards ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Rewards" value={stats.total_rewards} caption="All issued rewards" icon={HiMiniGift} tone="bg-[#FFF0F4] text-[#F25D88]" />
        <StatCard label="Used Rewards" value={stats.used_rewards} caption="Already redeemed" icon={HiMiniCheckBadge} tone="bg-[#FFF6E7] text-[#F2AE43]" />
        <StatCard label="Unused Rewards" value={stats.unused_rewards} caption="Ready for customers" icon={HiMiniClock} tone="bg-[#ECFAEE] text-[#43A047]" />
        <StatCard label="Expired Rewards" value={stats.expired_rewards} caption="No longer valid" icon={HiMiniXCircle} tone="bg-[#FDEBEC] text-[#C84C6A]" />
      </div>

      {/* ── Rewards Table ────────────────────────────── */}
      <AdminSurface className="overflow-hidden p-0">
        <div className="border-b border-[#F5E6D8] px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-[1.75rem] font-black text-[#341B08]">Reward Coupons</h3>
              <p className="mt-1 text-sm text-[#A58161]">
                Showing <span className="font-bold text-[#341B08]">{response?.total ?? 0}</span> rewards.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="flex h-14 min-w-[240px] items-center gap-3 rounded-[22px] border border-[#F1E0D1] bg-white px-4 text-[#B28D6A] shadow-[0_10px_30px_rgba(221,196,168,0.12)] focus-within:border-[#F25D88] focus-within:shadow-[0_10px_30px_rgba(242,93,136,0.12)]">
                <HiMiniMagnifyingGlass className="h-5 w-5 shrink-0 text-[#8B6237]" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search customer or code..."
                  className="w-full bg-transparent text-sm font-medium text-[#5E3906] outline-none placeholder:text-[#C5A688]"
                />
                {search ? (
                  <button type="button" onClick={() => { setSearch(""); setPage(1); }}>
                    <HiMiniXMark className="h-4 w-4 text-[#C5A688] transition hover:text-[#F25D88]" />
                  </button>
                ) : null}
              </label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#FFF9F3] text-sm font-bold text-[#8B613A]">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Reward</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Issued Date</th>
                <th className="px-6 py-4">Expire Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F6EBDD] text-sm text-[#5E3906]">
              {rewardsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              ) : rewards.length ? (
                rewards.map((reward) => (
                  <tr key={reward.id} className="bg-white transition hover:bg-[#FFF8F3]">
                    <td className="px-6 py-5 font-bold text-[#341B08]">{reward.customer_name}</td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-extrabold text-[#341B08]">{reward.reward}</p>
                        <p className="mt-1 text-xs text-[#B08A68]">{formatMoney(reward.value)} value</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-[#FFF0F4] px-3 py-1 text-xs font-black tracking-[0.18em] text-[#F25D88]">
                        {reward.code}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-semibold">{formatShortDate(reward.issued_date)}</td>
                    <td className="px-6 py-5 font-semibold">{formatShortDate(reward.expire_date)}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusConfig[reward.status].tone}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${reward.status === "unused" ? "bg-[#4CAF50]" : reward.status === "used" ? "bg-[#F2AE43]" : "bg-[#C84C6A]"}`} />
                        {statusConfig[reward.status].label}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0F4] text-[#F25D88]">
                        <HiMiniGift className="h-8 w-8" />
                      </div>
                      <p className="mt-4 text-lg font-black text-[#341B08]">No rewards found</p>
                      <p className="mt-2 text-sm text-[#A58161]">
                        Rewards will appear here once customers unlock coupon rewards from Sweet Points.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-[#F5E6D8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#8B6237]">
            Showing <span className="font-bold text-[#341B08]">{rewards.length}</span> of{" "}
            <span className="font-bold text-[#341B08]">{response?.total ?? 0}</span> rewards
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage <= 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EEDFD0] bg-white text-[#8B6237] transition hover:bg-[#FFF7F0] disabled:opacity-50"
            >
              <HiMiniChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[80px] text-center text-sm font-bold text-[#341B08]">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage >= totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EEDFD0] bg-white text-[#8B6237] transition hover:bg-[#FFF7F0] disabled:opacity-50"
            >
              <HiMiniChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </AdminSurface>
    </div>
  );
}