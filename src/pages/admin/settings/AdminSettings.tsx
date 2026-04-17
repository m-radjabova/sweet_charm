import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Chip, Divider } from "@mui/material";
import {
  HiMiniKey,
  HiMiniShieldCheck,
  HiMiniUserCircle,
  HiMiniEnvelope,
  HiMiniPhone,
  HiMiniIdentification,
  HiMiniLockClosed,
  HiMiniExclamationTriangle,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import useContextPro from "../../../hooks/useContextPro";
import { useProfile } from "../../../hooks/useProfile";

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\+?[0-9\s\-()]{9,20}$/.test(value), "Telefon raqami noto'g'ri")
  .transform((value) => value.trim());

const profileSchema = z.object({
  full_name: z.string().trim().min(3, "F.I.Sh kamida 3 ta harfdan iborat bo'lsin"),
  email: z.string().trim().email("Email noto'g'ri"),
  phone: optionalPhoneSchema,
});

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

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const initialPasswordValues: PasswordFormValues = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

function AdminSettings() {
  const { state } = useContextPro();
  const { updateProfile, changePassword, updatingProfile, updatingPassword } = useProfile();
  const currentUser = state.user;
  const isTeacher = currentUser?.role === "teacher";
  
  // Password show/hide states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: submitProfileForm,
    reset: resetProfileForm,
    formState: { errors: profileErrors, isDirty: isProfileDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: currentUser?.full_name ?? "",
      email: currentUser?.email ?? "",
      phone: currentUser?.phone ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: submitPasswordForm,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: initialPasswordValues,
  });

  useEffect(() => {
    resetProfileForm({
      full_name: currentUser?.full_name ?? "",
      email: currentUser?.email ?? "",
      phone: currentUser?.phone ?? "",
    });
  }, [currentUser, resetProfileForm]);

  const onSubmitProfile = submitProfileForm(async (values) => {
    await updateProfile({
      full_name: values.full_name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim() || null,
    });
  });

  const onSubmitPassword = submitPasswordForm(async (values) => {
    await changePassword({
      current_password: values.current_password,
      new_password: values.new_password,
    });
    resetPasswordForm(initialPasswordValues);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="mx-auto max-w-[1800px] p-4 lg:p-6 space-y-6">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
            <HiMiniShieldCheck size={350} />
          </div>
          <div className="absolute bottom-0 left-0 w-60 h-60 opacity-5">
            <HiMiniKey size={250} />
          </div>
          <div className="relative px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div className="max-w-2xl">
                <Chip 
                  label="SOZLAMALAR" 
                  className="!mb-4 !bg-white/20 !text-white !font-bold !text-sm !py-1 !px-4"
                />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  Hisob sozlamalari
                </h1>
                <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed">
                  {isTeacher
                    ? "Profil ma'lumotlaringizni ko'ring va parolingizni yangilang"
                    : "Profil ma'lumotlaringizni yangilang va akkauntingiz xavfsizligini boshqaring"}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 min-w-[220px]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <HiMiniUserCircle className="text-2xl" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 uppercase tracking-wider">Foydalanuvchi</p>
                    <p className="text-base font-bold text-white">{currentUser?.full_name ?? "Foydalanuvchi"}</p>
                    <p className="text-xs text-slate-300">{currentUser?.email ?? "Email mavjud emas"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Profile Settings Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
            
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <HiMiniUserCircle className="text-3xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Profil ma'lumotlari</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {isTeacher
                      ? "Bu bo'limda shaxsiy ma'lumotlaringizni ko'rishingiz mumkin"
                      : "Ism, email va telefon raqamingizni yangilashingiz mumkin"}
                  </p>
                </div>
              </div>

              <form onSubmit={onSubmitProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    F.I.Sh <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <HiMiniIdentification className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type="text"
                      {...registerProfile("full_name")}
                      disabled={isTeacher}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                        profileErrors.full_name 
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" 
                          : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      } focus:outline-none focus:ring-2 transition-all bg-slate-50 hover:bg-white focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
                      placeholder="Ism Familiya"
                    />
                  </div>
                  {profileErrors.full_name && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                      <HiMiniExclamationTriangle size={12} /> {profileErrors.full_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <HiMiniEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type="email"
                      {...registerProfile("email")}
                      disabled={isTeacher}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                        profileErrors.email 
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" 
                          : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      } focus:outline-none focus:ring-2 transition-all bg-slate-50 hover:bg-white focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
                      placeholder="admin@example.com"
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                      <HiMiniExclamationTriangle size={12} /> {profileErrors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Telefon raqami
                  </label>
                  <div className="relative">
                    <HiMiniPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type="tel"
                      {...registerProfile("phone")}
                      disabled={isTeacher}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                        profileErrors.phone 
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" 
                          : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      } focus:outline-none focus:ring-2 transition-all bg-slate-50 hover:bg-white focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
                      placeholder="+998 xx xxx xx xx"
                    />
                  </div>
                  {profileErrors.phone && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                      <HiMiniExclamationTriangle size={12} /> {profileErrors.phone.message}
                    </p>
                  )}
                </div>
                {!isTeacher && (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100 mt-6">
                  <button
                      type="submit"
                      disabled={!isProfileDirty || updatingProfile}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingProfile ? "Saqlanmoqda..." : "Profilni saqlash"}
                    </button>
                </div>
                )}
              </form>
            </div>
          </div>

          {/* Password Settings Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <HiMiniKey className="text-3xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Parolni yangilash</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Xavfsizlik uchun parolingizni muntazam yangilab turing
                  </p>
                </div>
              </div>

              <div className="mb-5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                <HiMiniShieldCheck className="text-amber-600 text-lg mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Parol xavfsizligi bo'yicha maslahatlar:</p>
                  <ul className="text-xs space-y-1 text-amber-700">
                    <li>• Kamida 6 ta belgidan iborat bo'lishi kerak</li>
                    <li>• Yangi parol joriy paroldan farq qilishi kerak</li>
                    <li>• Harf, raqam va belgilarni qo'shish tavsiya etiladi</li>
                  </ul>
                </div>
              </div>

              <form onSubmit={onSubmitPassword} className="space-y-5">
                {/* Joriy parol */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Joriy parol
                  </label>
                  <div className="relative">
                    <HiMiniLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      {...registerPassword("current_password")}
                      className={`w-full pl-12 pr-12 py-3 rounded-xl border ${
                        passwordErrors.current_password 
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" 
                          : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
                      } focus:outline-none focus:ring-2 transition-all bg-slate-50 hover:bg-white focus:bg-white`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showCurrentPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.current_password && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                      <HiMiniExclamationTriangle size={12} /> {passwordErrors.current_password.message}
                    </p>
                  )}
                </div>

                {/* Yangi parol */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Yangi parol
                  </label>
                  <div className="relative">
                    <HiMiniKey className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      {...registerPassword("new_password")}
                      className={`w-full pl-12 pr-12 py-3 rounded-xl border ${
                        passwordErrors.new_password 
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" 
                          : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
                      } focus:outline-none focus:ring-2 transition-all bg-slate-50 hover:bg-white focus:bg-white`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.new_password && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                      <HiMiniExclamationTriangle size={12} /> {passwordErrors.new_password.message}
                    </p>
                  )}
                </div>

                {/* Yangi parolni tasdiqlang */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Yangi parolni tasdiqlang
                  </label>
                  <div className="relative">
                    <HiMiniShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...registerPassword("confirm_password")}
                      className={`w-full pl-12 pr-12 py-3 rounded-xl border ${
                        passwordErrors.confirm_password 
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" 
                          : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
                      } focus:outline-none focus:ring-2 transition-all bg-slate-50 hover:bg-white focus:bg-white`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.confirm_password && (
                    <p className="mt-1 text-sm text-rose-600 flex items-center gap-1">
                      <HiMiniExclamationTriangle size={12} /> {passwordErrors.confirm_password.message}
                    </p>
                  )}
                </div>

                <Divider className="!my-5" />

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingPassword ? "Yangilanmoqda..." : "Parolni yangilash"}
                </button>
              </form>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default AdminSettings;
