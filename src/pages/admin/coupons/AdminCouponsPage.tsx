import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  HiMiniArrowPath,
  HiMiniCalendarDays,
  HiMiniCheckBadge,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniClock,
  HiMiniMagnifyingGlass,
  HiMiniPencilSquare,
  HiMiniPlus,
  HiMiniSparkles,
  HiMiniTag,
  HiMiniTicket,
  HiMiniTruck,
  HiMiniXMark,
} from "react-icons/hi2";
import {
  createAdminCoupon,
  getAdminCoupons,
  type AdminCouponPayload,
  type CouponStatus,
  type CouponType,
} from "../../../api/admin";
import { getErrorMessage } from "../../../api/auth";
import { useDebounce } from "../../../hooks/useDebounce";
import { formatDate, formatMoney } from "../../account/utils";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminSurface from "../components/AdminSurface";

const pageSize = 8;

interface CouponFormState {
  code: string;
  type: CouponType;
  value: string;
  minimum_order: string;
  usage_limit: string;
  start_date: string;
  end_date: string;
  status: CouponStatus;
}

const emptyForm: CouponFormState = {
  code: "",
  type: "percentage",
  value: "",
  minimum_order: "",
  usage_limit: "",
  start_date: "",
  end_date: "",
  status: "active",
};

function formatCouponValue(type: CouponType, value: string | number) {
  if (type === "percentage") return `${Number(value)}%`;
  if (type === "fixed") return formatMoney(value);
  return "Free shipping";
}

const typeConfig: Record<CouponType, { bg: string; text: string; icon: typeof HiMiniTag }> = {
  fixed: { bg: "bg-[#FFF4E7]", text: "text-[#E08728]", icon: HiMiniTicket },
  free_shipping: { bg: "bg-[#F2EEFF]", text: "text-[#8C63E8]", icon: HiMiniTruck },
  percentage: { bg: "bg-[#FFF0F4]", text: "text-[#F25D88]", icon: HiMiniTag },
};

const statusConfig: Record<CouponStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-[#EAF8E8]", text: "text-[#2E7D32]", dot: "bg-[#4CAF50]" },
  inactive: { bg: "bg-[#F4F1ED]", text: "text-[#7A6553]", dot: "bg-[#BBA798]" },
};

function buildDefaultDates() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 14);
  return {
    start_date: today.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
  };
}

