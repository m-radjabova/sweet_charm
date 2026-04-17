import { HiMiniBookOpen, HiMiniCheckBadge, HiMiniClipboardDocumentList } from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";
import useStudentOverview from "../../hooks/useStudentOverview";

function formatDate(value?: string | null) {
  if (!value) return "Belgilanmagan";
  return new Date(value).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function StudentLessons() {
  const {
    state: { user },
  } = useContextPro();
  const { lessons, grades, loading } = useStudentOverview(user?.id);

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="rounded-[30px] border border-white/70 bg-white/90 p-8 text-center shadow-xl">
          Darslar yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 p-4 pb-8 lg:p-6">
      <section className="rounded-[34px] bg-[linear-gradient(135deg,#10243f_0%,#0f4c81_50%,#0ea5e9_100%)] p-6 text-white shadow-[0_26px_90px_rgba(14,116,144,0.18)] md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-sky-100/80">Assignments</p>
        <h1 className="mt-3 text-4xl font-black">Darslar va vazifalar</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-sky-50/80">
          Har bir lesson bo'yicha mavzu, uyga vazifa va agar qo'yilgan bo'lsa, natijangiz shu yerda ko'rinadi.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-lg">
          <HiMiniBookOpen className="text-3xl text-sky-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Jami darslar</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{lessons.length}</p>
        </div>
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-lg">
          <HiMiniClipboardDocumentList className="text-3xl text-emerald-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Vazifali lessonlar</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{lessons.filter((lesson) => lesson.homework).length}</p>
        </div>
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-lg">
          <HiMiniCheckBadge className="text-3xl text-fuchsia-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Baholangan lessonlar</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{grades.length}</p>
        </div>
      </div>

      <section className="space-y-4">
        {lessons.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/90 p-8 text-center text-slate-500">
            Lessonlar topilmadi.
          </div>
        ) : (
          lessons.map((lesson) => {
            const grade = grades.find((item) => item.lesson_id === lesson.id);

            return (
              <article
                key={lesson.id}
                className="rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-sky-600">{lesson.group?.name}</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">
                      {lesson.topic || `Lesson ${lesson.lesson_number}`}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">{formatDate(lesson.lesson_date)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                      {lesson.group?.course?.name ?? "Kurs"}
                    </span>
                    <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold text-fuchsia-700">
                      {grade ? `${grade.score} ball` : "Bahosiz"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Uyga vazifa</p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      {lesson.homework || "Bu lesson uchun vazifa kiritilmagan."}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">O'qituvchi izohi</p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      {grade?.note || lesson.notes || "Izoh qoldirilmagan."}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
