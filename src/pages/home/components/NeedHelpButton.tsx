import { useEffect, useState } from "react";
import { IoHelpCircleOutline } from "react-icons/io5";

function NeedHelpButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToFaqs() {
    const faqsSection = document.getElementById("faqs");
    if (faqsSection) {
      faqsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <button
      type="button"
      onClick={scrollToFaqs}
      aria-label="Need help? Open FAQs"
      className={`group fixed bottom-6 right-5 z-50 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#C8924A] to-[#DBA45C] text-white shadow-[0_8px_20px_rgba(200,146,74,0.3)] transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(200,146,74,0.4)] active:scale-90 sm:bottom-8 sm:right-8 ${
        isVisible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-4 scale-90 opacity-0 pointer-events-none"
      }`}
    >
      <span className="relative flex items-center justify-center">
        <IoHelpCircleOutline className="h-6 w-6" />
      </span>

      {/* Tooltip text on hover */}
      <span className="hidden absolute right-full mr-3 whitespace-nowrap rounded-lg bg-[#68400A]/90 px-3 py-1.5 text-[13px] font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:opacity-100 sm:block">
        Need Help?
      </span>

      {/* Pulse ring */}
      <span className="absolute inset-0 animate-ping rounded-full bg-[#C8924A]/20" style={{ animationDuration: "3s" }} />
    </button>
  );
}

export default NeedHelpButton;
