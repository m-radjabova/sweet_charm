import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  MenuItem,
  TextField,
  Drawer,
  IconButton,
  Avatar,
  Chip,
  Pagination,
  PaginationItem,
} from "@mui/material";
import {
  HiMiniCheckBadge,
  HiMiniChatBubbleLeftRight,
  HiMiniClipboardDocument,
  HiMiniPlus,
  HiMiniUserPlus,
  HiMiniUsers,
  HiMiniXMark,
  HiMiniMagnifyingGlass,
  HiMiniEnvelope,
  HiMiniPhone,
  HiMiniUser,
  HiMiniAcademicCap,
  HiMiniInformationCircle,
  HiMiniCheckCircle,
  HiMiniXCircle,
  HiMiniLink,
  HiMiniPaperAirplane,
  HiMiniPencilSquare,
} from "react-icons/hi2";
import Select from "react-select";
import { PremiumBadge, PremiumTable, TableSkeleton } from "../../../components/ui/PremiumTable";
import { RowActionMenu } from "../../../components/ui/RowActionMenu";
import useContextPro from "../../../hooks/useContextPro";
import useGroups from "../../../hooks/useGroups";
import useStudents from "../../../hooks/useStudents";
import useTelegramStudents from "../../../hooks/useTelegramStudents";
import type { StudentDetail } from "../../../types/types";

type StudentFormState = {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  parent_phone: string;
  notes: string;
  extra_info: string;
};

type AssignmentFormState = {
  student_ids: string[];
  group_id: string;
  enrolled_at: string;
};

type TelegramDrawerState = {
  student: StudentDetail;
  temporaryPassword: string;
};

type StudentDrawerMode = "create" | "edit";

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\+?[0-9\s\-()]{9,20}$/.test(value),
    "Telefon raqami noto'g'ri",
  )
  .transform((value) => value.trim());

const studentFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "F.I.Sh kamida 3 ta harfdan iborat bo'lsin"),
  phone: optionalPhoneSchema,
  email: z.string().trim().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lsin"),
  parent_phone: optionalPhoneSchema,
  notes: z.string().trim().max(500, "Izoh juda uzun"),
  extra_info: z.string().trim().max(500, "Qo'shimcha ma'lumot juda uzun"),
});

const studentEditFormSchema = studentFormSchema.extend({
  password: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || value.length >= 6,
      "Parol kamida 6 ta belgidan iborat bo'lsin",
    ),
});

const assignmentFormSchema = z.object({
  student_ids: z
    .array(z.string().min(1))
    .min(1, "Kamida bitta studentni tanlang"),
  group_id: z.string().min(1, "Guruhni tanlang"),
  enrolled_at: z.string().min(1, "Biriktirilgan sanani kiriting"),
});

const initialStudentForm = (): StudentFormState => ({
  full_name: "",
  phone: "",
  email: "",
  password: "",
  parent_phone: "",
  notes: "",
  extra_info: "",
});

const initialAssignmentForm = (): AssignmentFormState => ({
  student_ids: [],
  group_id: "",
  enrolled_at: new Date().toISOString().slice(0, 10),
});

const groupStatusColors: Record<string, string> = {
  planned: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  finished: "bg-slate-100 text-slate-600",
  archived: "bg-purple-100 text-purple-700",
};

const groupStatusLabels: Record<string, { label: string; color: string }> = {
  planned: { label: "Rejada", color: "#f59e0b" },
  active: { label: "Faol", color: "#10b981" },
  finished: { label: "Tugagan", color: "#64748b" },
  archived: { label: "Arxiv", color: "#8b5cf6" },
};

type ActionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: React.ReactNode;
  color: "blue" | "emerald";
  onClick: () => void;
};

