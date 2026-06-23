import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HiMiniArrowDownTray,
  HiMiniCheckBadge,
  HiMiniClock,
  HiMiniMagnifyingGlass,
  HiMiniTruck,
  HiMiniXMark,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { getAdminOrders, updateAdminOrder, type AdminOrder } from "../../../api/admin";
import { getErrorMessage } from "../../../api/auth";
import { useDebounce } from "../../../hooks/useDebounce";
import { formatMoney } from "../../account/utils";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSurface from "../components/AdminSurface";

const statusOptions: AdminOrder["status"][] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

const tabs: { key: AdminOrder["status"] | "all" | "processing"; label: string }[] = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const statStyles = [
  {
    icon: HiMiniTruck,
    iconWrap: "bg-[#FFF0F4] text-[#F25D88]",
    label: "Total Orders",
    caption: "All orders",
  },
  {
    icon: HiMiniClock,
    iconWrap: "bg-[#FFF7E8] text-[#F5A93A]",
    label: "Pending",
    caption: "Waiting for processing",
  },
  {
    icon: HiMiniMagnifyingGlass,
    iconWrap: "bg-[#F6F0FF] text-[#AA84F7]",
    label: "Processing",
    caption: "Currently processing",
  },
  {
    icon: HiMiniCheckBadge,
    iconWrap: "bg-[#EEF9EF] text-[#63B36D]",
    label: "Delivered",
    caption: "Successfully delivered",
  },
  {
    icon: HiMiniXMark,
    iconWrap: "bg-[#FFF1F3] text-[#FF6F8A]",
    label: "Cancelled",
    caption: "Cancelled orders",
  },
];

