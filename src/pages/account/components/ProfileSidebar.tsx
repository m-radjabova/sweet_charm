import { Link } from "react-router-dom";
import {
  HiMiniArrowLeft,
  HiMiniCog6Tooth,
  HiMiniXMark,
  HiMiniGift,
  HiMiniHeart,
  HiMiniHome,
  HiMiniMapPin,
  HiMiniPower,
  HiMiniShoppingBag,
  HiMiniSparkles,
  HiMiniSquares2X2,
} from "react-icons/hi2";
import profileBunnyIcon from "../../../assets/profile/profile_bunny_icon.png";
import type { ProfileTab } from "../types";

const items = [
  { id: "dashboard" as const, label: "Dashboard", icon: HiMiniHome },
  { id: "orders" as const, label: "My Orders", icon: HiMiniShoppingBag },
  { id: "favorites" as const, label: "Favorites", icon: HiMiniHeart },
  { id: "rewards" as const, label: "Rewards", icon: HiMiniGift },
  { id: "coupons" as const, label: "My Coupons", icon: HiMiniSparkles },
  { id: "addresses" as const, label: "Addresses", icon: HiMiniMapPin },
  { id: "settings" as const, label: "Settings", icon: HiMiniCog6Tooth },
];

interface Props {
  activeTab: ProfileTab;
  isAdmin: boolean;
  isOpen?: boolean;
  onTabChange: (tab: ProfileTab) => void;
  onLogout: () => void;
  onClose?: () => void;
}

export default function ProfileSidebar({
  activeTab,
  isAdmin,
  isOpen = false,
  onTabChange,
  onLogout,
  onClose,
}: Props) {
  const sidebarContent = (
    <aside className="group/sidebar flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(175,117,60,0.10)] xl:w-[270px] xl:rounded-2xl xl:sticky xl:top-4 xl:self-start xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:[scrollbar-width:thin] xl:[scrollbar-color:#F2C9D6_transparent]">
      <div className="flex items-center justify-between border-b border-[#F5E6D8]/60 px-4 py-3 xl:hidden">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C28564]">
          Profile Menu
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0F3] text-[#F25D88] transition-transform duration-200 active:scale-95"
          aria-label="Close profile menu"
        >
          <HiMiniXMark className="h-5 w-5" />
        </button>
      </div>

      {/* Brand */}
      <div className="relative overflow-hidden border-b border-[#F5E6D8]/60 px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-gradient-to-br from-[#FFE3EC] to-transparent opacity-70"
        />
        <Link to="/" className="relative inline-flex flex-col" onClick={onClose}>
          <span className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[2.2rem] leading-none text-[#5C3805] tracking-tight sm:text-[2.8rem]">
            Sweet
            <span className="text-[#F25D88]">Charm</span>
          </span>
          <span className="mt-1 text-[0.65rem] font-semibold text-[#C28564] tracking-[0.25em] uppercase">
            Desserts &amp; Happiness
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-2 sm:px-3 sm:py-3">
        <Link
          to="/"
          onClick={onClose}
          className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-[#7F5B30] transition-all duration-200 hover:bg-[#FFF4E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C9D6] active:scale-[0.98] sm:px-4 sm:py-2.5"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF0F3] text-[#F25D88] transition-transform duration-200 group-hover:-translate-x-0.5">
            <HiMiniArrowLeft className="h-4 w-4" />
          </span>
          Back to Home
        </Link>

        {isAdmin ? (
          <Link
            to="/dashboard"
            onClick={onClose}
            className="group flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#7F5B30] transition-all duration-200 hover:bg-[#FFF4E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C9D6] active:scale-[0.98]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFF0F3] to-[#FFF5E1] text-[#F25D88] transition-transform duration-200 group-hover:scale-105">
              <HiMiniSquares2X2 className="h-4 w-4" />
            </span>
            Admin Panel
          </Link>
        ) : null}

        <div className="my-2 border-t border-[#F5E6D8]/50" />

        {items.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                onTabChange(id);
                onClose?.();
              }}
              aria-current={active ? "page" : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C9D6] active:scale-[0.98] ${
                active
                  ? "bg-gradient-to-r from-[#FFE8EF] to-[#FFF5E1] text-[#F25D88] shadow-[0_2px_10px_rgba(242,93,136,0.12)]"
                  : "text-[#7F5B30] hover:bg-[#FFF4E8]"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-[#F25D88] transition-all duration-200 ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />

              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-white text-[#F25D88] shadow-sm"
                    : "text-[#C28564] group-hover:bg-white/70 group-hover:text-[#F25D88]"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>

              <span className="flex-1 text-left">{label}</span>

              {active ? (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F25D88]" />
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="px-2 pb-2 sm:px-3">
        <div className="border-t border-[#F5E6D8]/50 pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#EF6F8B] transition-all duration-200 hover:bg-[#FFF1F4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C9D6] active:scale-[0.98]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF0F3] text-[#F25D88] transition-transform duration-200 group-hover:rotate-12">
              <HiMiniPower className="h-4 w-4" />
            </span>
            Logout
          </button>
        </div>
      </div>

      <div className="mx-2 mb-3 mt-1 overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FFF0E8] p-2 shadow-inner sm:mx-3 sm:p-3">
        <img
        loading="lazy"
          src={profileBunnyIcon}
          alt="Sweet bunny mascot"
          className="mx-auto h-16 w-16 object-contain drop-shadow-lg transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105 sm:h-20 sm:w-20"
        />
        <p className="mt-1.5 text-center text-[11px] leading-4 text-[#9A6E42]">
          Life is short,
          <span className="block font-semibold text-[#F25D88]">eat dessert first!</span>
        </p>
      </div>
    </aside>
  );

  return (
    <>
      <div className="hidden xl:block xl:w-[270px] xl:shrink-0">{sidebarContent}</div>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#4A2800]/30 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close profile sidebar"
          />
          <div className="absolute inset-y-0 left-0 w-[min(88vw,360px)] p-3">
            <div className="h-full animate-[slideInLeft_0.28s_cubic-bezier(0.16,1,0.3,1)]">
              {sidebarContent}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
