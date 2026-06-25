import { useEffect, useRef, useState } from "react";
import { HiMiniArrowLongRight, HiMiniShoppingCart, HiMiniTruck, HiMiniSparkles, HiMiniHeart } from "react-icons/hi2";

const steps = [
  {
    number: "01",
    title: "Choose Your Dessert",
    description: "Browse our sweet collection of handcrafted desserts. Pick your favorites!",
    Icon: HiMiniSparkles,
    color: "from-[#F86B87] to-[#FA94A9]",
    bgColor: "from-[#FFF1F5] to-[#FFE2EB]",
    iconColor: "text-[#E87894]",
  },
  {
    number: "02",
    title: "Add to Cart",
    description: "Pop them in your cart and customize your order — it's that simple!",
    Icon: HiMiniShoppingCart,
    color: "from-[#FEC84D] to-[#FFD87A]",
    bgColor: "from-[#FFF8EC] to-[#FFF2D6]",
    iconColor: "text-[#D4A23A]",
  },
  {
    number: "03",
    title: "Fast Delivery",
    description: "We carefully pack and deliver your treats straight to your doorstep.",
    Icon: HiMiniTruck,
    color: "from-[#C8924A] to-[#D9A85A]",
    bgColor: "from-[#F5EDE0] to-[#EDE0CE]",
    iconColor: "text-[#B88030]",
  },
  {
    number: "04",
    title: "Enjoy & Smile",
    description: "Unbox, taste, and enjoy every bite. Happiness delivered!",
    Icon: HiMiniHeart,
    color: "from-[#F86B87] to-[#FA94A9]",
    bgColor: "from-[#FFF1F5] to-[#FFE2EB]",
    iconColor: "text-[#E87894]",
  },
];

function HowItWorksSection() {
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
      className="relative overflow-hidden bg-gradient-to-b from-[#FEF7E7] to-[#FFF5E8] px-4 py-16 sm:px-8 lg:px-12 lg:py-24"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full bg-[#F86B87]/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-[300px] w-[300px] rounded-full bg-[#FEC84D]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1200px]">
        {/* Header */}
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-3">
            <span className="text-[20px] text-[#F86B87]">✦</span>
            <h2
              className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0] text-[#68400A]"
              style={{ fontSize: "clamp(4rem, 7vw, 6rem)" }}
            >
              How It Works
            </h2>
            <span className="text-[20px] text-[#F86B87]">✦</span>
          </div>
          <div className="mx-auto mt-3 flex items-center justify-center gap-2">
            <span className="block h-[2px] w-10 rounded-full bg-gradient-to-r from-transparent via-[#F86B87]/50 to-transparent" />
            <span className="block h-[5px] w-[5px] rounded-full bg-[#F86B87]" />
            <span className="block h-[2px] w-10 rounded-full bg-gradient-to-r from-transparent via-[#F86B87]/50 to-transparent" />
          </div>
        </div>

        {/* Steps */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.Icon;
            return (
              <div
                key={step.number}
                className={`relative transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Connector line (hidden on last) */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-[60px] hidden text-[#F0DDBE] lg:block">
                    <HiMiniArrowLongRight className="h-8 w-8 text-[#F86B87]/30" />
                  </div>
                )}

                <div className="group relative flex flex-col items-center text-center">
                  {/* Step number */}
                  <span className="absolute -left-2 -top-2 font-['Milkshake',cursive] text-[5rem] font-bold leading-none text-[#F86B87]/5 select-none">
                    {step.number}
                  </span>

                  {/* Icon circle */}
                  <div className={`relative mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-[28px] bg-gradient-to-br ${step.bgColor} shadow-[0_8px_24px_rgba(104,64,10,0.06)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_12px_32px_rgba(248,107,135,0.15)]`}>
                    <div className={`flex h-[60px] w-[60px] items-center justify-center rounded-[20px] bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    {/* Glow */}
                    <div className={`absolute -inset-3 rounded-[34px] bg-gradient-to-br ${step.color} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`} />
                  </div>

                  {/* Label */}
                  <span className="mb-2 inline-block rounded-full bg-[#F86B87]/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F86B87]">
                    Step {step.number}
                  </span>

                  {/* Title */}
                  <h3 className="text-[22px] font-bold leading-tight text-[#68400A] transition-colors duration-300 group-hover:text-[#F86B87]">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 max-w-[260px] text-[15px] leading-relaxed text-[#8F6A2F]/70">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom decorative */}
        <div className="mt-16 flex items-center justify-center gap-3">
          <span className="block h-[1px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#F0DDBE] to-transparent" />
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F86B87]/10">
            <HiMiniHeart className="h-3 w-3 text-[#F86B87]" />
          </span>
          <span className="block h-[1px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#F0DDBE] to-transparent" />
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;