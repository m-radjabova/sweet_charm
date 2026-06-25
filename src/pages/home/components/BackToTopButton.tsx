import { useEffect, useState } from "react";
import { HiMiniArrowUp } from "react-icons/hi2";

function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-[6.75rem] right-5 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#F86B87] to-[#FA94A9] text-white shadow-[0_8px_20px_rgba(248,107,135,0.3)] transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(248,107,135,0.4)] active:scale-90 sm:bottom-[7.5rem] sm:right-8 ${
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-4 scale-90 opacity-0 pointer-events-none"
      }`}
    >
      {/* Cupcake/bunny icon via SVG */}
      <span className="relative flex items-center justify-center">
        {/* Bunny ears */}
        <svg
          viewBox="0 0 24 24"
          className="absolute -top-3 h-5 w-5 text-white/80"
          fill="currentColor"
        >
          <ellipse cx="9" cy="6" rx="3" ry="5" transform="rotate(-15 9 6)" />
          <ellipse cx="15" cy="6" rx="3" ry="5" transform="rotate(15 15 6)" />
        </svg>
        <HiMiniArrowUp className="h-5 w-5" />
      </span>

      {/* Pulse ring */}
      <span className="absolute inset-0 animate-ping rounded-full bg-[#F86B87]/20" style={{ animationDuration: "3s" }} />
    </button>
  );
}

export default BackToTopButton;
