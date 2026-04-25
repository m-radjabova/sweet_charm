import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Drawer, IconButton, Tooltip } from "@mui/material";
import {
  HiBars3BottomLeft,
  HiMiniArrowLeftOnRectangle,
  HiMiniBookOpen,
  HiMiniClipboardDocumentCheck,
  HiMiniCog6Tooth,
  HiMiniCreditCard,
  HiMiniHome,
  HiMiniXMark,
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";

const menuItems = [
  { label: "Dashboard", icon: HiMiniHome, to: "/student" },
  { label: "Darslarim", icon: HiMiniBookOpen, to: "/student/lessons" },
  { label: "Davomatim", icon: HiMiniClipboardDocumentCheck, to: "/student/attendance" },
  { label: "To'lovlarim", icon: HiMiniCreditCard, to: "/student/payments" },
  { label: "Sozlamalar", icon: HiMiniCog6Tooth, to: "/student/settings" },
];

function SidebarContent({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const {
    logout,
    state: { user },
  } = useContextPro();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await logout();
    } catch (error) {
      console.error("Chiqishda xatolik:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

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

      <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/student"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex min-h-14 items-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  collapsed ? "justify-center" : "gap-3"
                } ${
                  isActive
                    ? "bg-emerald-500/85 text-white shadow-sm shadow-emerald-500/20 ring-1 ring-white/10"
                    : "text-slate-300/80 hover:bg-white/8 hover:text-slate-100 transition-all duration-200"
                }`
              }
            >
              <Icon className="shrink-0 text-[22px]" />
              <span className={collapsed ? "hidden" : "block truncate"}>
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
              onClick={handleLogout}
              disabled={isSubmitting}
              className="group relative flex min-h-[64px] w-full items-center gap-4 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92))] px-4 py-3 text-left text-white shadow-[0_20px_48px_rgba(2,6,23,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400/35 hover:shadow-[0_28px_56px_rgba(239,68,68,0.18)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:border-white/10 disabled:hover:shadow-[0_20px_48px_rgba(2,6,23,0.38)]"
            >
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(135deg,transparent,rgba(239,68,68,0.12))] opacity-90 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-60" />

              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-red-300/30 group-hover:bg-red-500/12 group-disabled:bg-white/5">
                {isSubmitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <HiMiniArrowLeftOnRectangle className="text-[24px]" />
                )}
              </span>

              <span className="relative flex min-w-0 flex-1 items-center justify-between gap-3">
                <span>
                  <span className="block text-base font-black tracking-tight sm:text-lg">
                    {isSubmitting ? "Chiqilmoqda..." : "Chiqish"}
                  </span>

                  <span className="mt-0.5 block text-xs font-medium text-slate-400">
                    {isSubmitting
                      ? "Iltimos, biroz kuting"
                      : "Hisobdan chiqish"}
                  </span>
                </span>
              </span>
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
              width: "min(320px, 86vw)",
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
            onNavigate={() => setMobileOpen(false)}
          />
        </div>
      </Drawer>
    </>
  );
}
