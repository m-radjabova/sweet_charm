import { useEffect, useRef, useState } from "react";
import { HiMiniSparkles, HiMiniGift, HiMiniTruck, HiMiniXMark } from "react-icons/hi2";

const offers = [
  {
    code: "WELCOME10",
    description: "Get 10% OFF your first order!",
    icon: HiMiniGift,
    gradient: "from-[#F86B87] to-[#FA94A9]",
    bgGradient: "from-[#F86B87]/10 to-[#FA94A9]/10",
    borderColor: "border-[#F86B87]/20",
  },
  {
    code: "FREEDELIVERY",
    description: "Free delivery today on all orders!",
    icon: HiMiniTruck,
    gradient: "from-[#FEC84D] to-[#FFD87A]",
    bgGradient: "from-[#FEC84D]/10 to-[#FFD87A]/10",
    borderColor: "border-[#FEC84D]/20",
  },
];

function LimitedOfferBanner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeOffer, setActiveOffer] = useState(0);

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

  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      setActiveOffer((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [dismissed]);

  if (dismissed) return null;

  const offer = offers[activeOffer];
  const Icon = offer.icon;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-4 py-8 sm:px-8 lg:px-12 lg:py-14"
    >
      <div className="mx-auto max-w-[1200px]">
        <div
          className={`relative overflow-hidden rounded-[34px] bg-gradient-to-br ${offer.bgGradient} border ${offer.borderColor} p-[1px] transition-all duration-700 sm:rounded-[32px] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="relative rounded-[33px] bg-white/80 px-5 py-7 backdrop-blur-sm sm:rounded-[31px] sm:px-10 sm:py-10">
            {/* Decorative sparkles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="absolute left-[5%] top-[10%] text-[16px] text-[#F86B87]/20">✦</span>
              <span className="absolute right-[8%] bottom-[15%] text-[12px] text-[#FEC84D]/20">✦</span>
              <span className="absolute left-[15%] bottom-[20%] text-[10px] text-[#F86B87]/15">✦</span>
              <span className="absolute right-[12%] top-[12%] text-[14px] text-[#FEC84D]/15">✦</span>
            </div>

            {/* Dots indicator */}
            <div className="absolute right-6 top-6 flex gap-1.5 max-[480px]:hidden">
              {offers.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveOffer(i)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    i === activeOffer
                      ? "w-6 bg-gradient-to-r from-[#F86B87] to-[#FA94A9]"
                      : "bg-[#F0DDBE] hover:bg-[#E0CDAE]"
                  }`}
                  aria-label={`Switch to offer ${i + 1}`}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#F0DDBE]/70 text-[#8F6A2F]/80 transition-all duration-300 hover:bg-[#F0DDBE] hover:text-[#68400A] sm:right-6 sm:top-14"
              aria-label="Dismiss banner"
            >
              <HiMiniXMark className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-8 sm:text-left">
              {/* Icon */}
              <div className="relative shrink-0">
                <div className={`flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br ${offer.gradient} text-white shadow-lg`}>
                  <Icon className="h-9 w-9" />
                </div>
                <div className={`absolute -inset-2 rounded-[28px] bg-gradient-to-br ${offer.gradient} opacity-20 blur-lg`} />
              </div>

              {/* Content */}
              <div className="flex-1 text-center sm:text-left max-[480px]:px-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F86B87]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#F86B87]">
                  <HiMiniSparkles className="h-3 w-3" />
                  Limited Offer
                  <HiMiniSparkles className="h-3 w-3" />
                </div>
                  <h3 className="mt-2 font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[clamp(2.4rem,10vw,2.8rem)] leading-[1.02] text-[#68400A] sm:mt-3">
                  {offer.description}
                </h3>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-3 sm:justify-start sm:gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F86B87] to-[#FA94A9] px-4 py-1.5 text-[13px] font-bold tracking-wider text-white shadow-[0_4px_12px_rgba(248,107,135,0.3)] sm:px-5 sm:py-2 sm:text-[15px]">
                    Use code: {offer.code}
                  </span>
                  <span className="text-[14px] text-[#8F6A2F]/70">
                    *Terms & conditions apply
                  </span>
                </div>
              </div>

              {/* CTA */}
              <a
                href="#menu"
                style={{color: "var(--color-surface)"}}
                className="group relative inline-flex h-[58px] min-w-[220px] items-center justify-center rounded-[20px] bg-gradient-to-r from-[#F86B87] to-[#FA94A9] px-6 text-[17px] font-bold text-white shadow-[0_8px_20px_rgba(248,107,135,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(248,107,135,0.35)] active:scale-[0.97] sm:h-[52px] sm:min-w-[160px] sm:text-[15px]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Shop Now
                  <span className="inline-block text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LimitedOfferBanner;
