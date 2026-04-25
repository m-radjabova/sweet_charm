import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Chip } from "@mui/material";
import {
  HiMiniEnvelope,
  HiMiniIdentification,
  HiMiniKey,
  HiMiniLockClosed,
  HiMiniPhone,
  HiMiniShieldCheck,
  HiMiniUserCircle,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";
import { useProfile } from "../../hooks/useProfile";

const passwordSchema = z
  .object({
    current_password: z.string().min(6, "Joriy parol kamida 6 ta belgidan iborat bo'lsin"),
    new_password: z.string().min(6, "Yangi parol kamida 6 ta belgidan iborat bo'lsin"),
    confirm_password: z.string().min(6, "Parolni tasdiqlang"),
  })
  .refine((values) => values.new_password !== values.current_password, {
    message: "Yangi parol joriy parol bilan bir xil bo'lmasin",
    path: ["new_password"],
  })
  .refine((values) => values.new_password === values.confirm_password, {
    message: "Parollar mos emas",
    path: ["confirm_password"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const initialPasswordValues: PasswordFormValues = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

export default function StudentSettings() {
  const {
    state: { user },
  } = useContextPro();
  const { changePassword, updatingPassword } = useProfile();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: initialPasswordValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    await changePassword({
      current_password: values.current_password,
      new_password: values.new_password,
    });
    reset(initialPasswordValues);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  });

  const readonlyFields = [
    { label: "F.I.Sh", value: user?.full_name ?? "Kiritilmagan", icon: HiMiniIdentification },
    { label: "Email", value: user?.email ?? "Kiritilmagan", icon: HiMiniEnvelope },
    { label: "Telefon", value: user?.phone ?? "Kiritilmagan", icon: HiMiniPhone },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 p-3 pb-8 sm:p-4 lg:space-y-6 lg:p-6">
      <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#20124d_0%,#1d4ed8_48%,#0ea5e9_100%)] px-4 py-6 text-white shadow-[0_26px_90px_rgba(29,78,216,0.18)] sm:rounded-[36px] sm:px-6 sm:py-8 md:px-8 md:py-10">
        <div className="absolute -right-10 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Chip label="SETTINGS" className="!mb-4 !bg-white/16 !text-white !font-bold" />
            <h1 className="text-3xl font-black sm:text-4xl lg:text-5xl">Student sozlamalari</h1>
            <p className="mt-4 text-sm leading-7 text-sky-50/82 sm:text-base">
              Profil ma'lumotlaringiz faqat ko'rish uchun ochiq. Bu bo'limda faqat parolingizni xavfsiz almashtira olasiz.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <HiMiniUserCircle className="text-3xl" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-100/70">Hisob</p>
                <p className="mt-1 font-bold text-white">{user?.full_name ?? "Student"}</p>
                <p className="text-sm text-sky-50/70">Read-only profil</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.07)] sm:rounded-[30px] sm:p-6">
          <div className="flex items-center gap-3">
            <HiMiniShieldCheck className="text-3xl text-sky-500" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-600">Profil</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Ma'lumotlar</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {readonlyFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.label} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                      <Icon className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{field.label}</p>
                      <p className="mt-1 font-bold text-slate-900">{field.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.07)] sm:rounded-[30px] sm:p-6">
          <div className="flex items-center gap-3">
            <HiMiniKey className="text-3xl text-fuchsia-500" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-600">Xavfsizlik</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Parolni almashtirish</h2>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {[
              {
                name: "current_password" as const,
                label: "Joriy parol",
                show: showCurrentPassword,
                setShow: setShowCurrentPassword,
              },
              {
                name: "new_password" as const,
                label: "Yangi parol",
                show: showNewPassword,
                setShow: setShowNewPassword,
              },
              {
                name: "confirm_password" as const,
                label: "Parolni tasdiqlang",
                show: showConfirmPassword,
                setShow: setShowConfirmPassword,
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</label>
                <div className="group flex h-15 items-center rounded-[20px] border border-slate-200 bg-slate-50 px-4 focus-within:border-sky-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(14,165,233,0.08)]">
                  <HiMiniLockClosed className="mr-3 shrink-0 text-[22px] text-slate-400 group-focus-within:text-sky-500" />
                  <input
                    type={field.show ? "text" : "password"}
                    {...register(field.name)}
                    className="h-full w-full border-none bg-transparent text-[16px] font-medium text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => field.setShow((prev) => !prev)}
                    className="ml-3 flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-sky-50 hover:text-sky-600"
                    aria-label={field.show ? "Parolni yashirish" : "Parolni ko'rsatish"}
                  >
                    {field.show ? <HiOutlineEyeSlash size={20} /> : <HiOutlineEye size={20} />}
                  </button>
                </div>
                {errors[field.name] && <p className="mt-2 text-sm text-rose-500">{errors[field.name]?.message}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={updatingPassword}
              className="mt-2 inline-flex h-14 w-full items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#1d4ed8_0%,#7c3aed_100%)] px-5 text-sm font-bold text-white shadow-[0_18px_48px_rgba(29,78,216,0.24)] transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {updatingPassword ? "Saqlanmoqda..." : "Parolni yangilash"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
