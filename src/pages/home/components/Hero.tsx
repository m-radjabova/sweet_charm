import bearIcon from "../../../assets/bear_iocns.png";
import cakeIcon from "../../../assets/cake_icon.png";
import cakeIconTwo from "../../../assets/cake_icon2.png";
import heroBackground from "../../../assets/hero_background.png";
import heroCat from "../../../assets/hero_cat_center.png";
import iceCreamIcon from "../../../assets/ice_cream_icon.png";
import rabbitIcon from "../../../assets/rabbit_icons.png";

function HeroIcon({
  src,
  alt,
  className,
  delay = 0,
}: {
  src: string;
  alt: string;
  className: string;
  delay?: number;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`pointer-events-none absolute object-contain ${className}`}
      style={{
        opacity: 0,
        animation: `heroFadeIn 0.8s ease-out ${delay}s forwards, heroFloat 6s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

function Sparkle({
  className,
  delay = 0,
  children,
}: {
  className: string;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute pointer-events-none z-10 ${className}`}
      style={{
        opacity: 0,
        animation: `heroFadeIn 0.6s ease-out ${delay}s forwards, heroShimmer 3s ease-in-out ${delay + 1}s infinite`,
      }}
    >
      {children}
    </div>
  );
}

function Hero() {
  const titleClassName =
    "font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[8.5rem] font-normal leading-[0.86] tracking-[0] text-[#68400A] sm:text-[10rem] lg:text-[11.5rem]";
  const buttonClassName =
    "group relative mt-8 inline-flex h-[76px] min-w-[272px] items-center justify-center rounded-[24px] bg-gradient-to-r from-[#F75D86] to-[#F86B87] px-[34px] text-[19px] font-bold text-[#fff8f1] shadow-[0_13px_22px_rgba(248,107,135,0.22)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_17px_30px_rgba(248,107,135,0.28)] active:scale-[0.97] sm:mt-10 max-[900px]:h-[68px] max-[900px]:min-w-[min(250px,78vw)] max-[900px]:rounded-[20px] max-[900px]:px-7 max-[900px]:text-[18px]";

  return (
    <section
      className="relative min-h-[calc(100svh-88px)] overflow-hidden bg-cover bg-center px-4 pb-0 pt-5 sm:min-h-[calc(100svh-90px)] sm:px-8 lg:pt-6"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundColor: "#FEF7E7",
      }}
    >
      {/* Soft radial glow overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center_60%,rgba(255,155,192,0.15)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 z-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,220,190,0.2)_0%,transparent_70%)]" />

      <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center text-center">

        <h1
          className={titleClassName}
          style={{
            color: "#68400A",
            fontSize: "clamp(8rem, 18vw, 14rem)",
            opacity: 0,
            animation: "heroFadeIn 0.8s ease-out 0.3s forwards, heroTitleGlow 4s ease-in-out 1.2s infinite",
          }}
        >
          SweetCharm
        </h1>

        {/* Decorative line under title */}
        <div
          className="mt-1 flex items-center gap-3 sm:mt-2"
          style={{
            opacity: 0,
            animation: "heroFadeIn 0.6s ease-out 0.5s forwards",
          }}
        >
          <span className="block h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[#FF9BC0] to-transparent sm:w-24" />
          <span className="text-[20px] text-[#FF9BC0]">✦</span>
          <span className="block h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[#FF9BC0] to-transparent sm:w-24" />
        </div>

        <p
          className="max-w-[500px] text-balance text-[18px] leading-[1.25] tracking-[0.01em] text-[var(--color-text-primary)] sm:mt-5 sm:text-[22px]"
          style={{
            opacity: 0,
            animation: "heroFadeIn 0.7s ease-out 0.6s forwards",
          }}
        >
          The first Asian pastry shop in
          <br className="hidden sm:block" /> the Netherlands
        </p>

        <a
          href="#menu"
          className={buttonClassName}
          style={{
            opacity: 0,
            animation: "heroFadeIn 0.7s ease-out 0.8s forwards",
            color: "#fff8f1"
          }}
        >
          <span className="relative z-10">Discover our sweets</span>
          <span className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-[#F86B87] to-[#FA94A9] opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-[900px]:rounded-[20px]" />
        </a>
      </div>

      {/* Floating icons with animations */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <HeroIcon
          src={iceCreamIcon}
          alt="Cupcake"
          delay={0.3}
          className="left-[6%] top-[3%] h-[148px] w-[160px] rotate-[-7deg] sm:h-[190px] sm:w-[204px] xl:left-[8%]"
        />
        <HeroIcon
          src={cakeIcon}
          alt="Cake slice"
          delay={0.5}
          className="right-[6%] top-[4%] hidden h-[152px] w-[166px] rotate-[6deg] md:block xl:right-[8%]"
        />
        <HeroIcon
          src={rabbitIcon}
          alt="Rabbit cookie"
          delay={0.7}
          className="left-[4%] top-[42%] h-[132px] w-[142px] rotate-[-6deg] sm:h-[168px] sm:w-[180px] xl:left-[7%]"
        />
        <HeroIcon
          src={cakeIconTwo}
          alt="Cookie"
          delay={0.9}
          className="right-[5%] top-[46%] hidden h-[138px] w-[150px] rotate-[5deg] sm:block xl:right-[6%]"
        />
        <HeroIcon
          src={bearIcon}
          alt="Bear dessert"
          delay={1.1}
          className="left-[50%] top-[81%] hidden h-[102px] w-[110px] -translate-x-1/2 rotate-[4deg] opacity-75 lg:block"
        />
      </div>

      {/* Decorational sparkles - animated */}
      <Sparkle className="left-[10%] top-[12%] text-[28px] text-[var(--color-primary-soft)]" delay={0.5}>✦</Sparkle>
      <Sparkle className="left-[4%] top-[20%] text-[18px] text-[var(--color-primary-soft)] opacity-50" delay={0.7}>✧</Sparkle>
      <Sparkle className="left-[10%] top-[30%] text-[44px] text-[var(--color-primary-soft)] opacity-85" delay={0.9}>*</Sparkle>
      <Sparkle className="left-[13%] top-[37%] hidden text-[24px] text-white md:block" delay={1.1}>✦</Sparkle>
      <Sparkle className="left-[8%] top-[48%] hidden text-[20px] text-[var(--color-primary-soft)] opacity-55 lg:block" delay={1.3}>✦</Sparkle>
      <Sparkle className="left-[2%] top-[55%] text-[16px] text-white opacity-50" delay={1.5}>♥</Sparkle>
      <Sparkle className="left-[15%] top-[60%] hidden text-[22px] text-[var(--color-text-primary)] md:block" delay={1.7}>✧</Sparkle>
      <Sparkle className="left-[4%] top-[80%] hidden text-[34px] text-[var(--color-text-primary)] md:block" delay={1.9}>☆</Sparkle>
      <Sparkle className="left-[12%] top-[90%] hidden text-[16px] text-white lg:block" delay={2.1}>*</Sparkle>
      <Sparkle className="left-[1%] top-[95%] text-[20px] text-[var(--color-primary-soft)]" delay={2.3}>✦</Sparkle>

      <Sparkle className="right-[15%] top-[8%] hidden text-[22px] text-white lg:block" delay={0.6}>✧</Sparkle>
      <Sparkle className="right-[5%] top-[15%] hidden text-[18px] text-[var(--color-primary-soft)] md:block" delay={0.8}>♥</Sparkle>
      <Sparkle className="right-[10%] top-[24%] text-[16px] text-white" delay={1.0}>*</Sparkle>
      <Sparkle className="right-[19%] top-[42%] hidden text-[34px] text-white md:block" delay={1.2}>✦</Sparkle>
      <Sparkle className="right-[8%] top-[56%] hidden text-[18px] text-[var(--color-primary-soft)] lg:block" delay={1.4}>✧</Sparkle>
      <Sparkle className="right-[2%] top-[60%] text-[14px] text-white" delay={1.6}>♥</Sparkle>
      <Sparkle className="right-[23%] top-[67%] text-[36px] text-[var(--color-primary-soft)]" delay={1.8}>♥</Sparkle>
      <Sparkle className="right-[12%] top-[76%] hidden text-[20px] text-white md:block" delay={2.0}>✦</Sparkle>
      <Sparkle className="right-[1%] top-[86%] text-[42px] text-[var(--color-text-primary)]" delay={2.2}>☆</Sparkle>
      <Sparkle className="right-[8%] top-[94%] hidden text-[14px] text-[var(--color-primary-soft)] lg:block" delay={2.4}>*</Sparkle>
      <Sparkle className="right-[18%] top-[98%] text-[18px] text-white" delay={2.6}>✧</Sparkle>

      {/* Extra sparkles near heading */}
      <Sparkle className="left-[22%] top-[14%] hidden text-[12px] text-[var(--color-primary-soft)] md:block" delay={1.0}>✦</Sparkle>
      <Sparkle className="right-[22%] top-[18%] hidden text-[14px] text-white md:block" delay={1.2}>✧</Sparkle>
      <Sparkle className="left-[30%] top-[6%] hidden text-[10px] text-[var(--color-primary-soft)] lg:block" delay={1.4}>♥</Sparkle>
      <Sparkle className="right-[28%] top-[8%] hidden text-[11px] text-white lg:block" delay={1.6}>☆</Sparkle>

      {/* Bottom scattered around cat */}
      <Sparkle className="left-[30%] bottom-[8%] hidden text-[16px] text-[var(--color-primary-soft)] lg:block" delay={2.0}>✦</Sparkle>
      <Sparkle className="right-[30%] bottom-[6%] hidden text-[14px] text-white lg:block" delay={2.2}>✧</Sparkle>
      <Sparkle className="left-[35%] bottom-[2%] hidden text-[12px] text-[var(--color-text-primary)] xl:block" delay={2.4}>♥</Sparkle>
      <Sparkle className="right-[35%] bottom-[3%] hidden text-[11px] text-[var(--color-primary-soft)] xl:block" delay={2.6}>☆</Sparkle>

      {/* Cat image */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex justify-center"
        style={{
          opacity: 0,
          animation: "heroFadeIn 1s ease-out 1s forwards",
        }}
      >
        <img
          src={heroCat}
          alt="SweetCharm cat in a cup"
          className="mx-auto w-[400px] max-w-[80vw] translate-y-[10%] object-contain transition-transform duration-700 hover:scale-[1.03] sm:w-[400px] lg:w-[500px] xl:w-[600px]"
        />
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-[#FEF7E7] to-transparent" />

      {/* Custom keyframes for animations */}
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes heroShimmer {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.15); }
        }
        @keyframes heroTitleGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(255,155,192,0.1)); }
          50% { filter: drop-shadow(0 0 20px rgba(255,155,192,0.25)); }
        }
      `}</style>
    </section>
  );
}

export default Hero;