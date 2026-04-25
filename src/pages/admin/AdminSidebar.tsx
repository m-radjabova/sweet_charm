import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Drawer, IconButton, Tooltip } from "@mui/material";
import {
  HiBars3BottomLeft,
  HiMiniArrowLeftOnRectangle,
  HiMiniBuildingOffice2,
  HiMiniCog6Tooth,
  HiMiniCreditCard,
  HiMiniHome,
  HiMiniRectangleStack,
  HiMiniSquares2X2,
  HiMiniUserGroup,
  HiMiniUsers,
  HiMiniXMark,
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";
import type { UserRole } from "../../types/types";
import { getPrimaryRole, getUserRoleLabel, hasAnyRole } from "../../utils/roles";

const menuItems = [
  { label: "Dashboard", icon: HiMiniHome, to: "/admin", roles: ["admin"] },
  { label: "Studentlar", icon: HiMiniUsers, to: "/admin/students", roles: ["admin"] },
  { label: "O'qituvchilar", icon: HiMiniUserGroup, to: "/admin/teachers", roles: ["admin"] },
  { label: "Guruhlar", icon: HiMiniRectangleStack, to: "/admin/groups", roles: ["admin", "teacher"] },
  { label: "Kurslar", icon: HiMiniSquares2X2, to: "/admin/courses", roles: ["admin"] },
  { label: "To'lovlar", icon: HiMiniCreditCard, to: "/admin/payments", roles: ["admin"] },
  { label: "Sozlamalar", icon: HiMiniCog6Tooth, to: "/admin/settings", roles: ["admin", "teacher"] },
  { label: "Adminlar", icon: HiMiniBuildingOffice2, to: "/super-admin", roles: ["super_admin"] },
] satisfies Array<{
  label: string;
  icon: typeof HiMiniHome;
  to: string;
  roles: UserRole[];
}>;

function SidebarContent({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    logout,
    state: { user },
  } = useContextPro();

  const role = getPrimaryRole(user) ?? "admin";
  const visibleMenuItems = menuItems.filter((item) => hasAnyRole(user, item.roles as UserRole[]));

  const handleLogout = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await logout();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#111827_100%)] p-3 text-slate-100">
      <div className={`mb-6 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="overflow-hidden pr-3">
            <p className="truncate text-[11px] uppercase tracking-[0.32em] text-slate-400">
              {user?.course_center_name ?? "Course Center"}
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              {role === "teacher" ? "Teacher Panel" : role === "super_admin" ? "Super Admin Panel" : "Admin Panel"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">{getUserRoleLabel(user)}</p>
          </div>
        )}

        <IconButton
          onClick={onToggle}
          aria-label={collapsed ? "Sidebarni ochish" : "Sidebarni yopish"}
          sx={{
            color: "#f8fafc",
            backgroundColor: "rgba(255,255,255,0.06)",
            borderRadius: "16px",
            width: 42,
            height: 42,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
          }}
        >
          <HiBars3BottomLeft size={20} />
        </IconButton>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const navItem = (
            <NavLink
              to={item.to}
              end={item.to === "/admin"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex min-h-14 items-center rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  collapsed ? "justify-center" : "gap-3"
                } ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon className="shrink-0 text-[22px]" />
              <span className={collapsed ? "hidden" : "block truncate"}>{item.label}</span>
            </NavLink>
          );

          return collapsed ? (
            <Tooltip key={item.to} title={item.label} placement="right" arrow>
              <div>{navItem}</div>
            </Tooltip>
          ) : (
            <div key={item.to}>{navItem}</div>
          );
        })}
      </nav>

      <div className="pt-4">
        <button
          onClick={handleLogout}
          disabled={isSubmitting}
          className={`group relative flex w-full items-center overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92))] text-left text-white shadow-[0_20px_48px_rgba(2,6,23,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400/35 hover:shadow-[0_28px_56px_rgba(239,68,68,0.18)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${
            collapsed ? "h-14 justify-center px-0" : "min-h-[72px] gap-4 px-4 py-3"
          }`}
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(135deg,transparent,rgba(239,68,68,0.12))] opacity-90 transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-60" />
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-red-300/30 group-hover:bg-red-500/12">
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <HiMiniArrowLeftOnRectangle className="text-[22px]" />
            )}
          </span>
          {!collapsed && (
            <span className="relative min-w-0 flex-1">
              <span className="block truncate text-base font-black tracking-tight">
                {isSubmitting ? "Chiqilmoqda..." : "Chiqish"}
              </span>
              <span className="mt-0.5 block truncate text-xs font-medium text-slate-400">
                {isSubmitting ? "Iltimos, biroz kuting" : "Hisobdan chiqish"}
              </span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-900 shadow-lg backdrop-blur lg:hidden"
        aria-label="Admin menyusini ochish"
      >
        <HiBars3BottomLeft size={20} />
      </button>

      <aside
        className={`sticky top-0 hidden h-screen border-r border-slate-800 bg-slate-950 text-slate-100 shadow-xl transition-all duration-300 ease-in-out lg:block ${
          collapsed ? "w-24" : "w-72"
        }`}
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
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
          <SidebarContent collapsed={false} onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
        </div>
      </Drawer>
    </>
  );
}
