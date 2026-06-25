import { useNavigate } from "react-router-dom";
import { HiMiniShoppingCart } from "react-icons/hi2";
import { useCart } from "../../../hooks/useCart";

function StickyCartButton() {
  const { itemCount } = useCart();
  const navigate = useNavigate();

  // Don't render if cart is empty
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 sm:bottom-8">
      <div className="animate-slide-up w-full max-w-[400px]">
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="group relative w-full overflow-hidden rounded-[22px] bg-gradient-to-r from-[#F86B87] to-[#FA94A9] px-6 py-4 shadow-[0_12px_32px_rgba(248,107,135,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(248,107,135,0.45)] active:scale-[0.98]"
        >
          {/* Decorative sparkles */}
          <span className="pointer-events-none absolute -left-2 -top-2 text-[18px] text-white/10">✦</span>
          <span className="pointer-events-none absolute -bottom-2 -right-2 text-[14px] text-white/10">✦</span>

          <div className="relative z-10 flex items-center justify-center gap-3">
            <div className="relative">
              <HiMiniShoppingCart className="h-6 w-6 text-white" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#F86B87] shadow-md">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            </div>
            <span className="text-[17px] font-bold tracking-wide text-white">
              View Cart ({itemCount})
            </span>
            <span className="inline-block text-lg text-white/70 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>

          {/* Shimmer effect */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.12),transparent)] translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]" />
        </button>
      </div>
    </div>
  );
}

export default StickyCartButton;