import type { Dispatch, FormEvent, SetStateAction } from "react";
import { HiMiniArrowRight, HiMiniHeart, HiMiniKey, HiMiniUser } from "react-icons/hi2";
import type { PasswordFormState, ProfileFormState } from "../types";
import { normalizePhoneInput } from "../utils";
import SectionHeader from "./SectionHeader";

interface Props {
  profileForm: ProfileFormState;
  passwordForm: PasswordFormState;
  savingProfile: boolean;
  savingPassword: boolean;
  setProfileForm: Dispatch<SetStateAction<ProfileFormState>>;
  setPasswordForm: Dispatch<SetStateAction<PasswordFormState>>;
  onProfileSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

function FormInput({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C49A6A]">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function SettingsPanel({
  profileForm,
  passwordForm,
  savingProfile,
  savingPassword,
  setProfileForm,
  setPasswordForm,
  onProfileSubmit,
  onPasswordSubmit,
}: Props) {
  const isBirthdayMissing = !profileForm.birthday;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      {/* Personal Information */}
      <section className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_8px_32px_rgba(175,117,60,0.08)]">
        <SectionHeader
          icon={<HiMiniUser className="h-4 w-4" />}
          title="Personal Information"
          subtitle="Keep your profile up to date"
        />

        <form className="space-y-4" onSubmit={onProfileSubmit}>
          {isBirthdayMissing ? (
            <div className="rounded-2xl border border-[#FFD8E1] bg-[#FFF5F8] px-4 py-4 text-sm leading-6 text-[#9D6C47] shadow-[0_8px_20px_rgba(242,93,136,0.06)]">
              <p className="font-bold text-[#F25D88]">Birthday reminder</p>
              <p className="mt-1">
                Add your birthday to receive a special SweetCharm greeting.
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <FormInput label="Full Name">
              <input
                type="text"
                value={profileForm.full_name}
                onChange={(event) => setProfileForm((current) => ({ ...current, full_name: event.target.value }))}
                className="h-12 w-full rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)]"
              />
            </FormInput>

            <FormInput label="Email Address">
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                className="h-12 w-full rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)]"
              />
            </FormInput>

            <FormInput label="Phone Number">
              <div className="flex h-12 items-center rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 transition-all duration-200 focus-within:border-[#F25D88]/40 focus-within:shadow-[0_0_0_3px_rgba(242,93,136,0.08)]">
                <span className="mr-2 shrink-0 text-sm font-semibold text-[#F25D88]">+998</span>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, phone: normalizePhoneInput(event.target.value) }))
                  }
                  placeholder="90 123 45 67"
                  className="w-full border-0 bg-transparent text-sm text-[#6F420B] outline-none"
                />
              </div>
            </FormInput>

            <FormInput label="Birthday">
              <input
                type="date"
                value={profileForm.birthday}
                onChange={(event) => setProfileForm((current) => ({ ...current, birthday: event.target.value }))}
                className="h-12 w-full rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)]"
              />
            </FormInput>
          </div>

          <FormInput label="Bio">
            <textarea
              value={profileForm.bio}
              onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
              rows={4}
              placeholder="Tell us about your sweetest cravings..."
              className="w-full rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 py-3 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)]"
            />
          </FormInput>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex mt-4 h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#FF89AA] to-[#F45C87] px-5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {savingProfile ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Save Changes
                <HiMiniHeart className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </section>

      {/* Security */}
      <section className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_8px_32px_rgba(175,117,60,0.08)]">
        <SectionHeader
          icon={<HiMiniKey className="h-4 w-4" />}
          title="Security"
          subtitle="Update your password anytime"
        />

        <form className="space-y-4" onSubmit={onPasswordSubmit}>
          <FormInput label="Current Password">
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
              className="h-12 w-full rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)]"
            />
          </FormInput>

          <FormInput label="New Password">
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))}
              className="h-12 w-full rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)]"
            />
          </FormInput>

          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex h-12 mt-4 w-full items-center justify-center gap-2 rounded-xl border border-[#FFD2DB] bg-[#FFF4F7] px-5 text-sm font-semibold text-[#F25D88] transition-all duration-200 hover:bg-[#FFE8EF] hover:shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {savingPassword ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#F25D88] border-t-transparent" />
            ) : (
              <>
                Update Password
                <HiMiniArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
