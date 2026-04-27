import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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

const specialities = [
  { name: "Fade & Line-ups", icon: HiOutlineScissors, color: "from-amber-500 to-orange-500" },
  { name: "Classic Cuts & Beard", icon: HiOutlineUser, color: "from-blue-500 to-cyan-500" },
  { name: "Modern Styles & Texture", icon: HiOutlineSparkles, color: "from-purple-500 to-pink-500" },
  { name: "Premium Grooming", icon: HiOutlineCheckBadge, color: "from-emerald-500 to-teal-500" },
] as const;

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  const barbersQuery = useQuery({
    queryKey: ["public-barbers"],
    queryFn: listPublicBarbers,
  });

  const barbers = useMemo(() => {
    return (barbersQuery.data ?? []).slice(0, 4).map((barber, index) => ({
      ...barber,
      speciality: specialities[index % specialities.length].name,
      specialityIcon: specialities[index % specialities.length].icon,
      specialityColor: specialities[index % specialities.length].color,
      experience: `${index + 3}+ years`,
      rating: (4.5 + (index * 0.1)).toFixed(1),
      reviews: Math.floor(Math.random() * 200) + 50,
    }));
  }, [barbersQuery.data]);

  const isLoading = barbersQuery.isLoading;
  const hasBarbers = !isLoading && barbers.length > 0;

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-amber-200/20 to-amber-100/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-l from-slate-200/20 to-slate-100/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-t from-amber-100/5 to-transparent blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="relative mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="group flex items-center gap-3 transition-transform hover:scale-105">
              <BrandMark />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400 sm:tracking-[0.35em]">Sharp Cuts</p>
                <p className="hidden text-xs text-slate-500 sm:block">Premium Barbershop</p>
              </div>
            </Link>

            <div className="hidden items-center gap-2 sm:flex sm:gap-3">
              <Link
                to="/login"
                className="group relative inline-flex h-10 items-center overflow-hidden rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition-all hover:border-slate-900 hover:text-slate-950"
              >
                <span className="relative z-10">Barber Login</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-slate-100 to-transparent transition-transform duration-300 group-hover:translate-x-0"></div>
              </Link>
              <Link
                to="/login"
                className="group relative inline-flex h-10 items-center overflow-hidden rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:shadow-slate-500/25"
              >
                <span className="relative z-10">Admin Portal</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-0"></div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
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
                    <p className="text-xs font-bold uppercase tracking-[0.32em] text-amber-600">Barber Experience</p>
                  </div>

                  <h1 className="mt-6 max-w-[12ch] text-4xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:max-w-none lg:text-6xl">
                    Book Your
                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"> Appointment</span>
                  </h1>
                  
                  <p className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg">
                    Experience the finest grooming service with our expert barbers. 
                    Choose your preferred stylist and book your appointment in seconds.
                  </p>

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:gap-6">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-100 p-1.5">
                        <HiOutlineClock className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">30+ Min</p>
                        <p className="text-xs text-slate-500">Per Session</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 p-1.5">
                        <HiMiniStar className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">4.8 ★</p>
                        <p className="text-xs text-slate-500">Customer Rating</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-purple-100 p-1.5">
                        <HiOutlineUser className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">10+</p>
                        <p className="text-xs text-slate-500">Expert Barbers</p>
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
                <h2 className="text-2xl font-black text-slate-950">Our Barbers</h2>
                <p className="text-sm text-slate-500">Choose your style expert</p>
              </div>
              {hasBarbers && (
                <div className="text-xs font-medium text-amber-600">
                  {barbers.length} available
                </div>
              )}
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <>
                  <BarberCardSkeleton />
                  <BarberCardSkeleton />
                  <BarberCardSkeleton />
                  <BarberCardSkeleton />
                </>
              ) : hasBarbers ? (
                barbers.map((barber, idx) => {
                  const SpecialityIcon = barber.specialityIcon;
                  const isHovered = hoveredCard === idx;
                  
                  return (
                    <div
                      key={barber.id}
                      className="group relative transform transition-all duration-300 hover:scale-[1.02]"
                      onMouseEnter={() => setHoveredCard(idx)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${barber.specialityColor} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`}></div>
                      
                      <article className="relative flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-xl sm:gap-4 sm:p-5">
                        {/* Avatar */}
                        {barber.avatar ? (
                          <img 
                            src={barber.avatar} 
                            alt={barber.full_name} 
                            className="h-[72px] w-[72px] rounded-xl object-cover ring-2 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-[80px] sm:w-[80px]" 
                          />
                        ) : (
                          <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-gradient-to-br ${barber.specialityColor} text-xl font-black text-white shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-[80px] sm:w-[80px]`}>
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
                          
                          <div className="mt-1 flex items-center gap-1.5">
                            <SpecialityIcon className="h-3.5 w-3.5 text-amber-500" />
                            <p className="text-sm font-semibold text-slate-500">
                              {barber.speciality}
                            </p>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
                              <HiMiniStar className="text-sm text-amber-500" />
                              <span className="text-slate-700">{barber.rating}</span>
                              <span className="text-slate-400">({barber.reviews})</span>
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                              <HiOutlineUser className="text-sm text-slate-500" />
                              <span className="text-slate-700">{barber.experience.replace(" years", " yrs")}</span>
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
                    <p className="text-lg font-bold text-slate-950">No Barbers Available</p>
                    <p className="text-sm text-slate-500">
                      Check back later for available appointments
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
                    <p className="text-sm font-bold text-slate-900">Booking Tips</p>
                    <p className="text-xs text-slate-600">
                      Book at least 24 hours in advance to secure your preferred time slot
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-3 text-sm font-semibold text-slate-400 sm:hidden">
              <Link to="/login" className="underline underline-offset-4 transition hover:text-slate-700">
                Barber login
              </Link>
              <span className="text-slate-300">|</span>
              <Link to="/login" className="underline underline-offset-4 transition hover:text-slate-700">
                Admin panel
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
