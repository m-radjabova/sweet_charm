import { useEffect, useRef, useState } from "react";
import { HiMiniChevronDown } from "react-icons/hi2";
import { IoHelpCircleOutline } from "react-icons/io5";
import { PiHeart, PiSparkle } from "react-icons/pi";

type FaqItem = {
  question: string;
  answer: string;
  icon: "sparkle" | "heart";
};

const faqs: FaqItem[] = [
  {
    question: "Where do you source your ingredients?",
    answer:
      "We carefully select our ingredients from trusted suppliers who prioritize quality and sustainability. We strive to use locally sourced and organic ingredients whenever possible.",
    icon: "sparkle",
  },
  {
    question: "Can I place a custom order?",
    answer:
      "Absolutely! We love crafting custom desserts for your special moments. Contact us with your ideas, and our team will help you bring them to life.",
    icon: "heart",
  },
  {
    question: "Do you offer dietary accommodations?",
    answer:
      "Yes, we offer options for dietary preferences and restrictions. Let us know your requirements, and we will recommend the best dessert choices for you.",
    icon: "sparkle",
  },
  {
    question: "Do you offer delivery?",
    answer:
      "Delivery is available in selected areas. Check our delivery policy or contact our customer service to confirm availability in your location.",
    icon: "heart",
  },
];

