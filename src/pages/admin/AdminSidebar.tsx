import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import { useTranslation } from "react-i18next";
import { 
  HiBars3BottomLeft, 
  HiMiniArrowLeftOnRectangle, 
  HiMiniCog6Tooth,
  HiMiniScissors, 
  HiMiniSquares2X2,
  HiMiniXMark,
  HiMiniChevronRight,
  HiOutlineBell
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";

function LogoBlock() {
  const navigate = useNavigate();
  return (
    <div className="group relative" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="relative flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 blur-md opacity-50"></div>
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M14.5 5.5 9 11m6.5-5.5A2.5 2.5 0 1 1 19 9m-4.5-3.5L20 11m-9 0-2.5 2.5M11 11l3 3m-5 2a2.5 2.5 0 1 1-3.5 3.5A2.5 2.5 0 0 1 9 16Zm0 0 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950">Sharp Cuts</h2>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const {
    state: { user },
    logout,
  } = useContextPro();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuItems = [
    { label: t("sidebar.dashboard"), to: "/admin", icon: HiMiniSquares2X2, description: t("sidebar.dashboardDesc") },
    { label: t("sidebar.barbers"), to: "/admin/barbers", icon: HiMiniScissors, description: t("sidebar.barbersDesc") },
    { label: t("sidebar.applications"), to: "/admin/applications", icon: HiMiniScissors, description: t("sidebar.applicationsDesc") },
    { label: t("sidebar.settings"), to: "/admin/settings", icon: HiMiniCog6Tooth, description: t("sidebar.settingsDesc") },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      if (onNavigate) onNavigate();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-white via-white to-slate-50/50">
      {/* Header */}
      <div className="border-b border-slate-200/60 px-5 py-6">
        <LogoBlock />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-6 custom-scrollbar">
        <div className="mb-6 px-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("sidebar.mainMenu")}</p>
        </div>
        <nav className="space-y-1.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || 
              (item.to !== "/admin" && location.pathname.startsWith(item.to));
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                onClick={onNavigate}
                className={`
                  group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300
                  ${isActive 
                    ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                  ${mounted ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}
                `}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-400 to-orange-400"></div>
                )}
                
                {/* Icon container */}
                <div className={`
                  relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300
                  ${isActive 
                    ? "bg-white/10 text-white" 
                    : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  }
                `}>
                  <Icon className="text-lg transition-transform duration-300 group-hover:scale-110" />
                </div>
                
                {/* Label and description */}
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-700"}`}>
                    {item.label}
                  </p>
                  <p className={`text-[10px] font-medium ${isActive ? "text-white/60" : "text-slate-400"}`}>
                    {item.description}
                  </p>
                </div>
                
                {/* Hover arrow */}
                <div className={`
                  transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                  ${isActive ? "text-white/60" : "text-slate-400"}
                `}>
                  <HiMiniChevronRight className="h-3 w-3" />
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200/60 px-4 py-5">
        {/* User Profile */}
        <div className="group relative mb-4">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-100/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="relative flex items-center gap-3 rounded-xl p-2 transition-all duration-300">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-600 text-sm font-black text-white shadow-md">
                {(user?.full_name ?? t("roles.admin"))
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-500 p-0.5 ring-2 ring-white">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-slate-950">{user?.full_name ?? t("sidebar.adminUser")}</p>
              <p className="truncate text-xs text-slate-500">{user?.email ?? "admin@sharpcuts.com"}</p>
            </div>
            <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
              <HiOutlineBell className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-60"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative flex items-center gap-3">
              <HiMiniArrowLeftOnRectangle className="text-lg transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
              <span>{isLoggingOut ? t("common.signingOut") : t("sidebar.signOut")}</span>
            </div>
          </button>
          
          <NavLink
            to="/admin/settings"
            onClick={onNavigate}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-all duration-300 hover:bg-slate-100 hover:text-slate-700"
          >
            <HiMiniCog6Tooth className="text-lg transition-transform duration-300 group-hover:rotate-90" />
            <span>{t("sidebar.settings")}</span>
          </NavLink>
        </div>
      </div>

    </div>
  );
}

export default function AdminSidebar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="group fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-900 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl lg:hidden"
        aria-label={t("sidebar.openMenu")}
      >
        <HiBars3BottomLeft className="text-xl transition-transform duration-300 group-hover:scale-110" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-80 shrink-0 self-start border-r border-slate-200/60 bg-white shadow-xl lg:sticky lg:top-0 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: "min(320px, 85vw)",
              borderRadius: "0",
              boxShadow: "none",
            },
          },
        }}
      >
        <div className="relative h-full">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-md transition-all hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label={t("sidebar.closeMenu")}
          >
            <HiMiniXMark className="text-xl" />
          </button>
          
          {/* Mobile Sidebar Content */}
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </div>
      </Drawer>
    </>
  );
}
