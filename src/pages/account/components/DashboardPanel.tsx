import {
  HiMiniArrowRight,
  HiMiniCalendarDays,
  HiMiniEnvelope,
  HiMiniGift,
  HiMiniHeart,
  HiMiniMapPin,
  HiMiniPhone,
  HiMiniShieldCheck,
  HiMiniShoppingBag,
  HiMiniSparkles,
  HiMiniTruck,
  HiMiniUser,
} from "react-icons/hi2";
import type { AccountOrder, RewardsSummary } from "../../../api/account";
import type { FeaturedDessert, User } from "../../../types/types";
import DessertMiniCard from "./DessertMiniCard";
import RewardsPanel from "./RewardsPanel";
import SectionHeader from "./SectionHeader";
import type { ProfileTab } from "../types";
import { formatDate, formatDisplayPhone, formatMoney } from "../utils";

interface Props {
  profile: User | null | undefined;
  favoriteDesserts: FeaturedDessert[];
  favoriteIds: string[];
  toggleFavorite: (dessertId: string, dessert?: FeaturedDessert) => void;
  recentOrders: AccountOrder[];
  ordersCount: number;
  favoritesCount: number;
  addressesCount: number;
  setActiveTab: (tab: ProfileTab) => void;
  ordersLoading?: boolean;
  rewardsSummary?: RewardsSummary;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  delivered: { bg: "bg-[#E8F7DC]", text: "text-[#67A340]", label: "Delivered" },
  preparing: { bg: "bg-[#FFF1D9]", text: "text-[#D48A12]", label: "Preparing" },
  pending: { bg: "bg-[#FFF1D9]", text: "text-[#D48A12]", label: "Pending" },
  confirmed: { bg: "bg-[#EAF1FF]", text: "text-[#4D7FD8]", label: "Confirmed" },
  ready: { bg: "bg-[#E8F7DC]", text: "text-[#67A340]", label: "Ready" },
  cancelled: { bg: "bg-[#FFE5EC]", text: "text-[#F25D88]", label: "Cancelled" },
};

function InfoRow({ icon: Icon, label, value }: { icon: typeof HiMiniUser; label: string; value: string }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl bg-[#FFF9F1] px-4 py-3 transition-all duration-200 hover:bg-[#FFF5EB]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFE8EF] to-[#FFF5E1] text-[#F25D88] shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#C49A6A]">{label}</p>
        <p className="truncate text-sm font-medium text-[#704407]">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message, hint }: { icon: typeof HiMiniGift; message: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#FFF8F0] px-8 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#F2A0B5] shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-[#9A6E42]">{message}</p>
        <p className="mt-0.5 text-xs text-[#C49A6A]">{hint}</p>
      </div>
    </div>
  );
}

const stats = [
  {
    label: "My Orders",
    value: (count: number) => String(count).padStart(2, "0"),
    note: "Total Orders",
    icon: HiMiniGift,
    tab: "orders" as const,
  },
  {
    label: "Wishlist",
    value: (count: number) => String(count).padStart(2, "0"),
    note: "Items Saved",
    icon: HiMiniHeart,
    tab: "favorites" as const,
  },
  {
    label: "Addresses",
    value: (count: number) => String(count).padStart(2, "0"),
    note: "Saved Addresses",
    icon: HiMiniMapPin,
    tab: "addresses" as const,
  },
  {
    label: "Settings",
    value: () => "01",
    note: "Profile Center",
    icon: HiMiniShieldCheck,
    tab: "settings" as const,
  },
];

