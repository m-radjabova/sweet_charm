import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { HiMiniSparkles } from "react-icons/hi2";
import { PiBowlFood, PiCake, PiCoffee, PiCookie } from "react-icons/pi";
import cakeDecoratingVideo from "../../../assets/videos/Cake_Decorating.mp4";
import latteArtVideo from "../../../assets/videos/Latte_Art.mp4";
import freshBakeryVideo from "../../../assets/videos/Fresh_Bakery.mp4";
import cakeServingVideo from "../../../assets/videos/Cake_Serving.mp4";
import RevealMedia from "./RevealMedia";

const storyVideos = [
  {
    id: "cake-decorating",
    title: "Cake Decorating",
    description: "Watch as our pastry chefs transform simple ingredients into edible works of art, layer by delicate layer.",
    duration: "0:12",
    video: cakeDecoratingVideo,
    Icon: PiCake,
    tag: "Signature",
    tagColor: "bg-[#F7C4D3]/30 text-[#B8627A]",
  },
  {
    id: "coffee-crafting",
    title: "Coffee Crafting",
    description: "The art of coffee meets precision and passion — from bean to cup, every step tells a story.",
    duration: "0:10",
    video: latteArtVideo,
    Icon: PiCoffee,
    tag: "Barista",
    tagColor: "bg-[#F3D8BF]/30 text-[#A8774D]",
  },
  {
    id: "fresh-oven",
    title: "Fresh From The Oven",
    description: "The aroma of freshly baked goods fills our kitchen each dawn — warmth you can taste in every bite.",
    duration: "0:11",
    video: freshBakeryVideo,
    Icon: PiCookie,
    tag: "Fresh",
    tagColor: "bg-[#F0D2BE]/30 text-[#A87A5A]",
  },
  {
    id: "serving-happiness",
    title: "Serving Happiness",
    description: "The best part of our day is seeing the joy on your face with every sweet surprise unwrapped.",
    duration: "0:09",
    video: cakeServingVideo,
    Icon: PiBowlFood,
    tag: "Joy",
    tagColor: "bg-[#F4D7CF]/30 text-[#A87265]",
  },
] as const;

function OrnamentalDivider({ color = "#D39AA3" }: { color?: string }) {
  return (
    <svg className="mx-auto h-6 w-32" viewBox="0 0 120 24" fill="none">
      <path d="M0 12 L30 12" stroke={color} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="40" cy="12" r="2" fill={color} fillOpacity="0.5" />
      <path d="M44 8 L60 12 L44 16" stroke={color} strokeOpacity="0.3" strokeWidth="1.2" fill="none" />
      <circle cx="66" cy="12" r="3" fill={color} fillOpacity="0.6" />
      <path d="M76 8 L60 12 L76 16" stroke={color} strokeOpacity="0.3" strokeWidth="1.2" fill="none" />
      <circle cx="80" cy="12" r="2" fill={color} fillOpacity="0.5" />
      <path d="M90 12 L120 12" stroke={color} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  );
}

