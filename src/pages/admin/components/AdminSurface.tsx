import { useState, useEffect } from "react";
import type { ReactNode } from "react";

/* ── Skeleton primitives ──────────────────────────────── */
function SkeletonBar({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-gradient-to-r from-[#F5E6D8] via-[#EDD8C4] to-[#F5E6D8] bg-[length:200%_100%] ${className}`}
      style={{ animation: "skeleton-shimmer 1.8s ease-in-out infinite" }}
    />
  );
}

/* ── Surface Skeleton ─────────────────────────────────── */
export function SurfaceSkeleton({
  rows = 3,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,240,0.94))] p-5 shadow-[0_14px_36px_rgba(149,91,28,0.08)] ${className}`}
    >
      {/* Title + subtitle skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBar className="h-5 w-44" />
          <SkeletonBar className="h-3 w-28" />
        </div>
        <SkeletonBar className="h-9 w-32 rounded-2xl" />
      </div>

      {/* Content rows */}
      <div className="mt-6 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonBar className="h-9 flex-1 rounded-xl" />
            <SkeletonBar className="h-9 w-12 rounded-xl" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Stat Card Skeleton ───────────────────────────────── */
export function StatCardSkeleton() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,240,0.94))] p-5 shadow-[0_14px_36px_rgba(149,91,28,0.08)]">
      <div className="flex items-start gap-4">
        <SkeletonBar className="h-14 w-14 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-8 w-28" />
          <SkeletonBar className="h-3 w-20" />
        </div>
      </div>
    </section>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function AdminSurface({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,240,0.94))] p-5 shadow-[0_14px_36px_rgba(149,91,28,0.06),0_0_0_1px_rgba(255,255,255,0.6)_inset] transition-all duration-500 hover:shadow-[0_20px_48px_rgba(149,91,28,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset] ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      } ${className}`}
      style={{ transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease", ...style }}
    >
      {/* Subtle top shine */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

      {/* Glow on hover */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-gradient-to-br from-[#FDE7DF]/30 to-transparent opacity-0 blur-3xl transition-all duration-700 group-hover:opacity-100 group-hover:scale-150" />

      {children}
    </section>
  );
}