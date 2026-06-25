import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type ErrorAction = {
  label: string;
  to?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

type ErrorPageShellProps = {
  code: string;
  title: string;
  description: string;
  detail: string;
  footerNote: string;
  imageSrc: string;
  imageAlt: string;
  accent: "pink" | "rose" | "peach";
  actions: ErrorAction[];
  eyebrow?: string;
  badge?: string;
  ornament?: ReactNode;
};

const accentStyles = {
  pink: {
    code: "from-[#FF8FA8] via-[#F86B87] to-[#FDB4C4]",
    button: "from-[#FF8BA6] to-[#F56D92]",
    glow: "rgba(248,107,135,0.20)",
    panel: "rgba(255,240,244,0.86)",
    light: "#FFF0F4",
    medium: "#FDDCE6",
    star: "#FFB0C3",
    heart: "#F7B0C0",
  },
  rose: {
    code: "from-[#FF9EBC] via-[#F78AA8] to-[#FFD0DB]",
    button: "from-[#FF95B1] to-[#F3799D]",
    glow: "rgba(247,121,157,0.22)",
    panel: "rgba(255,243,246,0.88)",
    light: "#FFF0F5",
    medium: "#FDD8E6",
    star: "#FFB8CC",
    heart: "#F7A0BC",
  },
  peach: {
    code: "from-[#D88C67] via-[#8A4E2B] to-[#D19A79]",
    button: "from-[#FF8BA6] to-[#F56D92]",
    glow: "rgba(138,78,43,0.16)",
    panel: "rgba(255,246,241,0.88)",
    light: "#FFF5ED",
    medium: "#FDE6D8",
    star: "#F0C4A8",
    heart: "#E8B89A",
  },
} as const;

/* ─── floating particle config ─── */
const PARTICLES = [
  { char: "✦", size: 20, delay: 0, duration: 8, x: 5, y: 8 },
  { char: "✧", size: 16, delay: 0.6, duration: 9, x: 88, y: 14 },
  { char: "♥", size: 15, delay: 1.2, duration: 7, x: 92, y: 72 },
  { char: "✦", size: 13, delay: 0.3, duration: 10, x: 12, y: 82 },
  { char: "✧", size: 18, delay: 1.8, duration: 8.5, x: 78, y: 88 },
  { char: "✦", size: 11, delay: 0.9, duration: 11, x: 50, y: 90 },
  { char: "♥", size: 14, delay: 2.1, duration: 7.5, x: 25, y: 20 },
  { char: "✧", size: 10, delay: 1.5, duration: 9.5, x: 70, y: 25 },
  { char: "✦", size: 22, delay: 0.1, duration: 12, x: 40, y: 6 },
  { char: "♥", size: 12, delay: 2.5, duration: 8.2, x: 60, y: 78 },
];

/* ─── decorative sparkle line ─── */
function SparkleLine({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-px w-6 rounded-full" style={{ background: color }} />
      <span className="h-1 w-1 rounded-full" style={{ background: color }} />
      <span className="h-px w-12 rounded-full" style={{ background: color }} />
      <span className="h-1 w-1 rounded-full" style={{ background: color }} />
      <span className="h-px w-6 rounded-full" style={{ background: color }} />
    </span>
  );
}

/* ─── animated floating particles ─── */
function FloatingParticles({ palette }: { palette: (typeof accentStyles)[keyof typeof accentStyles] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.size,
            color: p.char === "♥" ? palette.heart : palette.star,
            opacity: 0.55,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            filter: "blur(0.3px)",
          }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}

/* ─── action button ─── */
function ActionButton({ action }: { action: ErrorAction }) {
  const isSecondary = action.variant === "secondary";

  const classes = isSecondary
    ? [
        "relative overflow-hidden",
        "border border-[#F4C8D4]/70 bg-white/75",
        "text-[#7A5030]",
        "shadow-[0_6px_20px_rgba(149,91,28,0.06)]",
        "hover:border-[#F49AAF] hover:bg-white/92 hover:shadow-[0_10px_28px_rgba(149,91,28,0.12)]",
        "active:scale-[0.97]",
      ].join(" ")
    : [
        "relative overflow-hidden",
        "bg-gradient-to-r from-[#FF8BA6] to-[#F56D92] text-white",
        "shadow-[0_12px_28px_rgba(245,109,146,0.28)]",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(245,109,146,0.35)]",
        "active:translate-y-0 active:scale-[0.97]",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]",
        "hover:before:translate-x-full before:transition-transform before:duration-700",
      ].join(" ");

  const shared = `inline-flex h-14 min-w-[210px] items-center justify-center rounded-[20px] px-6 text-[15px] font-bold transition-all duration-300 sm:h-15 sm:min-w-[220px] sm:text-[16px] ${classes}`;

  if (action.to?.startsWith("mailto:")) {
    return (
      <a href={action.to} className={shared}>
        <span className="relative z-10">{action.label}</span>
      </a>
    );
  }

  if (action.to) {
    return (
      <Link to={action.to} className={shared}>
        <span className="relative z-10">{action.label}</span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={shared}>
      <span className="relative z-10">{action.label}</span>
    </button>
  );
}