function StoryCard({
  item,
  index,
  isReadyToLoad,
  videoRefs,
}: {
  item: (typeof storyVideos)[number];
  index: number;
  isReadyToLoad: boolean;
  videoRefs: MutableRefObject<(HTMLVideoElement | null)[]>;
}) {
  const Icon = item.Icon;
  const step = `${index + 1}`.padStart(2, "0");

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/85 bg-[#F8E7DD] shadow-[0_18px_44px_rgba(126,77,34,0.08)] transition-transform duration-300 hover:-translate-y-1 sm:rounded-[32px] lg:rounded-[34px]">
      <div className="relative aspect-[1.2/1] overflow-hidden sm:aspect-[16/9]">
        <RevealMedia className="h-full w-full" delayMs={index * 110}>
          {isReadyToLoad ? (
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
            >
              <source src={item.video} type="video/mp4" />
            </video>
          ) : (
            <div className="h-full w-full animate-pulse bg-[linear-gradient(120deg,#F8E7DD,#FFF4EC,#F8E7DD)] bg-[length:200%_100%]" />
          )}
        </RevealMedia>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(65,38,16,0.12)_0%,rgba(65,38,16,0.14)_36%,rgba(36,18,8,0.55)_100%)]" />

        <div className={`absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/18 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] shadow-[0_12px_24px_rgba(0,0,0,0.14)] backdrop-blur-md sm:left-5 sm:top-5 ${item.tagColor}`}>
          <Icon className="h-3.5 w-3.5" />
          {item.tag}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6 lg:p-7">
          <div className="max-w-[78%]">
            <div className="flex items-baseline gap-3">
              <span className="text-[1.85rem] font-black leading-none text-[#FF8FA8] drop-shadow-[0_2px_8px_rgba(0,0,0,0.18)] sm:text-[2rem]">
                {step}
              </span>
              <h3 className="font-['Trebuchet_MS','Avenir_Next',sans-serif] text-[1.5rem] font-semibold leading-tight text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.28)] sm:text-[1.8rem]">
                {item.title}
              </h3>
            </div>
            <p className="mt-2 text-[0.98rem] leading-7 text-white/92 drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)] sm:text-[1.05rem]">
              {item.description}
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-20 rounded-full border border-white/25 bg-black/28 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-white backdrop-blur-md sm:bottom-5 sm:right-5">
          {item.duration}
        </div>
      </div>
    </div>
  );
}

export default function CraftedWithLoveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isReadyToLoad, setIsReadyToLoad] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setIsReadyToLoad(true);
        }
      },
      { threshold: 0.1, rootMargin: "100px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean);
    if (videos.length === 0) return;

    if (!isVisible) {
      videos.forEach((video) => video?.pause());
      return;
    }

    videos.forEach((video) => {
      if (!video) return;
      video.muted = true;
      void video.play().catch(() => undefined);
    });
  }, [isVisible, isReadyToLoad]);

  const cards = useMemo(() => storyVideos, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,rgba(255,245,240,0.98),rgba(255,255,255,1)_40%,rgba(255,240,235,0.97)_100%)] px-4 py-16 sm:px-6 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,200,215,0.18),transparent_70%)] blur-3xl" />
        <div className="absolute -left-24 top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,214,194,0.16),transparent_70%)] blur-3xl" />
        <div className="absolute -right-24 top-48 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(255,222,205,0.16),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1320px]">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#F7C4D3]/25 bg-white/80 px-5 py-2 shadow-[0_8px_24px_rgba(211,154,163,0.12)] backdrop-blur-sm">
            <HiMiniSparkles className="h-4 w-4 text-[#D39AA3]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#D39AA3]">
              Our Story In Every Moment
            </span>
            <HiMiniSparkles className="h-4 w-4 text-[#D39AA3]" />
          </div>

          <h2
            className="font-['Milkshake','Cooper_Black','Comic_Sans_MS',cursive] text-[clamp(3.2rem,8vw,5.5rem)] leading-[0.92]"
            style={{
              background: "linear-gradient(145deg, #3D1F0A 0%, #6B3E1A 35%, #9C5A2E 65%, #4D2710 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 2px 12px rgba(77,39,16,0.10))",
            }}
          >
            Crafted With Love
          </h2>

          <OrnamentalDivider color="#D39AA3" />

          <p className="mx-auto mt-6 max-w-2xl text-balance text-[17px] leading-8 text-[#7D5B45] sm:text-[20px] sm:leading-9">
            From our kitchen to your heart. Watch how every sweet treat is made with care, premium
            ingredients, and warm little details.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:gap-7 lg:mt-18 lg:grid-cols-2 lg:gap-8">
          {cards.map((item, index) => (
            <StoryCard
              key={item.id}
              item={item}
              index={index}
              isReadyToLoad={isReadyToLoad}
              videoRefs={videoRefs}
            />
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 lg:mt-20">
          <OrnamentalDivider color="#D39AA3" />
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#D39AA3]/60">
            Every detail tells a story
          </p>
        </div>
      </div>
    </section>
  );
}
