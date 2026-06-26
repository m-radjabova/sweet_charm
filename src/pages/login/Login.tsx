import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HiMiniArrowRight,
  HiMiniEye,
  HiMiniEyeSlash,
  HiMiniHeart,
  HiMiniLockClosed,
  HiMiniPhone,
  HiMiniUser,
  HiMiniShieldCheck,
} from "react-icons/hi2";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { toast } from "react-toastify";
import cakeIcon from "../../assets/cake_icon.png";
import cakeIconTwo from "../../assets/cake_icon2.png";
import heroBackground from "../../assets/hero_background.png";
import iceCreamIcon from "../../assets/ice_cream_icon.png";
import rabbitIcon from "../../assets/rabbit_icons.png";
import strawberryIcon from "../../assets/strawberry_icons.png";
import bearIcon from "../../assets/bear_iocns.png";
import { clearStoredAuth, getErrorMessage, getMe, loginUser, persistTokens, registerUser } from "../../api/auth";
import useContextPro from "../../hooks/useContextPro";

type AuthMode = "login" | "register";
type PasswordField = "password" | "confirmPassword";

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialState: FormState = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^998/, "").slice(0, 9);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^998/, "").slice(0, 9);
  return digits.length === 9 ? `+998${digits}` : "";
}

function getModeFromPath(pathname: string): AuthMode {
  return pathname === "/sign-up" ? "register" : "login";
}

function FloatingOrnament({ src, alt, className, style }: { src: string; alt: string; className: string; style?: React.CSSProperties }) {
  return (
    <img
    loading="lazy"
      src={src}
      alt={alt}
      className={`pointer-events-none absolute animate-float object-contain ${className}`}
      style={style}
    />
  );
}

