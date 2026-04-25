import type { ReactNode } from "react";
import { MenuItem } from "@mui/material";
import { HiMiniArrowUpRight } from "react-icons/hi2";

type SelectActionMenuItemProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

export default function SelectActionMenuItem({
  title,
  description,
  icon,
  onClick,
  disabled = false,
}: SelectActionMenuItemProps) {
  return (
    <MenuItem
      value=""
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      sx={{
        mx: 0.75,
        my: 0.25,
        borderRadius: "10px",
        border: "1px solid",
        borderColor: disabled ? "rgba(226,232,240,0.9)" : "rgba(14,165,233,0.24)",
        background: disabled
          ? "linear-gradient(135deg,rgba(248,250,252,0.96),rgba(241,245,249,0.96))"
          : "linear-gradient(135deg,rgba(240,249,255,0.98),rgba(236,254,255,0.96))",
        alignItems: "center",
        gap: 1,
        py: 0.875,
        px: 1.125,
        minHeight: "56px",
        "&:hover": disabled
          ? undefined
          : {
              background:
                "linear-gradient(135deg,rgba(224,242,254,1),rgba(236,254,255,0.98))",
        },
      }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm">
        {icon ?? <HiMiniArrowUpRight className="text-base" />}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-[13px] font-bold leading-5 text-slate-900">{title}</p>
        <p className="truncate text-[11px] leading-4 text-slate-500">{description}</p>
      </div>
      {!disabled ? (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 text-sky-600">
          <HiMiniArrowUpRight className="text-sm" />
        </div>
      ) : null}
    </MenuItem>
  );
}
