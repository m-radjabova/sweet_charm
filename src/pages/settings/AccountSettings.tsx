import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HiMiniArrowLeft,
  HiMiniArrowUpTray,
  HiMiniMapPin,
  HiMiniPlus,
  HiMiniTrash,
  HiMiniUserCircle,
  HiOutlineAtSymbol,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineKey,
  HiOutlineLockClosed,
  HiOutlinePhone,
  HiOutlineScissors,
  HiOutlineSparkles,
  HiOutlineUser,
  HiMiniXMark,
  HiOutlineInformationCircle,
  HiMiniMap,
} from "react-icons/hi2";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../api/auth";
import { getMyTelegramLink, refreshMyTelegramLink } from "../../api/telegram";
import TelegramConnectCard from "../../components/TelegramConnectCard";
import useContextPro from "../../hooks/useContextPro";
import { useProfile } from "../../hooks/useProfile";
import type { BarberServiceItem } from "../../types/types";
import LocationPickerMap from "../../components/LocationPickerMap";
import { getBrowserLocation, reverseGeocode, type Coordinates } from "../../utils/location";
import { showLocationErrorToast } from "../../utils/locationToast";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeServices(services: BarberServiceItem[]) {
  return services
    .map((service) => ({
      name: service.name.trim(),
      price: Number(service.price) || 0,
      discount_price: service.discount_price == null ? null : Number(service.discount_price) || 0,
      promotion_text: service.promotion_text?.trim() || null,
      duration_minutes: Number(service.duration_minutes) || 0,
    }))
    .filter((service) => service.name);
}