function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
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
      id="faqs"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#FFF5E8] via-[#FEEFD6] to-[#FDE8C8] px-4 pb-24 pt-14 sm:px-8 lg:px-12 lg:pb-32 lg:pt-24"
    >
      {/* ===== DECORATIVE BACKGROUND ELEMENTS ===== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[350px] w-[350px] animate-pulse rounded-full bg-gradient-to-br from-[#F86B87]/15 to-[#FFB880]/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-tl from-[#C8924A]/20 to-[#FFE0C0]/5 blur-3xl" style={{ animationDelay: "2s" }} />
        <div className="absolute left-1/2 top-1/4 h-[250px] w-[250px] -translate-x-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#F86B87]/10 to-[#FFD4A0]/5 blur-3xl" style={{ animationDelay: "4s" }} />

        <span className="absolute left-[5%] top-[12%] text-[22px] text-[#C8924A]/40 max-[768px]:hidden" style={{ animation: "sparkle 3s ease-in-out infinite" }}>✦</span>
        <span className="absolute right-[8%] top-[8%] text-[18px] text-[#C8924A]/40 max-[768px]:hidden" style={{ animation: "sparkle 3s ease-in-out infinite 1s" }}>✦</span>
        <span className="absolute left-[12%] bottom-[10%] text-[16px] text-[#C8924A]/30 max-[768px]:hidden" style={{ animation: "sparkle 3s ease-in-out infinite 0.5s" }}>✦</span>
        <span className="absolute right-[5%] bottom-[15%] text-[20px] text-[#C8924A]/30 max-[768px]:hidden" style={{ animation: "sparkle 3s ease-in-out infinite 1.5s" }}>✦</span>

        <div className="absolute left-[20%] top-[15%] h-[60px] w-[60px] rounded-full border-2 border-[#C8924A]/10 max-[768px]:hidden" style={{ animation: "floatStar 6s ease-in-out infinite" }} />
        <div className="absolute right-[25%] bottom-[20%] h-[40px] w-[40px] rounded-full border-2 border-[#F86B87]/10 max-[768px]:hidden" style={{ animation: "floatStar 6s ease-in-out infinite 2s" }} />
      </div>

      <div className="relative mx-auto max-w-[1200px]">
        {/* ===== HEADER SECTION ===== */}
        <div
          className={`text-center transition-all duration-800 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F86B87] to-[#FF8FA3] text-white shadow-lg shadow-[#F86B87]/30 sm:h-20 sm:w-20">
                <IoHelpCircleOutline className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#F86B87]/20 to-[#FF8FA3]/20 blur-lg" />
            </div>
          </div>

          <div className="inline-flex items-center gap-4 sm:gap-7">
            <span className="text-[24px] text-[#C8924A] sm:text-[30px]" style={{ animation: "sparkle 3s ease-in-out infinite" }}>✦</span>
            <h2
              className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0]"
              style={{
                fontSize: "clamp(4.5rem, 8vw, 7rem)",
                background: "linear-gradient(135deg, #68400A 0%, #8B5B19 40%, #A07030 70%, #68400A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 4px rgba(139, 91, 25, 0.2))",
              }}
            >
              FAQs
            </h2>
            <span className="text-[24px] text-[#C8924A] sm:text-[30px]" style={{ animation: "sparkle 3s ease-in-out infinite 1s" }}>✦</span>
          </div>

          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <span className="block h-[2px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#C8924A] to-transparent sm:w-16" />
            <span className="block h-[6px] w-[6px] rounded-full bg-[#C8924A]" />
            <span className="block h-[2px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#C8924A] to-transparent sm:w-16" />
          </div>

          <p className="mx-auto mt-6 max-w-[680px] text-[18px] leading-[1.7] text-[#7A4E1A] sm:text-[20px]">
            Find out answers to common questions about our dessert options, ingredient sources, and dietary accommodations.
          </p>
        </div>

        {/* ===== FAQ ACCORDION LIST ===== */}
        <div className="mt-12 space-y-6 sm:mt-14 lg:mt-16">
          {faqs.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={item.question}
                className={`group transition-all duration-600 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${300 + index * 150}ms` }}
              >
                <div className="relative mx-auto max-w-[860px]">
                  {/* ===== DECORATIVE RIBBON / TAPE ===== */}
                  <div className="absolute -top-2 left-[20%] z-10 h-4 w-[60px] rounded-sm bg-gradient-to-r from-[#F86B87]/40 to-[#FF8FA3]/40 opacity-80 shadow-sm sm:w-[80px]" style={{ transform: "rotate(-2deg)" }} />
                  <div className="absolute -top-2 right-[25%] z-10 h-4 w-[50px] rounded-sm bg-gradient-to-r from-[#F86B87]/30 to-[#FF8FA3]/30 opacity-70 shadow-sm sm:w-[70px]" style={{ transform: "rotate(3deg)" }} />

                  <button
                    type="button"
                    onClick={() => setActiveIndex(isOpen ? null : index)}
                    className={`relative w-full text-left backdrop-blur-sm transition-all duration-500 ${
                      isOpen
                        ? "rounded-[28px] bg-white px-7 py-7 shadow-[0_12px_40px_-8px_rgba(248,107,135,0.18)] sm:px-10 sm:py-8"
                        : "rounded-[32px] bg-white/50 px-7 py-6 shadow-[0_4px_16px_rgba(104,64,10,0.04)] hover:bg-white/80 hover:shadow-[0_8px_24px_-6px_rgba(248,107,135,0.1)] sm:px-10 sm:py-7"
                    }`}
                    style={{
                      borderImage: isOpen
                        ? "linear-gradient(135deg, #F86B87 0%, #FF8FA3 50%, #FFB880 100%) 1"
                        : "none",
                      border: isOpen ? "2px solid" : "2px solid transparent",
                    }}
                  >
                    {/* Decorative corner sparkle for open state */}
                    {isOpen && (
                      <>
                        <PiSparkle className="absolute -left-2 -top-2 h-6 w-6 text-[#F86B87]/60" />
                        <PiSparkle className="absolute -right-2 -bottom-2 h-5 w-5 rotate-90 text-[#C8924A]/40" />
                      </>
                    )}

                    {/* Content */}
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex-1 min-w-0">
                        {/* Question with decorative icon */}
                        <div className="flex items-center gap-3">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 sm:h-9 sm:w-9 ${
                            isOpen
                              ? "bg-gradient-to-br from-[#F86B87] to-[#FF8FA3] text-white shadow-sm shadow-[#F86B87]/30"
                              : "bg-[#FFECC7] text-[#C8924A] group-hover:bg-[#FFE0B0]"
                          }`}>
                            {item.icon === "heart" ? (
                              <PiHeart className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                            ) : (
                              <PiSparkle className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                            )}
                          </span>
                          <h3 className={`text-[19px] font-semibold leading-[1.3] transition-colors duration-300 sm:text-[22px] ${
                            isOpen ? "text-[#68400A]" : "text-[#68400A]/90"
                          }`}>
                            {item.question}
                          </h3>
                        </div>

                        {/* Answer */}
                        <div
                          className={`overflow-hidden transition-all duration-500 ease-in-out ${
                            isOpen ? "mt-4 max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="relative ml-11 pl-1">
                            {/* Decorative line */}
                            <div className="absolute left-0 top-0 h-full w-[2px] rounded-full bg-gradient-to-b from-[#F86B87]/40 via-[#FFB880]/30 to-transparent" />
                            <p className="text-[15px] leading-[1.8] text-[#8F6A2F] sm:text-[17px]">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Chevron */}
                      <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-400 sm:h-12 sm:w-12 ${
                        isOpen
                          ? "border-[#F86B87]/30 bg-gradient-to-br from-[#F86B87]/10 to-[#FF8FA3]/10 text-[#F86B87]"
                          : "border-[#AC8D64]/20 text-[#8B5B19] group-hover:border-[#F86B87]/20 group-hover:text-[#F86B87]"
                      }`}>
                        <HiMiniChevronDown
                          className={`h-5 w-5 transition-all duration-400 sm:h-6 sm:w-6 ${
                            isOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== BOTTOM CTA ===== */}
        <div
          className={`mx-auto mt-16 max-w-[580px] text-center transition-all duration-1000 delay-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="relative rounded-[24px] bg-gradient-to-br from-white/70 to-white/40 px-7 py-7 backdrop-blur-sm shadow-[0_8px_24px_-8px_rgba(139,91,25,0.08)] ring-1 ring-[#FFD4A0]/20 sm:px-10 sm:py-8">
            {/* Decorative tape */}
            <div className="absolute -top-2 left-1/2 z-10 h-[14px] w-[70px] -translate-x-1/2 rounded-sm bg-gradient-to-r from-[#F86B87]/30 to-[#FF8FA3]/30 opacity-70" style={{ transform: "rotate(-1deg)" }} />
            
            <p className="text-[17px] leading-[1.8] text-[#7A4E1A] sm:text-[18px]">
              Still have questions?{" "}
              <span className="relative inline-block">
                <span className="cursor-pointer bg-gradient-to-r from-[#F86B87] to-[#FF8FA3] bg-clip-text font-semibold text-transparent transition-all hover:from-[#e55a76] hover:to-[#f07d93]">
                  Contact our team
                </span>
                <span className="absolute -bottom-[2px] left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-[#F86B87]/50 to-[#FF8FA3]/50" />
              </span>{" "}
              — we'd love to help! ♡
            </p>
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
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
      `}</style>
    </section>
  );
}

export default FaqSection;