import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Drawer, IconButton, Tooltip } from "@mui/material";
import {
  HiBars3BottomLeft,
  HiMiniArrowLeftOnRectangle,
  HiMiniBookOpen,
  HiMiniCog6Tooth,
  HiMiniCreditCard,
  HiMiniHome,
  HiMiniXMark,
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";

const menuItems = [
  { label: "Dashboard", icon: HiMiniHome, to: "/student" },
  { label: "Darslarim", icon: HiMiniBookOpen, to: "/student/lessons" },
  { label: "To'lovlarim", icon: HiMiniCreditCard, to: "/student/payments" },
  { label: "Sozlamalar", icon: HiMiniCog6Tooth, to: "/student/settings" },
];

function SidebarContent({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const {
    logout,
    state: { user },
  } = useContextPro();

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#0f2f2c_0%,#0b1f29_55%,#07141f_100%)] p-3 text-white">
      <div
        className={`mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-[11px] uppercase tracking-[0.35em] text-emerald-200/60">
              Course Center
            </p>
            <h2 className="mt-2 text-xl font-black text-white">
              Student Panel
            </h2>
            <p className="mt-1 truncate text-xs text-emerald-100/75">
              {user?.full_name ?? "Student"}
            </p>
          </div>
        )}

        <IconButton
          onClick={onToggle}
          aria-label={collapsed ? "Sidebarni ochish" : "Sidebarni yig'ish"}
          sx={{
            color: "#ecfeff",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: "16px",
            width: 42,
            height: 42,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.14)",
            },
          }}
        >
          <HiBars3BottomLeft size={20} />
        </IconButton>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/student"}
              className={({ isActive }) =>
                `group flex h-14 items-center rounded-2xl px-4 text-sm font-semibold transition-all duration-300 ${
                  collapsed ? "justify-center" : "gap-3"
                } ${
                  isActive
                    ? "bg-emerald-500/85 text-white shadow-sm shadow-emerald-500/20 ring-1 ring-white/10"
                    : "text-slate-300/80 hover:bg-white/8 hover:text-slate-100 transition-all duration-200"
                }`
              }
            >
              <Icon className="shrink-0 text-[22px]" />
              <span className={collapsed ? "hidden" : "block"}>
                {item.label}
              </span>
            </NavLink>
          );

          return collapsed ? (
            <Tooltip key={item.to} title={item.label} placement="right" arrow>
              <div>{link}</div>
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      <button
        onClick={logout}
        className={`mt-4 flex h-14 items-center rounded-2xl border border-white/10 bg-white/6 text-sm font-semibold text-white transition-all duration-300 hover:bg-rose-500/20 ${
          collapsed ? "justify-center px-0" : "gap-3 px-4"
        }`}
      >
        <HiMiniArrowLeftOnRectangle className="text-[22px]" />
        {!collapsed && <span>Chiqish</span>}
      </button>
    </div>
  );
}

export default function StudentSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-white/90 text-slate-900 shadow-lg backdrop-blur lg:hidden"
        aria-label="Student menyusini ochish"
      >
        <HiBars3BottomLeft size={20} />
      </button>

      <aside
        className={`sticky top-0 hidden h-screen border-r border-emerald-950/40 shadow-[0_24px_80px_rgba(4,20,28,0.24)] lg:block ${
          collapsed ? "w-24" : "w-80"
        }`}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />
      </aside>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              background: "transparent",
              boxShadow: "none",
            },
          },
        }}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white"
            aria-label="Menyuni yopish"
          >
            <HiMiniXMark size={22} />
          </button>
          <SidebarContent
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
          />
        </div>
      </Drawer>
    </>
  );
}