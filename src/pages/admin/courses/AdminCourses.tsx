import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Drawer,
  IconButton,
  Avatar,
  Chip,
  Skeleton,
} from "@mui/material";
import {
  HiMiniBanknotes,
  HiMiniClock,
  HiMiniPencilSquare,
  HiMiniPlus,
  HiMiniSquares2X2,
  HiMiniTrash,
  HiMiniXMark,
  HiMiniMagnifyingGlass,
  HiMiniCheckCircle
} from "react-icons/hi2";
import useCourses from "../../../hooks/useCourses";
import useGroups from "../../../hooks/useGroups";
import ConfirmActionDialog from "../../../components/ConfirmActionDialog";
import { PremiumBadge } from "../../../components/ui/PremiumTable";
import { RowActionMenu } from "../../../components/ui/RowActionMenu";
import type { Course } from "../../../types/types";
import { formatCourseDate, getNextMonthInputValue, isCourseUpdated, normalizeMonthForApi } from "./utils";

type CourseFormState = {
  name: string;
  description: string;
  default_monthly_fee: string;
  fee_effective_from: string;
  is_active: "true" | "false";
};

const courseFormSchema = z.object({
  name: z.string().trim().min(2, "Kurs nomi kamida 2 ta harf bo'lsin").max(120, "Kurs nomi juda uzun"),
  description: z.string().trim().max(1000, "Tavsif juda uzun"),
  default_monthly_fee: z
    .string()
    .trim()
    .refine((value) => value !== "" && !Number.isNaN(Number(value)) && Number(value) >= 0, "Oylik to'lov noto'g'ri"),
  fee_effective_from: z.string().trim(),
  is_active: z.enum(["true", "false"]),
});

const initialCourseForm = (): CourseFormState => ({
  name: "",
  description: "",
  default_monthly_fee: "",
  fee_effective_from: getNextMonthInputValue(),
  is_active: "true",
});

