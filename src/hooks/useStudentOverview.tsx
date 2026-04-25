import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAttendance } from "../api/attendance";
import { listGrades } from "../api/grades";
import { listGroups } from "../api/groups";
import { listLessons } from "../api/lessons";
import { listPayments } from "../api/payments";
import { listGroupEnrollments } from "../api/students";
import type { Attendance, Enrollment, Grade, Lesson, Payment } from "../types/types";

type StudentOverview = {
  enrollments: Enrollment[];
  lessons: Lesson[];
  attendance: Attendance[];
  grades: Grade[];
  payments: Payment[];
};

function isLessonWithinEnrollment(lesson: Lesson, enrollment: Enrollment) {
  if (lesson.group_id !== enrollment.group_id) return false;
  const lessonDate = lesson.lesson_date.slice(0, 10);
  const enrolledAt = enrollment.enrolled_at.slice(0, 10);
  const leftAt = enrollment.left_at?.slice(0, 10);

  return lessonDate >= enrolledAt && (!leftAt || lessonDate <= leftAt);
}

async function getStudentOverview(studentId: string): Promise<StudentOverview> {
  const [groups, grades, payments] = await Promise.all([
    listGroups(),
    listGrades({ studentId }),
    listPayments({ studentId }),
  ]);

  const enrollmentCollections = await Promise.all(
    groups.map(async (group) => {
      const enrollments = await listGroupEnrollments(group.id);
      return enrollments.filter((enrollment) => enrollment.student_id === studentId);
    }),
  );

  const enrollments = enrollmentCollections
    .flat()
    .sort((left, right) => right.enrolled_at.localeCompare(left.enrolled_at));

  const enrollmentIds = new Set(enrollments.map((enrollment) => enrollment.id));
  const groupIds = Array.from(new Set(enrollments.map((enrollment) => enrollment.group_id)));

  const lessonCollections = await Promise.all(
    groupIds.map(async (groupId) => listLessons({ groupId })),
  );

  const groupLessons = lessonCollections
    .flat()
    .sort((left, right) => right.lesson_date.localeCompare(left.lesson_date));

  const lessons = groupLessons
    .flat()
    .filter((lesson) =>
      enrollments.some((enrollment) => isLessonWithinEnrollment(lesson, enrollment)),
    )
    .sort((left, right) => right.lesson_date.localeCompare(left.lesson_date));

  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const studentGrades = grades
    .filter(
      (grade) =>
        grade.student_id === studentId &&
        enrollmentIds.has(grade.enrollment_id) &&
        lessonIds.has(grade.lesson_id),
    )
    .sort((left, right) => right.created_at.localeCompare(left.created_at));

  const studentPayments = payments
    .filter(
      (payment) =>
        payment.student_id === studentId &&
        (payment.enrollment_id ? enrollmentIds.has(payment.enrollment_id) : groupIds.includes(payment.group_id)),
    )
    .sort((left, right) => right.paid_at.localeCompare(left.paid_at));

  const attendanceCollections = await Promise.all(
    groupLessons.map(async (lesson) => listAttendance(lesson.id)),
  );

  const lessonDateById = new Map(groupLessons.map((lesson) => [lesson.id, lesson.lesson_date]));
  const attendance = attendanceCollections
    .flat()
    .filter(
      (record) =>
        record.student_id === studentId &&
        enrollmentIds.has(record.enrollment_id),
    )
    .sort((left, right) =>
      (lessonDateById.get(right.lesson_id) ?? right.created_at).localeCompare(
        lessonDateById.get(left.lesson_id) ?? left.created_at,
      ),
    );

  return {
    enrollments,
    lessons,
    attendance,
    grades: studentGrades,
    payments: studentPayments,
  };
}

export default function useStudentOverview(studentId?: string) {
  const overviewQuery = useQuery({
    queryKey: ["student-overview", studentId ?? "anonymous"],
    queryFn: () => getStudentOverview(studentId as string),
    enabled: Boolean(studentId),
  });

  const overview = overviewQuery.data;

  return useMemo(
    () => ({
      enrollments: overview?.enrollments ?? [],
      lessons: overview?.lessons ?? [],
      attendance: overview?.attendance ?? [],
      grades: overview?.grades ?? [],
      payments: overview?.payments ?? [],
      loading: overviewQuery.isLoading,
      isFetching: overviewQuery.isFetching,
      refetch: overviewQuery.refetch,
    }),
    [overview, overviewQuery.isFetching, overviewQuery.isLoading, overviewQuery.refetch],
  );
}
