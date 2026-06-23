import { useState, useEffect } from "react";
import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  isLoading?: boolean;
}

/* ── Skeleton ─────────────────────────────────────────── */
function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-gradient-to-r from-[#F5E6D8] via-[#EDD8C4] to-[#F5E6D8] bg-[length:200%_100%] ${className}`}
      style={{ animation: "skeleton-shimmer 1.8s ease-in-out infinite" }}
    />
  );
}

/* ── Header Skeleton ──────────────────────────────────── */
function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,252,248,0.98),rgba(255,245,236,0.94))] p-6 shadow-[0_20px_50px_rgba(149,91,28,0.08)] lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <Skeleton className="mb-4 h-3 w-24" />
        <Skeleton className="h-12 w-[70%] max-w-md" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
      </div>
      <div className="shrink-0">
        <Skeleton className="h-12 w-36 rounded-2xl" />
      </div>
    </div>
  );
}

/* ── Decorative corner elements ───────────────────────── */
function CornerDots() {
  return (
    <>
      {/* Top-right decorative */}
      <div className="pointer-events-none absolute -right-2 -top-2 opacity-40">
        <span className="text-lg">✨</span>
      </div>
      {/* Bottom-left decorative */}
      <div className="pointer-events-none absolute -bottom-2 -left-2 opacity-30">
        <span className="text-lg">🌸</span>
      </div>
    </>
  );
}

/* ── Main Component ───────────────────────────────────── */
export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
  isLoading = false,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) return <HeaderSkeleton />;

  return (
    <div
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,252,248,0.98),rgba(255,245,236,0.94))] p-6 shadow-[0_20px_50px_rgba(149,91,28,0.06),0_0_0_1px_rgba(255,255,255,0.6)_inset] transition-all duration-500 hover:shadow-[0_28px_60px_rgba(149,91,28,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset] lg:flex-row lg:items-end lg:justify-between ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{ transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease" }}
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#FDE7DF]/40 to-transparent blur-3xl transition-all duration-700 group-hover:scale-150" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-gradient-to-tr from-[#FDE7DF]/20 to-transparent blur-3xl" />

      <CornerDots />

      {/* Content */}
      <div className="relative max-w-3xl">
        {eyebrow ? (
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-[#F25D88]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C39A72]">
              {eyebrow}
            </p>
          </div>
        ) : null}

        <h1 className="mt-3 bg-gradient-to-r from-[#4F2C06] to-[#8B6237] bg-clip-text text-[clamp(1.9rem,3vw,3rem)] font-black tracking-tight text-transparent">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#9A6E42]">
          {description}
        </p>
      </div>

      {action ? (
        <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-[1.02]">
          {action}
        </div>
      ) : null}
    </div>
  );
}