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
    emoji: "🐰",
    glowColor: "rgba(205,127,50,0.15)",
  },
  {
    key: "silver",
    name: "Silver Bunny",
    points: "1,000 – 2,499",
    color: "from-[#A8B4C0] to-[#C8D0D8]",
    bgColor: "from-[#F0F2F5] to-[#E2E6EC]",
    textColor: "text-[#6B7B8D]",
    emoji: "🐇",
    glowColor: "rgba(168,180,192,0.15)",
  },
  {
    key: "gold",
    name: "Gold Bunny",
    points: "2,500 – 4,999",
    color: "from-[#D4A017] to-[#FFD700]",
    bgColor: "from-[#FFF8EC] to-[#FFF2D6]",
    textColor: "text-[#B8860B]",
    emoji: "🥕",
    glowColor: "rgba(212,160,23,0.15)",
  },
  {
    key: "diamond",
    name: "Diamond Bunny",
    points: "5,000+",
    color: "from-[#7DD3F0] to-[#A8E0F5]",
    bgColor: "from-[#F0F9FF] to-[#E0F4FE]",
    textColor: "text-[#0E7490]",
    emoji: "💎",
    glowColor: "rgba(125,211,240,0.15)",
  },
];

// Floating sparkle particles
const sparkles = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 6,
  duration: 4 + Math.random() * 5,
  opacity: 0.06 + Math.random() * 0.1,
}));

function SweetPointsPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

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
      className="relative overflow-hidden bg-gradient-to-b from-[#FFF5E8] via-[#FEEFD6] to-[#FDE8C8] px-4 py-16 sm:px-8 lg:px-12 lg:py-24"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#FEC84D]/8 blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#F86B87]/8 blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute left-[20%] top-[30%] h-40 w-40 rounded-full bg-[#F86B87]/5 blur-2xl animate-pulse" style={{ animationDuration: "6s" }} />
        
        {/* Floating sparkles */}
        {sparkles.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-[#FEC84D]"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              opacity: isVisible ? s.opacity : 0,
              animation: isVisible ? `sparkle-float ${s.duration}s ease-in-out ${s.delay}s infinite` : "none",
              transition: "opacity 1s ease",
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-[1200px]">
        {/* Header */}
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="mb-4 flex justify-center">
            <div className="relative group">
              <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#FEC84D] to-[#FFD87A] text-white shadow-lg shadow-[#FEC84D]/30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[#FEC84D]/50">
                <HiMiniStar className="h-8 w-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
              </div>
              <div className="absolute -inset-2 rounded-[24px] bg-gradient-to-br from-[#FEC84D] to-[#FFD87A] opacity-20 blur-lg transition-all duration-500 group-hover:opacity-40 group-hover:blur-xl" />
              {/* Sparkle ring */}
              <div className="absolute -inset-4 rounded-[32px] border border-[#FEC84D]/0 transition-all duration-500 group-hover:border-[#FEC84D]/20" />
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
            <span className="block h-[5px] w-[5px] rounded-full bg-[#FEC84D] animate-ping-slow" />
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
          <div className="group relative rounded-[28px] bg-white/70 px-8 py-7 backdrop-blur-sm shadow-[0_8px_24px_rgba(104,64,10,0.06)] ring-1 ring-[#F0DDBE]/40 transition-all duration-500 hover:shadow-[0_12px_32px_rgba(248,107,135,0.1)] hover:ring-[#F86B87]/20">
            {/* Ribbon tape */}
            <div className="absolute -top-2 left-[30%] z-10 h-4 w-[60px] rounded-sm bg-gradient-to-r from-[#FEC84D]/40 to-[#FFD87A]/40 opacity-70 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105" style={{ transform: "rotate(-2deg)" }} />

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#F86B87]/10 to-[#FA94A9]/10 transition-all duration-500 group-hover:scale-110 group-hover:from-[#F86B87]/20 group-hover:to-[#FA94A9]/20">
                <HiMiniArrowTrendingUp className="h-8 w-8 text-[#F86B87] transition-all duration-500 group-hover:scale-110" />
              </div>
              <div className="flex-1">
                <h3 className="text-[20px] font-bold text-[#68400A] transition-colors duration-300 group-hover:text-[#F86B87]">Earn points with every order</h3>
                <p className="mt-1.5 text-[15px] text-[#8F6A2F]/70">
                  Every dollar you spend earns you <strong className="text-[#F86B87]">10 Sweet Points</strong>.
                  Climb through bunny levels and unlock amazing perks!
                </p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F86B87]/10 to-[#FA94A9]/10 px-4 py-2 text-[14px] font-semibold text-[#F86B87] transition-all duration-300 group-hover:from-[#F86B87]/20 group-hover:to-[#FA94A9]/20 group-hover:scale-105">
                  <HiMiniSparkles className="h-3.5 w-3.5 transition-all duration-300 group-hover:rotate-12" />
                  10 pts / $
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level cards */}
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {levelInfo.map((level, index) => {
            const isHovered = hoveredLevel === level.key;
            return (
              <div
                key={level.key}
                onMouseEnter={() => setHoveredLevel(level.key)}
                onMouseLeave={() => setHoveredLevel(null)}
                className={`group relative overflow-hidden rounded-[24px] bg-white/60 backdrop-blur-sm p-[1px] transition-all duration-500 ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                } ${isHovered ? "shadow-[0_16px_40px_rgba(248,107,135,0.15)]" : "hover:shadow-[0_12px_32px_rgba(248,107,135,0.12)]"}`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className={`relative h-full rounded-[23px] bg-white/90 px-5 py-6 transition-all duration-500 ${
                  isHovered ? "bg-white scale-[1.02]" : "group-hover:bg-white"
                }`}>
                  {/* Glow effect on hover */}
                  <div 
                    className={`absolute -inset-4 rounded-[32px] opacity-0 blur-2xl transition-all duration-500 ${
                      isHovered ? "opacity-100" : ""
                    }`}
                    style={{ background: `radial-gradient(circle, ${level.glowColor}, transparent 70%)` }}
                  />

                  {/* Bunny icon */}
                  <div className={`relative mb-4 flex h-14 w-14 items-center justify-center rounded-[16px] bg-gradient-to-br ${level.bgColor} transition-all duration-500 ${
                    isHovered ? "scale-110 rotate-6" : "group-hover:scale-105"
                  }`}>
                    <span className={`text-[24px] transition-all duration-500 ${
                      isHovered ? "scale-110" : ""
                    }`}>
                      {level.emoji}
                    </span>
                  </div>

                  <h4 className={`text-[18px] font-bold ${level.textColor} transition-all duration-300 ${
                    isHovered ? "scale-105" : ""
                  }`}>
                    {level.name}
                  </h4>
                  <p className="mt-1 text-[14px] text-[#8F6A2F]/60">
                    {level.points} pts
                  </p>

                  {/* Perk preview */}
                  <div className={`mt-4 flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-300 ${
                    isHovered 
                      ? "bg-[#F86B87]/10 scale-105" 
                      : "bg-[#F86B87]/5 group-hover:bg-[#F86B87]/10"
                  }`}>
                    <HiMiniGift className={`h-3.5 w-3.5 transition-all duration-300 ${
                      isHovered ? "text-[#F86B87] rotate-6" : "text-[#F86B87]/60"
                    }`} />
                    <span className={`text-[12px] font-medium transition-all duration-300 ${
                      isHovered ? "text-[#8F6A2F]/90" : "text-[#8F6A2F]/70"
                    }`}>
                      {level.key === "bronze" && "Welcome perks"}
                      {level.key === "silver" && "Free Drink"}
                      {level.key === "gold" && "$15 OFF Coupon"}
                      {level.key === "diamond" && "$35 OFF Coupon"}
                    </span>
                  </div>

                  {/* Bottom accent bar */}
                  <div className={`mt-5 h-[3px] w-0 rounded-full bg-gradient-to-r ${level.color} transition-all duration-500 ${
                    isHovered ? "w-full" : "group-hover:w-1/2"
                  }`} />
                </div>
              </div>
            );
          })}
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
            style={{color: "var(--color-surface)"}}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#F86B87] to-[#FA94A9] px-6 py-3 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(248,107,135,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(248,107,135,0.35)] active:scale-[0.97]"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <HiMiniSparkles className="h-4 w-4 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
            <span className="relative">Sign Up & Start Earning</span>
            <HiMiniArrowLongRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1" />
          </a>
          <p className="mt-3 text-[13px] text-[#8F6A2F]/50 hover:text-[#F86B87] cursor-pointer transition-colors duration-300">
            Already have an account? <a href="/login" className="relative text-[#F86B87] underline decoration-[#F86B87]/30 underline-offset-2 transition-all hover:text-[#e55a76] hover:decoration-[#e55a76]">Log in</a>
          </p>
        </div>
      </div>

      {/* Keyframes injection */}
      <style>{`
        @keyframes sparkle-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          25% { opacity: 0.12; }
          50% { transform: translate(15px, -25px) scale(1.5); opacity: 0.18; }
          75% { opacity: 0.08; }
          100% { transform: translate(-8px, -40px) scale(0.5); opacity: 0; }
        }
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}

export default SweetPointsPreview;
