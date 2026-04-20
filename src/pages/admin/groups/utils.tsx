import type { Enrollment, Lesson } from "../../../types/types";

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

export function formatMonthLabel(year: number, month: number) {
  return `${monthNames[month - 1]} ${year}`;
}

export function isEnrollmentVisibleInRange(
  enrollment: Enrollment,
  rangeStart: string,
  rangeEnd: string,
) {
  return (
    enrollment.enrolled_at <= rangeEnd &&
    (!enrollment.left_at || enrollment.left_at >= rangeStart)
  );
}

export function getMonthKey(date: string) {
  return date.slice(0, 7);
}

export function parseMonthKey(monthKey: string) {
  if (!isValidMonthKey(monthKey)) return null;
  const [yearValue, monthValue] = monthKey.split("-");
  return {
    key: monthKey,
    year: Number(yearValue),
    month: Number(monthValue),
  };
}

export function isValidMonthKey(value: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function getMonthEndDate(year: number, month: number) {
  return formatDateKey(new Date(year, month, 0));
}

export function getNextMonthKey(monthKey: string) {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return monthKey;

  const nextMonth = new Date(parsed.year, parsed.month, 1);
  return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabelFromKey(monthKey: string) {
  const parsed = parseMonthKey(monthKey);
  if (!parsed) return monthKey;
  return formatMonthLabel(parsed.year, parsed.month);
}

export function getSuggestedLessonDate(
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

  const occupiedDates = new Set(monthLessons.map((lesson) => lesson.lesson_date));
  const [year, month] = monthKey.split("-").map(Number);
  const monthStartDay =
    monthKey === getMonthKey(todayKey) ? Number(todayKey.slice(8, 10)) : 1;
  const monthEndDay = new Date(year, month, 0).getDate();

  for (let day = monthStartDay; day <= monthEndDay; day += 1) {
    const candidateDate = `${monthKey}-${String(day).padStart(2, "0")}`;
    if (!occupiedDates.has(candidateDate)) {
      return candidateDate;
    }
  }

  return "";
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonthKey(date: Date) {
  return formatDateKey(date).slice(0, 7);
}

export function truncateText(value: string, limit: number) {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
}
