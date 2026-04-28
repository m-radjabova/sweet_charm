import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HiMiniArrowLeft,
  HiMiniArrowUpTray,
  HiMiniTrash,
  HiMiniUserCircle,
  HiOutlineAtSymbol,
  HiOutlineCheckCircle,
  HiOutlineKey,
  HiOutlineLockClosed,
  HiOutlineScissors,
  HiOutlineUser,
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";
import { useProfile } from "../../hooks/useProfile";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function AccountSettings() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  const {
    state: { user },
  } = useContextPro();
  const { updateProfile, changePassword, uploadAvatar, deleteAvatar, updatingProfile, updatingPassword, uploadingAvatar, deletingAvatar } = useProfile();

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [specialty, setSpecialty] = useState(user?.specialty ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setFullName(user?.full_name ?? "");
    setEmail(user?.email ?? "");
    setSpecialty(user?.specialty ?? "");
  }, [user?.email, user?.full_name, user?.specialty]);

  const isAdmin = location.pathname.startsWith("/admin");
  const isBarber = user?.role === "barber";
  const backTo = isAdmin ? "/admin" : "/barber";
  const profileChanged =
    fullName.trim() !== (user?.full_name ?? "") ||
    email.trim() !== (user?.email ?? "") ||
    specialty.trim() !== (user?.specialty ?? "");
  const passwordValid = currentPassword.length >= 6 && newPassword.length >= 6 && newPassword === confirmPassword;

  const themeScopeClass = isAdmin ? "dashboard-theme" : "barber-theme";

  return (
    <div className={`${themeScopeClass} min-h-screen bg-white px-4 py-4 sm:px-6 md:px-8 lg:px-12`}>
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[30px] sm:p-5 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 sm:gap-4">
              <Link
                to={backTo}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-slate-300 hover:bg-white sm:h-12 sm:w-12 sm:rounded-2xl md:h-14 md:w-14"
                aria-label="Back"
              >
                <HiMiniArrowLeft className="text-xl sm:text-2xl md:text-3xl" />
              </Link>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-sm sm:tracking-[0.24em]">
                  {isAdmin ? t("settings.adminSettings") : t("settings.barberSettings")}
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:mt-2 sm:text-3xl md:text-5xl">{t("settings.title")}</h1>
                <p className="mt-1 text-xs text-slate-500 sm:mt-2 sm:text-sm md:text-base">{t("settings.subtitle")}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Avatar Section */}
          <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[30px] sm:p-5 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 sm:text-sm sm:tracking-[0.24em]">{t("settings.avatar")}</p>
            <div className="mt-4 flex flex-col items-center rounded-2xl bg-slate-50/80 p-5 text-center sm:mt-5 sm:rounded-[28px] sm:p-6">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.full_name} 
                  className="h-24 w-24 rounded-2xl object-cover shadow-lg sm:h-28 sm:w-28 sm:rounded-[28px] md:h-32 md:w-32" 
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-black text-2xl font-black text-white shadow-lg sm:h-28 sm:w-28 sm:rounded-[28px] sm:text-3xl md:h-32 md:w-32 md:text-4xl">
                  {getInitials(user?.full_name ?? "U")}
                </div>
              )}
              <h2 className="mt-3 text-lg font-black text-slate-950 sm:mt-4 sm:text-xl">{user?.full_name ?? t("roles.user")}</h2>
              <p className="mt-1 text-xs text-slate-400 sm:mt-1 sm:text-sm">{user?.email ?? ""}</p>
              {isBarber && user?.specialty && (
                <p className="mt-2 text-sm font-semibold text-slate-500">{user.specialty}</p>
              )}

              <div className="mt-4 flex w-full flex-col gap-2 sm:mt-6 sm:gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar || deletingAvatar}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-bold text-white transition hover:bg-slate-900 disabled:opacity-60 sm:h-12 sm:rounded-2xl sm:px-5"
                >
                  <HiMiniArrowUpTray className="text-base sm:text-lg" />
                  {uploadingAvatar ? t("settings.uploading") : t("settings.uploadAvatar")}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteAvatar()}
                  disabled={!user?.avatar || uploadingAvatar || deletingAvatar}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60 sm:h-12 sm:rounded-2xl sm:px-5"
                >
                  <HiMiniTrash className="text-base sm:text-lg" />
                  {deletingAvatar ? t("settings.removing") : t("settings.removeAvatar")}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void uploadAvatar(file);
                  }
                  event.target.value = "";
                }}
              />
            </div>
          </section>

          <div className="space-y-4 sm:space-y-6">
            {/* Profile Section */}
            <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[30px] sm:p-5 md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <HiMiniUserCircle className="text-xl sm:text-2xl" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950 sm:text-xl">{t("settings.profile")}</h2>
                  <p className="text-xs text-slate-400 sm:text-sm">{t("settings.profileSubtitle")}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
                <Field
                  label={t("common.fullName")}
                  icon={<HiOutlineUser className="text-base sm:text-lg" />}
                  value={fullName}
                  onChange={setFullName}
                  placeholder={t("settings.fullNamePlaceholder")}
                />
                <Field
                  label={t("common.email")}
                  icon={<HiOutlineAtSymbol className="text-base sm:text-lg" />}
                  value={email}
                  onChange={setEmail}
                  type="email"
                  placeholder={t("settings.emailPlaceholder")}
                />
                {isBarber && (
                  <Field
                    label={t("settings.specialty")}
                    icon={<HiOutlineScissors className="text-base sm:text-lg" />}
                    value={specialty}
                    onChange={setSpecialty}
                    placeholder={t("settings.specialtyPlaceholder")}
                  />
                )}
              </div>

              <button
                type="button"
                disabled={!profileChanged || updatingProfile}
                onClick={() =>
                  void updateProfile({
                    full_name: fullName.trim(),
                    email: email.trim(),
                    specialty: isBarber ? specialty.trim() || null : undefined,
                  })
                }
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-bold text-white transition hover:bg-slate-900 disabled:opacity-60 sm:mt-6 sm:h-12 sm:w-auto sm:rounded-2xl sm:px-5"
              >
                <HiOutlineCheckCircle className="text-base sm:text-lg" />
                {updatingProfile ? t("settings.saving") : t("settings.saveProfile")}
              </button>
            </section>

            {/* Password Section */}
            <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[30px] sm:p-5 md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <HiOutlineKey className="text-xl sm:text-2xl" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950 sm:text-xl">{t("common.password")}</h2>
                  <p className="text-xs text-slate-400 sm:text-sm">{t("settings.passwordSubtitle")}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
                <Field
                  label={t("settings.currentPassword")}
                  icon={<HiOutlineLockClosed className="text-base sm:text-lg" />}
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  type="password"
                  placeholder={t("settings.currentPassword")}
                />
                <Field
                  label={t("settings.newPassword")}
                  icon={<HiOutlineKey className="text-base sm:text-lg" />}
                  value={newPassword}
                  onChange={setNewPassword}
                  type="password"
                  placeholder={t("settings.newPasswordPlaceholder")}
                />
                <Field
                  label={t("settings.confirmNewPassword")}
                  icon={<HiOutlineLockClosed className="text-base sm:text-lg" />}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  type="password"
                  placeholder={t("settings.confirmNewPasswordPlaceholder")}
                />
              </div>

              <button
                type="button"
                disabled={!passwordValid || updatingPassword}
                onClick={async () => {
                  await changePassword({
                    current_password: currentPassword,
                    new_password: newPassword,
                  });
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-bold text-white transition hover:bg-slate-900 disabled:opacity-60 sm:mt-6 sm:h-12 sm:w-auto sm:rounded-2xl sm:px-5"
              >
                <HiOutlineLockClosed className="text-base sm:text-lg" />
                {updatingPassword ? t("settings.updating") : t("settings.changePassword")}
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
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
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700 sm:mb-2 sm:text-sm">{label}</span>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:left-4">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-900 focus:bg-white sm:h-14 sm:rounded-2xl sm:pl-12 sm:pr-4 sm:text-base"
        />
      </div>
    </label>
  );
}