function AdminCourses() {
  const { groups } = useGroups();
  const { courses, loading, searchTerm, setSearchTerm, createCourse, updateCourse, deleteCourse } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormState>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: initialCourseForm(),
  });

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  useEffect(() => {
    if (!selectedCourse) {
      reset(initialCourseForm());
      return;
    }
    reset({
      name: selectedCourse.name,
      description: selectedCourse.description ?? "",
      default_monthly_fee: selectedCourse.default_monthly_fee,
      fee_effective_from: getNextMonthInputValue(),
      is_active: selectedCourse.is_active ? "true" : "false",
    });
  }, [reset, selectedCourse]);

  const watchedFee = watch("default_monthly_fee");
  const feeChanged = Boolean(
    selectedCourse &&
      watchedFee !== "" &&
      Number(watchedFee) !== Number(selectedCourse.default_monthly_fee),
  );

  const handleOpenDrawer = (courseId?: string) => {
    if (courseId) {
      setSelectedCourseId(courseId);
    } else {
      setSelectedCourseId(null);
      reset(initialCourseForm());
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCourseId(null);
    reset(initialCourseForm());
  };

  const handleSubmitCourse = async (form: CourseFormState) => {
    const feeChangedInEdit =
      Boolean(selectedCourseId) &&
      Number(form.default_monthly_fee) !== Number(selectedCourse?.default_monthly_fee ?? 0);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      default_monthly_fee: Number(form.default_monthly_fee),
      fee_effective_from: feeChangedInEdit ? normalizeMonthForApi(form.fee_effective_from) : null,
      is_active: form.is_active === "true",
    };

    if (selectedCourseId) {
      await updateCourse(selectedCourseId, payload);
    } else {
      await createCourse(payload);
    }
    handleCloseDrawer();
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeletingCourse(true);
    try {
      await deleteCourse(courseToDelete.id);
      if (selectedCourseId === courseToDelete.id) {
        setSelectedCourseId(null);
      }
      setCourseToDelete(null);
    } finally {
      setIsDeletingCourse(false);
    }
  };

  const totalMonthlyFees = useMemo(
    () => courses.reduce((sum, course) => sum + Number(course.default_monthly_fee || 0), 0),
    [courses],
  );

  const activeCoursesCount = useMemo(
    () => courses.filter((course) => course.is_active).length,
    [courses],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/20">
      <div className="max-w-[1800px] mx-auto p-4 lg:p-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-orange-800 to-amber-500 text-white">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
            <HiMiniSquares2X2 size={350} />
          </div>
          <div className="absolute bottom-0 left-0 w-60 h-60 opacity-5">
            <HiMiniBanknotes size={250} />
          </div>
          <div className="relative px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div className="max-w-3xl">
                <Chip 
                  label="KURS MARKAZI" 
                  className="!mb-4 !bg-white/20 !text-white !font-bold !text-sm !py-1 !px-4"
                />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  Kurslarni boshqarish
                </h1>
                <p className="mt-4 text-amber-100 text-base sm:text-lg max-w-xl leading-relaxed">
                  Kurs yaratish, oylik to'lovni belgilash va kurslarni boshqarish markazi
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <StatCard label="Jami kurs" value={courses.length} icon={<HiMiniSquares2X2 size={22} />} color="amber" />
                <StatCard label="Faol kurs" value={activeCoursesCount} icon={<HiMiniCheckCircle size={22} />} color="emerald" />
                <StatCard label="Jami tarif" value={totalMonthlyFees.toLocaleString()} icon={<HiMiniBanknotes size={22} />} color="orange" suffix="so'm" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm hover:shadow-md transition-all">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">KURS BOSHQARUVI</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Kurs qo'shish va tahrirlash</h3>
            <p className="text-sm text-slate-500 mt-1">Kurs ma'lumotlarini boshqaring va guruhlarga ajrating</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <HiMiniMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Kurs qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all w-64"
              />
            </div>
            <button
              onClick={() => handleOpenDrawer()}
              style={{borderRadius : "20px"}}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <HiMiniPlus size={20} />
              Yangi kurs qo'shish
            </button>
          </div>
        </div>

        {/* Courses List Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Kurslar ro'yxati</h2>
            <p className="text-sm text-slate-500 mt-0.5">Barcha kurslar va ularga tegishli ma'lumotlar</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              {courses.length} ta kurs
            </span>
            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
              {activeCoursesCount} ta faol
            </span>
          </div>
        </div>

        {/* Courses Grid/Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
                <Skeleton variant="rounded" height={100} className="rounded-xl mb-3" />
                <Skeleton variant="text" width="80%" height={24} className="mb-2" />
                <Skeleton variant="text" width="60%" height={20} />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <HiMiniSquares2X2 size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Kurs topilmadi</h3>
            <p className="text-sm text-slate-400">Yangi kurs yaratish uchun yuqoridagi tugmani bosing</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                groupsCount={groups.filter((g) => g.course_id === course.id).length}
                onEdit={() => handleOpenDrawer(course.id)}
                onDelete={() => setCourseToDelete(course)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Course Form Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100%", sm: 500, md: 560 },
              borderRadius: { xs: 0, sm: "32px 0 0 32px" },
            },
          },
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 48, height: 48 }}>
                  {selectedCourse ? <HiMiniPencilSquare size={24} /> : <HiMiniPlus size={24} />}
                </Avatar>
                <div>
                  <h3 className="text-xl font-black">
                    {selectedCourse ? "Kursni tahrirlash" : "Yangi kurs qo'shish"}
                  </h3>
                  <p className="text-sm opacity-90 mt-0.5">
                    {selectedCourse ? selectedCourse.name : "Kurs ma'lumotlarini to'ldiring"}
                  </p>
                </div>
              </div>
              <IconButton onClick={handleCloseDrawer} sx={{ color: "white" }}>
                <HiMiniXMark size={20} />
              </IconButton>
            </div>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(handleSubmitCourse)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Kurs nomi <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.name 
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" 
                          : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
                      } focus:outline-none focus:ring-2 transition-all`}
                      placeholder="Masalan: IELTS Foundation"
                    />
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Oylik to'lov <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="default_monthly_fee"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">
                        so'm
                      </span>
                      <input
                        {...field}
                        type="number"
                        className={`w-full appearance-none [moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none pl-20 pr-4 py-2.5 rounded-xl border ${
                          errors.default_monthly_fee 
                            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" 
                            : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
                        } focus:outline-none focus:ring-2 transition-all`}
                        placeholder="650000"
                        min="0"
                      />
                    </div>
                  )}
                />
                {errors.default_monthly_fee && (
                  <p className="mt-1 text-sm text-rose-600">{errors.default_monthly_fee.message}</p>
                )}
              </div>

              {selectedCourse && feeChanged && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Yangi tarif qaysi oydan amal qiladi
                  </label>
                  <Controller
                    name="fee_effective_from"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="month"
                        min={getNextMonthInputValue()}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100 transition-all"
                      />
                    )}
                  />
                  <p className="mt-1 text-sm text-slate-500">
                    Eski oylar eski tarifda qoladi, yangi tarif shu oydan boshlab ishlaydi.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Holati
                </label>
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="true"
                          checked={field.value === "true"}
                          onChange={() => field.onChange("true")}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="flex items-center gap-1 text-sm text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Faol
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="false"
                          checked={field.value === "false"}
                          onChange={() => field.onChange("false")}
                          className="w-4 h-4 text-slate-600 focus:ring-slate-500"
                        />
                        <span className="flex items-center gap-1 text-sm text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          Nofaol
                        </span>
                      </label>
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tavsif
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.description 
                          ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100" 
                          : "border-slate-200 focus:border-amber-400 focus:ring-amber-100"
                      } focus:outline-none focus:ring-2 transition-all resize-none`}
                      placeholder="Kurs haqida qisqacha ma'lumot..."
                    />
                  )}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-rose-600">{errors.description.message}</p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tariflar tarix bilan saqlanadi. Narxni yangilasangiz, eski oylar o'zgarmaydi.
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saqlanmoqda..." : (selectedCourse ? "Yangilash" : "Yaratish")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourseId(null);
                    reset(initialCourseForm());
                  }}
                  className="px-5 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Tozalash
                </button>
              </div>
            </form>
          </div>
        </div>
      </Drawer>

      <ConfirmActionDialog
        open={Boolean(courseToDelete)}
        title="Kursni o'chirish"
        description={
          courseToDelete
            ? `${courseToDelete.name} kursini o'chirmoqchimisiz?`
            : ""
        }
        confirmText="Ha, o'chirish"
        cancelText="Yo'q"
        loading={isDeletingCourse}
        tone="danger"
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDeleteCourse}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color, suffix = "" }: { label: string; value: number | string; icon: React.ReactNode; color: string; suffix?: string }) {
  const colors = {
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  };
  return (
    <div className={`p-4 rounded-xl border min-w-[130px] ${colors[color as keyof typeof colors]}`}>
      <div className="flex items-center gap-2">
        <div>{icon}</div>
        <div>
          <p className="text-[11px] font-bold text-white/70 uppercase">{label}</p>
          <p className="text-xl font-black text-white">
            {typeof value === "number" ? value.toLocaleString() : value} {suffix && <span className="text-xs font-normal">{suffix}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, groupsCount, onEdit, onDelete }: { course: Course; groupsCount: number; onEdit: () => void; onDelete: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const courseWasUpdated = isCourseUpdated(course);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Card Header */}
      <div className="relative h-28 bg-gradient-to-r from-amber-500 to-orange-600 p-4">
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {courseWasUpdated && (
            <PremiumBadge tone="amber">
              <HiMiniClock size={12} />
              Yangilangan
            </PremiumBadge>
          )}
          <PremiumBadge tone={course.is_active ? "emerald" : "slate"}>
            {course.is_active ? "Faol" : "Nofaol"}
          </PremiumBadge>
          <RowActionMenu
            items={[
              {
                label: "Tahrirlash",
                onClick: onEdit,
                icon: <HiMiniPencilSquare size={16} />,
              },
              {
                label: "O'chirish",
                onClick: onDelete,
                icon: <HiMiniTrash size={16} />,
                danger: true,
              },
            ]}
          />
        </div>
        <div className="flex items-center gap-3 mt-8">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur text-white flex items-center justify-center text-xl font-black">
            {course.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{course.name}</h3>
            <p className="text-xs text-amber-100">Kurs</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HiMiniBanknotes size={16} className="text-amber-500" />
            <span className="text-sm text-slate-500">Oylik to'lov</span>
          </div>
          <span className="text-lg font-black text-amber-600">{Number(course.default_monthly_fee).toLocaleString()} so'm</span>
        </div>

        {courseWasUpdated && (
          <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Oxirgi yangilanish</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">{formatCourseDate(course.updated_at)}</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HiMiniSquares2X2 size={16} className="text-slate-400" />
            <span className="text-sm text-slate-500">Guruhlar</span>
          </div>
          <PremiumBadge tone={groupsCount > 0 ? "emerald" : "slate"}>
            {groupsCount} ta guruh
          </PremiumBadge>
        </div>

        {course.description && (
          <div className={`mt-3 pt-3 border-t border-slate-100 ${!isExpanded && "line-clamp-2"}`}>
            <p className="text-sm text-slate-600">{course.description}</p>
          </div>
        )}

        {course.description && course.description.length > 100 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-semibold"
          >
            {isExpanded ? "Yopish" : "Ko'proq"}
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminCourses;