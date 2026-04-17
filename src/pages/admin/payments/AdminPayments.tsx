import { useEffect, useMemo, useState, type JSX } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Chip, Drawer, IconButton, Skeleton } from "@mui/material";
import {
  HiMiniArrowPath,
  HiMiniBanknotes,
  HiMiniCheckCircle,
  HiMiniClock,
  HiMiniCreditCard,
  HiMiniMagnifyingGlass,
  HiMiniPencilSquare,
  HiMiniPlus,
  HiMiniReceiptPercent,
  HiMiniXMark,
  HiMiniWallet
} from "react-icons/hi2";
import { listGroupEnrollments } from "../../../api/students";
import useCourses from "../../../hooks/useCourses";
import useGroups from "../../../hooks/useGroups";
import usePayments from "../../../hooks/usePayments";
import type {
  Enrollment,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "../../../types/types";

type PaymentFormState = {
  group_id: string;
  student_id: string;
  amount: string;
  month_for: string;
  paid_at: string;
  method: PaymentMethod;
  status: PaymentStatus;
  note: string;
};

const paymentFormSchema = z.object({
  group_id: z.string().min(1, "Guruhni tanlang"),
  student_id: z.string().min(1, "Studentni tanlang"),
  amount: z
    .string()
    .trim()
    .refine(
      (value) =>
        value !== "" && !Number.isNaN(Number(value)) && Number(value) >= 0,
      "To'lov summasi noto'g'ri",
    ),
  month_for: z.string().min(1, "Oy tanlang"),
  paid_at: z.string().min(1, "To'lov sanasini kiriting"),
  method: z.enum(["cash", "card"]),
  status: z.enum(["pending", "paid"]),
  note: z.string().trim().max(1000, "Izoh juda uzun"),
});

const paymentStatusMeta: Record<
  PaymentStatus,
  { label: string; className: string; icon: JSX.Element }
> = {
  pending: {
    label: "Kutilmoqda",
    className: "bg-amber-100 text-amber-700",
    icon: <HiMiniClock size={12} />,
  },
  paid: {
    label: "To'langan",
    className: "bg-emerald-100 text-emerald-700",
    icon: <HiMiniCheckCircle size={12} />,
  },
};

const paymentMethodLabels: Record<
  PaymentMethod,
  { label: string; icon: JSX.Element }
> = {
  cash: { label: "Naqd", icon: <HiMiniWallet size={14} /> },
  card: { label: "Karta", icon: <HiMiniCreditCard size={14} /> },
};

const initialPaymentForm = (): PaymentFormState => ({
  group_id: "",
  student_id: "",
  amount: "",
  month_for: new Date().toISOString().slice(0, 7),
  paid_at: toDateTimeLocalValue(new Date().toISOString()),
  method: "cash",
  status: "paid",
  note: "",
});

function formatMoney(value: number | string) {
  const numericValue = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("uz-UZ").format(
    Number.isFinite(numericValue) ? numericValue : 0,
  );
}

function parseMoney(value: number | string) {
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );
  return localDate.toISOString().slice(0, 16);
}

function normalizeMonthFor(value: string) {
  return `${value}-01`;
}

