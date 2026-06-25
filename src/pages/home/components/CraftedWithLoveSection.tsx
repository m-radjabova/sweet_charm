import { useEffect, useMemo, useRef, useState } from "react";
import { HiMiniHeart, HiMiniPlay, HiMiniSparkles } from "react-icons/hi2";
import { PiBowlFood, PiCake, PiCoffee, PiCookie, PiStarFour, PiFlowerTulip, PiHeartbeat, PiButterfly } from "react-icons/pi";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
    layout: "left",   // video on left, text on right
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

// ---- Enhanced floating decorative elements ----
const floatElements = [
  { Icon: HiMiniSparkles, left: "5%", top: "12%", delay: 0, size: "h-8 w-8", color: "text-[#F7C4D3]/30" },
  { Icon: HiMiniHeart, right: "8%", top: "10%", delay: 0.6, size: "h-9 w-9", color: "text-[#F3D8BF]/30" },
  { Icon: PiStarFour, left: "12%", bottom: "15%", delay: 1.2, size: "h-7 w-7", color: "text-[#F7C4D3]/25" },
  { Icon: PiFlowerTulip, right: "12%", bottom: "12%", delay: 0.3, size: "h-8 w-8", color: "text-[#F3D8BF]/25" },
  { Icon: PiButterfly, left: "48%", top: "4%", delay: 0.9, size: "h-6 w-6", color: "text-[#F7C4D3]/20" },
  { Icon: PiHeartbeat, right: "48%", bottom: "6%", delay: 1.5, size: "h-6 w-6", color: "text-[#F3D8BF]/20" },
];

// ---- Parallax decorative element ----
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

// ---- SVG ornamental divider ----
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