/* ───── Skeleton Loader ───── */
function SkeletonRow() {
  return (
    <tr className="border-b border-[#F8EDE1]">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-5 py-5">
          <div className={`h-5 rounded-lg bg-[#F5E6D8]/60 animate-pulse ${i === 0 ? "w-32" : i === 9 ? "w-20" : "w-24"}`} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[28px] border border-[#F2E1D2] bg-[#FFF9F3] p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-5 w-24 rounded-lg bg-[#F5E6D8]/60" />
          <div className="h-4 w-32 rounded-lg bg-[#F5E6D8]/60" />
        </div>
        <div className="h-6 w-20 rounded-full bg-[#F5E6D8]/60" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="h-16 rounded-[20px] bg-[#F5E6D8]/40" />
        <div className="h-16 rounded-[20px] bg-[#F5E6D8]/40" />
      </div>
    </div>
  );
}

/* ───── Stat Card ───── */
function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  caption,
  trend,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  caption: string;
  trend?: { direction: "up" | "down"; label: string };
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] bg-white p-[1px] shadow-[0_12px_40px_rgba(158,114,68,0.10)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(242,93,136,0.16)] hover:-translate-y-1">
      <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/95 via-white to-[#FFF9F5]/90" />
      <div className="relative flex items-center gap-5 p-5">
        <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] ${tone} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="h-7 w-7" />
          <div className="absolute inset-0 rounded-[24px] bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#8C6A49] tracking-wide">{label}</p>
          <p className="mt-1 text-[2rem] font-black leading-none text-[#341B08] tabular-nums">{value}</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-sm text-[#B69473]">{caption}</p>
            {trend && (
              <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                trend.direction === "up" ? "bg-[#EAF8E8] text-[#4CAF50]" : "bg-[#FFF0F4] text-[#F25D88]"
              }`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${trend.direction === "up" ? "bg-[#4CAF50]" : "bg-[#F25D88]"}`} />
                {trend.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── Coupon Modal ───── */
function CouponModal({
  open,
  form,
  onChange,
  onClose,
  onSubmit,
  isPending,
}: {
  open: boolean;
  form: CouponFormState;
  onChange: (next: Partial<CouponFormState>) => void;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  if (!open) return null;

  const isFreeShipping = form.type === "free_shipping";
  const TypeIcon = typeConfig[form.type]?.icon ?? HiMiniTag;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#2B1606]/40 px-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,246,239,0.96))] p-6 shadow-[0_40px_100px_rgba(71,35,5,0.25)] sm:p-8 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#FFF0F4] to-[#FFE4EC] text-[#F25D88] shadow-inner">
              <HiMiniSparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#C79A71]">Admin / Coupons</p>
              <h3 className="mt-2 text-[1.9rem] font-black leading-tight text-[#341B08]">Create New Coupon</h3>
              <p className="mt-2 text-sm leading-6 text-[#9A6E42] max-w-lg">
                Add a discount code with backend validation. Customers will only see valid, usable offers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF2F6] text-[#F25D88] transition-all hover:bg-[#F25D88] hover:text-white hover:scale-[1.04] active:scale-95"
          >
            <HiMiniXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {/* Code */}
          <label className="space-y-2 sm:col-span-2">
            <span className="flex items-center gap-2 text-sm font-bold text-[#7E5530]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#341B08]/10 text-[10px] font-black text-[#341B08]">1</span>
              Coupon Code
            </span>
            <input
              value={form.code}
              onChange={(event) => onChange({ code: event.target.value.toUpperCase() })}
              placeholder="SWEET10"
              className="h-12 w-full rounded-2xl border-2 border-[#F1DFD0] bg-[#FFF9F3] px-4 text-sm font-bold uppercase tracking-[0.08em] text-[#5E3906] outline-none transition-all placeholder:font-semibold placeholder:normal-case placeholder:text-[#C5A688] focus:border-[#F25D88]/50 focus:shadow-[0_0_0_4px_rgba(242,93,136,0.08)]"
            />
          </label>

          {/* Type */}
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-bold text-[#7E5530]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#341B08]/10 text-[10px] font-black text-[#341B08]">2</span>
              Coupon Type
            </span>
            <div className="relative">
              <select
                value={form.type}
                onChange={(event) => {
                  const nextType = event.target.value as CouponType;
                  onChange({
                    type: nextType,
                    value: nextType === "free_shipping" ? "" : form.value,
                  });
                }}
                className="h-12 w-full appearance-none rounded-2xl border-2 border-[#F1DFD0] bg-[#FFF9F3] px-4 pr-10 text-sm font-bold text-[#5E3906] outline-none transition-all focus:border-[#F25D88]/50 focus:shadow-[0_0_0_4px_rgba(242,93,136,0.08)]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
                <option value="free_shipping">Free Shipping 🚚</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#B28D6A]">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" /></svg>
              </div>
            </div>
          </label>

          {/* Value */}
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-bold text-[#7E5530]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#341B08]/10 text-[10px] font-black text-[#341B08]">3</span>
              Value
            </span>
            <div className="relative">
              <input
                type="number"
                min={isFreeShipping ? 0 : form.type === "percentage" ? 1 : 0.01}
                max={form.type === "percentage" ? 100 : undefined}
                step="0.01"
                value={form.value}
                disabled={isFreeShipping}
                onChange={(event) => onChange({ value: event.target.value })}
                placeholder={isFreeShipping ? "Free shipping" : "Enter value"}
                className={`h-12 w-full rounded-2xl border-2 border-[#F1DFD0] bg-[#FFF9F3] px-4 text-sm font-bold text-[#5E3906] outline-none transition-all placeholder:font-semibold placeholder:text-[#C5A688] focus:border-[#F25D88]/50 focus:shadow-[0_0_0_4px_rgba(242,93,136,0.08)] disabled:cursor-not-allowed disabled:opacity-60 ${
                  isFreeShipping ? "italic" : ""
                }`}
              />
              {!isFreeShipping && form.type === "percentage" && (
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-sm font-bold text-[#B28D6A]">%</span>
              )}
            </div>
          </label>

          {/* Minimum Order */}
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-bold text-[#7E5530]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#341B08]/10 text-[10px] font-black text-[#341B08]">4</span>
              Minimum Order
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-bold text-[#B28D6A]">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minimum_order}
                onChange={(event) => onChange({ minimum_order: event.target.value })}
                placeholder="0.00"
                className="h-12 w-full rounded-2xl border-2 border-[#F1DFD0] bg-[#FFF9F3] pl-7 pr-4 text-sm font-bold text-[#5E3906] outline-none transition-all placeholder:font-semibold placeholder:text-[#C5A688] focus:border-[#F25D88]/50 focus:shadow-[0_0_0_4px_rgba(242,93,136,0.08)]"
              />
            </div>
          </label>

          {/* Usage Limit */}
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-bold text-[#7E5530]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#341B08]/10 text-[10px] font-black text-[#341B08]">5</span>
              Usage Limit
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={form.usage_limit}
              onChange={(event) => onChange({ usage_limit: event.target.value })}
              placeholder="Unlimited"
              className="h-12 w-full rounded-2xl border-2 border-[#F1DFD0] bg-[#FFF9F3] px-4 text-sm font-bold text-[#5E3906] outline-none transition-all placeholder:font-semibold placeholder:text-[#C5A688] focus:border-[#F25D88]/50 focus:shadow-[0_0_0_4px_rgba(242,93,136,0.08)]"
            />
          </label>

          {/* Status */}
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-bold text-[#7E5530]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#341B08]/10 text-[10px] font-black text-[#341B08]">6</span>
              Status
            </span>
            <div className="relative">
              <select
                value={form.status}
                onChange={(event) => onChange({ status: event.target.value as CouponStatus })}
                className="h-12 w-full appearance-none rounded-2xl border-2 border-[#F1DFD0] bg-[#FFF9F3] px-4 pr-10 text-sm font-bold text-[#5E3906] outline-none transition-all focus:border-[#F25D88]/50 focus:shadow-[0_0_0_4px_rgba(242,93,136,0.08)]"
              >
                <option value="active">Active 🟢</option>
                <option value="inactive">Inactive ⚪</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#B28D6A]">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" /></svg>
              </div>
            </div>
          </label>

          {/* Start Date */}
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-bold text-[#7E5530]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#341B08]/10 text-[10px] font-black text-[#341B08]">7</span>
              Start Date
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#B28D6A]">
                <HiMiniCalendarDays className="h-4 w-4" />
              </span>
              <input
                type="date"
                value={form.start_date}
                onChange={(event) => onChange({ start_date: event.target.value })}
                className="h-12 w-full rounded-2xl border-2 border-[#F1DFD0] bg-[#FFF9F3] pl-10 pr-4 text-sm font-bold text-[#5E3906] outline-none transition-all focus:border-[#F25D88]/50 focus:shadow-[0_0_0_4px_rgba(242,93,136,0.08)]"
              />
            </div>
          </label>

          {/* End Date */}
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-bold text-[#7E5530]">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#341B08]/10 text-[10px] font-black text-[#341B08]">8</span>
              End Date
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#B28D6A]">
                <HiMiniCalendarDays className="h-4 w-4" />
              </span>
              <input
                type="date"
                value={form.end_date}
                onChange={(event) => onChange({ end_date: event.target.value })}
                className="h-12 w-full rounded-2xl border-2 border-[#F1DFD0] bg-[#FFF9F3] pl-10 pr-4 text-sm font-bold text-[#5E3906] outline-none transition-all focus:border-[#F25D88]/50 focus:shadow-[0_0_0_4px_rgba(242,93,136,0.08)]"
              />
            </div>
          </label>
        </div>

        {/* Preview */}
        <div className="mt-6 overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#FFF6F8,#FFF9F3)] border border-[#F5E6D8] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-white shadow-sm text-[#F25D88]">
              <TypeIcon className="h-5 w-5" />
            </span>
            <p className="font-bold text-[#734117] text-sm">Quick Preview</p>
          </div>
          <p className="mt-3 text-sm leading-7 text-[#9A6E42]">
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#341B08]/5 px-2 py-0.5 font-black text-[#341B08] tracking-wider">
              <HiMiniTag className="h-3 w-3" />
              {form.code || "COUPON"}
            </span>
            {" gives "}
            <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#FFF0F4] to-[#FFE4EC] px-2 py-0.5 font-black text-[#F25D88]">
              {form.value || form.type === "free_shipping" ? formatCouponValue(form.type, form.value || 0) : "discount"}
            </span>
            {" on orders from "}
            <span className="font-black text-[#341B08]">
              {form.minimum_order ? formatMoney(form.minimum_order) : formatMoney(0)}
            </span>
            {form.usage_limit ? (
              <> with a limit of <span className="font-black text-[#341B08]">{form.usage_limit}</span> uses.</>
            ) : (
              "."
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-12 items-center justify-center rounded-2xl border-2 border-[#F0DECE] bg-white px-6 text-sm font-bold text-[#8B6237] transition-all hover:bg-[#FFF9F3] hover:border-[#DCC4B0] active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-bold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(242,93,136,0.30)] active:translate-y-0 disabled:opacity-60 disabled:hover:-translate-y-0"
          >
            {isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <HiMiniPlus className="h-4 w-4" />
                Create Coupon
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───── Main Component ───── */
export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CouponStatus>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CouponFormState>(() => ({
    ...emptyForm,
    ...buildDefaultDates(),
  }));
  const debouncedSearch = useDebounce(searchTerm, 450);

  const couponsQuery = useQuery({
    queryKey: ["admin-coupons", page, debouncedSearch, statusFilter],
    queryFn: () =>
      getAdminCoupons({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createAdminCoupon,
    onSuccess: async () => {
      toast.success("✨ Coupon created successfully");
      setForm({ ...emptyForm, ...buildDefaultDates() });
      setIsModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create coupon"));
    },
  });

  const couponsResponse = couponsQuery.data;
  const coupons = couponsResponse?.items ?? [];
  const totalPages = Math.max(1, couponsResponse?.total_pages ?? 1);

  const stats = useMemo(() => {
    const total = couponsResponse?.total ?? 0;
    const active = couponsResponse?.total_active ?? 0;
    const inactive = Math.max(0, total - active);
    const currentlyVisible = coupons.filter((coupon) => coupon.status === "active").length;
    return { total, active, inactive, currentlyVisible };
  }, [coupons, couponsResponse]);

  function resetAndOpenModal() {
    setForm({ ...emptyForm, ...buildDefaultDates() });
    setIsModalOpen(true);
  }

  function handleCreateCoupon() {
    const payload: AdminCouponPayload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      value: form.type === "free_shipping" ? 0 : Number(form.value || 0),
      minimum_order: Number(form.minimum_order || 0),
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
    };

    createMutation.mutate(payload);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      {/* Header */}
      <AdminPageHeader
        eyebrow="Admin / Coupons"
        title="Coupons"
        description="Create and publish discount codes with server-side validation, debounced search, and a clean admin flow."
        action={
          <button
            type="button"
            onClick={resetAndOpenModal}
            className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(242,93,136,0.30)] active:translate-y-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <HiMiniPlus className="h-4 w-4 relative" />
            <span className="relative">Create Coupon</span>
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Coupons"
          value={stats.total}
          icon={HiMiniTag}
          tone="bg-[#FFF0F4] text-[#F25D88]"
          caption="All created codes"
          trend={{ direction: "up", label: "+12%" }}
        />
        <StatCard
          label="Active Coupons"
          value={stats.active}
          icon={HiMiniCheckBadge}
          tone="bg-[#ECFAEE] text-[#59B56A]"
          caption="Ready for customers"
        />
        <StatCard
          label="Inactive Coupons"
          value={stats.inactive}
          icon={HiMiniArrowPath}
          tone="bg-[#F5F0FF] text-[#8C63E8]"
          caption="Paused or hidden"
        />
        <StatCard
          label="Visible On Page"
          value={stats.currentlyVisible}
          icon={HiMiniSparkles}
          tone="bg-[#FFF5E8] text-[#E28D2D]"
          caption="This page selection"
        />
      </div>

      {/* Coupons Table Section */}
      <AdminSurface className="overflow-hidden p-0 shadow-[0_12px_40px_rgba(158,114,68,0.10)]">
        {/* Header Bar */}
        <div className="border-b border-[#F5E6D8] bg-[linear-gradient(135deg,rgba(255,249,243,0.5),rgba(255,255,255,0.8))] px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-[1.75rem] font-black text-[#341B08] tracking-tight">All Coupons</h3>
              <p className="mt-1 text-sm text-[#A58161]">
                Manage discount codes with backend pagination, query-based search, and strong creation rules.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* Search */}
              <label className="flex h-14 min-w-[250px] items-center gap-3 rounded-[22px] border-2 border-[#F1E0D1] bg-white px-4 text-[#B28D6A] shadow-[0_6px_20px_rgba(221,196,168,0.10)] transition-all focus-within:border-[#F25D88]/40 focus-within:shadow-[0_0_0_4px_rgba(242,93,136,0.08)]">
                <HiMiniMagnifyingGlass className="h-5 w-5 shrink-0 text-[#C5A688]" />
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search coupons..."
                  className="w-full bg-transparent text-sm font-semibold text-[#5E3906] outline-none placeholder:text-[#C5A688]"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(""); setPage(1); }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5E6D8] text-[#8B6237] transition hover:bg-[#E8D4C0]"
                  >
                    <HiMiniXMark className="h-3 w-3" />
                  </button>
                )}
              </label>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as "all" | CouponStatus);
                    setPage(1);
                  }}
                  className="h-14 min-w-[170px] appearance-none rounded-[22px] border-2 border-[#F1E0D1] bg-white pl-5 pr-12 text-sm font-bold text-[#6C4522] shadow-[0_6px_20px_rgba(221,196,168,0.10)] outline-none transition-all focus:border-[#F25D88]/40 focus:shadow-[0_0_0_4px_rgba(242,93,136,0.08)]"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5 text-[#B28D6A]">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto xl:block">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-[#F6EBDD] bg-[linear-gradient(135deg,#FFF9F3,#FFFDF9)] text-sm font-bold text-[#7A5530]">
                <th className="px-6 py-5">Coupon Code</th>
                <th className="px-5 py-5">Type</th>
                <th className="px-5 py-5">Value</th>
                <th className="px-5 py-5">Min. Order</th>
                <th className="px-5 py-5">Usage</th>
                <th className="px-5 py-5">Start Date</th>
                <th className="px-5 py-5">End Date</th>
                <th className="px-5 py-5">Status</th>
                <th className="px-5 py-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {couponsQuery.isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : coupons.length ? (
                coupons.map((coupon) => {
                  const TypeConf = typeConfig[coupon.type];
                  const TypeIcon = TypeConf.icon;
                  const StatusConf = statusConfig[coupon.status];
                  const usagePercent = coupon.usage_limit ? Math.min(100, (coupon.usage_count / coupon.usage_limit) * 100) : 0;

                  return (
                    <tr
                      key={coupon.id}
                      className="group border-b border-[#F8EDE1] text-sm text-[#6F4B29] transition-all hover:bg-[linear-gradient(135deg,#FFFDF9,#FFF9F3)] hover:shadow-[inset_0_0_0_1px_rgba(242,93,136,0.06)]"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${TypeConf.bg} ${TypeConf.text} transition-transform group-hover:scale-105`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-black text-[#341B08] tracking-wide">{coupon.code}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-[#AC8764]">
                              <HiMiniClock className="h-3 w-3" />
                              Created {formatDate(coupon.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${TypeConf.bg} ${TypeConf.text}`}>
                          <TypeIcon className="h-3.5 w-3.5" />
                          {coupon.type.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-5 font-extrabold text-[#5E3906] tabular-nums">{formatCouponValue(coupon.type, coupon.value)}</td>
                      <td className="px-5 py-5 font-extrabold text-[#5E3906] tabular-nums">{formatMoney(coupon.minimum_order)}</td>
                      <td className="px-5 py-5">
                        <div className="min-w-[130px]">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-extrabold text-[#5E3906] tabular-nums">
                              {coupon.usage_count} <span className="text-[#AC8764] font-bold">/</span> {coupon.usage_limit ?? "∞"}
                            </p>
                            {coupon.usage_limit && (
                              <span className="text-[11px] font-bold text-[#AC8764]">{Math.round(usagePercent)}%</span>
                            )}
                          </div>
                          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#F7E9DC]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F2AE43] transition-all duration-500"
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <HiMiniCalendarDays className="h-3.5 w-3.5 text-[#B28D6A]" />
                          <span className="font-semibold text-[#5E3906]">{formatDate(coupon.start_date)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <HiMiniCalendarDays className="h-3.5 w-3.5 text-[#B28D6A]" />
                          <span className="font-semibold text-[#5E3906]">{formatDate(coupon.end_date)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${StatusConf.bg} ${StatusConf.text}`}>
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${StatusConf.dot}`} />
                          {coupon.status}
                        </span>
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toast.info("Edit coupon coming soon")}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF2F6] text-[#F25D88] transition-all hover:bg-gradient-to-r hover:from-[#FF7E9F] hover:to-[#F25D88] hover:text-white hover:shadow-[0_8px_20px_rgba(242,93,136,0.25)] hover:scale-105 active:scale-95"
                          >
                            <HiMiniPencilSquare className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toast.info("Status toggle coming soon")}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F0FF] text-[#8C63E8] transition-all hover:bg-gradient-to-r hover:from-[#8C63E8] hover:to-[#6A42C2] hover:text-white hover:shadow-[0_8px_20px_rgba(140,99,232,0.25)] hover:scale-105 active:scale-95"
                          >
                            <HiMiniArrowPath className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9}>
                    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-[30px] bg-[#FFF2F6]">
                        <HiMiniMagnifyingGlass className="h-8 w-8 text-[#F25D88]/60" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-[#341B08]">No coupons found</p>
                        <p className="mt-1 text-sm text-[#B7885D]">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search or filter to find what you're looking for."
                            : "Get started by creating your first coupon."}
                        </p>
                      </div>
                      {!searchTerm && statusFilter === "all" && (
                        <button
                          type="button"
                          onClick={resetAndOpenModal}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(242,93,136,0.22)] transition hover:-translate-y-0.5"
                        >
                          <HiMiniPlus className="h-4 w-4" />
                          Create Coupon
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4 px-4 py-4 xl:hidden">
          {couponsQuery.isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : coupons.length ? (
            coupons.map((coupon) => {
              const TypeConf = typeConfig[coupon.type];
              const TypeIcon = TypeConf.icon;
              const StatusConf = statusConfig[coupon.status];
              const usagePercent = coupon.usage_limit ? Math.min(100, (coupon.usage_count / coupon.usage_limit) * 100) : 0;

              return (
                <article
                  key={coupon.id}
                  className="group relative overflow-hidden rounded-[28px] border border-[#F2E1D2] bg-white p-[1px] shadow-[0_10px_30px_rgba(229,205,178,0.14)] transition-all hover:shadow-[0_18px_45px_rgba(229,205,178,0.22)] hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/95 via-white to-[#FFF9F3]/90" />
                  <div className="relative p-5">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${TypeConf.bg} ${TypeConf.text}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-black text-[#341B08] tracking-wide">{coupon.code}</h4>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${StatusConf.bg} ${StatusConf.text}`}>
                              <span className={`inline-block h-1.5 w-1.5 rounded-full ${StatusConf.dot}`} />
                              {coupon.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[#8E6543]">
                            <span className="font-extrabold text-[#F25D88]">{formatCouponValue(coupon.type, coupon.value)}</span>
                            {" from "}
                            <span className="font-extrabold text-[#341B08]">{formatMoney(coupon.minimum_order)}</span>
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap ${TypeConf.bg} ${TypeConf.text}`}>
                        <TypeIcon className="h-3 w-3" />
                        {coupon.type.replaceAll("_", " ")}
                      </span>
                    </div>

                    {/* Usage Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#A58161]">Usage</p>
                        <p className="text-xs font-extrabold text-[#5E3906] tabular-nums">
                          {coupon.usage_count} / {coupon.usage_limit ?? "∞"}
                          {coupon.usage_limit && (
                            <span className="ml-1 text-[#AC8764]">({Math.round(usagePercent)}%)</span>
                          )}
                        </p>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#F7E9DC]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F2AE43] transition-all duration-500"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Dates Grid */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] bg-[linear-gradient(135deg,#FFF9F3,#FFFDF9)] p-3 border border-[#F5E6D8]/60">
                        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C69B71]">
                          <HiMiniCalendarDays className="h-3.5 w-3.5" />
                          Start
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-[#5E3906]">{formatDate(coupon.start_date)}</p>
                      </div>
                      <div className="rounded-[20px] bg-[linear-gradient(135deg,#FFF9F3,#FFFDF9)] p-3 border border-[#F5E6D8]/60">
                        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C69B71]">
                          <HiMiniCalendarDays className="h-3.5 w-3.5" />
                          End
                        </p>
                        <p className="mt-1 text-sm font-extrabold text-[#5E3906]">{formatDate(coupon.end_date)}</p>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => toast.info("Edit coupon coming soon")}
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FFF2F6] text-sm font-bold text-[#F25D88] transition-all hover:bg-gradient-to-r hover:from-[#FF7E9F] hover:to-[#F25D88] hover:text-white hover:shadow-[0_8px_20px_rgba(242,93,136,0.20)] active:scale-95"
                      >
                        <HiMiniPencilSquare className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info("Status toggle coming soon")}
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#F5F0FF] text-sm font-bold text-[#8C63E8] transition-all hover:bg-gradient-to-r hover:from-[#8C63E8] hover:to-[#6A42C2] hover:text-white hover:shadow-[0_8px_20px_rgba(140,99,232,0.20)] active:scale-95"
                      >
                        <HiMiniArrowPath className="h-4 w-4" />
                        Toggle
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[30px] bg-[#FFF2F6]">
                <HiMiniMagnifyingGlass className="h-8 w-8 text-[#F25D88]/60" />
              </div>
              <div>
                <p className="text-lg font-black text-[#341B08]">No coupons found</p>
                <p className="mt-1 text-sm text-[#B7885D]">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter."
                    : "Create your first coupon to get started."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-[#F5E6D8] bg-[#FFFDF9] px-6 py-5 text-sm text-[#A58161] sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1">
            Showing <span className="font-extrabold text-[#341B08]">{coupons.length}</span> of{" "}
            <span className="font-extrabold text-[#341B08]">{couponsResponse?.total ?? 0}</span> coupons
          </p>

          <div className="flex items-center gap-3">
            {/* Page buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = page <= 3
                  ? i + 1
                  : page >= totalPages - 2
                    ? totalPages - 4 + i
                    : page - 2 + i;

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold transition-all ${
                      page === pageNum
                        ? "bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] text-white shadow-[0_6px_16px_rgba(242,93,136,0.25)]"
                        : "border border-[#F1E0D1] bg-white text-[#8B6237] hover:border-[#F25D88]/30 hover:bg-[#FFF9F3]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#F1E0D1] bg-white text-[#8B6237] transition-all hover:border-[#F25D88]/30 hover:bg-[#FFF9F3] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <HiMiniChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[110px] text-center font-bold text-[#6C4522] tabular-nums">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#F1E0D1] bg-white text-[#8B6237] transition-all hover:border-[#F25D88]/30 hover:bg-[#FFF9F3] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <HiMiniChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </AdminSurface>

      {/* Info Card */}
      <AdminSurface className="overflow-hidden bg-[linear-gradient(135deg,rgba(255,240,244,0.92),rgba(255,249,243,0.96))] border border-[#F5E6D8]/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-white/90 shadow-sm text-[#F25D88]">
                <HiMiniCalendarDays className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#341B08]">Customer-facing visibility is ready</h3>
                <p className="mt-2 text-sm leading-7 text-[#9A6E42]">
                  Active coupons now appear in profile notifications and on checkout so users can discover new offers easily.
                  Customers with active coupons will see them applied automatically when eligible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminSurface>

      {/* Modal */}
      <CouponModal
        open={isModalOpen}
        form={form}
        onChange={(next) => setForm((current) => ({ ...current, ...next }))}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCoupon}
        isPending={createMutation.isPending}
      />
    </div>
  );
}