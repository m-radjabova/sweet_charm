import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiMiniChevronLeft, HiMiniChevronRight } from "react-icons/hi2";
import { PiHeart, PiSparkle, PiQuotes, PiStarFour } from "react-icons/pi";
import { getFeaturedReviews } from "../../../api/reviews";
import type { FeaturedReview } from "../../../types/types";

function formatReviewDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function chunkReviews(reviews: FeaturedReview[], size: number) {
  const pages: FeaturedReview[][] = [];

  for (let index = 0; index < reviews.length; index += size) {
    pages.push(reviews.slice(index, index + size));
  }

  return pages;
}

function FlowerArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  const Icon = direction === "left" ? HiMiniChevronLeft : HiMiniChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group relative flex h-16 w-16 items-center justify-center bg-[#FFE0A8] text-[#68400A] shadow-[0_12px_28px_rgba(104,64,10,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(104,64,10,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        borderRadius: "42% 58% 44% 56% / 52% 43% 57% 48%",
      }}
      aria-label={direction === "left" ? "Previous reviews" : "Next reviews"}
    >
      {/* Glow effect */}
      <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#FFE0A8]/40 to-transparent opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" />
      <Icon className="relative h-8 w-8" />
    </button>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`text-[22px] leading-none transition-all duration-300 ${
            index < rating
              ? "text-[#FA94A9] drop-shadow-[0_2px_4px_rgba(250,148,169,0.3)]"
              : "text-[#F4E2B6]/60"
          }`}
        >
          {index < rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  index,
  isVisible,
}: {
  review: FeaturedReview;
  index: number;
  isVisible: boolean;
}) {
  return (
    <article
      className={`group relative flex h-full min-h-[420px] flex-col rounded-[32px] border border-[#F4E2B6] bg-white px-8 py-9 shadow-[0_12px_36px_-8px_rgba(104,64,10,0.06)] transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_20px_48px_-12px_rgba(104,64,10,0.12)] ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-12 opacity-0"
      }`}
      style={{ transitionDelay: `${200 + index * 120}ms` }}
    >
      {/* Decorative tape */}
      <div className="absolute -top-2 left-[20%] z-10 h-4 w-[60px] rounded-sm bg-gradient-to-r from-[#FA94A9]/30 to-[#FFB880]/30 opacity-80 shadow-sm" style={{ transform: "rotate(-2deg)" }} />
      <div className="absolute -top-2 right-[25%] z-10 h-4 w-[50px] rounded-sm bg-gradient-to-r from-[#FA94A9]/20 to-[#FFB880]/20 opacity-70 shadow-sm" style={{ transform: "rotate(3deg)" }} />

      {/* Corner decorative elements */}
      <PiSparkle className="absolute -left-2 -top-2 h-5 w-5 text-[#FA94A9]/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <PiStarFour className="absolute -right-2 -bottom-2 h-5 w-5 text-[#C8924A]/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Quote icon */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF0E0] to-[#FFE0C0] text-[#C8924A] shadow-inner">
          <PiQuotes className="h-5 w-5" />
        </div>
        <span className="text-[40px] leading-none text-[#FA94A9]/10 font-serif select-none">"</span>
      </div>

      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Review text */}
      <p className="mt-5 text-[20px] leading-[1.5] text-[#68400A] sm:text-[22px]">
        {review.text}
      </p>

      {/* Author info */}
      <div className="mt-auto pt-8">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#F4E2B6] to-transparent" />
        <div className="mt-5 flex items-center gap-4">
          {/* Avatar placeholder */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FA94A9] to-[#FFB880] text-white shadow-md shadow-[#FA94A9]/20">
            <span className="text-[18px] font-semibold">
              {review.customer_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-[20px] font-semibold text-[#68400A]">{review.customer_name}</p>
            <p className="mt-0.5 text-[15px] text-[#8F6A2F]/80">{formatReviewDate(review.created_at)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function ReviewsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["featured-reviews"],
    queryFn: () => getFeaturedReviews(6),
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const pages = useMemo(() => chunkReviews(data, 3), [data]);
  const [currentPage, setCurrentPage] = useState(0);
  const safePageIndex = pages.length === 0 ? 0 : Math.min(currentPage, pages.length - 1);
  const visibleReviews = pages[safePageIndex] ?? [];

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#FDE8C8] via-[#FEF0D8] to-[#FFF5E8] px-4 pb-24 pt-14 sm:px-8 lg:px-12 lg:pb-32 lg:pt-24"
    >
      {/* ===== DECORATIVE BACKGROUND ELEMENTS ===== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Floating gradient orbs */}
        <div className="absolute -left-32 -top-32 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-br from-[#FA94A9]/20 to-[#FFB880]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-tl from-[#C8924A]/20 to-[#FFE0C0]/5 blur-3xl" style={{ animationDelay: "1.5s" }} />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#FA94A9]/15 to-[#FFD4A0]/5 blur-3xl" style={{ animationDelay: "3s" }} />

        {/* Decorative stars & symbols */}
        <span
          className={`absolute left-[5%] top-[15%] text-[24px] text-[#C8924A]/40 max-[768px]:hidden transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ animation: "floatStar 4s ease-in-out infinite" }}
        >
          ✦
        </span>
        <span
          className={`absolute right-[8%] top-[10%] text-[20px] text-[#C8924A]/40 max-[768px]:hidden transition-all duration-1000 delay-200 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ animation: "floatStar 4s ease-in-out infinite 0.5s" }}
        >
          ♡
        </span>
        <span
          className={`absolute left-[12%] bottom-[12%] text-[18px] text-[#C8924A]/30 max-[768px]:hidden transition-all duration-1000 delay-400 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ animation: "floatStar 4s ease-in-out infinite 1s" }}
        >
          ✦
        </span>
        <span
          className={`absolute right-[5%] bottom-[18%] text-[22px] text-[#C8924A]/30 max-[768px]:hidden transition-all duration-1000 delay-600 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ animation: "floatStar 4s ease-in-out infinite 1.5s" }}
        >
          ○
        </span>

        {/* Extra sparkles */}
        <span className="absolute left-[3%] top-[8%] text-[16px] text-[#FA94A9]/30 max-[768px]:hidden" style={{ animation: "sparkle 3s ease-in-out infinite" }}>✦</span>
        <span className="absolute right-[3%] top-[20%] text-[14px] text-[#FA94A9]/30 max-[768px]:hidden" style={{ animation: "sparkle 3s ease-in-out infinite 1s" }}>✦</span>
        <span className="absolute left-[18%] bottom-[5%] text-[15px] text-[#C8924A]/25 max-[768px]:hidden" style={{ animation: "sparkle 3s ease-in-out infinite 0.5s" }}>✦</span>
        <span className="absolute right-[15%] bottom-[8%] text-[13px] text-[#C8924A]/25 max-[768px]:hidden" style={{ animation: "sparkle 3s ease-in-out infinite 1.5s" }}>✦</span>

        {/* Decorative circles */}
        <div className="absolute left-[20%] top-[20%] h-[50px] w-[50px] rounded-full border-2 border-[#FA94A9]/10 max-[768px]:hidden" style={{ animation: "floatStar 6s ease-in-out infinite" }} />
        <div className="absolute right-[25%] bottom-[25%] h-[35px] w-[35px] rounded-full border-2 border-[#C8924A]/10 max-[768px]:hidden" style={{ animation: "floatStar 6s ease-in-out infinite 2s" }} />
      </div>

      <div className="relative mx-auto max-w-[1680px]">
        {/* ===== HEADER SECTION ===== */}
        <div
          className={`text-center transition-all duration-800 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Decorative icon above heading */}
          <div className="mb-5 flex justify-center">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FA94A9] to-[#FFB880] text-white shadow-lg shadow-[#FA94A9]/30 sm:h-20 sm:w-20">
                <PiHeart className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#FA94A9]/20 to-[#FFB880]/20 blur-lg" />
            </div>
          </div>

          <div className="inline-flex items-center gap-4 sm:gap-7">
            <span
              className="text-[24px] text-[#C8924A] sm:text-[30px]"
              style={{ animation: "sparkle 3s ease-in-out infinite" }}
            >
              ✦
            </span>
            <h2
              className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0]"
              style={{
                fontSize: "clamp(4.5rem, 8vw, 7rem)",
                background: "linear-gradient(135deg, #68400A 0%, #8B5B19 40%, #A07030 70%, #68400A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 4px rgba(139, 91, 25, 0.2))",
              }}
            >
              What customers say
            </h2>
            <span
              className="text-[24px] text-[#C8924A] sm:text-[30px]"
              style={{ animation: "sparkle 3s ease-in-out infinite 1s" }}
            >
              ✦
            </span>
          </div>

          {/* Decorative line under heading */}
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <span className="block h-[2px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#C8924A] to-transparent sm:w-16" />
            <span className="block h-[6px] w-[6px] rounded-full bg-[#C8924A]" />
            <span className="block h-[2px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#C8924A] to-transparent sm:w-16" />
          </div>

          <p className="mx-auto mt-6 max-w-[620px] text-[17px] leading-[1.7] text-[#7A4E1A] sm:text-[19px]">
            Hear from our lovely customers about their sweet experiences with us.
          </p>
        </div>

        {/* ===== REVIEWS CAROUSEL ===== */}
        <div className="mt-12 flex items-center gap-5 xl:gap-8">
          <div className="hidden shrink-0 lg:block">
            <FlowerArrowButton
              direction="left"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
              disabled={safePageIndex === 0}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="grid gap-8 lg:grid-cols-3">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[420px] animate-pulse rounded-[32px] border border-[#F4E2B6] bg-white/60"
                    >
                      <div className="flex h-full flex-col p-8">
                        <div className="mb-4 h-10 w-10 rounded-full bg-[#F4E2B6]/60" />
                        <div className="mb-3 flex gap-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-5 w-5 rounded bg-[#F4E2B6]/60" />
                          ))}
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 w-full rounded bg-[#F4E2B6]/60" />
                          <div className="h-4 w-3/4 rounded bg-[#F4E2B6]/60" />
                          <div className="h-4 w-5/6 rounded bg-[#F4E2B6]/60" />
                        </div>
                        <div className="mt-auto pt-8">
                          <div className="mb-4 h-[1px] w-full bg-[#F4E2B6]/40" />
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-[#F4E2B6]/60" />
                            <div className="space-y-2">
                              <div className="h-4 w-28 rounded bg-[#F4E2B6]/60" />
                              <div className="h-3 w-20 rounded bg-[#F4E2B6]/40" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : visibleReviews.map((review, index) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      index={index}
                      isVisible={isVisible}
                    />
                  ))}
            </div>

            {!isLoading && (isError || data.length === 0) ? (
              <div className="mt-8 rounded-[28px] border border-[#F4E2B6] bg-white/80 px-6 py-10 text-center backdrop-blur-sm">
                <div className="mb-3 flex justify-center">
                  <PiHeart className="h-10 w-10 text-[#FA94A9]/50" />
                </div>
                <p className="text-[18px] text-[#8F6A2F]">
                  Reviews hozircha topilmadi.
                </p>
              </div>
            ) : null}
          </div>

          <div className="hidden shrink-0 lg:block">
            <FlowerArrowButton
              direction="right"
              onClick={() => setCurrentPage((page) => Math.min(page + 1, pages.length - 1))}
              disabled={pages.length === 0 || safePageIndex >= pages.length - 1}
            />
          </div>
        </div>

        {/* ===== MOBILE ARROWS ===== */}
        {pages.length > 1 ? (
          <>
            <div className="mt-8 flex justify-center gap-4 lg:hidden">
              <FlowerArrowButton
                direction="left"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
                disabled={safePageIndex === 0}
              />
              <FlowerArrowButton
                direction="right"
                onClick={() => setCurrentPage((page) => Math.min(page + 1, pages.length - 1))}
                disabled={safePageIndex >= pages.length - 1}
              />
            </div>

            {/* ===== PAGINATION DOTS ===== */}
            <div className="mt-10 flex items-center justify-center gap-3">
              {pages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to review page ${index + 1}`}
                  onClick={() => setCurrentPage(index)}
                  className="group relative flex items-center justify-center"
                >
                  <span
                    className={`block rounded-full transition-all duration-500 ${
                      index === safePageIndex
                        ? "h-4 w-10 bg-gradient-to-r from-[#68400A] to-[#8B5B19] shadow-md"
                        : "h-3.5 w-3.5 bg-[#FFE0A8] hover:bg-[#F0D098]"
                    }`}
                  />
                  {index === safePageIndex && (
                    <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#68400A]/10 to-[#8B5B19]/10 blur-md" />
                  )}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* ===== KEYFRAMES ===== */}
      <style>{`
        @keyframes floatStar {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
      `}</style>
    </section>
  );
}

export default ReviewsSection;