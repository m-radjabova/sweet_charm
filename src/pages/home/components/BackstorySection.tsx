import { useEffect, useRef, useState } from "react";
import arrowDown from "../../../assets/arrow_down.png";
import arrowTop from "../../../assets/arrow_top.png";
import backstoryImage from "../../../assets/our_little_backstory.png";
import iceCreamIcon from "../../../assets/ice_cream_icon.png";
import rabbitIcon from "../../../assets/rabbit_icons.png";
import strawberryIcon from "../../../assets/strawberry_icons.png";
import RevealMedia from "./RevealMedia";

function BackstorySection() {
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
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about-us"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#FFF8F0] via-[#FFF0E0] to-[#FFE8D0] px-4 pb-18 pt-12 sm:px-8 lg:px-12 lg:pb-28 lg:pt-18"
    >
      {/* ===== DECORATIVE BACKGROUND ELEMENTS ===== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Floating gradient orbs */}
        <div className="absolute -left-32 -top-32 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-br from-[#FFD4A0]/30 to-[#FFB880]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-tl from-[#FFC8A0]/25 to-[#FFE0C0]/5 blur-3xl" style={{ animationDelay: "1.5s" }} />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#FFE0C0]/20 to-[#FFD0A0]/10 blur-3xl" style={{ animationDelay: "3s" }} />

        {/* Decorative stars & symbols with floating animation */}
        <span
          className={`absolute left-[9%] top-[31%] text-[54px] text-[#8B5B19] opacity-85 max-[900px]:hidden transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-85" : "translate-y-8 opacity-0"
          }`}
          style={{ animation: "floatStar 4s ease-in-out infinite" }}
        >
          ✦
        </span>
        <span
          className={`absolute left-[11%] top-[39%] text-[46px] text-[#8B5B19] opacity-85 max-[900px]:hidden transition-all duration-1000 delay-200 ${
            isVisible ? "translate-y-0 opacity-85" : "translate-y-8 opacity-0"
          }`}
          style={{ animation: "floatStar 4s ease-in-out infinite 0.5s" }}
        >
          ♡
        </span>
        <span
          className={`absolute right-[9%] top-[26%] text-[52px] text-[#8B5B19] opacity-85 max-[900px]:hidden transition-all duration-1000 delay-300 ${
            isVisible ? "translate-y-0 opacity-85" : "translate-y-8 opacity-0"
          }`}
          style={{ animation: "floatStar 4s ease-in-out infinite 1s" }}
        >
          ✦
        </span>
        <span
          className={`absolute right-[6%] top-[33%] text-[26px] text-[#8B5B19] opacity-85 max-[900px]:hidden transition-all duration-1000 delay-500 ${
            isVisible ? "translate-y-0 opacity-85" : "translate-y-8 opacity-0"
          }`}
          style={{ animation: "floatStar 4s ease-in-out infinite 1.5s" }}
        >
          ○
        </span>
        <span
          className={`absolute right-[5%] top-[39%] text-[38px] text-[#8B5B19] opacity-85 max-[900px]:hidden transition-all duration-1000 delay-700 ${
            isVisible ? "translate-y-0 opacity-85" : "translate-y-8 opacity-0"
          }`}
          style={{ animation: "floatStar 4s ease-in-out infinite 2s" }}
        >
          ○
        </span>

        {/* Extra decorative sparkles */}
        <span
          className="absolute left-[3%] top-[12%] text-[20px] text-[#C8924A] opacity-60 max-[900px]:hidden"
          style={{ animation: "sparkle 3s ease-in-out infinite" }}
        >
          ✦
        </span>
        <span
          className="absolute right-[2%] top-[8%] text-[16px] text-[#C8924A] opacity-60 max-[900px]:hidden"
          style={{ animation: "sparkle 3s ease-in-out infinite 1s" }}
        >
          ✦
        </span>
        <span
          className="absolute left-[15%] bottom-[5%] text-[18px] text-[#C8924A] opacity-60 max-[900px]:hidden"
          style={{ animation: "sparkle 3s ease-in-out infinite 2s" }}
        >
          ✦
        </span>
      </div>

      <div className="relative mx-auto max-w-[1680px]">
        {/* ===== STRAWBERRY ICON WITH ENTRANCE ===== */}
        <div
          className={`flex justify-center transition-all duration-1000 delay-300 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className="relative">
            <RevealMedia className="overflow-visible" delayMs={100}>
              <img
                loading="lazy"
                src={strawberryIcon}
                alt="Strawberry badge"
                className="h-[86px] w-[100px] object-contain sm:h-[110px] sm:w-[126px] drop-shadow-lg"
                style={{ animation: "gentleBob 6s ease-in-out infinite" }}
              />
            </RevealMedia>
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#FFD4A0]/20 to-[#FFB880]/10 blur-xl" />
          </div>
        </div>

        {/* ===== HEADING ===== */}
        <div
          className={`mt-8 text-center transition-all duration-1000 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-3 sm:gap-8">
            <span className="text-[20px] text-[#C8924A] sm:text-[34px]" style={{ animation: "sparkle 3s ease-in-out infinite" }}>
              ✦
            </span>
            <h2
              className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0]"
              style={{
                fontSize: "clamp(3.3rem, 13vw, 7.1rem)",
                background: "linear-gradient(135deg, #68400A 0%, #8B5B19 40%, #A07030 70%, #68400A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 4px rgba(139, 91, 25, 0.2))",
              }}
            >
              Our little backstory
            </h2>
            <span className="text-[20px] text-[#C8924A] sm:text-[34px]" style={{ animation: "sparkle 3s ease-in-out infinite 1s" }}>
              ✦
            </span>
          </div>

          {/* Decorative line under heading */}
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <span className="block h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[#C8924A] to-transparent" />
            <span className="block h-[6px] w-[6px] rounded-full bg-[#C8924A]" />
            <span className="block h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[#C8924A] to-transparent" />
          </div>
        </div>

        {/* ===== DESCRIPTION ===== */}
        <div
          className={`mx-auto mt-8 max-w-[860px] text-balance text-center transition-all duration-1000 delay-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          <p className="relative px-3 text-[16px] leading-[1.7] text-[#7A4E1A] sm:px-0 sm:text-[25px]">
            <span className="absolute -left-3 -top-3 text-[40px] text-[#C8924A]/30 font-serif leading-none">"</span>
            Beginning 2020, SweetCharm started out as homebakery business. By March 2022, we
            took the leap to our very own production space. Fast forward to March 2023, and
            we've expanded to a larger production space, a bigger office, and an even stronger
            team. This growth wouldn't have been possible without your support.
            <span className="absolute -bottom-8 -right-3 text-[40px] text-[#C8924A]/30 font-serif leading-none">"</span>
          </p>
        </div>

        {/* ===== IMAGE WITH OVERLAYS ===== */}
        <div
          className={`relative mx-auto mt-10 flex max-w-[1440px] justify-center sm:mt-16 transition-all duration-1000 delay-900 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
          }`}
        >
          {/* Glow behind image */}
          <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-b from-[#FFD4A0]/20 via-[#FFC8A0]/10 to-transparent blur-2xl" />

          {/* Image container with rounded corners and shadow */}
          <div className="relative w-full max-w-[1240px] rounded-[34px] border-[4px] border-[#F79CB1] bg-white/40 p-2 shadow-[0_20px_60px_-15px_rgba(139,91,25,0.3)] backdrop-blur-sm ring-1 ring-[#FFD4A0]/30 sm:rounded-3xl sm:border-0 sm:p-3">
            <RevealMedia className="rounded-2xl" delayMs={180}>
              <img
                loading="lazy"
                src={backstoryImage}
                alt="SweetCharm backstory"
                className="w-full object-contain transition-transform duration-700 hover:scale-105"
              />
            </RevealMedia>
          </div>

          {/* ===== DESKTOP OVERLAYS ===== */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            {/* Cake label */}
            <div
              className={`absolute left-[2%] top-[38%] flex flex-col items-center gap-3 transition-all duration-1000 delay-[1100ms] ${
                isVisible ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"
              }`}
            >
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 px-5 py-3 shadow-lg backdrop-blur-sm ring-1 ring-[#FFD4A0]/30">
                <span
                  className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[4.2rem] leading-none text-[#68400A]"
                  style={{ transform: "rotate(-7deg)", filter: "drop-shadow(0 2px 4px rgba(139,91,25,0.15))" }}
                >
                  Cake
                </span>
                <img loading="lazy" src={arrowTop} alt="" className="w-[96px] object-contain drop-shadow-md" style={{ animation: "gentleBob 4s ease-in-out infinite" }} />
              </div>
            </div>

            {/* Macaron label */}
            <div
              className={`absolute right-[3%] top-[61%] flex flex-col items-center gap-3 transition-all duration-1000 delay-[1300ms] ${
                isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
              }`}
            >
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/70 px-5 py-3 shadow-lg backdrop-blur-sm ring-1 ring-[#FFD4A0]/30">
                <img loading="lazy" src={arrowDown} alt="" className="w-[104px] object-contain drop-shadow-md" style={{ animation: "gentleBob 4s ease-in-out infinite 0.5s" }} />
                <span
                  className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[4.2rem] leading-none text-[#68400A]"
                  style={{ transform: "rotate(6deg)", filter: "drop-shadow(0 2px 4px rgba(139,91,25,0.15))" }}
                >
                  Macaron
                </span>
              </div>
            </div>

            {/* Rabbit icon */}
            <img
              loading="lazy"
              src={rabbitIcon}
              alt="Rabbit icon"
              className={`absolute right-[15%] top-[36%] w-[148px] object-contain drop-shadow-lg transition-all duration-1000 delay-[1500ms] ${
                isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-75 opacity-0"
              }`}
              style={{ animation: "gentleBob 5s ease-in-out infinite" }}
            />

            {/* Ice cream icon */}
            <img
              loading="lazy"
              src={iceCreamIcon}
              alt="Cupcake icon"
              className={`absolute left-[16%] top-[77%] w-[158px] object-contain drop-shadow-lg transition-all duration-1000 delay-[1700ms] ${
                isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-75 opacity-0"
              }`}
              style={{ animation: "gentleBob 5s ease-in-out infinite 1s" }}
            />
          </div>
        </div>

        {/* ===== MOBILE OVERLAYS ===== */}
        <div
          className={`mt-8 flex justify-center lg:hidden transition-all duration-1000 delay-[1900ms] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-3 rounded-[26px] bg-white/70 px-4 py-3 shadow-md backdrop-blur-sm ring-1 ring-[#FFD4A0]/30">
            <img loading="lazy" src={iceCreamIcon} alt="Cupcake icon" className="w-[64px] object-contain drop-shadow-md" />
            <img loading="lazy" src={rabbitIcon} alt="Rabbit icon" className="w-[64px] object-contain drop-shadow-md" />
            <span className="text-[20px] text-[#C8924A]">✦</span>
          </div>
        </div>
      </div>

      {/* ===== KEYFRAMES ===== */}
      <style>{`
        @keyframes floatStar {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes gentleBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}

export default BackstorySection;
