import type { ReactNode } from "react";

type PremiumTableProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  summary?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

export function PremiumTable({
  eyebrow,
  title,
  description,
  summary,
  actions,
  children,
}: PremiumTableProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(248,250,252,0.96),rgba(255,255,255,0.96),rgba(239,246,255,0.86))] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            {eyebrow ? (
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-sky-700">
                {eyebrow}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                {title}
              </h2>
              {summary ? <div className="flex flex-wrap gap-2">{summary}</div> : null}
            </div>
            {description ? (
              <p className="max-w-3xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
      <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))]">
        {children}
      </div>
    </section>
  );
}

type TableSkeletonProps = {
  columns: number;
  rows?: number;
  firstColumnWide?: boolean;
};

export function TableSkeleton({
  columns,
  rows = 5,
  firstColumnWide = true,
}: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px]">
        <thead className="border-b border-slate-200 bg-slate-950/[0.025]">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-5 py-4">
                <div
                  className={`h-3.5 animate-pulse rounded-full bg-slate-200 ${
                    index === 0 && firstColumnWide ? "w-32" : "w-20"
                  }`}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
            >
              {Array.from({ length: columns }).map((__, columnIndex) => (
                <td key={columnIndex} className="px-5 py-4">
                  {columnIndex === 0 && firstColumnWide ? (
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-200" />
                      <div className="space-y-2">
                        <div className="h-3.5 w-32 animate-pulse rounded-full bg-slate-200" />
                        <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-100" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type PremiumBadgeProps = {
  children: ReactNode;
  tone?:
    | "slate"
    | "sky"
    | "emerald"
    | "amber"
    | "rose"
    | "violet"
    | "cyan";
};

const badgeToneMap: Record<NonNullable<PremiumBadgeProps["tone"]>, string> = {
  slate: "border-slate-200 bg-slate-100/90 text-slate-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

export function PremiumBadge({
  children,
  tone = "slate",
}: PremiumBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-[0.02em] ${badgeToneMap[tone]}`}
    >
      {children}
    </span>
  );
}
