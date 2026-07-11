import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HiMiniArrowLeft,
  HiMiniChevronLeft,
  HiMiniChevronRight,
  HiMiniHeart,
  HiMiniMinus,
  HiMiniPlus,
  HiMiniShoppingBag,
  HiMiniSparkles,
  HiMiniStar,
  HiMiniChatBubbleLeftRight,
  HiMiniCheck,
  HiMiniXMark,
} from "react-icons/hi2";
import { HiOutlineHeart } from "react-icons/hi2";
import { getFeaturedDesserts } from "../../api/desserts";
import { getErrorMessage } from "../../api/auth";
import { createDessertReview, getDessertReviews } from "../../api/reviews";
import Footer from "../home/components/Footer";
import Header from "../home/components/Header";
import { useFavorites } from "../account/hooks/useFavorites";
import { formatDate, formatMoney, getInitials } from "../account/utils";
import type { DessertReview, FeaturedDessert } from "../../types/types";
import bunnyCupcake from "../../assets/profile/profile_bunny2.png";
import useContextPro from "../../hooks/useContextPro";
import { toast } from "react-toastify";
import { useCart } from "../../hooks/useCart";
import Seo from "../../components/Seo";
import { SITE_URL } from "../../components/seoConfig";
import { getDisplayDiscountPercent, getDisplayOldPrice } from "../../utils/pricing";

// ─── Helpers ───────────────────────────────────────────
function buildDetailCopy(dessert: FeaturedDessert) {
  const category = dessert.category_name ?? "Signature dessert";
  return {
    description:
      dessert.description ||
      `${dessert.name} is one of our sweetest ${category.toLowerCase()} creations, layered with a creamy finish and a soft bakery-style texture that feels special from the first bite.`,
    highlights: [
      `${category} favorite`,
      "Freshly prepared in small batches",
      getDisplayOldPrice(dessert.price) ? "Special sweet deal today" : "Perfect for dessert lovers",
    ],
  };
}

function parseIngredients(ingredients?: string | null) {
  if (!ingredients) return [];
  return ingredients
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const animationStyles = `
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-12px) rotate(3deg); }
  66% { transform: translateY(6px) rotate(-2deg); }
}
@keyframes float-delayed {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(-4deg); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(242,93,136,0.15); }
  50% { box-shadow: 0 0 40px rgba(242,93,136,0.30); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.25); }
  30% { transform: scale(1); }
  45% { transform: scale(1.15); }
  60% { transform: scale(1); }
}
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-float-delayed { animation: float-delayed 5s ease-in-out infinite 1s; }
.animate-pulse-glow { animation: pulse-glow 2.5s ease-in-out infinite; }
.animate-fade-in-up { animation: fade-in-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
.animate-fade-in-up-fast { animation: fade-in-up 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
.animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
.animate-heart-beat { animation: heart-beat 0.6s ease-in-out; }
.scroll-reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
.scroll-reveal.revealed { opacity: 1; transform: translateY(0); }
.shimmer-bg {
  background: linear-gradient(90deg, #FAEFE3 25%, #FFF5EA 50%, #FAEFE3 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
`;

// ─── Sub-components ────────────────────────────────────

function ScrollReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}

