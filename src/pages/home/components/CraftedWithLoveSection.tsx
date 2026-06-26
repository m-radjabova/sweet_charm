import { useEffect, useMemo, useRef, useState } from "react";
import { HiMiniHeart, HiMiniSparkles } from "react-icons/hi2";
import { PiBowlFood, PiCake, PiCoffee, PiCookie, PiStarFour, PiFlowerTulip, PiHeartbeat, PiButterfly } from "react-icons/pi";
import { motion, useScroll, useTransform } from "framer-motion";
import cakeDecoratingVideo from "../../../assets/videos/Cake_Decorating.mp4";
import latteArtVideo from "../../../assets/videos/Latte_Art.mp4";
import freshBakeryVideo from "../../../assets/videos/Fresh_Bakery.mp4";
import cakeServingVideo from "../../../assets/videos/Cake_Serving.mp4";

const storyVideos = [
  {
    id: "cake-decorating",
    title: "Cake Decorating",
    caption: "Hand-decorated with love",
    description: "Watch as our pastry chefs transform simple ingredients into edible works of art, layer by delicate layer.",
    duration: "0:12",
    video: cakeDecoratingVideo,
    Icon: PiCake,
    accent: "from-[#FFF1F5] via-[#FFF5F7] to-white",
    ring: "ring-[#F7C4D3]/60",
    iconBg: "from-[#FFF1F5] to-[#FFE2EB]",
    iconColor: "text-[#E87894]",
    tag: "Signature",
    tagColor: "bg-[#F7C4D3]/30 text-[#B8627A]",
    layout: "left",
    gradient: "bg-gradient-to-br from-[#FFF1F5] via-[#FFF5F7] to-white",
  },
  {
    id: "coffee-crafting",
    title: "Coffee Crafting",
    caption: "Perfect brews, every time",
    description: "The art of coffee meets precision and passion — from bean to cup, every step tells a story.",
    duration: "0:10",
    video: latteArtVideo,
    Icon: PiCoffee,
    accent: "from-[#FFF5EC] via-[#FFF9F4] to-white",
    ring: "ring-[#F3D8BF]/70",
    iconBg: "from-[#FFF5EC] to-[#FFEBD6]",
    iconColor: "text-[#D49A6A]",
    tag: "Barista",
    tagColor: "bg-[#F3D8BF]/30 text-[#A8774D]",
    layout: "right",  // video on right, text on left
    gradient: "bg-gradient-to-bl from-[#FFF5EC] via-[#FFF9F4] to-white",
  },
  {
    id: "fresh-oven",
    title: "Fresh From The Oven",
    caption: "Baked fresh, every morning",
    description: "The aroma of freshly baked goods fills our kitchen each dawn — warmth you can taste in every bite.",
    duration: "0:11",
    video: freshBakeryVideo,
    Icon: PiCookie,
    accent: "from-[#FFF4EC] via-[#FFF9F5] to-white",
    ring: "ring-[#F0D2BE]/70",
    iconBg: "from-[#FFF4EC] to-[#FFE8D6]",
    iconColor: "text-[#D4946A]",
    tag: "Fresh",
    tagColor: "bg-[#F0D2BE]/30 text-[#A87A5A]",
    layout: "left",
    gradient: "bg-gradient-to-br from-[#FFF4EC] via-[#FFF9F5] to-white",
  },
  {
    id: "serving-happiness",
    title: "Serving Happiness",
    caption: "Made to make you smile",
    description: "The best part of our day is seeing the joy on your face with every sweet surprise unwrapped.",
    duration: "0:09",
    video: cakeServingVideo,
    Icon: PiBowlFood,
    accent: "from-[#FFF2EE] via-[#FFF8F5] to-white",
    ring: "ring-[#F4D7CF]/70",
    iconBg: "from-[#FFF2EE] to-[#FFE4DA]",
    iconColor: "text-[#D4897A]",
    tag: "Joy",
    tagColor: "bg-[#F4D7CF]/30 text-[#A87265]",
    layout: "right",
    gradient: "bg-gradient-to-bl from-[#FFF2EE] via-[#FFF8F5] to-white",
  },
] as const;

const floatElements = [
  { Icon: HiMiniSparkles, left: "5%", top: "12%", delay: 0, size: "h-8 w-8", color: "text-[#F7C4D3]/30" },
  { Icon: HiMiniHeart, right: "8%", top: "10%", delay: 0.6, size: "h-9 w-9", color: "text-[#F3D8BF]/30" },
  { Icon: PiStarFour, left: "12%", bottom: "15%", delay: 1.2, size: "h-7 w-7", color: "text-[#F7C4D3]/25" },
  { Icon: PiFlowerTulip, right: "12%", bottom: "12%", delay: 0.3, size: "h-8 w-8", color: "text-[#F3D8BF]/25" },
  { Icon: PiButterfly, left: "48%", top: "4%", delay: 0.9, size: "h-6 w-6", color: "text-[#F7C4D3]/20" },
  { Icon: PiHeartbeat, right: "48%", bottom: "6%", delay: 1.5, size: "h-6 w-6", color: "text-[#F3D8BF]/20" },
];

