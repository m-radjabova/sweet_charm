import { Chip } from "@mui/material";
import {
  HiMiniUsers,
  HiMiniUserGroup,
  HiMiniChartBar,
  HiMiniCreditCard,
  HiMiniAcademicCap,
  HiMiniCheckCircle,
  HiMiniClock,
  HiMiniStar,
  HiMiniPresentationChartLine,
  HiMiniBookOpen,
} from "react-icons/hi2";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import useContextPro from "../../hooks/useContextPro";
import useCourses from "../../hooks/useCourses";
import useGroups from "../../hooks/useGroups";
import useStudents from "../../hooks/useStudents";
import usePayments from "../../hooks/usePayments";
import IsLoading from "../../components/IsLoading";

const statsConfig = [
  {
    key: "students",
    label: "Jami Studentlar",
    icon: HiMiniUsers,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    suffix: "ta",
  },
  {
    key: "groups",
    label: "Faol Guruhlar",
    icon: HiMiniUserGroup,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    suffix: "ta",
  },
  {
    key: "courses",
    label: "Kurslar",
    icon: HiMiniChartBar,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    suffix: "ta",
  },
  {
    key: "income",
    label: "Tushum",
    icon: HiMiniCreditCard,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    suffix: "so'm",
  },
] as const;

type StatKey = (typeof statsConfig)[number]["key"];

const COLORS = {
  planned: "#f59e0b",
  active: "#10b981",
  finished: "#64748b",
  archived: "#8b5cf6",
};

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#14b8a6",
  "#6366f1",
];

type MonthlyStatsItem = {
  key: string;
  month: string;
  monthFull: string;
  students: number;
  groups: number;
  payments: number;
};

type TooltipPayloadItem = {
  color?: string;
  name?: string;
  value?: number | string;
  dataKey?: string;
  payload?: Record<string, unknown>;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (value: number | string, name: string) => string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(value));
}

function parseAmount(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function getMonthKey(dateString?: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getLastMonths(count = 6) {
  const shortMonthNames = [
    "Yan",
    "Fev",
    "Mar",
    "Apr",
    "May",
    "Iyun",
    "Iyul",
    "Avg",
    "Sen",
    "Okt",
    "Noy",
    "Dek",
  ];
  const fullMonthNames = [
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

  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: shortMonthNames[date.getMonth()],
      fullLabel: `${fullMonthNames[date.getMonth()]} ${date.getFullYear()}`,
    };
  });
}

