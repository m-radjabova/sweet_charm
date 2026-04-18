import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Chip,
  Drawer,
  IconButton,
  TextField,
} from "@mui/material";
import {
  HiMiniArrowLeft,
  HiMiniBookmarkSquare,
  HiMiniCalendar,
  HiMiniCheckCircle,
  HiMiniClock,
  HiMiniEye,
  HiMiniInformationCircle,
  HiMiniPencilSquare,
  HiMiniPlus,
  HiMiniUser,
  HiMiniUserGroup,
  HiMiniAcademicCap,
  HiMiniXCircle,
  HiMiniXMark,
} from "react-icons/hi2";
import { Link, Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmActionDialog from "../../../components/ConfirmActionDialog";
import useAttendance from "../../../hooks/useAttendance";
import useContextPro from "../../../hooks/useContextPro";
import useGrades from "../../../hooks/useGrades";
import useGroups from "../../../hooks/useGroups";
import useLessons from "../../../hooks/useLessons";
import useStudents from "../../../hooks/useStudents";
import type {
  AttendanceStatus,
  Enrollment,
  Lesson,
} from "../../../types/types";

const enrollmentStatusLabels: Record<string, { label: string; color: string }> =
  {
    active: { label: "Faol", color: "bg-emerald-100 text-emerald-700" },
    finished: { label: "Tugagan", color: "bg-slate-100 text-slate-600" },
    left: { label: "Chiqarilgan", color: "bg-rose-100 text-rose-700" },
  };

const monthNames = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

type LessonFormState = {
  lesson_date: string;
  topic: string;
  homework: string;
};

type StudentRowDraft = {
  attendance: AttendanceStatus;
  grade: string;
  note: string;
  attendanceTouched: boolean;
};

type MonthOption = {
  key: string;
  year: number;
  month: number;
  count: number;
};

const initialLessonForm: LessonFormState = {
  lesson_date: "",
  topic: "",
  homework: "",
};

function normalizeAttendanceStatus(status?: string | null): AttendanceStatus {
  return status === "absent" ? "absent" : "present";
}

function normalizeGradeValue(score?: number | string | null) {
  if (score === null || score === undefined || score === "") return "";
  const numericScore =
    typeof score === "number" ? score : Number(String(score).replace(",", "."));

  if (!Number.isFinite(numericScore)) return "";
  return String(Math.trunc(numericScore));
}

function normalizeDraft(
  attendance: AttendanceStatus,
  grade: string,
  note: string,
  attendanceTouched = false,
): StudentRowDraft {
  if (attendance === "absent") {
    return {
      attendance,
      grade: "0",
      note: "Darsga kelmadi",
      attendanceTouched,
    };
  }

  if (grade === "0" && note === "Darsga kelmadi") {
    return {
      attendance,
      grade: "",
      note: "",
      attendanceTouched,
    };
  }

  return { attendance, grade, note, attendanceTouched };
}

function getEnrollmentDraft(
  enrollment: Enrollment,
  attendanceMap: Map<string, { status: string | null | undefined }>,
  gradesMap: Map<
    string,
    { score: number | string | null | undefined; note?: string | null }
  >,
): StudentRowDraft {
  return normalizeDraft(
    normalizeAttendanceStatus(attendanceMap.get(enrollment.student_id)?.status),
    normalizeGradeValue(gradesMap.get(enrollment.student_id)?.score),
    gradesMap.get(enrollment.student_id)?.note ?? "",
    false,
  );
}

function AdminGroupStudents() {
  const { groupId = "" } = useParams();
  const { state } = useContextPro();
  const isTeacher = state.user?.role === "teacher";
  const { groups } = useGroups();
  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === groupId) ?? null,
    [groupId, groups],
  );
  const canAccessGroup =
    !isTeacher || selectedGroup?.teacher_id === state.user?.id;

  const {
    enrollments,
    enrollmentsLoading,
    updateEnrollment,
    updatingEnrollment,
  } = useStudents(groupId || undefined, {
    includeStudentLists: false,
  });
  const {
    lessons: allLessons,
    createLesson,
    updateLesson,
    loading: allLessonsLoading,
  } = useLessons({ groupId: groupId || undefined });

  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedMonthKey, setSelectedMonthKey] = useState("");
  const [customMonthKeys, setCustomMonthKeys] = useState<string[]>([]);
  const [isLessonDrawerOpen, setIsLessonDrawerOpen] = useState(false);
  const [lessonDrawerMode, setLessonDrawerMode] = useState<"create" | "edit">(
    "create",
  );
  const [lessonForm, setLessonForm] =
    useState<LessonFormState>(initialLessonForm);
  const [isMonthDrawerOpen, setIsMonthDrawerOpen] = useState(false);
  const [newMonthValue, setNewMonthValue] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);
  const [enrollmentToRemove, setEnrollmentToRemove] =
    useState<Enrollment | null>(null);
  const todayKey = new Date().toISOString().slice(0, 10);
  const currentMonthKey = getMonthKey(todayKey);
  const monthStorageKey = groupId ? `admin-group-months:${groupId}` : "";
  const hasLessonToday = useMemo(
    () => allLessons.some((lesson) => lesson.lesson_date === todayKey),
    [allLessons, todayKey],
  );

  useEffect(() => {
    if (!monthStorageKey) {
      setCustomMonthKeys([]);
      return;
    }

    try {
      const rawValue = window.localStorage.getItem(monthStorageKey);
      if (!rawValue) {
        setCustomMonthKeys([]);
        return;
      }
      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) {
        setCustomMonthKeys([]);
        return;
      }
      setCustomMonthKeys(
        parsed.filter(
          (value): value is string =>
            typeof value === "string" && isValidMonthKey(value),
        ),
      );
    } catch {
      setCustomMonthKeys([]);
    }
  }, [monthStorageKey]);

  useEffect(() => {
    if (!monthStorageKey) return;
    window.localStorage.setItem(
      monthStorageKey,
      JSON.stringify(customMonthKeys),
    );
  }, [customMonthKeys, monthStorageKey]);

  const monthOptions = useMemo(() => {
    const grouped = new Map<string, MonthOption>();

    allLessons.forEach((lesson) => {
      const monthInfo = parseMonthKey(getMonthKey(lesson.lesson_date));
      if (!monthInfo) return;
      const { key, year, month } = monthInfo;
      const current = grouped.get(key);
      if (current) {
        current.count += 1;
      } else {
        grouped.set(key, { key, year, month, count: 1 });
      }
    });

    customMonthKeys.forEach((key) => {
      const monthInfo = parseMonthKey(key);
      if (!monthInfo || grouped.has(key)) return;
      grouped.set(key, { ...monthInfo, count: 0 });
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.key.localeCompare(b.key),
    );
  }, [allLessons, customMonthKeys]);

  const nextAvailableMonthKey = useMemo(() => {
    if (monthOptions.length === 0) {
      return currentMonthKey;
    }
    return getNextMonthKey(monthOptions[monthOptions.length - 1].key);
  }, [currentMonthKey, monthOptions]);

  useEffect(() => {
    const preferredMonth =
      monthOptions.find((month) => month.key === currentMonthKey) ??
      monthOptions[0];

    if (!selectedMonthKey && preferredMonth) {
      setSelectedMonthKey(preferredMonth.key);
      return;
    }
    if (
      selectedMonthKey &&
      monthOptions.length > 0 &&
      !monthOptions.some((item) => item.key === selectedMonthKey)
    ) {
      setSelectedMonthKey(preferredMonth?.key ?? "");
    }
  }, [currentMonthKey, monthOptions, selectedMonthKey]);

  const selectedMonthOption = useMemo(
    () => monthOptions.find((month) => month.key === selectedMonthKey) ?? null,
    [monthOptions, selectedMonthKey],
  );

  const { lessons, loading: filteredLessonsLoading } = useLessons({
    groupId: groupId || undefined,
    year: selectedMonthOption?.year,
    month: selectedMonthOption?.month,
  });

  useEffect(() => {
    if (!selectedLessonId && lessons.length > 0) {
      setSelectedLessonId(lessons[0].id);
      return;
    }
    if (
      selectedLessonId &&
      !lessons.some((lesson) => lesson.id === selectedLessonId)
    ) {
      setSelectedLessonId(lessons[0]?.id ?? "");
    }
  }, [lessons, selectedLessonId]);

  const { attendance, createAttendance } = useAttendance(
    selectedLessonId || undefined,
    { successToast: false },
  );
  const { grades, createGrade, updateGrade } = useGrades(
    { lessonId: selectedLessonId || undefined },
    { successToast: false },
  );
  const [drafts, setDrafts] = useState<Record<string, StudentRowDraft>>({});

  const attendanceMap = useMemo(
    () => new Map(attendance.map((item) => [item.student_id, item])),
    [attendance],
  );
  const gradesMap = useMemo(
    () => new Map(grades.map((item) => [item.student_id, item])),
    [grades],
  );
  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  );

  const saveAttendance = async (
    enrollment: Enrollment,
    status: AttendanceStatus,
    note: string,
  ) => {
    if (!selectedLessonId) {
      toast.error("Avval darsni tanlang");
      return;
    }
    const existing = attendanceMap.get(enrollment.student_id);
    if (existing) return;
    await createAttendance({
      lesson_id: selectedLessonId,
      enrollment_id: enrollment.id,
      student_id: enrollment.student_id,
      status,
      note,
    });
  };

  const saveGrade = async (
    enrollment: Enrollment,
    scoreValue: string,
    note: string,
  ) => {
    if (!selectedLessonId || scoreValue === "") return;
    const numericScore = Math.trunc(
      Number(String(scoreValue).replace(",", ".")),
    );
    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      toast.error("Baho 0 dan 100 gacha bo'lishi kerak");
      return;
    }
    const existing = gradesMap.get(enrollment.student_id);
    if (existing) {
      await updateGrade(existing.id, {
        score: numericScore,
        note,
      });
      return;
    }
    await createGrade({
      lesson_id: selectedLessonId,
      enrollment_id: enrollment.id,
      student_id: enrollment.student_id,
      teacher_id: state.user?.id ?? null,
      score: numericScore,
      note,
    });
  };

  const saveRow = async (
    enrollment: Enrollment,
    attendanceValue: AttendanceStatus,
    attendanceNote: string,
    gradeValue: string,
    gradeNote: string,
  ) => {
    await saveAttendance(enrollment, attendanceValue, attendanceNote);
    if (gradeValue !== "") {
      await saveGrade(enrollment, gradeValue, gradeNote);
    }
  };

  useEffect(() => {
    setDrafts({});
  }, [selectedLessonId]);

  const getCurrentDraft = (enrollment: Enrollment) =>
    drafts[enrollment.id] ??
    getEnrollmentDraft(enrollment, attendanceMap, gradesMap);

  const handleDraftChange = (
    enrollment: Enrollment,
    nextDraft: StudentRowDraft,
  ) => {
    const normalizedNextDraft = normalizeDraft(
      nextDraft.attendance,
      nextDraft.grade,
      nextDraft.note,
      nextDraft.attendanceTouched,
    );
    const initialDraft = getEnrollmentDraft(
      enrollment,
      attendanceMap,
      gradesMap,
    );

    setDrafts((prev) => {
      if (
        initialDraft.attendance === normalizedNextDraft.attendance &&
        initialDraft.grade === normalizedNextDraft.grade &&
        initialDraft.note === normalizedNextDraft.note &&
        !normalizedNextDraft.attendanceTouched
      ) {
        if (!(enrollment.id in prev)) return prev;
        const { [enrollment.id]: _removed, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [enrollment.id]: normalizedNextDraft,
      };
    });
  };

  const handleSaveAll = async () => {
    if (!selectedLessonId) {
      toast.error("Avval darsni tanlang");
      return;
    }

    if (changedEnrollments.length === 0) {
      toast.info("Saqlash uchun yangi ma'lumot yo'q");
      return;
    }

    for (const enrollment of changedEnrollments) {
      const draft = drafts[enrollment.id];
      if (!draft) continue;
      await saveRow(enrollment, draft.attendance, "", draft.grade, draft.note);
    }

    setDrafts({});
    toast.success(
      `${changedEnrollments.length} ta student uchun ma'lumot saqlandi`,
    );
  };

  const openCreateLessonDrawer = (monthKey = selectedMonthKey) => {
    if (hasLessonToday) {
      toast.info(
        "Bugungi dars allaqachon qo'shilgan. Yangi darsni ertaga qo'shasiz.",
      );
      return;
    }

    if (!monthKey) {
      setIsMonthDrawerOpen(true);
      return;
    }

    setLessonDrawerMode("create");
    setEditingLessonId(null);
    setLessonForm({
      lesson_date: getSuggestedLessonDate(monthKey, allLessons, todayKey),
      topic: "",
      homework: "",
    });
    setSelectedMonthKey(monthKey);
    setIsLessonDrawerOpen(true);
  };

  const openEditLessonDrawer = (lesson: Lesson) => {
    setLessonDrawerMode("edit");
    setEditingLessonId(lesson.id);
    setLessonForm({
      lesson_date: lesson.lesson_date,
      topic: lesson.topic ?? "",
      homework: lesson.homework ?? "",
    });
    setIsLessonDrawerOpen(true);
  };

  const handleSubmitLesson = async () => {
    if (!groupId || !lessonForm.lesson_date) {
      toast.error("Dars sanasi majburiy");
      return;
    }

    if (lessonDrawerMode === "edit" && editingLessonId) {
      const updatedLesson = await updateLesson(editingLessonId, {
        lesson_date: lessonForm.lesson_date,
        topic: lessonForm.topic || null,
        homework: lessonForm.homework || null,
      });
      setSelectedMonthKey(getMonthKey(updatedLesson.lesson_date));
      setSelectedLessonId(updatedLesson.id);
    } else {
      const createdLesson = await createLesson({
        group_id: groupId,
        lesson_date: lessonForm.lesson_date,
        topic: lessonForm.topic || null,
        homework: lessonForm.homework || null,
      });
      setSelectedMonthKey(getMonthKey(createdLesson.lesson_date));
      setSelectedLessonId(createdLesson.id);
    }

    setIsLessonDrawerOpen(false);
    setEditingLessonId(null);
    setLessonForm(initialLessonForm);
  };

  const handleAddMonth = () => {
    if (!isValidMonthKey(newMonthValue)) {
      toast.error("Oy formatini to'g'ri tanlang");
      return;
    }

    if (newMonthValue < nextAvailableMonthKey) {
      toast.error("Yangi oy faqat keyingi oydan davom etib qo'shiladi");
      return;
    }

    if (monthOptions.some((month) => month.key === newMonthValue)) {
      setSelectedMonthKey(newMonthValue);
      setIsMonthDrawerOpen(false);
      toast.info("Bu oy allaqachon mavjud");
      return;
    }

    setCustomMonthKeys((prev) =>
      [...prev, newMonthValue].sort((a, b) => b.localeCompare(a)),
    );
    setSelectedMonthKey(newMonthValue);
    setIsMonthDrawerOpen(false);
    toast.success("Yangi oy qo'shildi");
  };

  const selectedMonthBounds = useMemo(() => {
    if (!selectedMonthOption) return null;
    return {
      min: `${selectedMonthOption.key}-01`,
      max: getMonthEndDate(selectedMonthOption.year, selectedMonthOption.month),
    };
  }, [selectedMonthOption]);

  const visibleEnrollments = useMemo(() => {
    if (!selectedMonthBounds) return enrollments;
    return enrollments.filter((enrollment) =>
      isEnrollmentVisibleInRange(
        enrollment,
        selectedMonthBounds.min,
        selectedMonthBounds.max,
      ),
    );
  }, [enrollments, selectedMonthBounds]);

  const changedEnrollments = useMemo(
    () =>
      visibleEnrollments.filter((enrollment) => {
        return Boolean(drafts[enrollment.id]);
      }),
    [drafts, visibleEnrollments],
  );

  const handleRemoveEnrollment = async () => {
    if (!enrollmentToRemove) return;
    await updateEnrollment(enrollmentToRemove.id, {
      status: "left",
      left_at: todayKey,
    });
    setEnrollmentToRemove(null);
  };

  const totalStudents = visibleEnrollments.length;
  const totalLessons = allLessons.length;

  if (selectedGroup && !canAccessGroup) {
    return <Navigate to="/admin/groups" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/20">
      <div className="max-w-[1800px] mx-auto p-4 lg:p-6 space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-700 text-white">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
            <HiMiniUserGroup size={350} />
          </div>
          <div className="absolute bottom-0 left-0 w-60 h-60 opacity-5">
            <HiMiniAcademicCap size={250} />
          </div>
          <div className="relative px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
              <div>
                <Link
                  to="/admin/groups"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-sky-200 hover:text-white transition-all mb-4"
                >
                  <HiMiniArrowLeft size={16} />
                  Guruhlarga qaytish
                </Link>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                  {selectedGroup?.name ?? "Guruh yuklanmoqda..."}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <Chip
                    label={selectedGroup?.course?.name ?? "Kurs topilmadi"}
                    size="small"
                    className="!bg-white/20 !text-white"
                  />
                  {selectedGroup?.schedule_summary && (
                    <div className="flex items-center gap-1 text-sm text-sky-200">
                      <HiMiniClock size={14} />
                      <span>{selectedGroup.schedule_summary}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <StatCard
                  label="Studentlar"
                  value={totalStudents}
                  icon={<HiMiniUser size={20} />}
                  color="sky"
                />
                <StatCard
                  label="Darslar"
                  value={totalLessons}
                  icon={<HiMiniBookmarkSquare size={20} />}
                  color="emerald"
                />
                <StatCard
                  label="O'qituvchi"
                  value={selectedGroup?.teacher?.full_name ?? "Biriktirilmagan"}
                  icon={<HiMiniAcademicCap size={20} />}
                  color="purple"
                  isText
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="border-b border-slate-200 p-5 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                  LESSON JURNALI
                </p>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Dars jurnali
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Avval oy qo'shing yoki tanlang, keyin shu oy ichida darslarni
                  boshqaring
                </p>
              </div>
            </div>
          </div>

          <div className="sticky top-4 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="mr-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                    <HiMiniCalendar size={14} />
                    Oy bo'yicha filter
                  </div>
                  {allLessonsLoading && (
                    <span className="text-sm text-slate-400">
                      Oylar yuklanmoqda...
                    </span>
                  )}
                  {!allLessonsLoading && monthOptions.length === 0 && (
                    <span className="text-sm text-slate-400">
                      Hali oy qo'shilmagan
                    </span>
                  )}
                </div>
                <Button
                  variant="outlined"
                  startIcon={<HiMiniPlus />}
                  onClick={() => {
                    setNewMonthValue(nextAvailableMonthKey);
                    setIsMonthDrawerOpen(true);
                  }}
                  sx={{
                    borderRadius: "14px",
                    textTransform: "none",
                    fontWeight: 700,
                    borderColor: "#38bdf8",
                    color: "#0284c7",
                  }}
                >
                  Yangi oy qo'shish
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2 px-5">
                {allLessonsLoading && (
                  <span className="text-sm text-slate-400">
                    Oylar tayyorlanmoqda...
                  </span>
                )}
                {monthOptions.map((month) => {
                  const isActive = month.key === selectedMonthKey;
                  return (
                    <button
                      key={month.key}
                      type="button"
                      onClick={() => setSelectedMonthKey(month.key)}
                      className={`group relative inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "border-sky-400 bg-gradient-to-br from-sky-500 via-sky-500 to-cyan-500 text-white shadow-[0_18px_40px_-22px_rgba(14,165,233,0.95)] ring-2 ring-sky-100"
                          : "border-slate-200 bg-white text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50/60 hover:text-sky-700"
                      }`}
                    >
                      <span
                        className={`absolute inset-0 rounded-2xl transition-opacity ${isActive ? "opacity-100 bg-white/0" : "opacity-0 group-hover:opacity-100 bg-gradient-to-r from-sky-50/60 to-cyan-50/60"}`}
                      />
                      <span className="relative">
                        {formatMonthLabel(month.year, month.month)}
                      </span>
                      <span
                        className={`relative rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-white"
                        }`}
                      >
                        {month.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {selectedMonthOption
                        ? `${formatMonthLabel(selectedMonthOption.year, selectedMonthOption.month)} darslari`
                        : "Darslar"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedMonthOption
                        ? `${lessons.length} ta dars topildi`
                        : "Avval oy tanlang"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    {selectedLesson && (
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-sky-100 bg-gradient-to-r from-white to-sky-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-[0_10px_30px_-22px_rgba(14,165,233,0.9)]">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
                          <HiMiniBookmarkSquare size={12} />
                        </span>
                        Tanlangan: {selectedLesson.lesson_number}-dars
                      </div>
                    )}
                    {selectedMonthOption && (
                      <>
                        <div className="flex flex-col items-end gap-1">
                          <Button
                            variant="contained"
                            startIcon={<HiMiniPlus />}
                            onClick={() =>
                              openCreateLessonDrawer(selectedMonthOption.key)
                            }
                            disabled={hasLessonToday}
                            sx={{
                              minWidth: 240,
                              minHeight: 56,
                              px: 3,
                              borderRadius: "18px",
                              textTransform: "none",
                              fontSize: "1rem",
                              fontWeight: 800,
                              letterSpacing: "-0.01em",
                              boxShadow: hasLessonToday
                                ? "none"
                                : "0 20px 40px -24px rgba(14,165,233,0.95)",
                              bgcolor: "#0ea5e9",
                              backgroundImage: hasLessonToday
                                ? "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)"
                                : "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                              "&:hover": {
                                bgcolor: "#0284c7",
                                backgroundImage:
                                  "linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)",
                              },
                              "&.Mui-disabled": {
                                bgcolor: "#cbd5e1",
                                backgroundImage:
                                  "linear-gradient(135deg, #dbe4ef 0%, #cbd5e1 100%)",
                                color: "#64748b",
                              },
                            }}
                          >
                            Yangi dars qo'shish
                          </Button>
                          {hasLessonToday && (
                            <p className="text-xs font-medium text-slate-500">
                              Bugun uchun dars qo'shildi.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {!selectedMonthOption ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    <p>Oy tanlang yoki yangi oy qo'shing</p>
                    <Button
                      variant="outlined"
                      startIcon={<HiMiniPlus />}
                      onClick={() => {
                        setNewMonthValue(nextAvailableMonthKey);
                        setIsMonthDrawerOpen(true);
                      }}
                      sx={{
                        mt: 2,
                        borderRadius: "14px",
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: "#38bdf8",
                        color: "#0284c7",
                      }}
                    >
                      Birinchi oyni qo'shish
                    </Button>
                  </div>
                ) : filteredLessonsLoading ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    Darslar yuklanmoqda...
                  </div>
                ) : lessons.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                    <p>
                      Bu oy uchun hali dars yo'q. Shu bo'limdagi tugma bilan
                      birinchi darsni qo'shing.
                    </p>
                    <Button
                      variant="contained"
                      startIcon={<HiMiniPlus />}
                      onClick={() =>
                        openCreateLessonDrawer(selectedMonthOption.key)
                      }
                      disabled={hasLessonToday}
                      sx={{
                        mt: 2,
                        borderRadius: "14px",
                        textTransform: "none",
                        fontWeight: 700,
                        bgcolor: "#0ea5e9",
                        "&:hover": { bgcolor: "#0284c7" },
                        "&.Mui-disabled": {
                          bgcolor: "#cbd5e1",
                          color: "#64748b",
                        },
                      }}
                    >
                      Birinchi darsni qo'shish
                    </Button>
                    {hasLessonToday && (
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Bugungi dars qo'shilgan. Yangi darsni ertaga qo'shasiz.
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    style={{ WebkitOverflowScrolling: "touch" }}
                  >
                    {lessons.map((lesson) => (
                      <LessonCompactCard
                        key={lesson.id}
                        lesson={lesson}
                        isActive={lesson.id === selectedLessonId}
                        canEdit={lesson.lesson_date === todayKey}
                        onSelect={() => setSelectedLessonId(lesson.id)}
                        onView={() => setViewingLesson(lesson)}
                        onEdit={() => openEditLessonDrawer(lesson)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500 text-sm">
                  <th className="px-5 py-4 font-semibold">Student</th>
                  <th className="px-4 py-4 font-semibold">Holati</th>
                  <th className="px-4 py-4 font-semibold">Davomat</th>
                  <th className="px-4 py-4 font-semibold">Baho (0-100)</th>
                  <th className="px-4 py-4 font-semibold">Izoh</th>
                  <th className="px-4 py-4 font-semibold text-center">Amal</th>
                </tr>
              </thead>
              <tbody>
                {enrollmentsLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-slate-500">
                          Studentlar yuklanmoqda...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!enrollmentsLoading && visibleEnrollments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <HiMiniUserGroup
                        size={48}
                        className="mx-auto text-slate-300 mb-3"
                      />
                      <p className="text-slate-500">
                        {selectedMonthOption
                          ? "Tanlangan oy uchun student ko'rinmadi"
                          : "Bu guruhga hali student biriktirilmagan"}
                      </p>
                    </td>
                  </tr>
                )}

                {!enrollmentsLoading &&
                  visibleEnrollments.map((enrollment) =>
                    (() => {
                      const draft = getCurrentDraft(enrollment);
                      return (
                        <StudentRow
                          key={enrollment.id}
                          enrollment={enrollment}
                          attendanceValue={draft.attendance}
                          attendanceTouched={draft.attendanceTouched}
                          attendanceLocked={attendanceMap.has(
                            enrollment.student_id,
                          )}
                          gradeLocked={gradesMap.has(enrollment.student_id)}
                          gradeValue={draft.grade}
                          gradeNote={draft.note}
                          hasPendingChanges={Boolean(drafts[enrollment.id])}
                          disabled={!selectedLessonId}
                          canRemove={!isTeacher}
                          onChange={(nextDraft) =>
                            handleDraftChange(enrollment, nextDraft)
                          }
                          onRemoveStudent={() =>
                            setEnrollmentToRemove(enrollment)
                          }
                        />
                      );
                    })(),
                  )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Umumiy saqlash
                </p>
                <p className="text-xs text-slate-500">
                  {changedEnrollments.length > 0
                    ? `${changedEnrollments.length} ta student bo'yicha o'zgarish tayyor`
                    : "Hozircha yangi o'zgarish yo'q"}
                </p>
              </div>
              <Button
                disabled={!selectedLessonId || changedEnrollments.length === 0}
                onClick={handleSaveAll}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#0f172a",
                  color: "white",
                  px: 3,
                  "&:hover": { bgcolor: "#0ea5e9" },
                  "&.Mui-disabled": { bgcolor: "#cbd5e1", color: "#94a3b8" },
                }}
              >
                Hammasini saqlash
              </Button>
            </div>
          </div>
        </div>
      </div>

      <LessonDrawer
        open={isLessonDrawerOpen}
        mode={lessonDrawerMode}
        value={lessonForm}
        selectedMonthLabel={
          selectedMonthOption
            ? formatMonthLabel(
                selectedMonthOption.year,
                selectedMonthOption.month,
              )
            : ""
        }
        dateBounds={lessonDrawerMode === "create" ? selectedMonthBounds : null}
        onChange={setLessonForm}
        onClose={() => setIsLessonDrawerOpen(false)}
        onSubmit={handleSubmitLesson}
      />

      <MonthDrawer
        open={isMonthDrawerOpen}
        value={newMonthValue}
        minMonth={nextAvailableMonthKey}
        onChange={setNewMonthValue}
        onClose={() => setIsMonthDrawerOpen(false)}
        onSubmit={handleAddMonth}
      />

      <LessonViewDrawer
        lesson={viewingLesson}
        onClose={() => setViewingLesson(null)}
        canEdit={viewingLesson?.lesson_date === todayKey}
        onEdit={(lesson) => {
          setViewingLesson(null);
          openEditLessonDrawer(lesson);
        }}
      />

      {!isTeacher && (
        <ConfirmActionDialog
          open={Boolean(enrollmentToRemove)}
          title="Studentni chetlashtirish"
          description={
            enrollmentToRemove
              ? `${enrollmentToRemove.student.full_name} ni shu guruhdan chetlashtirmoqchimisiz?`
              : ""
          }
          confirmText="Ha, chetlashtirish"
          cancelText="Yo'q"
          loading={updatingEnrollment}
          tone="warning"
          onClose={() => setEnrollmentToRemove(null)}
          onConfirm={handleRemoveEnrollment}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  isText = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isText?: boolean;
}) {
  const colors = {
    sky: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  };

  return (
    <div
      className={`p-4 rounded-xl border min-w-[140px] ${colors[color as keyof typeof colors]}`}
    >
      <div className="flex items-center gap-2">
        <div>{icon}</div>
        <div>
          <p className="text-[11px] font-bold text-white/70 uppercase">
            {label}
          </p>
          {isText ? (
            <p className="text-sm font-bold text-white truncate max-w-[120px]">
              {value}
            </p>
          ) : (
            <p className="text-2xl font-black text-white">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LessonCompactCard({
  lesson,
  isActive,
  canEdit,
  onSelect,
  onView,
  onEdit,
}: {
  lesson: Lesson;
  isActive: boolean;
  canEdit: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className={`group relative w-[280px] min-w-[280px] overflow-hidden rounded-2xl border px-3 py-3 transition-all duration-200 ${
        isActive
          ? "border-sky-300 bg-gradient-to-br from-sky-50 via-white to-cyan-50"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)]"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 ${isActive ? "bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" : "bg-transparent"}`}
      />
      <div className="flex items-start justify-between gap-1">
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 text-left"
        >
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isActive ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600"}`}
            >
              {lesson.lesson_number}-dars
            </span>
            {isActive && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                Tanlangan
              </span>
            )}
          </div>
          <p
            className={`truncate text-[14px] font-extrabold leading-5 ${isActive ? "text-slate-950" : "text-slate-900"}`}
          >
            {truncateText(lesson.topic || "Mavzu kiritilmagan", 22)}
          </p>
          <p
            className={`mt-2 text-[12px] font-medium ${isActive ? "text-sky-700" : "text-slate-500"}`}
          >
            {lesson.lesson_date}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            size="small"
            onClick={onView}
            sx={{
              border: "1px solid #dbeafe",
              borderRadius: "12px",
              padding: "6px",
              backgroundColor: isActive ? "#eff6ff" : "#ffffff",
            }}
          >
            <HiMiniEye size={14} />
          </IconButton>
          <IconButton
            size="small"
            onClick={onEdit}
            disabled={!canEdit}
            sx={{
              border: "1px solid #dbeafe",
              borderRadius: "12px",
              padding: "6px",
              backgroundColor: isActive ? "#eff6ff" : "#ffffff",
            }}
          >
            <HiMiniPencilSquare size={14} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function LessonDrawer({
  open,
  mode,
  value,
  selectedMonthLabel,
  dateBounds,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  value: LessonFormState;
  selectedMonthLabel: string;
  dateBounds: { min: string; max: string } | null;
  onChange: (value: LessonFormState) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}) {
  const title = mode === "edit" ? "Darsni tahrirlash" : "Yangi dars qo'shish";
  const subtitle =
    mode === "edit"
      ? "Mavzu va uyga vazifani yangilang"
      : "Tanlangan oy uchun dars ma'lumotlarini kiriting";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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
        <div className="p-5 bg-gradient-to-r from-sky-500 to-sky-700 text-white">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                {mode === "edit" ? (
                  <HiMiniPencilSquare size={22} />
                ) : (
                  <HiMiniPlus size={22} />
                )}
              </Avatar>
              <div>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="text-sm opacity-90 mt-0.5">{subtitle}</p>
              </div>
            </div>
            <IconButton onClick={onClose} sx={{ color: "white" }}>
              <HiMiniXMark size={20} />
            </IconButton>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            <TextField
              label="Dars sanasi"
              type="date"
              fullWidth
              value={value.lesson_date}
              disabled={mode === "edit"}
              onChange={(e) =>
                onChange({ ...value, lesson_date: e.target.value })
              }
              slotProps={
                dateBounds
                  ? { htmlInput: { min: dateBounds.min, max: dateBounds.max } }
                  : undefined
              }
              helperText={
                mode === "create" && selectedMonthLabel
                  ? `${selectedMonthLabel} ichidan sana tanlang`
                  : ""
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  marginBottom: 2,
                },
                "& .MuiInputLabel-root": {
                  backgroundColor: "white",
                  paddingRight: "4px",
                  paddingLeft: "4px",
                },
              }}
            />

            <TextField
              label="Mavzu"
              fullWidth
              value={value.topic}
              onChange={(e) => onChange({ ...value, topic: e.target.value })}
              placeholder="Dars mavzusini kiriting"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  marginBottom: 2,
                },
              }}
            />

            <TextField
              label="Uyga vazifa"
              fullWidth
              multiline
              rows={4}
              value={value.homework}
              onChange={(e) => onChange({ ...value, homework: e.target.value })}
              placeholder="Uyga vazifani kiriting"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  marginBottom: 2,
                },
              }}
            />

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sm text-sky-700 flex items-center gap-2">
              <HiMiniInformationCircle size={18} />
              Dars raqami avtomatik saqlanadi, bu yerda asosan mavzu va vazifani
              boshqarasiz
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="contained"
                onClick={onSubmit}
                fullWidth
                sx={{
                  borderRadius: "14px",
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#0ea5e9",
                  "&:hover": { bgcolor: "#0284c7" },
                }}
              >
                {mode === "edit" ? "Yangilash" : "Darsni saqlash"}
              </Button>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  borderRadius: "14px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Bekor qilish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function MonthDrawer({
  open,
  value,
  minMonth,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  value: string;
  minMonth: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 420 },
            borderRadius: { xs: 0, sm: "32px 0 0 32px" },
          },
        },
      }}
    >
      <div className="flex h-full flex-col">
        <div className="bg-gradient-to-r from-slate-900 to-sky-700 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.16)" }}>
                <HiMiniCalendar size={20} />
              </Avatar>
              <div>
                <h3 className="text-xl font-black">Yangi oy qo'shish</h3>
                <p className="mt-0.5 text-sm opacity-90">
                  Avval oy ochiladi, keyin ichidan dars qo'shasiz
                </p>
              </div>
            </div>
            <IconButton onClick={onClose} sx={{ color: "white" }}>
              <HiMiniXMark size={20} />
            </IconButton>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="space-y-5">
            <TextField
              label="Oy"
              type="month"
              fullWidth
              value={value}
              onChange={(e) => onChange(e.target.value)}
              slotProps={{ htmlInput: { min: minMonth } }}
              helperText={`Yangi oy ${formatMonthLabelFromKey(minMonth)} dan davom etadi`}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "14px" },
                "& .MuiInputLabel-root": {
                  backgroundColor: "white",
                  paddingRight: "4px",
                  paddingLeft: "4px",
                },
              }}
            />

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700">
              Oy saqlangach, shu oy blokida `Yangi dars qo'shish` tugmasi orqali
              lesson qo'shasiz.
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                variant="contained"
                onClick={onSubmit}
                fullWidth
                sx={{
                  borderRadius: "14px",
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "#0ea5e9",
                  "&:hover": { bgcolor: "#0284c7" },
                }}
              >
                Oyni saqlash
              </Button>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  borderRadius: "14px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Bekor qilish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function LessonViewDrawer({
  lesson,
  onClose,
  canEdit,
  onEdit,
}: {
  lesson: Lesson | null;
  onClose: () => void;
  canEdit: boolean;
  onEdit: (lesson: Lesson) => void;
}) {
  return (
    <Drawer
      anchor="right"
      open={Boolean(lesson)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 480 },
            borderRadius: { xs: 0, sm: "32px 0 0 32px" },
          },
        },
      }}
    >
      <div className="h-full flex flex-col">
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-700 text-white">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.14)" }}>
                <HiMiniEye size={22} />
              </Avatar>
              <div>
                <h3 className="text-xl font-black">Dars tafsilotlari</h3>
                <p className="text-sm opacity-90 mt-0.5">
                  To'liq ma'lumotni ko'rish
                </p>
              </div>
            </div>
            <IconButton onClick={onClose} sx={{ color: "white" }}>
              <HiMiniXMark size={20} />
            </IconButton>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {lesson && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Chip
                  label={`${lesson.lesson_number}-dars`}
                  className="!bg-sky-100 !text-sky-700"
                />
                <Chip
                  label={lesson.lesson_date}
                  className="!bg-slate-100 !text-slate-700"
                />
              </div>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Mavzu
                </p>
                <p className="mt-2 text-base font-bold text-slate-900">
                  {lesson.topic || "Mavzu kiritilmagan"}
                </p>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Uyga vazifa
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {lesson.homework || "Uyga vazifa kiritilmagan"}
                </p>
              </section>

              <div className="flex gap-3 pt-2">
                {canEdit && (
                  <Button
                    variant="contained"
                    onClick={() => onEdit(lesson)}
                    startIcon={<HiMiniPencilSquare />}
                    fullWidth
                    sx={{
                      borderRadius: "14px",
                      py: 1.5,
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: "#0f172a",
                      "&:hover": { bgcolor: "#1e293b" },
                    }}
                  >
                    Tahrirlash
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={onClose}
                  fullWidth={!canEdit}
                  sx={{
                    borderRadius: "14px",
                    px: 4,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Yopish
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function StudentRow({
  enrollment,
  attendanceValue,
  attendanceTouched,
  attendanceLocked,
  gradeLocked,
  gradeValue,
  gradeNote,
  hasPendingChanges,
  disabled,
  canRemove,
  onChange,
  onRemoveStudent,
}: {
  enrollment: Enrollment;
  attendanceValue: AttendanceStatus;
  attendanceTouched: boolean;
  attendanceLocked: boolean;
  gradeLocked: boolean;
  gradeValue: string;
  gradeNote: string;
  hasPendingChanges: boolean;
  disabled: boolean;
  canRemove: boolean;
  onChange: (draft: StudentRowDraft) => void;
  onRemoveStudent: () => void;
}) {
  const hasSavedData = attendanceLocked || gradeLocked;

  const statusInfo = enrollmentStatusLabels[enrollment.status] || {
    label: enrollment.status,
    color: "bg-slate-100 text-slate-600",
  };
  const canRemoveStudent = canRemove && enrollment.status !== "left";
  const presentSelected =
    attendanceLocked || attendanceTouched
      ? attendanceValue === "present"
      : false;
  const absentSelected =
    attendanceLocked || attendanceTouched
      ? attendanceValue === "absent"
      : false;

  return (
    <tr className="border-t border-slate-100 hover:bg-sky-50/30 transition-all">
      <td className="px-5 py-4">
        <div className="min-w-[200px]">
          <div className="flex items-center gap-3">
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: "#dbeafe",
                color: "#2563eb",
              }}
            >
              {enrollment.student.full_name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <p className="font-bold text-slate-900">
                {enrollment.student.full_name}
              </p>
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </td>

      <td className="px-4 py-4">
        {attendanceLocked ? (
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${attendanceValue === "present" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
          >
            {attendanceValue === "present" ? (
              <HiMiniCheckCircle size={14} />
            ) : (
              <HiMiniXCircle size={14} />
            )}
            <span className="text-sm font-medium">
              {attendanceValue === "present" ? "Keldi" : "Kelmadi"}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange(normalizeDraft("present", gradeValue, gradeNote, true))
              }
              aria-label="Keldi"
              title="Keldi"
              style={{ borderRadius: "20px" }}
              className={`inline-flex h-11 min-w-[48px] items-center justify-center rounded-2xl border transition-all duration-200 ${
                presentSelected
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,0.9)] scale-[1.03]"
                  : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-700"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
            >
              <HiMiniCheckCircle size={18} />
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange(normalizeDraft("absent", gradeValue, gradeNote, true))
              }
              aria-label="Kelmadi"
              title="Kelmadi"
              style={{ borderRadius: "20px" }}
              className={`inline-flex h-11 min-w-[48px] items-center justify-center rounded-2xl border transition-all duration-200 ${
                absentSelected
                  ? "border-rose-500 bg-rose-500 text-white shadow-[0_10px_24px_-12px_rgba(244,63,94,0.9)] scale-[1.03]"
                  : "border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50/60 hover:text-rose-700"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
            >
              <HiMiniXCircle size={18} />
            </button>
          </div>
        )}
      </td>

      <td className="px-4 py-4">
        <input
          type="text"
          inputMode="numeric"
          disabled={disabled || attendanceValue === "absent"}
          value={gradeValue}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d]/g, "");
            if (val === "") {
              onChange(normalizeDraft(attendanceValue, "", gradeNote, false));
              return;
            }
            const num = Number(val);
            if (!Number.isNaN(num) && num >= 0 && num <= 100) {
              onChange(normalizeDraft(attendanceValue, val, gradeNote, false));
            }
          }}
          placeholder="0-100"
          className={`w-24 px-3 py-2 rounded-xl border border-slate-200 text-center focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 ${
            disabled || attendanceValue === "absent"
              ? "bg-slate-50 text-slate-400"
              : "bg-white"
          }`}
        />
      </td>

      <td className="px-4 py-4">
        <input
          type="text"
          disabled={disabled || attendanceValue === "absent"}
          value={gradeNote}
          onChange={(e) =>
            onChange(
              normalizeDraft(
                attendanceValue,
                gradeValue,
                e.target.value,
                false,
              ),
            )
          }
          placeholder="Izoh"
          className={`w-48 px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 ${
            disabled || attendanceValue === "absent"
              ? "bg-slate-50 text-slate-400"
              : "bg-white"
          }`}
        />
      </td>

      <td className="px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {hasPendingChanges ? (
            <div className="inline-flex items-center justify-center gap-1 text-amber-600">
              <HiMiniInformationCircle size={14} />
              <span className="text-xs font-medium">Kutilmoqda</span>
            </div>
          ) : !hasSavedData ? (
            <span className="text-xs text-slate-400">Saqlanmagan</span>
          ) : (
            <div className="flex items-center justify-center gap-1 text-slate-400">
              <HiMiniCheckCircle size={14} />
              <span className="text-xs">Saqlangan</span>
            </div>
          )}
          {canRemoveStudent && (
            <IconButton
              onClick={onRemoveStudent}
              size="small"
              sx={{
                border: "1px solid #fecdd3",
                borderRadius: "12px",
                color: "#e11d48",
                bgcolor: "#fff1f2",
                "&:hover": { bgcolor: "#ffe4e6" },
              }}
            >
              <HiMiniXMark size={16} />
            </IconButton>
          )}
        </div>
      </td>
    </tr>
  );
}

