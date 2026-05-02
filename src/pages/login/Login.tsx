import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlinePhone,
  HiOutlineScissors,
  HiOutlineUser,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import {
  clearStoredAuth,
  getErrorMessage,
  getMe,
  loginCustomer,
  loginUser,
  persistTokens,
} from "../../api/auth";
import useContextPro from "../../hooks/useContextPro";
import { formatUzbekPhone, normalizeUzbekPhone, toApiPhone } from "../../utils/phone";
import { getPostLoginRoute, getRoleLabel } from "../../utils/roles";

type LoginMode = "customer" | "staff";

function BrandMark() {
  return (
    <div className="relative">
      <div className="absolute inset-0 animate-pulse rounded-[28px] bg-black/20 blur-xl" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-black to-slate-800 shadow-2xl">
        <HiOutlineScissors className="h-8 w-8 text-white" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const {
    login,
    state: { user },
  } = useContextPro();

  const [mode, setMode] = useState<LoginMode>(
    searchParams.get("mode") === "staff" ? "staff" : "customer",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [phoneValue, setPhoneValue] = useState("+998 ");

  useEffect(() => {
    if (user?.role) {
      navigate(getPostLoginRoute(user), { replace: true });
    }
  }, [navigate, user]);

  const customerSchema = z.object({
    full_name: z.string().trim().min(3, "Ism kamida 3 ta belgidan iborat bo'lishi kerak"),
    phone_number: z.string().trim().refine((value) => normalizeUzbekPhone(value).length === 9, {
      message: "Telefon raqamni to'liq kiriting",
    }),
  });
  const staffSchema = z.object({
    email: z.string().min(1, "Email kiritilishi shart").email("Email formati noto'g'ri"),
    password: z.string().min(1, "Parol kiritilishi shart").min(6, "Parol kamida 6 ta belgi"),
  });

  type CustomerFormData = z.infer<typeof customerSchema>;
  type StaffFormData = z.infer<typeof staffSchema>;

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { full_name: "", phone_number: "+998 " },
    mode: "onChange",
  });
  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const customerMutation = useMutation({
    mutationFn: loginCustomer,
    onSuccess: async (tokens) => {
      try {
        persistTokens(tokens);
        const me = await getMe();
        login(tokens, me);
        toast.success("Kirish muvaffaqiyatli bajarildi", { position: "top-right", autoClose: 3000 });
        navigate(getPostLoginRoute(me), { replace: true });
      } catch (error) {
        clearStoredAuth();
        toast.error(getErrorMessage(error, "Login qilishda xatolik yuz berdi"));
      }
    },
    onError: (error) => {
      clearStoredAuth();
      toast.error(getErrorMessage(error, "Login qilishda xatolik yuz berdi"));
    },
  });

  const onCustomerSubmit = async (values: CustomerFormData) => {
    clearStoredAuth();
    await customerMutation.mutateAsync({
      full_name: values.full_name.trim(),
      phone_number: toApiPhone(values.phone_number),
      location_text: null,
      location_lat: null,
      location_lng: null,
    });
  };

  const handleStaffError = (error: any) => {
    const status = error?.response?.status;
    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      error?.message ||
      "";
    const message = String(backendMessage).toLowerCase();

    if (status === 404 || message.includes("topilmadi") || message.includes("not found")) {
      staffForm.setError("email", { type: "manual", message: "Bu email topilmadi" });
      toast.error("Bu email topilmadi");
      return;
    }

    if (status === 401 || message.includes("password") || message.includes("parol")) {
      staffForm.setError("password", { type: "manual", message: "Email yoki parol noto'g'ri" });
      toast.error("Email yoki parol noto'g'ri");
      return;
    }

    toast.error(getErrorMessage(error, "Login qilishda xatolik yuz berdi"));
  };

  const onStaffSubmit = async (payload: StaffFormData) => {
    staffForm.clearErrors();
    clearStoredAuth();

    try {
      const tokens = await loginUser(payload);
      persistTokens(tokens);
      const me = await getMe();
      login(tokens, me);
      toast.success(t("login.toast.success", { role: getRoleLabel(me.role) }), {
        position: "top-right",
        autoClose: 3000,
      });
      navigate(getPostLoginRoute(me), { replace: true });
    } catch (error) {
      clearStoredAuth();
      handleStaffError(error);
    }
  };

  const customerName = customerForm.watch("full_name");
  const staffEmail = staffForm.watch("email");
  const staffPassword = staffForm.watch("password");
  const isCustomerValid = customerName.trim().length >= 3 && normalizeUzbekPhone(phoneValue).length === 9;
  const isStaffValid = staffEmail.includes("@") && staffPassword.length >= 6;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-8">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-slate-200/20 blur-3xl" />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex justify-center">
          <BrandMark />
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            {mode === "customer" ? "Klient kirishi" : "Admin va barber kirishi"}
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">
            {mode === "customer" ? "Ro'yxatdan o'tish" : t("brand.name")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === "customer"
              ? "Bron qilish uchun ism va telefon raqamingizni kiriting."
              : "Admin yoki barber kabinetiga email va parol orqali kiring."}
          </p>
        </div>

        {mode === "customer" ? (
          <form className="mt-8 space-y-5" onSubmit={customerForm.handleSubmit(onCustomerSubmit)}>
            <div>
              <label className="text-sm font-semibold text-slate-700">{t("common.fullName")}</label>
              <div className="relative mt-1">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...customerForm.register("full_name")}
                  className="h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-amber-400 focus:bg-white"
                  placeholder={t("bookingDetails.namePlaceholder")}
                />
              </div>
              {customerForm.formState.errors.full_name && (
                <p className="mt-1 text-xs text-red-500">{customerForm.formState.errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">{t("common.phoneNumber")}</label>
              <div className="relative mt-1">
                <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  {...customerForm.register("phone_number")}
                  value={phoneValue}
                  onChange={(event) => {
                    const formatted = formatUzbekPhone(event.target.value);
                    setPhoneValue(formatted);
                    customerForm.setValue("phone_number", formatted, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  className="h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-amber-400 focus:bg-white"
                  type="tel"
                />
              </div>
              {customerForm.formState.errors.phone_number && (
                <p className="mt-1 text-xs text-red-500">{customerForm.formState.errors.phone_number.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isCustomerValid || customerMutation.isPending || customerForm.formState.isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
            >
              {customerMutation.isPending || customerForm.formState.isSubmitting ? t("common.signingIn") : "Davom etish"}
              <HiOutlineArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={staffForm.handleSubmit(onStaffSubmit)}>
            <div>
              <label className="text-sm font-semibold text-slate-700">{t("common.email")}</label>
              <div className="relative mt-1">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder={t("login.emailPlaceholder")}
                  {...staffForm.register("email")}
                  className="h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-amber-400 focus:bg-white"
                />
              </div>
              {staffForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-500">{staffForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">{t("common.password")}</label>
              <div className="relative mt-1">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("login.passwordPlaceholder")}
                  {...staffForm.register("password")}
                  className="h-12 w-full rounded-xl border-2 border-slate-200 bg-slate-50 pl-10 pr-12 text-sm outline-none focus:border-amber-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <HiOutlineEyeSlash className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                </button>
              </div>
              {staffForm.formState.errors.password && (
                <p className="mt-1 text-xs text-red-500">{staffForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isStaffValid || staffForm.formState.isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50"
            >
              {staffForm.formState.isSubmitting ? t("common.signingIn") : t("login.submit")}
              <HiOutlineArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="mt-7 border-t border-slate-100 pt-5 text-center">
          <p className="text-sm text-slate-500">
            {mode === "customer" ? "Admin yoki sartaroshmisiz?" : "Klient sifatida kirmoqchimisiz?"}
          </p>
          <button
            type="button"
            onClick={() => setMode((current) => (current === "customer" ? "staff" : "customer"))}
            className="mt-2 font-semibold text-slate-900 underline decoration-amber-400 underline-offset-4 transition hover:text-amber-600"
          >
            {mode === "customer" ? "Admin / Barber bo'lib kirish" : "Klient bo'lib ro'yxatdan o'tish"}
          </button>
        </div>
      </div>
    </div>
  );
}