/* ── Skeleton for recent orders ─────────────────────────── */
function RecentOrdersSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="animate-pulse overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(255,245,233,0.96))] p-4 shadow-[0_12px_28px_rgba(175,117,60,0.10)]"
        >
          {/* Header skeleton */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#F5E6D8]" />
              <div className="space-y-2">
                <div className="h-3 w-16 rounded-full bg-[#F5E6D8]" />
                <div className="h-5 w-24 rounded-lg bg-[#F5E6D8]" />
              </div>
            </div>
            <div className="h-6 w-20 rounded-full bg-[#F5E6D8]" />
          </div>
          {/* Body skeleton */}
          <div className="mt-4 space-y-2 rounded-[24px] bg-white/80 p-3 ring-1 ring-[#F5E6D8]/50">
            <div className="h-4 w-32 rounded-lg bg-[#F5E6D8]" />
            <div className="h-4 w-48 rounded-lg bg-[#F5E6D8]" />
          </div>
          {/* Tags skeleton */}
          <div className="mt-4">
            <div className="h-3 w-28 rounded-full bg-[#F5E6D8]" />
            <div className="mt-2 flex gap-2">
              <div className="h-6 w-16 rounded-full bg-[#F5E6D8]" />
              <div className="h-6 w-20 rounded-full bg-[#F5E6D8]" />
              <div className="h-6 w-14 rounded-full bg-[#F5E6D8]" />
            </div>
          </div>
          {/* Footer skeleton */}
          <div className="mt-4 flex items-center justify-between border-t border-[#F0DDBE]/70 pt-4">
            <div className="space-y-1">
              <div className="h-3 w-12 rounded-full bg-[#F5E6D8]" />
              <div className="h-4 w-20 rounded-lg bg-[#F5E6D8]" />
            </div>
            <div className="h-4 w-24 rounded-lg bg-[#F5E6D8]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPanel({
  profile,
  favoriteDesserts,
  favoriteIds,
  toggleFavorite,
  recentOrders,
  ordersCount,
  favoritesCount,
  addressesCount,
  setActiveTab,
  ordersLoading,
  rewardsSummary,
}: Props) {
  const favoritePreview = favoriteDesserts.slice(0, 3);
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <div className="grid gap-3 xl:grid-cols-[0.95fr_2fr]">
      {/* Left Column */}
      <div className="space-y-4">
        {/* Profile Snapshot */}
        <section className="rounded-2xl border border-white/60 bg-white/95 p-4 shadow-[0_8px_32px_rgba(175,117,60,0.08)] sm:rounded-3xl sm:p-5">
          <SectionHeader
            icon={<HiMiniSparkles className="h-4 w-4" />}
            title="Profile Snapshot"
            subtitle="About your SweetCharm account"
          />

          {/* Greeting strip */}
          <div className="relative mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFE8EF] to-[#FFF5E1] px-4 py-3.5">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/30"
            />
            <div className="relative flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#F25D88] shadow-sm">
                {firstName ? firstName.charAt(0).toUpperCase() : "S"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#5C3805]">
                  Hi, {firstName ?? "sweet guest"}!
                </p>
                <p className="text-xs text-[#9A6E42]">Glad to see you back</p>
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 sm:gap-3">
            <InfoRow icon={HiMiniUser} label="Full Name" value={profile?.full_name ?? "Sweet guest"} />
            <InfoRow icon={HiMiniEnvelope} label="Email" value={profile?.email ?? "hello@sweetcharm.com"} />
            <InfoRow icon={HiMiniPhone} label="Phone" value={formatDisplayPhone(profile?.phone)} />
            <InfoRow icon={HiMiniShieldCheck} label="Joined" value={formatDate(profile?.created_at, "Recently joined")} />
          </div>
        </section>

        <RewardsPanel profile={profile} summary={rewardsSummary} />
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Recent Orders */}
        <section className="rounded-2xl border border-white/60 bg-white/95 p-4 shadow-[0_8px_32px_rgba(175,117,60,0.08)] sm:rounded-3xl sm:p-5">
          <SectionHeader
            icon={<HiMiniGift className="h-4 w-4" />}
            title="Recent Orders"
            subtitle="Your sweetest picks"
            action={
              ordersCount > 0 ? (
                <button
                  onClick={() => setActiveTab("orders")}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#FFF0F5] px-3 py-1.5 text-xs font-semibold text-[#F25D88] transition-all duration-200 hover:bg-[#FFE8EF] hover:gap-1.5 active:scale-95"
                >
                  View all
                  <HiMiniArrowRight className="h-3 w-3" />
                </button>
              ) : undefined
            }
          />
          {ordersLoading ? (
            <RecentOrdersSkeleton />
          ) : ordersCount === 0 ? (
            <EmptyState
              icon={HiMiniGift}
              message="No recent orders yet."
              hint="Time to treat yourself!"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {recentOrders.slice(0, 3).map((order) => {
                const status = statusConfig[order.status] ?? statusConfig.pending;
                const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const previewItems = order.items.slice(0, 3);

                return (
                  <button
                    type="button"
                    key={order.id}
                    onClick={() => setActiveTab("orders")}
                    className="group relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(255,245,233,0.96))] p-4 text-left shadow-[0_12px_28px_rgba(175,117,60,0.10)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_34px_rgba(175,117,60,0.16)] active:scale-[0.98]"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#F9C5D3]/25 blur-2xl" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-[#FFF7E8] text-[#F25D88] shadow-[0_8px_18px_rgba(242,93,136,0.12)]">
                          <HiMiniShoppingBag className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C2956A]">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <h3 className="mt-1 text-lg font-bold text-[#6C410C]">
                            {formatMoney(order.total_price)}
                          </h3>
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-[24px] bg-white/80 p-3 shadow-sm ring-1 ring-[#F5E6D8]/50">
                      <div className="flex items-center gap-2 text-sm text-[#9A6E42]">
                        <HiMiniCalendarDays className="h-4 w-4 text-[#F25D88]" />
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-[#9A6E42]">
                        <HiMiniTruck className="mt-0.5 h-4 w-4 shrink-0 text-[#F25D88]" />
                        <span className="line-clamp-2">{order.address}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C2956A]">
                        {itemCount} item{itemCount > 1 ? "s" : ""} in this order
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {previewItems.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center rounded-full bg-[#FFF3E8] px-3 py-1.5 text-xs font-medium text-[#8B6237]"
                          >
                            {item.quantity}x {item.dessert_name}
                          </span>
                        ))}
                        {order.items.length > previewItems.length ? (
                          <span className="inline-flex items-center rounded-full bg-[#FFF0F5] px-3 py-1.5 text-xs font-semibold text-[#F25D88]">
                            +{order.items.length - previewItems.length} more
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#F0DDBE]/70 pt-4">
                      <div>
                        <p className="text-xs text-[#C59D72]">Payment</p>
                        <p className="text-sm font-semibold capitalize text-[#6C410C]">{order.payment_method}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#F25D88] transition-all duration-200 group-hover:gap-1.5">
                        View details
                        <HiMiniArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Favorites */}
        <section className="rounded-2xl border border-white/60 bg-white/95 p-4 shadow-[0_8px_32px_rgba(175,117,60,0.08)] sm:rounded-3xl sm:p-5">
          <SectionHeader
            icon={<HiMiniHeart className="h-4 w-4" />}
            title="Favorites"
            subtitle="Waiting for your next craving"
            action={
              favoritePreview.length > 0 ? (
                <button
                  onClick={() => setActiveTab("favorites")}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#FFF0F5] px-3 py-1.5 text-xs font-semibold text-[#F25D88] transition-all duration-200 hover:bg-[#FFE8EF] hover:gap-1.5 active:scale-95"
                >
                  View all
                  <HiMiniArrowRight className="h-3 w-3" />
                </button>
              ) : undefined
            }
          />
          {favoritePreview.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {favoritePreview.map((dessert, index) => (
                <DessertMiniCard
                  key={dessert.id}
                  dessert={dessert}
                  index={index + 3}
                  favorite={favoriteIds.includes(dessert.id)}
                  onToggleFavorite={toggleFavorite}
                  variant="compact"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={HiMiniHeart}
              message="No favorites yet."
              hint="Start exploring the menu!"
            />
          )}
        </section>

        {/* Stats Grid */}
        <section className="grid gap-2.5 sm:grid-cols-2 md:gap-3 xl:grid-cols-4">
          {stats.map(({ label, value, note, icon: Icon, tab }) => {
            const count =
              tab === "orders"
                ? ordersCount
                : tab === "favorites"
                ? favoritesCount
                : tab === "addresses"
                ? addressesCount
                : 0;
            return (
              <button
                type="button"
                onClick={() => setActiveTab(tab)}
                key={label}
                className="group relative flex min-h-[180px] h-full flex-col overflow-hidden rounded-[24px] border border-white/75 bg-[linear-gradient(145deg,rgba(255,251,247,0.98),rgba(255,244,235,0.94))] p-3.5 text-left shadow-[0_10px_24px_rgba(206,160,111,0.10)] transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_18px_34px_rgba(206,160,111,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C9D6] active:scale-[0.98] sm:min-h-[210px] sm:rounded-[28px] sm:p-4"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(242,93,136,0.14),_transparent_34%)] transition-opacity duration-200 group-hover:opacity-90" />
                <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.55),_transparent_68%)]" />

                <div className="relative flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-[#FFF7E8] text-[#F25D88] shadow-[0_8px_18px_rgba(242,93,136,0.12)] transition-transform duration-200 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/90 text-[#F25D88] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                    <HiMiniArrowRight className="h-4 w-4" />
                  </span>
                </div>

                <div className="relative mt-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#B27B54]">{label}</p>
                  <p className="mt-3 text-[2.7rem] font-black leading-none text-[#6C410C] tabular-nums">
                    {value(count)}
                  </p>
                </div>

                <div className="relative mt-auto pt-5">
                  <div className="mb-3 h-px w-full bg-gradient-to-r from-[#F2DCC8] via-[#F6E8DA] to-transparent" />
                  <p className="text-sm font-medium text-[#A3774A]">{note}</p>
                </div>
              </button>
            );
          })}
        </section>
      </div>
    </div>
  );
}