export default function AccountSettings() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const {
    state: { user },
  } = useContextPro();
  const queryClient = useQueryClient();
  const { updateProfile, changePassword, uploadAvatar, deleteAvatar, updatingProfile, updatingPassword, uploadingAvatar, deletingAvatar } = useProfile();
  const telegramQuery = useQuery({
    queryKey: ["telegram-link", user?.id],
    queryFn: getMyTelegramLink,
    enabled: Boolean(user?.id),
    refetchInterval: (query) => (query.state.data?.connected ? false : 5000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
  const refreshTelegramMutation = useMutation({
    mutationFn: refreshMyTelegramLink,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["telegram-link", user?.id] });
    },
  });

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? "");
  const [specialty, setSpecialty] = useState(user?.specialty ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [locationText, setLocationText] = useState(user?.location_text ?? "");
  const [locationCoords, setLocationCoords] = useState<Coordinates | null>(
    user?.location_lat != null && user?.location_lng != null
      ? { lat: user.location_lat, lng: user.location_lng }
      : null,
  );
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [workStartTime, setWorkStartTime] = useState(user?.work_start_time?.slice(0, 5) ?? "09:00");
  const [workEndTime, setWorkEndTime] = useState(user?.work_end_time?.slice(0, 5) ?? "17:30");
  const [services, setServices] = useState<BarberServiceItem[]>(
    user?.services?.length
      ? user.services
      : [{ name: "", price: 0, duration_minutes: 30 }],
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "telegram">("profile");

  useEffect(() => {
    setFullName(user?.full_name ?? "");
    setEmail(user?.email ?? "");
    setPhoneNumber(user?.phone_number ?? "");
    setSpecialty(user?.specialty ?? "");
    setBio(user?.bio ?? "");
    setLocationText(user?.location_text ?? "");
    setLocationCoords(
      user?.location_lat != null && user?.location_lng != null
        ? { lat: user.location_lat, lng: user.location_lng }
        : null,
    );
    setWorkStartTime(user?.work_start_time?.slice(0, 5) ?? "09:00");
    setWorkEndTime(user?.work_end_time?.slice(0, 5) ?? "17:30");
    setServices(
      user?.services?.length
        ? user.services
        : [{ name: "", price: 0, duration_minutes: 30 }],
    );
  }, [user]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const isAdmin = location.pathname.startsWith("/admin");
  const isBarber = user?.role === "barber";
  const backTo = isAdmin ? "/admin" : "/barber";
  const normalizedServices = useMemo(() => normalizeServices(services), [services]);
  const savedServices = JSON.stringify(user?.services ?? []);
  const currentServices = JSON.stringify(normalizedServices);
  const profileChanged =
    fullName.trim() !== (user?.full_name ?? "") ||
    email.trim() !== (user?.email ?? "") ||
    (!isBarber && phoneNumber.trim() !== (user?.phone_number ?? "")) ||
    specialty.trim() !== (user?.specialty ?? "") ||
    bio.trim() !== (user?.bio ?? "") ||
    locationText.trim() !== (user?.location_text ?? "") ||
    (locationCoords?.lat ?? null) !== (user?.location_lat ?? null) ||
    (locationCoords?.lng ?? null) !== (user?.location_lng ?? null) ||
    workStartTime !== (user?.work_start_time?.slice(0, 5) ?? "09:00") ||
    workEndTime !== (user?.work_end_time?.slice(0, 5) ?? "17:30") ||
    currentServices !== savedServices;
  const passwordValid = currentPassword.length >= 6 && newPassword.length >= 6 && newPassword === confirmPassword;
  const profileCompleteness = isBarber
    ? [specialty.trim(), bio.trim(), locationText.trim(), workStartTime, workEndTime, normalizedServices.length > 0 ? "services" : ""].filter(Boolean).length
    : 0;

  const handleSaveProfile = async () => {
    await updateProfile({
      full_name: fullName.trim(),
      email: email.trim(),
      phone_number: !isBarber ? phoneNumber.trim() || null : undefined,
      specialty: isBarber ? specialty.trim() || null : undefined,
      bio: isBarber ? bio.trim() || null : undefined,
      location_text: isBarber ? locationText.trim() || null : undefined,
      location_lat: isBarber ? locationCoords?.lat ?? null : undefined,
      location_lng: isBarber ? locationCoords?.lng ?? null : undefined,
      work_start_time: isBarber ? workStartTime : undefined,
      work_end_time: isBarber ? workEndTime : undefined,
      services: isBarber ? normalizedServices : undefined,
    });
    setSuccessMessage(t("settings.profileSaved"));
  };

  const handlePasswordChange = async () => {
    await changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccessMessage(t("settings.passwordChanged"));
  };

  const handleLocationChange = async (coords: Coordinates) => {
    setLocationCoords(coords);
    const label = await reverseGeocode(coords);
    if (label) {
      setLocationText(label);
    }
  };

  const handleDetectLocation = async () => {
    try {
      setDetectingLocation(true);
      const coords = await getBrowserLocation();
      await handleLocationChange(coords);
    } catch (error) {
      showLocationErrorToast(getErrorMessage(error, t("settings.locationError")));
    } finally {
      setDetectingLocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-300/15 to-orange-400/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-slate-400/8 to-indigo-400/8 blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-5 py-3 shadow-2xl shadow-emerald-500/30">
              <HiOutlineCheckCircle className="h-5 w-5 text-white" />
              <p className="font-bold text-white">{successMessage}</p>
              <button onClick={() => setSuccessMessage(null)} className="text-white/70 hover:text-white">
                <HiMiniXMark className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <Link
            to={backTo}
            className="group mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
          >
            <HiMiniArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("common.back")}
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-amber-600">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                {isAdmin ? t("settings.adminSettings") : t("settings.barberSettings")}
              </div>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 lg:text-5xl">
                {t("settings.title")}
              </h1>
              <p className="mt-2 text-slate-500 max-w-2xl">
                {t("settings.subtitle")}
              </p>
            </div>

            {isBarber && (
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                  {t("settings.profileReadiness")}
                </p>
                <p className="mt-1 text-4xl font-black text-slate-900">
                  {Math.round((profileCompleteness / 6) * 100)}%
                </p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-amber-200/50 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${(profileCompleteness / 6) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  {t("settings.fieldsRemaining", { count: 6 - profileCompleteness })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-3 text-sm font-bold transition-all relative ${
              activeTab === "profile"
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t("settings.tabs.profile")}
            {activeTab === "profile" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-5 py-3 text-sm font-bold transition-all relative ${
              activeTab === "password"
                ? "text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t("settings.tabs.password")}
            {activeTab === "password" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
            )}
          </button>
          {isBarber && (
            <button
              onClick={() => setActiveTab("telegram")}
              className={`px-5 py-3 text-sm font-bold transition-all relative ${
                activeTab === "telegram"
                  ? "text-slate-900"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {t("settings.tabs.telegram")}
              {activeTab === "telegram" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
              )}
            </button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar - Avatar */}
          <div className="space-y-6">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 border border-slate-100">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">{t("settings.avatar")}</p>
              
              <div className="mt-4 text-center">
                <div className="relative mx-auto w-32 h-32">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.full_name}
                      className="h-32 w-32 rounded-2xl object-cover shadow-lg ring-4 ring-white"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-4xl font-black text-white shadow-lg ring-4 ring-white">
                      {getInitials(user?.full_name ?? "U")}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 rounded-full bg-amber-500 p-2 shadow-lg transition hover:scale-110"
                  >
                    <HiMiniArrowUpTray className="h-4 w-4 text-white" />
                  </button>
                </div>

                <h2 className="mt-4 text-xl font-black text-slate-900">
                  {user?.full_name ?? t("roles.user")}
                </h2>
                <p className="text-sm text-slate-500">{user?.email ?? ""}</p>
                
                {isBarber && specialty && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1">
                    <HiOutlineSparkles className="h-3 w-3 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700">{specialty}</span>
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar || deletingAvatar}
                    className="w-full rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 py-2.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
                  >
                    {uploadingAvatar ? t("settings.uploading") : t("settings.uploadImage")}
                  </button>
                  
                  {user?.avatar && (
                    <button
                      type="button"
                      onClick={() => void deleteAvatar()}
                      disabled={deletingAvatar}
                      className="w-full rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                    >
                      {deletingAvatar ? t("settings.removing") : t("settings.removeImage")}
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadAvatar(file);
                    event.target.value = "";
                  }}
                />
              </div>
            </div>

            {user?.role === "user" && (
              <TelegramConnectCard
                info={telegramQuery.data}
                role={user?.role ?? "user"}
                loading={telegramQuery.isLoading}
                refreshing={refreshTelegramMutation.isPending}
                onRefreshLink={() => refreshTelegramMutation.mutate()}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {activeTab === "profile" && (
              <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                    <HiMiniUserCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {t("settings.basicInfo")}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {t("settings.basicInfoSubtitle")}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label={t("common.fullName")}
                    icon={<HiOutlineUser />}
                    value={fullName}
                    onChange={setFullName}
                    placeholder={t("settings.fullNamePlaceholder")}
                  />
                  <InputField
                    label={t("common.email")}
                    icon={<HiOutlineAtSymbol />}
                    value={email}
                    onChange={setEmail}
                    type="email"
                    placeholder="your@email.com"
                  />
                  {!isBarber && (
                    <InputField
                      label={t("common.phoneNumber")}
                      icon={<HiOutlinePhone />}
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      placeholder="+998 90 123 45 67"
                    />
                  )}
                  {isBarber && (
                    <>
                      <InputField
                        label={t("settings.specialtyLabel")}
                        icon={<HiOutlineScissors />}
                        value={specialty}
                        onChange={setSpecialty}
                        placeholder={t("settings.specialtyPlaceholder")}
                      />
                      <InputField
                        label={t("settings.addressLabel")}
                        icon={<HiMiniMapPin />}
                        value={locationText}
                        onChange={setLocationText}
                        placeholder={t("settings.addressPlaceholder")}
                      />
                      <InputField
                        label={t("settings.workStart")}
                        icon={<HiOutlineClock />}
                        value={workStartTime}
                        onChange={setWorkStartTime}
                        type="time"
                      />
                      <InputField
                        label={t("settings.workEnd")}
                        icon={<HiOutlineClock />}
                        value={workEndTime}
                        onChange={setWorkEndTime}
                        type="time"
                      />
                    </>
                  )}
                </div>

                {isBarber && (
                  <div className="mt-6">
                    <TextAreaField
                      label={t("settings.aboutLabel")}
                      value={bio}
                      onChange={setBio}
                      placeholder={t("settings.aboutPlaceholder")}
                    />
                  </div>
                )}

                {isBarber && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-slate-900">{t("settings.mapTitle")}</h3>
                        <p className="text-sm text-slate-500">
                          {t("settings.mapSubtitle")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDetectLocation()}
                        disabled={detectingLocation}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                      >
                        <HiMiniMap className="h-4 w-4" />
                        {detectingLocation ? t("home.detectingLocation") : t("settings.detectMyLocation")}
                      </button>
                    </div>
                    <div className="mt-4">
                      <LocationPickerMap value={locationCoords} onChange={(coords) => void handleLocationChange(coords)} />
                    </div>
                  </div>
                )}

                {isBarber && (
                  <div className="mt-8 rounded-xl bg-slate-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-black text-slate-900">{t("settings.servicesTitle")}</h3>
                        <p className="text-sm text-slate-500">
                          {t("settings.servicesSubtitle")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setServices((prev) => [
                            ...prev,
                            { name: "", price: 0, duration_minutes: 30 },
                          ])
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:shadow-md"
                      >
                        <HiMiniPlus className="h-4 w-4" />
                        {t("settings.addService")}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {services.map((service, idx) => (
                        <ServiceCard
                          key={idx}
                          service={service}
                          index={idx}
                          onUpdate={(updated) =>
                            setServices((prev) =>
                              prev.map((s, i) => (i === idx ? updated : s))
                            )
                          }
                          onDelete={() =>
                            setServices((prev) =>
                              prev.length === 1
                                ? [{ name: "", price: 0, duration_minutes: 30 }]
                                : prev.filter((_, i) => i !== idx)
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!profileChanged || updatingProfile}
                  onClick={() => void handleSaveProfile()}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 lg:w-auto lg:px-8"
                >
                  <HiOutlineCheckCircle className="h-5 w-5" />
                  {updatingProfile ? t("settings.saving") : t("common.save")}
                </button>
              </div>
            )}

            {activeTab === "password" && (
              <div className="rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg">
                    <HiOutlineKey className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {t("settings.passwordTitle")}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {t("settings.passwordSubtitle")}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    label={t("settings.currentPassword")}
                    icon={<HiOutlineLockClosed />}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    type="password"
                    placeholder="********"
                  />
                  <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                    <InputField
                      label={t("settings.newPassword")}
                      icon={<HiOutlineKey />}
                      value={newPassword}
                      onChange={setNewPassword}
                      type="password"
                      placeholder="********"
                    />
                    <InputField
                      label={t("settings.confirmNewPassword")}
                      icon={<HiOutlineLockClosed />}
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      type="password"
                      placeholder="********"
                    />
                  </div>
                </div>

                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
                    {t("settings.passwordsMismatch")}
                  </div>
                )}

                <button
                  type="button"
                  disabled={!passwordValid || updatingPassword}
                  onClick={() => void handlePasswordChange()}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 lg:w-auto lg:px-8"
                >
                  <HiOutlineCheckCircle className="h-5 w-5" />
                  {updatingPassword ? t("settings.updating") : t("settings.changePassword")}
                </button>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <HiOutlineInformationCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p>{t("settings.passwordHint")}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "telegram" && isBarber && (
              <TelegramConnectCard
                info={telegramQuery.data}
                role={user?.role ?? "user"}
                loading={telegramQuery.isLoading}
                refreshing={refreshTelegramMutation.isPending}
                onRefreshLink={() => refreshTelegramMutation.mutate()}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
      </span>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20"
        />
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
      </span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-400/20"
      />
    </label>
  );
}

function ServiceCard({
  service,
  index,
  onUpdate,
  onDelete,
}: {
  service: BarberServiceItem;
  index: number;
  onUpdate: (service: BarberServiceItem) => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold text-slate-400">
          {t("settings.serviceNumber", { count: index + 1 })}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1 text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <HiMiniTrash className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">{t("settings.serviceName")}</span>
          <input
            type="text"
            value={service.name}
            onChange={(e) => onUpdate({ ...service, name: e.target.value })}
            placeholder={t("settings.serviceNamePlaceholder")}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:bg-white"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">{t("settings.servicePrice")}</span>
          <input
            type="number"
            value={service.price || ""}
            onChange={(e) =>
              onUpdate({ ...service, price: Number(e.target.value) || 0 })
            }
            placeholder={t("settings.servicePricePlaceholder")}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:bg-white"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">{t("settings.discountPrice")}</span>
          <input
            type="number"
            value={service.discount_price || ""}
            onChange={(e) =>
              onUpdate({
                ...service,
                discount_price: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder={t("settings.optionalPlaceholder")}
            className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white"
          />
        </label>
        <label className="space-y-1 sm:col-span-1">
          <span className="text-xs font-semibold text-slate-500">{t("settings.durationMinutes")}</span>
          <input
            type="number"
            value={service.duration_minutes || ""}
            onChange={(e) =>
              onUpdate({
                ...service,
                duration_minutes: Number(e.target.value) || 0,
              })
            }
            placeholder={t("settings.durationPlaceholder")}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:bg-white"
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        {t("settings.durationHint")}
      </p>
      <input
        type="text"
        value={service.promotion_text || ""}
        onChange={(e) => onUpdate({ ...service, promotion_text: e.target.value })}
        placeholder={t("settings.promotionPlaceholder")}
        className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:bg-white"
      />
    </div>
  );
}
