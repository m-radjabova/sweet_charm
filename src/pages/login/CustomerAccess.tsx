import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
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
  persistTokens,
} from "../../api/auth";
import useContextPro from "../../hooks/useContextPro";
import { getPostLoginRoute } from "../../utils/roles";
import {
  formatUzbekPhone,
  normalizeUzbekPhone,
  toApiPhone,
} from "../../utils/phone";

function BrandMark() {
  return (
    <div className="relative">
      <div className="absolute inset-0 animate-pulse rounded-[28px] bg-black/20 blur-xl"></div>
      <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-black to-slate-800 shadow-2xl">
        <HiOutlineScissors className="h-8 w-8 text-white" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default function CustomerAccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const { t } = useTranslation();

  const {
    state: { user },
    login,
  } = useContextPro();

  const [phoneValue, setPhoneValue] = useState("+998 ");

  const schema = z.object({
    full_name: z
      .string()
      .trim()
      .min(3, t("customerAccess.validation.fullName")),
    phone_number: z
      .string()
      .trim()
      .refine((value) => normalizeUzbekPhone(value).length === 9, {
        message: t("customerAccess.validation.phone"),
      }),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      phone_number: "+998 ",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (user?.role === "user") {
      navigate(redirectTo || getPostLoginRoute(user), { replace: true });
    }
  }, [navigate, redirectTo, user]);

  const authMutation = useMutation({
    mutationFn: loginCustomer,
    onSuccess: async (tokens) => {
      try {
        persistTokens(tokens);
        const me = await getMe();
        login(tokens, me);

        toast.success(t("customerAccess.toast.success"), {
          position: "top-right",
          autoClose: 3000,
        });

        navigate(redirectTo || getPostLoginRoute(me), { replace: true });
      } catch (error) {
        clearStoredAuth();
        toast.error(getErrorMessage(error, t("customerAccess.toast.error")));
      }
    },
    onError: (error) => {
      clearStoredAuth();
      toast.error(getErrorMessage(error, t("customerAccess.toast.error")));
    },
  });

  const onSubmit = async (values: FormData) => {
    clearStoredAuth();
    await authMutation.mutateAsync({
      full_name: values.full_name.trim(),
      phone_number: toApiPhone(values.phone_number),
      location_text: null,
      location_lat: null,
      location_lng: null,
    });
  };

  const fullNameValue = watch("full_name");

  const isValid =
    fullNameValue.trim().length >= 3 &&
    normalizeUzbekPhone(phoneValue).length === 9;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4">
      {/* Background blur */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-slate-200/20 blur-3xl"></div>

      {/* Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        {/* Logo */}
        <div className="flex justify-center">
          <BrandMark />
        </div>

        {/* Title */}
        <div className="mt-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            {t("customerAccess.badge")}
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-900">
            {t("customerAccess.formTitle")}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {t("customerAccess.formSubtitle")}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              {t("common.fullName")}
            </label>

            <div className="relative mt-1">
              <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                {...register("full_name")}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-amber-400 focus:bg-white"
                placeholder={t("bookingDetails.namePlaceholder")}
              />
            </div>

            {errors.full_name && (
              <p className="text-xs text-red-500 mt-1">
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              {t("common.phoneNumber")}
            </label>

            <div className="relative mt-1">
              <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                {...register("phone_number")}
                value={phoneValue}
                onChange={(e) => {
                  const formatted = formatUzbekPhone(e.target.value);
                  setPhoneValue(formatted);
                  setValue("phone_number", formatted, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-amber-400 focus:bg-white"
                type="tel"
              />
            </div>

            {errors.phone_number && (
              <p className="text-xs text-red-500 mt-1">
                {errors.phone_number.message}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={!isValid || authMutation.isPending || isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {authMutation.isPending || isSubmitting
              ? t("common.signingIn")
              : t("customerAccess.submit")}
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {t("login.needBooking")}{" "}
            <button
              onClick={() => navigate("/")}
              className="font-semibold text-slate-800 underline decoration-amber-400 underline-offset-2 transition-colors hover:text-amber-600"
            >
              {t("login.goToBooking")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
