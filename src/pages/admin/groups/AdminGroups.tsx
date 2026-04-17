import { useEffect, useMemo, useState, type JSX } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueries } from "@tanstack/react-query";
import {
  Button,
  MenuItem,
  Skeleton,
  TextField,
  Drawer,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  HiMiniArrowRight,
  HiMiniPencilSquare,
  HiMiniPlus,
  HiMiniTrash,
  HiMiniUsers,
  HiMiniXMark,
  HiMiniMagnifyingGlass,
  HiMiniCalendar,
  HiMiniClock,
  HiMiniAcademicCap,
  HiMiniUserGroup,
  HiMiniCurrencyDollar,
  HiMiniCheckCircle,
  HiMiniXCircle,
  HiMiniInformationCircle,
  HiMiniMapPin,
} from "react-icons/hi2";
import { Link } from "react-router-dom";
import ConfirmActionDialog from "../../../components/ConfirmActionDialog";
import useCourses from "../../../hooks/useCourses";
import useGroups from "../../../hooks/useGroups";
import useContextPro from "../../../hooks/useContextPro";
import useTeachers from "../../../hooks/useTeachers";
import useRooms from "../../../hooks/useRooms";
import { listGroupEnrollments } from "../../../api/students";
import type { Group, GroupStatus } from "../../../types/types";

type GroupFormState = {
  name: string;
  course_id: string;
  teacher_id: string;
  room_mode: "existing" | "new";
  room_id: string;
  new_room_name: string;
  new_room_capacity: string;
  new_room_location_note: string;
  monthly_fee: string;
  start_date: string;
  end_date: string;
  status: GroupStatus;
  schedule_summary: string;
  notes: string;
};

const groupFormSchema = z
  .object({
    name: z.string().trim().min(2, "Guruh nomi kamida 2 ta harf bo'lsin"),
    course_id: z.string().min(1, "Kursni tanlang"),
    teacher_id: z.string(),
    room_mode: z.enum(["existing", "new"]),
    room_id: z.string(),
    new_room_name: z.string().trim(),
    new_room_capacity: z.string().trim(),
    new_room_location_note: z.string().trim().max(120, "Joylashuv izohi juda uzun"),
    monthly_fee: z
      .string()
      .trim()
      .refine(
        (value) =>
          value !== "" && !Number.isNaN(Number(value)) && Number(value) >= 0,
        "Oylik to'lov noto'g'ri",
      ),
    start_date: z.string().min(1, "Boshlanish sanasi majburiy"),
    end_date: z.string().trim(),
    status: z.enum(["planned", "active", "finished", "archived"]),
    schedule_summary: z.string().trim().max(255, "Jadval matni juda uzun"),
    notes: z.string().trim().max(1000, "Izoh juda uzun"),
  })
  .superRefine((value, ctx) => {
    if (value.room_mode !== "new") return;

    if (!value.new_room_name.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["new_room_name"],
        message: "Xona nomini kiriting",
      });
    }

    if (
      value.new_room_capacity.trim() === "" ||
      Number.isNaN(Number(value.new_room_capacity)) ||
      Number(value.new_room_capacity) < 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["new_room_capacity"],
        message: "Xona sig'imi kamida 1 bo'lsin",
      });
    }
  });

const statusLabels: Record<
  GroupStatus,
  { label: string; color: string; icon: JSX.Element }
> = {
  planned: {
    label: "Rejada",
    color: "bg-amber-100 text-amber-700",
    icon: <HiMiniClock size={12} />,
  },
  active: {
    label: "Faol",
    color: "bg-emerald-100 text-emerald-700",
    icon: <HiMiniCheckCircle size={12} />,
  },
  finished: {
    label: "Tugagan",
    color: "bg-slate-100 text-slate-600",
    icon: <HiMiniXCircle size={12} />,
  },
  archived: {
    label: "Arxiv",
    color: "bg-purple-100 text-purple-700",
    icon: <HiMiniInformationCircle size={12} />,
  },
};

const initialGroupForm = (): GroupFormState => ({
  name: "",
  course_id: "",
  teacher_id: "",
  room_mode: "existing",
  room_id: "",
  new_room_name: "",
  new_room_capacity: "",
  new_room_location_note: "",
  monthly_fee: "",
  start_date: "",
  end_date: "",
  status: "planned",
  schedule_summary: "",
  notes: "",
});

