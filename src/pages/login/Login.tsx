import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Paper } from "@mui/material";
import {
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
  HiOutlineEnvelope,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import {
  getMe,
  loginUser,
  normalizeUser,
  persistTokens,
} from "../../api/auth";
import useContextPro from "../../hooks/useContextPro";
import loginImage from "../../assets/login_image.png";
import { getDefaultRouteForRole } from "../../utils/roles";
const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lsin"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const { login } = useContextPro();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const tokens = await loginUser(data);
      persistTokens(tokens);
      const me = normalizeUser(await getMe());
      login(tokens, me);

      toast.success("Tizimga muvaffaqiyatli kirdingiz");

      navigate(getDefaultRouteForRole(me), { replace: true });
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message;

      if (status === 401) {
        toast.error("Parol noto‘g‘ri");
      } else if (status === 404) {
        toast.error("Bu email bilan foydalanuvchi topilmadi");
      } else if (status === 400) {
        if (
          typeof message === "string" &&
          message.toLowerCase().includes("email")
        ) {
          toast.error("Email noto‘g‘ri");
        } else if (
          typeof message === "string" &&
          message.toLowerCase().includes("password")
        ) {
          toast.error("Parol noto‘g‘ri");
        } else {
          toast.error(message || "Login ma'lumotlari noto‘g‘ri");
        }
      } else {
        toast.error(message || "Login xatoligi");
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.12),_transparent_30%),linear-gradient(135deg,#f8fbff_0%,#eef4ff_45%,#f8faff_100%)]">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-blue-300/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-indigo-300/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-300/10 blur-3xl" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left side */}
        <div className="relative hidden min-h-screen overflow-hidden lg:block">
          <img
            src={loginImage}
            alt="Course Center"
            className="h-full w-full object-cover transition-transform duration-700 scale-[1.03] hover:scale-[1.06]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.9)_0%,rgba(15,23,42,0.7)_40%,rgba(49,46,129,0.68)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_32%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.08),transparent_25%)]" />

          <div className="absolute inset-0 flex flex-col justify-between p-10 text-white xl:p-14">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur-md shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <HiOutlineAcademicCap className="text-xl" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">
                    Course Center
                  </p>
                  <p className="text-sm font-bold text-white">CRM Platform</p>
                </div>
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                <HiOutlineSparkles className="text-amber-300" />
                Boshqaruv paneli
              </div>

              <h1 className="text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
                Kurs markazingizni
                <span className="mt-2 block bg-gradient-to-r from-white via-blue-100 to-amber-200 bg-clip-text text-transparent">
                  zamonaviy usulda boshqaring
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <Paper
            elevation={0}
            className="relative w-full max-w-[540px] overflow-hidden rounded-[32px] border border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl"
          >
            <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-indigo-100/40 blur-3xl" />

            <div className="relative p-8 sm:p-10 md:p-12">
              {/* Mobile header */}
              <div className="mb-8 text-center lg:hidden">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_16px_36px_rgba(37,99,235,0.28)]">
                  <HiOutlineAcademicCap className="text-4xl text-white" />
                </div>
                <p className="mt-4 text-[11px] uppercase tracking-[0.35em] text-slate-400">
                  Course Center
                </p>
              </div>

              {/* Header */}
              <div className="text-center">
                <div className="mx-auto hidden h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_16px_36px_rgba(37,99,235,0.28)] lg:flex">
                  <HiOutlineAcademicCap className="text-4xl text-white" />
                </div>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:mt-6">
                  Xush kelibsiz
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-[15px]">
                  Davom etish uchun tizimga kirish ma’lumotlarini kiriting
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 space-y-5"
              >
                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <div className="group flex h-16 items-center rounded-[20px] border border-slate-200 bg-slate-50 px-4 transition-all duration-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]">
                    <HiOutlineEnvelope className="mr-3 shrink-0 text-[22px] text-slate-400 transition-colors group-focus-within:text-blue-500" />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="admin@coursecenter.uz"
                      {...register("email")}
                      className="h-full w-full border-none bg-transparent text-[17px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 pl-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Parol
                  </label>
                  <div className="group flex h-16 items-center rounded-[20px] border border-slate-200 bg-slate-50 px-4 transition-all duration-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.08)]">
                    <HiOutlineLockClosed className="mr-3 shrink-0 text-[22px] text-slate-400 transition-colors group-focus-within:text-blue-500" />

                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      {...register("password")}
                      className="h-full w-full border-none bg-transparent text-[17px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-blue-50 hover:text-[#315ccc]"
                      aria-label={
                        showPassword
                          ? "Parolni yashirish"
                          : "Parolni ko'rsatish"
                      }
                    >
                      {showPassword ? (
                        <HiOutlineEyeSlash size={22} />
                      ) : (
                        <HiOutlineEye size={22} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-2 pl-1 text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  endIcon={
                    !isSubmitting ? (
                      <HiOutlineArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    ) : null
                  }
                  className="group"
                  sx={{
                    mt: 1,
                    py: 2,
                    borderRadius: "20px",
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: "1rem",
                    letterSpacing: "0.01em",
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
                    boxShadow: "0 18px 42px rgba(59,130,246,0.24)",
                    transition: "all 0.28s ease",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #1d4ed8 0%, #4338ca 55%, #6d28d9 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 22px 48px rgba(79,70,229,0.28)",
                    },
                    "&.Mui-disabled": {
                      background:
                        "linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)",
                      color: "white",
                      boxShadow: "0 18px 42px rgba(99,102,241,0.18)",
                    },
                  }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      </span>
                      Tizimga kirilmoqda...
                    </span>
                  ) : (
                    "Kirish"
                  )}
                </Button>

                {isSubmitting ? (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500" />
                      <span className="font-medium">
                        Ma'lumotlar tekshirilyapti, biroz kuting...
                      </span>
                    </div>
                  </div>
                ) : null}
              </form>
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
}

export default Login;