function AdminPayments() {
  const { groups, loading: groupsLoading } = useGroups();
  const { courses, loading: coursesLoading } = useCourses();
  const {
    payments,
    loading: paymentsLoading,
    isFetching,
    createPayment,
    updatePayment,
    creatingPayment,
    updatingPayment,
  } = usePayments({});

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    "all" | PaymentStatus
  >("all");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormState>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: initialPaymentForm(),
  });

  const selectedGroupId = watch("group_id");
  const selectedStudentId = watch("student_id");
  const selectedMonthFor = watch("month_for");

  const enrollmentsQuery = useQuery({
    queryKey: ["group-enrollments", selectedGroupId ?? "none", "payments"],
    queryFn: () => listGroupEnrollments(selectedGroupId),
    enabled: Boolean(selectedGroupId),
  });

  const groupsMap = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups],
  );
  const coursesMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );

  const activeEnrollments = useMemo(
    () =>
      (enrollmentsQuery.data ?? []).filter(
        (enrollment) => enrollment.status === "active",
      ),
    [enrollmentsQuery.data],
  );

  const studentSelectEnrollments = useMemo(() => {
    if (!editingPayment) return activeEnrollments;

    const currentPaymentEnrollment = (enrollmentsQuery.data ?? []).find(
      (enrollment) => enrollment.student_id === editingPayment.student_id,
    );

    if (!currentPaymentEnrollment) return activeEnrollments;

    const alreadyIncluded = activeEnrollments.some(
      (enrollment) => enrollment.student_id === currentPaymentEnrollment.student_id,
    );

    return alreadyIncluded
      ? activeEnrollments
      : [currentPaymentEnrollment, ...activeEnrollments];
  }, [activeEnrollments, editingPayment, enrollmentsQuery.data]);

  const selectedGroup = selectedGroupId
    ? groupsMap.get(selectedGroupId)
    : undefined;
  const selectedCourse = selectedGroup ? coursesMap.get(selectedGroup.course_id) : undefined;
  const resolvedCourseFee = useMemo(
    () => (selectedCourse && selectedMonthFor ? getCourseFeeForMonth(selectedCourse, selectedMonthFor) : null),
    [selectedCourse, selectedMonthFor],
  );

  useEffect(() => {
    if (!selectedGroup || !selectedMonthFor || editingPayment) return;
    setValue("amount", String(resolvedCourseFee ?? selectedGroup.monthly_fee));
  }, [editingPayment, resolvedCourseFee, selectedGroup, selectedMonthFor, setValue]);

  useEffect(() => {
    if (!selectedStudentId) return;
    const hasEnrollment = studentSelectEnrollments.some(
      (enrollment) => enrollment.student_id === selectedStudentId,
    );
    if (!hasEnrollment) {
      setValue("student_id", "");
    }
  }, [selectedStudentId, setValue, studentSelectEnrollments]);

  const filteredPayments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      const group = groupsMap.get(payment.group_id);
      const matchesGroup =
        selectedGroupFilter === "all" ||
        payment.group_id === selectedGroupFilter;
      const matchesStatus =
        selectedStatusFilter === "all" ||
        payment.status === selectedStatusFilter;
      const matchesTerm =
        !term ||
        [
          payment.student?.full_name,
          payment.student?.email,
          group?.name,
          group?.course?.name,
          payment.note,
          payment.method,
          payment.status,
          String(payment.amount),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));

      return matchesGroup && matchesStatus && matchesTerm;
    });
  }, [
    groupsMap,
    payments,
    searchTerm,
    selectedGroupFilter,
    selectedStatusFilter,
  ]);

  const totalPaidAmount = useMemo(
    () =>
      filteredPayments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + parseMoney(payment.amount), 0),
    [filteredPayments],
  );

  const pendingAmount = useMemo(
    () =>
      filteredPayments
        .filter((payment) => payment.status === "pending")
        .reduce((sum, payment) => sum + parseMoney(payment.amount), 0),
    [filteredPayments],
  );

  const pendingPaymentsCount = useMemo(
    () =>
      filteredPayments.filter((payment) => payment.status === "pending").length,
    [filteredPayments],
  );

  const handleOpenCreateDrawer = () => {
    setEditingPayment(null);
    reset(initialPaymentForm());
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (payment: Payment) => {
    setEditingPayment(payment);
    reset({
      group_id: payment.group_id,
      student_id: payment.student_id,
      amount: String(payment.amount),
      month_for: payment.month_for.slice(0, 7),
      paid_at: toDateTimeLocalValue(payment.paid_at),
      method: payment.method,
      status: payment.status,
      note: payment.note ?? "",
    });
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingPayment(null);
    reset(initialPaymentForm());
  };

  const handleSubmitPayment = handleSubmit(async (form) => {
    const matchedEnrollment =
      activeEnrollments.find(
        (enrollment) => enrollment.student_id === form.student_id,
      ) ??
      (enrollmentsQuery.data ?? []).find(
        (enrollment) => enrollment.student_id === form.student_id,
      );

    const payload = {
      group_id: form.group_id,
      student_id: form.student_id,
      enrollment_id: matchedEnrollment?.id ?? null,
      amount: Number(form.amount),
      month_for: normalizeMonthFor(form.month_for),
      paid_at: new Date(form.paid_at).toISOString(),
      method: form.method,
      status: form.status,
      note: form.note.trim() || null,
    };

    if (editingPayment) {
      await updatePayment(editingPayment.id, payload);
    } else {
      await createPayment(payload);
    }

    handleCloseDrawer();
  });

  if (paymentsLoading || groupsLoading || coursesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-cyan-50/10 p-4 lg:p-6">
        <div className="mx-auto max-w-[1600px] space-y-6 animate-pulse">
          <Skeleton variant="rounded" height={220} className="rounded-3xl" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={140}
                className="rounded-2xl"
              />
            ))}
          </div>
          <Skeleton variant="rounded" height={520} className="rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-cyan-50/10">
      <div className="mx-auto max-w-[1800px] space-y-6 p-4 lg:p-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-700 text-white">
          <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
            <HiMiniCreditCard size={350} />
          </div>
          <div className="absolute bottom-0 left-0 w-60 h-60 opacity-5">
            <HiMiniBanknotes size={250} />
          </div>
          <div className="relative px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
              <div className="max-w-2xl">
                <Chip
                  label="TO'LOV MARKAZI"
                  className="!mb-4 !bg-white/20 !text-white !font-bold !text-sm !py-1 !px-4"
                />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  To'lovlar
                </h1>
                <p className="mt-4 text-emerald-100 text-base sm:text-lg max-w-xl leading-relaxed">
                  Barcha to'lovlarni bir joydan kuzating, yangi to'lov qo'shing
                  va mavjud yozuvlarni yangilang
                </p>
              </div>

              <button
                onClick={handleOpenCreateDrawer}
                style={{borderRadius : "20px"}}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <HiMiniPlus size={20} />
                To'lov qo'shish
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    To'langan summa
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {formatMoney(totalPaidAmount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">so'm</p>
                </div>
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600 group-hover:scale-110 transition-transform">
                  <HiMiniBanknotes size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Kutilayotgan summa
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {formatMoney(pendingAmount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">so'm</p>
                </div>
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 group-hover:scale-110 transition-transform">
                  <HiMiniClock size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-red-500" />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    To'lanmaganlar
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {pendingPaymentsCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    pending statusdagi yozuvlar
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 group-hover:scale-110 transition-transform">
                  <HiMiniClock size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 to-blue-500" />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Jami tranzaksiyalar
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {filteredPayments.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    filtrlangan natija
                  </p>
                </div>
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-600 group-hover:scale-110 transition-transform">
                  <HiMiniReceiptPercent size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="border-b border-slate-200 p-5 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  TO'LOVLAR REESTRI
                </p>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  To'lovlar jadvali
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Student, guruh, status va summa bo'yicha barcha to'lovlar
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <HiMiniMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Student, guruh yoki izoh qidiring..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all w-full sm:w-64"
                  />
                </div>

                <select
                  value={selectedGroupFilter}
                  onChange={(e) => setSelectedGroupFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                >
                  <option value="all">Barcha guruhlar</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) =>
                    setSelectedStatusFilter(
                      e.target.value as "all" | PaymentStatus,
                    )
                  }
                  className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all bg-white"
                >
                  <option value="all">Barcha statuslar</option>
                  <option value="pending">To'lanmagan</option>
                  <option value="paid">To'langan</option>
                </select>
              </div>
            </div>
          </div>

          {isFetching && (
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <HiMiniArrowPath className="animate-spin" />
                To'lovlar ro'yxati yangilanmoqda...
              </div>
            </div>
          )}

          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <HiMiniCreditCard size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                To'lov topilmadi
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Filtrlarni o'zgartiring yoki yangi to'lov qo'shing
              </p>
              <button
                onClick={handleOpenCreateDrawer}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all"
              >
                <HiMiniPlus size={16} />
                Birinchi to'lovni qo'shish
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-left text-slate-500 text-sm">
                    <th className="px-5 py-4 font-semibold">Student</th>
                    <th className="px-5 py-4 font-semibold">Guruh</th>
                    <th className="px-5 py-4 font-semibold">Oy</th>
                    <th className="px-5 py-4 font-semibold">Summa</th>
                    <th className="px-5 py-4 font-semibold">Usul</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">To'langan vaqti</th>
                    <th className="px-5 py-4 font-semibold text-center">
                      Amal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment, idx) => {
                    const group = groupsMap.get(payment.group_id);
                    const statusInfo = paymentStatusMeta[payment.status];
                    const methodInfo = paymentMethodLabels[payment.method];

                    return (
                      <tr
                        key={payment.id}
                        className={`hover:bg-emerald-50/30 transition-all ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold shadow-md">
                              {payment.student?.full_name
                                ?.charAt(0)
                                .toUpperCase() || "S"}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {payment.student?.full_name || "Student"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {payment.student?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {group?.name || "Guruh topilmadi"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {group?.course?.name || "Kurs topilmadi"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {new Date(payment.paid_at).toLocaleDateString(
                                "uz-UZ",
                              )}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(payment.paid_at).toLocaleTimeString(
                                "uz-UZ",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-emerald-600">
                            {formatMoney(payment.amount)} so'm
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-sm text-slate-700">
                            {methodInfo.icon}
                            {methodInfo.label}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {new Date(payment.paid_at).toLocaleString("uz-UZ")}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleOpenEditDrawer(payment)}
                            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 transition-all"
                          >
                            <HiMiniPencilSquare size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Form Drawer */}
        <Drawer anchor="right" open={isDrawerOpen} onClose={handleCloseDrawer}>
          <div className="h-full flex flex-col w-full sm:w-[560px]">
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    {editingPayment ? (
                      <HiMiniPencilSquare size={24} />
                    ) : (
                      <HiMiniPlus size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">
                      {editingPayment ? "To'lovni tahrirlash" : "Yangi to'lov"}
                    </h3>
                    <p className="text-sm opacity-90 mt-0.5">
                      {editingPayment
                        ? "To'lov ma'lumotlarini o'zgartiring"
                        : "Student to'lov ma'lumotlarini kiriting"}
                    </p>
                  </div>
                </div>
                <IconButton onClick={handleCloseDrawer} sx={{ color: "white" }}>
                  <HiMiniXMark size={20} />
                </IconButton>
              </div>
            </div>

            <form
              onSubmit={handleSubmitPayment}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Guruh <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("group_id")}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.group_id
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-slate-200 focus:border-emerald-400"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all bg-white`}
                  >
                    <option value="">Guruh tanlang</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} - {group.course?.name}
                      </option>
                    ))}
                  </select>
                  {errors.group_id && (
                    <p className="mt-1 text-sm text-rose-600">
                      {errors.group_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Student <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("student_id")}
                    disabled={
                      !selectedGroupId ||
                      enrollmentsQuery.isLoading ||
                      studentSelectEnrollments.length === 0
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.student_id
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-slate-200 focus:border-emerald-400"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all bg-white disabled:bg-slate-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">Student tanlang</option>
                    {studentSelectEnrollments.map((enrollment: Enrollment) => (
                      <option key={enrollment.id} value={enrollment.student_id}>
                        {enrollment.student.full_name}
                      </option>
                    ))}
                  </select>
                  {errors.student_id && (
                    <p className="mt-1 text-sm text-rose-600">
                      {errors.student_id.message}
                    </p>
                  )}
                  {selectedGroupId && studentSelectEnrollments.length === 0 && (
                    <p className="mt-1 text-sm text-amber-600">
                      Bu guruhda faol student topilmadi
                    </p>
                  )}
                </div>

                {selectedGroup && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2">
                    <HiMiniCheckCircle className="text-emerald-600" />
                    <p className="text-sm text-emerald-800">
                      Tanlangan oy uchun kurs tarifi:{" "}
                      <strong>
                        {formatMoney(resolvedCourseFee ?? selectedGroup.monthly_fee)} so'm
                      </strong>
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      To'lov summasi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        so'm
                      </span>
                      <input
                        type="number"
                        {...register("amount")}
                        className={`w-full pl-14 pr-4 py-2.5 rounded-xl border ${
                          errors.amount
                            ? "border-rose-500 focus:border-rose-500"
                            : "border-slate-200 focus:border-emerald-400"
                        } focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all`}
                        placeholder="650000"
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-rose-600">
                        {errors.amount.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Oy <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="month"
                      {...register("month_for")}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.month_for
                          ? "border-rose-500 focus:border-rose-500"
                          : "border-slate-200 focus:border-emerald-400"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all`}
                    />
                    {errors.month_for && (
                      <p className="mt-1 text-sm text-rose-600">
                        {errors.month_for.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    To'langan vaqti <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...register("paid_at")}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.paid_at
                        ? "border-rose-500 focus:border-rose-500"
                        : "border-slate-200 focus:border-emerald-400"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all`}
                  />
                  {errors.paid_at && (
                    <p className="mt-1 text-sm text-rose-600">
                      {errors.paid_at.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      To'lov usuli
                    </label>
                    <select
                      {...register("method")}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                    >
                      <option value="cash">Naqd</option>
                      <option value="card">Karta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Status
                    </label>
                    <select
                      {...register("status")}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                    >
                      <option value="pending">To'lanmagan</option>
                      <option value="paid">To'langan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Izoh
                  </label>
                  <textarea
                    {...register("note")}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
                    placeholder="Qo'shimcha ma'lumot..."
                  />
                  {errors.note && (
                    <p className="mt-1 text-sm text-rose-600">
                      {errors.note.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 p-5 bg-white">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isSubmitting || creatingPayment || updatingPayment
                    }
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {editingPayment
                      ? updatingPayment || isSubmitting
                        ? "Saqlanmoqda..."
                        : "O'zgarishni saqlash"
                      : creatingPayment || isSubmitting
                        ? "Qo'shilmoqda..."
                        : "To'lovni qo'shish"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Drawer>
      </div>
    </div>
  );
}

export default AdminPayments;

function getCourseFeeForMonth(course: { default_monthly_fee: string; fee_histories?: { amount: string; effective_from: string }[] }, monthFor: string) {
  const targetMonth = `${monthFor}-01`;
  const history = [...(course.fee_histories ?? [])]
    .sort((a, b) => b.effective_from.localeCompare(a.effective_from))
    .find((item) => item.effective_from <= targetMonth);

  return Number(history?.amount ?? course.default_monthly_fee);
}
