import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  MenuItem,
  Skeleton,
  TextField,
  Drawer,
  IconButton,
  Avatar,
  Chip,
} from "@mui/material";
import {
  HiMiniAcademicCap,
  HiMiniLink,
  HiMiniNoSymbol,
  HiMiniPlus,
  HiMiniUserGroup,
  HiMiniUsers,
  HiMiniXMark,
  HiMiniMagnifyingGlass,
  HiMiniEnvelope,
  HiMiniPhone,
  HiMiniCalendar,
  HiMiniBookOpen,
  HiMiniInformationCircle,
} from "react-icons/hi2";
import ConfirmActionDialog from "../../../components/ConfirmActionDialog";
import { PremiumBadge } from "../../../components/ui/PremiumTable";
import { RowActionMenu } from "../../../components/ui/RowActionMenu";
import useGroups from "../../../hooks/useGroups";
import useTeachers from "../../../hooks/useTeachers";
import type { Group, TeacherDetail } from "../../../types/types";

type TeacherFormState = {
  full_name: string;
  phone: string;
  email: string;
  password: string;
  specialization: string;
  hired_at: string;
  bio: string;
};

type TeacherAssignmentFormState = {
  teacher_id: string;
  group_id: string;
};

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\+?[0-9\s\-()]{9,20}$/.test(value),
    "Telefon raqami noto'g'ri",
  )
  .transform((value) => value.trim());

const teacherFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "F.I.Sh kamida 3 ta harfdan iborat bo'lsin"),
  phone: optionalPhoneSchema,
  email: z.string().trim().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lsin"),
  specialization: z.string().trim().max(120, "Yo'nalish juda uzun"),
  hired_at: z.string().trim(),
  bio: z.string().trim().max(1000, "Bio juda uzun"),
});

const teacherAssignmentSchema = z.object({
  teacher_id: z.string().min(1, "Teacher tanlang"),
  group_id: z.string().min(1, "Guruh tanlang"),
});

const initialTeacherForm = (): TeacherFormState => ({
  full_name: "",
  phone: "",
  email: "",
  password: "",
  specialization: "",
  hired_at: "",
  bio: "",
});

const initialTeacherAssignmentForm = (): TeacherAssignmentFormState => ({
  teacher_id: "",
  group_id: "",
});

