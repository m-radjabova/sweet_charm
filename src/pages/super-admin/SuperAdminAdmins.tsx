import { useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button, Chip, Drawer, IconButton } from "@mui/material";
import {
  HiMiniArrowTrendingUp,
  HiMiniBuildingOffice2,
  HiMiniEnvelope,
  HiMiniInformationCircle,
  HiMiniKey,
  HiMiniMagnifyingGlass,
  HiMiniPhone,
  HiMiniPlus,
  HiMiniShieldCheck,
  HiMiniUserCircle,
  HiMiniUserPlus,
  HiMiniUsers,
  HiMiniXMark,
} from "react-icons/hi2";
import { PremiumBadge, PremiumTable, TableSkeleton } from "../../components/ui/PremiumTable";
import useCourseCenters from "../../hooks/useCourseCenters";
import useUsers from "../../hooks/useUsers";
import { formatDate } from "../../utils/date";

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\+?[0-9\s\-()]{9,20}$/.test(value), "Telefon raqami noto'g'ri")
  .transform((value) => value.trim());

const adminFormSchema = z
  .object({
    full_name: z.string().trim().min(3, "F.I.Sh kamida 3 ta harfdan iborat bo'lsin"),
    email: z.string().trim().email("Email noto'g'ri"),
    phone: optionalPhoneSchema,
    password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lsin"),
    course_center_mode: z.enum(["existing", "new"]),
    course_center_id: z.string(),
    new_course_center_name: z.string().trim(),
  })
  .superRefine((value, ctx) => {
    if (value.course_center_mode === "existing" && !value.course_center_id.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["course_center_id"],
        message: "Course center tanlang",
      });
    }

    if (value.course_center_mode === "new" && value.new_course_center_name.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["new_course_center_name"],
        message: "Yangi course center nomini kiriting",
      });
    }
  });

type AdminFormValues = z.infer<typeof adminFormSchema>;

const initialValues: AdminFormValues = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  course_center_mode: "new",
  course_center_id: "",
  new_course_center_name: "",
};

