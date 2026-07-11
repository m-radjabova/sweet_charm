import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  HiMiniChevronRight,
  HiOutlineStar,
  HiOutlineHeart,
  HiOutlineFire,
} from "react-icons/hi2";
import { getBestSellers } from "../../../api/desserts";
import type { FeaturedDessert } from "../../../types/types";
import { useState, useEffect, useRef } from "react";
import { useFavorites } from "../../account/hooks/useFavorites";
import { useNavigate } from "react-router-dom";
import { getDisplayOldPrice } from "../../../utils/pricing";
import fallbackDessertImage from "../../../assets/cake_icon.png";

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

function useInView(threshold = 0.15) {
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

function BestSellerCard({
  dessert,
  index,
  favorite,
  onToggleFavorite,
}: {
  dessert: FeaturedDessert;
  index: number;
  favorite: boolean;
  onToggleFavorite: (dessertId: string, dessert?: FeaturedDessert) => void;
}) {
  const [cardRef, inView] = useInView(0.1);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const rating = getDessertRating(dessert);
  const filledStars = getFilledStars(rating);
  const oldPrice = getDisplayOldPrice(dessert.price);
  const imageUrl = dessert.image_url || dessert.image_urls?.[0] || fallbackDessertImage;

  const rank = index + 1;

  return (
    <article
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative flex h-full flex-col overflow-hidden rounded-[32px] 
        bg-gradient-to-b from-[#FFFBF3] to-[#FDF3E0]
        shadow-[0_8px_32px_rgba(104,64,10,0.06)]
        transition-all duration-500 ease-out
        hover:shadow-[0_20px_60px_rgba(248,107,135,0.15)]
        hover:-translate-y-1.5
        ${inView ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}
      `}
      style={{
        transitionDelay: `${index * 80}ms`,
        transitionProperty: "transform, opacity, box-shadow",
        transitionDuration: "600ms",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Rank badge */}
      <div className="pointer-events-none absolute left-0 top-0 z-20">
        <svg viewBox="0 0 60 60" className="h-[60px] w-[60px]">
          <defs>
            <linearGradient id={`rank-grad-${rank}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F86B87" />
              <stop offset="100%" stopColor="#FA94A9" />
            </linearGradient>
          </defs>
          <path d="M0 0L60 0L60 60Q30 40 0 60Z" fill={`url(#rank-grad-${rank})`} />
          <text
            x="18"
            y="22"
            fill="white"
            fontSize="16"
            fontWeight="bold"
            fontFamily="system-ui"
          >
            #{rank}
          </text>
        </svg>
      </div>

      {/* Image container */}
      <div className="relative overflow-hidden">
        <div className="relative">
          <img
            src={imageUrl}
            alt={dessert.name}
            loading="lazy"
            className="h-[200px] w-full object-cover transition-all duration-700 ease-out sm:h-[260px]"
            style={{
              transform: isHovered ? "scale(1.08)" : "scale(1)",
              filter: isHovered ? "brightness(1.05) saturate(1.1)" : "brightness(1) saturate(1)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#FEF7E7]/60 to-transparent opacity-0 transition-opacity duration-500"
            style={{ opacity: isHovered ? 1 : 0 }}
          />
        </div>

        {/* Category badge */}
        {dessert.category_name && (
          <span className="absolute left-4 top-4 rounded-full bg-white/85 px-4 py-1.5 text-[13px] font-medium tracking-wide text-[#68400A] shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white">
            {dessert.category_name}
          </span>
        )}
        {dessert.is_chef_choice && (
          <span className="absolute left-4 top-16 rounded-full bg-[#FFF0F4] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#F25D88] shadow-[0_8px_18px_rgba(242,93,136,0.16)] backdrop-blur-sm">
            Chef's Choice
          </span>
        )}

        {/* Favorite button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(dessert.id, dessert)}
          className="group/fav absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-[#F86B87] transition-all duration-300 hover:scale-110"
          aria-label={`${favorite ? "Remove" : "Add"} ${dessert.name} ${favorite ? "from" : "to"} favorites`}
          style={{ filter: "drop-shadow(0 4px 8px rgba(248,107,135,0.2))" }}
        >
          <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full">
            <defs>
              <filter id="bs-petal-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F86B87" floodOpacity="0.15" />
              </filter>
            </defs>
            <path
              d="M22 2C32 6 38 14 42 22C38 30 32 38 22 42C12 38 6 30 2 22C6 14 12 6 22 2Z"
              fill="white"
              fillOpacity="0.9"
              filter="url(#bs-petal-shadow)"
              className="transition-all duration-300"
              style={{
                transform: isHovered ? "scale(1.1)" : "scale(1)",
                transformOrigin: "center",
              }}
            />
          </svg>
          <HiOutlineHeart
            className="relative z-10 h-[18px] w-[18px] transition-all duration-300"
            style={{
              transform: isHovered ? "scale(1.15)" : "scale(1)",
              color: "#F86B87",
              fill: favorite ? "#F86B87" : "none",
            }}
          />
        </button>
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-5">
        {/* Rating stars */}
        <div className="mb-2 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <HiOutlineStar
              key={i}
              className="h-4 w-4 text-[#FEC84D]"
              style={{ fill: i < filledStars ? "#FEC84D" : "none" }}
            />
          ))}
          <span className="ml-2 text-[13px] text-[#C6A879]">
            {rating > 0 ? rating.toFixed(1) : "0.0"}
          </span>
        </div>

        <h3
          className="text-[22px] font-bold leading-[1.15] tracking-tight text-[#68400A] transition-colors duration-300"
          style={{ color: isHovered ? "#F86B87" : "#68400A" }}
        >
          {dessert.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[44px] text-[14px] leading-[1.4] text-[#8F6A2F]/80">
          {dessert.description}
        </p>

        {/* Divider */}
        <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-[#F0DDBE] to-transparent" />

        {/* Price and CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[22px] font-bold text-[#68400A]">{formatPrice(dessert.price)}</span>
            {oldPrice && (
              <span className="text-[14px] text-[#C6A879] line-through">{formatPrice(oldPrice)}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/desserts/${dessert.slug}`, { state: { dessert } })}
            className="group/btn relative flex h-12 w-14 items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label={`Open ${dessert.name}`}
          >
            <svg viewBox="0 0 56 48" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="bs-btn-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F86B87" />
                  <stop offset="100%" stopColor="#FA94A9" />
                </linearGradient>
              </defs>
              <path
                d="M28 4C36 12 50 22 50 32C50 40 40 46 28 46C16 46 6 40 6 32C6 22 20 12 28 4Z"
                fill="url(#bs-btn-grad)"
                className="transition-all duration-300"
                style={{
                  transform: isHovered ? "scale(1.08)" : "scale(1)",
                  transformOrigin: "center",
                  filter: isHovered
                    ? "drop-shadow(0 6px 16px rgba(248,107,135,0.4))"
                    : "drop-shadow(0 4px 8px rgba(248,107,135,0.25))",
                }}
              />
            </svg>
            <HiMiniChevronRight
              className="relative z-10 h-5 w-5 text-white transition-all duration-300"
              style={{
                transform: isHovered ? "translateX(3px) scale(1.1)" : "translateX(0) scale(1)",
              }}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

function BestSellersSection() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["best-sellers"],
    queryFn: () => getBestSellers(6),
  });

  const [sectionRef, sectionInView] = useInView(0.05);
  const { favoriteIds, toggleFavorite } = useFavorites(data);

  return (
    <section
      id="best-sellers"
      className="relative z-30 overflow-hidden bg-[#FEF7E7] px-4 py-14 sm:px-8 lg:px-12 lg:py-24"
    >
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#FEC84D]/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#F86B87]/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #68400A 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div ref={sectionRef} className="relative mx-auto max-w-[1440px]">
        {/* Section header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#F0DDBE]" />
            <span
              className="text-[#FEC84D] transition-all duration-700"
              style={{
                fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
                opacity: sectionInView ? 1 : 0,
                transform: sectionInView ? "rotate(180deg) scale(1)" : "rotate(0deg) scale(0)",
                transition: "all 700ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <HiOutlineFire className="h-6 w-6" />
            </span>
          </div>

          <h2
            className={`font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0] text-[#68400A] transition-all duration-700 ${
              sectionInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ fontSize: "clamp(3.5rem, 13vw, 6.5rem)", transitionDelay: "150ms" }}
          >
            Best Sellers
            <br />
            <span className="relative">
              you'll love
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  opacity: sectionInView ? 1 : 0,
                  transform: sectionInView ? "scaleX(1)" : "scaleX(0)",
                  transition: "all 800ms cubic-bezier(0.34, 1.56, 0.64, 1) 300ms",
                  transformOrigin: "center",
                }}
              >
                <path
                  d="M2 10C72 2 180 -1 298 10"
                  stroke="#F86B87"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeOpacity="0.4"
                />
              </svg>
            </span>
          </h2>

          <div className="inline-flex items-center gap-4">
            <span
              className="text-[#FEC84D] transition-all duration-700"
              style={{
                fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
                opacity: sectionInView ? 1 : 0,
                transform: sectionInView ? "rotate(180deg) scale(1)" : "rotate(0deg) scale(0)",
                transition: "all 700ms cubic-bezier(0.34, 1.56, 0.64, 1) 200ms",
              }}
            >
              <HiOutlineFire className="h-6 w-6" />
            </span>
            <div className="h-px w-12 bg-gradient-to-r from-[#F0DDBE] to-transparent" />
          </div>

          <p
            className={`mx-auto mt-4 max-w-[500px] px-2 text-[16px] leading-relaxed text-[#8F6A2F]/70 transition-all duration-700 sm:mt-6 sm:text-[17px] ${
              sectionInView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: "350ms" }}
          >
            Our most beloved treats — handpicked by sweet-toothed fans just like you.
          </p>
        </div>

        {/* Best sellers grid */}
        <div className="relative mt-10 grid gap-6 sm:mt-14 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-[400px] animate-pulse rounded-[32px] bg-gradient-to-br from-[#f7ead0] to-[#f3e1be]" />
              ))
            : data.map((dessert, index) => (
                <BestSellerCard
                  key={dessert.id}
                  dessert={dessert}
                  index={index}
                  favorite={favoriteIds.includes(dessert.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
        </div>

        {/* Empty / Error state */}
        {!isLoading && (isError || data.length === 0) ? (
          <div
            className={`mx-auto mt-14 max-w-[500px] rounded-[28px] border border-[#f6e7c5] bg-[#FEF7E7] px-8 py-10 text-center transition-all duration-700 ${
              sectionInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f6e7c5]">
              <span className="text-[32px]">🔥</span>
            </div>
            <p className="text-[18px] leading-relaxed text-[#8F6A2F]">
              Best sellers coming soon!
            </p>
          </div>
        ) : null}

        {/* CTA Button */}
        <div
          className={`mt-10 flex justify-center transition-all duration-700 sm:mt-14 ${
            sectionInView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "500ms" }}
        >
          <Link
            to="/desserts"
            className="group relative inline-flex h-[64px] min-w-[240px] items-center justify-center rounded-[24px] bg-gradient-to-r from-[#FEC84D] to-[#FFD87A] px-[30px] text-[17px] font-bold text-[#68400A] shadow-[0_13px_22px_rgba(254,200,77,0.25)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_17px_30px_rgba(254,200,77,0.3)] active:scale-[0.97] sm:h-[68px] sm:text-[18px]"
          >
            <span className="relative z-10 flex items-center gap-3">
              View all
              <HiMiniChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BestSellersSection;
