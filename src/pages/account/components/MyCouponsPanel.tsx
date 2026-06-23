import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  HiMiniDocumentDuplicate,
  HiMiniSparkles,
  HiMiniTag,
  HiCheck,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";
import { getMyCoupons } from "../../../api/account";
import { formatDate, formatMoney } from "../utils";
import SectionHeader from "./SectionHeader";

function getCouponLabel(type: string, value: string) {
  if (type === "percentage") return `${Number(value)}% off`;
  if (type === "fixed") return `${formatMoney(value)} off`;
  return "Free shipping";
}

function getCouponIcon(type: string) {
  if (type === "percentage") return "🏷️";
  if (type === "fixed") return "💰";
  return "🚚";
}

function getCouponEmoji(type: string) {
  if (type === "percentage") return "🎉";
  if (type === "fixed") return "💎";
  return "🎁";
}

export default function MyCouponsPanel() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const couponsQuery = useQuery({
    queryKey: ["my-coupons"],
    queryFn: getMyCoupons,
  });

  const coupons = couponsQuery.data ?? [];

  async function copyCoupon(code: string, id: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast.success(
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
            <HiCheck className="h-4 w-4" />
          </span>
          <span>
            <strong className="text-[#5C3805]">{code}</strong> copied to clipboard!
          </span>
        </div>,
        { icon: false }
      );
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Could not copy coupon code. Please try again.");
    }
  }

  return (
    <section className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_8px_32px_rgba(175,117,60,0.08)] sm:p-8">
      {/* Header */}
      <SectionHeader
        icon={
          <span className="relative">
            <HiMiniSparkles className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#F25D88] animate-ping" />
          </span>
        }
        title="My Coupons"
        subtitle="Your personal rewards and active promotions"
      />

      {/* Loading State */}
      {couponsQuery.isLoading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-[28px] border border-[#F5E6D8] bg-[#FFF8F0] p-6"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="h-3 w-20 rounded-full bg-[#F5E6D8]" />
                  <div className="h-7 w-32 rounded-lg bg-[#F5E6D8]" />
                  <div className="h-4 w-24 rounded-full bg-[#F5E6D8]" />
                </div>
                <div className="h-11 w-11 rounded-2xl bg-[#F5E6D8]" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="h-4 rounded-full bg-[#F5E6D8]" />
                <div className="h-4 rounded-full bg-[#F5E6D8]" />
                <div className="h-4 rounded-full bg-[#F5E6D8]" />
              </div>
              <div className="mt-4 h-11 w-full rounded-2xl bg-[#F5E6D8]" />
            </div>
          ))}
          <p className="text-center text-sm font-medium text-[#C2956A]">
            ✨ Finding the best deals for you...
          </p>
        </div>
      ) : coupons.length ? (
        /* Coupons Grid */
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {coupons.map((coupon, index) => {
            const isPercentage = coupon.type === "percentage";
            const discountText = getCouponLabel(coupon.type, coupon.value);
            const isRewardCoupon = Boolean(coupon.reward_tier);
            const rewardTierLabel = coupon.reward_tier
              ? `${coupon.reward_tier.charAt(0).toUpperCase()}${coupon.reward_tier.slice(1)} reward`
              : "";
            const isExpiringSoon =
              coupon.end_date &&
              new Date(coupon.end_date).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 &&
              new Date(coupon.end_date).getTime() > Date.now();

            return (
              <article
                key={coupon.id}
                className="group relative overflow-hidden rounded-[28px] border border-[#F5E6D8] bg-gradient-to-br from-[#FFFAF5] to-[#FFF2F7] shadow-[0_8px_24px_rgba(175,117,60,0.06)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(242,93,136,0.12)] hover:-translate-y-1"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.08}s both`,
                }}
              >
                {/* Decorative corner accent */}
                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br from-[#F25D88]/10 to-transparent blur-xl" />

                {/* Discount Badge */}
                <div className="absolute right-3 top-3 z-10">
                  <div
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                      isPercentage
                        ? "bg-gradient-to-r from-[#F25D88] to-[#FF7E9F] text-white"
                        : coupon.type === "free_shipping"
                          ? "bg-gradient-to-r from-[#6C8CD5] to-[#8BA8E8] text-white"
                          : "bg-gradient-to-r from-[#C2956A] to-[#D4A87A] text-white"
                    }`}
                  >
                    <span className="text-[11px]">
                      {isPercentage ? "🔥" : coupon.type === "free_shipping" ? "📦" : "💎"}
                    </span>
                    {isRewardCoupon
                      ? rewardTierLabel
                      : isPercentage
                        ? "Best deal"
                        : coupon.type === "free_shipping"
                          ? "Free ship"
                          : "Save now"}
                  </div>
                </div>

                {/* Expiring Soon Banner */}
                {isExpiringSoon && (
                  <div className="absolute left-0 right-0 top-0 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                    <HiOutlineExclamationCircle className="h-3.5 w-3.5" />
                    Expiring soon!
                  </div>
                )}

                <div className={`p-5 ${isExpiringSoon ? "pt-10" : ""}`}>
                  {/* Top: Icon + Code */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C2956A]">
                        🎯 Coupon code
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <h3 className="text-2xl font-black tracking-[0.06em] text-[#F25D88]">
                          {coupon.code}
                        </h3>
                        <span className="hidden animate-bounce text-lg group-hover:inline-block">
                          {getCouponEmoji(coupon.type)}
                        </span>
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-[#FFF0F5] shadow-[0_4px_12px_rgba(242,93,136,0.10)]">
                      <span className="text-xl">{getCouponIcon(coupon.type)}</span>
                      {/* Glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F25D88]/5 to-[#FF7E9F]/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>

                  {/* Discount Amount */}
                  <div className="relative mt-3">
                    <div className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#F25D88]/10 to-[#FF7E9F]/10 px-3.5 py-1.5">
                      <HiMiniTag className="h-3.5 w-3.5 text-[#F25D88]" />
                      <span className="text-sm font-bold text-[#6C410C]">
                        {discountText}
                      </span>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dashed border-[#F5E6D8]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gradient-to-br from-[#FFFAF5] to-[#FFF2F7] px-3 text-[10px] uppercase tracking-wider text-[#C2956A]">
                        Details
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white/70 p-2.5 text-center transition-colors hover:bg-white/90">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#C2956A]">
                        Min. Order
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-[#5C3805]">
                        {formatMoney(coupon.minimum_order)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-2.5 text-center transition-colors hover:bg-white/90">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#C2956A]">
                        Valid Until
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-[#5C3805]">
                        {formatDate(coupon.end_date)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-2.5 text-center transition-colors hover:bg-white/90">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#C2956A]">
                        Usage Limit
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-[#5C3805]">
                        {coupon.usage_limit ?? "♾️"}
                      </p>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => void copyCoupon(coupon.code, coupon.id)}
                    disabled={copiedId === coupon.id}
                    className={`relative mt-4 inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 text-sm font-bold tracking-wide text-white shadow-[0_8px_20px_rgba(242,93,136,0.20)] transition-all duration-300 ${
                      copiedId === coupon.id
                        ? "bg-gradient-to-r from-[#4CAF50] to-[#45A049] scale-[0.98]"
                        : "bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(242,93,136,0.30)] active:scale-[0.97]"
                    }`}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {copiedId === coupon.id ? (
                      <>
                        <HiCheck className="h-5 w-5 animate-bounce" />
                        Copied! 🎉
                      </>
                    ) : (
                      <>
                        <HiMiniDocumentDuplicate className="h-4 w-4" />
                        Copy coupon code
                      </>
                    )}
                  </button>

                  {/* Extra hint on hover */}
                  <p className="mt-2 text-center text-[9px] text-[#C2956A] opacity-0 transition-opacity group-hover:opacity-100">
                    Click to copy and use at checkout
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State - Beautiful */
        <div className="relative mt-6 overflow-hidden rounded-[28px] border border-dashed border-[#F5E6D8] bg-gradient-to-br from-[#FFFAF5] to-[#FFF2F7] px-6 py-12 text-center">
          {/* Decorative elements */}
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-[#F25D88]/5 to-transparent blur-2xl" />
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-[#C2956A]/5 to-transparent blur-2xl" />

          <div className="relative">
            {/* Animated icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#FFF0F5] to-[#FFF8F0] shadow-[0_8px_24px_rgba(175,117,60,0.06)] animate-float">
              <HiMiniSparkles className="h-10 w-10 text-[#C2956A]" />
            </div>

            <h3 className="mt-5 text-xl font-black text-[#6C410C]">
              No active coupons yet
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm font-medium text-[#B1845D]">
              Stay tuned! We regularly send exclusive discounts and promotions to our sweet community. 🍪
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["🎉", "🍪", "🧁", "✨", "🍰"].map((emoji, i) => (
                <span
                  key={i}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sm shadow-sm transition-transform hover:scale-110"
                  style={{
                    animation: `float 2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom info note */}
      {coupons.length > 0 && (
        <p className="mt-5 text-center text-[11px] font-medium text-[#C2956A]">
          💡 Click on a coupon to copy the code. Paste it at checkout to enjoy your discount!
        </p>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
