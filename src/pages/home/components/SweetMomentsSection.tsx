import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useCallback, useEffect } from "react";
import { getGalleryImages } from "../../../api/galleryImages";
import type { GalleryImage } from "../../../types/types";

/* ─── Helpers ─── */
function mockLikes(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h) + id.charCodeAt(i); h |= 0;
  }
  return Math.max(42, (Math.abs(h) % 2800) + 80);
}

/* ─── Filter Categories ─── */
const CATEGORIES = [
  { id: "all", label: "All Moments", emoji: "✨" },
  { id: "cakes", label: "Cakes", emoji: "🎂" },
  { id: "desserts", label: "Desserts", emoji: "🍰" },
  { id: "events", label: "Events", emoji: "🎉" },
  { id: "behind", label: "Behind Scenes", emoji: "🎬" },
];

/* ─── Floating Decorations ─── */
const FLOATING_ELEMENTS = [
  { emoji: "🌸", x: "4%", y: "12%", delay: "0s", size: 22 },
  { emoji: "✨", x: "95%", y: "8%", delay: "0.5s", size: 18 },
  { emoji: "🍬", x: "6%", y: "78%", delay: "1s", size: 16 },
  { emoji: "⭐", x: "91%", y: "85%", delay: "0.3s", size: 20 },
  { emoji: "♥", x: "48%", y: "4%", delay: "0.8s", size: 14 },
  { emoji: "❁", x: "97%", y: "42%", delay: "1.2s", size: 12 },
  { emoji: "✿", x: "2%", y: "44%", delay: "0.6s", size: 18 },
  { emoji: "◇", x: "50%", y: "96%", delay: "0.9s", size: 16 },
];

