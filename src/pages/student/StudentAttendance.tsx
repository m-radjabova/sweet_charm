import {
  HiMiniChartBar,
  HiMiniClock,
  HiMiniNoSymbol,
  HiMiniPresentationChartLine,
} from "react-icons/hi2";
import useContextPro from "../../hooks/useContextPro";
import useStudentOverview from "../../hooks/useStudentOverview";
import { formatDate } from "../../utils/date";

function getStatusMeta(status: string) {
  switch (status) {
    case "present":
      return {
        label: "Kelgan",
        badgeClass: "bg-emerald-100 text-emerald-700",
      };
    case "late":
      return {
        label: "Kechikkan",
        badgeClass: "bg-amber-100 text-amber-700",
      };
    case "absent":
    default:
      return {
        label: "NB",
        badgeClass: "bg-rose-100 text-rose-700",
      };
  }
}

export default function StudentAttendance() {
  const {
    state: { user },
  } = useContextPro();
  const { lessons, attendance, loading } = useStudentOverview(user?.id);

  const presentCount = attendance.filter((record) => record.status === "present").length;
  const lateCount = attendance.filter((record) => record.status === "late").length;
  const absentCount = attendance.filter((record) => record.status === "absent").length;
  const attendanceRate = attendance.length
    ? Math.round(((presentCount + lateCount) / attendance.length) * 100)
    : 0;

  const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const attendanceByLesson = Array.from(
    attendance.reduce((map, record) => {
      const bucket = map.get(record.lesson_id) ?? [];
      bucket.push(record);
      map.set(record.lesson_id, bucket);
      return map;
    }, new Map<string, typeof attendance>()),
  ).map(([lessonId, records]) => ({
    lessonId,
    lesson: lessonMap.get(lessonId),
    records: records.slice().sort((left, right) => left.para - right.para),
  }));

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="rounded-[30px] border border-white/70 bg-white/90 p-8 text-center shadow-xl">
          Davomat ma'lumotlari yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 p-3 pb-8 sm:p-4 lg:space-y-6 lg:p-6">
      <section className="rounded-[26px] bg-[linear-gradient(135deg,#301934_0%,#7c2d92_45%,#ec4899_100%)] p-5 text-white shadow-[0_26px_90px_rgba(168,85,247,0.18)] sm:rounded-[34px] sm:p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-pink-100/80">Attendance</p>
        <h1 className="mt-3 text-4xl font-black">Davomatim</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-pink-50/80">
          Har bir dars bo'yicha kelganingiz, kechikkaningiz va nechta NB borligi shu sahifada ko'rinadi.
        </p>
      </section>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-lg sm:rounded-[28px] sm:p-5">
          <HiMiniChartBar className="text-3xl text-emerald-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Jami davomatlar</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{attendance.length}</p>
        </div>
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-lg sm:rounded-[28px] sm:p-5">
          <HiMiniPresentationChartLine className="text-3xl text-sky-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Davomat foizi</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{attendanceRate}%</p>
        </div>
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-lg sm:rounded-[28px] sm:p-5">
          <HiMiniClock className="text-3xl text-amber-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Kechikishlar</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{lateCount}</p>
        </div>
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-lg sm:rounded-[28px] sm:p-5">
          <HiMiniNoSymbol className="text-3xl text-rose-500" />
          <p className="mt-4 text-sm font-semibold text-slate-500">NB soni</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{absentCount}</p>
        </div>
      </div>

      <section className="space-y-4">
        {attendanceByLesson.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/90 p-8 text-center text-slate-500">
            Davomat ma'lumotlari topilmadi.
          </div>
        ) : (
          attendanceByLesson.map(({ lessonId, lesson, records }) => (
            <article
              key={lessonId}
              className="rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:rounded-[28px] sm:p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-pink-600">
                    {lesson?.group?.name ?? "Mening darsim"}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">
                    {lesson?.topic || `Lesson ${lesson?.lesson_number ?? ""}`.trim() || "Lesson"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatDate(lesson?.lesson_date ?? records[0]?.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                    {lesson?.group?.course?.name ?? "Kurs"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {records.length} ta belgi
                  </span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {records.map((record) => {
                  const meta = getStatusMeta(record.status);
                  return (
                    <div
                      key={record.id}
                      className="min-w-0 rounded-[22px] bg-slate-50 px-4 py-3"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                        Para {record.para}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-6 text-slate-500">
                        {record.note || "Izoh qoldirilmagan."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
