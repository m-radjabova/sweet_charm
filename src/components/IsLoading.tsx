import { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web/build/player/lottie_light";
import iceCreamLoading from "./Ice cream loading.json";

function IsLoading() {
  const animationContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!animationContainerRef.current) return;

    const animation: AnimationItem = lottie.loadAnimation({
      container: animationContainerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: iceCreamLoading,
      rendererSettings: {
        progressiveLoad: true,
        preserveAspectRatio: "xMidYMid meet",
      },
    });

    return () => animation.destroy();
  }, []);

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFF7ED] px-5 text-[#6B3E06]"
      role="status"
      aria-live="polite"
      aria-label="Loading SweetCharm"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(248,107,135,0.18),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(255,190,121,0.32),transparent_30%),linear-gradient(180deg,#FFF7ED_0%,#FFFDF8_52%,#FFEFE5_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/55 blur-3xl" />

      <span className="pointer-events-none absolute left-[10%] top-[18%] animate-float text-2xl text-[#F25D88]/45 sm:text-4xl">
        ✦
      </span>
      <span className="pointer-events-none absolute right-[13%] top-[24%] animate-float-delayed text-xl text-[#D68C4A]/55 sm:text-3xl">
        ♡
      </span>
      <span className="pointer-events-none absolute bottom-[18%] left-[18%] animate-float-slow text-lg text-[#F25D88]/35 sm:text-2xl">
        ✧
      </span>

      <section className="relative flex w-full max-w-[420px] flex-col items-center text-center">
        <div className="relative flex h-[250px] w-[250px] items-center justify-center sm:h-[310px] sm:w-[310px]">
          <div className="absolute inset-6 rounded-full bg-[#F25D88]/10 blur-2xl" />
          <div className="absolute h-[78%] w-[78%] animate-spin-slow rounded-full border border-dashed border-[#F25D88]/25" />
          <div
            ref={animationContainerRef}
            className="relative z-10 h-full w-full drop-shadow-[0_24px_38px_rgba(151,91,28,0.16)]"
          />
        </div>

        <h1
          className="-mt-3 text-[3.2rem] font-bold leading-none tracking-[0] text-[#6B3E06] sm:text-[4rem]"
          style={{ fontFamily: '"Milkshake", "Cooper Black", "Comic Sans MS", cursive' }}
        >
          SweetCharm
        </h1>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.28em] text-[#B1845D] sm:text-sm">
          Preparing something sweet
        </p>

        <div className="mt-8 w-full max-w-[260px]">
          <div className="relative h-2.5 overflow-hidden rounded-full bg-[#F0D8C4] shadow-inner">
            <div className="absolute inset-y-0 left-0 animate-loading-ribbon rounded-full bg-gradient-to-r from-[#F25D88] via-[#FFB36B] to-[#F25D88]" />
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/55 to-transparent" />
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#F25D88]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#F25D88] [animation-delay:0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#F25D88] [animation-delay:0.3s]" />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(8deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes loading-ribbon {
          0% { width: 16%; transform: translateX(-20%); }
          45% { width: 62%; transform: translateX(8%); }
          75% { width: 88%; transform: translateX(15%); }
          100% { width: 100%; transform: translateX(0); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 4.8s ease-in-out infinite;
          animation-delay: .8s;
        }

        .animate-float-slow {
          animation: float 6s ease-in-out infinite;
          animation-delay: .4s;
        }

        .animate-spin-slow {
          animation: spin-slow 14s linear infinite;
        }

        .animate-loading-ribbon {
          animation: loading-ribbon 2.15s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 1.45s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-float-delayed,
          .animate-float-slow,
          .animate-spin-slow,
          .animate-loading-ribbon,
          .animate-shimmer {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}

export default IsLoading;
