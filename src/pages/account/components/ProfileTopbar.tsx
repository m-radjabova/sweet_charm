import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HiMiniArrowLeft,
  HiMiniBell,
  HiMiniCalendarDays,
  HiMiniCheck,
  HiMiniSquares2X2,
  HiMiniTruck,
  HiMiniXMark,
} from "react-icons/hi2";
import { getMyCoupons, getMyRewards, type AccountCoupon, type PointTransaction } from "../../../api/account";
import { getActiveCoupons } from "../../../api/coupons";
import { useRealtime } from "../../../realtime/useRealtime";
import type { User } from "../../../types/types";
import type { ProfileTab } from "../types";
import { formatDate, formatMoney } from "../utils";

interface Props {
  profile: User | null | undefined;
  memberTier: string;
  isAdmin: boolean;
  onTabChange?: (tab: ProfileTab) => void;
}

const READ_COUPON_NOTIFICATIONS_KEY = "sweet_charm_read_coupon_notifications";

function getCouponValueLabel(coupon: AccountCoupon) {
  if (coupon.type === "percentage") return `${Number(coupon.value)}% OFF`;
  if (coupon.type === "fixed") return `${formatMoney(coupon.value)} OFF`;
  return "Free shipping";
}

function parseRewardLabel(transaction: PointTransaction) {
  const description = transaction.description.trim();
  if (description.startsWith("Unlocked Diamond bonus:")) {
    return description.replace("Unlocked Diamond bonus:", "").trim();
  }
  if (description.startsWith("Unlocked ") && description.includes("reward:")) {
    return description.split("reward:")[1]?.trim() ?? "Reward";
  }
  return null;
}

