import { useEffect, useState } from "react";
import { HiMiniExclamationTriangle, HiMiniTrash, HiMiniXMark } from "react-icons/hi2";

export default function AdminConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  loadingLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  tone = "danger",
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loadingLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  tone?: "danger" | "warning";
}) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isLoading, onCancel]);

  if (!visible) return null;

  const toneStyles =
    tone === "warning"
      ? {
          iconWrap: "bg-[#FFF6E7] text-[#F2A53B] ring-[#FCE4C3]",
          iconGlow: "bg-[#F2A53B]/10",
          confirmButton: "from-[#F7B24A] to-[#F29452] shadow-[0_8px_24px_rgba(242,165,59,0.25)] hover:shadow-[0_12px_32px_rgba(242,165,59,0.35)]",
          confirmLoader: "border-white/40 border-t-white",
          accent: "#F2A53B",
        }
      : {
          iconWrap: "bg-[#FFF0F4] text-[#F25D88] ring-[#FCCFD8]",
          iconGlow: "bg-[#F25D88]/10",
          confirmButton: "from-[#FF7E9F] to-[#F25D88] shadow-[0_8px_24px_rgba(242,93,136,0.25)] hover:shadow-[0_12px_32px_rgba(242,93,136,0.35)]",
          confirmLoader: "border-white/40 border-t-white",
          accent: "#F25D88",
        };

  return (
    <div
      className={`fixed inset-0 z-[140] flex items-center justify-center px-4 transition-all duration-300 ${
        animating ? "bg-[#2B1606]/40 backdrop-blur-sm" : "bg-transparent backdrop-blur-none"
      }`}
      onClick={() => {
        if (!isLoading) onCancel();
      }}
    >
      <div
        className={`relative w-full max-w-md transition-all duration-200 ${
          animating ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Decorative top accent line */}
        <div className="absolute -top-px left-8 right-8 h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#F0DECE] to-transparent" />

        <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white p-7 shadow-[0_40px_100px_rgba(71,35,5,0.22)]">
          {/* Subtle background pattern */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-[0.04]" style={{ background: `radial-gradient(circle, ${toneStyles.accent}, transparent)` }} />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full opacity-[0.03]" style={{ background: `radial-gradient(circle, ${toneStyles.accent}, transparent)` }} />

          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F2EC] text-[#A07149] transition-all hover:bg-[#EEDFD3] hover:text-[#7A5332] active:scale-95 disabled:opacity-50"
          >
            <HiMiniXMark className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className="relative mx-auto mb-5 mt-2 flex items-center justify-center">
            {/* Glow behind icon */}
            <div className={`absolute h-20 w-20 rounded-full blur-xl ${toneStyles.iconGlow}`} />
            <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ring-2 ring-offset-2 ring-offset-white ${toneStyles.iconWrap}`}>
              {tone === "warning" ? (
                <HiMiniExclamationTriangle className="h-8 w-8" />
              ) : (
                <HiMiniTrash className="h-7 w-7" />
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-center text-[22px] font-black tracking-tight text-[#341B08]">{title}</h3>

          {/* Decorative divider */}
          <div className="mx-auto mt-3 flex items-center gap-2 px-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#F0DECE] to-transparent" />
            <div className="h-1 w-1 rounded-full bg-[#E8D5C2]" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#F0DECE] to-transparent" />
          </div>

          {/* Message */}
          <p className="mt-4 text-center text-sm leading-6 text-[#8D6B4D]">{message}</p>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="group flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[#EDE0D4] bg-white py-3 text-sm font-semibold text-[#8B6237] shadow-sm transition-all hover:border-[#E0CCBC] hover:bg-[#FFF9F3] hover:text-[#6F4A24] active:scale-[0.98] disabled:opacity-50"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">
                <HiMiniXMark className="h-4 w-4" />
              </span>
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`group flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 ${toneStyles.confirmButton}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className={`h-4 w-4 animate-spin rounded-full border-2 ${toneStyles.confirmLoader}`} />
                  {loadingLabel ?? `${confirmLabel}...`}
                </span>
              ) : (
                <>
                  {tone === "warning" ? (
                    <HiMiniExclamationTriangle className="h-4 w-4" />
                  ) : (
                    <HiMiniTrash className="h-4 w-4" />
                  )}
                  {confirmLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