function AdminGroups() {
  const {
    state: { user },
  } = useContextPro();
  const isTeacher = user?.role === "teacher";
  const { courses } = useCourses();
  const { teachers } = useTeachers(!isTeacher);
  const { rooms, createRoom } = useRooms();
  const {
    groups,
    loading,
    searchTerm,
    setSearchTerm,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useGroups();
  const visibleGroups = useMemo(() => {
    if (!isTeacher || !user?.id) return groups;
    return groups.filter((group) => group.teacher_id === user.id);
  }, [groups, isTeacher, user?.id]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GroupFormState>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: initialGroupForm(),
  });

  const selectedCourseId = useWatch({ control, name: "course_id" });
  const roomMode = useWatch({ control, name: "room_mode" });
  const selectedCourseForForm = useMemo(
    () => courses.find((course) => course.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const selectedGroup = useMemo(
    () => visibleGroups.find((group) => group.id === selectedGroupId) ?? null,
    [selectedGroupId, visibleGroups],
  );

  useEffect(() => {
    if (!selectedGroup) {
      reset(initialGroupForm());
      return;
    }
    reset({
      name: selectedGroup.name,
      course_id: selectedGroup.course_id,
      teacher_id: selectedGroup.teacher_id ?? "",
      room_mode: "existing",
      room_id: selectedGroup.room_id ?? "",
      new_room_name: "",
      new_room_capacity: "",
      new_room_location_note: "",
      monthly_fee: selectedGroup.monthly_fee,
      start_date: selectedGroup.start_date,
      end_date: selectedGroup.end_date ?? "",
      status: selectedGroup.status,
      schedule_summary: selectedGroup.schedule_summary ?? "",
      notes: selectedGroup.notes ?? "",
    });
  }, [reset, selectedGroup]);

  useEffect(() => {
    if (!selectedCourseForForm) return;
    setValue("monthly_fee", selectedCourseForForm.default_monthly_fee, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [selectedCourseForForm, setValue]);

  const enrollmentQueries = useQueries({
    queries: groups.map((group) => ({
      queryKey: ["group-enrollments", group.id, "count"],
      queryFn: () => listGroupEnrollments(group.id),
      enabled: Boolean(group.id),
    })),
  });

  const studentCounts = useMemo(
    () =>
      new Map(
        groups.map((group, index) => [
          group.id,
          enrollmentQueries[index]?.data?.length ?? 0,
        ]),
      ),
    [enrollmentQueries, groups],
  );

  const handleOpenDrawer = (groupId?: string) => {
    if (groupId) {
      setSelectedGroupId(groupId);
    } else {
      setSelectedGroupId(null);
      reset(initialGroupForm());
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedGroupId(null);
    reset(initialGroupForm());
  };

  const handleSubmitGroup = async (form: GroupFormState) => {
    let roomId: string | null = form.room_id || null;

    if (form.room_mode === "new") {
      const createdRoom = await createRoom({
        name: form.new_room_name.trim(),
        capacity: Number(form.new_room_capacity),
        location_note: form.new_room_location_note.trim() || null,
      });
      roomId = createdRoom.id;
    }

    const payload = {
      name: form.name.trim(),
      course_id: form.course_id,
      teacher_id: form.teacher_id || null,
      room_id: roomId,
      monthly_fee: Number(form.monthly_fee),
      start_date: form.start_date,
      end_date: form.end_date || null,
      status: form.status,
      schedule_summary: form.schedule_summary.trim() || null,
      notes: form.notes.trim() || null,
    };

    if (selectedGroupId) {
      await updateGroup(selectedGroupId, payload);
    } else {
      await createGroup(payload);
    }
    handleCloseDrawer();
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    setIsDeletingGroup(true);
    try {
      await deleteGroup(groupToDelete.id);
      if (selectedGroupId === groupToDelete.id) {
        setSelectedGroupId(null);
      }
      setGroupToDelete(null);
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const totalGroups = visibleGroups.length;
  const activeGroups = visibleGroups.filter((g) => g.status === "active").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <div className="max-w-[1800px] mx-auto p-4 lg:p-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-600 text-white">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
            <HiMiniUserGroup size={350} />
          </div>
          <div className="absolute bottom-0 left-0 w-60 h-60 opacity-5">
            <HiMiniAcademicCap size={250} />
          </div>
          <div className="relative px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div className="max-w-3xl">
                <Chip
                  label="GURUHLAR MARKAZI"
                  className="!mb-4 !bg-white/20 !text-white !font-bold !text-sm !py-1 !px-4"
                />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  {isTeacher ? "Mening guruhlarim" : "Guruhlarni boshqarish"}
                </h1>
                <p className="mt-4 text-emerald-100 text-base sm:text-lg max-w-xl leading-relaxed">
                  {isTeacher
                    ? "Sizga biriktirilgan guruhlarni ko'ring va jurnal bo'limiga o'ting"
                    : "Guruh yarating, teacher biriktiring va studentlar jurnalini yuriting"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <StatCard
                  label="Jami guruhlar"
                  value={totalGroups}
                  icon={<HiMiniUserGroup size={24} />}
                  color="teal"
                />
                <StatCard
                  label="Faol guruhlar"
                  value={activeGroups}
                  icon={<HiMiniCheckCircle size={24} />}
                  color="emerald"
                />
                <StatCard
                  label={isTeacher ? "Mening kurslarim" : "Kurslar"}
                  value={new Set(visibleGroups.map((group) => group.course_id)).size || courses.length}
                  icon={<HiMiniAcademicCap size={24} />}
                  color="cyan"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shadow-sm">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              GURUH BOSHQARUVI
            </p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {isTeacher ? "Biriktirilgan guruhlar" : "Guruh qo'shish va tahrirlash"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {isTeacher
                ? "Faqat sizga biriktirilgan guruhlar ko'rinadi"
                : "Kurs asosida guruh yarating, teacher biriktiring va kurs to'lovini avtomatik qo'llang"}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <HiMiniMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text"
                placeholder="Guruh qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all w-64"
              />
            </div>
            {!isTeacher && (
              <button
                onClick={() => handleOpenDrawer()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ borderRadius: "20px" }}
              >
                <HiMiniPlus size={20} />
                Yangi guruh qo'shish
              </button>
            )}
          </div>
        </div>

        {/* Groups List */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Guruhlar ro'yxati
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {isTeacher
                  ? "Sizga biriktirilgan guruhlar va ularning ma'lumotlari"
                  : "Barcha guruhlar va ularning ma'lumotlari"}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                {totalGroups} ta guruh
              </span>
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                {activeGroups} ta faol
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={120}
                    className="rounded-xl"
                  />
                ))}
              </div>
            ) : visibleGroups.length === 0 ? (
              <div className="p-12 text-center">
                <HiMiniUserGroup size={64} className="mx-auto text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mt-3">
                  {isTeacher ? "Sizga hali guruh biriktirilmagan" : "Guruh topilmadi"}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {isTeacher
                    ? "Admin teacher profilingizga guruh biriktirgandan keyin shu yerda ko'rinadi"
                    : "Yangi guruh yaratish uchun yuqoridagi tugmani bosing"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {visibleGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    studentCount={studentCounts.get(group.id) ?? 0}
                    canManage={!isTeacher}
                    onEdit={() => handleOpenDrawer(group.id)}
                    onDelete={() => setGroupToDelete(group)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group Form Drawer */}
      {!isTeacher && (
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={handleCloseDrawer}
          slotProps={{
            paper: {
              sx: {
                width: { xs: "100%", sm: 580, md: 640 },
                borderRadius: { xs: 0, sm: "32px 0 0 32px" },
              },
            },
          }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 48,
                      height: 48,
                    }}
                  >
                    {selectedGroup ? (
                      <HiMiniPencilSquare size={24} />
                    ) : (
                      <HiMiniPlus size={24} />
                    )}
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-black">
                      {selectedGroup
                        ? "Guruhni tahrirlash"
                        : "Yangi guruh qo'shish"}
                    </h3>
                    <p className="text-sm opacity-90 mt-0.5">
                      {selectedGroup
                        ? selectedGroup.name
                        : "Guruh ma'lumotlarini to'ldiring"}
                    </p>
                  </div>
                </div>
                <IconButton onClick={handleCloseDrawer} sx={{ color: "white" }}>
                  <HiMiniXMark size={20} />
                </IconButton>
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <form
                onSubmit={handleSubmit(handleSubmitGroup)}
                className="space-y-5"
              >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Guruh nomi"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        marginBottom: 2,
                      },
                    }}
                  />
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="course_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kurs"
                      select
                      fullWidth
                      error={!!errors.course_id}
                      helperText={errors.course_id?.message}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          marginBottom: 2,
                        },
                      }}
                    >
                      {courses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          {course.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name="teacher_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Teacher"
                      select
                      fullWidth
                      error={!!errors.teacher_id}
                      helperText="Teacher tanlash ixtiyoriy"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          marginBottom: 2,
                        },
                      }}
                    >
                      <MenuItem value="">Biriktirilmagan</MenuItem>
                      {teachers.map((teacher) => (
                        <MenuItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="room_mode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Xona qo'shish usuli"
                      select
                      fullWidth
                      helperText="Shu oynaning o'zida yangi xona kiritishingiz mumkin"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          marginBottom: 2,
                        },
                      }}
                    >
                      <MenuItem value="existing">Bor xonadan tanlash</MenuItem>
                      <MenuItem value="new">Yangi xona kiritish</MenuItem>
                    </TextField>
                  )}
                />
              </div>

              {roomMode === "existing" ? (
                <Controller
                  name="room_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Xona"
                      select
                      fullWidth
                      error={!!errors.room_id}
                      helperText={
                        errors.room_id?.message ||
                        (rooms.length > 0
                          ? "Bor xonalardan bittasini tanlang yoki yuqoridan yangi xona yarating"
                          : "Ro'yxat bo'sh. Yuqoridan 'Yangi xona kiritish'ni tanlang")
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          marginBottom: 2,
                        },
                      }}
                    >
                      <MenuItem value="">Biriktirilmagan</MenuItem>
                      {rooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                          {room.name} ({room.capacity} ta joy)
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="mb-3 text-sm font-semibold text-emerald-800">
                    Yangi xona shu guruhni yaratish paytida avtomatik saqlanadi
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Controller
                      name="new_room_name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Yangi xona nomi"
                          fullWidth
                          error={!!errors.new_room_name}
                          helperText={errors.new_room_name?.message || "Masalan: A-101"}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "14px",
                              marginBottom: 2,
                            },
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="new_room_capacity"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Sig'imi"
                          type="number"
                          fullWidth
                          error={!!errors.new_room_capacity}
                          helperText={errors.new_room_capacity?.message || "Nechta joy bor"}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "14px",
                              marginBottom: 2,
                            },
                          }}
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name="new_room_location_note"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Joylashuvi"
                        fullWidth
                        error={!!errors.new_room_location_note}
                        helperText={errors.new_room_location_note?.message || "Masalan: 2-qavat, o'ng yo'lak"}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "14px",
                          },
                        }}
                      />
                    )}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="monthly_fee"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kurs oylik to'lovi"
                      type="number"
                      fullWidth
                      disabled
                      error={!!errors.monthly_fee}
                      helperText={
                        errors.monthly_fee?.message ||
                        (selectedCourseForForm
                          ? `${selectedCourseForForm.name} kursidan avtomatik olinadi`
                          : "Avval kurs tanlang")
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          marginBottom: 2,
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="start_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Boshlanish sanasi"
                      type="date"
                      fullWidth
                      error={!!errors.start_date}
                      helperText={errors.start_date?.message}
                      sx={{
                        marginBottom: 2,
                        "& .MuiOutlinedInput-root": { borderRadius: "14px" },
                        "& .MuiInputLabel-root": {
                          backgroundColor: "white",
                          paddingRight: "4px",
                          paddingLeft: "4px",
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="end_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tugash sanasi"
                      type="date"
                      fullWidth
                      error={!!errors.end_date}
                      helperText={errors.end_date?.message || "Ixtiyoriy"}
                      sx={{
                        marginBottom: 2,
                        "& .MuiOutlinedInput-root": { borderRadius: "14px" },
                        "& .MuiInputLabel-root": {
                          backgroundColor: "white",
                          paddingRight: "4px",
                          paddingLeft: "4px",
                        },
                      }}
                    />
                  )}
                />
                 <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Holati"
                    select
                    fullWidth
                    error={!!errors.status}
                    helperText={errors.status?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        marginBottom: 2,
                      },
                    }}
                  >
                    {Object.entries(statusLabels).map(([value, { label }]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              </div>


              <Controller
                name="schedule_summary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Jadval qisqacha"
                    fullWidth
                    error={!!errors.schedule_summary}
                    helperText={
                      errors.schedule_summary?.message ||
                      "Masalan: Du-Chor-Juma 14:00"
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "14px" },
                    }}
                  />
                )}
              />

              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Izoh"
                    multiline
                    rows={3}
                    fullWidth
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        marginBottom: 2,
                      },
                    }}
                  />
                )}
              />

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 flex items-center gap-2">
                <HiMiniInformationCircle size={18} />
                Guruh kursga bog'langan, shuning uchun oylik to'lov ham kursning standart narxidan olinadi
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  fullWidth
                  sx={{
                    borderRadius: "14px",
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "#10b981",
                    "&:hover": { bgcolor: "#059669" },
                  }}
                >
                  {isSubmitting
                    ? "Saqlanmoqda..."
                    : selectedGroup
                      ? "Yangilash"
                      : "Yaratish"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedGroupId(null);
                    reset(initialGroupForm());
                  }}
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
            </div>
          </div>
        </Drawer>
      )}

      {!isTeacher && (
        <ConfirmActionDialog
          open={Boolean(groupToDelete)}
          title="Guruhni o'chirish"
          description={
            groupToDelete
              ? `${groupToDelete.name} guruhini o'chirmoqchimisiz?`
              : ""
          }
          confirmText="Ha, o'chirish"
          cancelText="Yo'q"
          loading={isDeletingGroup}
          tone="danger"
          onClose={() => setGroupToDelete(null)}
          onConfirm={handleDeleteGroup}
        />
      )}
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
    teal: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
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