export default function ProfileTopbar({ profile, isAdmin, onTabChange }: Props) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [readCouponIds, setReadCouponIds] = useState<string[]>([]);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount: unreadRealtimeCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
  } = useRealtime();
  const couponsQuery = useQuery({
    queryKey: ["active-coupons"],
    queryFn: getActiveCoupons,
  });
  const myCouponsQuery = useQuery({
    queryKey: ["my-coupons"],
    queryFn: getMyCoupons,
    enabled: Boolean(profile?.id),
  });
  const rewardsQuery = useQuery({
    queryKey: ["my-rewards", "notifications"],
    queryFn: getMyRewards,
    enabled: Boolean(profile?.id),
  });
  const storageKey = `${READ_COUPON_NOTIFICATIONS_KEY}:${profile?.id ?? "guest"}`;
  const coupons = couponsQuery.data ?? [];
  const rewardCoupons = (myCouponsQuery.data ?? []).filter((coupon) => Boolean(coupon.reward_tier));
  const rewardBenefitNotifications = (rewardsQuery.data?.transactions ?? [])
    .map((transaction) => {
      const label = parseRewardLabel(transaction);
      if (!label || label.toLowerCase().includes("coupon")) return null;
      return {
        id: `reward-benefit-${transaction.id}`,
        title: "Reward unlocked",
        message: `${label} is ready for you.`,
        created_at: transaction.created_at,
      };
    })
    .filter((item): item is { id: string; title: string; message: string; created_at: string } => Boolean(item));
  const rewardNotifications = [
    ...rewardCoupons.map((coupon) => ({
      id: `reward-coupon-${coupon.id}`,
      title: "Reward coupon ready",
      message: `${getCouponValueLabel(coupon)} reward is ready. Code: ${coupon.code}`,
      coupon,
    })),
    ...rewardBenefitNotifications,
  ];
  const unreadRewardNotifications = rewardNotifications.filter((item) => !readCouponIds.includes(item.id));
  const unreadCoupons = coupons.filter((coupon) => !readCouponIds.includes(`public-coupon-${coupon.id}`));
  const unreadRealtimeNotifications = notifications.filter((notification) => notification.unread);
  const totalUnread = unreadRewardNotifications.length + unreadCoupons.length + unreadRealtimeCount;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    try {
      const rawValue = localStorage.getItem(READ_COUPON_NOTIFICATIONS_KEY);
      const scopedValue = localStorage.getItem(storageKey);
      if (scopedValue) {
        const parsed = JSON.parse(scopedValue) as string[];
        if (Array.isArray(parsed)) {
          setReadCouponIds(parsed);
          return;
        }
      }
      if (!rawValue) return;
      const parsed = JSON.parse(rawValue) as string[];
      if (Array.isArray(parsed)) {
        setReadCouponIds(parsed);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  function persistReadCouponIds(nextIds: string[]) {
    setReadCouponIds(nextIds);
    localStorage.setItem(storageKey, JSON.stringify(nextIds));
  }

  function markAsRead(notificationId: string) {
    if (readCouponIds.includes(notificationId)) return;
    persistReadCouponIds([...readCouponIds, notificationId]);
  }

  function clearNotifications() {
    persistReadCouponIds(
      Array.from(
        new Set([
          ...readCouponIds,
          ...unreadRewardNotifications.map((notification) => notification.id),
          ...unreadCoupons.map((coupon) => `public-coupon-${coupon.id}`),
        ]),
      ),
    );
    markAllNotificationsAsRead();
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Link
          to="/"
          className="hidden h-11 items-center gap-2.5 rounded-xl bg-gradient-to-r from-white/95 to-white/90 px-4 text-sm font-semibold text-[#7F5B30] shadow-[0_2px_8px_rgba(175,117,60,0.08)] ring-1 ring-[#F5E6D8]/50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(175,117,60,0.12)] active:scale-[0.97] sm:inline-flex"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FFF8F1] transition-colors group-hover:bg-[#F25D88]/10">
            <HiMiniArrowLeft className="h-3.5 w-3.5" />
          </span>
          Home
        </Link>

        {isAdmin ? (
          <Link
            to="/dashboard"
            className="hidden h-11 items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FFF0F5] to-[#FFE8EF] px-4 text-sm font-semibold text-[#F25D88] shadow-[0_2px_8px_rgba(242,93,136,0.08)] ring-1 ring-[#F25D88]/15 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,93,136,0.15)] active:scale-[0.97] sm:inline-flex"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/60">
              <HiMiniSquares2X2 className="h-3.5 w-3.5" />
            </span>
            Admin
          </Link>
        ) : null}

        {/* Notifications */}
        <div className="relative ml-auto" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((current) => !current)}
            className={`relative flex h-11 w-11 items-center justify-center rounded-xl shadow-[0_2px_8px_rgba(175,117,60,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(175,117,60,0.12)] active:scale-[0.97] group ${
              isNotificationsOpen
                ? "bg-gradient-to-r from-[#FFF0F5] to-[#FFE8EF] ring-2 ring-[#F25D88]/30"
                : "bg-white/95 ring-1 ring-[#F5E6D8]/50"
            }`}
          >
            <HiMiniBell
              className={`h-4 w-4 transition-all duration-300 group-hover:scale-110 ${
                totalUnread > 0 && !isNotificationsOpen
                  ? "animate-[ring_2s_ease-in-out_infinite] text-[#F25D88]"
                  : "text-[#C28564]"
              }`}
            />
            {totalUnread > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-[#F25D88] to-[#FF6B9D] px-1 text-[8px] font-bold leading-none text-white shadow-[0_2px_6px_rgba(242,93,136,0.4)]">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-14 z-50 w-[calc(100vw-2rem)] max-w-[360px] origin-top-right animate-[slideDown_0.2s_ease-out] rounded-[24px] border border-[#F5E6D8]/80 bg-white/95 p-4 shadow-[0_24px_64px_rgba(92,56,5,0.15)] backdrop-blur-xl sm:w-[360px] sm:p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#C5946D]">Notifications</p>
                  <h4 className="mt-1.5 text-base font-bold text-[#5C3805]">
                    {totalUnread > 0 ? `${totalUnread} unread updates` : "All caught up!"}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {totalUnread > 0 && (
                    <button
                      type="button"
                      onClick={clearNotifications}
                      className="inline-flex h-8 items-center justify-center rounded-full bg-gradient-to-r from-[#FFF0F4] to-[#FFE8EF] px-3.5 text-[11px] font-bold text-[#F25D88] transition-all duration-200 hover:scale-105 hover:shadow-[0_2px_8px_rgba(242,93,136,0.15)] active:scale-95"
                    >
                      <HiMiniCheck className="mr-1 h-3 w-3" />
                      Clear all
                    </button>
                  )}
                  <span
                    className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-full px-2.5 text-[11px] font-bold ${
                      totalUnread > 0
                        ? "bg-gradient-to-r from-[#FFE8EF] to-[#FFF0F4] text-[#F25D88]"
                        : "bg-[#E8F5E9] text-[#43A047]"
                    }`}
                  >
                    {totalUnread}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-4 h-px bg-gradient-to-r from-[#F5E6D8]/60 via-[#F5E6D8]/30 to-transparent" />

              {/* Coupon list */}
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto scrollbar-thin sm:max-h-[320px] sm:space-y-3">
                {couponsQuery.isLoading || myCouponsQuery.isLoading || rewardsQuery.isLoading ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF8F1] to-[#FFF5EB] px-6 py-10">
                    <div className="flex gap-1.5">
                      {[0, 150, 300].map((delay) => (
                        <div
                          key={delay}
                          className="h-2.5 w-2.5 animate-bounce rounded-full bg-gradient-to-br from-[#F25D88] to-[#FF6B9D]"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm font-medium text-[#B1845D]">Loading offers...</p>
                  </div>
                ) : unreadRealtimeNotifications.length > 0 ? (
                  unreadRealtimeNotifications.slice(0, 5).map((notification, index) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markNotificationAsRead(notification.id)}
                      className={`group relative w-full overflow-hidden rounded-[20px] p-4 text-left transition-all duration-200 hover:shadow-[0_4px_16px_rgba(175,117,60,0.1)] ${
                        notification.unread
                          ? "bg-gradient-to-br from-[#FFF8F1] to-[#FFF5EB]"
                          : "bg-gradient-to-br from-white to-[#FFF9F3]"
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-[#F25D88]/5 to-[#FF6B9D]/5 blur-xl" />

                      <div className="relative flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-gradient-to-r from-[#F25D88]/10 to-[#FF6B9D]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F25D88]">
                              {notification.kind.replaceAll("_", " ")}
                            </span>
                            {notification.unread ? (
                              <span className="h-2 w-2 rounded-full bg-[#F25D88]" />
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm font-bold text-[#5C3805]">{notification.title}</p>
                          <p className="mt-1 text-xs leading-5 text-[#9B7045]">{notification.message}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : unreadRewardNotifications.length > 0 ? (
                  unreadRewardNotifications.slice(0, 5).map((notification, index) => {
                    const coupon = "coupon" in notification ? notification.coupon : null;
                    return (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          markAsRead(notification.id);
                          if (coupon) {
                            onTabChange?.("coupons");
                            setIsNotificationsOpen(false);
                          }
                        }}
                        className="group relative w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FFF8F1] to-[#FFF0F5] p-4 text-left transition-all duration-200 hover:shadow-[0_4px_16px_rgba(175,117,60,0.1)]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-[#F25D88]/10 to-[#FFB36B]/10 blur-xl" />
                        <div className="relative flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-gradient-to-r from-[#F25D88]/10 to-[#FF6B9D]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F25D88]">
                                Reward
                              </span>
                              <span className="h-2 w-2 rounded-full bg-[#F25D88]" />
                            </div>
                            <p className="mt-2 text-sm font-bold text-[#5C3805]">{notification.title}</p>
                            <p className="mt-1 text-xs leading-5 text-[#9B7045]">{notification.message}</p>
                            {coupon ? (
                              <p className="mt-2 text-[11px] font-semibold text-[#B1845D]">
                                Valid until {formatDate(coupon.end_date)}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF0F5] to-[#FFE8EF]">
                            <HiMiniBell className="h-4 w-4 text-[#F25D88]" />
                          </div>
                        </div>
                        <span className="relative mt-3 inline-flex h-8 items-center rounded-full bg-white/80 px-3.5 text-[11px] font-bold text-[#F25D88] shadow-sm ring-1 ring-[#F25D88]/15">
                          {coupon ? "Open coupons" : "Mark as read"}
                        </span>
                      </button>
                    );
                  })
                ) : unreadCoupons.length > 0 ? (
                  unreadCoupons.slice(0, 5).map((coupon, index) => (
                    <div
                      key={coupon.id}
                      className="group relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FFF8F1] to-[#FFF5EB] p-4 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(175,117,60,0.1)]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Decorative corner */}
                      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-[#F25D88]/5 to-[#FF6B9D]/5 blur-xl" />

                      <div className="relative flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-gradient-to-r from-[#F25D88]/10 to-[#FF6B9D]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F25D88]">
                              New
                            </span>
                            <p className="text-sm font-bold text-[#5C3805] truncate">{coupon.code}</p>
                          </div>
                          <p className="mt-1.5 text-xs text-[#B1845D]">
                            {coupon.type === "percentage"
                              ? `${Number(coupon.value)}% OFF`
                              : coupon.type === "fixed"
                                ? `${formatMoney(coupon.value)} OFF`
                                : "FREE SHIPPING"}
                          </p>
                        </div>
                        {coupon.type === "free_shipping" ? (
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#EDE7F6] to-[#F3E5F5]">
                            <HiMiniTruck className="h-4 w-4 text-[#7E57C2]" />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF0F5] to-[#FFE8EF]">
                            <HiMiniCalendarDays className="h-4 w-4 text-[#F25D88]" />
                          </div>
                        )}
                      </div>
                      <p className="relative mt-2 text-[11px] text-[#9B7045]/80">
                        Min order {formatMoney(coupon.minimum_order)} · Valid until {formatDate(coupon.end_date)}
                      </p>
                      <div className="relative mt-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => markAsRead(`public-coupon-${coupon.id}`)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/80 px-3.5 text-[11px] font-bold text-[#F25D88] shadow-sm ring-1 ring-[#F25D88]/15 transition-all duration-200 hover:bg-white hover:shadow-[0_2px_8px_rgba(242,93,136,0.15)] active:scale-95"
                        >
                          <HiMiniCheck className="h-3.5 w-3.5" />
                          Mark as read
                        </button>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[#A58161]">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F25D88]" />
                          Unread
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF8F1] to-[#FFF5EB] px-6 py-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]">
                      <HiMiniCheck className="h-6 w-6 text-[#43A047]" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-[#5C3805]">All notifications are read</p>
                    <p className="mt-1 text-xs text-[#9B7045]">You're up to date with all offers!</p>
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white/80 px-4 text-[11px] font-bold text-[#8B6237] shadow-sm ring-1 ring-[#F5E6D8]/50 transition-all duration-200 hover:bg-white hover:shadow-md active:scale-95"
                    >
                      <HiMiniXMark className="h-3.5 w-3.5" />
                      Close
                    </button>
                  </div>
                )}
              </div>

              {/* Footer */}
              {totalUnread > 0 && (
                <>
                  <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#F5E6D8]/60 to-transparent" />
                  <p className="text-center text-[10px] font-medium text-[#C9A67E]">
                    Showing {Math.min(totalUnread, 5)} of {totalUnread} updates
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(15deg); }
          20% { transform: rotate(-15deg); }
          30% { transform: rotate(10deg); }
          40% { transform: rotate(-10deg); }
          50% { transform: rotate(5deg); }
          60%, 100% { transform: rotate(0deg); }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
