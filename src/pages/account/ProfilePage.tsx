import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { toast } from "react-toastify";
import { getMyAddresses, getMyOrders, getMyRewards } from "../../api/account";
import { getErrorMessage } from "../../api/auth";
import { getFeaturedDesserts } from "../../api/desserts";
import {
  changeMyPassword,
  deleteMyAvatar,
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
} from "../../api/profile";
import profileBackground from "../../assets/profile/profile_bg.png";
import useContextPro from "../../hooks/useContextPro";
import type { User } from "../../types/types";
import AddressBookPanel from "./components/AddressBookPanel";
import DashboardPanel from "./components/DashboardPanel";
import FavoritesPanel from "./components/FavoritesPanel";
import MyCouponsPanel from "./components/MyCouponsPanel";
import OrdersPanel from "./components/OrdersPanel";
import ProfileHero from "./components/ProfileHero";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileTopbar from "./components/ProfileTopbar";
import RewardsPanel from "./components/RewardsPanel";
import SettingsPanel from "./components/SettingsPanel";
import { useFavorites } from "./hooks/useFavorites";
import type { PasswordFormState, ProfileFormState, ProfileTab } from "./types";
import { deriveTier, normalizePhoneForApi } from "./utils";
import Seo from "../../components/Seo";

const profileSeoCopy: Record<ProfileTab, { title: string; description: string }> = {
  dashboard: {
    title: "My Profile | SweetCharm",
    description: "Manage your SweetCharm profile, rewards, favorites, and recent account activity.",
  },
  orders: {
    title: "My Orders | SweetCharm",
    description: "Track your SweetCharm dessert orders and stay updated on each sweet delivery.",
  },
  favorites: {
    title: "My Favorites | SweetCharm",
    description: "See your saved SweetCharm desserts and return to your favorite treats anytime.",
  },
  rewards: {
    title: "My Rewards | SweetCharm",
    description: "Check your SweetCharm points, membership level, and available reward benefits.",
  },
  coupons: {
    title: "My Coupons | SweetCharm",
    description: "View your SweetCharm discount coupons and active promotions in one place.",
  },
  addresses: {
    title: "My Addresses | SweetCharm",
    description: "Manage your saved delivery addresses for faster SweetCharm checkout.",
  },
  settings: {
    title: "Account Settings | SweetCharm",
    description: "Update your SweetCharm account details, password, and personal preferences.",
  },
};

