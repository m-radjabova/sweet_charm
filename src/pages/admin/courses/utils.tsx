import type { Course } from "../../../types/types";

export function isCourseUpdated(course: Course) {
  const createdAt = new Date(course.created_at).getTime();
  const updatedAt = new Date(course.updated_at).getTime();

  if (!Number.isFinite(createdAt) || !Number.isFinite(updatedAt)) return false;
  return updatedAt - createdAt > 60_000;
}

export function formatCourseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const monthNames = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];

  const day = String(date.getDate()).padStart(2, "0");
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}-${month} ${year}, ${hours}:${minutes}`;
}

export function getNextMonthInputValue() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
}

export function normalizeMonthForApi(value: string) {
  return value ? `${value}-01` : null;
}