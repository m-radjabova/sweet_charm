function IsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex w-full max-w-md flex-col items-center gap-8 px-6">
        <div className="relative w-full">
          {/* Progress track */}
          <div className="relative h-4 overflow-hidden rounded-full bg-slate-200 shadow-inner">
            <div className="h-full origin-left animate-[fillBar_2.2s_ease-in-out_infinite] rounded-full bg-slate-950" />
          </div>

          {/* Cut marks */}
          <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 overflow-hidden">
            <div className="h-full animate-[dashMove_2.2s_linear_infinite] bg-[repeating-linear-gradient(90deg,transparent_0_10px,rgba(255,255,255,0.7)_10px_14px)]" />
          </div>

          {/* Scissors */}
          <div className="absolute -top-[54px] left-0 animate-[scissorProgress_2.2s_ease-in-out_infinite]">
            <svg
              width="86"
              height="64"
              viewBox="0 0 190 130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_8px_10px_rgba(15,23,42,0.18)]"
            >
              <defs>
                <linearGradient id="steel" x1="20" y1="10" x2="160" y2="120">
                  <stop stopColor="#f8fafc" />
                  <stop offset="0.2" stopColor="#94a3b8" />
                  <stop offset="0.45" stopColor="#e5e7eb" />
                  <stop offset="0.75" stopColor="#64748b" />
                  <stop offset="1" stopColor="#111827" />
                </linearGradient>

                <linearGradient id="darkSteel" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#475569" />
                  <stop offset="1" stopColor="#020617" />
                </linearGradient>

                <radialGradient id="screw" cx="50%" cy="45%" r="60%">
                  <stop stopColor="#f8fafc" />
                  <stop offset="0.45" stopColor="#94a3b8" />
                  <stop offset="1" stopColor="#111827" />
                </radialGradient>
              </defs>

              <ellipse
                cx="32"
                cy="34"
                rx="23"
                ry="20"
                transform="rotate(-15 32 34)"
                stroke="url(#darkSteel)"
                strokeWidth="9"
              />
              <ellipse
                cx="31"
                cy="94"
                rx="24"
                ry="21"
                transform="rotate(15 31 94)"
                stroke="url(#darkSteel)"
                strokeWidth="9"
              />

              <path
                d="M12 103 C-2 112 3 126 18 121"
                stroke="url(#darkSteel)"
                strokeWidth="7"
                strokeLinecap="round"
              />

              <path
                d="M51 42 C68 47 79 55 91 64"
                stroke="url(#darkSteel)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M51 86 C68 80 79 72 91 64"
                stroke="url(#darkSteel)"
                strokeWidth="10"
                strokeLinecap="round"
              />

              <g className="origin-[94px_64px] animate-[topCut_0.34s_ease-in-out_infinite_alternate]">
                <path
                  d="M96 59 C119 43 145 28 181 15 C156 45 128 61 97 67 Z"
                  fill="url(#steel)"
                />
                <path
                  d="M108 57 C131 45 150 34 172 24"
                  stroke="white"
                  strokeOpacity="0.75"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>

              <g className="origin-[94px_64px] animate-[bottomCut_0.34s_ease-in-out_infinite_alternate]">
                <path
                  d="M96 69 C121 82 147 96 181 115 C153 82 126 68 97 61 Z"
                  fill="url(#steel)"
                />
                <path
                  d="M108 72 C133 84 153 96 173 108"
                  stroke="white"
                  strokeOpacity="0.6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>

              <circle cx="94" cy="64" r="11" fill="url(#screw)" />
              <circle cx="94" cy="64" r="5" fill="#334155" />
              <path
                d="M88 64 H100"
                stroke="#e5e7eb"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <p className="text-sm font-black tracking-[0.38em] text-slate-950">
          LOADING
        </p>
      </div>

      <style>{`
        @keyframes fillBar {
          0% {
            transform: scaleX(0);
          }
          70% {
            transform: scaleX(1);
          }
          100% {
            transform: scaleX(1);
          }
        }

        @keyframes scissorProgress {
          0% {
            transform: translateX(0) rotate(-4deg);
          }
          70% {
            transform: translateX(calc(100vw - 120px)) rotate(2deg);
          }
          100% {
            transform: translateX(0) rotate(-4deg);
          }
        }

        @media (min-width: 640px) {
          @keyframes scissorProgress {
            0% {
              transform: translateX(0) rotate(-4deg);
            }
            70% {
              transform: translateX(360px) rotate(2deg);
            }
            100% {
              transform: translateX(0) rotate(-4deg);
            }
          }
        }

        @keyframes topCut {
          from {
            transform: rotate(-9deg);
          }
          to {
            transform: rotate(8deg);
          }
        }

        @keyframes bottomCut {
          from {
            transform: rotate(9deg);
          }
          to {
            transform: rotate(-8deg);
          }
        }

        @keyframes dashMove {
          from {
            transform: translateX(-40px);
          }
          to {
            transform: translateX(40px);
          }
        }
      `}</style>
    </div>
  );
}

export default IsLoading;