function ParallaxSparkles() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 0.5], [0, -30]);
  const y2 = useTransform(scrollYProgress, [0, 0.5], [0, 30]);
  const y3 = useTransform(scrollYProgress, [0, 0.5], [0, -20]);
  const y4 = useTransform(scrollYProgress, [0, 0.5], [0, 20]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-[8%] top-[20%] h-[80px] w-[80px] rounded-full border border-[#F7C4D3]/20"
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute right-[12%] top-[30%] h-[60px] w-[60px] rounded-full border border-[#F3D8BF]/20"
        style={{ y: y2 }}
      />
      <motion.div
        className="absolute left-[20%] bottom-[20%] h-[40px] w-[40px] rounded-full border border-[#F7C4D3]/15"
        style={{ y: y3 }}
      />
      <motion.div
        className="absolute right-[20%] bottom-[30%] h-[50px] w-[50px] rounded-full border border-[#F3D8BF]/15"
        style={{ y: y4 }}
      />
    </div>
  );
}


function OrnamentalDivider({ color = "#D39AA3" }: { color?: string }) {
  return (
    <svg className="mx-auto h-6 w-32" viewBox="0 0 120 24" fill="none">
      <path d="M0 12 L30 12" stroke={color} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="40" cy="12" r="2" fill={color} fillOpacity="0.5" />
      <path d="M44 8 L60 12 L44 16" stroke={color} strokeOpacity="0.3" strokeWidth="1.2" fill="none" />
      <circle cx="66" cy="12" r="3" fill={color} fillOpacity="0.6">
        <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
      </circle>
      <path d="M76 8 L60 12 L76 16" stroke={color} strokeOpacity="0.3" strokeWidth="1.2" fill="none" />
      <circle cx="80" cy="12" r="2" fill={color} fillOpacity="0.5" />
      <path d="M90 12 L120 12" stroke={color} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  );
}

function StoryCard({
  item,
  index,
  isVisible,
  isReadyToLoad,
  videoRefs,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: {
  item: (typeof storyVideos)[number];
  index: number;
  isVisible: boolean;
  isReadyToLoad: boolean;
  videoRefs: React.MutableRefObject<(HTMLVideoElement | null)[]>;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const Icon = item.Icon;
  const step = `${index + 1}`.padStart(2, "0");

  return (
    <motion.div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      initial={{ opacity: 0, y: 36 }}
      whileInView={isVisible ? { opacity: 1, y: 0 } : {}}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group relative overflow-hidden rounded-[28px] border border-white/85 bg-[#F8E7DD] shadow-[0_18px_44px_rgba(126,77,34,0.08)] transition-all duration-500 sm:rounded-[32px] lg:rounded-[34px]"
    >
      <div className="relative aspect-[1.2/1] overflow-hidden sm:aspect-[16/9]">
        {isReadyToLoad ? (
          <video
            ref={(el) => {
              videoRefs.current[index] = el;
            }}
            className="h-full w-full object-cover transition-transform duration-700"
            style={{
              transform: isHovered ? "scale(1.06)" : "scale(1)",
            }}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
          >
            <source src={item.video} type="video/mp4" />
          </video>
        ) : (
          <div className="h-full w-full animate-pulse bg-[linear-gradient(120deg,#F8E7DD,#FFF4EC,#F8E7DD)] bg-[length:200%_100%]" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(65,38,16,0.12)_0%,rgba(65,38,16,0.14)_36%,rgba(36,18,8,0.55)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_30%)]" />

        <motion.div
          className={`absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/18 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/92 shadow-[0_12px_24px_rgba(0,0,0,0.14)] backdrop-blur-md sm:left-5 sm:top-5 ${item.tagColor}`}
          animate={{
            y: isHovered ? -2 : 0,
            opacity: isHovered ? 1 : 0.92,
          }}
          transition={{ duration: 0.25 }}
        >
          <Icon className="h-3.5 w-3.5" />
          {item.tag}
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6 lg:p-7">
          <div className="max-w-[78%]">
            <div className="flex items-baseline gap-3">
              <span className="text-[1.85rem] font-black leading-none text-[#FF8FA8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)] sm:text-[2rem]">
                {step}
              </span>
              <h3 className="font-['Trebuchet_MS','Avenir_Next',sans-serif] text-[1.5rem] font-semibold leading-tight text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.28)] sm:text-[1.8rem]">
                {item.title}
              </h3>
            </div>
            <p className="mt-2 text-[0.98rem] leading-7 text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)] sm:text-[1.05rem]">
              {item.description}
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-20 rounded-full border border-white/25 bg-black/28 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-white backdrop-blur-md sm:bottom-5 sm:right-5">
          {item.duration}
        </div>
      </div>
    </motion.div>
  );
}

export default function CraftedWithLoveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isReadyToLoad, setIsReadyToLoad] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setIsReadyToLoad(true);
        }
      },
      { threshold: 0.1, rootMargin: "100px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean);
    if (videos.length === 0) return;

    if (!isVisible) {
      videos.forEach((video) => video?.pause());
      return;
    }

    videos.forEach((video) => {
      if (!video) return;
      video.muted = true;
      void video.play().catch(() => undefined);
    });
  }, [isVisible, isReadyToLoad]);

  const cards = useMemo(() => storyVideos, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(255,245,240,0.98),rgba(255,255,255,1)_40%,rgba(255,240,235,0.97)_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-28"
    >
      {/* ===== DECORATIVE AMBIENT BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main central glow */}
        <motion.div
          className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,200,215,0.2),transparent_70%)] blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Warm glow left */}
        <motion.div
          className="absolute -left-24 top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,214,194,0.18),transparent_70%)] blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Warm glow right */}
        <motion.div
          className="absolute -right-24 top-48 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,222,205,0.18),transparent_70%)] blur-3xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />

        {/* Bottom glow */}
        <motion.div
          className="absolute -bottom-40 left-[20%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(247,196,211,0.12),transparent_70%)] blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Parallax decorative circles */}
        <ParallaxSparkles />

        {/* Floating decorative elements */}
        {isVisible &&
          floatElements.map((el, i) => (
            <motion.div
              key={i}
              className={`absolute max-md:hidden ${el.size} ${el.color}`}
              style={{
                left: el.left as string | undefined,
                right: el.right as string | undefined,
                top: el.top as string | undefined,
                bottom: el.bottom as string | undefined,
              }}
              initial={{ opacity: 0, y: 20, rotate: -20 }}
              animate={{
                opacity: 0.6,
                y: [0, -14, 0],
                rotate: [0, 6, -6, 0],
              }}
              transition={{
                opacity: { duration: 1, delay: 0.5 + el.delay },
                y: {
                  duration: 5 + el.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: el.delay,
                },
                rotate: {
                  duration: 6 + el.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: el.delay,
                },
              }}
            >
              <el.Icon />
            </motion.div>
          ))}
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative mx-auto max-w-[1320px]">
        {/* ===== SECTION HEADER ===== */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Badge */}
          <motion.div
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#F7C4D3]/25 bg-white/80 px-5 py-2 shadow-[0_8px_24px_rgba(211,154,163,0.12)] backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={isVisible ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <HiMiniSparkles className="h-4 w-4 text-[#D39AA3]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#D39AA3]">
              Our Story In Every Moment
            </span>
            <HiMiniSparkles className="h-4 w-4 text-[#D39AA3]" />
          </motion.div>

          {/* Title */}
          <h2
            className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[clamp(3.2rem,8vw,5.5rem)] leading-[0.92]"
            style={{
              background: "linear-gradient(145deg, #3D1F0A 0%, #6B3E1A 35%, #9C5A2E 65%, #4D2710 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 2px 12px rgba(77,39,16,0.10))",
            }}
          >
            Crafted With Love
          </h2>

          {/* Ornamental divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isVisible ? { opacity: 1, scaleX: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ transformOrigin: "center" }}
          >
            <OrnamentalDivider color="#D39AA3" />
          </motion.div>

          {/* Description */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-balance text-[17px] leading-8 text-[#7D5B45] sm:text-[20px] sm:leading-9"
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            From our kitchen to your heart. Watch how every sweet treat is made with care, premium
            ingredients, and warm little details.
          </motion.p>
        </motion.div>

        {/* ===== VIDEO SHOWCASE GRID ===== */}
        <div className="mt-14 grid gap-6 sm:gap-7 lg:mt-18 lg:grid-cols-2 lg:gap-8">
          {cards.map((item, index) => (
            <StoryCard
              key={item.id}
              item={item}
              index={index}
              isVisible={isVisible}
              isReadyToLoad={isReadyToLoad}
              videoRefs={videoRefs}
              isHovered={hoveredIndex === index}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
            />
          ))}
        </div>

        {/* ===== BOTTOM ORNAMENT ===== */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-4 lg:mt-20"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <OrnamentalDivider color="#D39AA3" />

          <motion.p
            className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#D39AA3]/60"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Every detail tells a story
          </motion.p>
        </motion.div>
      </div>

      {/* ===== INLINE KEYFRAMES ===== */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(2deg); }
          66% { transform: translateY(-4px) rotate(-1deg); }
        }
      `}</style>
    </section>
  );
}
