import { type ChangeEvent, type RefObject } from "react";
import {
  HiMiniCamera,
  HiMiniEnvelope,
  HiMiniPencil,
  HiMiniPhone,
  HiMiniShieldCheck,
  HiMiniStar,
  HiMiniTrash,
} from "react-icons/hi2";
import type { User } from "../../../types/types";
import profileBunnyCupcake from "../../../assets/profile/profile_bunny2.png";
import { formatDisplayPhone, formatMonthYear, getInitials } from "../utils";

interface Props {
  profile: User | null | undefined;
  memberTier: string;
  avatarBusy: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDeleteAvatar: () => void;
  onEditProfile: () => void;
}

export default function ProfileHero({
  profile,
  memberTier,
  avatarBusy,
  fileInputRef,
  onAvatarChange,
  onDeleteAvatar,
  onEditProfile,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-[0_8px_32px_rgba(175,117,60,0.10)]">
      {/* Decorative gradient blob */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-[#FFE8EF]/40 to-[#FFF5E1]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-gradient-to-tr from-[#FFF5E1]/30 to-[#FFE8EF]/10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
        {/* Left Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Avatar */}
          <div className="relative mx-auto md:mx-0">
            <div className="flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-2xl border-[4px] border-white bg-gradient-to-br from-[#FFF1F5] via-[#FFF6E9] to-[#FFE8EF] shadow-lg ring-2 ring-[#F25D88]/10 lg:h-[160px] lg:w-[160px]">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.full_name ?? "Profile avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-[2.8rem] font-bold text-[#6F420B] lg:text-[3.2rem]">
                  {getInitials(profile?.full_name)}
                </span>
              )}
            </div>

            {/* Camera button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarBusy}
              className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF89AA] to-[#F45C87] text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              aria-label="Upload avatar"
            >
              <HiMiniCamera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>

          {/* Info */}
          <div className="space-y-2.5 text-center md:text-left">
            <div>
              <h1 className="text-[clamp(1.8rem,3vw,2.8rem)] font-bold leading-tight text-[#4A2800]">
                {profile?.full_name ?? "Sweet guest"}
              </h1>
              <div className="mt-1.5 flex flex-col gap-1.5 text-sm text-[#92663B] sm:flex-row sm:flex-wrap sm:items-center">
                <span className="inline-flex items-center gap-1.5">
                  <HiMiniEnvelope className="h-4 w-4 text-[#F25D88]" />
                  {profile?.email ?? "hello@sweetcharm.com"}
                </span>
                <span className="hidden sm:inline text-[#D4B094]">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <HiMiniPhone className="h-4 w-4 text-[#F25D88]" />
                  {formatDisplayPhone(profile?.phone)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FFE8EF] to-[#FFF3DB] px-3 py-1.5 text-xs font-semibold text-[#F25D88] shadow-sm">
                <HiMiniStar className="h-3.5 w-3.5" />
                {memberTier}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#8E6135]">
                <HiMiniShieldCheck className="h-3.5 w-3.5 text-[#F25D88]" />
                Member since {formatMonthYear(profile?.created_at)}
              </span>
            </div>

            {profile?.avatar ? (
              <button
                type="button"
                onClick={onDeleteAvatar}
                disabled={avatarBusy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#FFD6DD] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#F25D88] transition-all duration-200 hover:bg-[#FFF1F4] hover:shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <HiMiniTrash className="h-3.5 w-3.5" />
                Remove avatar
              </button>
            ) : null}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-center gap-2.5 lg:items-end">
          <img
            src={profileBunnyCupcake}
            alt="Sweet bunny cupcake"
            className="h-28 w-28 object-contain drop-shadow-lg lg:h-36 lg:w-36"
          />
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#FF89AA] to-[#F45C87] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
          >
            <HiMiniPencil className="h-4 w-4" />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