/* ─── main component ─── */
function ErrorPageShell({
  code,
  title,
  description,
  detail,
  footerNote,
  imageSrc,
  imageAlt,
  accent,
  actions,
  eyebrow,
  badge,
  ornament,
}: ErrorPageShellProps) {
  const palette = accentStyles[accent];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#FFFDFC_0%,#FFF6F1_52%,#FDEBEF_100%)] text-[#6A3D16]">
      {/* ── glow orbs ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-6%] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(255,201,216,0.40),transparent_68%)] blur-3xl animate-pulse-slow" />
        <div className="absolute right-[-10%] top-[15%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(255,232,210,0.48),transparent_70%)] blur-3xl animate-pulse-slower" />
        <div className="absolute bottom-[-12%] left-[20%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(255,214,224,0.36),transparent_70%)] blur-3xl animate-pulse-slowest" />
        <div className="absolute left-[55%] top-[40%] h-[200px] w-[200px] rounded-full bg-[radial-gradient(circle,rgba(255,230,215,0.30),transparent_70%)] blur-3xl animate-pulse-slower" />
      </div>

      {/* ── subtle grid pattern overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #8A5A32 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        <div
          className={`relative grid w-full overflow-hidden rounded-[40px] border border-white/75 bg-white/65 shadow-[0_30px_80px_rgba(144,88,33,0.10)] backdrop-blur-xl transition-all duration-700 lg:grid-cols-[1.02fr_0.98fr] ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          {/* ── inner glass overlay ── */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.45),rgba(255,248,242,0.10))] rounded-[40px]" />

          {/* ── decorative corner accents ── */}
          <div className="pointer-events-none absolute left-0 top-0 h-20 w-20 rounded-tl-[40px] border-l-2 border-t-2 border-[#FFD8E1]/60" />
          <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-tr-[40px] border-r-2 border-t-2 border-[#FFD8E1]/60" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-20 rounded-bl-[40px] border-b-2 border-l-2 border-[#FFD8E1]/60" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-20 w-20 rounded-br-[40px] border-b-2 border-r-2 border-[#FFD8E1]/60" />

          {/* ── content side ── */}
          <div className="relative z-10 flex flex-col justify-center px-6 pb-8 pt-10 sm:px-10 lg:px-12 lg:pb-12 lg:pt-14">
            {/* eyebrow badge */}
            <div
              className={`inline-flex w-fit items-center gap-2.5 rounded-full border border-white/85 bg-white/72 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#B88054] shadow-[0_8px_24px_rgba(149,91,28,0.06)] transition-all duration-500 ${
                mounted ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
                  style={{ background: palette.medium }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: palette.star }} />
              </span>
              {eyebrow ?? "Sweet Charm"}
            </div>

            {/* code + badge */}
            <div
              className={`mt-6 flex flex-wrap items-end gap-4 transition-all duration-500 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: "0.2s" }}
            >
              <h1
                className={`bg-gradient-to-r ${palette.code} bg-clip-text font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[clamp(5.5rem,10vw,9.4rem)] leading-[0.88] text-transparent`}
                style={{
                  filter: "drop-shadow(0 6px 18px rgba(255,182,198,0.20))",
                }}
              >
                {code}
              </h1>
              {badge ? (
                <span className="mb-1 inline-flex animate-bounce-gentle items-center gap-1.5 rounded-full border border-[#FFD8E1] bg-[#FFF4F7] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#F56D92] shadow-[0_4px_12px_rgba(245,109,146,0.10)]">
                  <SparkleLine color="#F89AB1" />
                  {badge}
                  <SparkleLine color="#F89AB1" />
                </span>
              ) : null}
            </div>

            {/* title + description */}
            <div
              className={`mt-5 max-w-[520px] transition-all duration-500 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: "0.3s" }}
            >
              <h2 className="font-['Milkshake','Georgia',serif] text-[clamp(2.3rem,4.4vw,4.2rem)] leading-[1] text-[#6B3E06]">
                {title}
              </h2>
              <p className="mt-5 text-[17px] leading-8 text-[#835631] sm:text-[19px]">
                {description}
              </p>
              <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-[#A27854] sm:text-[16px]">
                {detail}
              </p>
            </div>

            {/* actions */}
            <div
              className={`mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap transition-all duration-500 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: "0.4s" }}
            >
              {actions.map((action) => (
                <ActionButton key={action.label} action={action} />
              ))}
            </div>

            {/* footer note */}
            <div
              className={`mt-8 inline-flex w-fit items-center gap-3 rounded-[24px] border border-white/85 px-5 py-4 text-sm font-medium text-[#986D49] shadow-[0_10px_26px_rgba(149,91,28,0.06)] transition-all duration-500 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{
                backgroundColor: palette.panel,
                transitionDelay: "0.5s",
              }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
                style={{ background: palette.light, color: palette.star }}
              >
                ✦
              </span>
              <span className="flex-1 leading-5">{footerNote}</span>
            </div>
          </div>

          {/* ── image side ── */}
          <div className="relative flex min-h-[420px] items-end justify-center overflow-hidden px-5 pb-6 pt-2 sm:min-h-[500px] sm:px-8 lg:min-h-full lg:px-10 lg:pb-10">
            {/* glow behind image */}
            <div
              className="absolute inset-x-[12%] bottom-7 h-20 rounded-full blur-3xl"
              style={{ backgroundColor: palette.glow }}
            />

            {/* floating particles */}
            <FloatingParticles palette={palette} />

            {/* image */}
            <div
              className={`relative z-10 flex w-full max-w-[620px] items-end justify-center transition-all duration-700 ${
                mounted
                  ? "translate-y-0 scale-100 opacity-100"
                  : "translate-y-8 scale-[0.96] opacity-0"
              }`}
              style={{ transitionDelay: "0.3s" }}
            >
              <div className="relative">
                {/* subtle decorative frame glow */}
                <div
                  className="pointer-events-none absolute -inset-6 rounded-[32px] opacity-30 blur-2xl"
                  style={{ background: `radial-gradient(ellipse at center, ${palette.star}, transparent 70%)` }}
                />
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="relative max-h-[62vh] w-full max-w-[560px] object-contain drop-shadow-[0_30px_60px_rgba(160,106,56,0.14)] transition-transform duration-500 hover:scale-[1.02] lg:max-h-[76vh]"
                />
              </div>
            </div>

            {/* extra ornament */}
            {ornament ? (
              <div className="pointer-events-none absolute inset-0">{ornament}</div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ── keyframes injection ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-12px) rotate(4deg); }
          50% { transform: translateY(-6px) rotate(-2deg); }
          75% { transform: translateY(-16px) rotate(3deg); }
        }
        .animate-float {
          animation: float var(--duration, 8s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes pulse-slowest {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.03); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 8s ease-in-out infinite;
        }
        .animate-pulse-slowest {
          animation: pulse-slowest 10s ease-in-out infinite;
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

export default ErrorPageShell;