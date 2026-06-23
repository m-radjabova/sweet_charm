import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import cakeIcon from "../../../assets/cake_icon.png";
import cakeIconTwo from "../../../assets/cake_icon2.png";
import rabbitIcon from "../../../assets/rabbit_icons.png";
import bearIcon from "../../../assets/bear_iocns.png";
import strawberryIcon from "../../../assets/strawberry_icons.png";
import { getGalleryImages } from "../../../api/galleryImages";
import type { GalleryImage } from "../../../types/types";

const imagePlacements = [
  "col-span-12 row-span-2 min-[1100px]:col-span-5 min-[1100px]:row-span-2",
  "col-span-12 row-span-1 min-[1100px]:col-span-4 min-[1100px]:col-start-6 min-[1100px]:row-span-1",
  "col-span-12 row-span-1 min-[1100px]:col-span-3 min-[1100px]:col-start-10 min-[1100px]:row-span-1",
  "col-span-12 row-span-1 min-[1100px]:col-span-4 min-[1100px]:col-start-6 min-[1100px]:row-start-2",
  "col-span-12 row-span-1 min-[1100px]:col-span-3 min-[1100px]:col-start-10 min-[1100px]:row-start-2",
  "col-span-12 row-span-1 min-[1100px]:col-span-7 min-[1100px]:col-start-1 min-[1100px]:row-start-3",
  "col-span-12 row-span-1 min-[1100px]:col-span-5 min-[1100px]:col-start-8 min-[1100px]:row-start-3",
] as const;

