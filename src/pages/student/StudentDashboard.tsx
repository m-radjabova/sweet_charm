import { Chip } from "@mui/material";
import {
  HiMiniAcademicCap,
  HiMiniBanknotes,
  HiMiniBookOpen,
  HiMiniCalendar,
  HiMiniCheckBadge,
  HiMiniClock,
  HiMiniUserCircle,
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";
import useStudentOverview from "../../hooks/useStudentOverview";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("uz-UZ").format(amount);
}

function formatDate(value?: string | null) {
  if (!value) return "Belgilanmagan";
  return new Date(value).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function StudentDashboard() {
  const {
    state: { user },
  } = useContextPro();
  const { enrollments, lessons, payments, grades, loading } = useStudentOverview(user?.id);

  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const currentGroups = enrollments.filter((enrollment) => enrollment.status === "active");
  const recentLessons = lessons.slice(0, 6);
  const averageScore =
    grades.length > 0
      ? Math.round(grades.reduce((sum, grade) => sum + Number(grade.score || 0), 0) / grades.length)
      : 0;

  if (loading) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="relative rounded-2xl bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
        {/* Dekorativ elementlar */}
        <div className="absolute -top-3 -right-3 h-20 w-20 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="absolute -bottom-3 -left-3 h-20 w-20 rounded-full bg-sky-500/20 blur-2xl" />
        
        <div className="relative flex flex-col items-center gap-5">
          {/* Spinner */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-emerald-100" />
            <div className="absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <div className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2">
              <svg className="h-full w-full text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          {/* Matn */}
          <div className="text-center">
            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
              Student panel yuklanmoqda
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Guruh, dars va to'lov ma'lumotlari tayyorlanmoqda
            </p>
          </div>

          {/* Loading progress barlar (animatsiyali) */}
          <div className="mt-2 w-64 space-y-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full w-1/3 animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
            </div>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1 w-6 animate-pulse rounded-full bg-emerald-200"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="mx-auto max-w-[1700px] space-y-6 p-4 pb-8 lg:p-6">
      <section className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(135deg,#0f3b36_0%,#0c5f5e_50%,#0f766e_100%)] px-6 py-8 text-white shadow-[0_28px_90px_rgba(15,118,110,0.18)] md:px-8 md:py-10 lg:px-10">
        <div className="absolute -right-8 -top-12 h-52 w-52 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/8 blur-3xl" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Chip
              label="STUDENT PANEL"
              className="!mb-4 !bg-white/15 !text-white !font-bold !tracking-wide"
            />
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              Salom, {user?.full_name?.split(" ")[0] ?? "student"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/82 sm:text-base">
              Bu yerda siz o'qiyotgan guruhlar, darslardagi vazifalar, natijalar va qilgan to'lovlaringiz
              bitta joyda ko'rinadi.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/70">Asosiy guruh</p>
              <p className="mt-2 text-xl font-bold text-white">
                {currentGroups[0]?.group?.name ?? enrollments[0]?.group?.name ?? "Hali biriktirilmagan"}
              </p>
              <p className="mt-1 text-sm text-emerald-50/70">
                {currentGroups[0]?.group?.course?.name ?? enrollments[0]?.group?.course?.name ?? "Kurs ma'lumoti yo'q"}
              </p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-100/70">Mentor</p>
              <p className="mt-2 text-xl font-bold text-white">
                {currentGroups[0]?.group?.teacher?.full_name ?? enrollments[0]?.group?.teacher?.full_name ?? "Biriktirilmagan"}
              </p>
              <p className="mt-1 text-sm text-emerald-50/70">
                {currentGroups[0]?.group?.schedule_summary ?? enrollments[0]?.group?.schedule_summary ?? "Jadval mavjud emas"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Faol guruhlar",
            value: currentGroups.length,
            icon: HiMiniAcademicCap,
            tone: "from-emerald-500 to-teal-500",
          },
          {
            label: "Darslar soni",
            value: lessons.length,
            icon: HiMiniBookOpen,
            tone: "from-cyan-500 to-sky-500",
          },
          {
            label: "To'langan summa",
            value: `${formatCurrency(totalPaid)} so'm`,
            icon: HiMiniBanknotes,
            tone: "from-amber-400 to-orange-500",
          },
          {
            label: "O'rtacha natija",
            value: grades.length ? `${averageScore} ball` : "Baholanmagan",
            icon: HiMiniCheckBadge,
            tone: "from-fuchsia-500 to-pink-500",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg`}>
                <Icon className="text-[28px]" />
              </div>
              <p className="text-sm font-semibold text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{item.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Mening guruhlarim</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">O'qish jarayoni</h2>
            </div>
            <HiMiniUserCircle className="text-4xl text-emerald-500" />
          </div>

          <div className="mt-6 space-y-4">
            {enrollments.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Siz hali guruhga biriktirilmagansiz.
              </div>
            ) : (
              enrollments.map((enrollment) => (
                <div key={enrollment.id} className="rounded-[24px] border border-slate-100 bg-[linear-gradient(135deg,#f8fffd_0%,#f7fbff_100%)] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{enrollment.group.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{enrollment.group.course?.name}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                      {enrollment.status === "active" ? "Faol" : enrollment.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">O'qituvchi</p>
                      <p className="mt-2 font-bold text-slate-900">{enrollment.group.teacher?.full_name ?? "Biriktirilmagan"}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Jadval</p>
                      <p className="mt-2 font-bold text-slate-900">{enrollment.group.schedule_summary ?? "Kiritilmagan"}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Qo'shilgan sana</p>
                      <p className="mt-2 font-bold text-slate-900">{formatDate(enrollment.enrolled_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-600">So'nggi vazifalar</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Lesson topshiriqlari</h2>
            </div>
            <HiMiniCalendar className="text-4xl text-cyan-500" />
          </div>

          <div className="mt-6 space-y-3">
            {recentLessons.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Hozircha dars yozuvlari topilmadi.
              </div>
            ) : (
              recentLessons.map((lesson) => {
                const grade = grades.find((item) => item.lesson_id === lesson.id);
                return (
                  <div key={lesson.id} className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {lesson.group?.name} · {lesson.topic || `Lesson ${lesson.lesson_number}`}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{formatDate(lesson.lesson_date)}</p>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                        {grade ? `${grade.score} ball` : "Bahosiz"}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {lesson.homework || "Bu dars uchun alohida vazifa kiritilmagan."}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
          <div className="flex items-center gap-3">
            <HiMiniClock className="text-3xl text-amber-500" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-amber-600">To'lov holati</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Mening to'lovlarim</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-[22px] border border-slate-100 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-bold text-slate-900">{formatCurrency(Number(payment.amount || 0))} so'm</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(payment.paid_at)} · {payment.status === "paid" ? "To'langan" : payment.status}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  {payment.method === "card" ? "Karta" : "Naqd"}
                </div>
              </div>
            ))}
            {payments.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                To'lov ma'lumotlari topilmadi.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
          <div className="flex items-center gap-3">
            <HiMiniCheckBadge className="text-3xl text-fuchsia-500" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-600">Natijalar</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Baholar va izohlar</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {grades.slice(0, 6).map((grade) => {
              const lesson = lessons.find((item) => item.id === grade.lesson_id);
              return (
                <div key={grade.id} className="rounded-[22px] border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900">
                        {lesson?.group?.name ?? "Mening guruhim"} · {lesson?.topic || `Lesson ${lesson?.lesson_number ?? ""}`.trim()}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(lesson?.lesson_date ?? grade.created_at)}</p>
                    </div>
                    <div className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold text-fuchsia-700">
                      {grade.score} ball
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{grade.note || "Izoh kiritilmagan."}</p>
                </div>
              );
            })}
            {grades.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Hozircha baholar mavjud emas.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