function RelatedDessertCard({
  dessert,
  favorite,
  onToggleFavorite,
  index,
}: {
  dessert: FeaturedDessert;
  favorite: boolean;
  onToggleFavorite: (dessertId: string, dessert?: FeaturedDessert) => void;
  index: number;
}) {
  const navigate = useNavigate();
  const image = dessert.image_url || dessert.image_urls?.[0] || bunnyCupcake;
  const [imgLoaded, setImgLoaded] = useState(false);
  const oldPrice = getDisplayOldPrice(dessert.price);

  return (
    <article
      className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,247,238,0.96))] shadow-[0_10px_24px_rgba(175,117,60,0.10)] transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(175,117,60,0.16)]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-44 overflow-hidden bg-[#FFF4EA]">
        {!imgLoaded && <div className="absolute inset-0 shimmer-bg" />}
        <img
          loading="lazy"
          src={image}
          alt={dessert.name}
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-110 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#3A2410]/18 via-transparent to-transparent" />

        {/* Favorite button - pill shaped */}
        <button
          type="button"
          onClick={() => onToggleFavorite(dessert.id, dessert)}
          className={`absolute right-3 top-3 flex items-center justify-center rounded-[20px] border px-3 py-2 backdrop-blur-md transition-all duration-300 ${
            favorite
              ? "border-[#F25D88] bg-[#F25D88] text-white shadow-[0_8px_18px_rgba(242,93,136,0.30)]"
              : "border-white/70 bg-white/85 text-[#C28564] shadow-[0_6px_14px_rgba(175,117,60,0.10)] hover:bg-white hover:text-[#F25D88]"
          }`}
          aria-label={`Toggle favorite for ${dessert.name}`}
        >
          {favorite ? (
            <HiMiniHeart className="h-[18px] w-[18px] animate-heart-beat" fill="currentColor" />
          ) : (
            <HiOutlineHeart className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      <div className="space-y-2.5 p-3.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C2956A]">
            {dessert.category_name || "Sweet pick"}
          </p>
          <h3 className="mt-0.5 text-lg font-bold leading-tight text-[#6B3E06]">{dessert.name}</h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-end gap-1.5">
            <span className="text-xl font-black text-[#784706]">{formatMoney(dessert.price)}</span>
            {oldPrice ? (
              <span className="pb-0.5 text-xs text-[#C9A67E] line-through">{formatMoney(oldPrice)}</span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/desserts/${dessert.slug}`, { state: { dessert } })}
            className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(242,93,136,0.22)] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(242,93,136,0.30)] hover:brightness-110 active:scale-95"
            aria-label={`Open ${dessert.name}`}
          >
            View
            <HiMiniChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function ReviewStars({
  rating,
  size = "h-4 w-4",
}: {
  rating: number;
  size?: string;
}) {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-1 text-[#F4B73F]">
      {Array.from({ length: 5 }).map((_, index) => (
        <HiMiniStar
          key={index}
          className={`${size} transition-all duration-300 ${index < filledStars ? "scale-100" : "scale-90 opacity-70"}`}
          fill={index < filledStars ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: DessertReview; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text.length > 180;

  return (
    <article
      className="group rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,247,238,0.96))] p-4 shadow-[0_8px_20px_rgba(175,117,60,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(175,117,60,0.14)]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#FFE8EF] to-[#FFF5E1] text-xs font-bold text-[#6B3E06] shadow-sm transition-transform duration-300 group-hover:scale-110">
          {review.avatar ? (
            <img loading="lazy" src={review.avatar} alt={review.customer_name} className="h-full w-full object-cover" />
          ) : (
            <span className="relative z-10">{getInitials(review.customer_name)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-[#6B3E06]">{review.customer_name}</h3>
            {review.is_mine ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1F5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#F25D88]">
                <HiMiniCheck className="h-3 w-3" />
                Your review
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <ReviewStars rating={review.rating} size="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium text-[#B48960]">{formatDate(review.created_at, "Recently")}</span>
          </div>
          <div className="mt-2">
            <p className={`text-sm leading-6 text-[#8E6337] transition-all duration-300 ${!expanded && isLong ? "line-clamp-3" : ""}`}>
              {review.text}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((curr) => !curr)}
                className="mt-1 text-xs font-semibold text-[#F25D88] transition hover:text-[#E14D7B]"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Skeleton ───────────────────────────────────────────
function DetailPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#FFF7ED]">
      <div className="relative z-30 bg-[var(--color-header-bg)]/40 px-4 py-3 sm:px-8 sm:py-4">
        <Header />
      </div>
      <section className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-white/70 bg-white/80 p-4 shadow-[0_10px_30px_rgba(175,117,60,0.10)] lg:p-5">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3">
              <div className="h-[300px] rounded-[28px] shimmer-bg sm:h-[380px] lg:h-[460px]" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-18 w-24 rounded-[20px] shimmer-bg sm:h-20 sm:w-28" />
                ))}
              </div>
            </div>
            <div className="space-y-5 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(255,245,235,0.96))] p-5 sm:p-6">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-4 w-4 rounded-full shimmer-bg" />
                ))}
              </div>
              <div className="h-3.5 w-28 rounded-full shimmer-bg" />
              <div className="h-14 w-3/4 rounded-2xl shimmer-bg" />
              <div className="h-20 w-full rounded-[24px] shimmer-bg" />
              <div className="h-12 w-44 rounded-full shimmer-bg" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ─── Main Component ────────────────────────────────────
