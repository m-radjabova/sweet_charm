import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  HiMiniGift,
  HiMiniShoppingBag,
  HiMiniArrowPath,
  HiMiniXCircle,
  HiMiniTruck,
  HiMiniCheckCircle,
  HiMiniClock,
  HiMiniMapPin,
  HiMiniCreditCard,
  HiMiniReceiptPercent,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { cancelMyOrder, getMyOrders, repeatMyOrder } from "../../../api/account";
import { getErrorMessage } from "../../../api/auth";
import { formatDate, formatMoney } from "../utils";
import SectionHeader from "./SectionHeader";

/* ── Status visual config ──────────────────────────────── */
const statusConfig: Record<
  string,
  { bg: string; text: string; dot: string; label: string; icon: React.ReactNode; accent: string }
> = {
  delivered: {
    bg: "bg-[#E8F7DC]",
    text: "text-[#3D8C1A]",
    dot: "bg-[#3D8C1A]",
    label: "Delivered",
    icon: <HiMiniCheckCircle className="h-3.5 w-3.5" />,
    accent: "border-l-[#6BBF3A]",
  },
  preparing: {
    bg: "bg-[#FFF1D9]",
    text: "text-[#B87A0F]",
    dot: "bg-[#D48A12]",
    label: "Preparing",
    icon: <HiMiniClock className="h-3.5 w-3.5" />,
    accent: "border-l-[#E8A832]",
  },
  pending: {
    bg: "bg-[#FFF1D9]",
    text: "text-[#B87A0F]",
    dot: "bg-[#D48A12]",
    label: "Pending",
    icon: <HiMiniClock className="h-3.5 w-3.5" />,
    accent: "border-l-[#E8A832]",
  },
  confirmed: {
    bg: "bg-[#EAF1FF]",
    text: "text-[#2D6BD4]",
    dot: "bg-[#4D7FD8]",
    label: "Confirmed",
    icon: <HiMiniCheckCircle className="h-3.5 w-3.5" />,
    accent: "border-l-[#4D7FD8]",
  },
  ready: {
    bg: "bg-[#E8F7DC]",
    text: "text-[#3D8C1A]",
    dot: "bg-[#3D8C1A]",
    label: "Ready",
    icon: <HiMiniTruck className="h-3.5 w-3.5" />,
    accent: "border-l-[#6BBF3A]",
  },
  cancelled: {
    bg: "bg-[#FFE5EC]",
    text: "text-[#D1386A]",
    dot: "bg-[#F25D88]",
    label: "Cancelled",
    icon: <HiMiniXCircle className="h-3.5 w-3.5" />,
    accent: "border-l-[#F25D88]",
  },
};

const progressSteps = [
  { id: "pending", label: "Accepted" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "On the way" },
  { id: "delivered", label: "Delivered" },
] as const;

