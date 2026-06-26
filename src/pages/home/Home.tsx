import { motion } from "framer-motion";
import Header from "./components/Header";
import BackstorySection from "./components/BackstorySection";
import CraftedWithLoveSection from "./components/CraftedWithLoveSection";
import FeaturedDesserts from "./components/FeaturedDesserts";
import BestSellersSection from "./components/BestSellersSection";
import ChefChoiceSection from "./components/ChefChoiceSection";
import LimitedOfferBanner from "./components/LimitedOfferBanner";
import HowItWorksSection from "./components/HowItWorksSection";
import SweetPointsPreview from "./components/SweetPointsPreview";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import OrderNowSection from "./components/OrderNowSection";
import ReviewsSection from "./components/ReviewsSection";
import SweetMomentsSection from "./components/SweetMomentsSection";
import StickyCartButton from "./components/StickyCartButton";
import BackToTopButton from "./components/BackToTopButton";
import NeedHelpButton from "./components/NeedHelpButton";
import BirthdayGreetingModal from "./components/BirthdayGreetingModal";
import useContextPro from "../../hooks/useContextPro";

type SectionMotion =
  | "fade-up"
  | "slide-left"
  | "slide-right"
  | "soft-zoom"
  | "float-up"
  | "curtain";

function RevealSection({
  children,
  delay = 0,
  variant = "fade-up",
  accent = "pink",
}: {
  children: React.ReactNode;
  delay?: number;
  variant?: SectionMotion;
  accent?: "pink" | "gold" | "peach";
}) {
  const motionMap: Record<SectionMotion, { initial: Record<string, number>; whileInView: Record<string, number> }> = {
    "fade-up": {
      initial: { opacity: 0, y: 38 },
      whileInView: { opacity: 1, y: 0 },
    },
    "slide-left": {
      initial: { opacity: 0, x: 54, y: 16 },
      whileInView: { opacity: 1, x: 0, y: 0 },
    },
    "slide-right": {
      initial: { opacity: 0, x: -54, y: 16 },
      whileInView: { opacity: 1, x: 0, y: 0 },
    },
    "soft-zoom": {
      initial: { opacity: 0, scale: 0.94, y: 30 },
      whileInView: { opacity: 1, scale: 1, y: 0 },
    },
    "float-up": {
      initial: { opacity: 0, y: 54, rotate: 0.8 },
      whileInView: { opacity: 1, y: 0, rotate: 0 },
    },
    curtain: {
      initial: { opacity: 0, y: 28, scaleY: 0.96 },
      whileInView: { opacity: 1, y: 0, scaleY: 1 },
    },
  };

  const accentMap = {
    pink: "from-[#F89AB1]/0 via-[#F89AB1]/30 to-[#F89AB1]/0",
    gold: "from-[#E9BE78]/0 via-[#E9BE78]/35 to-[#E9BE78]/0",
    peach: "from-[#FFBE93]/0 via-[#FFBE93]/32 to-[#FFBE93]/0",
  } as const;

  const config = motionMap[variant];

  return (
    <motion.div
      initial={config.initial}
      whileInView={config.whileInView}
      viewport={{ once: true, amount: 0.12, margin: "-80px" }}
      transition={{
        duration: 0.95,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative origin-center"
    >
      <motion.div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-[14%] top-0 h-px bg-gradient-to-r ${accentMap[accent]}`}
        initial={{ opacity: 0, scaleX: 0.35 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: delay + 0.08, ease: "easeOut" }}
      />
      {children}
    </motion.div>
  );
}

function HomeAmbientDecor() {
  const floatingIcons = [
    { symbol: "✦", left: "6%", top: "16%", size: "text-[26px]", delay: "0s", duration: "8s" },
    { symbol: "♡", right: "8%", top: "28%", size: "text-[22px]", delay: "1.4s", duration: "9s" },
    { symbol: "✿", left: "10%", top: "48%", size: "text-[24px]", delay: "0.8s", duration: "10s" },
    { symbol: "✦", right: "12%", top: "62%", size: "text-[18px]", delay: "2.2s", duration: "7.5s" },
    { symbol: "☁", left: "14%", top: "78%", size: "text-[28px]", delay: "1.2s", duration: "11s" },
    { symbol: "♡", right: "10%", top: "86%", size: "text-[20px]", delay: "2.8s", duration: "8.5s" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-8%] top-[6%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(248,147,170,0.16),transparent_68%)] blur-3xl animate-[homeOrb_16s_ease-in-out_infinite]" />
      <div className="absolute right-[-10%] top-[18%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,192,136,0.16),transparent_70%)] blur-3xl animate-[homeOrb_20s_ease-in-out_infinite_1.8s]" />
      <div className="absolute left-[18%] top-[40%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(255,223,184,0.18),transparent_72%)] blur-3xl animate-[homeOrb_18s_ease-in-out_infinite_3s]" />
      <div className="absolute right-[14%] top-[68%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(246,168,186,0.12),transparent_72%)] blur-3xl animate-[homeOrb_22s_ease-in-out_infinite_4s]" />

      {floatingIcons.map((item, index) => (
        <span
          key={index}
          className={`absolute hidden select-none text-[#D79B62]/20 lg:block ${item.size}`}
          style={{
            left: item.left,
            right: item.right,
            top: item.top,
            animation: `homeFloat ${item.duration} ease-in-out infinite`,
            animationDelay: item.delay,
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}

function Home() {
  const {
    state: { user },
  } = useContextPro();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-hero-bg)] text-[var(--color-text-primary)]">
      <style>{`
        @keyframes homeOrb {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate3d(0, -24px, 0) scale(1.08); opacity: 1; }
        }
        @keyframes homeFloat {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.18; }
          50% { transform: translate3d(0, -16px, 0) rotate(8deg); opacity: 0.32; }
        }
      `}</style>

      <HomeAmbientDecor />

      <div
        className="relative z-30 bg-[var(--color-header-bg)] bg-cover bg-center px-4 py-3 sm:px-8 sm:py-4"
      >
        <Header />
      </div>

       <Hero />

      <div className="relative z-10">
        <RevealSection delay={0.05} variant="soft-zoom" accent="peach">
          <LimitedOfferBanner />
        </RevealSection>
        <div className="relative">
          <FeaturedDesserts />
        </div>
        <RevealSection variant="curtain" accent="pink">
          <ChefChoiceSection />
        </RevealSection>
        <RevealSection variant="slide-left" accent="peach">
          <BestSellersSection />
        </RevealSection>
        <RevealSection variant="float-up" accent="gold">
          <HowItWorksSection />
        </RevealSection>
        <RevealSection variant="soft-zoom" accent="pink">
          <OrderNowSection />
        </RevealSection>
        <RevealSection variant="slide-right" accent="peach">
          <BackstorySection />
        </RevealSection>
        <RevealSection variant="fade-up" accent="gold">
          <SweetPointsPreview />
        </RevealSection>
        <RevealSection variant="curtain" accent="peach">
          <CraftedWithLoveSection />
        </RevealSection>
        <RevealSection variant="slide-left" accent="pink">
          <FaqSection />
        </RevealSection>
        <RevealSection variant="soft-zoom" accent="gold">
          <ReviewsSection />
        </RevealSection>
        <RevealSection variant="float-up" accent="peach">
          <SweetMomentsSection />
        </RevealSection>
        <RevealSection variant="fade-up" accent="pink">
          <Footer />
        </RevealSection>
      </div>

      <StickyCartButton />
      <NeedHelpButton />
      <BackToTopButton />
      <BirthdayGreetingModal enabled={Boolean(user?.id)} />
    </main>
  );
}

export default Home;