// ---- Single story card with alternating layout ----
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
  const isLeft = item.layout === "left";
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      initial={{ opacity: 0, y: 60 }}
      whileInView={isVisible ? { opacity: 1, y: 0 } : {}}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`relative mx-auto max-w-6xl ${index > 0 ? "mt-10 lg:mt-16" : ""}`}
    >
      <div
        className={`relative flex flex-col ${
          isLeft ? "lg:flex-row" : "lg:flex-row-reverse"
        } gap-0 overflow-hidden rounded-[36px] border border-white/80 bg-white shadow-[0_20px_60px_rgba(126,77,34,0.06)] transition-all duration-500 lg:rounded-[48px] ${
          isHovered ? "shadow-[0_32px_80px_rgba(126,77,34,0.14)]" : ""
        }`}
      >
        {/* ---- Top accent border ----
        <div className="absolute left-0 right-0 top-0 z-10 h-[3px] bg-gradient-to-r from-transparent via-[#D39AA3] to-transparent" /> */}

        {/* ===== VIDEO COLUMN (50% width on desktop) ===== */}
        <div className={`relative w-full overflow-hidden lg:w-[50%] ${isLeft ? "lg:rounded-l-[48px]" : "lg:rounded-r-[48px]"} ${isLeft ? "" : ""}`}>
          {/* Aspect ratio container for mobile, full height on desktop */}
          <div className="relative aspect-[4/3] overflow-hidden bg-[#F8E7DD] lg:aspect-auto lg:h-full lg:min-h-[420px]">
            {/* Tag badge - slide in from side */}
            <motion.div
              className={`absolute left-4 top-4 z-20 rounded-full ${item.tagColor} px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] shadow-lg backdrop-blur-md`}
              initial={{ x: isLeft ? -30 : 30, opacity: 0 }}
              animate={
                isHovered
                  ? { x: 0, opacity: 1 }
                  : { x: isLeft ? -30 : 30, opacity: 0 }
              }
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <span className="flex items-center gap-1.5">
                <HiMiniSparkles className="h-3 w-3" />
                {item.tag}
              </span>
            </motion.div>

            {/* Video */}
            {isReadyToLoad ? (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                className="h-full w-full object-cover transition-all duration-700"
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

            {/* Gradient overlay at bottom */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

            {/* Play button overlay - appears on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px]"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-white/80 bg-white/20 text-white shadow-[0_24px_48px_rgba(0,0,0,0.3)] backdrop-blur-xl"
                  >
                    {/* Pulse rings */}
                    <motion.span
                      className="absolute inset-0 rounded-full border border-white/50"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.span
                      className="absolute inset-0 rounded-full border border-white/30"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.4, 0, 0.4],
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    />
                    <HiMiniPlay className="relative ml-1.5 h-10 w-10 drop-shadow-lg" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Duration badge - bottom right */}
            <motion.div
              className="absolute bottom-4 right-4 z-10 rounded-full bg-black/50 px-4 py-1.5 text-xs font-bold tracking-[0.14em] text-white backdrop-blur-md"
              whileHover={{ scale: 1.05 }}
            >
              {item.duration}
            </motion.div>
          </div>
        </div>

        {/* ===== CONTENT COLUMN (50% width on desktop) ===== */}
        <div
          className={`relative flex w-full flex-col justify-center px-6 py-8 lg:w-[50%] lg:px-10 lg:py-12 ${
            isLeft ? "lg:pl-12" : "lg:pr-12"
          }`}
        >
          {/* Decorative corner accent */}
          <div className={`pointer-events-none absolute top-0 ${isLeft ? "right-0" : "left-0"} h-24 w-24 opacity-[0.04]`}>
            <svg viewBox="0 0 100 100" fill="none">
              <circle cx={isLeft ? 80 : 20} cy="20" r="60" stroke="#4D2710" strokeWidth="0.8" />
              <circle cx={isLeft ? 80 : 20} cy="20" r="40" stroke="#4D2710" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Icon + Title row */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: isLeft ? 20 : -20 }}
            whileInView={isVisible ? { opacity: 1, x: 0 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
          >
            <motion.div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.iconBg} ${item.iconColor} shadow-lg shadow-[rgba(0,0,0,0.04)]`}
              whileHover={{ scale: 1.1, rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Icon className="h-7 w-7" />
            </motion.div>
            <div>
              <h3
                className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[2.4rem] leading-none text-[#4E2811] lg:text-[3rem]"
                style={{
                  background: "linear-gradient(135deg, #4D2710 0%, #7A4B30 60%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {item.title}
              </h3>
              <p className="mt-1.5 text-[15px] font-medium text-[#A87558] tracking-wide">
                {item.caption}
              </p>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            className={`my-5 h-px bg-gradient-to-r ${isLeft ? "from-[#F7C4D3]/40 via-[#F7C4D3]/20 to-transparent" : "from-transparent via-[#F3D8BF]/20 to-[#F3D8BF]/40"}`}
            initial={{ scaleX: 0 }}
            whileInView={isVisible ? { scaleX: 1 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 + index * 0.1 }}
            style={{ transformOrigin: isLeft ? "left" : "right" }}
          />

          {/* Description */}
          <motion.p
            className="text-[16px] leading-8 text-[#7D5B45] lg:text-[17px] lg:leading-9"
            initial={{ opacity: 0, y: 10 }}
            whileInView={isVisible ? { opacity: 1, y: 0 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
          >
            {item.description}
          </motion.p>

          {/* Bottom metadata row */}
          <motion.div
            className={`mt-6 flex flex-wrap items-center gap-4 ${isLeft ? "" : "lg:justify-end"}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={isVisible ? { opacity: 1, y: 0 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F7C4D3]/25 bg-white/70 px-4 py-2 shadow-sm backdrop-blur-sm">
              <HiMiniHeart className="h-4 w-4 text-[#D39AA3]" />
              <span className="text-[12px] font-semibold text-[#B27A65]">
                Handcrafted with passion
              </span>
            </div>
            <motion.button
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F7C4D3]/80 to-[#F3D8BF]/80 px-5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[#6B3E2A] shadow-sm transition-shadow hover:shadow-md"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              Watch Full Story
              <HiMiniPlay className="h-3 w-3" />
            </motion.button>
          </motion.div>
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

        {/* ===== VERTICAL STORY CARDS (alternating layout) ===== */}
        <div className="mt-14 lg:mt-20">
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