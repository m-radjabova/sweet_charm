import { useState } from "react";
import { NavLink } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import {
  HiBars3BottomLeft,
  HiMiniBuildingOffice2,
  HiMiniArrowLeftOnRectangle,
  HiMiniCog6Tooth,
  HiMiniCreditCard,
  HiMiniHome,
  HiMiniRectangleStack,
  HiMiniSquares2X2,
  HiMiniUsers,
  HiMiniUserGroup,
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";
import type { UserRole } from "../../types/types";
import { getPrimaryRole, getUserRoleLabel, hasAnyRole } from "../../utils/roles";

const menuItems = [
  { label: "Dashboard", icon: HiMiniHome, to: "/admin", roles: ["admin"] },
  {
    label: "Studentlar",
    icon: HiMiniUsers,
    to: "/admin/students",
    roles: ["admin"],
  },
  {
    label: "O'qituvchilar",
    icon: HiMiniUserGroup,
    to: "/admin/teachers",
    roles: ["admin"],
  },
  {
    label: "Guruhlar",
    icon: HiMiniRectangleStack,
    to: "/admin/groups",
    roles: ["admin", "teacher"],
  },
  {
    label: "Kurslar",
    icon: HiMiniSquares2X2,
    to: "/admin/courses",
    roles: ["admin"],
  },
  {
    label: "To'lovlar",
    icon: HiMiniCreditCard,
    to: "/admin/payments",
    roles: ["admin"],
  },
  {
    label: "Sozlamalar",
    icon: HiMiniCog6Tooth,
    to: "/admin/settings",
    roles: ["admin", "teacher"],
  },
  {
    label: "Adminlar",
    icon: HiMiniBuildingOffice2,
    to: "/super-admin",
    roles: ["super_admin"],
  },
] satisfies Array<{
  label: string;
  icon: typeof HiMiniHome;
  to: string;
  roles: UserRole[];
}>;

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    logout,
    state: { user },
  } = useContextPro();
  const role = getPrimaryRole(user) ?? "admin";
  const visibleMenuItems = menuItems.filter((item) =>
    hasAnyRole(user, item.roles as UserRole[]),
  );

  return (
    <aside
      className={`sticky top-0 hidden h-screen border-r border-slate-800 bg-slate-950 text-slate-100 shadow-xl lg:block transition-all duration-300 ease-in-out ${
        collapsed ? "w-24" : "w-72"
      }`}
    >
      <div className="flex h-full flex-col p-3">
        {/* Header */}
        <div
          className={`mb-6 flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">
                {user?.course_center_name ?? "Course Center"}
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                {role === "teacher"
                  ? "Teacher Panel"
                  : role === "super_admin"
                  ? "Super Admin Panel"
                  : "Admin Panel"}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {getUserRoleLabel(user)}
              </p>
            </div>
          )}

          <IconButton
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Sidebarni ochish" : "Sidebarni yopish"}
            sx={{
              color: "#f8fafc",
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: "16px",
              width: 42,
              height: 42,
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.12)",
              },
            }}
          >
            <HiBars3BottomLeft size={20} />
          </IconButton>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;

            const navItem = (
              <NavLink
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `group flex h-14 items-center rounded-2xl px-4 text-sm font-medium transition-all duration-300 ${
                    collapsed ? "justify-center" : "gap-3"
                  } ${
                    isActive
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="shrink-0 text-[22px]" />
                <span
                  className={`whitespace-nowrap transition-all duration-200 ${
                    collapsed
                      ? "w-0 overflow-hidden opacity-0"
                      : "w-auto opacity-100"
                  }`}
                >
                  {item.label}
                </span>
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

        {/* Logout */}
        <div className="pt-4">
          {collapsed ? (
            <Tooltip title="Chiqish" placement="right" arrow>
              <button
                onClick={logout}
                aria-label="Chiqish"
                className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.88))] text-white shadow-[0_16px_36px_rgba(2,6,23,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400/30 hover:shadow-[0_22px_42px_rgba(239,68,68,0.18)]"
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(248,250,252,0.14),transparent_45%),linear-gradient(135deg,transparent,rgba(239,68,68,0.16))] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors duration-300 group-hover:bg-red-500/15">
                  <HiMiniArrowLeftOnRectangle className="text-[22px]" />
                </span>
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={logout}
              className="group relative flex h-[72px] w-full items-center gap-4 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.92))] px-5 text-left text-white shadow-[0_20px_48px_rgba(2,6,23,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400/35 hover:shadow-[0_28px_56px_rgba(239,68,68,0.18)]"
            >
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(135deg,transparent,rgba(239,68,68,0.12))] opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 group-hover:border-red-300/30 group-hover:bg-red-500/12">
                <HiMiniArrowLeftOnRectangle className="text-[24px]" />
              </span>
              <span className="relative flex min-w-0 flex-1 items-center justify-between gap-3">
                <span>
                  <span className="block text-lg font-black tracking-tight">Chiqish</span>
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
