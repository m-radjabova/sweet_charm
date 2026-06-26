function IsLoading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FCF8EF] px-6">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#F75D86]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-[#FFD9B3]/55 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

      {/* Floating decorations */}
      <span className="pointer-events-none absolute left-[14%] top-[24%] animate-float text-3xl text-[#F75D86]/45">
        ♡
      </span>
      <span className="pointer-events-none absolute right-[18%] top-[28%] animate-float-delayed text-2xl text-[#F6B04B]/60">
        ✦
      </span>
      <span className="pointer-events-none absolute bottom-[22%] left-[22%] animate-float-slow text-xl text-[#F75D86]/40">
        ✧
      </span>
      <span className="pointer-events-none absolute bottom-[26%] right-[20%] animate-float-delayed text-3xl text-[#8B5B19]/30">
        ♡
      </span>

      <div className="relative flex w-full max-w-[430px] flex-col items-center">
        {/* Soft card */}
        <div className="relative w-full rounded-[2.5rem] border border-white/80 bg-white/55 px-8 py-10 text-center shadow-[0_30px_90px_rgba(112,68,7,0.12)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-3 rounded-[2rem] border border-[#F7D8C8]/70" />

          {/* Icon area */}
          <div className="relative mx-auto mb-7 flex h-44 w-44 items-center justify-center">
            <div className="absolute inset-0 animate-soft-pulse rounded-full bg-[#F75D86]/10 blur-xl" />
            <div className="absolute h-36 w-36 animate-spin-slow rounded-full border border-dashed border-[#F75D86]/35" />

            <svg
              width="145"
              height="145"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative animate-bunny-float drop-shadow-[0_18px_30px_rgba(151,91,28,0.16)]"
            >
              {/* cake shadow */}
              <ellipse cx="100" cy="172" rx="54" ry="11" fill="#E8C9B5" opacity="0.45" />

              {/* bunny ears */}
              <path
                d="M70 52C61 25 69 10 82 17C94 24 91 45 84 62"
                fill="#FFF8F1"
                stroke="#704407"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M130 52C139 25 131 10 118 17C106 24 109 45 116 62"
                fill="#FFF8F1"
                stroke="#704407"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path d="M76 26C73 36 76 46 81 54" stroke="#FFB7C8" strokeWidth="6" strokeLinecap="round" />
              <path d="M124 26C127 36 124 46 119 54" stroke="#FFB7C8" strokeWidth="6" strokeLinecap="round" />

              {/* bunny face */}
              <circle cx="100" cy="84" r="42" fill="#FFF8F1" stroke="#704407" strokeWidth="4" />
              <circle cx="84" cy="84" r="5" fill="#704407" />
              <circle cx="116" cy="84" r="5" fill="#704407" />
              <circle cx="86" cy="82" r="1.5" fill="white" />
              <circle cx="118" cy="82" r="1.5" fill="white" />
              <ellipse cx="76" cy="95" rx="8" ry="5" fill="#FFB7C8" opacity="0.7" />
              <ellipse cx="124" cy="95" rx="8" ry="5" fill="#FFB7C8" opacity="0.7" />
              <path d="M98 96C100 99 102 99 104 96" stroke="#704407" strokeWidth="3" strokeLinecap="round" />
              <path d="M100 92V96" stroke="#704407" strokeWidth="3" strokeLinecap="round" />

              {/* bow */}
              <circle cx="100" cy="44" r="5" fill="#F75D86" />
              <path d="M95 44C82 35 76 42 81 51C87 57 94 50 95 44Z" fill="#FF9FBA" stroke="#704407" strokeWidth="3" />
              <path d="M105 44C118 35 124 42 119 51C113 57 106 50 105 44Z" fill="#FF9FBA" stroke="#704407" strokeWidth="3" />

              {/* cupcake body */}
              <path
                d="M58 126C58 113 68 105 81 108C88 96 112 96 119 108C132 105 142 113 142 126C142 136 134 140 124 138H76C66 140 58 136 58 126Z"
                fill="#FFD9B3"
                stroke="#704407"
                strokeWidth="4"
              />
              <path
                d="M70 137H130L123 166C121 173 79 173 77 166L70 137Z"
                fill="#F75D86"
                stroke="#704407"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path d="M84 142L86 164" stroke="#D94874" strokeWidth="3" strokeLinecap="round" />
              <path d="M100 140V167" stroke="#D94874" strokeWidth="3" strokeLinecap="round" />
              <path d="M116 142L114 164" stroke="#D94874" strokeWidth="3" strokeLinecap="round" />

              {/* heart */}
              <path
                className="animate-heart-beat"
                d="M100 125C94 118 84 120 84 129C84 139 100 146 100 146C100 146 116 139 116 129C116 120 106 118 100 125Z"
                fill="#FF6F9D"
              />

              {/* sparkles */}
              <path className="animate-sparkle" d="M43 70L49 70M46 67L46 73" stroke="#F75D86" strokeWidth="3" strokeLinecap="round" />
              <path className="animate-sparkle-delayed" d="M153 62L161 62M157 58L157 66" stroke="#F6B04B" strokeWidth="3" strokeLinecap="round" />
              <circle className="animate-dot" cx="151" cy="105" r="3" fill="#F75D86" opacity="0.6" />
            </svg>
          </div>

          <h2
            className="text-4xl font-bold tracking-wide text-[#704407]"
            style={{ fontFamily: '"Milkshake", "Comic Sans MS", cursive' }}
          >
            SweetCharm
          </h2>

          <p className="mt-2 text-sm font-medium tracking-[0.22em] text-[#B07A4A]">
            PREPARING SOMETHING SWEET
          </p>

          {/* Progress */}
          <div className="mx-auto mt-8 w-full max-w-[260px]">
            <div className="relative h-3 overflow-hidden rounded-full bg-[#F0DFCF] shadow-inner">
              <div className="absolute inset-y-0 left-0 animate-loading-ribbon rounded-full bg-gradient-to-r from-[#F75D86] via-[#FFB067] to-[#F75D86]" />
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            </div>

            <div className="mt-4 flex justify-center gap-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#F75D86]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#F75D86] [animation-delay:0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#F75D86] [animation-delay:0.3s]" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bunny-float {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(8deg); }
        }

        @keyframes soft-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes heart-beat {
          0%, 100% { transform: scale(1); transform-origin: center; }
          50% { transform: scale(1.12); transform-origin: center; }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.25); }
        }

        @keyframes dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-5px); }
        }

        @keyframes loading-ribbon {
          0% { width: 0%; }
          45% { width: 55%; }
          75% { width: 88%; }
          100% { width: 100%; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-bunny-float {
          animation: bunny-float 2.6s ease-in-out infinite;
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

        .animate-soft-pulse {
          animation: soft-pulse 2.2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }

        .animate-heart-beat {
          animation: heart-beat 1.4s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 1.6s ease-in-out infinite;
          transform-origin: center;
        }

        .animate-sparkle-delayed {
          animation: sparkle 1.6s ease-in-out infinite;
          animation-delay: .55s;
          transform-origin: center;
        }

        .animate-dot {
          animation: dot 1.8s ease-in-out infinite;
        }

        .animate-loading-ribbon {
          animation: loading-ribbon 2s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default IsLoading;