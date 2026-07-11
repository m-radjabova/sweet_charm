import { useNavigate } from "react-router-dom";
import { HiMiniGift, HiMiniHeart } from "react-icons/hi2";
import type { FeaturedDessert } from "../../../types/types";
import { formatMoney } from "../utils";
import { getDisplayDiscountPercent, getDisplayOldPrice } from "../../../utils/pricing";

const gradients = [
  "from-[#FFE8EF] to-[#FFF5E1]",
  "from-[#E8F7DC] to-[#F0FFF0]",
  "from-[#EAF1FF] to-[#F5F0FF]",
];

interface Props {
  dessert: FeaturedDessert;
  index: number;
  favorite: boolean;
  onToggleFavorite: (dessertId: string, dessert?: FeaturedDessert) => void;
  variant?: "default" | "compact";
}

export default function DessertMiniCard({
  dessert,
  index,
  favorite,
  onToggleFavorite,
  variant = "default",
}: Props) {
  const navigate = useNavigate();
  const gradient = gradients[index % gradients.length];
  const accentLabel = index % 3 === 0 ? "Popular" : index % 3 === 1 ? "Fresh" : "Trending";
  const rating = Number(dessert.rating_avg ?? 0);
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));
  const isCompact = variant === "compact";
  const oldPrice = getDisplayOldPrice(dessert.price);
  const discountPercent = getDisplayDiscountPercent(dessert.price);

  function openDessert() {
    navigate(`/desserts/${dessert.slug}`, { state: { dessert } });
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openDessert}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDessert();
        }
      }}
      className={`group relative overflow-hidden border border-white/70 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(255,245,233,0.96))] shadow-[0_12px_28px_rgba(175,117,60,0.10)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_34px_rgba(175,117,60,0.16)] active:scale-[0.98] ${
        isCompact ? "rounded-[26px]" : "rounded-[30px]"
      }`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#F9C5D3]/25 blur-2xl" />

      <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${isCompact ? "h-[180px]" : "h-[210px]"}`}>
        {dessert.image_url ? (
          <img
            src={dessert.image_url}
            alt={dessert.name}
            loading="lazy"
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_50%)]">
            <HiMiniGift className="h-12 w-12 text-[#D68C4A]/60" />
          </div>
        )}

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
          <span className="inline-flex max-w-[70%] items-center rounded-full bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8F6336] shadow-sm backdrop-blur-sm">
            {dessert.category_name || accentLabel}
          </span>
        </div>
        {dessert.is_chef_choice ? (
          <div className="absolute left-4 top-16">
            <span className="inline-flex rounded-full bg-[#FFF0F4] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F25D88] shadow-[0_8px_18px_rgba(242,93,136,0.16)] backdrop-blur-sm">
              Chef's Choice
            </span>
          </div>
        ) : null}

        {discountPercent ? (
          <div className="absolute bottom-4 right-4 rounded-full bg-[#F86B87] px-3 py-1.5 text-xs font-bold text-white shadow-[0_8px_18px_rgba(248,107,135,0.28)]">
            {discountPercent}% OFF
          </div>
        ) : null}
      </div>

      <div className={`space-y-3 ${isCompact ? "p-3.5" : "p-4"}`}>
        <div className="flex items-center gap-1 text-[#F4B73F]">
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <span
              key={starIndex}
              className={`text-sm ${starIndex < filledStars ? "text-[#F4B73F]" : "text-[#F4B73F]/50"}`}
            >
              ★
            </span>
          ))}
          <span className="ml-2 text-xs font-semibold text-[#C59D72]">
            {rating > 0 ? rating.toFixed(1) : "0.0"}
          </span>
        </div>

        <div>
          <h3
            className={`line-clamp-2 font-bold leading-tight text-[#F25D88] transition-colors duration-200 group-hover:text-[#E24C7A] ${
              isCompact ? "text-[1.1rem]" : "text-[1.35rem]"
            }`}
          >
            {dessert.name}
          </h3>
          <p
            className={`mt-2 line-clamp-2 text-sm text-[#9A6E42] ${
              isCompact ? "min-h-[42px] leading-5" : "min-h-[48px] leading-6"
            }`}
          >
            {dessert.description || "Freshly crafted dessert with a sweet, creamy finish you'll want again."}
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#F0DDBE] to-transparent" />

        <div className={`flex gap-3 ${isCompact ? "items-center" : "items-end justify-between"}`}>
          <div className="min-w-0">
            <div className={`flex flex-wrap items-end gap-2 ${isCompact ? "pr-2" : ""}`}>
              <span className={`${isCompact ? "text-[1.7rem]" : "text-[2rem]"} font-black leading-none text-[#784706]`}>
                {formatMoney(dessert.price)}
              </span>
              {oldPrice ? (
                <span className={`${isCompact ? "pb-0.5 text-sm" : "pb-1 text-base"} text-[#C9A67E] line-through`}>
                  {formatMoney(oldPrice)}
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(dessert.id, dessert);
            }}
            className={`shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#FF7E9F] to-[#F25D88] text-white shadow-[0_12px_24px_rgba(242,93,136,0.24)] transition-all duration-200 hover:scale-105 active:scale-95 ${
              isCompact ? "flex h-11 w-11 self-end" : "flex h-12 w-12"
            }`}
            aria-label={`Save ${dessert.name}`}
          >
            <HiMiniHeart className="h-5 w-5" fill={favorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </article>
  );
}
