import { Link } from "react-router-dom";
import {
  HiMiniArrowLeft,
  HiMiniCog6Tooth,
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
  onTabChange: (tab: ProfileTab) => void;
  onLogout: () => void;
}

export default function ProfileSidebar({ activeTab, isAdmin, onTabChange, onLogout }: Props) {
  return (
    <aside className="group/sidebar flex w-full shrink-0 flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(175,117,60,0.10)] xl:w-[270px] xl:sticky xl:top-4 xl:self-start xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto xl:[scrollbar-width:thin] xl:[scrollbar-color:#F2C9D6_transparent]">
      {/* Brand */}
      <div className="relative overflow-hidden border-b border-[#F5E6D8]/60 px-6 pb-5 pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-gradient-to-br from-[#FFE3EC] to-transparent opacity-70"
        />
        <Link to="/" className="relative inline-flex flex-col">
          <span className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[2.8rem] leading-none text-[#5C3805] tracking-tight">
            Sweet
            <span className="text-[#F25D88]">Charm</span>
          </span>
          <span className="mt-1 text-[0.65rem] font-semibold text-[#C28564] tracking-[0.25em] uppercase">
            Desserts &amp; Happiness
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-3">
        <Link
          to="/"
          className="group flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold text-[#7F5B30] transition-all duration-200 hover:bg-[#FFF4E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C9D6] active:scale-[0.98]"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF0F3] text-[#F25D88] transition-transform duration-200 group-hover:-translate-x-0.5">
            <HiMiniArrowLeft className="h-4 w-4" />
          </span>
          Back to Home
        </Link>

        {isAdmin ? (
          <Link
            to="/dashboard"
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
              onClick={() => onTabChange(id)}
              aria-current={active ? "page" : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C9D6] active:scale-[0.98] ${
                active
                  ? "bg-gradient-to-r from-[#FFE8EF] to-[#FFF5E1] text-[#F25D88] shadow-[0_2px_10px_rgba(242,93,136,0.12)]"
                  : "text-[#7F5B30] hover:bg-[#FFF4E8]"
              }`}
            >
              {/* Active indicator rail */}
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

      {/* Logout */}
      <div className="px-3 pb-2">
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

      {/* Footer */}
      <div className="mx-3 mb-3 mt-1 overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF8EE] to-[#FFF0E8] p-3 shadow-inner">
        <img
          src={profileBunnyIcon}
          alt="Sweet bunny mascot"
          className="mx-auto h-20 w-20 object-contain drop-shadow-lg transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105"
        />
        <p className="mt-1.5 text-center text-[11px] leading-4 text-[#9A6E42]">
          Life is short,
          <span className="block font-semibold text-[#F25D88]">eat dessert first!</span>
        </p>
      </div>
    </aside>
  );
}