function slugifyCourseCenterName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export default function SuperAdminAdmins() {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const {
    users,
    loading,
    isFetching,
    searchTerm,
    setSearchTerm,
    createUser,
    creatingUser,
  } = useUsers("admin");
  const {
    courseCenters,
    loading: courseCentersLoading,
    createCourseCenter,
    creatingCourseCenter,
  } = useCourseCenters();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: initialValues,
  });

  const courseCenterMode = useWatch({
    control,
    name: "course_center_mode",
  });

  const admins = useMemo(
    () => users.filter((user) => user.role === "admin" || user.roles?.includes("admin")),
    [users],
  );

  const activeAdmins = admins.filter((user) => user.status === "active");
  const attachedAdmins = admins.filter((user) => user.course_center_id || user.course_center_name);
  const occupiedCourseCenters = useMemo(
    () =>
      new Map(
        admins
          .filter((user) => user.course_center_id)
          .map((user) => [
            user.course_center_id as string,
            user.full_name,
          ]),
      ),
    [admins],
  );

  const handleCloseDrawer = () => {
    setIsCreateDrawerOpen(false);
    reset(initialValues);
  };

  const onSubmit = handleSubmit(async (values) => {
    let courseCenterId = values.course_center_id;

    if (values.course_center_mode === "new") {
      const normalizedName = values.new_course_center_name.trim();
      const existingCourseCenter = courseCenters.find(
        (courseCenter) => courseCenter.name.trim().toLowerCase() === normalizedName.toLowerCase(),
      );

      if (existingCourseCenter) {
        const occupiedBy = occupiedCourseCenters.get(existingCourseCenter.id);
        if (occupiedBy) {
          setError("new_course_center_name", {
            type: "manual",
            message: `${existingCourseCenter.name} allaqachon ${occupiedBy} ga biriktirilgan`,
          });
          return;
        }
        courseCenterId = existingCourseCenter.id;
      } else {
        const createdCourseCenter = await createCourseCenter({
          name: normalizedName,
          slug: slugifyCourseCenterName(normalizedName),
          description: `${values.full_name.trim()} uchun alohida admin workspace`,
          is_active: true,
        });
        courseCenterId = createdCourseCenter.id;
      }
    }

    if (courseCenterId) {
      const occupiedBy = occupiedCourseCenters.get(courseCenterId);
      if (occupiedBy) {
        setError("course_center_id", {
          type: "manual",
          message: `Bu course center allaqachon ${occupiedBy} ga biriktirilgan`,
        });
        return;
      }
    }

    await createUser({
      full_name: values.full_name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim() || null,
      password: values.password,
      course_center_id: courseCenterId,
      roles: ["admin"],
      status: "active",
    });

    handleCloseDrawer();
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_38%,#eef4ff_100%)]">
      <div className="mx-auto max-w-[1800px] space-y-6 p-4 lg:p-6">
        <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_28px_80px_-45px_rgba(15,23,42,0.22)]">
          <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92),rgba(3,105,161,0.9))] px-6 py-6 text-white lg:px-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <Chip
                  label="SUPER ADMIN"
                  className="!mb-4 !h-8 !rounded-full !bg-white/10 !px-2 !text-[11px] !font-black !tracking-[0.28em] !text-slate-100"
                />
                <h1 className="text-3xl font-black tracking-tight sm:text-[2.5rem]">
                  Adminlarni boshqarish
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Adminlar ro'yxatini boshqaring, yangi admin yarating va course center bo'yicha
                  ulanishni bitta joydan nazorat qiling.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsCreateDrawerOpen(true)}
                  style={{borderRadius: "20px"}}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-slate-950 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5"
                >
                  <HiMiniPlus className="text-lg" />
                  Admin qo'shish
                </button>
                <div className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-100">
                  <HiMiniArrowTrendingUp className="text-lg text-emerald-300" />
                  {activeAdmins.length} ta faol admin
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-5 md:grid-cols-3 lg:px-8">
            <StatCard
              icon={<HiMiniUsers className="text-2xl text-sky-600" />}
              label="Jami admin"
              value={admins.length}
              helper="Barcha filiallar bo'yicha"
            />
            <StatCard
              icon={<HiMiniShieldCheck className="text-2xl text-emerald-600" />}
              label="Faol admin"
              value={activeAdmins.length}
              helper="Hozir ishlayotgan akkauntlar"
            />
            <StatCard
              icon={<HiMiniBuildingOffice2 className="text-2xl text-violet-600" />}
              label="Center biriktirilgan"
              value={attachedAdmins.length}
              helper="Workspace'ga ulangan adminlar"
            />
          </div>
        </section>

        <PremiumTable
          eyebrow="Adminlar"
          title="Adminlar jadvali"
          description="Har bir admin o'z course center doirasidagi ma'lumotlar bilan ishlashi kerak."
          summary={
            <>
              <PremiumBadge tone="sky">{admins.length} ta admin</PremiumBadge>
              <PremiumBadge tone="emerald">{activeAdmins.length} ta active</PremiumBadge>
              {isFetching ? <PremiumBadge tone="amber">Yangilanmoqda...</PremiumBadge> : null}
            </>
          }
          actions={
            <>
              <label className="flex h-12 min-w-[260px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                <HiMiniMagnifyingGlass className="text-lg text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Admin qidirish"
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
              <button
                type="button"
                onClick={() => setIsCreateDrawerOpen(true)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <HiMiniPlus className="text-lg" />
                Admin qo'shish
              </button>
            </>
          }
        >
          {loading ? (
            <TableSkeleton columns={6} rows={5} />
          ) : admins.length === 0 ? (
            <div className="px-6 py-16">
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white">
                  <HiMiniUsers className="text-3xl" />
                </div>
                <h3 className="mt-4 text-xl font-black text-slate-950">Admin topilmadi</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Hozircha admin foydalanuvchilar yo'q. Yangi admin yaratish uchun tugmadan
                  foydalaning.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1120px] w-full">
                <thead className="border-b border-slate-200 bg-slate-950/[0.03]">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Admin
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Aloqa
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Course center
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Holat
                    </th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">
                      Yaratilgan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin, index) => (
                    <tr
                      key={admin.id}
                      className={`border-b border-slate-200/80 transition hover:bg-sky-50/45 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/35"
                      }`}
                    >
                      <td className="px-6 py-5 align-top">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                            <HiMiniUserCircle className="text-2xl" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-950">
                              {admin.full_name}
                            </p>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              ID: {admin.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <HiMiniEnvelope className="text-base text-slate-400" />
                            <span className="truncate">{admin.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HiMiniPhone className="text-base text-slate-400" />
                            <span>{admin.phone || admin.phone_number || "Telefon kiritilmagan"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="inline-flex max-w-[260px] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                          <HiMiniBuildingOffice2 className="shrink-0 text-base text-sky-600" />
                          <span className="truncate">
                            {admin.course_center_name || "Center biriktirilmagan"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <PremiumBadge tone="sky">Admin</PremiumBadge>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <PremiumBadge tone={admin.status === "active" ? "emerald" : "slate"}>
                          {admin.status}
                        </PremiumBadge>
                      </td>
                      <td className="px-6 py-5 align-top text-sm font-medium text-slate-600">
                        {formatDate(admin.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PremiumTable>
      </div>

      <Drawer
        anchor="right"
        open={isCreateDrawerOpen}
        onClose={creatingUser || creatingCourseCenter || isSubmitting ? undefined : handleCloseDrawer}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 500, md: 560 },
              borderRadius: { xs: 0, sm: "32px 0 0 32px" },
            },
          },
        }}
      >
        <div className="flex h-full flex-col">
          <div className="bg-gradient-to-r from-sky-600 via-cyan-600 to-slate-900 p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <HiMiniUserPlus className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Yangi admin qo'shish</h2>
                  <p className="mt-1 text-sm text-white/85">
                    Admin ma'lumotlarini kiriting va course center bilan ulang.
                  </p>
                </div>
              </div>

              <IconButton
                onClick={handleCloseDrawer}
                disabled={creatingUser || creatingCourseCenter || isSubmitting}
                sx={{ color: "white" }}
              >
                <HiMiniXMark size={22} />
              </IconButton>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="F.I.Sh"
                  icon={<HiMiniUsers className="text-lg text-slate-400" />}
                  error={errors.full_name?.message}
                >
                  <input
                    {...register("full_name")}
                    className={inputClassName(errors.full_name?.message)}
                    placeholder="Admin ism familiyasi"
                  />
                </Field>

                <Field
                  label="Telefon"
                  icon={<HiMiniPhone className="text-lg text-slate-400" />}
                  error={errors.phone?.message}
                >
                  <input
                    {...register("phone")}
                    className={inputClassName(errors.phone?.message)}
                    placeholder="+998 90 123 45 67"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Email"
                  icon={<HiMiniEnvelope className="text-lg text-slate-400" />}
                  error={errors.email?.message}
                >
                  <input
                    type="email"
                    {...register("email")}
                    className={inputClassName(errors.email?.message)}
                    placeholder="admin@company.uz"
                  />
                </Field>

                <Field
                  label="Parol"
                  icon={<HiMiniKey className="text-lg text-slate-400" />}
                  error={errors.password?.message}
                >
                  <input
                    type="password"
                    {...register("password")}
                    className={inputClassName(errors.password?.message)}
                    placeholder="Kamida 6 ta belgi"
                  />
                </Field>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <HiMiniBuildingOffice2 className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-950">Course center tanlash</h3>
                    <p className="text-sm text-slate-500">
                      Yangi center ochish yoki mavjudiga ulash mumkin.
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input type="radio" value="new" {...register("course_center_mode")} className="mt-1" />
                    <span>Yangi center ochish</span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input type="radio" value="existing" {...register("course_center_mode")} className="mt-1" />
                    <span>Mavjud centerga ulash</span>
                  </label>
                </div>

                <div className="mt-4">
                  {courseCenterMode === "new" ? (
                    <Field
                      label="Yangi course center nomi"
                      icon={<HiMiniBuildingOffice2 className="text-lg text-slate-400" />}
                      error={errors.new_course_center_name?.message}
                    >
                      <input
                        {...register("new_course_center_name")}
                        className={inputClassName(errors.new_course_center_name?.message)}
                        placeholder="Masalan: Hasan Education Center"
                      />
                    </Field>
                  ) : (
                    <Field
                      label="Mavjud course center"
                      icon={<HiMiniBuildingOffice2 className="text-lg text-slate-400" />}
                      error={errors.course_center_id?.message}
                    >
                      <select
                        {...register("course_center_id")}
                        className={inputClassName(errors.course_center_id?.message)}
                        disabled={courseCentersLoading || courseCenters.length === 0}
                      >
                        <option value="">Course center tanlang</option>
                        {courseCenters.map((courseCenter) => (
                          <option
                            key={courseCenter.id}
                            value={courseCenter.id}
                            disabled={occupiedCourseCenters.has(courseCenter.id)}
                          >
                            {occupiedCourseCenters.has(courseCenter.id)
                              ? `${courseCenter.name} - band`
                              : courseCenter.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <div className="flex items-start gap-2">
                  <HiMiniInformationCircle className="mt-0.5 shrink-0 text-lg" />
                  <p>
                    Agar ayni nomli course center avval yaratilgan bo'lsa, admin o'sha centerga
                    ulanadi. Yangi nom kiritsangiz, alohida workspace ochiladi.
                  </p>
                  <p className="mt-2">
                    Har bir course centerga faqat bitta admin biriktiriladi. Band centerlar tanlovda
                    bloklanadi.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-700">
                  Eslatma
                </p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <p>Admin foydalanuvchiga avtomatik `admin` roli biriktiriladi.</p>
                  <p>Yangi yaratilgan akkaunt default holatda `active` bo'ladi.</p>
                  <p>Backend list va query'lar `course_center_id` bo'yicha cheklanishi kerak.</p>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  disabled={isSubmitting || creatingUser || creatingCourseCenter}
                  className="flex-1 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Bekor qilish
                </button>
                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  disabled={isSubmitting || creatingUser || creatingCourseCenter}
                  sx={{
                    flex: 1,
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #0f172a 0%, #0284c7 100%)",
                    py: 1.5,
                  }}
                >
                  {isSubmitting || creatingUser || creatingCourseCenter
                    ? "Yaratilmoqda..."
                    : "Admin yaratish"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.92))] p-5 shadow-[0_20px_50px_-42px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
          {icon}
        </div>
        <PremiumBadge tone="sky">{label}</PremiumBadge>
      </div>
      <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{helper}</p>
    </div>
  );
}

function Field({
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
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 transition ${
          error ? "border-rose-200 bg-rose-50/60" : "border-slate-200 bg-slate-50"
        }`}
      >
        <span className="shrink-0">{icon}</span>
        {children}
      </div>
      {error ? <p className="mt-1 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

function inputClassName(hasError?: string) {
  return `h-12 w-full bg-transparent text-sm font-medium outline-none ${
    hasError ? "text-rose-700 placeholder:text-rose-300" : "text-slate-800 placeholder:text-slate-400"
  }`;
}