function AdminStudents() {
  const { state } = useContextPro();
  const { groups } = useGroups();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const {
    students,
    studentsTotal,
    activeStudentsTotal,
    studentsPages,
    assignableStudents,
    studentsLoading,
    createStudent,
    updateStudent,
    bulkEnrollStudents,
    creatingStudent,
    updatingStudent,
    bulkEnrollingStudents,
    assignableStudentsLoading,
  } = useStudents(undefined, {
    studentListParams: {
      page: currentPage,
      limit: pageSize,
      search: searchTerm.trim() || undefined,
    },
  });

  const [isStudentDrawerOpen, setIsStudentDrawerOpen] = useState(false);
  const [isAssignmentDrawerOpen, setIsAssignmentDrawerOpen] = useState(false);
  const [studentDrawerMode, setStudentDrawerMode] = useState<StudentDrawerMode>("create");
  const [editingStudent, setEditingStudent] = useState<StudentDetail | null>(null);
  const [telegramDrawer, setTelegramDrawer] = useState<TelegramDrawerState | null>(null);
  const [lastCreatedStudent, setLastCreatedStudent] = useState<{
    fullName: string;
    email: string;
    password: string;
  } | null>(null);

  const {
    register: registerStudent,
    handleSubmit: handleStudentSubmit,
    reset: resetStudentForm,
    formState: { errors: studentErrors, isSubmitting: isStudentSubmitting },
  } = useForm<StudentFormState>({
    resolver: zodResolver(
      studentDrawerMode === "edit" ? studentEditFormSchema : studentFormSchema,
    ),
    defaultValues: initialStudentForm(),
  });

  const {
    control: assignmentControl,
    handleSubmit: handleAssignmentSubmit,
    reset: resetAssignmentForm,
    setValue: setAssignmentValue,
    watch: watchAssignment,
    formState: {
      errors: assignmentErrors,
      isSubmitting: isAssignmentSubmitting,
    },
  } = useForm<AssignmentFormState>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: initialAssignmentForm(),
  });

  const selectedAssignmentGroupId = watchAssignment("group_id");
  const selectedAssignmentStudentIds = watchAssignment("student_ids");

  const activeGroups = useMemo(
    () => groups.filter((group) => group.status === "active"),
    [groups],
  );

  const studentSelectOptions = useMemo(
    () =>
      assignableStudents.map((student) => ({
        value: student.id,
        label: student.full_name,
        student,
        isDisabled: false,
      })),
    [assignableStudents],
  );

  useEffect(() => {
    if (!selectedAssignmentGroupId) return;
    const groupStillActive = activeGroups.some(
      (group) => group.id === selectedAssignmentGroupId,
    );
    if (!groupStillActive) {
      setAssignmentValue("group_id", "");
    }
  }, [activeGroups, selectedAssignmentGroupId, setAssignmentValue]);

  useEffect(() => {
    const maxPage = Math.max(studentsPages, 1);
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [studentsPages, currentPage]);

  const openCreateStudentDrawer = () => {
    setStudentDrawerMode("create");
    setEditingStudent(null);
    resetStudentForm(initialStudentForm());
    setIsStudentDrawerOpen(true);
  };

  const openEditStudentDrawer = (student: StudentDetail) => {
    setStudentDrawerMode("edit");
    setEditingStudent(student);
    resetStudentForm({
      full_name: student.full_name ?? "",
      phone: student.phone ?? "",
      email: student.email ?? "",
      password: "",
      parent_phone: student.student_profile?.parent_phone ?? "",
      notes: student.student_profile?.notes ?? "",
      extra_info: student.student_profile?.extra_info ?? "",
    });
    setIsStudentDrawerOpen(true);
  };

  const closeStudentDrawer = () => {
    setIsStudentDrawerOpen(false);
    setEditingStudent(null);
    setStudentDrawerMode("create");
    resetStudentForm(initialStudentForm());
  };

  const handleCreateStudent = async (studentForm: StudentFormState) => {
    const createdStudent = await createStudent({
      user: {
        full_name: studentForm.full_name.trim(),
        phone: studentForm.phone.trim() || null,
        email: studentForm.email.trim().toLowerCase(),
        password: studentForm.password,
        roles: ["student"],
        status: "active",
      },
      profile: {
        parent_phone: studentForm.parent_phone.trim() || null,
        notes: studentForm.notes.trim() || null,
        extra_info: studentForm.extra_info.trim() || null,
        created_by_teacher_id: state.user?.roles?.includes("teacher")
          ? state.user.id
          : null,
      },
    });

    setLastCreatedStudent({
      fullName: createdStudent.full_name,
      email: studentForm.email.trim().toLowerCase(),
      password: studentForm.password,
    });

    resetStudentForm(initialStudentForm());
    setIsStudentDrawerOpen(false);
    setTimeout(() => setLastCreatedStudent(null), 5000);
  };

  const handleUpdateStudent = async (studentForm: StudentFormState) => {
    if (!editingStudent) return;

    await updateStudent(editingStudent.id, {
      user: {
        full_name: studentForm.full_name.trim(),
        phone: studentForm.phone.trim() || null,
        email: studentForm.email.trim().toLowerCase(),
        status: editingStudent.status,
        ...(studentForm.password.trim()
          ? { password: studentForm.password.trim() }
          : {}),
      },
      profile: {
        parent_phone: studentForm.parent_phone.trim() || null,
        notes: studentForm.notes.trim() || null,
        extra_info: studentForm.extra_info.trim() || null,
      },
    });

    closeStudentDrawer();
  };

  const handleAssignStudent = async (assignmentForm: AssignmentFormState) => {
    await bulkEnrollStudents({
      student_ids: assignmentForm.student_ids,
      group_id: assignmentForm.group_id,
      enrolled_at: assignmentForm.enrolled_at,
      status: "active",
    });
    resetAssignmentForm({
      ...initialAssignmentForm(),
      group_id: assignmentForm.group_id,
    });
    setIsAssignmentDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-[1800px] mx-auto p-4 lg:p-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-600 text-white">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
            <HiMiniUsers size={350} />
          </div>
          <div className="absolute bottom-0 left-0 w-60 h-60 opacity-5">
            <HiMiniAcademicCap size={250} />
          </div>
          <div className="relative px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div className="max-w-3xl">
                <Chip
                  label="STUDENT MARKAZI"
                  className="!mb-4 !bg-white/20 !text-white !font-bold !text-sm !py-1 !px-4"
                  size="medium"
                />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  Student boshqaruvi
                </h1>
                <p className="mt-4 text-blue-100 text-base sm:text-lg max-w-xl leading-relaxed">
                  Yagona platformada studentlarni yarating, guruhlarga
                  biriktiring va ularning faoliyatini kuzating
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <StatCard
                  label="Jami studentlar"
                  value={studentsTotal}
                  icon={<HiMiniUsers size={24} />}
                  color="blue"
                />
                <StatCard
                  label="Faol studentlar"
                  value={activeStudentsTotal}
                  icon={<HiMiniCheckBadge size={24} />}
                  color="emerald"
                />
                <StatCard
                  label="Jami guruhlar"
                  value={groups.length}
                  icon={<HiMiniAcademicCap size={24} />}
                  color="purple"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {lastCreatedStudent && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <strong>{lastCreatedStudent.fullName}</strong>
                <span className="text-slate-600">
                  Email: <strong>{lastCreatedStudent.email}</strong>
                </span>
                <span className="text-slate-600">
                  Parol: <strong>{lastCreatedStudent.password}</strong>
                </span>
              </div>
              <span className="text-xs text-emerald-700">
                Endi uni guruhga biriktirishingiz mumkin
              </span>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ActionCard
            icon={<HiMiniUserPlus size={28} />}
            title="Yangi student qo'shish"
            description="Email, parol va shaxsiy ma'lumotlar bilan student profili yarating"
            buttonText="Student yaratish"
            buttonIcon={<HiMiniPlus size={18} />}
            color="blue"
            onClick={openCreateStudentDrawer}
          />
          <ActionCard
            icon={<HiMiniUsers size={28} />}
            title="Guruhga biriktirish"
            description="Mavjud studentlarni guruhlarga qo'shing va faoliyatini boshqaring"
            buttonText="Biriktirish"
            buttonIcon={<HiMiniCheckCircle size={18} />}
            color="emerald"
            onClick={() => setIsAssignmentDrawerOpen(true)}
          />
        </div>

        {/* Students List */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Studentlar ro'yxati
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Barcha studentlar va ularning ma'lumotlari
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <HiMiniMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Ism, email yoki telefon bo'yicha qidirish..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <PremiumTable
            eyebrow="STUDENT REESTRI"
            title="Studentlar ro'yxati"
            description="Barcha studentlar, kontaktlar, Telegram holati va profil tafsilotlari bir joyda."
            summary={
              <>
                <PremiumBadge tone="sky">{studentsTotal} ta natija</PremiumBadge>
                <PremiumBadge tone="emerald">{activeStudentsTotal} ta faol</PremiumBadge>
              </>
            }
          >
            {studentsLoading ? (
              <TableSkeleton columns={7} rows={5} />
            ) : students.length === 0 ? (
              <div className="p-12 text-center">
                <HiMiniUsers size={64} className="mx-auto text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mt-3">
                  Student topilmadi
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Qidiruv shartlarini o'zgartiring yoki yangi student yarating
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="border-b border-slate-200 bg-slate-950/[0.035] backdrop-blur">
                    <tr className="text-left text-[12px] uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-6 py-4 font-semibold">Student</th>
                      <th className="px-4 py-4 font-semibold">Kontakt</th>
                      <th className="px-4 py-4 font-semibold">Holat</th>
                      <th className="px-4 py-4 font-semibold">Telegram</th>
                      <th className="px-4 py-4 font-semibold">Ma'lumotlar</th>
                      <th className="px-4 py-4 font-semibold">Izohlar</th>
                      <th className="px-4 py-4 font-semibold">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        index={idx}
                        onEdit={() => openEditStudentDrawer(student)}
                        onOpenTelegram={() =>
                          setTelegramDrawer({
                            student,
                            temporaryPassword: "12345678",
                          })
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!studentsLoading && studentsTotal > 0 && (
              <div className="border-t border-slate-200 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>Sahifadagi yozuvlar:</span>
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      <option value={10}>10 ta</option>
                      <option value={20}>20 ta</option>
                      <option value={30}>30 ta</option>
                    </select>
                    <span className="text-slate-400">Jami: {studentsTotal}</span>
                  </div>

                  <Pagination
                    count={Math.max(studentsPages, 1)}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    shape="rounded"
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    renderItem={(item) => (
                      <PaginationItem
                        {...item}
                        slots={{ previous: undefined, next: undefined }}
                      />
                    )}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        borderRadius: "10px",
                        fontWeight: 700,
                        minWidth: 36,
                        height: 36,
                      },
                      "& .MuiPaginationItem-root.Mui-selected": {
                        backgroundColor: "#2563eb",
                        color: "#fff",
                      },
                      "& .MuiPaginationItem-root.Mui-selected:hover": {
                        backgroundColor: "#1d4ed8",
                      },
                    }}
                  />
                </div>
              </div>
            )}
          </PremiumTable>
        </div>
      </div>

      {/* Student Creation Drawer */}
      <Drawer
        anchor="right"
        open={isStudentDrawerOpen}
        onClose={closeStudentDrawer}
      >
        <DrawerContent
          title={
            studentDrawerMode === "edit"
              ? "Student ma'lumotlarini tahrirlash"
              : "Yangi student qo'shish"
          }
          subtitle={
            studentDrawerMode === "edit"
              ? "Mavjud student ma'lumotlarini yangilang"
              : "Student ma'lumotlarini to'liq kiriting"
          }
          icon={
            studentDrawerMode === "edit" ? (
              <HiMiniPencilSquare size={24} />
            ) : (
              <HiMiniUserPlus size={24} />
            )
          }
          color="blue"
          onClose={closeStudentDrawer}
        >
          <form
            onSubmit={handleStudentSubmit(
              studentDrawerMode === "edit"
                ? handleUpdateStudent
                : handleCreateStudent,
            )}
            className="space-y-5"
          >
            <TextField
              label="F.I.Sh"
              fullWidth
              required
              {...registerStudent("full_name")}
              error={!!studentErrors.full_name}
              helperText={studentErrors.full_name?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  marginBottom: 2,
                },
              }}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              {...registerStudent("email")}
              error={!!studentErrors.email}
              helperText={studentErrors.email?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  marginBottom: 2,
                },
              }}
            />

            <TextField
              label="Parol"
              type="password"
              fullWidth
              required={studentDrawerMode === "create"}
              placeholder={
                studentDrawerMode === "edit"
                  ? "O'zgartirmasangiz bo'sh qoldiring"
                  : undefined
              }
              {...registerStudent("password")}
              error={!!studentErrors.password}
              helperText={
                studentErrors.password?.message ??
                (studentDrawerMode === "edit"
                  ? "Yangi parol berish ixtiyoriy"
                  : undefined)
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  marginBottom: 2,
                },
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Telefon raqami"
                fullWidth
                {...registerStudent("phone")}
                error={!!studentErrors.phone}
                helperText={studentErrors.phone?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    marginBottom: 2,
                  },
                }}
              />
              <TextField
                label="Ota-ona telefoni"
                fullWidth
                {...registerStudent("parent_phone")}
                error={!!studentErrors.parent_phone}
                helperText={studentErrors.parent_phone?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    marginBottom: 2,
                  },
                }}
              />
            </div>

            <TextField
              label="Izoh"
              multiline
              rows={3}
              fullWidth
              {...registerStudent("notes")}
              error={!!studentErrors.notes}
              helperText={studentErrors.notes?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  marginBottom: 2,
                },
              }}
            />

            <TextField
              label="Qo'shimcha ma'lumot"
              multiline
              rows={3}
              fullWidth
              {...registerStudent("extra_info")}
              error={!!studentErrors.extra_info}
              helperText={studentErrors.extra_info?.message}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  marginBottom: 2,
                },
              }}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
              <HiMiniInformationCircle size={18} />
              {studentDrawerMode === "edit"
                ? "Email, telefon va profil ma'lumotlarini shu yerdan yangilashingiz mumkin"
                : "Student ushbu email va parol bilan tizimga kirishi mumkin"}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="contained"
                disabled={
                  creatingStudent ||
                  updatingStudent ||
                  isStudentSubmitting
                }
                fullWidth
                sx={{
                  borderRadius: "14px",
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {creatingStudent || updatingStudent || isStudentSubmitting
                  ? studentDrawerMode === "edit"
                    ? "Saqlanmoqda..."
                    : "Yaratilmoqda..."
                  : studentDrawerMode === "edit"
                    ? "O'zgarishlarni saqlash"
                    : "Student yaratish"}
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  studentDrawerMode === "edit" && editingStudent
                    ? closeStudentDrawer()
                    : resetStudentForm(initialStudentForm())
                }
                sx={{
                  borderRadius: "14px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {studentDrawerMode === "edit" ? "Bekor qilish" : "Tozalash"}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Assignment Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(telegramDrawer)}
        onClose={() => setTelegramDrawer(null)}
      >
        {telegramDrawer && (
          <TelegramStudentDrawer
            student={telegramDrawer.student}
            temporaryPassword={telegramDrawer.temporaryPassword}
            onTemporaryPasswordChange={(temporaryPassword) =>
              setTelegramDrawer((prev) => (prev ? { ...prev, temporaryPassword } : prev))
            }
            onClose={() => setTelegramDrawer(null)}
          />
        )}
      </Drawer>

      <Drawer
        anchor="right"
        open={isAssignmentDrawerOpen}
        onClose={() => setIsAssignmentDrawerOpen(false)}
      >
        <DrawerContent
          title="Guruhga biriktirish"
          subtitle="Yangi studentlarni faol guruhga qo'shing"
          icon={<HiMiniUsers size={24} />}
          color="emerald"
          onClose={() => setIsAssignmentDrawerOpen(false)}
        >
          <form
            onSubmit={handleAssignmentSubmit(handleAssignStudent)}
            className="space-y-5"
          >
            <Controller
              name="group_id"
              control={assignmentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Guruhni tanlang"
                  select
                  fullWidth
                  disabled={activeGroups.length === 0}
                  error={!!assignmentErrors.group_id}
                  helperText={
                    assignmentErrors.group_id?.message ??
                    (activeGroups.length === 0
                      ? "Hozircha faol guruh topilmadi"
                      : "Faqat faol guruhlar ko'rsatiladi")
                  }
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      marginBottom: 2,
                    },
                  }}
                >
                  {activeGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{group.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ml-2 ${groupStatusColors[group.status] || "bg-slate-100 text-slate-600"}`}
                        >
                          {groupStatusLabels[group.status]?.label ||
                            group.status}
                        </span>
                      </div>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="student_ids"
              control={assignmentControl}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Studentni tanlang
                  </label>

                  <Select<StudentSelectOption, true>
                    isMulti
                    options={studentSelectOptions}
                    value={studentSelectOptions.filter((option) =>
                      field.value?.includes(option.value),
                    )}
                    onChange={(selectedOptions) =>
                      field.onChange(
                        (selectedOptions ?? []).map((option) => option.value),
                      )
                    }
                    isDisabled={
                      !selectedAssignmentGroupId ||
                      assignableStudentsLoading ||
                      studentSelectOptions.length === 0
                    }
                    placeholder={
                      !selectedAssignmentGroupId
                        ? "Avval guruhni tanlang"
                        : "Studentlarni qidiring va tanlang..."
                    }
                    noOptionsMessage={() =>
                      !selectedAssignmentGroupId
                        ? "Avval guruhni tanlang"
                        : "Student topilmadi"
                    }
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    formatOptionLabel={(option) => (
                      <StudentOption
                        student={option.student}
                        isAssigned={option.isDisabled}
                      />
                    )}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: "42px",
                        borderRadius: "12px",
                        padding: "0px 4px",
                        borderColor: assignmentErrors.student_ids
                          ? "#dc2626"
                          : state.isFocused
                            ? "#2563eb"
                            : "#cbd5e1",
                        borderWidth: "1.5px",
                        boxShadow: state.isFocused
                          ? assignmentErrors.student_ids
                            ? "0 0 0 4px rgba(220, 38, 38, 0.12)"
                            : "0 0 0 4px rgba(37, 99, 235, 0.12)"
                          : "none",
                        "&:hover": {
                          borderColor: assignmentErrors.student_ids
                            ? "#dc2626"
                            : "#94a3b8",
                        },
                        backgroundColor: state.isDisabled ? "#f8fafc" : "#fff",
                        transition: "all 0.2s ease",
                      }),

                      valueContainer: (base) => ({
                        ...base,
                        padding: "4px 8px",
                        gap: "8px",
                      }),

                      placeholder: (base) => ({
                        ...base,
                        color: "#94a3b8",
                        fontSize: "14px",
                        fontWeight: "500",
                      }),

                      menu: (base) => ({
                        ...base,
                        borderRadius: "14px",
                        overflow: "hidden",
                        marginTop: "8px",
                        boxShadow:
                          "0 10px 25px rgba(15, 23, 42, 0.12), 0 4px 10px rgba(15, 23, 42, 0.06)",
                        border: "1px solid #e2e8f0",
                        zIndex: 30,
                      }),

                      menuList: (base) => ({
                        ...base,
                        padding: "8px",
                      }),

                      option: (base, state) => ({
                        ...base,
                        borderRadius: "8px",
                        padding: "6px 10px",
                        marginBottom: "2px",
                        fontSize: "13px",
                        backgroundColor: state.isDisabled
                          ? "#f8fafc"
                          : state.isSelected
                            ? "#dbeafe"
                            : state.isFocused
                              ? "#f1f5f9"
                              : "#fff",
                        color: state.isDisabled ? "#94a3b8" : "#0f172a",
                        cursor: state.isDisabled ? "not-allowed" : "pointer",
                        transition: "all 0.15s ease",
                        "&:active": {
                          backgroundColor:
                            !state.isDisabled && !state.isSelected
                              ? "#e2e8f0"
                              : undefined,
                        },
                      }),

                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        borderRadius: "16px",
                        paddingLeft: "6px",
                        minHeight: "26px",
                        alignItems: "center",
                        gap: "2px",
                      }),

                      multiValueLabel: (base) => ({
                        ...base,
                        color: "#047857",
                        fontWeight: 500,
                        fontSize: "12px",
                        padding: "2px 4px",
                      }),

                      multiValueRemove: (base) => ({
                        ...base,
                        color: "#059669",
                        borderRadius: "12px",
                        width: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 2px 0 0",
                        ":hover": {
                          backgroundColor: "#d1fae5",
                          color: "#065f46",
                        },
                      }),

                      dropdownIndicator: (base, state) => ({
                        ...base,
                        color: state.isFocused ? "#2563eb" : "#94a3b8",
                        padding: "4px",
                        transition: "all 0.2s ease",
                        transform: state.selectProps.menuIsOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        ":hover": {
                          color: "#2563eb",
                        },
                      }),
                      clearIndicator: (base) => ({
                        ...base,
                        color: "#94a3b8",
                        padding: "4px",
                        transition: "all 0.15s ease",
                        ":hover": {
                          color: "#ef4444",
                        },
                      }),

                      loadingIndicator: (base) => ({
                        ...base,
                        color: "#2563eb",
                      }),

                      noOptionsMessage: (base) => ({
                        ...base,
                        padding: "12px",
                        color: "#64748b",
                        fontSize: "13px",
                        fontWeight: "500",
                      }),

                      loadingMessage: (base) => ({
                        ...base,
                        padding: "12px",
                        color: "#64748b",
                        fontSize: "13px",
                        fontWeight: "500",
                      }),
                    }}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: "#2563eb",
                        primary25: "#f1f5f9",
                        primary50: "#dbeafe",
                      },
                    })}
                  />

                  <div className="flex justify-between items-center mt-2">
                    <p
                      className={`text-xs ${
                        assignmentErrors.student_ids
                          ? "text-red-600"
                          : "text-slate-500"
                      }`}
                    >
                      {assignmentErrors.student_ids?.message ??
                        (!selectedAssignmentGroupId
                          ? "Avval guruhni tanlang"
                          : `${assignableStudents.length} ta student biriktirishga tayyor`)}
                    </p>

                    {selectedAssignmentStudentIds.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${(selectedAssignmentStudentIds.length / assignableStudents.length) * 100}%`,
                              maxWidth: "100%",
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-emerald-700">
                          {Math.round(
                            (selectedAssignmentStudentIds.length /
                              assignableStudents.length) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            />
            <Controller
              name="enrolled_at"
              control={assignmentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Biriktirilgan sana"
                  type="date"
                  fullWidth
                  error={!!assignmentErrors.enrolled_at}
                  helperText={assignmentErrors.enrolled_at?.message}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      marginBottom: 2,
                    },
                  }}
                />
              )}
            />

            {selectedAssignmentGroupId &&
              !assignableStudentsLoading &&
              assignableStudents.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
                  <HiMiniInformationCircle size={18} />
                  Hozircha biror guruhga biriktirilmagan yangi student qolmadi
                </div>
              )}

            {selectedAssignmentStudentIds.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 flex items-center gap-2">
                <HiMiniCheckCircle size={18} className="text-emerald-600" />
                {selectedAssignmentStudentIds.length} ta student biriktirish
                uchun tanlandi
              </div>
            )}

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 flex items-center gap-2">
              <HiMiniInformationCircle size={18} />
              Student guruhga biriktirilgandan keyin uning darslari va
              to'lovlari kuzatiladi
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={
                  bulkEnrollingStudents ||
                  isAssignmentSubmitting ||
                  !selectedAssignmentGroupId ||
                  selectedAssignmentStudentIds.length === 0
                }
                fullWidth
                sx={{
                  borderRadius: "14px",
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {bulkEnrollingStudents || isAssignmentSubmitting
                  ? "Biriktirilmoqda..."
                  : "Guruhga biriktirish"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => resetAssignmentForm(initialAssignmentForm())}
                sx={{
                  borderRadius: "14px",
                  px: 4,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Tozalash
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

// Helper Components
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  };
  return (
    <div
      className={`p-4 rounded-xl border min-w-[120px] ${colors[color as keyof typeof colors]}`}
    >
      <div className="flex items-center gap-2">
        <div>{icon}</div>
        <div>
          <p className="text-[11px] font-bold text-white/70 uppercase">
            {label}
          </p>
          <p className="text-2xl font-black text-white">
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
  buttonText,
  buttonIcon,
  color,
  onClick,
}: ActionCardProps) {
  const colors = {
    blue: {
      card: "hover:border-blue-300 hover:shadow-blue-500/15",
      icon: "text-blue-600 bg-blue-50",
      button: "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg",
    },
    emerald: {
      card: "hover:border-emerald-300 hover:shadow-emerald-500/15",
      icon: "text-emerald-600 bg-emerald-50",
      button: "bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg",
    },
  };

  const style = colors[color];

  return (
    <div
      className={`group flex-1 p-6 border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${style.card}`}
      style={{ borderRadius: "28px" }}
    >
      <div
        className={`w-14 h-14 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${style.icon}`}
        style={{ borderRadius: "18px" }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-5 leading-relaxed">
        {description}
      </p>
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 px-5 py-2.5 font-bold transition-all duration-200 text-white ${style.button}`}
        style={{ borderRadius: "20px" }}
      >
        {buttonIcon}
        {buttonText}
      </button>
    </div>
  );
}

function DrawerContent({
  title,
  subtitle,
  icon,
  color,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "blue" | "emerald";
  onClose: () => void;
  children: React.ReactNode;
}) {
  const gradientColors = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
  };

  return (
    <div className="h-full flex flex-col w-full sm:w-[560px]">
      {/* Header */}
      <div
        className={`p-5 bg-gradient-to-r ${gradientColors[color]} text-white`}
      >
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Avatar
              sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 44, height: 44 }}
            >
              {icon}
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}

type StudentSelectOption = {
  value: string;
  label: string;
  student: StudentDetail;
  isDisabled: boolean;
};

function StudentOption({
  student,
  isAssigned,
}: {
  student: StudentDetail;
  isAssigned: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: isAssigned ? "#f1f5f9" : "#dbeafe",
            color: isAssigned ? "#94a3b8" : "#2563eb",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {student.full_name.charAt(0).toUpperCase()}
        </Avatar>
        <div className="min-w-0">
          <p
            className={`font-semibold text-sm truncate ${isAssigned ? "text-slate-400" : "text-slate-900"}`}
          >
            {student.full_name}
          </p>
        </div>
      </div>
      {isAssigned && (
        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
          <HiMiniCheckBadge size={12} />
          Biriktirilgan
        </span>
      )}
    </div>
  );
}

function StudentRow({
  student,
  index,
  onEdit,
  onOpenTelegram,
}: {
  student: StudentDetail;
  index: number;
  onEdit: () => void;
  onOpenTelegram: () => void;
}) {
  const hasNotes = !!student.student_profile?.notes;
  const hasExtraInfo = !!student.student_profile?.extra_info;
  const hasParentPhone = !!student.student_profile?.parent_phone;
  const isTelegramConnected = Boolean(student.student_profile?.telegram_chat_id);

  return (
    <tr
      className={`border-b border-slate-100/80 transition-all duration-200 hover:bg-[linear-gradient(90deg,rgba(239,246,255,0.72),rgba(255,255,255,0.96))] ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar
            sx={{ width: 48, height: 48, bgcolor: "#dbeafe", color: "#2563eb" }}
          >
            {student.full_name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <p className="font-bold text-slate-900">{student.full_name}</p>
            <p className="text-xs text-slate-400">
              ID: {student.id.slice(0, 8)}...
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1">
            <HiMiniEnvelope size={14} className="text-slate-400" />{" "}
            {student.email}
          </div>
          {student.phone && (
            <div className="flex items-center gap-1">
              <HiMiniPhone size={14} className="text-slate-400" />{" "}
              {student.phone}
            </div>
          )}
          {student.student_profile?.parent_phone && (
            <div className="flex items-center gap-1">
              <HiMiniUser size={14} className="text-slate-400" /> Ota-ona:{" "}
              {student.student_profile.parent_phone}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <PremiumBadge tone={student.status === "active" ? "emerald" : "slate"}>
          {student.status === "active" ? (
            <HiMiniCheckCircle size={12} />
          ) : (
            <HiMiniXCircle size={12} />
          )}
          {student.status === "active" ? "Faol" : "Nofaol"}
        </PremiumBadge>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-2">
          <PremiumBadge tone={isTelegramConnected ? "sky" : "amber"}>
            <HiMiniChatBubbleLeftRight size={12} />
            {isTelegramConnected ? "Bot ulangan" : "Ulanmagan"}
          </PremiumBadge>
          <p className="text-xs text-slate-500">
            {student.student_profile?.telegram_username
              ? `@${student.student_profile.telegram_username}`
              : "Telegram username yo'q"}
          </p>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-1 flex-wrap">
          <PremiumBadge tone={hasParentPhone ? "emerald" : "amber"}>
            {hasParentPhone ? "Kontakt to'liq" : "Kontakt kiritilmagan"}
          </PremiumBadge>
          <PremiumBadge tone={hasNotes ? "sky" : "slate"}>
            {hasNotes ? "Izoh bor" : "Izoh yo'q"}
          </PremiumBadge>
          <PremiumBadge tone={hasExtraInfo ? "violet" : "slate"}>
            {hasExtraInfo ? "Qo'shimcha bor" : "Qo'shimcha yo'q"}
          </PremiumBadge>
        </div>
      </td>
      <td className="px-4 py-4 max-w-xs">
        {student.student_profile?.notes ? (
          <p className="text-xs text-slate-600 flex items-center gap-1">
            <HiMiniInformationCircle size={12} />
            {student.student_profile.notes.length > 50
              ? `${student.student_profile.notes.slice(0, 50)}...`
              : student.student_profile.notes}
          </p>
        ) : (
          <p className="text-xs text-slate-400">Ma'lumot kiritilmagan</p>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end">
          <RowActionMenu
            items={[
              {
                label: "Tahrirlash",
                onClick: onEdit,
                icon: <HiMiniPencilSquare size={16} />,
              },
              {
                label: "Telegram",
                onClick: onOpenTelegram,
                icon: <HiMiniPaperAirplane size={16} />,
              },
            ]}
          />
        </div>
      </td>
    </tr>
  );
}

function TelegramStudentDrawer({
  student,
  temporaryPassword,
  onTemporaryPasswordChange,
  onClose,
}: {
  student: StudentDetail;
  temporaryPassword: string;
  onTemporaryPasswordChange: (value: string) => void;
  onClose: () => void;
}) {
  const {
    telegramLink,
    loading,
    isFetching,
    refreshLink,
    createLink,
    sendCredentials,
    creatingLink,
    sendingCredentials,
  } = useTelegramStudents(student.id);

  const linkUrl = telegramLink?.telegram_link_url ?? "";
  const qrUrl = linkUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(linkUrl)}`
    : "";

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  return (
    <DrawerContent
      title="Telegram orqali yuborish"
      subtitle={`${student.full_name} uchun bot ulash va login yuborish`}
      icon={<HiMiniChatBubbleLeftRight size={24} />}
      color="blue"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">{student.full_name}</p>
          <p className="mt-1 text-sm text-slate-500">{student.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                telegramLink?.is_connected
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <HiMiniCheckCircle size={12} />
              {telegramLink?.is_connected ? "Telegram ulangan" : "Telegram ulanmagan"}
            </span>
            {student.student_profile?.telegram_last_credentials_sent_at && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                Oxirgi yuborilgan: {new Date(student.student_profile.telegram_last_credentials_sent_at).toLocaleDateString("uz-UZ")}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-sky-100 bg-[linear-gradient(135deg,#f5fbff_0%,#f0f9ff_45%,#eff6ff_100%)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-600">1-qadam</p>
              <h4 className="mt-2 text-xl font-black text-slate-900">Student botga ulanadi</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Student QR kodni skaner qiladi yoki linkni ochib botga `/start` yuboradi. Bir marta ulangandan keyin qayta ulash shart emas.
              </p>
            </div>
            <Button
              variant="contained"
              onClick={() => createLink()}
              disabled={creatingLink}
              sx={{
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#0ea5e9",
                "&:hover": { bgcolor: "#0284c7" },
              }}
            >
              {creatingLink ? "Yaratilmoqda..." : "QR / link yaratish"}
            </Button>
          </div>

          {(loading || isFetching) && (
            <div className="mt-4 text-sm text-slate-500">Telegram ma'lumotlari yangilanmoqda...</div>
          )}

          {linkUrl && (
            <div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
              <div className="rounded-[28px] border border-sky-100 bg-white p-4 shadow-sm">
                <img
                  src={qrUrl}
                  alt={`${student.full_name} uchun Telegram QR`}
                  className="mx-auto h-[220px] w-[220px] rounded-2xl object-contain"
                />
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/80 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Telegram link</p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-700">{linkUrl}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(linkUrl)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <HiMiniClipboardDocument size={14} />
                      Linkni nusxalash
                    </button>
                    <button
                      type="button"
                      onClick={() => refreshLink()}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <HiMiniLink size={14} />
                      Holatni yangilash
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-white/80 p-4 text-sm text-slate-600">
                  {telegramLink?.is_connected ? (
                    <p>
                      Ulangan akkaunt:{" "}
                      <strong>
                        {telegramLink.telegram_first_name || student.full_name}
                        {telegramLink.telegram_username ? ` (@${telegramLink.telegram_username})` : ""}
                      </strong>
                    </p>
                  ) : (
                    <p>Student hali botga ulanmagan. Admin shu ekranda qolib turib holatni yangilab tekshirishi mumkin.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(135deg,#f2fff8_0%,#f0fdf4_50%,#ecfdf5_100%)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-600">2-qadam</p>
          <h4 className="mt-2 text-xl font-black text-slate-900">Login va parolni Telegramga yuborish</h4>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Student botga ulangandan keyin shu yerdan vaqtinchalik parol yuboriladi. Login sifatida studentning emaili yuboriladi.
          </p>

          <div className="mt-4 space-y-4">
            <TextField
              label="Vaqtinchalik parol"
              fullWidth
              value={temporaryPassword}
              onChange={(e) => onTemporaryPasswordChange(e.target.value)}
              helperText="Student birinchi kirishda bu parolni almashtirishi kerak"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                },
              }}
            />

            <div className="rounded-2xl border border-white/80 bg-white p-4 text-sm leading-7 text-slate-700">
              <p><strong>Yuboriladigan login:</strong> {student.email}</p>
              <p><strong>Yuboriladigan parol:</strong> {temporaryPassword || "Avtomatik yaratiladi"}</p>
            </div>

            <Button
              variant="contained"
              fullWidth
              startIcon={<HiMiniPaperAirplane />}
              disabled={!telegramLink?.is_connected || sendingCredentials}
              onClick={() => sendCredentials(temporaryPassword.trim() || undefined)}
              sx={{
                borderRadius: "14px",
                py: 1.5,
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "#10b981",
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              {sendingCredentials ? "Yuborilmoqda..." : "Login va parolni Telegramga yuborish"}
            </Button>

            {!telegramLink?.is_connected && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Avval student botga ulanib olishi kerak. Ulangandan keyin yuqoridagi tugma aktiv bo'ladi.
              </div>
            )}
          </div>
        </div>
      </div>
    </DrawerContent>
  );
}

export default AdminStudents;
