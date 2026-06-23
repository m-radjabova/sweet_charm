import { useEffect, useRef, useState } from "react";
import orderNowSection from "../../../assets/order_now_section.png";

function OrderNowSection() {
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative bg-[var(--color-hero-bg)] px-4 pb-20 pt-4 sm:px-8 lg:px-12 lg:pb-28">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute left-[5%] top-[12%] text-[18px] text-[#FEF7E7]/20 sm:text-[24px]">
          ✦
        </span>
        <span className="absolute right-[8%] top-[20%] text-[14px] text-[#FEF7E7]/15 sm:text-[18px]">
          ✧
        </span>
        <span className="absolute bottom-[15%] left-[10%] text-[12px] text-[#FEF7E7]/15 sm:text-[16px]">
          ✦
        </span>
        <span className="absolute right-[12%] bottom-[25%] text-[16px] text-[#FEF7E7]/10 sm:text-[20px]">
          ✧
        </span>
      </div>

      <div
        ref={sectionRef}
        className={`relative mx-auto min-h-[390px] max-w-[1680px] overflow-hidden rounded-[42px] shadow-[0_24px_60px_rgba(248,107,135,0.12)] transition-all duration-1000 sm:min-h-[460px] lg:min-h-[750px] ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center transition-transform duration-[8s] ease-out"
          style={{
            backgroundImage: `url(${orderNowSection})`,
            transform: isVisible ? "scale(1)" : "scale(1.1)",
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(248,107,135,0.55)] via-[rgba(248,107,135,0.3)] to-[rgba(248,107,135,0.55)]" />

        {/* Decorative floating elements */}
        <div className="pointer-events-none absolute inset-0">
          {/* Floating hearts */}
          <span
            className={`absolute left-[8%] top-[15%] text-[20px] text-white/30 transition-all duration-[2s] ease-in-out sm:text-[28px] ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            ♥
          </span>
          <span
            className={`absolute right-[10%] bottom-[18%] text-[16px] text-white/25 transition-all duration-[2s] ease-in-out sm:text-[22px] ${
              isVisible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "500ms" }}
          >
            ♥
          </span>

          {/* Floating sparkles */}
          <span
            className={`absolute left-[15%] bottom-[30%] text-[14px] text-white/20 transition-all duration-[2.5s] ease-in-out sm:text-[18px] ${
              isVisible
                ? "translate-x-0 translate-y-0 opacity-100"
                : "translate-x-6 translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            ✦
          </span>
          <span
            className={`absolute right-[18%] top-[25%] text-[12px] text-white/20 transition-all duration-[2.5s] ease-in-out sm:text-[16px] ${
              isVisible
                ? "translate-x-0 translate-y-0 opacity-100"
                : "-translate-x-6 -translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            ✦
          </span>
        </div>

        {/* Content */}
        <div className="absolute inset-y-0 left-0 flex w-full items-center justify-center px-6 sm:px-10 lg:w-[47%] lg:px-16">
          <div className="flex max-w-[470px] flex-col items-center text-center">
            {/* Decorative line above title */}
            <div
              className={`mb-6 flex items-center gap-3 transition-all duration-[1.5s] ${
                isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              }`}
              style={{ transformOrigin: "center" }}
            >
              <span className="block h-[2px] w-12 rounded-full bg-[#FEF7E7]/60" />
              <span className="block h-[2px] w-6 rounded-full bg-[#FEF7E7]/40" />
              <span className="block h-[2px] w-3 rounded-full bg-[#FEF7E7]/20" />
            </div>

            <div className="flex items-center justify-center gap-4 text-[#FEF7E7] sm:gap-7">
              <span
                className={`text-[30px] transition-all duration-[1.2s] sm:text-[38px] ${
                  isVisible
                    ? "rotate-0 scale-100 opacity-100"
                    : "rotate-90 scale-0 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                ✦
              </span>
              <h2
                className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0] text-[#FEF7E7] drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                style={{ fontSize: "clamp(4.4rem, 7vw, 6.6rem)" }}
              >
                Bunnynuts
                <br />
                awaiting
                <br />
                for you
              </h2>
              <span
                className={`text-[30px] transition-all duration-[1.2s] sm:text-[38px] ${
                  isVisible
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                ✦
              </span>
            </div>

            {/* Decorative line below title */}
            <div
              className={`mt-4 mb-6 flex items-center gap-3 transition-all duration-[1.5s] ${
                isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              }`}
              style={{ transformOrigin: "center" }}
            >
              <span className="block h-[2px] w-3 rounded-full bg-[#FEF7E7]/20" />
              <span className="block h-[2px] w-6 rounded-full bg-[#FEF7E7]/40" />
              <span className="block h-[2px] w-12 rounded-full bg-[#FEF7E7]/60" />
            </div>

            <p
              className={`mt-2 max-w-[420px] text-[20px] leading-[1.32] text-[#FEF7E7] drop-shadow-[0_1px_3px_rgba(0,0,0,0.12)] transition-all duration-[1.5s] sm:text-[24px] lg:text-[26px] ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              Enjoy a 10% discount on our delectable Bunnynuts cookies!
            </p>

            <a
              href="#menu"
              className={`group relative mt-10 inline-flex min-w-[240px] items-center justify-center rounded-[22px] bg-[#FEF7E7] px-8 py-4 text-[18px] font-semibold text-[#68400A] shadow-[0_12px_28px_rgba(104,64,10,0.12)] transition-all duration-[1.2s] hover:-translate-y-1 hover:bg-[#FFF7EA] hover:shadow-[0_16px_36px_rgba(104,64,10,0.18)] active:translate-y-0 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Order now
                <span className="inline-block text-[20px] transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110">
                  →
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrderNowSection;