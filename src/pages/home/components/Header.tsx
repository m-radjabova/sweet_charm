import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { HiMiniShoppingBag } from "react-icons/hi2";
import useContextPro from "../../../hooks/useContextPro";
import { useCart } from "../../../hooks/useCart";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/#about-us" },
  { label: "Menu", href: "/#menu" },
  { label: "Contacts", href: "/#contacts" },
  { label: "FAQs", href: "/#faqs" },
];

function getInitials(name?: string | null) {
  if (!name) return "SC";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getProfileRoute(role?: string | null) {
  void role;
  return "/account/profile";
}

function HeaderAvatar({
  name,
  avatar,
}: {
  name?: string | null;
  avatar?: string | null;
}) {
  return (
    <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[var(--color-surface)] text-sm font-bold text-[var(--color-brown)] shadow-[0_8px_18px_rgba(114,70,11,0.12)] ring-2 ring-white/80 transition hover:scale-105 sm:h-12 sm:w-12">
      {avatar ? (
        <img
          src={avatar}
          alt={name ?? "Profile"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </span>
  );
}

function ProfileAction({ className = "" }: { className?: string }) {
  const {
    state: { user },
  } = useContextPro();

  if (user) {
    return (
      <Link
        to={getProfileRoute(user.role)}
        className={className}
        aria-label="Open profile"
      >
        <HeaderAvatar name={user.full_name} avatar={user.avatar} />
      </Link>
    );
  }

  return (
    <Link to="/login" className={className}>
      <span style={{ color: "#fff8f1" }}>Login</span>
    </Link>
  );
}

function NavLink({
  item,
  onClick,
}: {
  item: { label: string; href: string };
  onClick?: () => void;
}) {
  const location = useLocation();
  const isHashLink = item.href.includes("#");
  const isActive =
    location.pathname === item.href ||
    (item.href.startsWith("/#") && location.hash === item.href.substring(1)) ||
    (item.href === "/" && location.pathname === "/" && !location.hash);

  const baseClassName = `relative inline-flex h-[46px] min-w-[100px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-5 text-[16px] font-semibold transition-all duration-200 max-[900px]:h-11 max-[900px]:min-w-[90px] max-[900px]:px-4 max-[900px]:text-[15px] max-[640px]:h-10 max-[640px]:min-w-[80px] max-[640px]:px-3 max-[640px]:text-[14px] ${
    isActive
      ? "bg-[var(--color-primary)] shadow-[0_8px_20px_rgba(248,107,135,0.25)] hover:bg-[var(--color-primary-strong)] hover:shadow-[0_12px_26px_rgba(248,107,135,0.32)]"
      : "bg-[var(--color-surface-strong)] text-[var(--color-brown)] shadow-[0_8px_20px_var(--shadow-brown)] hover:-translate-y-[1px] hover:bg-[var(--color-surface)] hover:shadow-[0_12px_26px_rgba(151,91,28,0.12)]"
  }`;

  const content = (
    <>
      <span style={isActive ? { color: "#fff8f1" } : undefined}>
        {item.label}
      </span>
      {isActive && (
        <span className="absolute -right-1 -top-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary-soft)] opacity-75"></span>
          <span className="relative  inline-flex h-3 w-3 rounded-full bg-[var(--color-primary)]"></span>
        </span>
      )}
    </>
  );

  if (isHashLink) {
    return (
      <a href={item.href} onClick={onClick} className={baseClassName}
        style={isActive ? { color: "#fff8f1" } : undefined}>
        {content}
      </a>
    );
  }

  return (
    <Link to={item.href} onClick={onClick} className={baseClassName}
      style={isActive ? { color: "#fff8f1" } : undefined}>
      {content}
    </Link>
  );
}

function CartAction({ mobile = false }: { mobile?: boolean }) {
  const { itemCount } = useCart();

  return (
    <Link
      to="/cart"
      aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
      className={`relative inline-flex items-center justify-center rounded-full border border-white/75 bg-white/88 text-[#71460B] shadow-[0_8px_18px_rgba(114,70,11,0.10)] transition hover:-translate-y-0.5 hover:border-[#F7A7BB] hover:text-[#F25D88] ${
        mobile ? "h-12 min-w-[160px] gap-3 px-6 text-base font-semibold" : "h-12 w-12"
      }`}
    >
      <HiMiniShoppingBag className="h-5 w-5" />
      {mobile ? <span>Cart</span> : null}
      {itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-[22px] items-center justify-center rounded-full bg-[#F25D88] px-1.5 py-1 text-[11px] font-bold leading-none text-white shadow-[0_8px_18px_rgba(242,93,136,0.28)]">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </Link>
  );
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const loginClassName =
    "inline-flex h-[46px] min-w-[90px] items-center justify-center rounded-full bg-[#F86B87] px-5 text-[16px] font-semibold text-[#68400A] shadow-[0_8px_20px_rgba(248,107,135,0.18)] transition duration-200 hover:-translate-y-[1px] hover:bg-[#FA94A9] hover:shadow-[0_12px_26px_rgba(248,107,135,0.26)] sm:h-[48px] sm:min-w-[98px] sm:px-6 sm:text-[17px]";

  return (
    <>
      <header
        className={`fixed left-1/2 top-4 z-50 -translate-x-1/2 transition-all duration-300 ${
          scrolled
            ? "top-3 rounded-2xl bg-[var(--color-header-bg)]/85 shadow-[0_8px_32px_rgba(112,68,7,0.10)] backdrop-blur-lg"
            : "top-4"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-4 px-4 py-2 sm:px-6 sm:py-3">
          {/* Desktop navigation */}
          <nav className="hidden items-center gap-2 sm:flex">
            {navItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>

          {/* Desktop profile */}
          <div className="hidden items-center gap-3 sm:flex">
            <CartAction />
            <ProfileAction className={loginClassName} />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-strong)] shadow-[0_6px_16px_var(--shadow-brown)] transition hover:bg-[var(--color-surface)] sm:hidden"
            aria-label="Open menu"
          >
            <svg
              width="22"
              height="18"
              viewBox="0 0 22 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="0" width="22" height="2.5" rx="1.25" fill="#71460B" />
              <rect
                y="7.75"
                width="22"
                height="2.5"
                rx="1.25"
                fill="#71460B"
              />
              <rect
                y="15.5"
                width="22"
                height="2.5"
                rx="1.25"
                fill="#71460B"
              />
            </svg>
          </button>

          {/* Mobile profile outside nav */}
          <div className="flex items-center gap-2 sm:hidden">
            <CartAction />
            <ProfileAction className={loginClassName} />
          </div>
        </div>

        {/* Decorative sparkles */}
        <div className="pointer-events-none absolute -left-2 -top-2 text-[18px] text-[var(--color-primary-soft)] opacity-60 sm:-left-3 sm:-top-3 sm:text-[22px]">
          ✦
        </div>
        <div className="pointer-events-none absolute -right-1 bottom-0 text-[14px] text-[var(--color-text-primary)] opacity-50 sm:text-[16px]">
          ♥
        </div>
      </header>

      {/* Mobile fullscreen menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu panel */}
          <div className="absolute bottom-0 left-0 right-0 animate-slide-up rounded-t-3xl bg-[var(--color-header-bg)] px-6 pb-10 pt-8 shadow-[0_-8px_40px_rgba(112,68,7,0.15)]">
            {/* Handle bar */}
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-[var(--color-border-soft)]" />

            <nav className="flex flex-col items-center gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  item={item}
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
            </nav>

            <div className="mt-6 flex justify-center">
              <CartAction mobile />
            </div>

            <div className="mt-4 flex justify-center">
              <ProfileAction
                className={
                  loginClassName +
                  " min-w-[160px] rounded-2xl px-8 py-3 text-lg"
                }
              />
            </div>

            {/* Decorative dots */}
            <div className="mt-6 flex justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary-soft)] opacity-50" />
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] opacity-40" />
              <span className="h-2 w-2 rounded-full bg-[var(--color-primary-soft)] opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-20 sm:h-22" />
    </>
  );
}

export default Header;
