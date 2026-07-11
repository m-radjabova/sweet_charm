import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { HiMiniChevronRight, HiOutlineStar, HiOutlineHeart } from "react-icons/hi2";
import { getFeaturedDesserts } from "../../../api/desserts";
import type { FeaturedDessert } from "../../../types/types";
import { useState } from "react";
import { useFavorites } from "../../account/hooks/useFavorites";
import { useNavigate } from "react-router-dom";
import RevealMedia from "./RevealMedia";
import { getDisplayDiscountPercent, getDisplayOldPrice } from "../../../utils/pricing";
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

function DessertCard({
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
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const rating = getDessertRating(dessert);
  const filledStars = getFilledStars(rating);
  const oldPrice = getDisplayOldPrice(dessert.price);
  const discountPercent = getDisplayDiscountPercent(dessert.price);
  const imageUrl = dessert.image_url || dessert.image_urls?.[0] || fallbackDessertImage;

  return (
    <article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative flex h-full flex-col overflow-hidden rounded-[34px]
        bg-gradient-to-b from-[#FFFBF3] to-[#FDF3E0]
        shadow-[0_8px_32px_rgba(104,64,10,0.06)]
        transition-all duration-500 ease-out
        hover:shadow-[0_20px_60px_rgba(248,107,135,0.15)]
        hover:-translate-y-1.5
      `}
      style={{
        transitionDelay: `${index * 80}ms`,
        transitionProperty: "transform, box-shadow",
        transitionDuration: "450ms",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Decorative top corner dots */}
      <div className="pointer-events-none absolute -right-6 -top-6 z-10 h-20 w-20 opacity-40">
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#F86B87]" />
          ))}
        </div>
      </div>

      {/* Image container */}
      <div className="relative overflow-hidden">
        {/* Image wrapper with gradient overlay */}
        <div className="relative">
          <RevealMedia delayMs={index * 70} className="rounded-b-[28px] rounded-t-[34px]">
            <img
              src={imageUrl}
              alt={dessert.name}
              loading="lazy"
              className="h-[260px] w-full object-cover transition-all duration-700 ease-out sm:h-[300px]"
              style={{
                transform: isHovered ? "scale(1.08)" : "scale(1)",
                filter: isHovered ? "brightness(1.05) saturate(1.1)" : "brightness(1) saturate(1)",
              }}
            />
          </RevealMedia>
          {/* Gradient overlay on hover */}
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

        {/* Favorite button - floating petal shape */}
        <button
          type="button"
          onClick={() => onToggleFavorite(dessert.id, dessert)}
          className="group/fav absolute right-4 top-4 flex h-11 w-11 items-center justify-center text-[#F86B87] transition-all duration-300 hover:scale-110"
          aria-label={`${favorite ? "Remove" : "Add"} ${dessert.name} ${favorite ? "from" : "to"} favorites`}
          style={{
            filter: `drop-shadow(0 4px 8px rgba(248,107,135,0.2))`,
          }}
        >
          {/* Petal background */}
          <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full">
            <defs>
              <filter id="petal-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F86B87" floodOpacity="0.15" />
              </filter>
            </defs>
            <path
              d="M22 2C32 6 38 14 42 22C38 30 32 38 22 42C12 38 6 30 2 22C6 14 12 6 22 2Z"
              fill="white"
              fillOpacity="0.9"
              filter="url(#petal-shadow)"
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
              color: isHovered ? "#F86B87" : "#F86B87",
              fill: favorite ? "#F86B87" : "none",
            }}
          />
        </button>

        {/* Old price badge - ribbon style */}
        {discountPercent && (
          <div className="absolute -bottom-0 -right-1 z-10">
            <svg viewBox="0 0 90 36" className="h-9 w-[90px]">
              <defs>
                <linearGradient id="ribbon-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F86B87" />
                  <stop offset="100%" stopColor="#FA94A9" />
                </linearGradient>
              </defs>
              <path
                d="M0 18L12 0H78L90 18L78 36H12L0 18Z"
                fill="url(#ribbon-grad)"
                filter="url(#ribbon-shadow)"
              />
              <text
                x="45"
                y="21"
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                fontFamily="system-ui"
              >
                {discountPercent}% OFF
              </text>
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
        <div className="relative flex flex-1 flex-col px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
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
          className="text-[22px] font-bold leading-[1.15] tracking-tight text-[#68400A] transition-colors duration-300 sm:text-[24px]"
          style={{ color: isHovered ? "#F86B87" : "#68400A" }}
        >
          {dessert.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-[48px] text-[15px] leading-[1.4] text-[#8F6A2F]/80">
          {dessert.description}
        </p>

        {/* Divider */}
        <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-[#F0DDBE] to-transparent" />

        {/* Price and CTA */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[22px] font-bold text-[#68400A] sm:text-[24px]">{formatPrice(dessert.price)}</span>
            {oldPrice && (
              <span className="text-[15px] text-[#C6A879] line-through">{formatPrice(oldPrice)}</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/desserts/${dessert.slug}`, { state: { dessert } })}
            className="group/btn relative flex h-12 w-14 items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label={`Open ${dessert.name}`}
          >
            {/* Teardrop / droplet shape */}
            <svg viewBox="0 0 56 48" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="btn-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F86B87" />
                  <stop offset="100%" stopColor="#FA94A9" />
                </linearGradient>
                <filter id="btn-shadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#F86B87" floodOpacity="0.3" />
                </filter>
              </defs>
              <path
                d="M28 4C36 12 50 22 50 32C50 40 40 46 28 46C16 46 6 40 6 32C6 22 20 12 28 4Z"
                fill="url(#btn-grad)"
                filter="url(#btn-shadow)"
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

function DessertSkeleton({ index }: { index: number }) {
  return (
    <div
      className="overflow-hidden rounded-[34px] bg-gradient-to-b from-[#FFFBF3] to-[#FDF3E0] p-[1px] shadow-[0_8px_32px_rgba(104,64,10,0.06)]"
      style={{
        transitionDelay: `${index * 80}ms`,
        transition: "box-shadow 450ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div className="overflow-hidden rounded-[39px] bg-[#FEF7E7] p-4">
        <div className="h-[300px] animate-pulse rounded-[28px] bg-gradient-to-br from-[#f7ead0] to-[#f3e1be]" />
        <div className="space-y-3 px-2 pb-2 pt-5">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-3 w-3 animate-pulse rounded-full bg-[#f3e1be]" />
            ))}
          </div>
          <div className="h-7 w-2/3 animate-pulse rounded-full bg-[#f3e1be]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[#f7ead0]" />
          <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#f7ead0]" />
          <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-[#F0DDBE]/50 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="h-7 w-20 animate-pulse rounded-full bg-[#f3e1be]" />
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-[#f3e1be]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedDesserts() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["featured-desserts"],
    queryFn: () => getFeaturedDesserts(8),
  });

  const { favoriteIds, toggleFavorite } = useFavorites(data);

  return (
    <section
      id="menu"
      className="relative z-30 overflow-hidden bg-[#FEF7E7] px-4 py-14 sm:px-8 lg:px-12 lg:py-24"
    >
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top left decorative circle */}
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#F86B87]/5 blur-3xl" />
        {/* Bottom right decorative circle */}
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#FEC84D]/5 blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #68400A 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1440px]">
        {/* Section header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4">
            {/* Left decorative line */}
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#F0DDBE]" />
            {/* Left asterisk */}
            <span
              className="text-[#F86B87] transition-all duration-700"
              style={{
                fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
                opacity: 1,
                transform: "rotate(180deg) scale(1)",
              }}
            >
              ✦
            </span>
          </div>

          <h2
            className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0] text-[#68400A]"
            style={{ fontSize: "clamp(3.5rem, 13vw, 7.8rem)" }}
          >
            Featured Desserts
            <br />
            <span className="relative">
              of the week
              {/* Underline decoration */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  opacity: 1,
                  transform: "scaleX(1)",
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

          {/* Right asterisk */}
          <div className="inline-flex items-center gap-4">
            <span
              className="text-[#F86B87] transition-all duration-700"
              style={{
                fontSize: "clamp(1.2rem, 2vw, 1.8rem)",
                opacity: 1,
                transform: "rotate(180deg) scale(1)",
              }}
            >
              ✦
            </span>
            {/* Right decorative line */}
            <div className="h-px w-12 bg-gradient-to-r from-[#F0DDBE] to-transparent" />
          </div>

          {/* Subtitle */}
          <p
            className="mx-auto mt-4 max-w-[500px] px-2 text-[16px] leading-relaxed text-[#8F6A2F]/70 sm:mt-6 sm:text-[17px]"
          >
            Indulge in our handcrafted sweet creations — each dessert is a masterpiece made with love
            and the finest ingredients.
          </p>
        </div>

        {/* Dessert grid */}
        <div className="relative mt-8 grid grid-cols-1 gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <DessertSkeleton key={index} index={index} />
              ))
            : data.map((dessert, index) => (
                <DessertCard
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
            className="mx-auto mt-14 max-w-[500px] rounded-[28px] border border-[#f6e7c5] bg-[#FEF7E7] px-8 py-10 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f6e7c5]">
              <span className="text-[32px]">🍰</span>
            </div>
            <p className="text-[18px] leading-relaxed text-[#8F6A2F]">
              Featured desserts hozircha topilmadi.
            </p>
            <p className="mt-2 text-[15px] text-[#C6A879]">
              Check back soon for our latest sweet creations!
            </p>
          </div>
        ) : null}

        {/* CTA Button */}
        <div className="mt-10 flex justify-center sm:mt-14">
          <Link
            to="/desserts"
            className="group relative inline-flex h-[70px] min-w-[260px] items-center justify-center rounded-[24px] bg-gradient-to-r from-[#F75D86] to-[#F86B87] px-[34px] text-[18px] font-bold shadow-[0_13px_22px_rgba(248,107,135,0.22)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_17px_30px_rgba(248,107,135,0.28)] active:scale-[0.97] sm:h-[76px] sm:min-w-[272px] sm:text-[19px]"
          >
            <span className="relative z-10 flex items-center gap-3 text-[var(--color-surface)]">
              View all
              <HiMiniChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-[#F86B87] to-[#FA94A9] opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-[900px]:rounded-[20px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedDesserts;