function AuthField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="group block w-full">
      <span className="mb-2 block text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-brown)]">
        {label}
      </span>
      <span
        className={`flex h-[64px] w-full items-center gap-3 rounded-[20px] border bg-white/75 px-5 shadow-sm backdrop-blur-sm transition-all duration-300 focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_4px_rgba(247,93,134,0.15)] ${
          error
            ? "border-[var(--color-primary-deep)] shadow-[0_0_0_4px_rgba(217,72,116,0.1)]"
            : "border-[var(--color-border-soft)]"
        }`}
      >
        <span className="shrink-0 text-[var(--color-primary)] transition-transform duration-300 group-focus-within:scale-110">
          {icon}
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-3">{children}</span>
      </span>
      {error ? (
        <span className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary-deep)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-primary-deep)]" />
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    login,
    state: { user, isLoading },
  } = useContextPro();

  const [mode, setMode] = useState<AuthMode>(() => getModeFromPath(location.pathname));
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<PasswordField, boolean>>({
    password: false,
    confirmPassword: false,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const newMode = getModeFromPath(location.pathname);
    setIsTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setErrors({});
      setTimeout(() => setIsTransitioning(false), 50);
    }, 200);
  }, [location.pathname]);

  useEffect(() => {
    if (!isLoading && user) {
      const redirectTo =
        typeof location.state?.from === "string"
          ? location.state.from
          : user.role === "admin"
            ? "/dashboard"
            : "/";
      navigate(redirectTo, { replace: true });
    }
  }, [isLoading, location.state, navigate, user]);

  const isRegister = mode === "register";

  const title = useMemo(
    () => (isRegister ? "Create your account" : "Welcome back"),
    [isRegister],
  );

  const subtitle = useMemo(
    () =>
      isRegister
        ? "Join SweetCharm and start your sweet journey."
        : "Sign in and continue your sweetest moments with us.",
    [isRegister],
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    const normalizedPhone = normalizePhone(form.phone);
    const trimmedEmail = form.email.trim().toLowerCase();

    if (isRegister && form.fullName.trim().length < 3) {
      nextErrors.fullName = "Full name must be at least 3 characters.";
    }

    if (isRegister && !normalizedPhone) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (form.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (isRegister && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (isRegister && !form.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Please confirm your password.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return null;

    return {
      email: trimmedEmail,
      phone: normalizedPhone,
    };
  }

  function togglePassword(field: PasswordField) {
    setShowPassword((current) => ({ ...current, [field]: !current[field] }));
  }

  function handleTabChange(newMode: AuthMode) {
    if (newMode === mode || isTransitioning) return;
    navigate(newMode === "register" ? "/sign-up" : "/login");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validated = validate();
    if (!validated || isSubmitting) return;

    setIsSubmitting(true);

    try {
      clearStoredAuth();

      const tokens = isRegister
        ? await registerUser({
            full_name: form.fullName.trim(),
            phone: validated.phone,
            email: validated.email,
            password: form.password,
          })
        : await loginUser({
            email: validated.email,
            password: form.password,
          });

      persistTokens(tokens);
      const me = await getMe();
      login(tokens, me);

      toast.success(isRegister ? "Account created successfully! ✨" : "Welcome back! ✨");
      navigate(
        typeof location.state?.from === "string"
          ? location.state.from
          : me.role === "admin"
            ? "/dashboard"
            : "/",
        { replace: true },
      );
    } catch (error) {
      clearStoredAuth();
      toast.error(getErrorMessage(error, isRegister ? "Registration failed" : "Login failed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      {/* Animated gradient background */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(255,248,241,0.92)] via-[rgba(255,255,255,0.70)] to-[rgba(255,248,241,0.85)]" />

      {/* Animated gradient orb */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-[radial-gradient(circle,rgba(247,93,134,0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-[radial-gradient(circle,rgba(255,155,192,0.10),transparent_70%)]" />

      {/* Floating decorative elements */}
      <FloatingOrnament
        src={cakeIcon}
        alt="Cake"
        className="left-[3%] top-[6%] hidden h-[100px] w-[110px] rotate-[-8deg] opacity-90 md:block"
      />
      <FloatingOrnament
        src={iceCreamIcon}
        alt="Cupcake"
        className="left-[48%] top-[2%] hidden h-[80px] w-[88px] -translate-x-1/2 opacity-85 md:block"
        style={{ animationDelay: "1.5s" }}
      />
      <FloatingOrnament
        src={rabbitIcon}
        alt="Cookie"
        className="left-[2%] top-[72%] hidden h-[130px] w-[140px] rotate-[-10deg] opacity-80 lg:block"
        style={{ animationDelay: "3s" }}
      />
      <FloatingOrnament
        src={cakeIconTwo}
        alt="Dessert"
        className="right-[4%] top-[8%] hidden h-[110px] w-[120px] rotate-[9deg] opacity-85 md:block"
        style={{ animationDelay: "2s" }}
      />
      <FloatingOrnament
        src={strawberryIcon}
        alt="Strawberry"
        className="right-[7%] bottom-[6%] hidden h-[90px] w-[100px] rotate-[-6deg] opacity-90 lg:block"
        style={{ animationDelay: "0.5s" }}
      />
      <FloatingOrnament
        src={bearIcon}
        alt="Bear"
        className="left-[8%] top-[46%] hidden h-[64px] w-[72px] rotate-[12deg] opacity-75 lg:block"
        style={{ animationDelay: "4s" }}
      />

      {/* Floating sparkle symbols */}
      <div className="pointer-events-none absolute left-[6%] top-[26%] hidden animate-float-delayed text-[44px] text-[var(--color-primary-soft)] opacity-70 md:block">
        *
      </div>
      <div className="pointer-events-none absolute left-[12%] top-[38%] hidden animate-float text-[24px] text-white/80 md:block">
        ✦
      </div>
      <div className="pointer-events-none absolute right-[8%] top-[24%] hidden animate-float-delayed text-[48px] text-[var(--color-brown)] opacity-60 md:block">
        ♡
      </div>
      <div className="pointer-events-none absolute right-[16%] top-[46%] hidden animate-float text-[28px] text-white/70 md:block">
        ✦
      </div>
      <div className="pointer-events-none absolute right-[6%] bottom-[16%] hidden animate-float-delayed text-[40px] text-[var(--color-primary-soft)] opacity-60 md:block">
        ♥
      </div>
      <div className="pointer-events-none absolute left-[6%] bottom-[20%] hidden animate-float text-[20px] text-white/60 lg:block">
        ✧
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col items-center justify-center">
        {/* Brand header */}
        <div className="mb-8 text-center sm:mb-10">
          <Link to="/" className="group inline-flex flex-col items-center">
            <span className="sweet-brand-title relative text-[clamp(3.5rem,7vw,6rem)]">
              SweetCharm
              <span className="absolute -right-8 -top-2 text-[clamp(1.2rem,2vw,1.8rem)] text-[var(--color-primary-soft)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                ✨
              </span>
            </span>
            <span className="relative mt-3 max-w-[440px] text-[16px] leading-[1.4] tracking-wide text-[var(--color-text-muted)] sm:text-[18px]">
              The first Asian pastry shop in The Netherlands
              <span className="absolute -bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[var(--color-primary-soft)] transition-all duration-500 group-hover:w-3/4" />
            </span>
          </Link>
        </div>

        {/* Main card */}
        <div className="relative w-full max-w-[740px]">
          {/* Subtle glow behind card */}
          <div className="pointer-events-none absolute -inset-4 rounded-[48px] bg-gradient-to-b from-[rgba(247,93,134,0.06)] to-transparent opacity-0 blur-2xl transition-opacity duration-700 md:opacity-100" />

          <div className="relative overflow-hidden rounded-[40px] border border-white/80 bg-white/70 shadow-[0_40px_140px_rgba(182,120,59,0.14)] backdrop-blur-[20px]">
            {/* Top gradient shine */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/80 via-white/40 to-transparent" />

            {/* Animated gradient border accent */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-60" />

            <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              {/* Tab switcher */}
              <div className="relative mx-auto mb-8 flex w-fit rounded-2xl bg-white/85 p-1.5 shadow-[0_8px_32px_rgba(150,93,40,0.08)]">
                {/* Animated sliding indicator */}
                <div
                  className="absolute top-1.5 bottom-1.5 w-[calc(50%-3px)] rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-soft)] shadow-[0_4px_16px_rgba(247,93,134,0.30)] transition-all duration-400 ease-out"
                  style={{
                    left: isRegister ? "calc(50% + 1.5px)" : "1.5px",
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  disabled={isTransitioning}
                  className={`relative z-10 min-w-[130px] rounded-xl px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 sm:min-w-[148px] sm:text-base ${
                    !isRegister
                      ? "text-white"
                      : "text-[var(--color-brown-soft)] hover:text-[var(--color-brown)]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <HiMiniLockClosed className="h-4 w-4" />
                    Login
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("register")}
                  disabled={isTransitioning}
                  className={`relative z-10 min-w-[130px] rounded-xl px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 sm:min-w-[148px] sm:text-base ${
                    isRegister
                      ? "text-white"
                      : "text-[var(--color-brown-soft)] hover:text-[var(--color-brown)]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <HiMiniUser className="h-4 w-4" />
                    Register
                  </span>
                </button>
              </div>

              {/* Title section */}
              <div className="mb-8 text-center">
                <div className={`transition-all duration-400 ${
                  isTransitioning ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
                }`}>
                  <h1 className="text-[clamp(2rem,3.5vw,3rem)] font-bold leading-tight text-[var(--color-brown)]">
                    {title}
                    <HiMiniHeart className="ml-2 inline-block h-7 w-7 translate-y-[-4px] animate-heartbeat text-[var(--color-primary-soft)]" />
                  </h1>
                  <p className="mt-3 text-[16px] leading-7 text-[var(--color-text-muted)] sm:text-[18px]">
                    {subtitle}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className={`transition-all duration-400 ${
                isTransitioning ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
              }`}>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {isRegister ? (
                    <AuthField label="Full Name" icon={<HiMiniUser className="h-5 w-5" />} error={errors.fullName}>
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(event) => updateField("fullName", event.target.value)}
                        className="h-full w-full border-0 bg-transparent text-[16px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-faint)] placeholder:font-light"
                        placeholder="Enter your full name"
                        autoComplete="name"
                      />
                    </AuthField>
                  ) : null}

                  {isRegister ? (
                    <AuthField label="Phone Number" icon={<HiMiniPhone className="h-5 w-5" />} error={errors.phone}>
                      <span className="text-[16px] font-semibold text-[var(--color-primary)]">+998</span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(event) => updateField("phone", formatPhoneInput(event.target.value))}
                        className="h-full w-full border-0 bg-transparent text-[16px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-faint)] placeholder:font-light"
                        placeholder="90 123 45 67"
                        autoComplete="tel"
                        inputMode="numeric"
                      />
                    </AuthField>
                  ) : null}

                  <AuthField label="Email" icon={<MdOutlineAlternateEmail className="h-5 w-5" />} error={errors.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      className="h-full w-full border-0 bg-transparent text-[16px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-faint)] placeholder:font-light"
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                  </AuthField>

                  <AuthField label="Password" icon={<HiMiniLockClosed className="h-5 w-5" />} error={errors.password}>
                    <input
                      type={showPassword.password ? "text" : "password"}
                      value={form.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      className="h-full w-full border-0 bg-transparent text-[16px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-faint)] placeholder:font-light"
                      placeholder={isRegister ? "Create a password" : "Enter your password"}
                      autoComplete={isRegister ? "new-password" : "current-password"}
                    />
                    <button
                      type="button"
                      onClick={() => togglePassword("password")}
                      className="shrink-0 text-[var(--color-text-faint)] transition-all duration-200 hover:scale-110 hover:text-[var(--color-brown)]"
                      aria-label={showPassword.password ? "Hide password" : "Show password"}
                    >
                      {showPassword.password ? <HiMiniEyeSlash className="h-5 w-5" /> : <HiMiniEye className="h-5 w-5" />}
                    </button>
                  </AuthField>

                  {isRegister ? (
                    <AuthField
                      label="Confirm Password"
                      icon={<HiMiniLockClosed className="h-5 w-5" />}
                      error={errors.confirmPassword}
                    >
                      <input
                        type={showPassword.confirmPassword ? "text" : "password"}
                        value={form.confirmPassword}
                        onChange={(event) => updateField("confirmPassword", event.target.value)}
                        className="h-full w-full border-0 bg-transparent text-[16px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-faint)] placeholder:font-light"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePassword("confirmPassword")}
                        className="shrink-0 text-[var(--color-text-faint)] transition-all duration-200 hover:scale-110 hover:text-[var(--color-brown)]"
                        aria-label={showPassword.confirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showPassword.confirmPassword ? (
                          <HiMiniEyeSlash className="h-5 w-5" />
                        ) : (
                          <HiMiniEye className="h-5 w-5" />
                        )}
                      </button>
                    </AuthField>
                  ) : null}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative inline-flex h-[64px] w-full items-center justify-center gap-3 overflow-hidden rounded-[22px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-strong)] px-8 text-[20px] font-bold text-white shadow-[0_12px_28px_rgba(247,93,134,0.32)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_20px_40px_rgba(247,93,134,0.40)] active:translate-y-0 active:shadow-[0_8px_20px_rgba(247,93,134,0.25)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                    >
                      {/* Button shine effect */}
                      <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                      {isSubmitting ? (
                        <span className="flex items-center gap-3">
                          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Please wait...
                        </span>
                      ) : (
                        <>
                          {isRegister ? "Create Account" : "Sign In"}
                          <span className="flex items-center transition-transform duration-300 group-hover:translate-x-1">
                            <HiMiniArrowRight className="h-5 w-5" />
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Toggle auth mode */}
              <div className="mt-8">
                <div className="rounded-[20px] border border-white/60 bg-white/50 px-5 py-4 text-center text-[15px] leading-7 text-[var(--color-text-muted)] shadow-sm backdrop-blur-sm">
                  {isRegister ? "Already have an account?" : "New to SweetCharm?"}{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange(isRegister ? "login" : "register")}
                    disabled={isTransitioning}
                    className="group relative font-bold text-[var(--color-primary)] transition-colors duration-200 hover:text-[var(--color-primary-strong)]"
                  >
                    {isRegister ? "Sign in" : "Create an account"}
                    <span className="absolute -bottom-0.5 left-0 h-[2px] w-full scale-x-0 rounded-full bg-[var(--color-primary)] transition-transform duration-300 group-hover:scale-x-100" />
                  </button>
                </div>
              </div>

              {/* Security badge */}
              <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[var(--color-text-faint)]">
                <HiMiniShieldCheck className="h-4 w-4 text-[var(--color-primary-soft)]" />
                <span className="tracking-wide">Your data is protected with end-to-end encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          25% { transform: translateY(-12px) rotate(var(--r, 0deg)); }
          75% { transform: translateY(6px) rotate(var(--r, 0deg)); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          33% { transform: translateY(-10px) rotate(var(--r, 0deg)); }
          66% { transform: translateY(8px) rotate(var(--r, 0deg)); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1) translateY(-4px); }
          15% { transform: scale(1.25) translateY(-5px); }
          30% { transform: scale(1) translateY(-4px); }
          45% { transform: scale(1.15) translateY(-5px); }
          60% { transform: scale(1) translateY(-4px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        .animate-heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .duration-400 {
          transition-duration: 400ms;
        }
      `}</style>
    </section>
  );
}

export default Login;
