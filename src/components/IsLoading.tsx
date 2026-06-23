function IsLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#fff8f1' }}>
      <div className="flex w-full max-w-sm flex-col items-center gap-10 px-6">

        {/* Cupcake SVG loader */}
        <div className="relative animate-bounce-slow">
          <svg
            width="120"
            height="120"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_12px_20px_rgba(151,91,28,0.12)]"
          >
            {/* Cupcake base (wrapper) */}
            <path
              d="M45 118 C45 118 38 150 42 158 C46 166 70 170 100 170 C130 170 154 166 158 158 C162 150 155 118 155 118 Z"
              fill="#f75d86"
              className="animate-pulse-slow"
            />

            {/* Wrapper lines */}
            <path
              d="M55 125 L58 155"
              stroke="#d94874"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M77 120 L78 162"
              stroke="#d94874"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M100 118 L100 168"
              stroke="#d94874"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M123 120 L122 162"
              stroke="#d94874"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M145 125 L142 155"
              stroke="#d94874"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Cake top (frosting/cream) */}
            <path
              d="M30 118 C30 90 42 72 55 62 C58 58 62 55 68 55 C72 55 76 57 80 60 C84 56 89 52 96 52 C103 52 108 56 112 60 C118 55 124 52 130 55 C138 58 146 64 155 80 C165 96 170 112 170 118 C170 122 168 125 165 125 L35 125 C32 125 30 122 30 118 Z"
              fill="#ffd9b3"
            />

            {/* Frosting swirl top */}
            <path
              d="M55 95 C58 80 68 70 80 66 C84 64 88 64 92 66 C96 62 102 58 108 60 C114 58 120 62 124 66 C130 64 136 66 140 72 C148 82 152 94 150 105 C148 110 142 112 135 110 C130 108 126 104 122 102 C118 100 112 100 108 102 C104 100 98 98 94 100 C88 98 82 100 78 104 C72 108 65 112 58 110 C52 108 50 102 55 95 Z"
              fill="#f75d86"
              className="animate-pulse-slow"
            />

            {/* Small decoration dots */}
            <circle cx="70" cy="90" r="4" fill="#ff9bc0" className="animate-ping-slow" />
            <circle cx="105" cy="80" r="3.5" fill="#ff9bc0" className="animate-ping-slow" style={{ animationDelay: '0.3s' }} />
            <circle cx="132" cy="92" r="3" fill="#ff9bc0" className="animate-ping-slow" style={{ animationDelay: '0.6s' }} />

            {/* Cherry on top */}
            <circle cx="100" cy="46" r="12" fill="#f3507d" className="animate-float" />
            <ellipse cx="100" cy="42" rx="5" ry="3" fill="rgba(255,255,255,0.3)" />
            {/* Cherry stem */}
            <path
              d="M100 34 C100 26 106 18 114 14"
              stroke="#8b6130"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-sway"
            />
            {/* Cherry leaf */}
            <path
              d="M110 16 C116 12 122 14 120 20 C118 24 112 24 110 20 Z"
              fill="#7cb342"
            />

            {/* Eyes on cupcake */}
            <ellipse cx="82" cy="78" rx="4" ry="5" fill="#704407" />
            <ellipse cx="118" cy="78" rx="4" ry="5" fill="#704407" />
            <circle cx="83" cy="76" r="1.5" fill="white" />
            <circle cx="119" cy="76" r="1.5" fill="white" />

            {/* Blush */}
            <ellipse cx="72" cy="86" rx="6" ry="3" fill="#ff9bc0" opacity="0.6" />
            <ellipse cx="128" cy="86" rx="6" ry="3" fill="#ff9bc0" opacity="0.6" />

            {/* Sparkles */}
            <g className="animate-sparkle" opacity="0.7">
              <path d="M38 60 L44 60 M41 57 L41 63" stroke="#f75d86" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <g className="animate-sparkle" style={{ animationDelay: '0.5s' }} opacity="0.7">
              <path d="M155 52 L161 52 M158 49 L158 55" stroke="#f75d86" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <g className="animate-sparkle" style={{ animationDelay: '1s' }} opacity="0.7">
              <path d="M170 85 L178 85 M174 81 L174 89" stroke="#f75d86" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-3">
          <h2
            className="text-3xl font-bold tracking-wide"
            style={{ color: '#704407', fontFamily: '"Milkshake", "Comic Sans MS", cursive' }}
          >
            Sweet Charm
          </h2>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 animate-bounce rounded-full"
              style={{ backgroundColor: '#f75d86', animationDelay: '0s' }}
            />
            <span
              className="inline-block h-2.5 w-2.5 animate-bounce rounded-full"
              style={{ backgroundColor: '#f75d86', animationDelay: '0.15s' }}
            />
            <span
              className="inline-block h-2.5 w-2.5 animate-bounce rounded-full"
              style={{ backgroundColor: '#f75d86', animationDelay: '0.3s' }}
            />
          </div>
          <p
            className="text-sm font-semibold tracking-[0.25em]"
            style={{ color: '#8b6130' }}
          >
            LOADING
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative w-full max-w-[220px]">
          <div
            className="relative h-2.5 overflow-hidden rounded-full shadow-inner"
            style={{ backgroundColor: '#f0dfcf' }}
          >
            <div
              className="h-full w-full origin-left animate-loading-bar rounded-full"
              style={{ backgroundColor: '#f75d86' }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }

        @keyframes ping-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes sway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes loading-bar {
          0% { transform: scaleX(0); }
          40% { transform: scaleX(0.4); }
          70% { transform: scaleX(0.85); }
          100% { transform: scaleX(1); }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 1.8s ease-in-out infinite;
        }

        .animate-float {
          animation: float 1.6s ease-in-out infinite;
        }

        .animate-sway {
          animation: sway 1.4s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 1.2s ease-in-out infinite;
        }

        .animate-loading-bar {
          animation: loading-bar 1.8s ease-in-out infinite;
          transform-origin: left;
        }
      `}</style>
    </div>
  );
}

export default IsLoading;