function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const displayLabel =
    typeof payload[0]?.payload?.monthFull === "string"
      ? String(payload[0]?.payload?.monthFull)
      : label;

  return (
    <div className="min-w-[180px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
      <p className="mb-2 text-sm font-bold text-slate-900">{displayLabel}</p>

      <div className="space-y-2">
        {payload.map((entry, index) => {
          const name = entry.name ?? "";
          const rawValue = entry.value ?? 0;
          const displayValue = formatter ? formatter(rawValue, name) : String(rawValue);

          return (
            <div key={`${name}-${index}`} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color ?? "#94a3b8" }}
                />
                <span className="text-xs font-medium text-slate-600">{name}</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HelloAdmin() {
  const { state } = useContextPro();
  const { students, loading: studentsLoading } = useStudents();
  const { groups, loading: groupsLoading } = useGroups();
  const { courses, loading: coursesLoading } = useCourses();
  const { payments, loading: paymentsLoading } = usePayments({});

  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour < 12) setGreeting("Xayrli tong");
      else if (hour < 18) setGreeting("Xayrli kun");
      else setGreeting("Xayrli kech");

      setCurrentTime(
        now.toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 60000);

    return () => clearInterval(timer);
  }, []);

  const activeGroups = groups.filter((g) => g.status === "active").length;
  const finishedGroups = groups.filter((g) => g.status === "finished").length;
  const plannedGroups = groups.filter((g) => g.status === "planned").length;
  const archivedGroups = groups.filter((g) => g.status === "archived").length;

  const totalIncome = useMemo(() => {
    return payments.reduce((sum, payment) => sum + parseAmount(payment.amount), 0);
  }, [payments]);

  const recentStudents = useMemo(() => {
    return [...students]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5);
  }, [students]);

  const monthlyData = useMemo<MonthlyStatsItem[]>(() => {
    const months = getLastMonths(6);

    const monthMap = new Map(
      months.map((item) => [
        item.key,
        {
          key: item.key,
          month: item.label,
          monthFull: item.fullLabel,
          students: 0,
          groups: 0,
          payments: 0,
        },
      ]),
    );

    students.forEach((student) => {
      const key = getMonthKey(student.created_at);
      if (key && monthMap.has(key)) {
        monthMap.get(key)!.students += 1;
      }
    });

    groups.forEach((group) => {
      const key = getMonthKey(group.created_at);
      if (key && monthMap.has(key)) {
        monthMap.get(key)!.groups += 1;
      }
    });

    payments.forEach((payment) => {
      const key = getMonthKey(payment.month_for || payment.paid_at || payment.created_at);
      if (key && monthMap.has(key)) {
        monthMap.get(key)!.payments += parseAmount(payment.amount);
      }
    });

    return months.map((item) => monthMap.get(item.key)!);
  }, [students, groups, payments]);

  const studentGrowthData = useMemo(() => {
    let runningTotal = 0;

    return monthlyData.map((item) => {
      runningTotal += item.students;
      return {
        month: item.month,
        monthFull: item.monthFull,
        count: runningTotal,
      };
    });
  }, [monthlyData]);

  const paymentsBarData = useMemo(() => {
    return monthlyData.map((item) => ({
      month: item.month,
      monthFull: item.monthFull,
      payments: item.payments,
    }));
  }, [monthlyData]);

  const courseDistributionData = useMemo(() => {
    const countMap = new Map<string, number>();

    groups.forEach((group) => {
      const courseName = group.course?.name || "Noma'lum kurs";
      countMap.set(courseName, (countMap.get(courseName) ?? 0) + 1);
    });

    return Array.from(countMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [groups]);

  const groupStatusData = [
    { name: "Rejada", value: plannedGroups, color: COLORS.planned },
    { name: "Faol", value: activeGroups, color: COLORS.active },
    { name: "Tugagan", value: finishedGroups, color: COLORS.finished },
    { name: "Arxiv", value: archivedGroups, color: COLORS.archived },
  ].filter((item) => item.value > 0);

  const completionRate = useMemo(() => {
    if (groups.length === 0) return 0;
    return Math.round((activeGroups / groups.length) * 100);
  }, [activeGroups, groups.length]);

  const inactiveGroupsCount = groups.length - activeGroups;

  const stats: Record<StatKey, number> = {
    students: students.length,
    groups: activeGroups,
    courses: courses.length,
    income: totalIncome,
  };

  const isLoading =
    studentsLoading || groupsLoading || coursesLoading || paymentsLoading;

  if (isLoading) return <IsLoading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 lg:p-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
          <div className="absolute right-0 top-0 h-80 w-80 opacity-5">
            <HiMiniUsers size={350} />
          </div>
          <div className="absolute bottom-0 left-0 h-60 w-60 opacity-5">
            <HiMiniAcademicCap size={250} />
          </div>

          <div className="relative px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
            <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <Chip
                    label="ADMIN DASHBOARD"
                    className="!bg-white/20 !text-xs !font-bold !text-white"
                    size="small"
                  />
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <HiMiniClock size={14} />
                    <span>{currentTime}</span>
                  </div>
                </div>

                <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {greeting}, <br />
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {state.user?.full_name ?? "Admin"}!
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Bugungi statistikalar, guruhlar holati va o‘quv jarayonini bir joydan kuzatib boring
                </p>
              </div>

              <div className="grid min-w-[280px] grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-slate-300">Email</p>
                  <p className="mt-2 truncate text-sm font-semibold">
                    {state.user?.email || "admin@example.com"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-wider text-slate-300">Holat</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <p className="text-sm font-semibold capitalize">
                      {state.user?.status ?? "active"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statsConfig.map((item) => {
            const Icon = item.icon;
            const isMoney = item.key === "income";

            return (
              <div
                key={item.key}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br ${item.color} translate-x-16 -translate-y-16 opacity-0 transition-all duration-500 group-hover:opacity-5`}
                />

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        {item.label}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <p className="truncate text-3xl font-black text-slate-900 lg:text-4xl">
                          {isMoney ? formatMoney(stats[item.key]) : stats[item.key]}
                        </p>
                        {item.suffix && (
                          <span className="text-sm font-medium text-slate-500">
                            {item.suffix}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`rounded-2xl p-3 transition-transform duration-300 group-hover:scale-110 ${item.bgColor} ${item.textColor}`}
                    >
                      <Icon className="text-2xl" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Student + group monthly chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Oylik statistika</h3>
                <p className="mt-1 text-sm text-slate-500">
                  So‘nggi 6 oy bo‘yicha student va guruhlar statistikasi
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <HiMiniPresentationChartLine className="text-2xl text-blue-600" />
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={(value, name) => {
                        if (name === "Studentlar" || name === "Guruhlar") return String(value);
                        return String(value);
                      }}
                    />
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  name="Studentlar"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="groups"
                  name="Guruhlar"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Group status pie */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Guruhlar holati</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Barcha guruhlarning statusi
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                <HiMiniChartBar className="text-2xl text-indigo-600" />
              </div>
            </div>

            {groupStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={groupStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                  >
                    {groupStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <CustomTooltip
                        formatter={(value) => `${value} ta`}
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-slate-400">
                <p>Ma'lumot mavjud emas</p>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              {groupStatusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New chart row */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Payments bar chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md xl:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Oylik to‘lovlar</h3>
                <p className="mt-1 text-sm text-slate-500">
                  So‘nggi 6 oy bo‘yicha tushum statistikasi
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <HiMiniCreditCard className="text-2xl text-purple-600" />
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={paymentsBarData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis
                  stroke="#64748b"
                  tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={(value) => `${formatMoney(Number(value))} so'm`}
                    />
                  }
                />
                <Legend />
                <Bar
                  dataKey="payments"
                  name="To'lovlar"
                  fill="#8b5cf6"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Kurslar bo‘yicha guruhlar</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Har bir kursdagi guruhlar soni
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <HiMiniBookOpen className="text-2xl text-amber-600" />
              </div>
            </div>

            {courseDistributionData.length > 0 ? (
              <div className="space-y-3">
                {courseDistributionData.map((item, index) => {
                  const maxValue = courseDistributionData[0]?.value || 1;
                  const widthPercent = Math.max((item.value / maxValue) * 100, 10);

                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="truncate text-sm font-medium text-slate-700">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{item.value}</span>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-400">#{index + 1} kurs</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-slate-400">
                <p>Ma'lumot mavjud emas</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Growth chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student growth</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Umumiy o‘sish dinamikasi
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <HiMiniPresentationChartLine className="text-2xl text-emerald-600" />
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={studentGrowthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip
                  content={
                    <CustomTooltip
                      formatter={(value) => `${value} ta`}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Jami student"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Activity card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Guruhlar faolligi</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Faol va nofaol guruhlar ulushi
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <HiMiniChartBar className="text-2xl text-emerald-600" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-600">Faol guruhlar</span>
                  <span className="font-semibold text-slate-900">
                    {activeGroups} / {groups.length}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-center">
                <HiMiniCheckCircle className="mx-auto mb-1 text-lg text-emerald-600" />
                <p className="text-2xl font-black text-emerald-800">{completionRate}%</p>
                <p className="text-xs text-emerald-600">Faollik</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-center">
                <HiMiniClock className="mx-auto mb-1 text-lg text-amber-600" />
                <p className="text-2xl font-black text-amber-800">{inactiveGroupsCount}</p>
                <p className="text-xs text-amber-600">Nofaol</p>
              </div>
            </div>
          </div>

          {/* Recent students */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">So‘nggi studentlar</h3>
                <p className="mt-1 text-sm text-slate-500">Eng so‘nggi 5 ta student</p>
              </div>
              <Link
                to="/admin/students"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Hammasi
              </Link>
            </div>

            <div className="space-y-3">
              {recentStudents.length === 0 ? (
                <div className="py-8 text-center">
                  <HiMiniUsers className="mx-auto mb-2 text-4xl text-slate-300" />
                  <p className="text-sm text-slate-500">Hali student qo‘shilmagan</p>
                </div>
              ) : (
                recentStudents.map((student, idx) => (
                  <div
                    key={student.id}
                    className="group flex items-center gap-3 rounded-xl p-3 transition-all hover:bg-slate-50"
                  >
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white shadow-md">
                        {student.full_name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{student.full_name}</p>
                      <p className="truncate text-xs text-slate-500">{student.email}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">#{idx + 1}</p>
                    </div>

                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <HiMiniStar className="text-amber-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelloAdmin;
