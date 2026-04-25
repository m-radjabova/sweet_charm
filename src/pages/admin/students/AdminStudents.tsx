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
  FormControl,
  InputLabel,
  Select as MuiSelect,
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
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniChevronDown,
  HiMiniChevronUp,
  HiMiniArrowUpRight,
} from "react-icons/hi2";
import Select from "react-select";
import SelectActionMenuItem from "../../../components/forms/SelectActionMenuItem";
import { PremiumBadge, PremiumTable, TableSkeleton } from "../../../components/ui/PremiumTable";
import { RowActionMenu } from "../../../components/ui/RowActionMenu";
import useContextPro from "../../../hooks/useContextPro";
import useGroups from "../../../hooks/useGroups";
import useStudents from "../../../hooks/useStudents";
import useTelegramStudents from "../../../hooks/useTelegramStudents";
import type { StudentDetail } from "../../../types/types";
import { formatDate } from "../../../utils/date";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
        activeGroupNames: student.active_group_names ?? [],
      })),
    [assignableStudents],
  );

  const visibleStudentSelectOptions = useMemo(
    () =>
      studentSelectOptions.map((option) => {
        const isAlreadyInSelectedGroup = Boolean(
          selectedAssignmentGroupId &&
            option.student.active_group_ids?.includes(selectedAssignmentGroupId),
        );
        const assignedGroupName =
          option.activeGroupNames[
            option.student.active_group_ids?.findIndex(
              (groupId) => groupId === selectedAssignmentGroupId,
            ) ?? -1
          ] ?? option.activeGroupNames[0] ?? null;

        return {
          ...option,
          isDisabled: isAlreadyInSelectedGroup,
          assignedGroupName,
        };
      }),
    [selectedAssignmentGroupId, studentSelectOptions],
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
              <TableSkeleton columns={5} rows={5} />
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
                <table className="w-full min-w-[1100px]">
                  <thead className="border-b border-slate-200 bg-slate-950/[0.035] backdrop-blur">
                    <tr className="text-left text-[12px] uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-6 py-4 font-semibold">Student</th>
                      <th className="px-4 py-4 font-semibold">Asosiy aloqa</th>
                      <th className="px-4 py-4 font-semibold">Holat va badge</th>
                      <th className="px-4 py-4 font-semibold">Qisqa ko'rinish</th>
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
                <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,247,255,0.92))] px-4 py-4 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)] backdrop-blur md:flex-row md:items-center md:justify-between md:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="rounded-2xl border border-sky-100 bg-white/90 px-3 py-2 shadow-[0_12px_30px_-24px_rgba(37,99,235,0.7)]">
                      <FormControl
                        size="small"
                        sx={{
                          minWidth: 138,
                          "& .MuiInputLabel-root": {
                            fontSize: "0.8rem",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            color: "#64748b",
                          },
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "16px",
                            backgroundColor: "#f8fafc",
                            fontWeight: 700,
                            color: "#0f172a",
                            "& fieldset": {
                              borderColor: "rgba(148,163,184,0.28)",
                            },
                            "&:hover fieldset": {
                              borderColor: "rgba(59,130,246,0.45)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#3b82f6",
                              borderWidth: "1px",
                            },
                          },
                        }}
                      >
                        <InputLabel id="students-page-size-label">
                          Ko'rsatish
                        </InputLabel>
                        <MuiSelect
                          labelId="students-page-size-label"
                          value={pageSize}
                          label="Ko'rsatish"
                          onChange={(event) => {
                            setPageSize(Number(event.target.value));
                            setCurrentPage(1);
                          }}
                        >
                          <MenuItem value={10}>10 ta</MenuItem>
                          <MenuItem value={20}>20 ta</MenuItem>
                          <MenuItem value={30}>30 ta</MenuItem>
                        </MuiSelect>
                      </FormControl>
                    </div>

                    <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/85 px-3.5 py-2.5 shadow-[0_12px_30px_-26px_rgba(15,23,42,0.4)]">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.15)]" />
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Jami student
                        </span>
                        <span className="text-base font-black text-slate-800">
                          {studentsTotal}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <div className="text-sm text-slate-500">
                      Sahifa <span className="font-bold text-slate-800">{currentPage}</span> / {Math.max(studentsPages, 1)}
                    </div>

                    <div className="rounded-[24px] border border-slate-200/80 bg-white/90 px-2 py-2 shadow-[0_16px_36px_-24px_rgba(37,99,235,0.45)]">
                      <Pagination
                        count={Math.max(studentsPages, 1)}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        shape="rounded"
                        color="primary"
                        siblingCount={1}
                        boundaryCount={1}
                        showFirstButton
                        showLastButton
                        renderItem={(item) => (
                          <PaginationItem
                            {...item}
                            slots={{
                              previous: HiMiniChevronLeft,
                              next: HiMiniChevronRight,
                            }}
                          />
                        )}
                        sx={{
                          "& .MuiPagination-ul": {
                            gap: { xs: "6px", sm: "8px" },
                            flexWrap: "nowrap",
                          },
                          "& .MuiPaginationItem-root": {
                            borderRadius: "16px",
                            fontWeight: 800,
                            minWidth: 42,
                            height: 42,
                            color: "#334155",
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            backgroundColor: "rgba(248, 250, 252, 0.88)",
                            transition: "all 180ms ease",
                          },
                          "& .MuiPaginationItem-root:hover": {
                            backgroundColor: "rgba(239, 246, 255, 1)",
                            borderColor: "rgba(96, 165, 250, 0.45)",
                            color: "#1d4ed8",
                          },
                          "& .MuiPaginationItem-previousNext": {
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(241,245,249,0.94))",
                          },
                          "& .MuiPaginationItem-firstLast": {
                            background:
                              "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(241,245,249,0.94))",
                          },
                          "& .MuiPaginationItem-root.Mui-selected": {
                            background:
                              "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            color: "#fff",
                            borderColor: "transparent",
                            boxShadow: "0 14px 30px -18px rgba(37, 99, 235, 0.95)",
                          },
                          "& .MuiPaginationItem-root.Mui-selected:hover": {
                            background:
                              "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
                          },
                        }}
                      />
                    </div>
                  </div>
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
                  {activeGroups.length > 0 ? (
                    activeGroups.map((group) => (
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
                    ))
                  ) : (
                    <SelectActionMenuItem
                      title="Faol guruh yo'q, avval guruh yarating"
                      description="Guruhlar bo'limiga o'tib active holatdagi guruh oching."
                      icon={<HiMiniAcademicCap className="text-lg" />}
                      onClick={() => {
                        setIsAssignmentDrawerOpen(false);
                        navigate("/admin/groups");
                      }}
                    />
                  )}
                </TextField>
              )}
            />

            <Controller
              name="student_ids"
              control={assignmentControl}
              render={({ field }) => (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    <span className="flex items-center justify-between gap-3">
                      <span>Studentni tanlang</span>
                      {selectedAssignmentStudentIds.length > 0 && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                          {selectedAssignmentStudentIds.length} ta tanlandi
                        </span>
                      )}
                    </span>
                  </label>

                  <Select<StudentSelectOption, true>
                    isMulti
                    options={visibleStudentSelectOptions}
                    value={visibleStudentSelectOptions.filter((option) =>
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
                      visibleStudentSelectOptions.length === 0
                    }
                    placeholder={
                      !selectedAssignmentGroupId
                        ? "Avval guruhni tanlang"
                        : "Studentlarni qidiring va tanlang..."
                    }
                    noOptionsMessage={() =>
                      !selectedAssignmentGroupId
                        ? "Avval guruhni tanlang"
                        : visibleStudentSelectOptions.length === 0
                          ? "Student yo'q, avval yangi student qo'shing"
                          : "Student topilmadi"
                    }
                    blurInputOnSelect={false}
                    closeMenuOnSelect={false}
                    controlShouldRenderValue={
                      selectedAssignmentStudentIds.length <= 2
                    }
                    hideSelectedOptions={false}
                    menuPlacement="auto"
                    maxMenuHeight={220}
                    formatOptionLabel={(option) => (
                      <StudentOption
                        student={option.student}
                        isAssigned={option.isDisabled}
                      />
                    )}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: "48px",
                        borderRadius: "14px",
                        padding: "2px 6px",
                        alignItems: "center",
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
                        padding: "4px 6px",
                        gap: "6px",
                        minHeight: "38px",
                        maxHeight: "94px",
                        overflowY: "auto",
                      }),

                      placeholder: (base) => ({
                        ...base,
                        color: "#94a3b8",
                        fontSize: "14px",
                        fontWeight: "500",
                        marginLeft: "4px",
                      }),

                      input: (base) => ({
                        ...base,
                        margin: 0,
                        padding: 0,
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
                        padding: "6px",
                        maxHeight: "220px",
                        scrollbarWidth: "thin",
                      }),

                      option: (base, state) => ({
                        ...base,
                        borderRadius: "10px",
                        padding: "8px 10px",
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
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        "&:active": {
                          backgroundColor:
                            !state.isDisabled && !state.isSelected
                              ? "#e2e8f0"
                              : undefined,
                        },
                      }),

                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "999px",
                        paddingLeft: "4px",
                        minHeight: "24px",
                        maxWidth: "100%",
                        alignItems: "center",
                        gap: "2px",
                        margin: 0,
                      }),

                      multiValueLabel: (base) => ({
                        ...base,
                        color: "#1d4ed8",
                        fontWeight: 600,
                        fontSize: "11px",
                        lineHeight: 1.2,
                        padding: "2px 6px",
                        maxWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }),

                      multiValueRemove: (base) => ({
                        ...base,
                        color: "#2563eb",
                        borderRadius: "999px",
                        width: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 2px 0 0",
                        ":hover": {
                          backgroundColor: "#dbeafe",
                          color: "#1d4ed8",
                        },
                      }),

                      dropdownIndicator: (base, state) => ({
                        ...base,
                        color: state.isFocused ? "#2563eb" : "#94a3b8",
                        padding: "6px",
                        transition: "all 0.2s ease",
                        transform: state.selectProps.menuIsOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        ":hover": {
                          color: "#2563eb",
                        },
                      }),

                      indicatorSeparator: (base) => ({
                        ...base,
                        marginTop: "6px",
                        marginBottom: "6px",
                        backgroundColor: "#e2e8f0",
                      }),

                      clearIndicator: (base) => ({
                        ...base,
                        color: "#94a3b8",
                        padding: "6px",
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
                        padding: "14px",
                        color: "#475569",
                        fontSize: "13px",
                        fontWeight: "700",
                        background:
                          "linear-gradient(135deg,rgba(248,250,252,0.92),rgba(239,246,255,0.9))",
                        borderRadius: "12px",
                        margin: "6px",
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

                  {selectedAssignmentGroupId &&
                  visibleStudentSelectOptions.length === 0 &&
                  !assignableStudentsLoading ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAssignmentDrawerOpen(false);
                        openCreateStudentDrawer();
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                    >
                      <HiMiniArrowUpRight className="text-sm" />
                      Student yo'q, yangi student qo'shish
                    </button>
                  ) : null}

                  {selectedAssignmentStudentIds.length > 2 && (
                    <p className="text-[11px] text-slate-500">
                      {selectedAssignmentStudentIds.length} ta student tanlangan.
                      Maydon ixcham ko'rinishda qoldirildi.
                    </p>
                  )}

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
                          : `${visibleStudentSelectOptions.filter((option) => !option.isDisabled).length} ta student biriktirishga tayyor`)}
                    </p>

                    {selectedAssignmentStudentIds.length > 0 &&
                      visibleStudentSelectOptions.some((option) => !option.isDisabled) && (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${(selectedAssignmentStudentIds.length / visibleStudentSelectOptions.filter((option) => !option.isDisabled).length) * 100}%`,
                              maxWidth: "100%",
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-emerald-700">
                          {Math.round(
                            (selectedAssignmentStudentIds.length /
                              visibleStudentSelectOptions.filter((option) => !option.isDisabled).length) *
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
              visibleStudentSelectOptions.every((option) => option.isDisabled) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
                  <HiMiniInformationCircle size={18} />
                  Bu guruhga biriktirilmagan student qolmadi
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
  activeGroupNames: string[];
  assignedGroupName?: string | null;
};

function StudentOption({
  student,
  isAssigned,
}: {
  student: StudentDetail;
  isAssigned: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p
        className={`min-w-0 truncate font-semibold text-sm ${isAssigned ? "text-slate-400" : "text-slate-900"}`}
      >
        {student.full_name}
      </p>
      {isAssigned && (
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 flex items-center gap-1">
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
  const [isExpanded, setIsExpanded] = useState(false);
  const detailCards = [
    {
      title: "Kontaktlar",
      tone: "sky" as const,
      items: [
        {
          icon: <HiMiniEnvelope size={14} className="text-sky-600" />,
          label: "Email",
          value: student.email,
        },
        {
          icon: <HiMiniPhone size={14} className="text-sky-600" />,
          label: "Telefon",
          value: student.phone || "Kiritilmagan",
          muted: !student.phone,
        },
        {
          icon: <HiMiniUser size={14} className="text-sky-600" />,
          label: "Ota-ona",
          value: student.student_profile?.parent_phone || "Kiritilmagan",
          muted: !student.student_profile?.parent_phone,
        },
      ],
    },
    {
      title: "Telegram",
      tone: isTelegramConnected ? ("emerald" as const) : ("amber" as const),
      items: [
        {
          icon: <HiMiniChatBubbleLeftRight size={14} className={isTelegramConnected ? "text-emerald-600" : "text-amber-600"} />,
          label: "Holat",
          value: isTelegramConnected ? "Bot ulangan" : "Bot ulanmagan",
        },
        {
          icon: <HiMiniLink size={14} className={isTelegramConnected ? "text-emerald-600" : "text-amber-600"} />,
          label: "Username",
          value: student.student_profile?.telegram_username
            ? `@${student.student_profile.telegram_username}`
            : "Username yo'q",
          muted: !student.student_profile?.telegram_username,
        },
      ],
    },
    {
      title: "Profil ma'lumotlari",
      tone: hasNotes || hasExtraInfo ? ("violet" as const) : ("slate" as const),
      items: [
        {
          icon: <HiMiniInformationCircle size={14} className="text-violet-600" />,
          label: "Izoh",
          value: student.student_profile?.notes || "Izoh kiritilmagan",
          muted: !student.student_profile?.notes,
        },
        {
          icon: <HiMiniClipboardDocument size={14} className="text-violet-600" />,
          label: "Qo'shimcha",
          value: student.student_profile?.extra_info || "Qo'shimcha ma'lumot yo'q",
          muted: !student.student_profile?.extra_info,
        },
      ],
    },
  ];
  const infoCount = [hasParentPhone, hasNotes, hasExtraInfo].filter(Boolean).length;

  return (
    <>
      <tr
        className={`border-b border-slate-100/80 transition-all duration-200 hover:bg-[linear-gradient(90deg,rgba(239,246,255,0.72),rgba(255,255,255,0.96))] ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
      >
        <td className="px-6 py-4">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="group flex w-full items-center gap-3 text-left"
          >
            <Avatar
              sx={{ width: 52, height: 52, bgcolor: "#dbeafe", color: "#2563eb" }}
            >
              {student.full_name.charAt(0).toUpperCase()}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-base font-black text-slate-900">
                  {student.full_name}
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  ID {student.id.slice(0, 8)}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Batafsil ko'rish uchun bosing
              </p>
            </div>
          </button>
        </td>
        <td className="px-4 py-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <HiMiniEnvelope size={15} className="text-slate-400" />
              <span className="truncate">{student.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <HiMiniPhone size={15} className="text-slate-400" />
              <span>{student.phone || "Telefon yo'q"}</span>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-wrap gap-2">
            <PremiumBadge tone={student.status === "active" ? "emerald" : "slate"}>
              {student.status === "active" ? (
                <HiMiniCheckCircle size={12} />
              ) : (
                <HiMiniXCircle size={12} />
              )}
              {student.status === "active" ? "Faol" : "Nofaol"}
            </PremiumBadge>
            <PremiumBadge tone={isTelegramConnected ? "sky" : "amber"}>
              <HiMiniChatBubbleLeftRight size={12} />
              {isTelegramConnected ? "Bot ulangan" : "Bot ulanmagan"}
            </PremiumBadge>
            <PremiumBadge tone={hasParentPhone ? "emerald" : "slate"}>
              {hasParentPhone ? "Ota-ona bor" : "Ota-ona yo'q"}
            </PremiumBadge>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <PremiumBadge tone={hasNotes ? "violet" : "slate"}>
                {hasNotes ? "Izoh bor" : "Izoh yo'q"}
              </PremiumBadge>
              <PremiumBadge tone={hasExtraInfo ? "cyan" : "slate"}>
                {hasExtraInfo ? "Qo'shimcha bor" : "Qo'shimcha yo'q"}
              </PremiumBadge>
            </div>
            <p className="text-xs text-slate-500">
              {infoCount > 0
                ? `${infoCount} ta profil ma'lumoti to'ldirilgan`
                : "Profil ma'lumotlari hali kam"}
            </p>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-3.5 text-sm font-bold transition-all ${
                isExpanded
                  ? "border-blue-200 bg-blue-50 text-blue-700 shadow-[0_12px_28px_-22px_rgba(37,99,235,0.9)]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700"
              }`}
            >
              {isExpanded ? <HiMiniChevronUp size={16} /> : <HiMiniChevronDown size={16} />}
              {isExpanded ? "Yopish" : "Batafsil"}
            </button>
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
      {isExpanded && (
        <tr className={index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}>
          <td colSpan={5} className="px-5 pb-5 pt-0">
            <div className="rounded-[26px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(248,250,252,0.94),rgba(255,255,255,0.98),rgba(239,246,255,0.72))] p-4 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.4)] sm:p-5">
              <div className="mb-4 flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-sky-700">
                    Student Tafsilotlari
                  </p>
                  <h4 className="mt-1 text-lg font-black text-slate-900">
                    {student.full_name} uchun to'liq ma'lumot
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <PremiumBadge tone={student.status === "active" ? "emerald" : "slate"}>
                    {student.status === "active" ? "Faol student" : "Nofaol student"}
                  </PremiumBadge>
                  <PremiumBadge tone={isTelegramConnected ? "sky" : "amber"}>
                    {isTelegramConnected ? "Telegram tayyor" : "Telegram ulanmagan"}
                  </PremiumBadge>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {detailCards.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.45)]"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h5 className="text-sm font-black uppercase tracking-[0.16em] text-slate-700">
                        {card.title}
                      </h5>
                      <PremiumBadge tone={card.tone}>{card.items.length} qator</PremiumBadge>
                    </div>
                    <div className="space-y-3">
                      {card.items.map((item) => (
                        <div
                          key={`${card.title}-${item.label}`}
                          className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3"
                        >
                          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                            {item.icon}
                            {item.label}
                          </div>
                          <p
                            className={`text-sm leading-6 ${
                              item.muted ? "text-slate-400" : "font-semibold text-slate-700"
                            }`}
                          >
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
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
                Oxirgi yuborilgan: {formatDate(student.student_profile.telegram_last_credentials_sent_at)}
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