function GalleryCard({
  image,
  className,
  index,
}: {
  image: GalleryImage;
  className: string;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      className={`${className} group relative overflow-hidden rounded-[28px] bg-[#F8EFD9] shadow-lg shadow-[#E8D5B0]/30 transition-all duration-700 hover:shadow-2xl hover:shadow-[#D4B896]/40`}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={image.image_url}
        alt={image.title ?? "SweetCharm gallery"}
        className="h-full w-full object-cover transition-all duration-[800ms] ease-out group-hover:scale-110 group-hover:rotate-[2deg]"
        loading="lazy"
      />

      {/* Gradient overlay on hover */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-[#68400A]/70 via-[#68400A]/20 to-transparent transition-opacity duration-500 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Title on hover */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 right-0 p-5 transition-all duration-500 ${
          isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {image.title && (
          <h3 className="text-[18px] font-semibold text-white drop-shadow-lg">
            {image.title}
          </h3>
        )}
      </div>

      {/* Corner decoration */}
      <div className="pointer-events-none absolute right-3 top-3 opacity-0 transition-all duration-500 group-hover:opacity-100">
        <span className="text-[20px] text-white/80">✦</span>
      </div>
    </article>
  );
}

function GallerySkeleton({ className, index }: { className: string; index: number }) {
  return (
    <div
      className={`${className} animate-pulse rounded-[28px] bg-gradient-to-br from-[#F6E7C4] to-[#EDD9A8] shadow-inner`}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both, pulse 2s infinite`,
      }}
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-10 w-10 rounded-full bg-[#E8D0A0]/50" />
      </div>
    </div>
  );
}

function SweetMomentsSection() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["gallery-images"],
    queryFn: () => getGalleryImages(7),
  });

  return (
    <section className="relative overflow-hidden bg-[#FEF7E7] px-4 pb-20 pt-16 sm:px-8 lg:px-12 lg:pb-28 lg:pt-20">
      {/* Subtle background decorations */}
      <div className="pointer-events-none absolute -left-20 top-20 h-[300px] w-[300px] rounded-full bg-[#F4E2B6]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-[400px] w-[400px] rounded-full bg-[#E8D5B0]/20 blur-3xl" />

      <div className="relative mx-auto max-w-[1680px]">
        {/* Section header */}
        <div className="text-center">
          
          <div className="inline-flex items-center gap-4 text-[#68400A] sm:gap-6">
            <span className="text-[28px] opacity-40 sm:text-[34px]">✦</span>
            <h2
              className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] leading-[0.95] tracking-[0] text-[#68400A]"
              style={{ fontSize: "clamp(4rem, 7vw, 6.8rem)" }}
            >
              Sweet Moments
            </h2>
            <span className="text-[28px] opacity-40 sm:text-[34px]">✦</span>
          </div>
          <p className="mx-auto mt-4 max-w-[500px] text-[16px] leading-relaxed text-[#8F6A2F]/70 sm:text-[17px]">
            Every dessert tells a story, every moment becomes a memory worth cherishing
          </p>
        </div>

        {/* Decorative divider */}
        <div className="mx-auto mt-8 flex w-fit items-center gap-3">
          <span className="block h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4B896]" />
          <span className="block h-[1.5px] w-8 bg-[#D4B896]" />
          <span className="inline-block h-2 w-2 rotate-45 border border-[#D4B896]" />
          <span className="block h-[1.5px] w-8 bg-[#D4B896]" />
          <span className="block h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4B896]" />
        </div>

        {/* Gallery grid */}
        <div className="relative mt-14">
          <div className="grid auto-rows-[240px] grid-cols-12 gap-5 min-[1100px]:auto-rows-[260px]">
            {isLoading
              ? imagePlacements.map((placement, index) => (
                  <GallerySkeleton key={index} className={placement} index={index} />
                ))
              : data
                  .slice(0, 7)
                  .map((image, index) => (
                    <GalleryCard
                      key={image.id}
                      image={image}
                      className={imagePlacements[index]}
                      index={index}
                    />
                  ))}
          </div>

          {/* Empty / Error state */}
          {!isLoading && (isError || data.length === 0) ? (
            <div className="mx-auto mt-10 max-w-[500px] rounded-[24px] border border-[#F4E2B6] bg-white/80 px-8 py-10 text-center backdrop-blur-sm">
              <span className="text-[40px]">📸</span>
              <p className="mt-4 text-[17px] font-medium text-[#8F6A2F]">
                Gallery images coming soon
              </p>
              <p className="mt-2 text-[14px] text-[#B09466]">
                We're preparing something sweet for you!
              </p>
            </div>
          ) : null}

          {/* Floating decorative icons */}
          {!isLoading && data.length >= 5 ? (
            <>
              <img
                src={cakeIconTwo}
                alt=""
                className="pointer-events-none absolute left-[33%] top-[29%] hidden w-[110px] -translate-x-1/2 -translate-y-1/2 animate-float-slow object-contain opacity-60 min-[1100px]:block"
              />
              <img
                src={cakeIcon}
                alt=""
                className="pointer-events-none absolute left-[72%] top-[29%] hidden w-[120px] -translate-x-1/2 -translate-y-1/2 animate-float-slow object-contain opacity-60 min-[1100px]:block"
                style={{ animationDelay: "1.5s" }}
              />
              <img
                src={rabbitIcon}
                alt=""
                className="pointer-events-none absolute left-[57%] top-[76%] hidden w-[130px] -translate-x-1/2 -translate-y-1/2 animate-float-slow object-contain opacity-60 min-[1100px]:block"
                style={{ animationDelay: "0.8s" }}
              />
              <img
                src={bearIcon}
                alt=""
                className="pointer-events-none absolute left-[15%] top-[60%] hidden w-[95px] -translate-x-1/2 -translate-y-1/2 animate-float-slow object-contain opacity-40 min-[1100px]:block"
                style={{ animationDelay: "2.2s" }}
              />
              <img
                src={strawberryIcon}
                alt=""
                className="pointer-events-none absolute left-[85%] top-[50%] hidden w-[80px] -translate-x-1/2 -translate-y-1/2 animate-float-slow object-contain opacity-40 min-[1100px]:block"
                style={{ animationDelay: "1.2s" }}
              />
            </>
          ) : null}
        </div>
      </div>

      {/* Keyframes for animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float-slow {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-12px);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default SweetMomentsSection;