function formatMonthLabel(year: number, month: number) {
  return `${monthNames[month - 1]} ${year}`;
}

function isEnrollmentVisibleInRange(
  enrollment: Enrollment,
  rangeStart: string,
  rangeEnd: string,
) {
  return (
    enrollment.enrolled_at <= rangeEnd &&
    (!enrollment.left_at || enrollment.left_at >= rangeStart)
  );
}

function getMonthKey(date: string) {
  const lessonDate = new Date(date);
  return `${lessonDate.getFullYear()}-${String(lessonDate.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonthKey(monthKey: string) {
  if (!isValidMonthKey(monthKey)) return null;
  const [yearValue, monthValue] = monthKey.split("-");
  return {
    key: monthKey,
    year: Number(yearValue),
    month: Number(monthValue),
  };
}

function isValidMonthKey(value: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function getMonthEndDate(year: number, month: number) {
  return new Date(year, month, 0).toISOString().slice(0, 10);
}

function getNextMonthKey(monthKey: string) {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return monthKey;

  const nextMonth = new Date(parsed.year, parsed.month, 1);
  return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabelFromKey(monthKey: string) {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return monthKey;
  return formatMonthLabel(parsed.year, parsed.month);
}

function getSuggestedLessonDate(
  monthKey: string,
  lessons: Lesson[],
  todayKey: string,
) {
  const monthLessons = lessons
    .filter((lesson) => getMonthKey(lesson.lesson_date) === monthKey)
    .sort((a, b) => a.lesson_date.localeCompare(b.lesson_date));

  if (monthLessons.length === 0) {
    return monthKey === getMonthKey(todayKey) ? todayKey : `${monthKey}-01`;
  }

  const lastLessonDate = monthLessons[monthLessons.length - 1].lesson_date;
  const candidateDate = new Date(lastLessonDate);
  candidateDate.setDate(candidateDate.getDate() + 1);
  const nextDate = candidateDate.toISOString().slice(0, 10);

  if (
    getMonthKey(nextDate) === monthKey &&
    !monthLessons.some((lesson) => lesson.lesson_date === nextDate)
  ) {
    return nextDate;
  }

  if (
    monthKey === getMonthKey(todayKey) &&
    !monthLessons.some((lesson) => lesson.lesson_date === todayKey)
  ) {
    return todayKey;
  }

  return lastLessonDate;
}

function truncateText(value: string, limit: number) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
}

export default AdminGroupStudents;