function getOrderStatusLabel(status: AdminOrder["status"]) {
  if (status === "preparing" || status === "ready") return "Processing";
  if (status === "confirmed") return "Pending";
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusTone(status: AdminOrder["status"]) {
  if (status === "delivered") return "bg-[#EAF8E8] text-[#5CA15A]";
  if (status === "cancelled") return "bg-[#FFE8EE] text-[#F25D88]";
  if (status === "preparing" || status === "ready") return "bg-[#FFF3DE] text-[#F2A53B]";
  return "bg-[#F4EEFF] text-[#9B7BF7]";
}

function getPaymentTone(paymentStatus: AdminOrder["payment_status"], paymentMethod: AdminOrder["payment_method"]) {
  if (paymentStatus === "paid") return "bg-[#EAF8E8] text-[#5CA15A]";
  if (paymentMethod === "cash") return "bg-[#EAF3FF] text-[#68A2F7]";
  return "bg-[#FFF1F3] text-[#F25D88]";
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<AdminOrder["status"] | "all" | "processing">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 400);
  const ordersQuery = useQuery({
    queryKey: ["admin-orders", page, debouncedSearch, selectedStatus],
    queryFn: () =>
      getAdminOrders({
        page,
        page_size: 10,
        search: debouncedSearch || undefined,
        status: selectedStatus,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: AdminOrder["status"] }) =>
      updateAdminOrder(orderId, { status }),
    onSuccess: async () => {
      toast.success("Order updated");
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Order could not be updated")),
  });

  const ordersResponse = ordersQuery.data;
  const orders = ordersResponse?.items ?? [];

  const stats = useMemo(() => {
    const total = ordersResponse?.stats.total ?? 0;
    const pending = ordersResponse?.stats.pending ?? 0;
    const processing = ordersResponse?.stats.processing ?? 0;
    const delivered = ordersResponse?.stats.delivered ?? 0;
    const cancelled = ordersResponse?.stats.cancelled ?? 0;
    return [total, pending, processing, delivered, cancelled];
  }, [ordersResponse]);

  const totalPages = Math.max(1, ordersResponse?.total_pages ?? 1);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Admin / Orders"
        title="Orders"
        description="Manage and track all customer orders with clear statuses, payment visibility, and quick fulfillment actions."
        action={
          <button
            type="button"
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition hover:-translate-y-0.5"
          >
            <HiMiniArrowDownTray className="h-4 w-4" />
            Export
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-5">
        {statStyles.map((card, index) => {
          const Icon = card.icon;
          return (
            <AdminSurface key={card.label} className="p-0">
              <div className="flex items-center gap-4 p-5">
                <div className={`flex h-16 w-16 items-center justify-center rounded-[24px] ${card.iconWrap}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#8C6A49]">{card.label}</p>
                  <p className="mt-1 text-[2rem] font-black leading-none text-[#341B08]">{stats[index]}</p>
                  <p className="mt-2 text-sm text-[#B69473]">{card.caption}</p>
                </div>
              </div>
            </AdminSurface>
          );
        })}
      </div>

      <AdminSurface className="overflow-hidden p-0">
        <div className="border-b border-[#F5E6D8] px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const isActive = selectedStatus === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setSelectedStatus(tab.key);
                      setPage(1);
                    }}
                    className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                      isActive
                        ? "bg-[#FFF1F5] text-[#F25D88] shadow-[inset_0_-2px_0_0_#F25D88]"
                        : "text-[#7B5733] hover:bg-[#FFF9F3]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="flex h-14 min-w-[280px] items-center gap-3 rounded-[22px] border border-[#F1E0D1] bg-white px-4 text-[#B28D6A] shadow-[0_10px_30px_rgba(221,196,168,0.12)]">
                <HiMiniMagnifyingGlass className="h-5 w-5 text-[#8B6237]" />
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search orders..."
                  className="w-full bg-transparent text-sm font-medium text-[#5E3906] outline-none placeholder:text-[#C5A688]"
                />
              </label>

              <button
                type="button"
                className="inline-flex h-14 items-center justify-center rounded-[22px] border border-[#F1E0D1] bg-white px-5 text-sm font-semibold text-[#6C4522] shadow-[0_10px_30px_rgba(221,196,168,0.12)]"
              >
                Filter
              </button>

              <button
                type="button"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition hover:-translate-y-0.5"
              >
                <HiMiniArrowDownTray className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="hidden overflow-x-auto xl:block">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-[#F6EBDD] bg-[#FFF9F3] text-sm font-bold text-[#7A5530]">
                <th className="px-6 py-5">Order ID</th>
                <th className="px-5 py-5">Customer</th>
                <th className="px-5 py-5">Items</th>
                <th className="px-5 py-5">Total Amount</th>
                <th className="px-5 py-5">Payment</th>
                <th className="px-5 py-5">Status</th>
                <th className="px-5 py-5">Date</th>
                <th className="px-6 py-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ordersQuery.isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-sm font-semibold text-[#B7885D]">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length ? (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#F8EDE1] text-sm text-[#6F4B29] transition hover:bg-[#FFFDF9]">
                    <td className="px-6 py-5">
                      <span className="font-bold text-[#5E3906]">#{order.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-5 py-5">
                      <div>
                        <p className="font-bold text-[#341B08]">{order.customer_name}</p>
                        <p className="mt-1 text-sm text-[#AC8764]">{order.email || order.phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2">
                        {order.items.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF3EE] text-[11px] font-black text-[#F25D88] shadow-sm"
                            title={item.dessert_name}
                          >
                            {item.dessert_name.slice(0, 1)}
                          </div>
                        ))}
                        {order.items.length > 2 ? (
                          <span className="rounded-full bg-[#F7EFE7] px-2 py-1 text-xs font-bold text-[#8B6237]">
                            +{order.items.length - 2}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-5 font-bold text-[#341B08]">{formatMoney(order.total_price)}</td>
                    <td className="px-5 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase ${getPaymentTone(
                          order.payment_status,
                          order.payment_method,
                        )}`}
                      >
                        {order.payment_status === "paid"
                          ? "Paid"
                          : order.payment_method === "cash"
                            ? "COD"
                            : order.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <select
                        value={order.status}
                        onChange={(event) =>
                          updateMutation.mutate({
                            orderId: order.id,
                            status: event.target.value as AdminOrder["status"],
                          })
                        }
                        className={`rounded-full border-0 px-3 py-2 text-xs font-bold outline-none ${getStatusTone(order.status)}`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {getOrderStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-5">
                      <div className="font-semibold text-[#5E3906]">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="mt-1 text-sm text-[#AC8764]">
                        {new Date(order.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId((current) => (current === order.id ? null : order.id))}
                        className="rounded-2xl border border-[#F0DECE] bg-white px-4 py-2 text-xs font-bold text-[#8B6237]"
                      >
                        {selectedOrderId === order.id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-sm font-semibold text-[#B7885D]">
                    No orders found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-4 px-4 py-4 xl:hidden">
          {ordersQuery.isLoading ? (
            <div className="rounded-[24px] border border-[#F2E1D2] bg-[#FFF9F3] px-4 py-10 text-center text-sm font-semibold text-[#B7885D]">
              Loading orders...
            </div>
          ) : orders.length ? (
            orders.map((order) => (
              <article key={order.id} className="rounded-[28px] border border-[#F2E1D2] bg-[#FFF9F3] p-4 shadow-[0_18px_40px_rgba(229,205,178,0.18)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#341B08]">#{order.id.slice(0, 8)}</p>
                    <p className="mt-1 text-sm text-[#AC8764]">{order.customer_name}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusTone(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-[#805B37]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Amount</span>
                    <span className="font-bold text-[#341B08]">{formatMoney(order.total_price)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Payment</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getPaymentTone(order.payment_status, order.payment_method)}`}>
                      {order.payment_status === "paid" ? "Paid" : order.payment_method === "cash" ? "COD" : order.payment_status}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      updateMutation.mutate({
                        orderId: order.id,
                        status: event.target.value as AdminOrder["status"],
                      })
                    }
                    className={`h-11 w-full rounded-2xl border-0 px-4 text-sm font-bold outline-none ${getStatusTone(order.status)}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {getOrderStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[24px] border border-[#F2E1D2] bg-[#FFF9F3] px-4 py-10 text-center text-sm font-semibold text-[#B7885D]">
              No orders found for this filter.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-[#F5E6D8] px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[#8D6B4D]">
              Showing {ordersResponse?.total === 0 ? 0 : (page - 1) * 10 + 1} to {Math.min(page * 10, ordersResponse?.total ?? 0)} of {ordersResponse?.total ?? 0} results
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page === 1}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F0DECE] bg-white text-[#8B6237]"
              >
                {"<"}
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                const value = index + 1;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPage(value)}
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-bold ${
                      value === page
                        ? "border-[#F25D88] bg-[#F25D88] text-white shadow-[0_12px_24px_rgba(242,93,136,0.2)]"
                        : "border-[#F0DECE] bg-white text-[#8B6237]"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={page === totalPages}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#F0DECE] bg-white text-[#8B6237]"
              >
                {">"}
              </button>
            </div>
          </div>

          {selectedOrderId ? (
            <div className="rounded-[24px] border border-[#F3E3D3] bg-[#FFF9F3] p-5">
              {orders
                .filter((order) => order.id === selectedOrderId)
                .map((order) => (
                  <div key={order.id} className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black text-[#341B08]">{order.customer_name}</h3>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#B67E4B]">
                          #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-[#8B6237]">
                        <p>{order.email || "No email provided"}</p>
                        <p>{order.phone}</p>
                        <p>{order.address}</p>
                        {order.note ? <p>Note: {order.note}</p> : null}
                      </div>
                    </div>

                    <div className="rounded-[22px] bg-white/85 p-4 shadow-sm ring-1 ring-[#F5E6D8]/50">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#8B6237]">
                        <HiMiniTruck className="h-4 w-4 text-[#F25D88]" />
                        {order.items.length} line items
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#FFF9F3] px-4 py-3">
                            <div>
                              <p className="font-bold text-[#5E3906]">{item.dessert_name}</p>
                              <p className="mt-1 text-xs text-[#A97C51]">
                                {item.quantity} x {formatMoney(item.price)}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-[#F25D88]">{formatMoney(item.total_price)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : null}
        </div>
      </AdminSurface>
    </div>
  );
}