function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const {
    dispatch,
    logout,
    refreshUser,
    state: { user: sessionUser },
  } = useContextPro();

  const [activeTab, setActiveTab] = useState<ProfileTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    full_name: "",
    email: "",
    phone: "",
    birthday: "",
    bio: "",
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    current_password: "",
    new_password: "",
  });

  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    initialData: sessionUser ?? undefined,
  });
  const featuredDessertsQuery = useQuery({
    queryKey: ["profile-featured-desserts"],
    queryFn: () => getFeaturedDesserts(12),
  });
  const ordersQuery = useQuery({ queryKey: ["my-orders"], queryFn: getMyOrders });
  const addressesQuery = useQuery({ queryKey: ["my-addresses"], queryFn: getMyAddresses });
  const rewardsQuery = useQuery({ queryKey: ["my-rewards"], queryFn: getMyRewards });

  const profile = profileQuery.data ?? sessionUser;
  const featuredDesserts = useMemo(() => featuredDessertsQuery.data ?? [], [featuredDessertsQuery.data]);
  const { favoriteIds, favoriteDesserts, toggleFavorite } = useFavorites(featuredDesserts);
  const sweetPoints = rewardsQuery.data?.sweet_points ?? profile?.sweet_points ?? 0;
  const memberTier = rewardsQuery.data?.current_level.name ?? deriveTier(sweetPoints);
  const isAdmin = profile?.role === "admin";
  const avatarBusy = false;

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    setProfileForm({
      full_name: profile?.full_name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ? profile.phone.replace(/^\+998/, "").trim() : "",
      birthday: profile?.birthday ?? "",
      bio: profile?.bio ?? "",
    });
  }, [profile?.bio, profile?.birthday, profile?.email, profile?.full_name, profile?.phone]);

  const syncUserState = (nextUser: User) => {
    dispatch({ type: "UPDATE_USER", payload: nextUser });
    queryClient.setQueryData(["my-profile"], nextUser);
  };

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (nextUser) => {
      syncUserState(nextUser);
      toast.success("Profile updated successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Profile could not be updated")),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadMyAvatar,
    onSuccess: (nextUser) => {
      syncUserState(nextUser);
      toast.success("Avatar uploaded successfully");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Avatar upload failed")),
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: deleteMyAvatar,
    onSuccess: (nextUser) => {
      syncUserState(nextUser);
      toast.success("Avatar removed");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Avatar could not be removed")),
  });

  const changePasswordMutation = useMutation({
    mutationFn: changeMyPassword,
    onSuccess: async () => {
      setPasswordForm({ current_password: "", new_password: "" });
      toast.success("Password updated successfully");
      await refreshUser();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Password could not be changed")),
  });

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (profileForm.full_name.trim().length < 3) {
      toast.error("Full name must be at least 3 characters");
      return;
    }

    const trimmedPhone = profileForm.phone.trim();
    const normalizedPhone = trimmedPhone ? normalizePhoneForApi(trimmedPhone) : "";
    if (trimmedPhone && !normalizedPhone) {
      toast.error("Please enter a valid phone number");
      return;
    }

    updateProfileMutation.mutate({
      full_name: profileForm.full_name.trim(),
      email: profileForm.email.trim().toLowerCase(),
      phone: normalizedPhone || null,
      birthday: profileForm.birthday || null,
      bio: profileForm.bio.trim() || null,
    });
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (passwordForm.new_password.trim().length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    changePasswordMutation.mutate({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please choose JPG, PNG or WebP image");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      event.target.value = "";
      return;
    }

    uploadAvatarMutation.mutate(file);
    event.target.value = "";
  }

  function renderActiveTab() {
    if (activeTab === "orders") return <OrdersPanel />;
    if (activeTab === "favorites") {
      return (
        <FavoritesPanel
          favoriteDesserts={favoriteDesserts}
          favoriteIds={favoriteIds}
          toggleFavorite={toggleFavorite}
        />
      );
    }
    if (activeTab === "rewards") return <RewardsPanel profile={profile} summary={rewardsQuery.data} />;
    if (activeTab === "coupons") return <MyCouponsPanel />;
    if (activeTab === "addresses") return <AddressBookPanel />;
    if (activeTab === "settings") {
      return (
        <SettingsPanel
          profileForm={profileForm}
          passwordForm={passwordForm}
          savingProfile={updateProfileMutation.isPending}
          savingPassword={changePasswordMutation.isPending}
          setProfileForm={setProfileForm}
          setPasswordForm={setPasswordForm}
          onProfileSubmit={handleProfileSubmit}
          onPasswordSubmit={handlePasswordSubmit}
        />
      );
    }

    return (
      <DashboardPanel
        profile={profile}
        favoriteDesserts={favoriteDesserts}
        favoriteIds={favoriteIds}
        toggleFavorite={toggleFavorite}
        recentOrders={ordersQuery.data ?? []}
        ordersCount={ordersQuery.data?.length ?? 0}
        favoritesCount={favoriteIds.length}
        addressesCount={addressesQuery.data?.length ?? 0}
        setActiveTab={setActiveTab}
        ordersLoading={ordersQuery.isLoading}
        rewardsSummary={rewardsQuery.data}
      />
    );
  }

  return (
    <main
      className="min-h-screen bg-[#FFF7ED] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(255,250,244,0.85), rgba(255,247,237,0.92)), url(${profileBackground})`,
      }}
    >
      <Seo
        title={profileSeoCopy[activeTab].title}
        description={profileSeoCopy[activeTab].description}
        path="/account/profile"
        noindex
      />

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-18px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-3 py-3 sm:px-4 sm:gap-4 lg:px-5 xl:flex-row xl:py-4">
        <ProfileSidebar
          activeTab={activeTab}
          isAdmin={Boolean(isAdmin)}
          isOpen={sidebarOpen}
          onTabChange={setActiveTab}
          onLogout={() => void logout()}
          onClose={() => setSidebarOpen(false)}
        />

        <section className="min-w-0 flex-1 space-y-4">
          <div className="xl:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex w-full items-center justify-between rounded-[22px] border border-white/70 bg-white/92 px-4 py-3.5 text-left shadow-[0_10px_30px_rgba(175,117,60,0.10)] backdrop-blur-xl transition-all duration-200 active:scale-[0.99]"
            >
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#C28564]">
                  Navigation
                </span>
                <span className="mt-1 block text-[1rem] font-semibold text-[#5C3805]">
                  Open profile menu
                </span>
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF0F3] to-[#FFF6E8] text-[#F25D88] shadow-sm">
                <HiMiniBars3BottomLeft className="h-5 w-5" />
              </span>
            </button>
          </div>

          <ProfileTopbar profile={profile} memberTier={memberTier} isAdmin={Boolean(isAdmin)} />
          {activeTab === "dashboard" ? (
            <ProfileHero
              profile={profile}
              memberTier={memberTier}
              avatarBusy={avatarBusy || uploadAvatarMutation.isPending || deleteAvatarMutation.isPending}
              fileInputRef={fileInputRef}
              onAvatarChange={handleAvatarChange}
              onDeleteAvatar={() => deleteAvatarMutation.mutate()}
              onEditProfile={() => setActiveTab("settings")}
            />
          ) : null}
          {renderActiveTab()}
        </section>
      </div>
    </main>
  );
}

export default ProfilePage;