function GroupCard({
  group,
  studentCount,
  canManage,
  onEdit,
  onDelete,
}: {
  group: Group;
  studentCount: number;
  canManage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusInfo = statusLabels[group.status];

  return (
    <div className="p-5 hover:bg-emerald-50/20 transition-all duration-200">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Group Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-2xl font-black shadow-md">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {group.name}
                </h3>
                <Chip
                  label={statusInfo.label}
                  size="small"
                  icon={statusInfo.icon}
                  className={`!${statusInfo.color} !rounded-full`}
                />
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <HiMiniAcademicCap size={14} />
                  <span>{group.course?.name || "Kurs tanlanmagan"}</span>
                </div>
                {group.teacher?.full_name && (
                  <div className="flex items-center gap-1">
                    <HiMiniUserGroup size={14} />
                    <span>Teacher: {group.teacher.full_name}</span>
                  </div>
                )}
                {group.room?.name && (
                  <div className="flex items-center gap-1">
                    <HiMiniMapPin size={14} />
                    <span>Xona: {group.room.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 ml-[72px] space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <HiMiniCalendar size={14} />
                <span>Boshlanish: {group.start_date}</span>
              </div>
              {group.end_date && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <HiMiniCalendar size={14} />
                  <span>Tugash: {group.end_date}</span>
                </div>
              )}
              {group.schedule_summary && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <HiMiniClock size={14} />
                  <span>Jadval: {group.schedule_summary}</span>
                </div>
              )}
              {group.room && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <HiMiniMapPin size={14} />
                  <span>
                    Xona: {group.room.name} ({group.room.capacity} ta joy)
                    {group.room.location_note ? `, ${group.room.location_note}` : ""}
                  </span>
                </div>
              )}
              {group.notes && (
                <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <span className="font-semibold">Izoh:</span> {group.notes}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 ml-[72px] text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            {isExpanded ? "Yopish" : "Ko'proq ma'lumot"}
          </button>
        </div>

        {/* Stats and Actions */}
        <div className="lg:w-1/3">
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <HiMiniUsers size={16} />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Studentlar
                </span>
              </div>
              <span className="text-xl font-black text-slate-900">
                {studentCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <HiMiniCurrencyDollar size={16} />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Kurs oylik to'lovi
                </span>
              </div>
              <span className="text-xl font-black text-slate-900">
                {Number(group.course?.default_monthly_fee ?? group.monthly_fee).toLocaleString()} so'm
              </span>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Link
              to={`/admin/groups/${group.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
            >
              <HiMiniArrowRight size={16} />
              Jurnal
            </Link>
            {canManage && (
              <>
                <Tooltip title="Tahrirlash">
                  <button
                    onClick={onEdit}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all"
                  >
                    <HiMiniPencilSquare size={18} />
                  </button>
                </Tooltip>
                <Tooltip title="O'chirish">
                  <button
                    onClick={onDelete}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                  >
                    <HiMiniTrash size={18} />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminGroups;
