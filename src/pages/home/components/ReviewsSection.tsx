import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiMiniChevronLeft, HiMiniChevronRight } from "react-icons/hi2";
import { PiHeart, PiQuotes, PiStarFour } from "react-icons/pi";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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
      className="group relative flex h-14 w-14 items-center justify-center bg-[#FFE0A8] text-[#68400A] shadow-[0_12px_28px_rgba(104,64,10,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(104,64,10,0.15)] disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        borderRadius: "42% 58% 44% 56% / 52% 43% 57% 48%",
      }}
      aria-label={direction === "left" ? "Previous review" : "Next review"}
    >
      <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-[#FFE0A8]/40 to-transparent opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100 group-disabled:opacity-0" />
      <Icon className="relative h-7 w-7" />
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
  isActive,
}: {
  review: FeaturedReview;
  isActive: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex h-full min-h-[360px] cursor-grab flex-col rounded-[28px] border border-[#F4E2B6] bg-white px-5 py-6 shadow-[0_12px_36px_-8px_rgba(104,64,10,0.06)] select-none sm:min-h-[400px] sm:rounded-[32px] sm:px-8 sm:py-9"
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      animate={{
        scale: isActive ? 1 : 0.9,
        opacity: isActive ? 1 : 0.6,
        boxShadow: isHovered
          ? "0 24px 52px -16px rgba(104,64,10,0.18)"
          : isActive
            ? "0 12px 36px -8px rgba(104,64,10,0.08)"
            : "0 8px 24px -6px rgba(104,64,10,0.04)",
        y: isHovered ? -6 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8,
      }}
    >
      {/* Decorative tape */}
      <div
        className="absolute -top-2 left-[20%] z-10 h-4 w-[60px] rounded-sm bg-gradient-to-r from-[#FA94A9]/30 to-[#FFB880]/30 opacity-80 shadow-sm"
        style={{ transform: "rotate(-2deg)" }}
      />
      <div
        className="absolute -top-2 right-[25%] z-10 h-4 w-[50px] rounded-sm bg-gradient-to-r from-[#FA94A9]/20 to-[#FFB880]/20 opacity-70 shadow-sm"
        style={{ transform: "rotate(3deg)" }}
      />

      {/* Corner decorative elements */}
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0, rotate: isHovered ? 0 : -45 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute -left-2 -top-2"
      >
        <PiStarFour className="h-5 w-5 text-[#FA94A9]/40" />
      </motion.div>
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0, rotate: isHovered ? 0 : 45 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        className="absolute -right-2 -bottom-2"
      >
        <PiStarFour className="h-5 w-5 text-[#C8924A]/40" />
      </motion.div>

      {/* Quote icon with animation */}
      <div className="mb-4 flex items-center justify-between">
        <motion.div
          animate={{
            scale: isHovered ? 1.15 : 1,
            rotate: isHovered ? -5 : 0,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF0E0] to-[#FFE0C0] text-[#C8924A] shadow-inner"
        >
          <motion.div
            animate={{ scale: isHovered ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <PiQuotes className="h-5 w-5" />
          </motion.div>
        </motion.div>
        <motion.span
          animate={{
            opacity: isHovered ? 0.2 : 0.08,
            y: isHovered ? -2 : 0,
          }}
          className="text-[40px] leading-none text-[#FA94A9] font-serif select-none"
        >
          "
        </motion.span>
      </div>

      {/* Stars */}
      <StarRating rating={review.rating} />

      {/* Review text */}
      <p className="mt-4 text-[17px] leading-[1.55] text-[#68400A] sm:text-[21px]">
        {review.text}
      </p>

      {/* Author info */}
      <div className="mt-auto pt-6">
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#F4E2B6] to-transparent" />
        <div className="mt-4 flex items-center gap-4">
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FA94A9] to-[#FFB880] text-white shadow-md shadow-[#FA94A9]/20"
          >
            <span className="text-[18px] font-semibold">
              {review.customer_name.charAt(0).toUpperCase()}
            </span>
          </motion.div>
          <div>
            <p className="text-[17px] font-semibold text-[#68400A] sm:text-[19px]">
              {review.customer_name}
            </p>
            <p className="mt-0.5 text-[14px] text-[#8F6A2F]/80">
              {formatReviewDate(review.created_at)}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ReviewsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const autoplayRef = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const { data = [], isLoading } = useQuery({
    queryKey: ["featured-reviews"],
    queryFn: () => getFeaturedReviews(),
  });

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      loop: true,
      skipSnaps: false,
      dragFree: false,
      containScroll: "trimSnaps",
      slidesToScroll: 1,
    },
    [autoplayRef.current]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setVisibleIndexes(emblaApi.slidesInView());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (emblaApi && data.length > 0) {
      emblaApi.scrollTo(0);
    }
  }, [data, emblaApi]);

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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const slideCount = data.length;

  const floatElements = [
    { symbol: "⭐", left: "6%", top: "12%", delay: 0, size: "text-[22px]" },
    { symbol: "♡", right: "10%", top: "8%", delay: 0.5, size: "text-[20px]" },
    { symbol: "☁", left: "14%", bottom: "10%", delay: 1, size: "text-[24px]" },
    { symbol: "⭐", right: "8%", bottom: "16%", delay: 1.5, size: "text-[18px]" },
    { symbol: "♡", left: "50%", top: "5%", delay: 0.8, size: "text-[16px]" },
    { symbol: "☁", left: "80%", top: "20%", delay: 1.2, size: "text-[20px]" },
  ];

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#FDE8C8] via-[#FEF0D8] to-[#FFF5E8] px-4 pb-20 pt-14 sm:px-8 lg:px-12 lg:pb-32 lg:pt-24"
    >
      {/* ===== DECORATIVE BACKGROUND ===== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-br from-[#FA94A9]/20 to-[#FFB880]/10 blur-3xl" />
        <div
          className="absolute -bottom-32 -right-32 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-tl from-[#C8924A]/20 to-[#FFE0C0]/5 blur-3xl"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#FA94A9]/15 to-[#FFD4A0]/5 blur-3xl"
          style={{ animationDelay: "3s" }}
        />

        {/* Floating pastel symbols */}
        {isVisible &&
          floatElements.map((el, i) => (
            <motion.span
              key={i}
              className={`absolute max-[768px]:hidden ${el.size} text-[#C8924A]/30`}
              style={{
                left: el.left,
                right: el.right,
                top: el.top,
                bottom: el.bottom,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 0.3,
                y: [0, -10, 0],
              }}
              transition={{
                opacity: { duration: 1, delay: 0.3 + el.delay },
                y: {
                  duration: 4 + el.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: el.delay,
                },
              }}
            >
              {el.symbol}
            </motion.span>
          ))}

        {/* Decorative circles */}
        <motion.div
          className="absolute left-[20%] top-[20%] h-[50px] w-[50px] rounded-full border-2 border-[#FA94A9]/10 max-[768px]:hidden"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[25%] bottom-[25%] h-[35px] w-[35px] rounded-full border-2 border-[#C8924A]/10 max-[768px]:hidden"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1680px]">
        {/* ===== HEADER ===== */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mb-5 hidden justify-center sm:flex">
            <div className="relative">
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FA94A9] to-[#FFB880] text-white shadow-lg shadow-[#FA94A9]/30 sm:h-20 sm:w-20"
                whileHover={{ scale: 1.05, rotate: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <PiHeart className="h-8 w-8 sm:h-10 sm:w-10" />
              </motion.div>
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-[#FA94A9]/20 to-[#FFB880]/20 blur-lg" />
            </div>
          </div>

          <div className="inline-flex items-center gap-4 sm:gap-7">
            <motion.span
              className="text-[24px] text-[#C8924A] sm:text-[30px]"
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              ✦
            </motion.span>
            <h2
              className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0]"
              style={{
                fontSize: "clamp(3.4rem, 13vw, 7rem)",
                background:
                  "linear-gradient(135deg, #68400A 0%, #8B5B19 40%, #A07030 70%, #68400A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 4px rgba(139, 91, 25, 0.2))",
              }}
            >
              What customers say
            </h2>
            <motion.span
              className="text-[24px] text-[#C8924A] sm:text-[30px]"
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              ✦
            </motion.span>
          </div>

          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <span className="block h-[2px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#C8924A] to-transparent sm:w-16" />
            <span className="block h-[6px] w-[6px] rounded-full bg-[#C8924A]" />
            <span className="block h-[2px] w-12 rounded-full bg-gradient-to-r from-transparent via-[#C8924A] to-transparent sm:w-16" />
          </div>

          <p className="mx-auto mt-4 max-w-[620px] px-2 text-[16px] leading-[1.65] text-[#7A4E1A] sm:mt-6 sm:text-[19px]">
            Hear from our lovely customers about their sweet experiences with us.
          </p>
        </motion.div>

        {/* ===== REVIEWS CAROUSEL ===== */}
        <div className="mt-10 flex items-center gap-4 xl:gap-6">
          <div className="hidden shrink-0 lg:block">
            <FlowerArrowButton
              direction="left"
              onClick={scrollPrev}
              disabled={slideCount === 0}
            />
          </div>

          <div className="min-w-0 flex-1 overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {isLoading ? (
                <div className="flex min-w-0 flex-1 gap-6 pr-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="relative min-h-[400px] min-w-0 shrink-0 grow-0 basis-full lg:basis-1/3"
                    >
                      <div className="h-full animate-pulse rounded-[32px] border border-[#F4E2B6] bg-white/60 p-8">
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
                  ))}
                </div>
              ) : data.length === 0 ? (
                <div className="w-full rounded-[28px] border border-[#F4E2B6] bg-white/80 px-6 py-10 text-center backdrop-blur-sm">
                  <div className="mb-3 flex justify-center">
                    <PiHeart className="h-10 w-10 text-[#FA94A9]/50" />
                  </div>
                  <p className="text-[18px] text-[#8F6A2F]">
                    Reviews hozircha topilmadi.
                  </p>
                </div>
              ) : (
                data.map((review, idx) => {
                  const isActive =
                    idx === selectedIndex || visibleIndexes.includes(idx);
                  return (
                    <div
                      key={review.id}
                      className="relative min-h-[400px] min-w-0 shrink-0 grow-0 basis-full pl-2 sm:pl-6 lg:basis-1/3"
                    >
                      <ReviewCard review={review} isActive={!!isActive} />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="hidden shrink-0 lg:block">
            <FlowerArrowButton
              direction="right"
              onClick={scrollNext}
              disabled={slideCount === 0}
            />
          </div>
        </div>

        {/* ===== MOBILE ARROWS & DOTS ===== */}
        {slideCount > 0 && (
          <>
            <div className="mt-7 flex justify-center gap-4 lg:hidden">
              <FlowerArrowButton
                direction="left"
                onClick={scrollPrev}
                disabled={slideCount === 0}
              />
              <FlowerArrowButton
                direction="right"
                onClick={scrollNext}
                disabled={slideCount === 0}
              />
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              {data.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to review ${index + 1}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className="group relative flex items-center justify-center"
                >
                  <motion.span
                    className={`block rounded-full transition-all duration-500 ${
                      index === selectedIndex
                        ? "h-4 w-10 bg-gradient-to-r from-[#68400A] to-[#8B5B19] shadow-md"
                        : "h-3.5 w-3.5 bg-[#FFE0A8] hover:bg-[#F0D098]"
                    }`}
                  />
                  {index === selectedIndex && (
                    <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#68400A]/10 to-[#8B5B19]/10 blur-md" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default ReviewsSection;
