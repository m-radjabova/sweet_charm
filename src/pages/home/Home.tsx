import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  HiMiniArrowRight, 
  HiMiniStar, 
  HiOutlineUser, 
  HiOutlineCalendar, 
  HiOutlineScissors,
  HiOutlineSparkles,
  HiOutlineClock,
  HiOutlineCheckBadge
} from "react-icons/hi2";
import { listPublicBarbers } from "../../api/bookings";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { formatDisplayDate, formatDisplayTime, getStoredConfirmedBooking } from "./bookingUtils";

function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8 rounded-xl",
    md: "h-10 w-10 rounded-2xl",
    lg: "h-20 w-20 rounded-2xl"
  };
  
  return (
    <div className={`${sizes[size]} relative flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg transition-all duration-300 hover:shadow-xl`}>
      <HiOutlineScissors className={size === "lg" ? "h-8 w-8" : "h-5 w-5"} strokeWidth={1.5} />
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getBarberAccent(seed: string) {
  const accents = [
    { icon: HiOutlineScissors, color: "from-amber-500 to-orange-500" },
    { icon: HiOutlineUser, color: "from-blue-500 to-cyan-500" },
    { icon: HiOutlineSparkles, color: "from-rose-500 to-pink-500" },
    { icon: HiOutlineCheckBadge, color: "from-emerald-500 to-teal-500" },
  ] as const;

  const hash = seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return accents[hash % accents.length];
}

// Skeleton Components
function BarberCardSkeleton() {
  return (
    <div className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="h-[76px] w-[76px] rounded-[22px] bg-gradient-to-br from-slate-200 to-slate-100"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 w-32 rounded-lg bg-slate-200"></div>
          <div className="h-4 w-24 rounded-lg bg-slate-200"></div>
          <div className="flex gap-4">
            <div className="h-4 w-16 rounded-lg bg-slate-200"></div>
            <div className="h-4 w-16 rounded-lg bg-slate-200"></div>
          </div>
        </div>
        <div className="h-12 w-12 rounded-full bg-slate-200"></div>
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="animate-pulse rounded-[36px] bg-white/50 p-6 shadow-lg sm:p-8">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-slate-200"></div>
        <div className="h-4 w-32 rounded bg-slate-200"></div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-12 w-64 rounded-lg bg-slate-200"></div>
        <div className="h-6 w-96 rounded-lg bg-slate-200"></div>
      </div>
      <div className="mt-8 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <BarberCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const confirmedBooking = getStoredConfirmedBooking();
  
  const barbersQuery = useQuery({
    queryKey: ["public-barbers"],
    queryFn: listPublicBarbers,
  });

  const barbers = useMemo(() => {
    return (barbersQuery.data ?? []).map((barber) => {
      const specialty = barber.specialty?.trim() || null;
      const accent = getBarberAccent(`${barber.id}-${barber.full_name}`);

      return {
        ...barber,
        specialty,
        specialtyIcon: accent.icon,
        specialtyColor: accent.color,
      };
    });
  }, [barbersQuery.data, t]);

  const isLoading = barbersQuery.isLoading;
  const hasBarbers = !isLoading && barbers.length > 0;

  return (
    <div className="home-theme min-h-screen overflow-hidden bg-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-amber-200/20 to-amber-100/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-l from-slate-200/20 to-slate-100/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-t from-amber-100/5 to-transparent blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Link to="/" className="group flex items-center gap-3 self-start transition-all hover:scale-[1.02]">
              <BrandMark />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400 sm:tracking-[0.35em]">{t("brand.name")}</p>
                <p className="hidden text-xs text-slate-500 sm:block">{t("home.brandSubtitle")}</p>
              </div>
            </Link>

            <div className="flex w-full justify-end lg:w-auto">
              <div className="flex w-full flex-wrap items-center justify-end gap-2 rounded-[28px] border border-white/70 bg-white/72 p-1.5 shadow-[0_16px_40px_rgba(148,163,184,0.18)] backdrop-blur-xl sm:w-auto sm:gap-2">
                <Link
                  to="/login"
                  className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white/80 px-5 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md"
                >
                  <span className="relative z-10">{t("home.barberLogin")}</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-slate-100 to-transparent transition-transform duration-300 group-hover:translate-x-0"></div>
                </Link>

                <Link
                  to="/login"
                  className="group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-5 text-sm font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-500/25"
                >
                  <span className="relative z-10">{t("home.adminPortal")}</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-0"></div>
                </Link>
                <LanguageSwitcher />

              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
        {confirmedBooking ? (
          <section className="mb-6 rounded-[28px] border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-sm sm:mb-8 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
                  {t("home.latestBooking")}
                </p>
                <p className="mt-1 text-lg font-black text-slate-950 sm:text-xl">
                  #{confirmedBooking.bookingCode}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {t("home.latestBookingHint", {
                    date: formatDisplayDate(confirmedBooking.date),
                    time: formatDisplayTime(confirmedBooking.time),
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/book/success/${confirmedBooking.bookingCode}`)}
                className="inline-flex h-12 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 hover:shadow-lg"
              >
                {t("home.openLatestBooking")}
              </button>
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
          {/* Hero Section */}
          <section className="relative">
            {isLoading ? (
              <HeroSkeleton />
            ) : (
              <div className="relative overflow-hidden rounded-[32px] bg-white/70 p-5 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl sm:p-8">
                {/* Decorative Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-transparent"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <BrandMark size="sm" />
                    <p className="text-xs font-bold uppercase tracking-[0.32em] text-amber-600">{t("home.experienceLabel")}</p>
                  </div>

                  <h1 className="mt-6 max-w-[12ch] text-4xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:max-w-none lg:text-6xl">
                    {t("home.heroTitleStart")}
                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"> {t("home.heroTitleAccent")}</span>
                  </h1>
                  
                  <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
                    {t("home.heroDescription")}
                  </p>

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:gap-6">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-100 p-1.5">
                        <HiOutlineClock className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">30+ Min</p>
                        <p className="text-xs text-slate-500">{t("home.stats.perSession")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-1.5">
                        <HiMiniStar className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">4.8 ★</p>
                        <p className="text-xs text-slate-500">{t("home.stats.customerRating")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-purple-100 p-1.5">
                        <HiOutlineUser className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">10+</p>
                        <p className="text-xs text-slate-500">{t("home.stats.expertBarbers")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Barbers Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">{t("home.ourBarbers")}</h2>
                <p className="text-sm text-slate-500">{t("home.chooseExpert")}</p>
              </div>
              {hasBarbers && (
                <div className="text-xs font-medium text-amber-600">
                  {t("home.availableCount", { count: barbers.length })}
                </div>
              )}
            </div>

            <div
              className={`space-y-4 ${
                barbers.length > 4
                  ? "custom-scrollbar max-h-[43rem] overflow-y-auto pr-2"
                  : ""
              }`}
            >
              {isLoading ? (
                <>
                  <BarberCardSkeleton />
                  <BarberCardSkeleton />
                  <BarberCardSkeleton />
                  <BarberCardSkeleton />
                </>
              ) : hasBarbers ? (
                barbers.map((barber, idx) => {
                  const SpecialtyIcon = barber.specialtyIcon;
                  const isHovered = hoveredCard === idx;
                  
                  return (
                    <div
                      key={barber.id}
                      className="group relative transform transition-all duration-300 hover:scale-[1.02]"
                      onMouseEnter={() => setHoveredCard(idx)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${barber.specialtyColor} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`}></div>
                      
                      <article
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate(`/book/${barber.id}`)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            navigate(`/book/${barber.id}`);
                          }
                        }}
                        className="relative flex cursor-pointer items-center gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 sm:gap-4 sm:p-5"
                      >
                        {/* Avatar */}
                        {barber.avatar ? (
                          <img 
                            src={barber.avatar} 
                            alt={barber.full_name} 
                            className="h-[72px] w-[72px] rounded-xl object-cover ring-2 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-[80px] sm:w-[80px]" 
                          />
                        ) : (
                          <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-gradient-to-br ${barber.specialtyColor} text-xl font-black text-white shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-[80px] sm:w-[80px]`}>
                            {getInitials(barber.full_name)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h2 className="truncate text-lg font-black text-slate-950 sm:text-xl">
                              {barber.full_name}
                            </h2>
                            {isHovered && (
                              <div className="animate-fadeIn">
                                <HiOutlineCheckBadge className="h-4 w-4 text-emerald-500" />
                              </div>
                            )}
                          </div>
                          
                          {barber.specialty ? (
                            <div className="mt-1 flex items-center gap-1.5">
                              <SpecialtyIcon className="h-3.5 w-3.5 text-amber-500" />
                              <p className="text-sm font-semibold text-slate-500">
                                {barber.specialty}
                              </p>
                            </div>
                          ) : null}
                          
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
                              <HiMiniStar className="text-sm text-amber-500" />
                              <span className="text-slate-700">{barber.average_rating.toFixed(1)}</span>
                              <span className="text-slate-400">({barber.reviews_count})</span>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                              <HiOutlineUser className="text-sm text-slate-500" />
                              <span className="text-slate-700">{t("home.bookingsCount", { count: barber.completed_bookings_count })}</span>
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/book/${barber.id}`}
                          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/25 group-hover:scale-110"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-full transition-transform duration-500 group-hover:translate-x-0"></div>
                          <HiMiniArrowRight className="relative z-10 text-xl transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>
                      </article>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-8 text-center backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full bg-slate-100 p-3">
                      <HiOutlineScissors className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-bold text-slate-950">{t("home.noBarbersTitle")}</p>
                    <p className="text-sm text-slate-500">
                      {t("home.noBarbersDescription")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Booking Tips */}
            {hasBarbers && (
              <div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-amber-100 p-2">
                    <HiOutlineCalendar className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t("home.bookingTips")}</p>
                    <p className="text-xs text-slate-600">
                      {t("home.bookingTip")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-3 text-sm font-semibold text-slate-400 sm:hidden">
              <Link to="/login" className="underline underline-offset-4 transition hover:text-slate-700">
                {t("home.barberLogin")}
              </Link>
              <span className="text-slate-300">|</span>
              <Link to="/login" className="underline underline-offset-4 transition hover:text-slate-700">
                {t("home.adminPortal")}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
