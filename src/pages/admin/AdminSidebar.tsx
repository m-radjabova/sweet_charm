import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Drawer } from "@mui/material";
import { useTranslation } from "react-i18next";
import { 
  HiBars3BottomLeft, 
  HiMiniArrowLeftOnRectangle, 
  HiMiniCog6Tooth,
  HiMiniSquares2X2,
  HiMiniXMark,
  HiMiniChevronRight,
  HiOutlineBell,
  HiOutlineHeart,
  HiOutlineSparkles,
  HiOutlineTag,
  HiOutlineTicket,
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";

function LogoBlock() {
  const navigate = useNavigate();
  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => navigate("/")}
    >
      {/* Glow behind logo */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary-soft)]/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-center gap-3">
        {/* Icon */}
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-primary-soft)]/20 blur-md" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-strong)] text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-[var(--color-primary)]/25">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
            >
              <path
                d="M12 6C12 6 9.5 8 7 10C4.5 12 4 14 4 16C4 18 5.5 19.5 7 20C8.5 20.5 10.5 19.5 12 18C13.5 19.5 15.5 20.5 17 20C18.5 19.5 20 18 20 16C20 14 19.5 12 17 10C14.5 8 12 6 12 6Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity="0.2"
              />
              <path
                d="M12 6C12 6 14.5 8.5 16 10.5M12 6C12 6 9.5 8.5 8 10.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Status dot */}
          <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-400 p-0.5 ring-2 ring-white">
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Text */}
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-[var(--color-brown)]">
            Sweet
            <span className="text-[var(--color-primary)]"> Charm</span>
          </h2>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-faint)]">
            Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const {
    state: { user },
    logout,
  } = useContextPro();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      to: "/dashboard",
      icon: HiMiniSquares2X2,
      description: "Overview & stats",
    },
    {
      label: "Desserts",
      to: "/dashboard/desserts",
      icon: HiOutlineSparkles,
      description: "Manage products",
    },
    {
      label: "Categories",
      to: "/dashboard/categories",
      icon: HiOutlineTag,
      description: "Organize menu",
    },
    {
      label: "Orders",
      to: "/dashboard/orders",
      icon: HiOutlineSparkles,
      description: "Customer orders",
    },
    {
      label: "Reviews",
      to: "/dashboard/reviews",
      icon: HiOutlineHeart,
      description: "Customer feedback",
    },
    {
      label: "Customers",
      to: "/dashboard/customers",
      icon: HiOutlineBell,
      description: "Manage users",
    },
    {
      label: "Coupons",
      to: "/dashboard/coupons",
      icon: HiOutlineTicket,
      description: "Discount campaigns",
    },
    {
      label: "Settings",
      to: "/dashboard/settings",
      icon: HiMiniCog6Tooth,
      description: "Panel preferences",
    }
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
    <div className="flex h-full flex-col bg-gradient-to-b from-[var(--color-surface)] via-[var(--color-page-bg)] to-[var(--color-surface)]">
      {/* Header — Logo */}
      <div className="relative border-b border-[var(--color-border-soft)] px-5 py-6">
        {/* Decorative corner flowers */}
        <span className="absolute -left-1 -top-1 text-[10px] opacity-40">🌸</span>
        <span className="absolute -right-1 -top-1 text-[10px] opacity-40">✨</span>
        <LogoBlock />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="mb-5 flex items-center gap-2 px-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border-soft)] to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-faint)]">
            Main Menu
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-border-soft)] to-transparent" />
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/dashboard" && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                onClick={onNavigate}
                className={`
                  group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary-soft)]/5 text-[var(--color-primary-deep)] shadow-[0_4px_16px_var(--color-primary)_15]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-border-soft)]/50 hover:text-[var(--color-brown)]"
                  }
                  ${mounted ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}
                `}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                {/* Active indicator — cute dot */}
                {isActive && (
                  <>
                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-soft)] shadow-[0_0_8px_var(--color-primary)_60]" />
                    <div className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--color-primary-soft)] opacity-40 blur-sm" />
                  </>
                )}

                {/* Icon container */}
                <div
                  className={`
                    relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300
                    ${
                      isActive
                        ? "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-strong)] text-white shadow-[0_4px_12px_var(--color-primary)_35]"
                        : "bg-white/70 text-[var(--color-text-faint)] shadow-[0_2px_8px_var(--shadow-brown)] group-hover:bg-white group-hover:text-[var(--color-brown)] group-hover:shadow-[0_4px_12px_var(--shadow-brown)]"
                    }
                  `}
                >
                  <Icon className="text-lg transition-transform duration-300 group-hover:scale-110" />
                </div>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold ${
                      isActive ? "text-[var(--color-primary-deep)]" : "text-[var(--color-brown)]"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`text-[10px] font-medium ${
                      isActive ? "text-[var(--color-primary-deep)]/60" : "text-[var(--color-text-faint)]"
                    }`}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Arrow hint */}
                <div
                  className={`
                    transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0
                    ${isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-faint)]"}
                  `}
                >
                  <HiMiniChevronRight className="h-3.5 w-3.5" />
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom decorative dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary-soft)] opacity-30" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] opacity-40" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary-soft)] opacity-30" />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[var(--color-border-soft)] px-4 py-5">
        {/* User Profile Card */}
        <div className="group relative mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative flex items-center gap-3 rounded-2xl bg-[var(--color-surface)] p-2.5 shadow-[0_2px_12px_var(--shadow-brown)] transition-all duration-300 group-hover:shadow-[0_4px_16px_var(--shadow-brown)]">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-strong)] text-sm font-black text-white shadow-md">
                {(user?.full_name ?? "Admin")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-400 p-0.5 ring-2 ring-white">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-[var(--color-brown)]">
                {user?.full_name ?? "Sweet Admin"}
              </p>
              <p className="truncate text-xs font-medium text-[var(--color-text-faint)]">
                {user?.email ?? "admin@sweetcharm.com"}
              </p>
            </div>

            {/* Notification bell */}
            <button className="relative shrink-0 rounded-xl p-2 text-[var(--color-text-faint)] transition-all hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]">
              <HiOutlineBell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-primary)] ring-2 ring-white" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5">
          <button
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-[var(--color-text-muted)] transition-all duration-300 hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-60"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center gap-3">
              <HiMiniArrowLeftOnRectangle className="text-lg transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
              <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
            </div>
          </button>

          <NavLink
            to="/dashboard/settings"
            onClick={onNavigate}
            className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[var(--color-text-faint)] transition-all duration-300 hover:bg-[var(--color-border-soft)]/50 hover:text-[var(--color-brown)]"
          >
            <HiMiniCog6Tooth className="text-lg transition-transform duration-300 group-hover:rotate-90" />
            <span>Settings</span>
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="group fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border-soft)] bg-white/80 text-[var(--color-brown)] shadow-[0_4px_16px_var(--shadow-brown)] backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-[0_8px_24px_var(--shadow-brown)] lg:hidden"
        aria-label={t("sidebar.openMenu")}
      >
        <HiBars3BottomLeft className="text-xl transition-transform duration-300 group-hover:scale-110" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-72 shrink-0 self-start border-r border-[var(--color-border-soft)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-page-bg)] shadow-[4px_0_24px_var(--shadow-brown)] lg:sticky lg:top-0 lg:block">
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
              borderRadius: "0 16px 16px 0",
              boxShadow: "none",
              background: "transparent",
            },
          },
        }}
      >
        <div className="relative h-full">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--color-brown)] shadow-[0_4px_12px_var(--shadow-brown)] transition-all hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] lg:hidden"
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
