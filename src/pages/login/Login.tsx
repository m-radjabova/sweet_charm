import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  HiOutlineEye, 
  HiOutlineEyeSlash, 
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineArrowRight,
  HiOutlineScissors
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { clearStoredAuth, getMe, getErrorMessage, loginUser, persistTokens } from "../../api/auth";
import useContextPro from "../../hooks/useContextPro";
import { getDefaultRouteForRole, getRoleLabel } from "../../utils/roles";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function BrandMark() {
  return (
    <div className="relative">
      <div className="absolute inset-0 animate-pulse rounded-[28px] bg-black/20 blur-xl"></div>
      <div className="relative flex h-28 w-28 items-center justify-center rounded-[28px] bg-gradient-to-br from-black to-slate-800 shadow-2xl">
        <HiOutlineScissors className="h-12 w-12 text-white" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function FloatingShape() {
  return (
    <>
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-r from-amber-200/20 to-amber-100/10 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-gradient-to-l from-slate-200/20 to-slate-100/10 blur-3xl"></div>
    </>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContextPro();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");
  const isFormValid = emailValue?.includes("@") && passwordValue?.length >= 6;

  const onSubmit = async (payload: LoginFormData) => {
    setIsLoading(true);
    try {
      clearStoredAuth();
      const tokens = await loginUser(payload);
      persistTokens(tokens);
      const me = await getMe();
      login(tokens, me);
      
      toast.success(`${getRoleLabel(me.role)} paneliga kirildi`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      navigate(getDefaultRouteForRole(me), { replace: true });
    } catch (error) {
      clearStoredAuth();
      toast.error(getErrorMessage(error, "Login xatoligi"), {
        position: "top-right",
        autoClose: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <FloatingShape />
      
      <div className="relative mx-auto min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="w-full max-w-md">

            {/* Main Card */}
            <div className="relative rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl sm:p-10">
              {/* Decorative gradient border */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400/20 via-slate-400/20 to-amber-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              
              <div className="relative">
                {/* Logo */}
                <div className="flex justify-center">
                  <BrandMark />
                </div>

                {/* Header */}
                <div className="mt-6 text-center">
                  <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-5xl font-black text-transparent">
                    Sharp Cuts
                  </h1>
                </div>

                {/* Welcome text */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-600">
                    Welcome back! Please enter your credentials.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>
                    <div className={`group relative transition-all duration-200 ${
                      errors.email ? "animate-shake" : ""
                    }`}>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <HiOutlineUser className={`h-5 w-5 transition-colors ${
                          errors.email ? "text-rose-500" : "text-slate-400 group-focus-within:text-amber-500"
                        }`} />
                      </div>
                      <input
                        type="email"
                        placeholder="staff@sharpcuts.com"
                        autoComplete="email"
                        {...register("email")}
                        className={`h-12 w-full rounded-xl border-2 bg-slate-50/50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:shadow-lg ${
                          errors.email
                            ? "border-rose-500 focus:border-rose-500"
                            : "border-slate-200 focus:border-amber-400"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="animate-slideIn text-xs text-rose-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <div className="group relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <HiOutlineLockClosed className={`h-5 w-5 transition-colors ${
                          errors.password ? "text-rose-500" : "text-slate-400 group-focus-within:text-amber-500"
                        }`} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        {...register("password")}
                        className={`h-12 w-full rounded-xl border-2 bg-slate-50/50 pl-11 pr-12 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:shadow-lg ${
                          errors.password
                            ? "border-rose-500 focus:border-rose-500"
                            : "border-slate-200 focus:border-amber-400"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                      >
                        {showPassword ? (
                          <HiOutlineEyeSlash className="h-5 w-5" />
                        ) : (
                          <HiOutlineEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="animate-slideIn text-xs text-rose-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading || !isFormValid}
                    className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/25 disabled:opacity-50 disabled:hover:shadow-none"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      {isLoading || isSubmitting ? (
                        <>
                          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In to Dashboard
                          <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Need to book an appointment?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="font-semibold text-slate-800 underline decoration-amber-400 underline-offset-2 transition-colors hover:text-amber-600"
                >
                  Go to Booking
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}