export default function DessertDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const {
    state: { user },
  } = useContextPro();
  const { addItem } = useCart();
  const routeDessert = (location.state as { dessert?: FeaturedDessert } | null)?.dessert;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });
  const [addingToCart, setAddingToCart] = useState(false);
  const [heartBeat, setHeartBeat] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const featuredQuery = useQuery({
    queryKey: ["featured-desserts", "detail"],
    queryFn: () => getFeaturedDesserts(12),
  });

  const featuredDesserts = featuredQuery.data ?? [];
  const { favoriteIds, toggleFavorite } = useFavorites(featuredDesserts);
  const reviewsQuery = useQuery({
    queryKey: ["dessert-reviews", slug],
    queryFn: () => getDessertReviews(slug ?? ""),
    enabled: Boolean(slug),
  });

  const dessert = useMemo(() => {
    return featuredDesserts.find((item) => item.slug === slug) ?? routeDessert ?? null;
  }, [featuredDesserts, routeDessert, slug]);

  useEffect(() => {
    setQuantity(1);
    setSelectedImage(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dessert?.id]);

  const detailCopy = dessert ? buildDetailCopy(dessert) : null;
  const ingredientList = useMemo(() => parseIngredients(dessert?.ingredients), [dessert?.ingredients]);
  const relatedDesserts = featuredDesserts.filter((item) => item.slug !== slug).slice(0, 8);
  const galleryImages = useMemo(() => {
    if (!dessert) return [];
    const candidates = [dessert.image_url, ...(dessert.image_urls ?? [])].filter(Boolean) as string[];
    return Array.from(new Set(candidates));
  }, [dessert]);
  const rating = Number(dessert?.rating_avg ?? 0);
  const reviewsCount = Number(dessert?.reviews_count ?? 0);
  const stockCount = Math.max(0, Number(dessert?.stock ?? 0));
  const isOutOfStock = dessert?.status === "out_of_stock" || stockCount <= 0;
  const isLowStock = !isOutOfStock && stockCount < 5;
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));
  const dessertReviews = reviewsQuery.data ?? [];
  const myReview = dessertReviews.find((review) => review.is_mine);
  const oldPrice = getDisplayOldPrice(dessert?.price);
  const discountPercent = getDisplayDiscountPercent(dessert?.price);
  const [imgLoaded, setImgLoaded] = useState(false);
  const dessertUrl = dessert ? `${SITE_URL}/desserts/${dessert.slug}` : `${SITE_URL}/desserts`;
  const primaryImage = dessert?.image_url || dessert?.image_urls?.[0] || "/website.png";
  const normalizedImage = primaryImage.startsWith("http")
    ? primaryImage
    : `${SITE_URL}${primaryImage.startsWith("/") ? primaryImage : `/${primaryImage}`}`;
  const dessertSchema = dessert
    ? [
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Desserts", item: `${SITE_URL}/desserts` },
            { "@type": "ListItem", position: 3, name: dessert.name, item: dessertUrl },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: dessert.name,
          image: [normalizedImage],
          description:
            detailCopy?.description ??
            `${dessert.name} at SweetCharm. Freshly prepared dessert with premium ingredients and a cozy handcrafted finish.`,
          sku: dessert.id,
          category: dessert.category_name ?? "Desserts",
          brand: {
            "@type": "Brand",
            name: "SweetCharm",
          },
          offers: {
            "@type": "Offer",
            url: dessertUrl,
            priceCurrency: "USD",
            price: Number(dessert.price),
            availability: isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
          },
          ...(rating > 0 && reviewsCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: Number(rating.toFixed(1)),
                  reviewCount: reviewsCount,
                },
              }
            : {}),
        },
      ]
    : undefined;

  const createReviewMutation = useMutation({
    mutationFn: () => createDessertReview(slug ?? "", reviewForm),
    onSuccess: async () => {
      toast.success("Review submitted successfully and sent for approval!");
      setReviewForm({ rating: 5, text: "" });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dessert-reviews", slug] }),
        queryClient.invalidateQueries({ queryKey: ["featured-desserts"] }),
        queryClient.invalidateQueries({ queryKey: ["featured-desserts", "detail"] }),
        queryClient.invalidateQueries({ queryKey: ["profile-featured-desserts"] }),
      ]);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Review could not be submitted")),
  });

  function handleAddToCart() {
    if (!dessert || isOutOfStock) return;
    setAddingToCart(true);
    addItem(dessert, quantity);
    toast.success(
      <div className="flex items-center gap-3">
        <HiMiniCheck className="h-5 w-5 shrink-0 text-green-400" />
        <span>
          <strong>{dessert.name}</strong> x{quantity} added to cart
        </span>
      </div>,
      { icon: false }
    );
    setTimeout(() => setAddingToCart(false), 800);
  }

  function handleToggleFavorite() {
    if (!dessert) return;
    setHeartBeat(true);
    toggleFavorite(dessert.id, dessert);
    setTimeout(() => setHeartBeat(false), 600);
  }

  // ── Not found ──────────────────────────────────────
  if (!dessert && featuredQuery.isLoading) return <DetailPageSkeleton />;

  if (!dessert) {
    return (
      <main className="min-h-screen bg-[#FFF7ED]">
        <Seo
          title="Dessert Not Found | SweetCharm"
          description="The dessert you are looking for is not available right now. Explore other handmade treats from SweetCharm."
          path="/desserts"
          noindex
        />

        <Header />
        <section className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-fade-in-up rounded-[32px] border border-white/70 bg-white/90 px-6 py-14 shadow-[0_10px_28px_rgba(175,117,60,0.08)] text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1F5] text-[#F25D88]">
              <HiMiniXMark className="h-8 w-8" />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#C69B71]">SweetCharm</p>
            <h1 className="mt-2 text-3xl font-bold text-[#6B3E06]">Dessert not found</h1>
            <p className="mt-2 max-w-md mx-auto text-sm text-[#9C7248]">
              This dessert isn't available right now or couldn't be found in our menu.
            </p>
            <Link
              to="/#menu"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(242,93,136,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(242,93,136,0.30)]"
            >
              <HiMiniArrowLeft className="h-4 w-4" />
              Back to menu
            </Link>
          </div>
        </section>
      </main>
    );
  }

  // ── Main render ────────────────────────────────────
  return (
    <main ref={mainRef} className="dessert-detail-page min-h-screen overflow-hidden bg-[var(--color-header-bg)] text-[#6B3E06]">
      <Seo
        title={`${dessert.name} | SweetCharm`}
        description={
          detailCopy?.description ??
          `${dessert.name} at SweetCharm. Freshly prepared dessert with premium ingredients and a cozy handcrafted finish.`
        }
        path={`/desserts/${dessert.slug}`}
        image={normalizedImage}
        structuredData={dessertSchema}
      />

      <style>{animationStyles}</style>

      {/* Header */}
      <div className="relative z-30 bg-[var(--color-header-bg)]/40 px-4 py-2.5 sm:px-8 sm:py-3 backdrop-blur-sm">
        <Header />
      </div>

      {/* Decorative floating elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[8%] top-[15%] h-5 w-5 animate-float text-[#FDE0E8]">
          <HiMiniHeart className="h-full w-full" />
        </div>
        <div className="absolute right-[12%] top-[25%] h-4 w-4 animate-float-delayed text-[#FDE0E8]">
          <HiMiniSparkles className="h-full w-full" />
        </div>
      </div>

      {/* Main content */}
      <section className="relative z-10 px-4 pb-8 pt-3 [&_button]:rounded-full sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-20 h-64 bg-[radial-gradient(circle,rgba(249,139,170,0.08),transparent_60%)] blur-3xl" />

        <div className="relative mx-auto max-w-[1320px] space-y-5">
          {/* ── Breadcrumb ────────────────────────────── */}
          <nav className="animate-fade-in-up-fast flex flex-wrap items-center gap-2 text-sm text-[#B18459]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 shadow-[0_6px_14px_rgba(175,117,60,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(175,117,60,0.12)]"
              aria-label="Go back"
            >
              <HiMiniChevronLeft className="h-4 w-4" />
            </button>
            <Link to="/" className="transition hover:text-[#F25D88]">Home</Link>
            <span className="text-[#D4B89B]">›</span>
            <Link to="/desserts" className="transition hover:text-[#F25D88]">Menu</Link>
            <span className="text-[#D4B89B]">›</span>
            <span className="font-semibold text-[#F25D88]">{dessert.name}</span>
          </nav>

          {/* ── Hero Section ──────────────────────────── */}
          <div className="animate-scale-in rounded-[32px] border border-white/70 bg-white/80 p-3 shadow-[0_10px_30px_rgba(175,117,60,0.10)] backdrop-blur-sm lg:p-4">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              {/* Image gallery */}
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-[28px] bg-[#FFF4EA]">
                  {!imgLoaded && <div className="absolute inset-0 shimmer-bg" />}
                  {galleryImages.length > 0 ? (
                    <img
                    loading="lazy"
                      src={galleryImages[selectedImage] ?? galleryImages[0]}
                      alt={dessert.name}
                      onLoad={() => setImgLoaded(true)}
                      className={`h-[300px] w-full object-cover transition-all duration-700 sm:h-[380px] lg:h-[460px] ${
                        imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                      }`}
                    />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center sm:h-[380px] lg:h-[460px] bg-[#FFF4EA]">
                      <HiMiniSparkles className="h-14 w-14 text-[#F25D88]/30 animate-float" />
                    </div>
                  )}

                  {/* Discount badge */}
                  {discountPercent ? (
                    <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-4 py-2 text-xs font-bold text-white shadow-[0_8px_18px_rgba(242,93,136,0.22)] animate-pulse-glow">
                      {discountPercent}% OFF
                    </div>
                  ) : null}

                  <div className="absolute left-3 top-14 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-[#6B3E06] shadow-[0_8px_18px_rgba(92,56,5,0.12)]">
                    {isOutOfStock ? "Out of stock" : isLowStock ? `Only ${stockCount} left` : `${stockCount} in stock`}
                  </div>

                  {/* Favorite button - pill shaped */}
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className={`absolute right-3 top-3 flex items-center justify-center gap-1.5 rounded-full border px-3.5 py-2 backdrop-blur-md transition-all duration-300 ${
                      favoriteIds.includes(dessert.id)
                        ? "border-[#F25D88] bg-[#F25D88] text-white shadow-[0_10px_20px_rgba(242,93,136,0.35)]"
                        : "border-white/75 bg-white/85 text-[#C28564] shadow-[0_8px_16px_rgba(175,117,60,0.10)] hover:bg-white hover:text-[#F25D88]"
                    }`}
                    aria-label={`Toggle favorite for ${dessert.name}`}
                  >
                    {favoriteIds.includes(dessert.id) ? (
                      <HiMiniHeart className={`h-5 w-5 ${heartBeat ? "animate-heart-beat" : ""}`} fill="currentColor" />
                    ) : (
                      <HiOutlineHeart className="h-5 w-5" />
                    )}
                    <span className="text-xs font-semibold">
                      {favoriteIds.includes(dessert.id) ? "Saved" : "Save"}
                    </span>
                  </button>

                  {/* Image navigation arrows */}
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#6B3E06] shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110"
                        aria-label="Previous image"
                      >
                        <HiMiniChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedImage((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#6B3E06] shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white hover:scale-110"
                        aria-label="Next image"
                      >
                        <HiMiniChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail navigation */}
                {galleryImages.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {galleryImages.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`group/thumb overflow-hidden rounded-[20px] border p-1 shadow-sm transition-all duration-300 ${
                          selectedImage === index
                            ? "border-[#F7A7BB] bg-white shadow-[0_8px_20px_rgba(242,93,136,0.16)]"
                            : "border-white/60 bg-white/70 hover:border-[#F3D5C2] hover:bg-white"
                        }`}
                        aria-label={`Show image ${index + 1} for ${dessert.name}`}
                      >
                        <img
                        loading="lazy"
                          src={image}
                          alt={`${dessert.name} preview ${index + 1}`}
                          className="h-16 w-24 rounded-[14px] object-cover transition-all duration-300 group-hover/thumb:scale-110 sm:h-20 sm:w-28"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Product info */}
              <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,rgba(255,252,247,0.95),rgba(255,245,235,0.96))] p-5 sm:p-6">
                <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 bg-[radial-gradient(circle,rgba(249,139,170,0.12),transparent_60%)] blur-3xl" />

                <div className="relative">
                  {/* Rating */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[#F4B73F]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <HiMiniStar
                        key={index}
                        className="h-[18px] w-[18px] transition-all duration-300 hover:scale-110"
                        fill={index < filledStars ? "currentColor" : "none"}
                      />
                    ))}
                    <span className="ml-1 text-sm font-semibold text-[#A67A50]">
                      {rating > 0 ? rating.toFixed(1) : "0.0"}
                      <span className="text-[#C9A67E] font-normal"> ({reviewsCount} reviews)</span>
                    </span>
                  </div>

                  {/* Title & bunny */}
                  <div className="mt-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C69B71]">
                        {dessert.category_name || "Featured dessert"}
                      </p>
                      <h1 className="mt-1.5 text-[clamp(2rem,4.5vw,3.8rem)] font-bold leading-[0.95] text-[#6B3E06]">
                        {dessert.name}
                      </h1>
                    </div>
                    <img
                    loading="lazy"
                      src={bunnyCupcake}
                      alt="Sweet bunny cupcake"
                      className="hidden h-24 w-24 object-contain drop-shadow-[0_10px_20px_rgba(175,117,60,0.14)] transition-transform duration-500 hover:scale-110 hover:rotate-3 lg:block animate-float-delayed"
                    />
                  </div>

                  {/* Description */}
                  <p className="mt-4 max-w-xl text-sm leading-7 text-[#976B40]">
                    {detailCopy?.description}
                  </p>

                  {/* Price */}
                  <div className="mt-4 flex flex-wrap items-end gap-2">
                    <span className="text-[2.4rem] font-black leading-none text-[#F25D88] animate-count-up">
                      {formatMoney(dessert.price)}
                    </span>
                    {oldPrice ? (
                      <span className="pb-1.5 text-xl text-[#C9A67E] line-through">
                        {formatMoney(oldPrice)}
                      </span>
                    ) : null}
                  </div>

                  {/* Highlights */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {detailCopy?.highlights.map((item, i) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold text-[#B07D52] shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <HiMiniSparkles className="h-2.5 w-2.5 text-[#F25D88]/60" />
                        {item}
                      </span>
                    ))}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm ${
                        isOutOfStock
                          ? "bg-[#FFE8EE] text-[#D1386A]"
                          : isLowStock
                            ? "bg-[#FFF3DE] text-[#B87A0F]"
                            : "bg-[#EAF8E8] text-[#3D8C1A]"
                      }`}
                    >
                      <HiMiniSparkles className="h-2.5 w-2.5" />
                      {isOutOfStock ? "Unavailable now" : isLowStock ? `Low stock: ${stockCount}` : "Ready to order"}
                    </span>
                  </div>

                  {ingredientList.length > 0 ? (
                    <div className="mt-5 rounded-[26px] border border-[#F6E2D2] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,246,238,0.98))] p-4 shadow-[0_10px_26px_rgba(175,117,60,0.08)]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C69B71]">
                            Ingredient Notes
                          </p>
                          <h2 className="mt-1 text-lg font-bold text-[#6B3E06]">What's inside this dessert</h2>
                          <p className="mt-1.5 max-w-md text-sm leading-6 text-[#976B40]">
                            A quick look at the main ingredients used to shape the flavor, texture and finish.
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-[#B07D52] shadow-sm">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF1F5] text-[#F25D88]">
                            <HiMiniSparkles className="h-4 w-4" />
                          </span>
                          {ingredientList.length} key ingredients
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {ingredientList.map((ingredient, index) => (
                          <span
                            key={`${ingredient}-${index}`}
                            className="inline-flex items-center gap-2 rounded-full border border-[#F3D9C5] bg-white/88 px-3.5 py-2 text-sm font-medium text-[#7E5328] shadow-[0_6px_14px_rgba(175,117,60,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F7A7BB] hover:text-[#F25D88] hover:shadow-[0_10px_22px_rgba(242,93,136,0.12)]"
                          >
                            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#FF9AB6] to-[#F25D88]" />
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Quantity + CTA */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                    <div>
                      <p className="mb-1.5 text-xs font-semibold text-[#8B6237]">Quantity</p>
                      <div className="inline-flex items-center gap-4 rounded-full border border-[#F2D8C2] bg-white/85 px-3.5 py-2.5 shadow-sm transition-all duration-200 hover:border-[#F7A7BB] hover:shadow-md">
                        <button
                          type="button"
                          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                          className="text-[#B07D52] transition-all duration-200 hover:text-[#F25D88] hover:scale-125 active:scale-90"
                          aria-label="Decrease quantity"
                        >
                          <HiMiniMinus className="h-[18px] w-[18px]" />
                        </button>
                        <span className="min-w-5 text-center text-base font-bold text-[#6B3E06]">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity((current) => (isOutOfStock ? current : Math.min(stockCount || 1, current + 1)))}
                          className="text-[#B07D52] transition-all duration-200 hover:text-[#F25D88] hover:scale-125 active:scale-90"
                          aria-label="Increase quantity"
                          disabled={isOutOfStock || quantity >= Math.max(stockCount, 1)}
                        >
                          <HiMiniPlus className="h-[18px] w-[18px]" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={addingToCart || isOutOfStock}
                        className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(242,93,136,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(242,93,136,0.30)] active:translate-y-0 active:scale-95 disabled:opacity-70"
                      >
                        {addingToCart ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Adding...
                          </>
                        ) : (
                          <>
                            <HiMiniShoppingBag className="h-[18px] w-[18px]" />
                            {isOutOfStock ? "Out of stock" : "Add to Cart"}
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleFavorite}
                        className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold shadow-[0_8px_16px_rgba(175,117,60,0.08)] transition-all duration-300 hover:-translate-y-0.5 ${
                          favoriteIds.includes(dessert.id)
                            ? "border-[#F7A7BB] bg-[#FFF1F5] text-[#F25D88] hover:shadow-[0_12px_24px_rgba(242,93,136,0.16)]"
                            : "border-[#F4DCCD] bg-white/82 text-[#8B6237] hover:border-[#F7A7BB] hover:text-[#F25D88] hover:bg-white hover:shadow-[0_12px_24px_rgba(175,117,60,0.12)]"
                        }`}
                      >
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                          favoriteIds.includes(dessert.id) ? "bg-[#F25D88] text-white" : "bg-[#FFF4F7] text-[#F25D88]"
                        }`}>
                          {favoriteIds.includes(dessert.id) ? (
                            <HiMiniHeart className={`h-4 w-4 ${heartBeat ? "animate-heart-beat" : ""}`} fill="currentColor" />
                          ) : (
                            <HiOutlineHeart className="h-4 w-4" />
                          )}
                        </span>
                        Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Reviews Section ───────────────────────── */}
          <ScrollReveal>
            <section className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_10px_28px_rgba(175,117,60,0.08)] transition-all duration-300 hover:shadow-[0_14px_36px_rgba(175,117,60,0.12)]">
              <div className="flex flex-col gap-5 xl:flex-row">
                {/* Left panel */}
                <div className="xl:w-[340px] xl:shrink-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C69B71]">Customer reviews</p>
                  <h2 className="mt-1.5 text-2xl font-bold text-[#6B3E06]">Share your sweet moment</h2>
                  <p className="mt-2 text-sm leading-6 text-[#9A6E42]">
                    Real guests can leave a rating and short note for this dessert. Your feedback helps other dessert lovers choose with confidence.
                  </p>

                  {/* Stats card */}
                  <div className="mt-4 rounded-[24px] bg-[linear-gradient(180deg,rgba(255,248,240,0.95),rgba(255,243,233,0.96))] p-4 shadow-[0_8px_20px_rgba(175,117,60,0.08)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(175,117,60,0.12)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#F25D88] shadow-sm">
                        <HiMiniChatBubbleLeftRight className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-[#6B3E06]">{reviewsCount}</p>
                        <p className="text-xs text-[#B48960]">Total reviews</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <ReviewStars rating={rating} size="h-[18px] w-[18px]" />
                      <span className="text-base font-semibold text-[#A67A50]">{rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Review form */}
                  <div className="mt-4 rounded-[24px] border border-white/70 bg-white/82 p-4 shadow-[0_8px_20px_rgba(175,117,60,0.06)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(175,117,60,0.10)]">
                    {user ? (
                      myReview ? (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C69B71]">
                            <HiMiniCheck className="inline h-3.5 w-3.5 mr-1 text-green-500" />
                            Already shared
                          </p>
                          <p className="mt-1.5 text-sm leading-6 text-[#8E6337]">
                            You've already reviewed this dessert. Your review appears below.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C69B71]">Write a review</p>
                          <div className="mt-3 flex items-center gap-1.5">
                            {Array.from({ length: 5 }).map((_, index) => {
                              const starValue = index + 1;
                              const active = reviewForm.rating >= starValue;
                              return (
                                <button
                                  key={starValue}
                                  type="button"
                                  onClick={() => setReviewForm((current) => ({ ...current, rating: starValue }))}
                                  className={`transition-all duration-200 hover:scale-125 ${
                                    active ? "text-[#F4B73F]" : "text-[#E8D4B8] hover:text-[#F4B73F]"
                                  }`}
                                  aria-label={`Rate ${starValue} stars`}
                                >
                                  <HiMiniStar className="h-6 w-6" fill={active ? "currentColor" : "none"} />
                                </button>
                              );
                            })}
                          </div>
                          <textarea
                            value={reviewForm.text}
                            onChange={(event) => setReviewForm((current) => ({ ...current, text: event.target.value }))}
                            placeholder="Tell us how this dessert tasted, looked, and felt..."
                            className="mt-3 min-h-[120px] w-full rounded-[20px] border border-[#F1DDCB] bg-[#FFFAF4] px-4 py-3 text-sm leading-6 text-[#6B3E06] outline-none transition-all duration-200 focus:border-[#F7A7BB] focus:ring-3 focus:ring-[#FDE0E8] placeholder:text-[#C9A98E] resize-none"
                          />
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[11px] text-[#C9A67E]">{reviewForm.text.length} / 500</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => createReviewMutation.mutate()}
                            disabled={createReviewMutation.isPending || reviewForm.text.trim().length < 3}
                            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(242,93,136,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(242,93,136,0.30)] disabled:cursor-not-allowed disabled:opacity-60 disabled:translate-y-0"
                          >
                            {createReviewMutation.isPending ? (
                              <span className="flex items-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Sending...
                              </span>
                            ) : (
                              "Submit review"
                            )}
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C69B71]">Want to review?</p>
                        <p className="mt-1.5 text-sm leading-6 text-[#8E6337]">
                          Log in to share your thoughts and rating for this dessert.
                        </p>
                        <Link
                          to="/login"
                          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(242,93,136,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(242,93,136,0.30)]"
                        >
                          Login to review
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Reviews list */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C69B71]">Latest feedback</p>
                      <h3 className="mt-1 text-xl font-bold text-[#6B3E06]">What people are saying</h3>
                    </div>
                  </div>

                  {reviewsQuery.isLoading ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-[22px] bg-white/70 p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full shimmer-bg" />
                            <div className="space-y-1.5 flex-1">
                              <div className="h-3.5 w-24 rounded-full shimmer-bg" />
                              <div className="h-2.5 w-16 rounded-full shimmer-bg" />
                            </div>
                          </div>
                          <div className="mt-3 h-12 rounded-2xl shimmer-bg" />
                        </div>
                      ))}
                    </div>
                  ) : dessertReviews.length > 0 ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {dessertReviews.map((review, index) => (
                        <div key={review.id} className="animate-fade-in-up-fast" style={{ animationDelay: `${index * 60}ms` }}>
                          <ReviewCard review={review} index={index} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[24px] bg-[linear-gradient(180deg,rgba(255,249,242,0.95),rgba(255,243,233,0.96))] p-6 text-center shadow-[0_8px_20px_rgba(175,117,60,0.06)] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(175,117,60,0.10)]">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#F25D88] shadow-sm">
                        <HiMiniChatBubbleLeftRight className="h-7 w-7" />
                      </div>
                      <p className="mt-3 text-base font-semibold text-[#6B3E06]">No reviews yet</p>
                      <p className="mt-1.5 text-sm leading-6 text-[#9A6E42] max-w-xs mx-auto">
                        Be the first to share your sweet experience with this dessert!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* ── Related Desserts ──────────────────────── */}
          <ScrollReveal>
            <section className="rounded-[30px] border border-white/70 bg-white/85 p-5 shadow-[0_10px_28px_rgba(175,117,60,0.08)] transition-all duration-300 hover:shadow-[0_14px_36px_rgba(175,117,60,0.12)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C69B71]">More sweets</p>
                  <h2 className="mt-1.5 text-2xl font-bold text-[#6B3E06]">You may also like</h2>
                </div>
                <a
                  href="/#menu"
                  className="group inline-flex items-center gap-1 text-sm font-semibold text-[#F25D88] transition-all duration-200 hover:text-[#E14D7B]"
                >
                  Explore full menu
                  <HiMiniChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {relatedDesserts.map((item, index) => (
                  <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <RelatedDessertCard
                      dessert={item}
                      favorite={favoriteIds.includes(item.id)}
                      onToggleFavorite={toggleFavorite}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
