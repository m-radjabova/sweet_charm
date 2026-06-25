import { useEffect, useRef, useState } from "react";
import { HiMiniSparkles, HiMiniStar, HiMiniArrowTrendingUp, HiMiniGift, HiMiniArrowLongRight } from "react-icons/hi2";

const levelInfo = [
  {
    key: "bronze",
    name: "Bronze Bunny",
    points: "0 – 999",
    color: "from-[#CD7F32] to-[#DAA06D]",
    bgColor: "from-[#F5EDE0] to-[#EDE0CE]",
    textColor: "text-[#8B6914]",
  },
  {
    key: "silver",
    name: "Silver Bunny",
    points: "1,000 – 2,499",
    color: "from-[#A8B4C0] to-[#C8D0D8]",
    bgColor: "from-[#F0F2F5] to-[#E2E6EC]",
    textColor: "text-[#6B7B8D]",
  },
  {
    key: "gold",
    name: "Gold Bunny",
    points: "2,500 – 4,999",
    color: "from-[#D4A017] to-[#FFD700]",
    bgColor: "from-[#FFF8EC] to-[#FFF2D6]",
    textColor: "text-[#B8860B]",
  },
  {
    key: "diamond",
    name: "Diamond Bunny",
    points: "5,000+",
    color: "from-[#7DD3F0] to-[#A8E0F5]",
    bgColor: "from-[#F0F9FF] to-[#E0F4FE]",
    textColor: "text-[#0E7490]",
  },
];

function SweetPointsPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#FFF5E8] to-[#FEEFD6] px-4 py-16 sm:px-8 lg:px-12 lg:py-24"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#FEC84D]/8 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#F86B87]/8 blur-3xl" />
        <div className="absolute left-[20%] top-[30%] h-40 w-40 rounded-full bg-[#F86B87]/5 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-[1200px]">
        {/* Header */}
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#FEC84D] to-[#FFD87A] text-white shadow-lg shadow-[#FEC84D]/30">
                <HiMiniStar className="h-8 w-8" />
              </div>
              <div className="absolute -inset-2 rounded-[24px] bg-gradient-to-br from-[#FEC84D] to-[#FFD87A] opacity-20 blur-lg" />
            </div>
          </div>

          <h2
            className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0] text-[#68400A]"
            style={{ fontSize: "clamp(3.5rem, 6vw, 5.5rem)" }}
          >
            Sweet Points
          </h2>
          <div className="mx-auto mt-3 flex items-center justify-center gap-2">
            <span className="block h-[2px] w-8 rounded-full bg-gradient-to-r from-transparent via-[#FEC84D]/50 to-transparent" />
            <span className="block h-[5px] w-[5px] rounded-full bg-[#FEC84D]" />
            <span className="block h-[2px] w-8 rounded-full bg-gradient-to-r from-transparent via-[#FEC84D]/50 to-transparent" />
          </div>
          <p className="mx-auto mt-5 max-w-[550px] text-[17px] leading-relaxed text-[#8F6A2F]/70">
            Earn points with every order and unlock exclusive rewards. The more you treat yourself, the more you earn!
          </p>
        </div>

        {/* How it works */}
        <div
          className={`mx-auto mt-12 max-w-[700px] transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="relative rounded-[28px] bg-white/70 px-8 py-7 backdrop-blur-sm shadow-[0_8px_24px_rgba(104,64,10,0.06)] ring-1 ring-[#F0DDBE]/40">
            {/* Ribbon tape */}
            <div className="absolute -top-2 left-[30%] z-10 h-4 w-[60px] rounded-sm bg-gradient-to-r from-[#FEC84D]/40 to-[#FFD87A]/40 opacity-70" style={{ transform: "rotate(-2deg)" }} />

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#F86B87]/10 to-[#FA94A9]/10">
                <HiMiniArrowTrendingUp className="h-8 w-8 text-[#F86B87]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[20px] font-bold text-[#68400A]">Earn points with every order</h3>
                <p className="mt-1.5 text-[15px] text-[#8F6A2F]/70">
                  Every dollar you spend earns you <strong className="text-[#F86B87]">10 Sweet Points</strong>.
                  Climb through bunny levels and unlock amazing perks!
                </p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F86B87]/10 to-[#FA94A9]/10 px-4 py-2 text-[14px] font-semibold text-[#F86B87]">
                  <HiMiniSparkles className="h-3.5 w-3.5" />
                  10 pts / $
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {levelInfo.map((level, index) => (
            <div
              key={level.key}
              className={`group relative overflow-hidden rounded-[24px] bg-white/60 backdrop-blur-sm p-[1px] transition-all duration-500 hover:shadow-[0_12px_32px_rgba(248,107,135,0.12)] ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <div className="relative h-full rounded-[23px] bg-white/90 px-5 py-6 transition-all duration-300 group-hover:bg-white">
                {/* Bunny icon placeholder */}
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-gradient-to-br ${level.bgColor}`}>
                  {/* Level icon */}
                  <span className={`text-[24px] ${level.textColor}`}>
                    {level.key === "bronze" && "🐰"}
                    {level.key === "silver" && "🐇"}
                    {level.key === "gold" && "🥕"}
                    {level.key === "diamond" && "💎"}
                  </span>
                </div>

                <h4 className={`text-[18px] font-bold ${level.textColor}`}>
                  {level.name}
                </h4>
                <p className="mt-1 text-[14px] text-[#8F6A2F]/60">
                  {level.points} pts
                </p>

                {/* Perk preview */}
                <div className="mt-4 flex items-center gap-2 rounded-full bg-[#F86B87]/5 px-3 py-1.5">
                  <HiMiniGift className="h-3.5 w-3.5 text-[#F86B87]/60" />
                  <span className="text-[12px] font-medium text-[#8F6A2F]/70">
                    {level.key === "bronze" && "Welcome perks"}
                    {level.key === "silver" && "Free Drink"}
                    {level.key === "gold" && "$15 OFF Coupon"}
                    {level.key === "diamond" && "$35 OFF Coupon"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA to login/register */}
        <div
          className={`mt-12 text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "700ms" }}
        >
          <a
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F86B87] to-[#FA94A9] px-6 py-3 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(248,107,135,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(248,107,135,0.35)] active:scale-[0.97]"
          >
            <HiMiniSparkles className="h-4 w-4" />
            Sign Up & Start Earning
            <HiMiniArrowLongRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <p className="mt-3 text-[13px] text-[#8F6A2F]/50">
            Already have an account? <a href="/login" className="text-[#F86B87] underline transition-colors hover:text-[#e55a76]">Log in</a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default SweetPointsPreview;