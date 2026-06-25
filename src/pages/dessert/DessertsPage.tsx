import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  HiMiniBars3,
  HiMiniChevronRight,
  HiOutlineHeart,
  HiMiniHeart,
  HiMiniStar,
  HiMiniShoppingBag,
  HiMiniAdjustmentsHorizontal,
  HiMiniXMark,
  HiMiniChevronDown,
  HiMiniMagnifyingGlass,
  HiMiniCheck,
  HiMiniSparkles,
  HiMiniSquares2X2,
} from "react-icons/hi2";
import { getAllDesserts, getDessertCategories } from "../../api/desserts";
import type { FeaturedDessert } from "../../types/types";
import { useFavorites } from "../account/hooks/useFavorites";
import { useCart } from "../../hooks/useCart";
import { toast } from "react-toastify";
import Header from "../home/components/Header";
import Footer from "../home/components/Footer";
import bunnyMascot from "../../assets/profile/profile_bunny2.png";

// ─── Animations ────────────────────────────────────────────
const animationStyles = `
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-12px) rotate(3deg); }
  66% { transform: translateY(6px) rotate(-2deg); }
}
@keyframes float-delayed {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(-4deg); }
}
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.2); }
}
@keyframes twinkle-delayed {
  0%, 100% { opacity: 0.2; transform: scale(0.6); }
  50% { opacity: 0.7; transform: scale(1.1); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.25); }
  30% { transform: scale(1); }
  45% { transform: scale(1.15); }
  60% { transform: scale(1); }
}
@keyframes cloud-move {
  0% { transform: translateX(-10px); }
  50% { transform: translateX(10px); }
  100% { transform: translateX(-10px); }
}
@keyframes cloud-move-reverse {
  0% { transform: translateX(10px); }
  50% { transform: translateX(-10px); }
  100% { transform: translateX(10px); }
}
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .animate-float, .animate-float-delayed, .animate-twinkle, .animate-twinkle-delayed,
  .animate-cloud, .animate-cloud-reverse, .animate-heart-beat {
    animation: none !important;
  }
}
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-float-delayed { animation: float-delayed 5s ease-in-out infinite 1s; }
.animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
.animate-twinkle-delayed { animation: twinkle-delayed 4s ease-in-out infinite 1.5s; }
.animate-heart-beat { animation: heart-beat 0.6s ease-in-out; }
.animate-cloud { animation: cloud-move 8s ease-in-out infinite; }
.animate-cloud-reverse { animation: cloud-move-reverse 10s ease-in-out infinite; }
.animate-slide-up { animation: slide-up 0.35s cubic-bezier(0.16,1,0.3,1); }
.shimmer-bg {
  background: linear-gradient(90deg, #FAEFE3 25%, #FFF5EA 50%, #FAEFE3 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
`;

// ─── Constants ─────────────────────────────────────────────
const ALL_DESSERTS_CATEGORY = "All Desserts";
const PAGE_SIZE = 12;

const DIETARY_OPTIONS = [
  { label: "Gluten Free", value: "gluten-free" },
  { label: "Vegan", value: "vegan" },
  { label: "Low Sugar", value: "low-sugar" },
] as const;

const RATING_OPTIONS = [
  { label: "5 Stars", value: 5 },
  { label: "4 Stars & up", value: 4 },
  { label: "3 Stars & up", value: 3 },
  { label: "2 Stars & up", value: 2 },
] as const;

// ─── Helpers ───────────────────────────────────────────────
function formatPrice(price?: string | null) {
  const numeric = Number(price ?? 0);
  return `$${numeric.toFixed(2)}`;
}

function getDessertRating(dessert: FeaturedDessert) {
  return Number(dessert.rating_avg ?? 0);
}

