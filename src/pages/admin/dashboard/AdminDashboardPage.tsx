import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiMiniCalendarDays,
  HiMiniChatBubbleLeftRight,
  HiMiniCube,
  HiMiniCurrencyDollar,
  HiMiniShoppingBag,
  HiMiniStar,
  HiMiniUserGroup,
} from "react-icons/hi2";
import type {
  AdminBreakdownItem,
  AdminHeatmapRow,
  AdminMetricPoint,
} from "../../../api/admin";
import { getAdminDashboard } from "../../../api/admin";
import { formatMoney } from "../../account/utils";
import AdminSurface, { SurfaceSkeleton, StatCardSkeleton } from "../components/AdminSurface";
import AdminPageHeader from "../components/AdminPageHeader";

type RangeKey = "daily" | "weekly" | "monthly";

const rangeOptions: { id: RangeKey; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

/* ── Dynamic delay hook ───────────────────────────────── */
function useStaggeredIndex() {
  const [visible, setVisible] = useState(false);
  useState(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  });
  return visible;
}

/* ── Dashboard Shell ──────────────────────────────────── */
function DashboardShell({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const show = useStaggeredIndex();

  return (
    <AdminSurface
      className={`transition-all duration-700 ${
        show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-[1.25rem] font-black tracking-tight text-[#4F2C06]">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-b from-[#F25D88] to-[#FF97AC]" />
            {title}
          </h3>
          {subtitle ? <p className="mt-1 text-sm text-[#A47A49]">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </AdminSurface>
  );
}

/* ── Stat Card ────────────────────────────────────────── */
function StatCard({
  label,
  value,
  note,
  change,
  icon,
  iconClass,
  index = 0,
}: {
  label: string;
  value: string;
  note: string;
  change: string;
  icon: React.ReactNode;
  iconClass: string;
  index?: number;
}) {
  return (
    <AdminSurface
      className="relative overflow-hidden transition-all duration-500"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#FDE7DF]/70 blur-2xl" />
      {/* Shine overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex items-start gap-4">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_12px_24px_rgba(242,93,136,0.14)] transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${iconClass}`}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#8B6237]">{label}</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <p className="text-[2rem] font-black leading-none text-[#4F2C06]">{value}</p>
            <span className="pb-1 text-sm font-bold text-[#39A869]">{change}</span>
          </div>
          <p className="mt-2 text-xs text-[#B78B61]">{note}</p>
        </div>
      </div>
    </AdminSurface>
  );
}

/* ── Range Tabs ───────────────────────────────────────── */
function RangeTabs({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (value: RangeKey) => void;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-[#F2DEC8] bg-white/90 p-1 shadow-sm">
      {rangeOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-[14px] px-4 py-2 text-sm font-semibold transition-all duration-300 ${
            value === option.id
              ? "bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] text-white shadow-[0_10px_18px_rgba(242,93,136,0.18)]"
              : "text-[#8B6237] hover:bg-[#FFF8F1]"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ── Charts ───────────────────────────────────────────── */
function SalesLineChart({ data }: { data: AdminMetricPoint[] }) {
  const width = 700;
  const height = 260;
  const paddingX = 22;
  const paddingTop = 18;
  const paddingBottom = 36;
  const max = Math.max(1, ...data.map((item) => item.value));
  const points = data.map((item, index) => {
    const x = paddingX + (index / Math.max(1, data.length - 1)) * (width - paddingX * 2);
    const y = paddingTop + (1 - item.value / max) * (height - paddingTop - paddingBottom);
    return { ...item, x, y };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPath = `M ${paddingX} ${height - paddingBottom} ${points
    .map((point) => `L ${point.x} ${point.y}`)
    .join(" ")} L ${width - paddingX} ${height - paddingBottom} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[320px] w-full">
      <defs>
        <linearGradient id="salesArea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF97AC" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#FF97AC" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="salesLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F87195" />
          <stop offset="100%" stopColor="#FFB86B" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((line) => {
        const y = paddingTop + ((height - paddingTop - paddingBottom) / 3) * line;
        return <line key={line} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#F3E3D4" />;
      })}
      <path d={areaPath} fill="url(#salesArea)" />
      <polyline fill="none" stroke="url(#salesLine)" strokeWidth="4" points={polyline} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="5.5" fill="#F56D92" />
          <circle cx={point.x} cy={point.y} r="10" fill="#F56D92" fillOpacity="0.12" />
          <text x={point.x} y={height - 10} textAnchor="middle" className="fill-[#C39A72] text-[11px] font-semibold">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function AreaCustomersChart({ data }: { data: AdminMetricPoint[] }) {
  const width = 520;
  const height = 220;
  const paddingX = 20;
  const paddingTop = 18;
  const paddingBottom = 32;
  const max = Math.max(1, ...data.map((item) => item.value));
  const points = data.map((item, index) => {
    const x = paddingX + (index / Math.max(1, data.length - 1)) * (width - paddingX * 2);
    const y = paddingTop + (1 - item.value / max) * (height - paddingTop - paddingBottom);
    return { ...item, x, y };
  });
  const areaPath = `M ${paddingX} ${height - paddingBottom} ${points
    .map((point) => `L ${point.x} ${point.y}`)
    .join(" ")} L ${width - paddingX} ${height - paddingBottom} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[250px] w-full">
      <defs>
        <linearGradient id="customerArea" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF97AC" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FF97AC" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((line) => {
        const y = paddingTop + ((height - paddingTop - paddingBottom) / 3) * line;
        return <line key={line} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="#F3E3D4" />;
      })}
      <path d={areaPath} fill="url(#customerArea)" />
      <polyline fill="none" stroke="#F56D92" strokeWidth="3" points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="4.5" fill="#F56D92" />
          <text x={point.x} y={height - 9} textAnchor="middle" className="fill-[#C39A72] text-[10px] font-semibold">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DonutStatusChart({ items, total }: { items: AdminBreakdownItem[]; total: number }) {
  const palette = ["#F56D92", "#FFC25C", "#B18CF5", "#D1D5DB", "#76D0A0", "#F6A36A"];
  const safeTotal = Math.max(1, items.reduce((sum, item) => sum + item.value, 0));
  let currentAngle = -90;

  return (
    <div className="grid gap-6 lg:grid-cols-[250px_1fr] lg:items-center">
      <svg viewBox="0 0 220 220" className="mx-auto h-[240px] w-[240px]">
        <circle cx="110" cy="110" r="72" fill="none" stroke="#F5E6D8" strokeWidth="28" />
        {items.map((item, index) => {
          const angle = (item.value / safeTotal) * 360;
          const start = polarToCartesian(110, 110, 72, currentAngle);
          const end = polarToCartesian(110, 110, 72, currentAngle + angle);
          const largeArcFlag = angle > 180 ? 1 : 0;
          const d = `M ${start.x} ${start.y} A 72 72 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
          const color = palette[index % palette.length];
          currentAngle += angle;
          return <path key={item.key} d={d} fill="none" stroke={color} strokeWidth="28" strokeLinecap="round" />;
        })}
        <text x="110" y="104" textAnchor="middle" className="fill-[#A47A49] text-[12px] font-semibold">
          Total Orders
        </text>
        <text x="110" y="126" textAnchor="middle" className="fill-[#4F2C06] text-[26px] font-black">
          {total}
        </text>
      </svg>
      <div className="space-y-3">
        {items.map((item, index) => {
          const color = palette[index % palette.length];
          const percent = Math.round((item.value / safeTotal) * 100);
          return (
            <div key={item.key} className="flex items-center justify-between gap-3 rounded-2xl bg-[#FFF8F1] px-4 py-3 transition-all duration-300 hover:bg-[#FFF0E3] hover:shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-semibold text-[#7E531F]">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-[#4F2C06]">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BestSellingBars({
  items,
}: {
  items: { dessert_name: string; orders_count: number; revenue: string }[];
}) {
  const max = Math.max(1, ...items.map((item) => item.orders_count));
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.dessert_name} className="grid grid-cols-[1fr_auto] items-center gap-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[#5E3906]">{item.dessert_name}</span>
              <span className="text-xs font-bold text-[#B67E4B]">{item.orders_count} sold</span>
            </div>
            <div className="h-3 rounded-full bg-[#F7E7D7]">
              <div
                className="h-3 animate-[barGrow_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F8B661]"
                style={{
                  width: `${Math.max(12, (item.orders_count / max) * 100)}%`,
                  animationDelay: `${items.indexOf(item) * 100}ms`,
                }}
              />
            </div>
          </div>
          <span className="text-sm font-bold text-[#F25D88]">{formatMoney(item.revenue)}</span>
        </div>
      ))}
    </div>
  );
}

function PieRevenueChart({ items }: { items: AdminBreakdownItem[] }) {
  const palette = ["#FF7E9F", "#FFC25C", "#B18CF5", "#76D0A0", "#7ABFFF", "#F29E6E"];
  const safeTotal = Math.max(1, items.reduce((sum, item) => sum + item.value, 0));
  let currentAngle = -90;
  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-center">
      <svg viewBox="0 0 220 220" className="mx-auto h-[220px] w-[220px]">
        {items.map((item, index) => {
          const angle = (item.value / safeTotal) * 360;
          const start = polarToCartesian(110, 110, 80, currentAngle);
          const end = polarToCartesian(110, 110, 80, currentAngle + angle);
          const largeArcFlag = angle > 180 ? 1 : 0;
          const d = `M 110 110 L ${start.x} ${start.y} A 80 80 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
          const color = palette[index % palette.length];
          currentAngle += angle;
          return <path key={item.key} d={d} fill={color} opacity="0.96" />;
        })}
      </svg>
      <div className="space-y-3">
        {items.map((item, index) => {
          const color = palette[index % palette.length];
          const percent = Math.round((item.value / safeTotal) * 100);
          return (
            <div key={item.key} className="flex items-center justify-between gap-3 rounded-2xl bg-[#FFF8F1] px-4 py-3 transition-all duration-300 hover:bg-[#FFF0E3] hover:shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-semibold text-[#7E531F]">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-[#4F2C06]">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewsDistribution({ items }: { items: AdminBreakdownItem[] }) {
  const total = Math.max(1, items.reduce((sum, item) => sum + item.value, 0));
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const percent = Math.round((item.value / total) * 100);
        const stars = Number(item.key);
        return (
          <div key={item.key} className="grid grid-cols-[110px_1fr_auto] items-center gap-3">
            <div className="flex items-center gap-1 text-[#F4B73F]">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} className={index < stars ? "text-[#F4B73F]" : "text-[#F4B73F]/25"}>★</span>
              ))}
            </div>
            <div className="h-3 rounded-full bg-[#F7E7D7]">
              <div
                className="h-3 animate-[barGrow_1s_cubic-bezier(0.16,1,0.3,1)_forwards] rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88]"
                style={{ width: `${Math.max(3, percent)}%`, animationDelay: `${items.indexOf(item) * 80}ms` }}
              />
            </div>
            <span className="text-sm font-bold text-[#8B6237]">{percent}%</span>
          </div>
        );
      })}
    </div>
  );
}

function OrdersHeatmap({ rows }: { rows: AdminHeatmapRow[] }) {
  const max = Math.max(1, ...rows.flatMap((row) => row.slots.map((slot) => slot.value)));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[46px_repeat(8,minmax(0,1fr))] gap-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#C39A72]">
        <span />
        {rows[0]?.slots.map((slot) => <span key={slot.time}>{slot.time}</span>)}
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.day} className="grid grid-cols-[46px_repeat(8,minmax(0,1fr))] gap-2">
            <span className="self-center text-xs font-bold text-[#8B6237]">{row.day}</span>
            {row.slots.map((slot) => {
              const opacity = slot.value / max;
              return (
                <div
                  key={`${row.day}-${slot.time}`}
                  title={`${row.day} ${slot.time}: ${slot.value} orders`}
                  className="h-9 rounded-xl border border-white/70 transition-all duration-300 hover:scale-[1.03] hover:shadow-md"
                  style={{
                    background: `rgba(242, 93, 136, ${Math.max(0.08, opacity * 0.95)})`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs font-semibold text-[#B78B61]">
        <span>Less</span>
        <div className="flex items-center gap-1">
          {[0.12, 0.28, 0.45, 0.68, 0.9].map((opacity) => (
            <span key={opacity} className="h-3.5 w-9 rounded-full" style={{ background: `rgba(242, 93, 136, ${opacity})` }} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

/* ── Dashboard Loading Skeleton ───────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader isLoading />

      {/* Stat cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <SurfaceSkeleton rows={4} />
        <SurfaceSkeleton rows={5} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_1.15fr]">
        <SurfaceSkeleton rows={3} />
        <SurfaceSkeleton rows={4} />
        <SurfaceSkeleton rows={3} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <SurfaceSkeleton rows={6} />
        <SurfaceSkeleton rows={5} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <SurfaceSkeleton rows={2} />
        <SurfaceSkeleton rows={2} />
      </div>
    </div>
  );
}

/* ── Mini Card ────────────────────────────────────────── */
function MiniCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[22px] bg-[#FFF8F1] p-4 transition-all duration-300 hover:bg-[#FFF0E3] hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#8B6237]">{title}</p>
        <span className="text-[#F25D88]">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-black text-[#4F2C06]">{value}</p>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [range, setRange] = useState<RangeKey>("weekly");
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  const data = dashboardQuery.data;

  const salesSeries = useMemo(() => data?.sales_overview[range] ?? [], [data, range]);
  const customerSeries = useMemo(() => data?.new_customers_growth[range] ?? [], [data, range]);

  if (dashboardQuery.isLoading || !data) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <AdminPageHeader
        eyebrow="Admin Panel"
        title="Dashboard"
        description="Welcome back, Admin! Here's what's happening with your store today."
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex h-12 items-center gap-3 rounded-2xl border border-[#F2DEC8] bg-white px-4 text-sm font-semibold text-[#8B6237] shadow-sm">
              <HiMiniCalendarDays className="h-5 w-5 text-[#F25D88]" />
              May 12 - May 19, 2024
            </div>
            <RangeTabs value={range} onChange={setRange} />
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Total Revenue" value={formatMoney(data.total_revenue)} note="vs previous period" change="+18.6%" icon={<HiMiniCurrencyDollar className="h-6 w-6" />} iconClass="bg-gradient-to-br from-[#FF8AAA] to-[#F56D92]" />
        <StatCard index={1} label="Total Orders" value={String(data.total_orders)} note={`${data.pending_orders} need attention`} change="+12.4%" icon={<HiMiniShoppingBag className="h-6 w-6" />} iconClass="bg-gradient-to-br from-[#F8BA58] to-[#F29A44]" />
        <StatCard index={2} label="New Customers" value={String(data.active_users)} note="registered customer base" change="+15.7%" icon={<HiMiniUserGroup className="h-6 w-6" />} iconClass="bg-gradient-to-br from-[#FFB4C2] to-[#F56D92]" />
        <StatCard index={3} label="Average Rating" value={data.average_rating.toFixed(1)} note={`${data.approved_reviews} approved reviews`} change="+0.3" icon={<HiMiniStar className="h-6 w-6" />} iconClass="bg-gradient-to-br from-[#C7A4FF] to-[#9C78F5]" />
      </div>

      {/* Sales + Order Status */}
      <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <DashboardShell title="Sales Overview" subtitle="Daily, weekly, and monthly revenue performance" action={<RangeTabs value={range} onChange={setRange} />}>
          <SalesLineChart data={salesSeries} />
        </DashboardShell>

        <DashboardShell title="Order Status" subtitle="Delivered, preparing, pending, and cancelled orders">
          <DonutStatusChart items={data.order_status_breakdown} total={data.total_orders} />
        </DashboardShell>
      </div>

      {/* Best Selling + Revenue by Category + Customer Growth */}
      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_1.15fr]">
        <DashboardShell title="Best Selling Desserts" subtitle="The strongest performers in the catalog">
          <BestSellingBars items={data.top_desserts} />
        </DashboardShell>

        <DashboardShell title="Revenue by Category" subtitle="Which category brings in the most money">
          <PieRevenueChart items={data.revenue_by_category.length > 0 ? data.revenue_by_category : data.category_distribution} />
        </DashboardShell>

        <DashboardShell title="New Customers Growth" subtitle="How fast the customer base is growing" action={<RangeTabs value={range} onChange={setRange} />}>
          <AreaCustomersChart data={customerSeries} />
        </DashboardShell>
      </div>

      {/* Heatmap + Reviews */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <DashboardShell title="Orders by Time" subtitle="Heatmap of the busiest ordering hours across the week">
          <OrdersHeatmap rows={data.orders_by_time} />
        </DashboardShell>

        <DashboardShell title="Reviews Distribution" subtitle="Customer satisfaction across approved and pending ratings">
          <ReviewsDistribution items={data.review_rating_breakdown} />
        </DashboardShell>
      </div>

      {/* Revenue by Category Mix + Moderation */}
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardShell title="Revenue by Category Mix" subtitle="Category share of total revenue">
          <div className="grid gap-3 sm:grid-cols-2">
            {data.revenue_by_category.map((item) => {
              const total = Math.max(1, data.revenue_by_category.reduce((sum, entry) => sum + entry.value, 0));
              const percent = Math.round((item.value / total) * 100);
              return (
                <div key={item.key} className="rounded-[22px] bg-[#FFF8F1] p-4 transition-all duration-300 hover:bg-[#FFF0E3] hover:shadow-sm">
                  <p className="text-sm font-bold text-[#5E3906]">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-[#F25D88]">{percent}%</p>
                  <p className="mt-1 text-sm text-[#A47A49]">{formatMoney(item.value)}</p>
                </div>
              );
            })}
          </div>
        </DashboardShell>

        <DashboardShell title="Moderation & Activity" subtitle="Quick pulse on the admin queue">
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniCard title="Pending Reviews" value={String(data.pending_reviews)} icon={<HiMiniChatBubbleLeftRight className="h-5 w-5" />} />
            <MiniCard title="Approved Reviews" value={String(data.approved_reviews)} icon={<HiMiniStar className="h-5 w-5" />} />
            <MiniCard title="Total Desserts" value={String(data.total_desserts)} icon={<HiMiniCube className="h-5 w-5" />} />
            <MiniCard title="Categories" value={String(data.total_categories)} icon={<HiMiniCube className="h-5 w-5" />} />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}