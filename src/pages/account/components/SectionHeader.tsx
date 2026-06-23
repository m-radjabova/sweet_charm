import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function SectionHeader({ icon, title, subtitle, action }: Props) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFE8EF] to-[#FFF5E1] text-[#F25D88] shadow-sm ring-1 ring-[#FFD6DD]/50">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-bold text-[#4A2800]">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-sm text-[#B7885D]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? (
        <div className="shrink-0">{action}</div>
      ) : null}
    </div>
  );
}