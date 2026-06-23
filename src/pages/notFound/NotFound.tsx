// import Header from "../home/components/Header";
// import Footer from "../home/components/Footer";

function NotFound() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-hero-bg)] text-[var(--color-text-primary)]">
      {/* <div className="relative z-30 bg-[var(--color-header-bg)] bg-cover bg-center px-4 py-3 sm:px-8 sm:py-4">
        <Header />
      </div> */}

      <section className="relative flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-6 py-24 text-center">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,155,192,0.12)_0%,transparent_65%)]" />

        <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
          {/* 404 illustration - cupcake with sad face */}
          <div className="relative mb-8">
            {/* Shadow under cupcake */}
            <div className="absolute -bottom-2 left-1/2 h-6 w-48 -translate-x-1/2 rounded-full bg-[var(--color-text-primary)]/10 blur-xl" />

            <svg
              width="200"
              height="220"
              viewBox="0 0 200 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_16px_32px_rgba(151,91,28,0.15)]"
            >
              {/* Cupcake wrapper (base) */}
              <path
                d="M40 130 C40 130 32 162 36 172 C40 180 66 185 100 185 C134 185 160 180 164 172 C168 162 160 130 160 130 Z"
                fill="#f75d86"
              />

              {/* Wrapper lines */}
              <path d="M50 138 L53 168" stroke="#d94874" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M73 133 L74 176" stroke="#d94874" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M100 130 L100 183" stroke="#d94874" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M127 133 L126 176" stroke="#d94874" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M150 138 L147 168" stroke="#d94874" strokeWidth="2.5" strokeLinecap="round" />

              {/* Frosting/cream top */}
              <path
                d="M24 130 C24 100 36 80 50 68 C54 63 58 60 64 60 C68 60 72 62 76 65 C80 60 86 56 94 56 C102 56 108 60 112 65 C118 60 124 56 132 58 C140 60 148 66 158 84 C168 104 174 120 176 130 C176 134 174 137 170 137 L28 137 C24 137 22 134 24 130 Z"
                fill="#ffd9b3"
              />

              {/* Frosting swirl */}
              <path
                d="M52 105 C54 88 64 78 76 74 C80 72 86 72 90 74 C94 70 100 66 106 68 C112 66 118 70 122 74 C128 72 134 74 138 80 C146 92 150 104 148 116 C146 121 140 124 133 122 C128 120 124 116 120 114 C116 112 110 112 106 114 C102 112 96 110 92 112 C86 110 80 112 76 116 C70 120 62 124 56 122 C50 120 48 113 52 105 Z"
                fill="#f75d86"
              />

              {/* Sad eyes */}
              <ellipse cx="78" cy="88" rx="5" ry="6" fill="#704407" />
              <ellipse cx="122" cy="88" rx="5" ry="6" fill="#704407" />
              {/* Eye highlights */}
              <circle cx="79" cy="86" r="1.8" fill="white" />
              <circle cx="123" cy="86" r="1.8" fill="white" />

              {/* Sad mouth */}
              <path
                d="M88 104 C92 96 108 96 112 104"
                stroke="#704407"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* Tear drop */}
              <path
                d="M66 82 C66 78 68 72 68 72 C68 72 70 78 70 82 C70 84 68 86 66 84 Z"
                fill="#87CEEB"
                opacity="0.7"
              >
                <animate
                  attributeName="opacity"
                  values="0.7;0.3;0.7"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
              <path
                d="M134 86 C134 82 136 76 136 76 C136 76 138 82 138 86 C138 88 136 90 134 88 Z"
                fill="#87CEEB"
                opacity="0.7"
              >
                <animate
                  attributeName="opacity"
                  values="0.3;0.7;0.3"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Blush */}
              <ellipse cx="68" cy="98" rx="7" ry="3.5" fill="#ff9bc0" opacity="0.5" />
              <ellipse cx="132" cy="98" rx="7" ry="3.5" fill="#ff9bc0" opacity="0.5" />

              {/* Decorative dots */}
              <circle cx="100" cy="54" r="12" fill="#f3507d" />
              <ellipse cx="100" cy="50" rx="5" ry="3" fill="rgba(255,255,255,0.3)" />
              <path
                d="M100 42 C100 34 106 26 114 22"
                stroke="#8b6130"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M110 24 C116 20 122 22 120 28 C118 32 112 32 110 28 Z"
                fill="#7cb342"
              />
            </svg>
          </div>

          {/* 404 text */}
          <h1
            className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[7rem] leading-none tracking-wide text-[#68400A] sm:text-[9rem] lg:text-[11rem]"
          >
            404
          </h1>

          {/* Decorative line */}
          <div className="mt-2 flex items-center gap-3">
            <span className="block h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[#FF9BC0] to-transparent sm:w-24" />
            <span className="text-[20px] text-[#FF9BC0]">✦</span>
            <span className="block h-[2px] w-16 rounded-full bg-gradient-to-r from-transparent via-[#FF9BC0] to-transparent sm:w-24" />
          </div>

          {/* Description */}
          <p className="mt-8 max-w-[500px] text-balance text-[18px] leading-relaxed text-[var(--color-text-primary)] sm:text-[20px]">
            Oops! Looks like this page took a wrong turn
            <br className="hidden sm:block" /> and ended up in the wrong oven.
          </p>

          <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-[var(--color-text-muted)] sm:text-[16px]">
            The page you're looking for doesn't exist or was moved.
            <br className="hidden sm:block" /> Let's get you back to something sweet!
          </p>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
            <a
              href="/"
              className="group relative inline-flex h-[64px] min-w-[220px] items-center justify-center rounded-[22px] bg-gradient-to-r from-[#F75D86] to-[#F86B87] px-8 text-[17px] font-bold text-[#fff8f1] shadow-[0_12px_22px_rgba(248,107,135,0.22)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_16px_30px_rgba(248,107,135,0.28)] active:scale-[0.97] sm:h-[68px] sm:min-w-[200px] sm:text-[18px]"
            >
              <span className="relative z-10">Sweet Home</span>
              <span className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-[#F86B87] to-[#FA94A9] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </a>

            <a
              href="/desserts"
              className="group relative inline-flex h-[64px] min-w-[220px] items-center justify-center rounded-[22px] border-2 border-[#F75D86]/30 bg-[var(--color-surface-strong)] px-8 text-[17px] font-bold text-[var(--color-brown)] shadow-[0_8px_20px_var(--shadow-brown)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[#F75D86]/60 hover:bg-[var(--color-surface)] hover:shadow-[0_12px_26px_rgba(151,91,28,0.12)] active:scale-[0.97] sm:h-[68px] sm:min-w-[200px] sm:text-[18px]"
            >
              <span className="relative z-10">Our Menu</span>
            </a>
          </div>

          {/* Decorative sparkles */}
          <div className="pointer-events-none absolute -left-8 top-[10%] text-[32px] text-[var(--color-primary-soft)] opacity-40 sm:-left-12 sm:text-[40px]">
            ✦
          </div>
          <div className="pointer-events-none absolute -right-8 bottom-[20%] text-[28px] text-[var(--color-primary-soft)] opacity-30 sm:-right-12 sm:text-[36px]">
            ♥
          </div>
          <div className="pointer-events-none absolute right-[20%] top-[8%] text-[18px] text-[var(--color-text-primary)] opacity-25">
            ✧
          </div>
          <div className="pointer-events-none absolute left-[15%] bottom-[10%] text-[22px] text-white opacity-30">
            ☆
          </div>
        </div>
      </section>

      {/* <Footer /> */}
    </main>
  );
}

export default NotFound;