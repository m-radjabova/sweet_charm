import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  HiMiniArrowRight,
  HiMiniSparkles,
  HiMiniStar,
  HiMiniChevronDoubleRight,
} from "react-icons/hi2";
import { getChefChoice } from "../../../api/desserts";

function formatPrice(price?: string | null) {
  const numeric = Number(price ?? 0);
  return `$${numeric.toFixed(2)}`;
}

// ---- decoration sprinkles ----
const sprinkles = [
  { emoji: "✨", x: "6%", y: "8%", size: 20, delay: "0s" },
  { emoji: "♥", x: "88%", y: "6%", size: 22, delay: "0.4s" },
  { emoji: "✧", x: "92%", y: "20%", size: 18, delay: "0.8s" },
  { emoji: "✦", x: "10%", y: "84%", size: 16, delay: "0.2s" },
  { emoji: "☆", x: "78%", y: "86%", size: 24, delay: "0.6s" },
  { emoji: "❀", x: "4%", y: "42%", size: 14, delay: "1s" },
  { emoji: "◈", x: "94%", y: "52%", size: 12, delay: "0.5s" },
];

function ChefChoiceSection() {
  const chefChoiceQuery = useQuery({
    queryKey: ["chef-choice"],
    queryFn: getChefChoice,
  });

  const dessert = chefChoiceQuery.data;

  if (chefChoiceQuery.isLoading) {
    return (
      <section className="relative overflow-hidden bg-[#FEF7E7] px-4 py-14 sm:px-8 lg:px-12 lg:py-18">
        <div className="mx-auto max-w-[1320px] animate-pulse overflow-hidden rounded-[36px] border border-white/70 bg-white/60 p-6 shadow-[0_16px_40px_rgba(153,95,40,0.08)] lg:grid lg:grid-cols-[1fr_0.95fr] lg:gap-8 lg:p-10">
          <div className="space-y-4">
            <div className="h-8 w-40 rounded-full bg-[#F7DDE5]" />
            <div className="h-16 w-3/4 rounded-[24px] bg-[#F9E8D8]" />
            <div className="h-6 w-2/3 rounded-full bg-[#F7DDE5]" />
            <div className="h-24 w-full rounded-[28px] bg-[#FFF2E8]" />
            <div className="h-14 w-44 rounded-[18px] bg-[#F56D92]" />
          </div>
          <div className="mt-8 h-[320px] rounded-[32px] bg-[#FFF1F5] lg:mt-0" />
        </div>
      </section>
    );
  }

  if (!dessert) return null;

  const rating = Math.max(
    0,
    Math.min(5, Math.round(Number(dessert.rating_avg ?? 0)))
  );

  return (
    <section className="relative overflow-hidden bg-[#FEF7E7] px-4 py-14 sm:px-8 lg:px-12 lg:py-18">
      {/* ---- ambient glow orbs ---- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[2%] top-[4%] h-52 w-52 animate-[glowPulse_5s_ease-in-out_infinite] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(255,196,210,0.35) 0%, transparent 72%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute right-[4%] bottom-[6%] h-60 w-60 animate-[glowPulse_6s_ease-in-out_infinite_1s] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(255,219,188,0.3) 0%, transparent 72%)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute left-[42%] top-[40%] h-40 w-40 animate-[glowPulse_7s_ease-in-out_infinite_2s] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(245,179,63,0.2) 0%, transparent 72%)",
            filter: "blur(50px)",
          }}
        />
      </div>

      {/* ---- floating sprinkles ---- */}
      {sprinkles.map((sp, i) => (
        <span
          key={i}
          className="pointer-events-none absolute animate-[sprinkleFloat_6s_ease-in-out_infinite] select-none"
          style={{
            left: sp.x,
            top: sp.y,
            fontSize: sp.size,
            animationDelay: sp.delay,
            opacity: 0.55,
          }}
        >
          {sp.emoji}
        </span>
      ))}

      {/* ---- decorative top-right pattern ---- */}
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 opacity-[0.08]">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="160" cy="40" r="120" stroke="#6B3E06" strokeWidth="0.7" />
          <circle cx="160" cy="40" r="80" stroke="#6B3E06" strokeWidth="0.5" />
          <circle cx="160" cy="40" r="40" stroke="#6B3E06" strokeWidth="0.3" />
        </svg>
      </div>

      {/* ---- main card ---- */}
      <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[38px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,253,249,0.96),rgba(255,243,233,0.92))] shadow-[0_22px_60px_rgba(153,95,40,0.08)] backdrop-blur-sm transition-all duration-700 lg:grid lg:grid-cols-[1fr_0.95fr]">
        {/* ---- subtle top border accent ---- */}
        <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#F56D92] to-transparent" />

        {/* ========== left column (text) ========== */}
        <div className="relative px-6 py-8 sm:px-9 lg:px-12 lg:py-12">
          {/* badge */}
          <div className="group inline-flex items-center gap-2 rounded-full bg-[#FFF0F4] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F25D88] shadow-[0_8px_20px_rgba(242,93,136,0.12)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(242,93,136,0.22)]">
            <HiMiniSparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            Chef Recommendation
          </div>

          <div className="mt-6 max-w-[560px]">
            {/* label */}
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#C28D5E]">
              Chef's Choice
            </p>

            {/* name */}
            <h2
              className="mt-3 animate-[fadeInUp_0.8s_ease-out] font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.95] text-[#6B3E06]"
              style={{ animationFillMode: "both" }}
            >
              {dessert.name}
            </h2>

            {/* rating */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-[#A26E47]">
              <div className="flex items-center gap-1 text-[20px] text-[#F5B33F]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={`inline-block transition-all duration-300 hover:scale-125 ${
                      index < rating
                        ? "opacity-100 drop-shadow-[0_2px_4px_rgba(245,179,63,0.3)]"
                        : "opacity-25"
                    }`}
                    style={{
                      animation: `starPop 0.4s ease-out ${index * 0.08}s both`,
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-sm font-bold uppercase tracking-[0.14em] text-[#B48055]">
                <HiMiniStar className="h-3.5 w-3.5 text-[#F5B33F]" />
                {Number(dessert.rating_avg ?? 0).toFixed(1)} rating
              </span>
            </div>

            {/* description */}
            <div className="relative mt-6">
              <p className="max-w-[520px] text-[16px] leading-8 text-[#835631] sm:text-[17px]">
                {dessert.description?.trim()
                  ? dessert.description
                  : "Handpicked by our chef for this week’s sweetest spotlight, made to steal the first bite and the second one too."}
              </p>
              {/* decorative line under description */}
              <div className="mt-5 h-px w-24 bg-gradient-to-r from-[#F5B33F]/40 to-transparent" />
            </div>

            {/* price + category */}
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="group/card relative rounded-[22px] border border-[#F6DED0] bg-white/70 px-5 py-4 shadow-[0_10px_24px_rgba(149,91,28,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F5B33F]/40 hover:shadow-[0_14px_32px_rgba(149,91,28,0.12)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B48055]">
                  Weekly pick
                </p>
                <p className="mt-1 text-2xl font-black text-[#F25D88] transition-all duration-300 group-hover/card:scale-105">
                  {formatPrice(dessert.price)}
                </p>
              </div>
              {dessert.category_name ? (
                <div className="group/card rounded-[22px] border border-[#F6DED0] bg-[#FFF8F1] px-5 py-4 shadow-[0_6px_16px_rgba(149,91,28,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F5B33F]/40 hover:shadow-[0_12px_28px_rgba(149,91,28,0.1)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#B48055]">
                    Category
                  </p>
                  <p className="mt-1 text-base font-bold text-[#6B3E06] transition-all duration-300 group-hover/card:scale-105">
                    {dessert.category_name}
                  </p>
                </div>
              ) : null}
            </div>

            {/* buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/desserts/${dessert.slug}`}
                style={{color: "var(--color-surface)"}}
                className="group/btn relative inline-flex h-14 min-w-[210px] items-center justify-center gap-2 overflow-hidden rounded-[20px] bg-gradient-to-r from-[#FF8BA6] to-[#F56D92] px-6 text-[15px] font-bold text-white shadow-[0_14px_28px_rgba(245,109,146,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(245,109,146,0.35)] active:scale-[0.97]"
              >
                {/* shimmer overlay */}
                <span className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                <HiMiniChevronDoubleRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                Order Now
                <HiMiniArrowRight className="h-4 w-4 transition-all duration-300 group-hover/btn:translate-x-1" />
              </Link>
              <Link
                to="/desserts"
                className="group/btn2 inline-flex h-14 min-w-[210px] items-center justify-center gap-2 rounded-[20px] border border-[#F2CBD6] bg-white/72 px-6 text-[15px] font-bold text-[#73431B] shadow-[0_8px_18px_rgba(149,91,28,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F49AAF] hover:bg-white hover:shadow-[0_14px_30px_rgba(149,91,28,0.14)] active:scale-[0.97]"
              >
                Explore Menu
                <HiMiniArrowRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover/btn2:translate-x-0.5 group-hover/btn2:opacity-100" />
              </Link>
            </div>
          </div>

          {/* ---- decorative bottom-left corner ---- */}
          <div className="pointer-events-none absolute bottom-6 left-6 opacity-[0.06]">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <path
                d="M10 10 L70 10 L70 70 L10 70 Z"
                stroke="#6B3E06"
                strokeWidth="1"
                strokeDasharray="6 6"
              />
              <circle cx="40" cy="40" r="15" stroke="#F56D92" strokeWidth="0.8" />
            </svg>
          </div>
        </div>

        {/* ========== right column (image) ========== */}
        <div className="relative flex min-h-[360px] items-end justify-center overflow-hidden px-5 pb-6 pt-2 sm:min-h-[460px] sm:px-10 lg:min-h-full lg:pb-10">
          {/* ---- glow behind image ---- */}
          <div
            className="absolute inset-x-[8%] bottom-8 h-20 animate-[glowPulse_4s_ease-in-out_infinite] rounded-full"
            style={{
              background: "rgba(248,107,135,0.18)",
              filter: "blur(32px)",
            }}
          />

          {/* ---- floating decorative icons ---- */}
          <span className="pointer-events-none absolute left-[10%] top-[12%] animate-[sprinkleFloat_5s_ease-in-out_infinite] text-[24px] text-[#F8B6C6] opacity-70 sm:text-[30px]">
            ✦
          </span>
          <span className="pointer-events-none absolute right-[14%] top-[10%] animate-[sprinkleFloat_5.5s_ease-in-out_infinite_0.8s] text-[22px] text-[#FFD1DB] opacity-70 sm:text-[28px]">
            ♥
          </span>
          <span className="pointer-events-none absolute right-[20%] bottom-[18%] animate-[sprinkleFloat_6s_ease-in-out_infinite_1.6s] text-[18px] text-[#F7BA7E] opacity-60 sm:text-[24px]">
            ✧
          </span>
          <span className="pointer-events-none absolute left-[16%] bottom-[12%] animate-[sprinkleFloat_4.8s_ease-in-out_infinite_0.4s] text-[16px] text-[#F5B33F] opacity-50 sm:text-[20px]">
            ◇
          </span>

          {/* ---- image frame ---- */}
          <div className="group/img relative rounded-[34px] bg-[linear-gradient(180deg,rgba(255,244,247,0.85),rgba(255,248,241,0.25))] p-3 shadow-[0_18px_44px_rgba(153,95,40,0.08)] transition-all duration-500 hover:shadow-[0_24px_56px_rgba(153,95,40,0.16)]">
            {/* inner border glow */}
            <div className="pointer-events-none absolute inset-2 rounded-[26px] ring-1 ring-inset ring-white/60" />

            {/* top-right corner sparkle */}
            <span className="pointer-events-none absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] shadow-[0_4px_12px_rgba(245,109,146,0.2)]">
              ✨
            </span>

            <img
              src={dessert.image_url ?? ""}
              alt={dessert.name}
              className="w-full max-w-[520px] rounded-[28px] object-cover shadow-[0_20px_40px_rgba(149,91,28,0.12)] transition-all duration-700 hover:scale-[1.02] lg:max-h-[620px]"
            />

            {/* image shine overlay */}
            <div className="pointer-events-none absolute inset-3 rounded-[26px] bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover/img:opacity-100" />
          </div>
        </div>
      </div>

      {/* ---- inline keyframes ---- */}
      <style>{`
        @keyframes glowPulse {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.08); }
        }
        @keyframes sprinkleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(5deg); }
          50% { transform: translateY(-16px) rotate(-3deg); }
          75% { transform: translateY(-6px) rotate(4deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes starPop {
          from { opacity: 0; transform: scale(0); }
          50% { transform: scale(1.3); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </section>
  );
}

export default ChefChoiceSection;