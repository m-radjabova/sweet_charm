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
    floatDir: "up",
  },
  {
    number: "02",
    title: "Add to Cart",
    description: "Pop them in your cart and customize your order — it's that simple!",
    Icon: HiMiniShoppingCart,
    color: "from-[#FEC84D] to-[#FFD87A]",
    bgColor: "from-[#FFF8EC] to-[#FFF2D6]",
    iconColor: "text-[#D4A23A]",
    floatDir: "down",
  },
  {
    number: "03",
    title: "Fast Delivery",
    description: "We carefully pack and deliver your treats straight to your doorstep.",
    Icon: HiMiniTruck,
    color: "from-[#C8924A] to-[#D9A85A]",
    bgColor: "from-[#F5EDE0] to-[#EDE0CE]",
    iconColor: "text-[#B88030]",
    floatDir: "up",
  },
  {
    number: "04",
    title: "Enjoy & Smile",
    description: "Unbox, taste, and enjoy every bite. Happiness delivered!",
    Icon: HiMiniHeart,
    color: "from-[#F86B87] to-[#FA94A9]",
    bgColor: "from-[#FFF1F5] to-[#FFE2EB]",
    iconColor: "text-[#E87894]",
    floatDir: "down",
  },
];

// Generate floating particles
const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 3 + Math.random() * 6,
  delay: Math.random() * 5,
  duration: 3 + Math.random() * 4,
  opacity: 0.08 + Math.random() * 0.12,
}));

function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
      className="relative overflow-hidden bg-gradient-to-b from-[#FEF7E7] via-[#FFF5E8] to-[#FFF1E0] px-4 py-16 sm:px-8 lg:px-12 lg:py-24"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-[#F86B87]/5 blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-[#FEC84D]/5 blur-3xl animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute left-[50%] top-[50%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F86B87]/3 blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        
        {/* Floating particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[#F86B87]"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: isVisible ? p.opacity : 0,
              animation: isVisible ? `float-particle ${p.duration}s ease-in-out ${p.delay}s infinite` : "none",
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
          <div className="inline-flex items-center gap-3">
            <span className="inline-block animate-bounce-slow text-[20px] text-[#F86B87]" style={{ animationDelay: "0s" }}>✦</span>
            <h2
              className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0] text-[#68400A]"
              style={{ fontSize: "clamp(4rem, 7vw, 6rem)" }}
            >
              How It Works
            </h2>
            <span className="inline-block animate-bounce-slow text-[20px] text-[#F86B87]" style={{ animationDelay: "0.3s" }}>✦</span>
          </div>
          <div className="mx-auto mt-3 flex items-center justify-center gap-2">
            <span className="block h-[2px] w-10 rounded-full bg-gradient-to-r from-transparent via-[#F86B87]/50 to-transparent" />
            <span className="block h-[5px] w-[5px] rounded-full bg-[#F86B87] animate-ping-slow" />
            <span className="block h-[2px] w-10 rounded-full bg-gradient-to-r from-transparent via-[#F86B87]/50 to-transparent" />
          </div>
        </div>

        {/* Steps */}
        <div className="mt-10 grid gap-6 sm:mt-14 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.Icon;
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={step.number}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Connector line (hidden on last) */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-[60px] hidden lg:block">
                    <HiMiniArrowLongRight className={`h-8 w-8 transition-all duration-500 ${
                      isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    } ${isHovered ? "text-[#F86B87]/60" : "text-[#F86B87]/20"}`}
                    style={{ transitionDelay: `${400 + index * 150}ms` }}
                    />
                  </div>
                )}

                <div className="group relative flex flex-col items-center text-center">
                  {/* Step number background */}
                  <span className={`absolute -left-2 -top-2 font-['Milkshake',cursive] text-[5rem] font-bold leading-none select-none transition-all duration-700 ${
                    isHovered ? "text-[#F86B87]/15 scale-110" : "text-[#F86B87]/5 scale-100"
                  }`}>
                    {step.number}
                  </span>

                  {/* Icon circle */}
                  <div className={`relative mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-gradient-to-br ${step.bgColor} shadow-[0_8px_24px_rgba(104,64,10,0.06)] transition-all duration-500 sm:mb-6 sm:h-[88px] sm:w-[88px] sm:rounded-[28px] ${
                    isHovered 
                      ? "scale-110 shadow-[0_12px_32px_rgba(248,107,135,0.15)]" 
                      : "hover:scale-105 hover:shadow-[0_12px_32px_rgba(248,107,135,0.1)]"
                  }`}
                  style={{
                    animation: isVisible ? `float-${step.floatDir} 3s ease-in-out ${index * 0.2}s infinite` : "none",
                  }}>
                    <div className={`flex h-[60px] w-[60px] items-center justify-center rounded-[20px] bg-gradient-to-br ${step.color} text-white shadow-lg transition-all duration-300 ${
                      isHovered ? "scale-110 rotate-3" : ""
                    }`}>
                      <Icon className={`h-7 w-7 transition-all duration-300 ${
                        isHovered ? "scale-110" : ""
                      }`} />
                    </div>
                    {/* Glow */}
                    <div className={`absolute -inset-3 rounded-[34px] bg-gradient-to-br ${step.color} transition-all duration-500 ${
                      isHovered ? "opacity-30 blur-xl" : "opacity-0 blur-lg"
                    }`} />
                    {/* Inner glow ring */}
                    <div className={`absolute inset-0 rounded-[28px] ring-1 transition-all duration-500 ${
                      isHovered ? "ring-[#F86B87]/20 ring-2" : "ring-transparent"
                    }`} />
                  </div>

                  {/* Label */}
                  <span className={`mb-2 inline-block rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
                    isHovered 
                      ? "bg-[#F86B87]/20 text-[#F86B87] scale-105" 
                      : "bg-[#F86B87]/10 text-[#F86B87]"
                  }`}>
                    Step {step.number}
                  </span>

                  {/* Title */}
                  <h3 className={`text-[22px] font-bold leading-tight transition-all duration-300 ${
                    isHovered ? "text-[#F86B87] scale-105" : "text-[#68400A]"
                  }`}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className={`mt-3 max-w-[260px] text-[15px] leading-relaxed transition-all duration-300 ${
                    isHovered ? "text-[#8F6A2F]/90" : "text-[#8F6A2F]/70"
                  }`}>
                    {step.description}
                  </p>

                  {/* Bottom indicator line */}
                  <div className={`mt-5 h-[3px] w-0 rounded-full bg-gradient-to-r ${step.color} transition-all duration-500 ${
                    isHovered ? "w-16" : "w-0"
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom decorative */}
        <div className="mt-16 flex items-center justify-center gap-3">
          <span className="block h-[1px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#F0DDBE] to-transparent" />
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F86B87]/10 transition-all duration-300 hover:scale-110 hover:bg-[#F86B87]/20">
            <HiMiniHeart className="h-3 w-3 text-[#F86B87] animate-pulse" style={{ animationDuration: "2s" }} />
          </span>
          <span className="block h-[1px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#F0DDBE] to-transparent" />
        </div>
      </div>

      {/* Keyframes injection */}
      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-down {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(8px); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          25% { opacity: 0.15; }
          50% { transform: translate(20px, -30px) scale(1.5); opacity: 0.2; }
          75% { opacity: 0.1; }
          100% { transform: translate(-10px, -50px) scale(0.5); opacity: 0; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}

export default HowItWorksSection;