/* ── Progress Bar ──────────────────────────────────────── */
function OrderProgress({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#FFD6DE] bg-gradient-to-r from-[#FFF4F7] to-[#FFF0F4] px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C98AA0]">
              Order Progress
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-[#F25D88]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F25D88]/10">
                <HiMiniXCircle className="h-3 w-3" />
              </span>
              This order was cancelled
            </p>
          </div>
          <span className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#F25D88]/15" />
            <span className="relative h-3 w-3 rounded-full bg-[#F25D88] shadow-[0_0_0_6px_rgba(242,93,136,0.12)]" />
          </span>
        </div>
      </div>
    );
  }

  const activeIndex = Math.max(
    0,
    progressSteps.findIndex((step) => step.id === status),
  );

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#F5E6D8]/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-[#F5E6D8] hover:shadow-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C49A6A]">
          Order Progress
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF5E8] px-3 py-1 text-xs font-bold text-[#6C410C] shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#F25D88]/40" />
            <span className="relative h-2 w-2 rounded-full bg-[#F25D88]" />
          </span>
          {progressSteps[activeIndex]?.label ?? "Accepted"}
        </span>
      </div>

      <div className="flex items-start justify-between gap-0">
        {progressSteps.map((step, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;
          const isLast = index === progressSteps.length - 1;

          return (
            <div key={step.id} className="flex min-w-0 flex-1 items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  {/* Dot */}
                  <div className="relative">
                    {isActive && (
                      <span className="absolute -inset-1.5 animate-ping rounded-full bg-[#F25D88]/15" />
                    )}
                    <span
                      className={`relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                        isActive
                          ? "border-[#F25D88] bg-[#F25D88] shadow-[0_0_0_6px_rgba(242,93,136,0.12)]"
                          : isDone
                            ? "border-[#F7A7BB] bg-[#FFD9E4]"
                            : "border-[#EBCFBE] bg-white"
                      }`}
                    >
                      {(isDone || isActive) && (
                        <span className="text-[8px] text-white">
                          {isDone ? "✓" : ""}
                        </span>
                      )}
                    </span>
                  </div>
                  {/* Connector line */}
                  {!isLast && (
                    <div className="relative mx-1 h-[3px] flex-1 overflow-hidden rounded-full bg-[#F1E1D2]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          index < activeIndex
                            ? "w-full bg-[#F7A7BB]"
                            : index === activeIndex
                              ? "w-1/2 bg-[#F25D88] animate-pulse"
                              : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
                <p
                  className={`mt-2 pr-2 text-[10px] font-semibold leading-tight transition-all duration-300 ${
                    isActive
                      ? "text-[#F25D88]"
                      : isDone
                        ? "text-[#9C6A44]"
                        : "text-[#C9A67E]"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Skeleton Loader ───────────────────────────────────── */
function OrderSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="overflow-hidden rounded-2xl border border-[#F5E6D8]/50 bg-white p-5 shadow-sm"
        >
          {/* Header skeleton */}
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="h-3 w-16 rounded-full bg-[#F5E6D8]" />
              <div className="h-5 w-36 rounded-lg bg-[#F5E6D8]" />
              <div className="h-4 w-48 rounded-lg bg-[#F5E6D8]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-7 w-20 rounded-lg bg-[#F5E6D8]" />
              <div className="h-7 w-16 rounded-lg bg-[#F5E6D8]" />
            </div>
          </div>
          {/* Progress skeleton */}
          <div className="mt-4 h-20 rounded-2xl bg-[#F5E6D8]" />
          {/* Buttons skeleton */}
          <div className="mt-4 flex gap-3">
            <div className="h-10 w-32 rounded-xl bg-[#F5E6D8]" />
            <div className="h-10 w-28 rounded-xl bg-[#F5E6D8]" />
          </div>
          {/* Items skeleton */}
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-[#FBF5EF] p-4">
                <div className="h-9 w-9 rounded-lg bg-[#F5E6D8]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-28 rounded-lg bg-[#F5E6D8]" />
                  <div className="h-3 w-20 rounded-lg bg-[#F5E6D8]" />
                </div>
                <div className="h-4 w-14 rounded-lg bg-[#F5E6D8]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────── */
function EmptyOrders() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF8F0] via-[#FFFDFA] to-[#FFF4EB] p-14 text-center shadow-inner">
      {/* Decorative bg elements */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[#F25D88]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[#E8A832]/5 blur-3xl" />

      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF0F5] to-[#FFF8E8] shadow-lg ring-1 ring-[#FFD6DD]/50">
        <HiMiniGift className="h-9 w-9 text-[#F25D88]" />
      </div>
      <h3 className="mt-5 text-xl font-bold text-[#4A2800]">No orders yet</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#B7885D]">
        Your SweetCharm journey hasn't started yet! Browse our menu and place your first order to enjoy
        sweet delights.
      </p>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────── */
export default function OrdersPanel() {
  const queryClient = useQueryClient();
  const ordersQuery = useQuery({ queryKey: ["my-orders"], queryFn: getMyOrders });
  const orders = ordersQuery.data ?? [];

  const repeatOrderMutation = useMutation({
    mutationFn: repeatMyOrder,
    onSuccess: async () => {
      toast.success("Order repeated successfully! 🎉");
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Order could not be repeated")),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelMyOrder,
    onSuccess: async () => {
      toast.success("Order cancelled successfully");
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Order could not be cancelled")),
  });

  const itemsCount = useMemo(
    () => orders.reduce((acc, o) => acc + o.items.reduce((s, i) => s + i.quantity, 0), 0),
    [orders],
  );

  return (
    <section className="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-[0_8px_32px_rgba(175,117,60,0.08)] backdrop-blur-sm md:p-8">
      <SectionHeader
        icon={<HiMiniShoppingBag className="h-4 w-4" />}
        title="My Orders"
        subtitle="All your sweet treats, beautifully organized"
      />

      {ordersQuery.isLoading ? (
        <OrderSkeleton />
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="space-y-5">
          {/* Mini stats bar */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-[#FFF8F0] px-5 py-3 text-sm shadow-sm">
            <span className="flex items-center gap-2 font-semibold text-[#6C410C]">
              <HiMiniShoppingBag className="h-4 w-4 text-[#F25D88]" />
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
            <span className="hidden h-4 w-px bg-[#EBD5C0] md:block" />
            <span className="flex items-center gap-2 font-medium text-[#B7885D]">
              <HiMiniGift className="h-4 w-4 text-[#E8A832]" />
              {itemsCount} {itemsCount === 1 ? "item" : "items"} total
            </span>
          </div>

          {orders.map((order, idx) => {
            const status = statusConfig[order.status] ?? statusConfig.pending;
            const cancelDeadlineText = order.cancel_deadline
              ? new Date(order.cancel_deadline).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            return (
              <article
                key={order.id}
                className="group relative overflow-hidden rounded-2xl border border-[#F5E6D8]/60 bg-white shadow-sm transition-all duration-300 hover:border-[#F5E6D8] hover:shadow-lg"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Accent stripe on top */}
                <div
                  className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${status.accent.replace("border-l-", "from-").replace("]", "").replace("[", "to-[") || "from-[#F25D88] to-[#F7A7BB]"} opacity-70`}
                />

                {/* Status color accent stripe on left (desktop) */}
                <div
                  className={`absolute bottom-0 left-0 top-1 hidden w-1 rounded-bl-2xl md:block ${status.accent.replace("border-l-", "bg-") || "bg-[#F25D88]/30"}`}
                />

                <div className="p-5 md:p-6">
                  {/* ── Header ── */}
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#FFF5EB] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#C49A6A]">
                          Order
                        </span>
                        <span className="font-mono text-xs font-bold tracking-wider text-[#4A2800]">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="text-[#EBD5C0]">·</span>
                        <span className="text-xs font-medium text-[#A47A49]">
                          {formatDate(order.created_at)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        <span className="flex items-center gap-1.5 text-sm text-[#9A6E42]">
                          <HiMiniMapPin className="h-4 w-4 shrink-0 text-[#E8A832]" />
                          <span className="truncate max-w-[240px]">{order.address}</span>
                        </span>

                        {order.payment_method && (
                          <span className="flex items-center gap-1.5 text-sm text-[#9A6E42]">
                            <HiMiniCreditCard className="h-4 w-4 shrink-0 text-[#4D7FD8]" />
                            <span className="capitalize">{order.payment_method}</span>
                            <span
                              className={`ml-0.5 text-xs font-medium ${
                                order.payment_status === "paid"
                                  ? "text-[#3D8C1A]"
                                  : order.payment_status === "failed"
                                    ? "text-[#D1386A]"
                                    : "text-[#B87A0F]"
                              }`}
                            >
                              · {order.payment_status}
                            </span>
                          </span>
                        )}

                        {order.discount_amount && Number(order.discount_amount) > 0 && (
                          <span className="flex items-center gap-1.5 text-sm text-[#9A6E42]">
                            <HiMiniReceiptPercent className="h-4 w-4 shrink-0 text-[#F25D88]" />
                            Saved {formatMoney(order.discount_amount)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm ${status.bg} ${status.text}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                      <span className="text-2xl font-bold tracking-tight text-[#F25D88]">
                        {formatMoney(order.total_price)}
                      </span>
                    </div>
                  </div>

                  {/* ── Progress ── */}
                  <OrderProgress status={order.status} />

                  {/* ── Actions ── */}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => repeatOrderMutation.mutate(order.id)}
                      disabled={repeatOrderMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F25D88] to-[#F47A9D] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:from-[#D94874] hover:to-[#F25D88] hover:shadow-lg active:scale-[0.97] disabled:opacity-50 disabled:hover:from-[#F25D88] disabled:hover:to-[#F47A9D]"
                    >
                      {repeatOrderMutation.isPending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <HiMiniArrowPath className="h-4 w-4" />
                      )}
                      Repeat Order
                    </button>

                    {order.can_cancel ? (
                      <button
                        type="button"
                        onClick={() => cancelOrderMutation.mutate(order.id)}
                        disabled={cancelOrderMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-[#FFD6DE] bg-white px-5 py-2.5 text-sm font-bold text-[#F25D88] shadow-sm transition-all duration-200 hover:border-[#F25D88] hover:bg-[#FFF4F7] hover:shadow-md active:scale-[0.97] disabled:opacity-50"
                      >
                        {cancelOrderMutation.isPending ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#F25D88] border-t-transparent" />
                        ) : (
                          <HiMiniXCircle className="h-4 w-4" />
                        )}
                        Cancel Order
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFF8F0] px-4 py-2 text-xs font-medium text-[#B7885D]">
                        <HiMiniClock className="h-3.5 w-3.5" />
                        {order.status === "cancelled"
                          ? "This order is already cancelled."
                          : order.status === "delivered"
                            ? "Delivered orders cannot be cancelled."
                            : "Cancellation available within 2 hours."}
                      </span>
                    )}

                    {order.can_cancel && cancelDeadlineText && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B7885D]">
                        <HiMiniClock className="h-3.5 w-3.5" />
                        Cancel until {cancelDeadlineText}
                      </span>
                    )}
                  </div>

                  {/* ── Items ── */}
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C49A6A]">
                        Items ({order.items.length})
                      </span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FFF5EB] text-[10px] font-bold text-[#C49A6A]">
                        {order.items.reduce((s, i) => s + i.quantity, 0)}
                      </span>
                    </div>

                    <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="group/item flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#FFFDFA] to-[#FFF8F2] px-4 py-3 shadow-sm ring-1 ring-[#F5E6D8]/30 transition-all duration-200 hover:from-[#FFF8F0] hover:to-[#FFF0E8] hover:shadow-md hover:ring-[#F5E6D8]/60"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFE7EF] to-[#FFF5E1] text-[#F25D88] shadow-sm transition-transform duration-200 group-hover/item:scale-110">
                            <HiMiniGift className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-bold text-[#6C410C]">
                                {item.dessert_name}
                              </p>
                              <span className="shrink-0 text-sm font-extrabold text-[#F25D88]">
                                {formatMoney(item.total_price)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-[#A47A49]">
                              {item.quantity} × {formatMoney(item.price)}
                            </p>
                          </div>
                          <HiOutlineChevronRight className="h-4 w-4 shrink-0 text-[#EBD5C0] opacity-0 transition-all duration-200 group-hover/item:opacity-100" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}