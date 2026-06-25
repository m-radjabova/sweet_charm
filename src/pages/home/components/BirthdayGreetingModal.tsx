import { useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  HiMiniGift,
  HiMiniXMark,
  HiSparkles,
  HiHeart,
} from "react-icons/hi2";
import confetti from "canvas-confetti";
import greetingCard from "../../../assets/greeting_card/greeting_card.png";
import {
  getBirthdayGreeting,
  markBirthdayGreetingShown,
} from "../../../api/birthdayGreeting";

type BirthdayGreetingModalProps = {
  enabled: boolean;
};
function useInfiniteConfetti(active: boolean) {
  const animRef = useRef<number | null>(null);
  const lastTick = useRef(0);

  const fire = useCallback(() => {
    if (!active) return;

    const now = performance.now();
    /* throttle to ~1 burst every 400 ms */
    if (now - lastTick.current < 400) return;
    lastTick.current = now;

    const originX = Math.random() * 0.8 + 0.1; // 0.1 … 0.9
    const originY = Math.random() * -0.1; // above viewport

    /* main burst */
    confetti({
      particleCount: Math.floor(Math.random() * 12) + 6,
      spread: Math.floor(Math.random() * 60) + 40,
      origin: { x: originX, y: originY },
      colors: ["#FF8BA6", "#F5B33F", "#FFD0DB", "#C084FC", "#60A5FA"],
      ticks: 80,
      gravity: 0.7,
      scalar: 1 + Math.random(),
      startVelocity: 25 + Math.random() * 18,
    });

    /* tiny side burst */
    confetti({
      particleCount: 4,
      spread: 30,
      origin: { x: originX + 0.05, y: originY },
      colors: ["#FDE68A", "#FBCFE8"],
      ticks: 50,
      gravity: 0.6,
      scalar: 0.8,
      startVelocity: 15,
    });

    animRef.current = window.requestAnimationFrame(fire);
  }, [active]);

  useEffect(() => {
    if (!active) {
      if (animRef.current !== null) {
        window.cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      return;
    }

    /* fire immediately then recurse */
    animRef.current = window.requestAnimationFrame(fire);

    return () => {
      if (animRef.current !== null) {
        window.cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };
  }, [active, fire]);
}

const sparkleStyles = `
@keyframes float-sparkle {
  0%   { opacity: 0; transform: translateY(0) scale(0.4) rotate(0deg); }
  30%  { opacity: 0.9; }
  70%  { opacity: 0.9; }
  100% { opacity: 0; transform: translateY(-60px) scale(1.1) rotate(180deg); }
}
@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0.9; }
}
@keyframes card-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

function SparkleDot({
  top,
  left,
  delay,
  size = 6,
  color = "#F5B33F",
}: {
  top: string;
  left: string;
  delay: number;
  size?: number;
  color?: string;
}) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: `0 0 ${size + 4}px ${color}`,
        animation: `float-sparkle 3.2s ease-in-out ${delay}s infinite`,
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
}
const floatingIcons = [
  { icon: "✦", top: "8%", left: "3%", size: 18, color: "#F5B33F", delay: 0 },
  { icon: "♥", top: "12%", right: "5%", size: 16, color: "#FF8BA6", delay: 0.6 },
  { icon: "✦", top: "72%", left: "2%", size: 12, color: "#C084FC", delay: 1.2 },
  { icon: "♥", top: "78%", right: "4%", size: 14, color: "#F472B6", delay: 0.3 },
  { icon: "✦", top: "45%", left: "1%", size: 10, color: "#60A5FA", delay: 0.9 },
  { icon: "✦", top: "38%", right: "2%", size: 11, color: "#FDE68A", delay: 1.5 },
] as const;
function BirthdayGreetingModal({ enabled }: BirthdayGreetingModalProps) {
  const greetingQuery = useQuery({
    queryKey: ["birthday-greeting"],
    queryFn: getBirthdayGreeting,
    enabled,
  });

  const markShownMutation = useMutation({
    mutationFn: markBirthdayGreetingShown,
  });

  const shouldShow = enabled && greetingQuery.data?.show;

  /* infinite confetti while modal is open */
  useInfiniteConfetti(!!shouldShow);

  useEffect(() => {
    if (!shouldShow) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [shouldShow]);

  function handleClose() {
    if (!shouldShow || markShownMutation.isPending) return;
    markShownMutation.mutate(undefined, {
      onSuccess: () => {
        void greetingQuery.refetch();
      },
    });
  }

  if (!shouldShow) return null;

  const recipientName = greetingQuery.data?.name ?? "Sweet Friend";
  const message =
    greetingQuery.data?.message ??
    "Wishing you a day filled with joy, laughter, and sweet moments.";

  return (
    <>
      <style>{sparkleStyles}</style>

      {/* ---------- backdrop ---------- */}
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#3D1E00]/30 px-4 backdrop-blur-sm">
        {/* ---------- card container ---------- */}
        <div
          className="relative w-full max-w-[780px] overflow-visible"
          style={{ animation: "card-float 4.2s ease-in-out infinite" }}
        >
          {/* floating decorations (outside the card) */}
          {floatingIcons.map((item, idx) => (
            <span
              key={idx}
              aria-hidden
              style={{
                position: "absolute",
                top: item.top,
                left: "left" in item ? item.left : undefined,
                right: "right" in item ? item.right : undefined,
                fontSize: item.size,
                color: item.color,
                opacity: 0.55,
                filter: `drop-shadow(0 0 6px ${item.color})`,
                animation: `float-sparkle 3.6s ease-in-out ${item.delay}s infinite`,
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              {item.icon}
            </span>
          ))}

          {/* main greeting card */}
          <div className="relative flex flex-col overflow-hidden rounded-[32px] border border-white/80 bg-[#FFFCFA] shadow-[0_32px_100px_rgba(60,30,6,0.22)] sm:flex-row sm:items-stretch">
            {/* sparkle dots inside card */}
            <SparkleDot top="6%" left="8%" delay={0} color="#F5B33F" />
            <SparkleDot top="10%" left="75%" delay={0.5} color="#FF8BA6" />
            <SparkleDot top="92%" left="15%" delay={1} color="#C084FC" />
            <SparkleDot top="88%" left="85%" delay={1.8} color="#60A5FA" />

            {/* close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_4px_14px_rgba(126,79,35,0.12)] text-[#8F6336] transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-[0_6px_20px_rgba(126,79,35,0.18)]"
              aria-label="Close birthday greeting"
            >
              <HiMiniXMark className="h-5 w-5" />
            </button>

            {/* ---------- LEFT: content ---------- */}
            <div className="relative flex flex-col justify-center px-6 pb-8 pt-12 sm:w-1/2 sm:px-7 sm:pb-8 sm:pt-10">
              {/* badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#FFF0F4] to-[#FFE8EF] px-4 py-[7px] shadow-[0_4px_12px_rgba(242,93,136,0.08)]">
                <HiMiniGift className="h-4 w-4 text-[#F25D88]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F25D88]">
                  Birthday Surprise
                </span>
              </div>

              {/* heading */}
              <h2 className="mt-5 font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[clamp(2rem,3.8vw,3.2rem)] leading-[0.92] text-[#6B3E06]">
                Happy Birthday,
                <br />
                {recipientName}!
              </h2>

              {/* stars */}
              <div className="mt-4 flex items-center gap-1 text-[18px] text-[#F5B33F]">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span
                    key={idx}
                    style={{
                      animation: `pulse-glow 2s ease-in-out ${idx * 0.15}s infinite`,
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* message */}
              <p className="mt-4 text-[14px] leading-[1.8] text-[#8A5B34] sm:text-[15px]">
                {message}
              </p>

              {/* info box */}
              <div className="mt-5 rounded-[18px] border border-[#F7DDE5] bg-[#FFF8FB] px-4 py-3 text-[12px] font-medium leading-[1.7] text-[#A06E47] sm:text-[13px]">
                Your SweetCharm birthday greeting is saved for this year, so
                once you close it, it won't pop up again until next
                birthday season.
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleClose}
                disabled={markShownMutation.isPending}
                className="mt-5 inline-flex h-[48px] w-full items-center justify-center rounded-[18px] bg-gradient-to-r from-[#FF8BA6] to-[#F56D92] text-[14px] font-bold text-white shadow-[0_12px_28px_rgba(245,109,146,0.28)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_16px_36px_rgba(245,109,146,0.35)] active:translate-y-0 disabled:opacity-70"
              >
                {markShownMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="-ml-1 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving…
                  </span>
                ) : (
                  "Close Greeting"
                )}
              </button>
            </div>

            {/* ---------- RIGHT: image section ---------- */}
            <div className="relative flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(255,225,235,0.55),rgba(255,245,240,0.92)_70%)] px-4 pb-6 pt-4 sm:w-1/2 sm:pb-0 sm:pt-0">
              {/* decorative shimmer line */}
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[3px]"
                style={{
                  background:
                    "linear-gradient(180deg,transparent,#FF8BA6,#F5B33F,#C084FC,transparent)",
                  backgroundSize: "100% 200%",
                  animation: "shimmer 3s linear infinite",
                }}
              />

              {/* greeting card image */}
              <img
                src={greetingCard}
                alt="Sweet Charm birthday greeting card"
                className="relative z-10 w-full max-w-[280px] object-contain drop-shadow-[0_18px_36px_rgba(144,88,33,0.18)] sm:max-w-[340px]"
              />

              {/* tiny sparkle overlays on image */}
              <HiSparkles
                className="absolute left-[16%] top-[16%] h-5 w-5 text-[#F5B33F]/60"
                style={{
                  animation: "pulse-glow 2.4s ease-in-out 0.3s infinite",
                }}
              />
              <HiSparkles
                className="absolute right-[14%] bottom-[14%] h-4 w-4 text-[#FF8BA6]/50"
                style={{
                  animation: "pulse-glow 2.8s ease-in-out 1s infinite",
                }}
              />
              <HiHeart
                className="absolute right-[22%] top-[24%] h-5 w-5 text-[#FF8BA6]/40"
                style={{
                  animation: "pulse-glow 3s ease-in-out 0.6s infinite",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BirthdayGreetingModal;