function getFilledStars(rating: number) {
  return Math.max(0, Math.min(5, Math.round(rating)));
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

// ─── Dessert Card ──────────────────────────────────────────
function DessertCard({
  dessert,
  index,
  favorite,
  onToggleFavorite,
  layout = "grid",
}: {
  dessert: FeaturedDessert;
  index: number;
  favorite: boolean;
  onToggleFavorite: (dessertId: string, dessert?: FeaturedDessert) => void;
  layout?: "grid" | "list";
}) {
  const [cardRef, inView] = useInView(0.05);
  const [isHovered, setIsHovered] = useState(false);
  const [heartBeat, setHeartBeat] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const rating = getDessertRating(dessert);
  const filledStars = getFilledStars(rating);

  const discountPercent =
    dessert.old_price && Number(dessert.old_price) > Number(dessert.price)
      ? Math.round((1 - Number(dessert.price) / Number(dessert.old_price)) * 100)
      : null;

  function handleToggleFavorite() {
    setHeartBeat(true);
    onToggleFavorite(dessert.id, dessert);
    setTimeout(() => setHeartBeat(false), 600);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    addItem(dessert);
    toast.success(
      <div className="flex items-center gap-3">
        <HiMiniCheck className="h-5 w-5 shrink-0 text-green-400" />
        <span>
          <strong>{dessert.name}</strong> added to cart
        </span>
      </div>,
      { icon: false }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/desserts/${dessert.slug}`, { state: { dessert } });
    }
  }

  if (layout === "list") {
    return (
      <article
        ref={cardRef}
        role="link"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => navigate(`/desserts/${dessert.slug}`, { state: { dessert } })}
        className={`
          group relative flex cursor-pointer gap-4 overflow-hidden rounded-[20px]
          border border-[#F2DDCE]/80 bg-[#FFFDFC] p-3
          shadow-[0_8px_22px_rgba(126,79,35,0.07)]
          transition-all duration-500 ease-out
          hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(126,79,35,0.11)]
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F85D85]
          ${inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
        `}
        style={{
          transitionDelay: `${Math.min(index, 8) * 50}ms`,
          transitionProperty: "transform, opacity, box-shadow",
          transitionDuration: "550ms",
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[16px] sm:h-36 sm:w-36">
          <img
            src={dessert.image_url ?? ""}
            alt={dessert.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          {dessert.is_chef_choice ? (
            <span className="absolute bottom-2 left-2 rounded-full bg-[#FFF0F4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#F25D88] shadow-[0_6px_14px_rgba(242,93,136,0.15)]">
              Chef's Choice
            </span>
          ) : null}
          {discountPercent && (
            <span className="absolute left-2 top-2 rounded-full bg-[#F85D85] px-2.5 py-1 text-[11px] font-bold text-white shadow-[0_6px_14px_rgba(248,93,133,0.25)]">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-[16px] font-bold leading-tight text-[#68400A] sm:text-[18px]">
                {dessert.name}
              </h3>
              {dessert.is_chef_choice ? (
                <span className="mt-1 inline-flex rounded-full bg-[#FFF0F4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#F25D88]">
                  Chef's Choice
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF1F5] text-[#F85D85] transition-transform duration-200 hover:scale-105"
              aria-label={`${favorite ? "Remove" : "Add"} ${dessert.name} ${favorite ? "from" : "to"} favorites`}
              aria-pressed={favorite}
            >
              <HiOutlineHeart
                className={`h-4 w-4 transition-all duration-300 ${heartBeat ? "animate-heart-beat" : ""}`}
                style={{ color: favorite ? "#F86B87" : "#C28564", fill: favorite ? "#F86B87" : "none" }}
              />
            </button>
          </div>

          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <HiMiniStar key={i} className="h-3.5 w-3.5 text-[#F8B737]" style={{ fill: i < filledStars ? "#FEC84D" : "none" }} />
            ))}
            <span className="ml-1.5 text-[12px] font-semibold text-[#7D5636]">{rating > 0 ? rating.toFixed(1) : "0.0"}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-[18px] font-black text-[#F85D85] sm:text-[20px]">{formatPrice(dessert.price)}</span>
              {dessert.old_price && (
                <span className="text-[13px] font-semibold text-[#BDA087] line-through">{formatPrice(dessert.old_price)}</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#F85D85] text-white shadow-[0_8px_16px_rgba(248,93,133,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F24F7B] active:scale-95"
              aria-label={`Add ${dessert.name} to cart`}
            >
              <HiMiniShoppingBag className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      ref={cardRef}
      role="link"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/desserts/${dessert.slug}`, { state: { dessert } })}
      className={`
        group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[20px]
        border border-[#F2DDCE]/80 bg-[#FFFDFC]
        shadow-[0_10px_24px_rgba(126,79,35,0.07)]
        transition-all duration-500 ease-out
        hover:-translate-y-1.5 hover:shadow-[0_16px_34px_rgba(126,79,35,0.11)]
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F85D85]
        ${inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
      `}
      style={{
        transitionDelay: `${Math.min(index, 8) * 50}ms`,
        transitionProperty: "transform, opacity, box-shadow",
        transitionDuration: "550ms",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <div className="relative aspect-[4/3] sm:aspect-[16/13]">
          <img
            src={dessert.image_url ?? ""}
            alt={dessert.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out"
            style={{
              transform: isHovered ? "scale(1.045)" : "scale(1)",
              filter: isHovered ? "brightness(1.03) saturate(1.06)" : "brightness(1) saturate(1)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#8A4F24]/12 via-transparent to-transparent opacity-0 transition-opacity duration-500"
            style={{ opacity: isHovered ? 1 : 0 }}
          />
        </div>

        {discountPercent && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[#F85D85] px-3 py-1.5 text-[12px] font-bold text-white shadow-[0_8px_16px_rgba(248,93,133,0.22)] sm:left-4 sm:top-4 sm:px-3.5 sm:text-[13px]">
            {discountPercent}% OFF
          </span>
        )}
        {dessert.is_chef_choice && (
          <span className="absolute left-3 top-14 z-10 rounded-full bg-[#FFF0F4] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#F25D88] shadow-[0_8px_16px_rgba(242,93,136,0.14)] sm:left-4 sm:top-16">
            Chef's Choice
          </span>
        )}

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(); }}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#F85D85] shadow-[0_8px_16px_rgba(126,79,35,0.12)] backdrop-blur-sm transition-all duration-300 hover:scale-105 sm:right-4 sm:top-4 sm:h-11 sm:w-11"
          aria-label={`${favorite ? "Remove" : "Add"} ${dessert.name} ${favorite ? "from" : "to"} favorites`}
          aria-pressed={favorite}
        >
          <HiOutlineHeart
            className={`h-[17px] w-[17px] transition-all duration-300 sm:h-[18px] sm:w-[18px] ${heartBeat ? "animate-heart-beat" : ""}`}
            style={{
              color: favorite ? "#F86B87" : "#C28564",
              fill: favorite ? "#F86B87" : "none",
            }}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3.5 sm:px-4 sm:pb-4 sm:pt-4">
        <h3 className="line-clamp-1 text-[16px] font-bold leading-tight text-[#68400A] sm:text-[18px]">
          {dessert.name}
        </h3>
        {dessert.is_chef_choice ? (
          <span className="mt-2 inline-flex w-fit rounded-full bg-[#FFF0F4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#F25D88]">
            Chef's Choice
          </span>
        ) : null}

        <div className="mt-2.5 flex items-center gap-0.5 sm:mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <HiMiniStar
              key={i}
              className="h-3.5 w-3.5 text-[#F8B737] sm:h-4 sm:w-4"
              style={{ fill: i < filledStars ? "#FEC84D" : "none" }}
            />
          ))}
          <span className="ml-2 text-[12px] font-semibold text-[#7D5636] sm:text-[13px]">
            {rating > 0 ? rating.toFixed(1) : "0.0"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between sm:mt-4">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-[18px] font-black text-[#F85D85] sm:text-[20px]">{formatPrice(dessert.price)}</span>
            {dessert.old_price && (
              <span className="text-[13px] font-semibold text-[#BDA087] line-through">{formatPrice(dessert.old_price)}</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#F85D85] text-white shadow-[0_8px_18px_rgba(248,93,133,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F24F7B] active:scale-95 sm:h-12 sm:w-12 sm:rounded-[15px]"
            aria-label={`Add ${dessert.name} to cart`}
          >
            <HiMiniShoppingBag className="h-[18px] w-[18px] sm:h-[20px] sm:w-[20px]" />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Dessert Skeleton ──────────────────────────────────────
function DessertSkeleton({ index }: { index: number }) {
  return (
    <div
      className="overflow-hidden rounded-[20px] border border-[#F2DDCE]/60 bg-[#FFFDFC] shadow-[0_8px_22px_rgba(104,64,10,0.05)]"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <div className="aspect-[4/3] shimmer-bg sm:aspect-[16/13]" />
      <div className="space-y-3 px-3.5 pb-3.5 pt-3.5 sm:px-4 sm:pb-4 sm:pt-4">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-3 rounded-full shimmer-bg" />
          ))}
        </div>
        <div className="h-5 w-2/3 rounded-full shimmer-bg" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-16 rounded-full shimmer-bg" />
          <div className="h-10 w-10 rounded-[13px] shimmer-bg" />
        </div>
      </div>
    </div>
  );
}

// ─── Hero Section ──────────────────────────────────────────
function HeroSection() {
  const [heroRef, heroInView] = useInView(0.1);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-[linear-gradient(180deg,#FFEFE7_0%,#FFF8F1_70%,#FFF9F2_100%)] px-4 pb-8 pt-10 sm:px-8 sm:pb-12 sm:pt-16 lg:px-12"
    >
      {/* Floating decorative elements - hidden on small screens to reduce clutter */}
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
        <div className="absolute -left-10 bottom-0 opacity-60">
          <svg width="290" height="120" viewBox="0 0 290 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="80" cy="96" rx="86" ry="28" fill="#FFFDFC" />
            <ellipse cx="30" cy="82" rx="52" ry="30" fill="#FFFDFC" />
            <ellipse cx="144" cy="72" rx="68" ry="34" fill="#FFFDFC" />
            <ellipse cx="220" cy="92" rx="82" ry="28" fill="#FFFDFC" />
          </svg>
        </div>
        <div className="absolute right-0 bottom-4 opacity-70">
          <svg width="300" height="105" viewBox="0 0 300 105" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="76" cy="78" rx="78" ry="26" fill="#FFFDFC" />
            <ellipse cx="142" cy="58" rx="62" ry="34" fill="#FFFDFC" />
            <ellipse cx="224" cy="76" rx="86" ry="28" fill="#FFFDFC" />
          </svg>
        </div>

        <div className="absolute left-[16%] top-[22%] animate-twinkle text-[#F8B737]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div className="absolute right-[31%] top-[44%] animate-twinkle-delayed text-[#F8B737]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div className="absolute left-[27%] top-[16%] animate-twinkle text-white text-2xl">✦</div>
        <div className="absolute right-[24%] top-[21%] animate-twinkle-delayed text-white text-xl">✦</div>
        <div className="absolute left-[33%] bottom-[26%] animate-float text-[#F8B737]/70 text-2xl">✦</div>
      </div>

      <div className="relative mx-auto min-h-[180px] max-w-[1440px] sm:min-h-[230px]">
        <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
          <div
            className={`flex flex-col items-center transition-all duration-700 ${
              heroInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          >
            <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white/85 text-[28px] shadow-[0_12px_30px_rgba(126,79,35,0.10)] sm:mb-5 sm:h-16 sm:w-16 sm:text-[34px]">
              🧁
            </span>

            <h1
              className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0] text-[#68400A]"
              style={{ fontSize: "clamp(2.4rem, 9vw, 5.2rem)" }}
            >
              All Desserts
            </h1>

            <p className="mt-3 max-w-[560px] px-2 text-[14px] font-semibold leading-6 text-[#8F6A2F]/75 sm:mt-4 sm:max-w-[660px] sm:px-0 sm:text-[16px] sm:leading-7">
              Explore our most loved Asian desserts, made with love and premium ingredients.
            </p>
          </div>
        </div>

        <div
          className={`pointer-events-none absolute right-[9%] top-4 hidden transition-all duration-1000 lg:block ${
            heroInView ? "translate-x-0 opacity-100 scale-100" : "translate-x-16 opacity-0 scale-90"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)", transitionDelay: "150ms" }}
        >
          <div className="relative">
            <img
              src={bunnyMascot}
              alt=""
              className="h-44 w-44 animate-float object-contain drop-shadow-[0_18px_28px_rgba(126,79,35,0.10)]"
            />
            <div className="absolute -left-2 bottom-5 animate-twinkle text-[#F8B737] text-lg">✦</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Sidebar Filters ───────────────────────────────────────
interface FilterState {
  category: string;
  priceRange: { min: number; max: number } | null;
  dietary: string | null;
  minRating: number | null;
}

function countActiveFilters(filters: FilterState) {
  return [
    filters.category !== ALL_DESSERTS_CATEGORY,
    !!filters.priceRange,
    !!filters.dietary,
    !!filters.minRating,
  ].filter(Boolean).length;
}

function SidebarFilters({
  filters,
  categories,
  onFilterChange,
  onClear,
  isOpen,
  onToggle,
  onApply,
}: {
  filters: FilterState;
  categories: string[];
  onFilterChange: (key: keyof FilterState, value: unknown) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
  onApply: () => void;
}) {
  const activeCount = countActiveFilters(filters);

  return (
    <>
      {/* Mobile filter toggle button */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[#68400A] shadow-[0_6px_16px_rgba(104,64,10,0.08)] transition-all duration-200 hover:shadow-[0_10px_24px_rgba(104,64,10,0.12)] lg:hidden"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <HiMiniAdjustmentsHorizontal className="h-4.5 w-4.5" />
        <span className="text-sm font-semibold">Filters</span>
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F86B87] text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile filter sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter desserts">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onToggle} />
          <div className="animate-slide-up absolute bottom-0 left-0 right-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-[#FFF9F2] shadow-[0_-8px_40px_rgba(112,68,7,0.12)]">
            <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-[#F0DFCF] absolute left-1/2 top-2.5 -translate-x-1/2" />
              <h3 className="text-lg font-bold text-[#68400A]">Filters</h3>
              <button
                type="button"
                onClick={onToggle}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0DFCF]/50 text-[#68400A]"
                aria-label="Close filters"
              >
                <HiMiniXMark className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <FilterContent filters={filters} categories={categories} onFilterChange={onFilterChange} onClear={onClear} />
            </div>
            <div className="shrink-0 border-t border-[#EED9CB] bg-[#FFF9F2] px-5 py-4">
              <button
                type="button"
                onClick={() => { onApply(); onToggle(); }}
                className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-[#FF7FA3] to-[#F86B87] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(248,107,135,0.25)]"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-[270px] shrink-0 lg:block">
        <div className="sticky top-28 rounded-[22px] border border-[#F1DCCD]/80 bg-white/82 p-6 shadow-[0_14px_36px_rgba(126,79,35,0.08)] backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-3 text-[20px] font-bold text-[#68400A]">
              <HiMiniAdjustmentsHorizontal className="h-5 w-5 text-[#E08B8B]" />
              Filters
            </h3>
            {activeCount > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF1F5] text-[11px] font-bold text-[#F85D85]">
                {activeCount}
              </span>
            )}
          </div>

          <FilterContent filters={filters} categories={categories} onFilterChange={onFilterChange} onClear={onClear} />
        </div>
      </aside>
    </>
  );
}

function FilterContent({
  filters,
  categories,
  onFilterChange,
  onClear,
}: {
  filters: FilterState;
  categories: string[];
  onFilterChange: (key: keyof FilterState, value: unknown) => void;
  onClear: () => void;
}) {
  const sliderMin = filters.priceRange?.min ?? 5;
  const sliderMax = filters.priceRange?.max ?? 100;

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="mb-3.5 text-[15px] font-bold text-[#68400A]">Categories</h4>
        <div className="space-y-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onFilterChange("category", cat)}
              aria-pressed={filters.category === cat}
              className={`flex w-full items-center gap-3 text-left text-[14px] font-semibold transition-all duration-200 ${
                filters.category === cat ? "text-[#68400A]" : "text-[#7D5636] hover:text-[#F85D85]"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  filters.category === cat ? "border-[#F85D85]" : "border-[#E8CFC0] bg-white"
                }`}
              >
                {filters.category === cat && <span className="h-2.5 w-2.5 rounded-full bg-[#F85D85]" />}
              </span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-[#EED9CB]" />

      {/* Price Range */}
      <div>
        <h4 className="mb-3.5 text-[15px] font-bold text-[#68400A]">Price Range</h4>
        <div className="rounded-[16px] bg-[#FFF7F2] px-4 py-4">
          <div className="relative h-8">
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#F1D9CA]" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#F85D85]"
              style={{ left: `${sliderMin}%`, right: `${100 - sliderMax}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={sliderMin}
              onChange={(event) => {
                const nextMin = Math.min(Number(event.target.value), sliderMax - 1);
                onFilterChange("priceRange", { min: nextMin, max: sliderMax });
              }}
              className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 appearance-none bg-transparent accent-[#F85D85]"
              aria-label="Minimum price"
            />
            <input
              type="range"
              min={0}
              max={100}
              value={sliderMax}
              onChange={(event) => {
                const nextMax = Math.max(Number(event.target.value), sliderMin + 1);
                onFilterChange("priceRange", { min: sliderMin, max: nextMax });
              }}
              className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 appearance-none bg-transparent accent-[#F85D85]"
              aria-label="Maximum price"
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[14px] font-bold text-[#7D5636]">
            <span>${sliderMin}</span>
            <span>${sliderMax}</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-[#EED9CB]" />

      {/* Dietary Options */}
      <div>
        <h4 className="mb-3.5 text-[15px] font-bold text-[#68400A]">Dietary</h4>
        <div className="space-y-3">
          {DIETARY_OPTIONS.map((option) => {
            const isActive = filters.dietary === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange("dietary", isActive ? null : option.value)}
                aria-pressed={isActive}
                className="flex w-full items-center gap-3 text-left text-[14px] font-semibold text-[#7D5636] transition-all duration-200 hover:text-[#F85D85]"
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-2 transition-all duration-200 ${
                    isActive ? "border-[#F86B87] bg-[#F86B87]" : "border-[#E8CFC0] bg-white"
                  }`}
                >
                  {isActive && <HiMiniCheck className="h-3 w-3 text-white" />}
                </div>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#EED9CB]" />

      {/* Rating Filter */}
      <div>
        <h4 className="mb-3.5 text-[15px] font-bold text-[#68400A]">Rating</h4>
        <div className="space-y-3">
          {RATING_OPTIONS.map((option) => {
            const isActive = filters.minRating === option.value;
            const stars = Array.from({ length: option.value });
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange("minRating", isActive ? null : option.value)}
                aria-pressed={isActive}
                className={`flex w-full items-center justify-between text-[14px] font-semibold transition-all duration-200 ${
                  isActive ? "text-[#F85D85]" : "text-[#7D5636] hover:text-[#F85D85]"
                }`}
              >
                <span className="flex items-center gap-1">
                  {stars.map((_, index) => (
                    <HiMiniStar key={index} className="h-4.5 w-4.5 text-[#F8B737]" fill="#F8B737" />
                  ))}
                </span>
                <span>& up</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="flex w-full items-center justify-center gap-2 rounded-[16px] border-2 border-[#FFC7D3] px-5 py-3 text-sm font-bold text-[#F85D85] transition-all duration-200 hover:bg-[#FFF1F5]"
      >
        Clear Filters
      </button>
    </div>
  );
}

// ─── Main Desserts Page ────────────────────────────────────
export default function DessertsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialFilters: FilterState = {
    category: searchParams.get("category") || ALL_DESSERTS_CATEGORY,
    priceRange: searchParams.get("min_price")
      ? { min: Number(searchParams.get("min_price")), max: Number(searchParams.get("max_price") || "999") }
      : null,
    dietary: searchParams.get("dietary") || null,
    minRating: searchParams.get("min_rating") ? Number(searchParams.get("min_rating")) : null,
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const activeSearch = searchParams.get("search") || "";

  // Keep the URL in sync with filters/search so refresh and back/forward work as expected.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category !== ALL_DESSERTS_CATEGORY) params.set("category", filters.category);
    if (filters.priceRange) {
      params.set("min_price", String(filters.priceRange.min));
      params.set("max_price", String(filters.priceRange.max));
    }
    if (filters.dietary) params.set("dietary", filters.dietary);
    if (filters.minRating) params.set("min_rating", String(filters.minRating));
    if (activeSearch) params.set("search", activeSearch);
    setSearchParams(params, { replace: true });
    setVisibleCount(PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, activeSearch]);

  // Data
  const { data = [], isLoading, isError, isFetching } = useQuery({
    queryKey: ["all-desserts", filters, activeSearch],
    queryFn: () => getAllDesserts({
      category: filters.category === ALL_DESSERTS_CATEGORY ? undefined : filters.category,
      min_price: filters.priceRange?.min,
      max_price: filters.priceRange?.max,
      dietary: filters.dietary ?? undefined,
      min_rating: filters.minRating ?? undefined,
      search: activeSearch || undefined,
    }),
  });
  const categoriesQuery = useQuery({
    queryKey: ["dessert-categories"],
    queryFn: getDessertCategories,
  });
  const categories = useMemo(
    () => [ALL_DESSERTS_CATEGORY, ...(categoriesQuery.data ?? [])],
    [categoriesQuery.data]
  );

  const { favoriteIds, toggleFavorite } = useFavorites(data);
  const sortedDesserts = useMemo(() => {
    const items = [...data];
    if (sortBy === "price-low") {
      return items.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortBy === "price-high") {
      return items.sort((a, b) => Number(b.price) - Number(a.price));
    }
    if (sortBy === "rating") {
      return items.sort((a, b) => Number(b.rating_avg ?? 0) - Number(a.rating_avg ?? 0));
    }
    return items.sort((a, b) => Number(b.reviews_count ?? 0) - Number(a.reviews_count ?? 0));
  }, [data, sortBy]);

  const displayedDesserts = sortedDesserts.slice(0, visibleCount);
  const hasMore = sortedDesserts.length > visibleCount;

  function handleFilterChange(key: keyof FilterState, value: unknown) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleClearFilters() {
    setFilters({
      category: ALL_DESSERTS_CATEGORY,
      priceRange: null,
      dietary: null,
      minRating: null,
    });
    setSearchQuery("");
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    setSearchParams(params, { replace: true });
  }

  function handleClearSearch() {
    setSearchQuery("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    setSearchParams(params, { replace: true });
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <main className="desserts-page min-h-screen bg-[#FFF9F2] text-[#6B4423]">
      <style>{animationStyles}</style>

      {/* Header */}
      <div className="relative z-30 bg-[var(--color-header-bg)]/40 px-4 py-2.5 backdrop-blur-sm sm:px-8 sm:py-3">
        <Header />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <section className="relative z-10 px-3 pb-16 sm:px-8 lg:px-12">
        {/* Floating decorations */}
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
          <div className="absolute left-[3%] top-[20%] animate-cloud opacity-10">
            <svg width="80" height="40" viewBox="0 0 80 40" fill="none"><ellipse cx="40" cy="28" rx="36" ry="12" fill="#FF7FA3"/><ellipse cx="25" cy="20" rx="20" ry="14" fill="#FF7FA3"/><ellipse cx="52" cy="18" rx="24" ry="15" fill="#FF7FA3"/></svg>
          </div>
          <div className="absolute right-[5%] top-[40%] animate-cloud-reverse opacity-8">
            <svg width="60" height="30" viewBox="0 0 60 30" fill="none"><ellipse cx="30" cy="20" rx="28" ry="10" fill="#F8E4D8"/><ellipse cx="18" cy="14" rx="16" ry="11" fill="#F8E4D8"/><ellipse cx="40" cy="12" rx="20" ry="12" fill="#F8E4D8"/></svg>
          </div>
        </div>

        <div className="mx-auto max-w-[1680px]">
          {/* Category Pills - horizontal scroll on mobile, wrap on desktop */}
          <div className="no-scrollbar mb-5 flex gap-3 overflow-x-auto px-1 pb-1 sm:mb-6 sm:flex-wrap sm:items-center sm:justify-center sm:gap-5 sm:overflow-visible sm:px-0">
            {categories.map((cat) => {
              const isActive = filters.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleFilterChange("category", cat)}
                  aria-pressed={isActive}
                  className={`
                    relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-[13px] font-bold transition-all duration-300 sm:min-w-[110px] sm:px-5 sm:py-3 sm:text-[15px]
                    ${isActive
                      ? "bg-[#F85D85] text-white shadow-[0_12px_24px_rgba(248,93,133,0.24)]"
                      : "border border-[#F1DCCD] bg-white/86 text-[#68400A] shadow-[0_7px_16px_rgba(126,79,35,0.06)] hover:bg-white hover:text-[#F85D85]"
                    }
                  `}
                >
                  <span className={isActive ? "text-white" : "text-[#FF9A73]"}>🧁</span>
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-[#F1DCCD]/80 bg-white/76 p-4 shadow-[0_16px_42px_rgba(126,79,35,0.08)] backdrop-blur-sm sm:rounded-[28px] sm:p-6 lg:p-9">
            <div className="flex gap-6 lg:gap-9">
              {/* Sidebar Filters */}
              <SidebarFilters
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onApply={() => {}}
              />

              {/* Product Grid Area */}
              <div className="min-w-0 flex-1">
                {/* Mobile search bar */}
                <form onSubmit={handleSearchSubmit} className="relative mb-4 md:hidden">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search desserts"
                    className="h-12 w-full rounded-[16px] border border-[#F1DCCD] bg-white pl-11 pr-10 text-[14px] font-semibold text-[#68400A] outline-none placeholder:text-[#B8947B] focus:border-[#F85D85]"
                  />
                  <HiMiniMagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C69B84]" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#F1DCCD] text-[#68400A]"
                      aria-label="Clear search"
                    >
                      <HiMiniXMark className="h-3.5 w-3.5" />
                    </button>
                  )}
                </form>

                {/* Results header */}
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-8 sm:gap-4">
                  <p className="text-[14px] font-bold text-[#A7775C] sm:text-[16px]">
                    {activeSearch ? (
                      <>
                        Results for <span className="text-[#8A5434]">&ldquo;{activeSearch}&rdquo;</span> &middot;{" "}
                      </>
                    ) : null}
                    <span className="text-[#8A5434]">{data.length}</span> {data.length === 1 ? "dessert" : "desserts"}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                    <form onSubmit={handleSearchSubmit} className="relative hidden min-w-[240px] md:block lg:min-w-[260px]">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search desserts"
                        className="h-12 w-full rounded-[18px] border border-[#F1DCCD] bg-white/86 pl-11 pr-9 text-[14px] font-semibold text-[#68400A] outline-none placeholder:text-[#B8947B] focus:border-[#F85D85]"
                      />
                      <HiMiniMagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C69B84]" />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#F1DCCD] text-[#68400A]"
                          aria-label="Clear search"
                        >
                          <HiMiniXMark className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </form>

                    <label className="relative inline-flex h-11 items-center rounded-[16px] border border-[#F1DCCD] bg-white/86 px-4 text-[13px] font-bold text-[#68400A] shadow-[0_8px_18px_rgba(126,79,35,0.05)] sm:h-12 sm:px-5 sm:text-[15px]">
                      <span className="hidden sm:inline">Sort by:</span>
                      <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="bg-transparent pr-6 text-[#68400A] outline-none sm:ml-2"
                        aria-label="Sort desserts"
                      >
                        <option value="popular">Popular</option>
                        <option value="rating">Rating</option>
                        <option value="price-low">Price low</option>
                        <option value="price-high">Price high</option>
                      </select>
                      <HiMiniChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-[#A7775C]" />
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        aria-pressed={viewMode === "grid"}
                        className={`flex h-11 w-11 items-center justify-center rounded-[14px] border transition-all sm:h-12 sm:w-12 sm:rounded-[16px] ${
                          viewMode === "grid"
                            ? "border-[#FFC7D3] bg-[#FFF1F5] text-[#F85D85] shadow-[0_10px_20px_rgba(248,93,133,0.15)]"
                            : "border-[#F1DCCD] bg-white text-[#8A5434]"
                        }`}
                        aria-label="Grid view"
                      >
                        <HiMiniSquares2X2 className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        aria-pressed={viewMode === "list"}
                        className={`flex h-11 w-11 items-center justify-center rounded-[14px] border transition-all sm:h-12 sm:w-12 sm:rounded-[16px] ${
                          viewMode === "list"
                            ? "border-[#FFC7D3] bg-[#FFF1F5] text-[#F85D85] shadow-[0_10px_20px_rgba(248,93,133,0.15)]"
                            : "border-[#F1DCCD] bg-white text-[#8A5434]"
                        }`}
                        aria-label="List view"
                      >
                        <HiMiniBars3 className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active filter chips (mobile-friendly quick clear) */}
                {countActiveFilters(filters) > 0 && (
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    {filters.category !== ALL_DESSERTS_CATEGORY && (
                      <FilterChip label={filters.category} onRemove={() => handleFilterChange("category", ALL_DESSERTS_CATEGORY)} />
                    )}
                    {filters.priceRange && (
                      <FilterChip
                        label={`$${filters.priceRange.min} – $${filters.priceRange.max}`}
                        onRemove={() => handleFilterChange("priceRange", null)}
                      />
                    )}
                    {filters.dietary && (
                      <FilterChip
                        label={DIETARY_OPTIONS.find((d) => d.value === filters.dietary)?.label ?? filters.dietary}
                        onRemove={() => handleFilterChange("dietary", null)}
                      />
                    )}
                    {filters.minRating && (
                      <FilterChip label={`${filters.minRating}★ & up`} onRemove={() => handleFilterChange("minRating", null)} />
                    )}
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-[12px] font-bold text-[#F85D85] underline-offset-2 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                {/* Grid */}
                {isLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-7 xl:grid-cols-3 2xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <DessertSkeleton key={index} index={index} />
                    ))}
                  </div>
                ) : data.length > 0 ? (
                  <>
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid gap-4 sm:grid-cols-2 sm:gap-7 xl:grid-cols-3 2xl:grid-cols-4"
                          : "grid gap-3 sm:gap-5 md:grid-cols-2"
                      }
                      aria-busy={isFetching}
                    >
                      {displayedDesserts.map((dessert, index) => (
                        <DessertCard
                          key={dessert.id}
                          dessert={dessert}
                          index={index}
                          favorite={favoriteIds.includes(dessert.id)}
                          onToggleFavorite={toggleFavorite}
                          layout={viewMode}
                        />
                      ))}
                    </div>

                    {hasMore && (
                      <div className="mt-8 flex justify-center sm:mt-10">
                        <button
                          type="button"
                          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                          className="group inline-flex h-[52px] items-center justify-center gap-3 rounded-[20px] bg-gradient-to-r from-[#FF7FA3] to-[#F86B87] px-7 text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(248,107,135,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(248,107,135,0.30)] active:scale-[0.97] sm:h-[60px] sm:px-8 sm:text-[16px]"
                        >
                          <span>Show more desserts</span>
                          <HiMiniChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  /* Empty state */
                  <div className="rounded-[24px] border border-[#F0DDBE] bg-[#FFFBF5] px-6 py-12 text-center sm:rounded-[32px] sm:px-8 sm:py-16">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F5] sm:h-20 sm:w-20">
                      <span className="text-3xl sm:text-4xl">🍰</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#68400A] sm:text-xl">No desserts found</h3>
                    <p className="mx-auto mt-2 max-w-md text-[14px] text-[#8F6A2F]/75 sm:text-[15px]">
                      Nothing matches your current filters{activeSearch ? ` and search for "${activeSearch}"` : ""}. Try adjusting or clearing them.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF7FA3] to-[#F86B87] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(248,107,135,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(248,107,135,0.30)]"
                    >
                      <HiMiniXMark className="h-4 w-4" />
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Error state */}
                {isError && (
                  <div className="rounded-[24px] border border-[#F0DDBE] bg-[#FFFBF5] px-6 py-12 text-center sm:rounded-[32px] sm:px-8 sm:py-16">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F5] sm:h-20 sm:w-20">
                      <span className="text-3xl sm:text-4xl">😿</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#68400A] sm:text-xl">Something went wrong</h3>
                    <p className="mt-2 text-[14px] text-[#8F6A2F]/75 sm:text-[15px]">
                      We couldn't load the desserts right now. Please try again.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(0)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF7FA3] to-[#F86B87] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(248,107,135,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(248,107,135,0.30)]"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating decorative elements */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden sm:block" aria-hidden="true">
        <div className="absolute left-[5%] top-[60%] h-4 w-4 animate-float text-[#FF7FA3]/20">
          <HiMiniHeart className="h-full w-full" />
        </div>
        <div className="absolute right-[8%] top-[70%] h-3 w-3 animate-float-delayed text-[#FEC84D]/20">
          <HiMiniSparkles className="h-full w-full" />
        </div>
        <div className="absolute left-[50%] top-[80%] h-3 w-3 animate-twinkle text-[#FF7FA3]/15">
          <HiMiniStar className="h-full w-full" />
        </div>
      </div>

      <Footer />
    </main>
  );
}

// ─── Small helper component ─────────────────────────────────
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFC7D3] bg-[#FFF1F5] px-3 py-1.5 text-[12px] font-bold text-[#F85D85]">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`} className="rounded-full hover:bg-[#FFD8E1]">
        <HiMiniXMark className="h-3 w-3" />
      </button>
    </span>
  );
}