function AdminTeachers() {
  const { groups, updateGroup } = useGroups();
  const {
    teachers,
    loading,
    createTeacher,
    creatingTeacher,
    searchTerm,
    setSearchTerm,
  } = useTeachers();
  const [lastCreatedTeacher, setLastCreatedTeacher] = useState<{
    fullName: string;
    email: string;
    password: string;
  } | null>(null);
  const [isTeacherDrawerOpen, setIsTeacherDrawerOpen] = useState(false);
  const [isAssignmentDrawerOpen, setIsAssignmentDrawerOpen] = useState(false);
  const [groupToUnassign, setGroupToUnassign] = useState<Group | null>(null);
  const [isUnassigningGroup, setIsUnassigningGroup] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormState>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: initialTeacherForm(),
  });

  const {
    control: assignmentControl,
    handleSubmit: handleAssignmentSubmit,
    reset: resetAssignmentForm,
    watch: watchAssignment,
    formState: {
      errors: assignmentErrors,
      isSubmitting: isAssignmentSubmitting,
    },
  } = useForm<TeacherAssignmentFormState>({
    resolver: zodResolver(teacherAssignmentSchema),
    defaultValues: initialTeacherAssignmentForm(),
  });

  const assignedTeacherIds = useMemo(
    () =>
      new Set(
        groups
          .map((group) => group.teacher_id)
          .filter((teacherId): teacherId is string => Boolean(teacherId)),
      ),
    [groups],
  );

  const selectedAssignmentTeacherId = watchAssignment("teacher_id");

  const availableGroupsCount = useMemo(
    () => groups.filter((group) => !group.teacher_id).length,
    [groups],
  );

  const filteredTeachers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return teachers;
    return teachers.filter((teacher) =>
      [
        teacher.full_name,
        teacher.email,
        teacher.phone,
        teacher.teacher_profile?.specialization,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [searchTerm, teachers]);

  const handleCreateTeacher = async (form: TeacherFormState) => {
    const createdTeacher = await createTeacher({
      user: {
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        roles: ["teacher"],
        status: "active",
      },
      profile: {
        specialization: form.specialization.trim() || null,
        hired_at: form.hired_at || null,
        bio: form.bio.trim() || null,
      },
    });

    setLastCreatedTeacher({
      fullName: createdTeacher.full_name,
      email: createdTeacher.email,
      password: form.password,
    });
    reset(initialTeacherForm());
    setIsTeacherDrawerOpen(false);
    setTimeout(() => setLastCreatedTeacher(null), 5000);
  };

  const handleAssignTeacher = async (form: TeacherAssignmentFormState) => {
    const selectedGroup = groups.find((group) => group.id === form.group_id);
    if (!selectedGroup) return;
    await updateGroup(form.group_id, {
      teacher_id: form.teacher_id,
      course_id: selectedGroup.course_id,
      name: selectedGroup.name,
      monthly_fee: selectedGroup.monthly_fee,
      start_date: selectedGroup.start_date,
      end_date: selectedGroup.end_date,
      status: selectedGroup.status,
      schedule_summary: selectedGroup.schedule_summary,
      notes: selectedGroup.notes,
      room_id: selectedGroup.room_id,
    });
    resetAssignmentForm({
      ...initialTeacherAssignmentForm(),
      teacher_id: form.teacher_id,
    });
    setIsAssignmentDrawerOpen(false);
  };

  const handleUnassignGroup = async () => {
    if (!groupToUnassign) return;
    setIsUnassigningGroup(true);
    try {
      await updateGroup(groupToUnassign.id, {
        teacher_id: null,
        course_id: groupToUnassign.course_id,
        name: groupToUnassign.name,
        monthly_fee: groupToUnassign.monthly_fee,
        start_date: groupToUnassign.start_date,
        end_date: groupToUnassign.end_date,
        status: groupToUnassign.status,
        schedule_summary: groupToUnassign.schedule_summary,
        notes: groupToUnassign.notes,
        room_id: groupToUnassign.room_id,
      });
      setGroupToUnassign(null);
    } finally {
      setIsUnassigningGroup(false);
    }
  };

  const assignedTeachersCount = useMemo(
    () =>
      teachers.filter((teacher) => assignedTeacherIds.has(teacher.id)).length,
    [teachers, assignedTeacherIds],
  );

  const unassignedTeachersCount = useMemo(
    () =>
      teachers.filter((teacher) => !assignedTeacherIds.has(teacher.id)).length,
    [teachers, assignedTeacherIds],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20">
      <div className="max-w-[1800px] mx-auto p-4 lg:p-6 space-y-6">
        {/* Hero Section - Kattalashtirilgan */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-cyan-800 to-cyan-600 text-white">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
            <HiMiniUserGroup size={350} />
          </div>
          <div className="absolute bottom-0 left-0 w-60 h-60 opacity-5">
            <HiMiniAcademicCap size={250} />
          </div>
          <div className="relative px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div className="max-w-2xl">
                <Chip
                  label="TEACHER MARKAZI"
                  className="!mb-4 !bg-white/20 !text-white !font-bold !text-sm !py-1 !px-4"
                />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  O'qituvchi boshqaruvi
                </h1>
                <p className="mt-4 text-cyan-100 text-base sm:text-lg max-w-xl leading-relaxed">
                  O'qituvchilarni yarating, ularni guruhlarga biriktiring va
                  faoliyatini kuzating
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <StatBox
                  label="Jami teacher"
                  value={teachers.length}
                  icon={<HiMiniUserGroup size={24} />}
                  color="#06b6d4"
                />
                <StatBox
                  label="Biriktirilgan"
                  value={assignedTeachersCount}
                  icon={<HiMiniAcademicCap size={24} />}
                  color="#10b981"
                />
                <StatBox
                  label="Bo'sh teacher"
                  value={unassignedTeachersCount}
                  icon={<HiMiniUsers size={24} />}
                  color="#f59e0b"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {lastCreatedTeacher && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <strong>{lastCreatedTeacher.fullName}</strong>
                <span className="text-slate-600">
                  Email: <strong>{lastCreatedTeacher.email}</strong>
                </span>
                <span className="text-slate-600">
                  Parol: <strong>{lastCreatedTeacher.password}</strong>
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
            icon={<HiMiniPlus size={28} />}
            title="Yangi o'qituvchi qo'shish"
            description="Email, parol va shaxsiy ma'lumotlar bilan o'qituvchi profili yarating"
            buttonText="O'qituvchi yaratish"
            buttonIcon={<HiMiniPlus size={18} />}
            color="#06b6d4"
            onClick={() => setIsTeacherDrawerOpen(true)}
          />
          <ActionCard
            icon={<HiMiniLink size={28} />}
            title="Guruhga biriktirish"
            description="Mavjud o'qituvchilarni guruhlarga biriktiring va darslarini boshqaring"
            buttonText="Biriktirish"
            buttonIcon={<HiMiniLink size={18} />}
            color="#10b981"
            onClick={() => setIsAssignmentDrawerOpen(true)}
          />
        </div>

        {/* Teachers List */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                O'qituvchilar ro'yxati
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Barcha o'qituvchilar va ularning ma'lumotlari
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <HiMiniMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Ism, email yoki yo'nalish bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100 transition-all"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={100}
                    className="rounded-xl"
                  />
                ))}
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="p-12 text-center">
                <HiMiniUserGroup size={64} className="mx-auto text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mt-3">
                  O'qituvchi topilmadi
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Qidiruv shartlarini o'zgartiring yoki yangi o'qituvchi
                  yarating
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTeachers.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    groups={groups.filter((g) => g.teacher_id === teacher.id)}
                    onUnassign={(group) => setGroupToUnassign(group)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Teacher Creation Drawer */}
      <Drawer
        anchor="right"
        open={isTeacherDrawerOpen}
        onClose={() => setIsTeacherDrawerOpen(false)}
      >
        <DrawerContent
          title="Yangi o'qituvchi qo'shish"
          subtitle="O'qituvchi ma'lumotlarini to'liq kiriting"
          icon={<HiMiniPlus size={24} />}
          color="cyan"
          onClose={() => setIsTeacherDrawerOpen(false)}
        >
          <form
            onSubmit={handleSubmit(handleCreateTeacher)}
            className="space-y-4"
          >
            <TextField
              label="F.I.Sh"
              fullWidth
              sx={{ marginBottom: 2 }}
              required
              {...register("full_name")}
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label="Email"
                type="email"
                sx={{ marginBottom: 2 }}
                fullWidth
                required
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                label="Parol"
                type="text"
                sx={{ marginBottom: 2 }}
                fullWidth
                required
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label="Telefon raqami"
                sx={{ marginBottom: 2 }}
                fullWidth
                {...register("phone")}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
              <TextField
                label="Yo'nalishi"
                sx={{ marginBottom: 2 }}
                fullWidth
                {...register("specialization")}
                error={!!errors.specialization}
                helperText={errors.specialization?.message}
              />
            </div>
            <TextField
              label="Ishga kirgan sana"
              type="date"
              sx={{
                marginBottom: 2,
                "& .MuiOutlinedInput-root": { borderRadius: "14px" },
                "& .MuiInputLabel-root": {
                  backgroundColor: "white",
                  paddingRight: "4px",
                  paddingLeft: "4px",
                },
              }}
              fullWidth
              {...register("hired_at")}
              error={!!errors.hired_at}
              helperText={errors.hired_at?.message}
            />
            <TextField
              label="Bio"
              multiline
              rows={3}
              fullWidth
              sx={{ marginBottom: 2 }}
              {...register("bio")}
              error={!!errors.bio}
              helperText={errors.bio?.message}
            />
            <div className="bg-teal-50 rounded-xl p-3 text-sm text-slate-600 flex items-center gap-2">
              <HiMiniInformationCircle size={18} className="text-teal-600" />
              O'qituvchi ushbu email va parol bilan tizimga kirishi mumkin
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                variant="contained"
                disabled={creatingTeacher || isSubmitting}
                fullWidth
                className="!bg-teal-600 hover:!bg-teal-700 !rounded-xl !py-3"
              >
                {creatingTeacher || isSubmitting
                  ? "Yaratilmoqda..."
                  : "O'qituvchi yaratish"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => reset(initialTeacherForm())}
                className="!rounded-xl !px-5"
              >
                Tozalash
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Assignment Drawer */}
      <Drawer
        anchor="right"
        open={isAssignmentDrawerOpen}
        onClose={() => setIsAssignmentDrawerOpen(false)}
      >
        <DrawerContent
          title="Guruhga biriktirish"
          subtitle="O'qituvchini guruhga qo'shing"
          icon={<HiMiniLink size={24} />}
          color="emerald"
          onClose={() => setIsAssignmentDrawerOpen(false)}
        >
          <form
            onSubmit={handleAssignmentSubmit(handleAssignTeacher)}
            className="space-y-4"
          >
            <Controller
              name="teacher_id"
              control={assignmentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  sx={{ marginBottom: 2 }}
                  label="O'qituvchini tanlang"
                  select
                  fullWidth
                  error={!!assignmentErrors.teacher_id}
                  helperText={
                    assignmentErrors.teacher_id?.message ??
                    `${teachers.filter((teacher) => !assignedTeacherIds.has(teacher.id)).length} ta bo'sh o'qituvchi mavjud`
                  }
                >
                  {teachers.map((teacher) => (
                    <MenuItem
                      key={teacher.id}
                      value={teacher.id}
                      disabled={assignedTeacherIds.has(teacher.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Avatar className="!w-8 !h-8 !bg-teal-100 !text-teal-600">
                            {teacher.full_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">
                              {teacher.full_name}
                            </p>
                            {teacher.teacher_profile?.specialization && (
                              <p className="text-xs text-slate-500">
                                {teacher.teacher_profile.specialization}
                              </p>
                            )}
                          </div>
                        </div>
                        {assignedTeacherIds.has(teacher.id) && (
                          <Chip
                            label="Band"
                            size="small"
                            className="!bg-amber-100 !text-amber-700"
                          />
                        )}
                      </div>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="group_id"
              control={assignmentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Guruhni tanlang"
                  select
                  fullWidth
                  disabled={!selectedAssignmentTeacherId}
                  error={!!assignmentErrors.group_id}
                  sx={{ marginBottom: 2 }}
                  helperText={
                    assignmentErrors.group_id?.message ??
                    (!selectedAssignmentTeacherId
                      ? "Avval o'qituvchini tanlang"
                      : `${availableGroupsCount} ta bo'sh guruh mavjud`)
                  }
                >
                  {groups.map((group) => (
                    <MenuItem
                      key={group.id}
                      value={group.id}
                      disabled={Boolean(group.teacher_id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="font-semibold text-sm">{group.name}</p>
                          {group.course?.name && (
                            <p className="text-xs text-slate-500">
                              {group.course.name}
                            </p>
                          )}
                        </div>
                        {group.teacher_id && (
                          <Chip
                            label="Biriktirilgan"
                            size="small"
                            className="!bg-emerald-100 !text-emerald-700"
                          />
                        )}
                      </div>
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {selectedAssignmentTeacherId &&
              availableGroupsCount === 0 && (
                <div className="bg-blue-50 text-blue-700 rounded-xl p-3 text-sm">
                  Hozircha bo'sh guruh qolmagan
                </div>
              )}

            <div className="bg-emerald-50 rounded-xl p-3 text-sm text-slate-600 flex items-center gap-2">
              <HiMiniInformationCircle size={18} className="text-emerald-600" />
              Biriktirilgandan keyin guruh ichidagi jurnal va darslar shu
              o'qituvchi bilan bog'lanadi
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={
                  isAssignmentSubmitting ||
                  !selectedAssignmentTeacherId ||
                  availableGroupsCount === 0
                }
                fullWidth
                className="!rounded-xl !py-3"
              >
                {isAssignmentSubmitting
                  ? "Biriktirilmoqda..."
                  : "Guruhga biriktirish"}
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  resetAssignmentForm(initialTeacherAssignmentForm())
                }
                className="!rounded-xl !px-5"
              >
                Tozalash
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>

      <ConfirmActionDialog
        open={Boolean(groupToUnassign)}
        title="O'qituvchini guruhdan chiqarish"
        description={
          groupToUnassign
            ? `${groupToUnassign.name} guruhidan o'qituvchini chiqarishni tasdiqlaysizmi?`
            : ""
        }
        confirmText="Ha, chiqarish"
        cancelText="Yo'q"
        loading={isUnassigningGroup}
        tone="warning"
        onClose={() => setGroupToUnassign(null)}
        onConfirm={handleUnassignGroup}
      />
    </div>
  );
}

// Helper Components
function StatBox({
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
  return (
    <div
      className="p-4 rounded-xl border min-w-[120px]"
      style={{ backgroundColor: `${color}10`, borderColor: `${color}33` }}
    >
      <div className="flex items-center gap-2">
        <div style={{ color }}>{icon}</div>
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
}: any) {
  return (
    <div
      className="group flex-1 p-6 rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ borderRadius: "28px" }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}10`, color, borderRadius: "18px" }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-extrabold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-5 leading-relaxed">
        {description}
      </p>
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2.5 px-5 py-2.5 font-bold transition-all duration-200 text-white shadow-md hover:shadow-lg"
        style={{ backgroundColor: color, borderRadius: "14px" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor =
            color === "#06b6d4" ? "#0891b2" : "#059669")
        }
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = color)}
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
}: any) {
  const bgColor =
    color === "cyan"
      ? "from-cyan-500 to-cyan-600"
      : "from-emerald-500 to-emerald-600";
  return (
    <div className="h-full flex flex-col w-full sm:w-[560px]">
      <div className={`p-5 bg-gradient-to-r ${bgColor} text-white`}>
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Avatar className="!bg-white/20">{icon}</Avatar>
            <div>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="text-sm opacity-90">{subtitle}</p>
            </div>
          </div>
          <IconButton onClick={onClose} className="!text-white">
            <HiMiniXMark size={20} />
          </IconButton>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </div>
  );
}

function TeacherCard({
  teacher,
  groups,
  onUnassign,
}: {
  teacher: TeacherDetail;
  groups: Group[];
  onUnassign: (group: Group) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-5 hover:bg-cyan-50/20 transition-all duration-200">
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="!w-16 !h-16 !bg-teal-100 !text-teal-600 !text-2xl">
                {teacher.full_name.charAt(0).toUpperCase()}
              </Avatar>
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${teacher.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`}
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {teacher.full_name}
                </h3>
                <PremiumBadge tone={teacher.status === "active" ? "emerald" : "slate"}>
                  {teacher.status === "active" ? "Faol" : "Nofaol"}
                </PremiumBadge>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <HiMiniEnvelope size={14} /> {teacher.email}
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-1">
                    <HiMiniPhone size={14} /> {teacher.phone}
                  </div>
                )}
                {teacher.teacher_profile?.specialization && (
                  <div className="flex items-center gap-1">
                    <HiMiniBookOpen size={14} />{" "}
                    {teacher.teacher_profile.specialization}
                  </div>
                )}
              </div>
            </div>
          </div>
          {isExpanded && (
            <div className="mt-4 ml-[72px] space-y-2">
              {teacher.teacher_profile?.hired_at && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <HiMiniCalendar size={14} /> Ishga kirgan:{" "}
                  {teacher.teacher_profile.hired_at}
                </div>
              )}
              {teacher.teacher_profile?.bio && (
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <span className="font-semibold">Bio:</span>{" "}
                  {teacher.teacher_profile.bio}
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 ml-[72px] text-xs text-teal-600 hover:text-teal-700 font-semibold"
          >
            {isExpanded ? "Yopish" : "Ko'proq ma'lumot"}
          </button>
        </div>

        <div className="lg:w-1/2">
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <HiMiniUserGroup size={16} className="text-teal-600" />
              <h4 className="font-bold text-slate-900">
                Biriktirilgan guruhlar ({groups.length})
              </h4>
            </div>
            {groups.length === 0 ? (
              <div className="text-center py-6">
                <HiMiniInformationCircle
                  size={32}
                  className="mx-auto mb-2 text-slate-300"
                />
                <p className="text-sm text-slate-500">
                  Hali guruh biriktirilmagan
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-900">
                        {group.name}
                      </p>
                      {group.course?.name && (
                        <p className="text-xs text-slate-500">
                          {group.course.name}
                        </p>
                      )}
                    </div>
                    <RowActionMenu
                      items={[
                        {
                          label: "Guruhdan chiqarish",
                          onClick: () => onUnassign(group),
                          icon: <HiMiniNoSymbol size={16} />,
                          danger: true,
                        },
                      ]}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTeachers;