/* ─── Gallery Card (premium masonry style) ─── */
function GalleryCard({
  image,
  index,
  span,
}: {
  image: GalleryImage;
  index: number;
  span: "normal" | "tall" | "wide";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const likes = mockLikes(image.id) + (isLiked ? 1 : 0);

  const handleDoubleClick = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      setShowHeartBurst(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowHeartBurst(false), 800);
    }
  }, [isLiked]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const spanClass =
    span === "tall"
      ? "md:row-span-2"
      : span === "wide"
        ? "md:col-span-2"
        : "";

  return (
    <div
      className={`group relative overflow-hidden rounded-[20px] bg-[#F5EBD2] shadow-[0_4px_24px_rgba(104,64,10,0.06)] transition-all duration-500 hover:shadow-[0_16px_48px_rgba(104,64,10,0.14)] ${spanClass}`}
      style={{
        animation: `cardAppear 0.6s ease-out ${index * 0.06}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* ─── Image container ─── */}
      <div className="relative h-full w-full min-h-[180px] overflow-hidden">
        <img
          src={image.image_url}
          alt={image.title ?? "SweetCharm moment"}
          className="h-full w-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient overlay (appears on hover) */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Heart burst on double-click */}
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-[400ms] ${
            showHeartBurst ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-[72px] w-[72px] drop-shadow-2xl">
            <defs>
              <linearGradient
                id={`heartGrad-${image.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#F58529" />
                <stop offset="50%" stopColor="#DD2A7B" />
                <stop offset="100%" stopColor="#8134AF" />
              </linearGradient>
            </defs>
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={`url(#heartGrad-${image.id})`}
            />
          </svg>
        </div>

        {/* ─── Top like button ─── */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked((p) => !p);
          }}
          className="pointer-events-auto absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-white/40 active:scale-90 group-hover:opacity-100"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-[16px] w-[16px] transition-all duration-300 ${
              isLiked
                ? "scale-110 fill-[#ED4956]"
                : "fill-white"
            }`}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* ─── Hover content (bottom) ─── */}
        <div
          className={`pointer-events-none absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 ${
            isHovered
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          {image.title && (
            <h3 className="text-[15px] font-semibold text-white drop-shadow-lg">
              {image.title}
            </h3>
          )}
          <div className="mt-1.5 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 fill-white/90 drop-shadow"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-[11px] font-medium text-white/90">
                {likes >= 1000
                  ? `${(likes / 1000).toFixed(1)}k`
                  : likes.toLocaleString()}
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-white/50">
              {index + 1} day{index > 0 ? "s" : ""} ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function SkeletonCard({
  span,
}: {
  span: "normal" | "tall" | "wide";
}) {
  const spanClass =
    span === "tall"
      ? "md:row-span-2"
      : span === "wide"
        ? "md:col-span-2"
        : "";
  return (
    <div
      className={`animate-pulse overflow-hidden rounded-[20px] bg-gradient-to-br from-[#F0E3C8] to-[#E6D4B0] ${spanClass}`}
    >
      <div className="min-h-[180px] w-full" />
    </div>
  );
}

/* ─── Main Section ─── */
function SweetMomentsSection() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["gallery-images"],
    queryFn: () => getGalleryImages(9),
  });

  const [activeCategory, setActiveCategory] = useState("all");

  /* Masonry layout pattern: mix of normal, tall, wide cards */
  const layoutPattern: Array<"normal" | "tall" | "wide"> = [
    "normal", "tall", "normal",
    "wide",   "normal", "normal",
    "normal", "normal", "tall",
  ];

  return (
    <section className="relative overflow-hidden bg-[#FEF7E7] pb-24 pt-16 lg:pb-32 lg:pt-24">
      {/* ── Background ambient orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 top-[8%] h-[500px] w-[500px] animate-[orbFloat_12s_ease-in-out_infinite] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(244,226,182,0.4) 0%, transparent 72%)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute -right-20 bottom-[10%] h-[460px] w-[460px] animate-[orbFloat_14s_ease-in-out_infinite_2s] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(232,213,176,0.35) 0%, transparent 72%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute left-[35%] top-[45%] h-[320px] w-[320px] animate-[orbFloat_10s_ease-in-out_infinite_4s] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(255,232,214,0.3) 0%, transparent 72%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* ── Floating decorative elements ── */}
      {FLOATING_ELEMENTS.map((el, i) => (
        <span
          key={i}
          className="pointer-events-none absolute animate-[floatElem_9s_ease-in-out_infinite] select-none"
          style={{
            left: el.x,
            top: el.y,
            fontSize: el.size,
            animationDelay: el.delay,
            opacity: 0.35,
          }}
        >
          {el.emoji}
        </span>
      ))}

      {/* ── Top wavy divider ── */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-16 opacity-[0.03]">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 32 Q180 0 360 32 T720 32 T1080 32 T1440 32 V64 H0 V32Z"
            fill="#68400A"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* ════════════════════════════════════════ */}
        {/* SECTION HEADER                          */}
        {/* ════════════════════════════════════════ */}
        <div className="mb-12 text-center">
          {/* Decorative top */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#D4B896]" />
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F5EBD2] text-[11px]">
              ✦
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#D4B896]" />
          </div>

          <h2
            className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0.02em] text-[#68400A]"
            style={{ fontSize: "clamp(3rem, 7vw, 5.2rem)" }}
          >
            Sweet Moments
          </h2>

          {/* Underline decoration */}
          <div className="mx-auto mt-3 flex items-center justify-center gap-2">
            <span className="h-[3px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#D4B896] to-transparent" />
            <span className="h-2 w-2 rotate-45 rounded-sm bg-[#D4B896]" />
            <span className="h-[3px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#D4B896] to-transparent" />
          </div>

          <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-relaxed text-[#8F6A2F]/60 sm:text-[16px]">
            Every dessert tells a story, every moment becomes a memory worth
            cherishing
          </p>
        </div>

        {/* ════════════════════════════════════════ */}
        {/* CATEGORY FILTERS (pill style)           */}
        {/* ════════════════════════════════════════ */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-[#68400A] text-white shadow-lg shadow-[#68400A]/15"
                    : "border border-[#E8D5B0]/50 bg-white/60 text-[#68400A]/60 shadow-sm backdrop-blur-sm hover:border-[#D4B896] hover:bg-white hover:text-[#68400A] hover:shadow-md"
                }`}
              >
                <span className="text-[15px]">{cat.emoji}</span>
                {cat.label}
                {isActive && (
                  <span className="absolute inset-0 animate-pulse rounded-full bg-white/10" />
                )}
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════ */}
        {/* GALLERY GRID (masonry style)             */}
        {/* ════════════════════════════════════════ */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard
                key={i}
                span={layoutPattern[i % layoutPattern.length]}
              />
            ))}
          </div>
        ) : isError || data.length === 0 ? (
          <div className="mx-auto mt-8 max-w-[420px]">
            <div className="rounded-[24px] border border-[#F4E2B6] bg-white/70 px-8 py-16 text-center backdrop-blur-sm">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-[3px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                  <span className="text-[34px]">📸</span>
                </div>
              </div>
              <p className="text-[18px] font-semibold text-[#68400A]">
                No moments yet
              </p>
              <p className="mt-1.5 text-[14px] text-[#B09466]">
                We are baking something sweet for your feed!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {data.slice(0, 9).map((image, index) => (
              <GalleryCard
                key={image.id}
                image={image}
                index={index}
                span={layoutPattern[index % layoutPattern.length]}
              />
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* INSTAGRAM CTA                            */}
        {/* ════════════════════════════════════════ */}
        {!isLoading && data.length > 0 && (
          <div className="mt-14 text-center">
            <div className="relative mx-auto inline-flex flex-col items-center gap-4 overflow-hidden rounded-[24px] border border-[#E8D5B0]/40 bg-gradient-to-b from-white/80 to-[#FFF8F1]/60 px-8 py-7 shadow-[0_8px_32px_rgba(104,64,10,0.04)] backdrop-blur-sm sm:flex-row sm:gap-6 sm:px-12 sm:py-6">
              {/* subtle border accent */}
              <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4B896] to-transparent" />

              {/* avatar */}
              <div className="shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-[2.5px] shadow-lg">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-[14px] font-bold text-[#68400A]">
                    SC
                  </div>
                </div>
              </div>

              {/* text */}
              <div>
                <p className="text-[15px] font-semibold text-[#68400A]">
                  @sweet_charm
                </p>
                <p className="text-[13px] text-[#8F6A2F]/60">
                  Follow us on Instagram for daily sweet inspiration
                </p>
              </div>

              {/* button */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] px-6 py-2.5 text-[13px] font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-white"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Follow
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  →
                </span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes cardAppear {
          0% { opacity: 0; transform: scale(0.92) translateY(16px); }
          60% { transform: scale(1.01) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes floatElem {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(3deg); }
          50% { transform: translateY(-16px) rotate(-2deg); }
          75% { transform: translateY(-6px) rotate(4deg); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-10px, 15px) scale(0.95); }
        }
      `}</style>
    </section>
  );
}

export default SweetMomentsSection;