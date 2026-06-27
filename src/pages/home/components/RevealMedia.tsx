import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

function RevealMedia({
  children,
  className = "",
  contentClassName = "",
  delayMs = 0,
  threshold = 0.16,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  delayMs?: number;
  threshold?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  const contentStyle: CSSProperties = {
    opacity: isVisible ? 1 : 0.01,
    filter: isVisible ? "blur(0px)" : "blur(14px)",
    clipPath: isVisible ? "inset(0% 0% 0% 0% round 24px)" : "inset(0% 0% 100% 0% round 24px)",
    transform: isVisible ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 18px, 0) scale(0.985)",
    transitionProperty: "opacity, filter, clip-path, transform",
    transitionDuration: "820ms",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: `${delayMs}ms`,
    willChange: "opacity, clip-path, transform",
  };

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-white/55 via-[#FFF3E8]/30 to-transparent transition-opacity duration-500 ${isVisible ? "opacity-0" : "opacity-100"}`}
        style={{ transitionDelay: `${Math.max(0, delayMs - 40)}ms` }}
      />
      <div className={contentClassName} style={contentStyle}>
        {children}
      </div>
    </div>
  );
}

export default RevealMedia;
