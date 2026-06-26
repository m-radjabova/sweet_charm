import { AiFillFacebook, AiFillInstagram, AiOutlineWhatsApp } from "react-icons/ai";
import heroCatCenter from "../../../assets/hero_cat_center.png";
import heroBackground from "../../../assets/hero_background.png";

const navItems = ["Home", "About us", "Menu", "Contacts", "FAQs"];

function Footer() {
  return (
    <footer
      className="relative overflow-hidden bg-[#FFF9ED] bg-cover bg-center bg-no-repeat px-4 pb-14 pt-12 sm:px-8 lg:px-12 lg:pb-18 lg:pt-16"
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      {/* Decorative top glow */}
      <div className="absolute left-1/2 top-0 h-[4px] w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#F98BAA]/30 to-transparent blur-sm" />

      {/* Background decorative text */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
        <div className="mt-8 select-none text-center font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[clamp(4.5rem,14vw,11rem)] leading-none text-[#F98BAA]/10 sm:mt-10">
          Get In Touch
        </div>
      </div>

      <div className="relative mx-auto max-w-[1200px]">
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Cat + Logo */}
          <div className="relative mb-7 mt-6 sm:mb-8 sm:mt-10">
            {/* Glow effect behind cat */}
            <div className="absolute inset-x-[10%] top-[10%] -z-10 h-[65%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95),rgba(255,215,175,0.3)_65%,transparent_100%)] blur-2xl" />
            <img
            loading="lazy"
              src={heroCatCenter}
              alt="SweetCharm mascot"
              className="w-[min(72vw,440px)] object-contain drop-shadow-[0_12px_28px_rgba(137,84,23,0.15)] transition-transform duration-300 hover:scale-[1.02] sm:w-[min(48vw,520px)]"
            />
            <span className="absolute bottom-[13%] left-1/2 -translate-x-1/2 font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[clamp(2rem,4.8vw,3.8rem)] leading-none tracking-wide text-[#6F420B] [text-shadow:0_2px_16px_rgba(255,215,175,0.3)]">
              SweetCharm
            </span>
          </div>

          {/* Decorative divider */}
          <div className="relative mb-6 h-[2px] w-[clamp(100px,25vw,220px)] overflow-hidden rounded-full bg-gradient-to-r from-transparent via-[#F98BAA]/40 to-transparent">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-[#F98BAA]/70 to-transparent" />
          </div>

          {/* Navigation */}
          <nav className="relative z-10 mt-1 flex flex-wrap items-center justify-center gap-3 px-4">
            {navItems.map((item) => (
              <a
                href={item === "Home" ? "/" : `#${item.toLowerCase().replaceAll(" ", "-")}`}
                key={item}
                className="inline-flex min-w-[90px] items-center justify-center rounded-full bg-gradient-to-b from-[#FFEDB8] to-[#FFE39A] px-5 py-2 text-[14px] font-semibold text-[#7A531E] shadow-[0_4px_14px_rgba(255,212,120,0.28)] transition-all duration-250 hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(255,212,120,0.40)] sm:text-[15px]"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Decorative divider */}
          <div className="relative mb-6 mt-8 h-[2px] w-[clamp(100px,25vw,220px)] overflow-hidden rounded-full bg-gradient-to-r from-transparent via-[#F98BAA]/40 to-transparent">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-[#F98BAA]/70 to-transparent" />
          </div>

          {/* Contact Info */}
          <div className="relative z-10 mt-1 max-w-[440px] space-y-5 rounded-2xl bg-white/30 px-8 py-6 shadow-[0_4px_30px_rgba(249,139,170,0.06)] backdrop-blur-md sm:px-10 sm:py-7">
            <div className="space-y-1 text-[clamp(1rem,1.8vw,1.15rem)] leading-[1.4] text-[#7A531E]">
              <p className="mb-2 font-semibold tracking-wide text-[#6F420B]">📍 Visit Us</p>
              <p>456 Sugar Lane, Amsterdam,</p>
              <p>1012 AB, Netherlands</p>
            </div>

            <div className="space-y-2 text-[clamp(0.95rem,1.6vw,1.05rem)] text-[#7A531E]">
              <p className="mb-2 font-semibold tracking-wide text-[#6F420B]">📞 Contact</p>
              <p>
                <a href="tel:+31612345678" className="transition duration-200 hover:text-[#F56D92] hover:underline">
                  +31 6 12345678
                </a>
              </p>
              <p>
                <a href="mailto:hello@sweetcharm.com" className="transition duration-200 hover:text-[#F56D92] hover:underline">
                  hello@sweetcharm.com
                </a>
              </p>
            </div>
          </div>

          {/* Social Icons */}
          <div className="relative z-10 mt-9 flex justify-center gap-5">
            <div className="absolute inset-0 -top-3 -z-10 rounded-full bg-[radial-gradient(circle,rgba(249,139,170,0.1),transparent_70%)] blur-xl" />
            <a
              href="#"
              aria-label="Instagram"
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F98BAA] to-[#F56D92] text-white shadow-[0_8px_22px_rgba(249,139,170,0.30)] transition-all duration-250 hover:-translate-y-[4px] hover:shadow-[0_14px_32px_rgba(249,139,170,0.40)]"
            >
              <AiFillInstagram className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F98BAA] to-[#F56D92] text-white shadow-[0_8px_22px_rgba(249,139,170,0.30)] transition-all duration-250 hover:-translate-y-[4px] hover:shadow-[0_14px_32px_rgba(249,139,170,0.40)]"
            >
              <AiFillFacebook className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </a>
            <a
              href="#"
              aria-label="WhatsApp"
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#F98BAA] to-[#F56D92] text-white shadow-[0_8px_22px_rgba(249,139,170,0.30)] transition-all duration-250 hover:-translate-y-[4px] hover:shadow-[0_14px_32px_rgba(249,139,170,0.40)]"
            >
              <AiOutlineWhatsApp className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </a>
          </div>

          {/* Divider before copyright */}
          <div className="relative mb-6 mt-11 h-[1px] w-full max-w-[450px] bg-gradient-to-r from-transparent via-[#96704B]/20 to-transparent" />

          {/* Copyright */}
          <p className="relative z-10 px-4 text-center text-[14px] font-medium tracking-wide text-[#96704B] sm:text-[15px]">
            © {new Date().getFullYear()} SweetCharm. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;