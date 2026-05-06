import { useEffect, useState } from "react";
import { Drawer } from "@mui/material";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  HiBars3BottomLeft,
  HiMiniArrowLeftOnRectangle,
  HiMiniCalendarDays,
  HiMiniCog6Tooth,
  HiMiniScissors,
  HiMiniSquares2X2,
  HiMiniXMark,
  HiOutlineBell,
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function LogoBlock() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate("/")} className="group relative w-full text-left">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-slate-900 opacity-50 blur-md" />
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
            <HiMiniScissors className="h-5 w-5" />
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-0.5 ring-2 ring-white">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-950">Sharp Cuts</h2>
          <p className="text-xs font-semibold text-slate-400">{t("barberSidebar.subtitle")}</p>
        </div>
      </div>
    </button>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    logout,
    state: { user },
  } = useContextPro();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { label: t("barberSidebar.items.dashboard.label"), to: "/barber", icon: HiMiniSquares2X2, description: t("barberSidebar.items.dashboard.desc") },
    { label: t("barberSidebar.items.schedule.label"), to: "/barber/schedule", icon: HiMiniCalendarDays, description: t("barberSidebar.items.schedule.desc") },
    { label: t("barberSidebar.items.settings.label"), to: "/barber/settings", icon: HiMiniCog6Tooth, description: t("barberSidebar.items.settings.desc") },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      onNavigate?.();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-white via-white to-slate-50/60">
      <div className="border-b border-slate-200/60 px-5 py-6">
        <LogoBlock />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        <div className="mb-6 px-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("barberSidebar.menuTitle")}</p>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/barber" && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/barber"}
                onClick={onNavigate}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                } ${mounted ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-400 to-orange-400" />
                )}

                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                    isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  }`}
                >
                  <Icon className="text-lg" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${isActive ? "text-white" : "text-slate-700"}`}>
                    {item.label}
                  </p>
                  <p className={`truncate text-[10px] font-medium ${isActive ? "text-white/60" : "text-slate-400"}`}>
                    {item.description}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200/60 px-4 py-5">
        <div className="mb-4 flex items-center gap-3 rounded-xl p-2">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.full_name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-black text-white">
              {getInitials(user?.full_name ?? "B")}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-950">{user?.full_name ?? t("roles.barber")}</p>
            <p className="truncate text-xs text-slate-500">{user?.email ?? "barber@sharpcuts.com"}</p>
          </div>
          <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            <HiOutlineBell className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:opacity-60"
        >
          <HiMiniArrowLeftOnRectangle className="text-lg" />
          <span>{isLoggingOut ? t("common.signingOut") : t("sidebar.signOut")}</span>
        </button>
      </div>
    </div>
  );
}

export default function BarberSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-900 shadow-lg backdrop-blur-sm transition hover:bg-white lg:hidden"
      >
        <HiBars3BottomLeft className="text-xl" />
      </button>

      <aside className="hidden h-screen w-80 shrink-0 self-start border-r border-slate-200/60 bg-white shadow-xl lg:sticky lg:top-0 lg:block">
        <SidebarContent />
      </aside>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: { width: "min(320px, 85vw)", borderRadius: "0", boxShadow: "none" },
          },
        }}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-md transition hover:bg-slate-100"
          >
            <HiMiniXMark className="text-xl" />
          </button>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </div>
      </Drawer>
    </>
  );
}
