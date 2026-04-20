import { useState } from "react";
import { NavLink } from "react-router-dom";
import { IconButton, Tooltip } from "@mui/material";
import {
  HiBars3BottomLeft,
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
];

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    logout,
    state: { user },
  } = useContextPro();
  const role = user?.role ?? "admin";
  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(role),
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
                Course Center
              </p>
              <h2 className="mt-2 text-xl font-bold text-white">
                {role === "teacher" ? "Teacher Panel" : "Admin Panel"}
              </h2>
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
                className="flex h-14 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition-all duration-300 hover:bg-red-500/20"
              >
                <HiMiniArrowLeftOnRectangle className="text-[22px]" />
              </button>
            </Tooltip>
          ) : (
            <button
              onClick={logout}
              className="flex h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-500/20"
            >
              <HiMiniArrowLeftOnRectangle className="text-[22px]" />
              <span>Chiqish</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;