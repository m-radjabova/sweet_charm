import { Link } from "react-router-dom";
import { HiMiniMinus, HiMiniPlus, HiMiniShoppingBag, HiMiniTrash } from "react-icons/hi2";
import Footer from "../home/components/Footer";
import Header from "../home/components/Header";
import { useCart } from "../../hooks/useCart";
import { formatMoney } from "../account/utils";
import rabbitIcons from "../../assets/rabbit_icons.png";
import bearIcons from "../../assets/bear_iocns.png";
import strawberryIcons from "../../assets/strawberry_icons.png";
import cakeIcon from "../../assets/cake_icon.png";
import macaronIcon from "../../assets/macaron_icon.png";
import Seo from "../../components/Seo";
import { getDisplayOldPrice } from "../../utils/pricing";

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-header-bg)] text-[#6B3E06]">
      <Seo
        title="Your Cart | SweetCharm"
        description="Review your selected SweetCharm desserts before checkout."
        path="/cart"
        noindex
      />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img
          loading="lazy"
          src={rabbitIcons}
          alt=""
          aria-hidden
          className="absolute -right-8 -top-6 w-40 opacity-[0.08] sm:w-56"
        />
        <img
          loading="lazy"
          src={bearIcons}
          alt=""
          aria-hidden
          className="absolute -left-10 top-1/3 w-36 -translate-y-1/2 opacity-[0.06] sm:w-48"
        />
        <img
          loading="lazy"
          src={strawberryIcons}
          alt=""
          aria-hidden
          className="absolute bottom-20 right-6 w-24 opacity-[0.07] sm:w-32"
        />
        <img
          loading="lazy"
          src={macaronIcon}
          alt=""
          aria-hidden
          className="absolute left-6 top-[15%] w-14 opacity-[0.05]"
        />
      </div>

      <div className="relative z-30 bg-[var(--color-header-bg)]/40 px-4 py-3 sm:px-8 sm:py-4">
        <Header />
      </div>

      <section className="relative z-10 px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px]">
          {/* Decorative bunny banner */}
          <div className="relative mb-6 overflow-hidden rounded-[36px] bg-gradient-to-br from-[#FFF5ED] via-[#FFFDF9] to-[#FFEFE5] px-6 py-6 shadow-[0_8px_28px_rgba(175,117,60,0.08)] sm:px-8">
            <div className="flex items-center justify-between">
              <div className="max-w-[70%]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F25D88]/10">
                    <span className="text-xs">🐰</span>
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69B71]">
                    Sweet Cart
                  </span>
                </div>
                <h1 className="mt-2 text-[clamp(1.8rem,3.5vw,3.2rem)] font-bold leading-[1.1] text-[#6B3E06]">
                  Your <span className="text-[#F25D88]">dessert</span> bag
                </h1>
                <p className="mt-2 text-sm text-[#9A6E42]">
                  {itemCount > 0
                    ? `🐇 ${itemCount} item${itemCount > 1 ? "s" : ""} hopping to checkout!`
                    : "Your cart is empty for now."}
                </p>
              </div>
              <div className="shrink-0">
                <div className="relative h-20 w-20 sm:h-28 sm:w-28">
                  <img
                    loading="lazy"
                    src={rabbitIcons}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-contain drop-shadow-[0_4px_12px_rgba(242,93,136,0.15)]"
                  />
                  {/* Floating hearts */}
                  <span className="absolute -right-1 -top-1 animate-bounce text-lg sm:-right-2 sm:-top-2">
                    💖
                  </span>
                  <span
                    className="absolute -bottom-1 -left-1 animate-bounce text-base"
                    style={{ animationDelay: "0.3s" }}
                  >
                    ✨
                  </span>
                </div>
              </div>
            </div>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={clearCart}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#F4DCCD] bg-white/80 px-5 text-xs font-semibold text-[#8B6237] shadow-sm transition hover:border-[#F7A7BB] hover:bg-[#FFF5F7] hover:text-[#F25D88]"
              >
                <HiMiniTrash className="h-4 w-4" />
                Clear cart
              </button>
            ) : null}
          </div>

          <div className="rounded-[36px] border border-white/70 bg-white/85 p-4 shadow-[0_12px_36px_rgba(175,117,60,0.10)] sm:p-6">
            {items.length === 0 ? (
              /* Empty state - super cute bunny theme */
              <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(255,249,242,0.95),rgba(255,243,233,0.96))] px-6 py-14 text-center shadow-[0_10px_24px_rgba(175,117,60,0.06)]">
                {/* Decorative background bunnies */}
                <img
                  loading="lazy"
                  src={rabbitIcons}
                  alt=""
                  aria-hidden
                  className="absolute -right-6 -top-4 w-28 opacity-[0.10]"
                />
                <img
                  loading="lazy"
                  src={bearIcons}
                  alt=""
                  aria-hidden
                  className="absolute -bottom-8 -left-6 w-32 opacity-[0.08]"
                />

                <div className="relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-[0_8px_24px_rgba(242,93,136,0.12)]">
                  <img
                    loading="lazy"
                    src={rabbitIcons}
                    alt=""
                    className="h-16 w-16 object-contain drop-shadow-[0_2px_8px_rgba(242,93,136,0.10)]"
                  />
                </div>
                <h2 className="relative z-10 mt-5 text-2xl font-bold text-[#6B3E06]">
                  Your bag is empty 🐰
                </h2>
                <p className="relative z-10 mx-auto mt-2 max-w-xs text-sm leading-7 text-[#9A6E42]">
                  Add some sweet treats and they'll hop right into your cart!
                </p>
                <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/desserts"
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(242,93,136,0.22)] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <img loading="lazy" src={cakeIcon} alt="" className="h-5 w-5 invert brightness-0" />
                    Explore desserts
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-[#F4DCCD] bg-white/90 px-6 text-sm font-semibold text-[#8B6237] shadow-sm transition-all duration-200 hover:border-[#F7A7BB] hover:text-[#F25D88]"
                  >
                    ✨ Visit home
                  </Link>
                </div>
              </div>
            ) : (
              /* Cart with items */
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#F25D88]/10">
                      <img loading="lazy" src={cakeIcon} alt="" className="h-4 w-4 invert-[0.3]" />
                    </span>
                    <span className="text-sm font-semibold text-[#C69B71]">
                      Cart items ({itemCount})
                    </span>
                  </div>

                  {items.map((item, index) => (
                    <article
                      key={item.id}
                      className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,247,238,0.96))] p-4 shadow-[0_10px_24px_rgba(175,117,60,0.08)] transition-all duration-300 hover:shadow-[0_14px_32px_rgba(242,93,136,0.10)] sm:flex-row sm:items-center"
                    >
                      {/* Decorative bunny silhouette */}
                      <img
                        loading="lazy"
                        src={rabbitIcons}
                        alt=""
                        aria-hidden
                        className="absolute -bottom-4 -right-4 w-20 opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]"
                      />

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative shrink-0">
                          <img
                            loading="lazy"
                            src={item.image_url || cakeIcon}
                            alt={item.name}
                            className="h-28 w-full rounded-[24px] object-cover shadow-[0_4px_12px_rgba(175,117,60,0.10)] sm:w-36"
                          />
                          <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7E9F] to-[#F25D88] text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(242,93,136,0.25)]">
                            {index + 1}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C2956A]">
                            {item.category_name || "SweetCharm"}
                          </p>
                          <h2 className="mt-1 text-2xl font-bold text-[#6B3E06]">{item.name}</h2>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="text-2xl font-black text-[#784706]">
                              {formatMoney(item.price)}
                            </span>
                            {getDisplayOldPrice(item.price) ? (
                              <span className="text-base text-[#C9A67E] line-through">
                                {formatMoney(getDisplayOldPrice(item.price))}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#F4E4D6]/60 pt-4 sm:mt-0 sm:border-0 sm:pt-0">
                        <div className="inline-flex mt-4 items-center gap-4 rounded-full border border-[#F2D8C2] bg-white/85 px-4 py-3 shadow-sm">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#B07D52] transition hover:bg-[#F25D88]/10 hover:text-[#F25D88]"
                          >
                            <HiMiniMinus className="h-4 w-4" />
                          </button>
                          <span className="min-w-6 text-center text-lg font-bold text-[#6B3E06]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#B07D52] transition hover:bg-[#F25D88]/10 hover:text-[#F25D88]"
                          >
                            <HiMiniPlus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-[#F25D88]">
                            {formatMoney(Number(item.price) * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF1F5] text-[#F25D88] shadow-sm transition hover:scale-105 hover:bg-[#FFE4EB]"
                          >
                            <HiMiniTrash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Summary card */}
                <aside className="relative h-fit overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,247,238,0.96))] p-5 shadow-[0_10px_24px_rgba(175,117,60,0.08)]">
                  {/* Decorative bunny */}
                  <img
                    src={rabbitIcons}
                    loading="lazy"
                    alt=""
                    aria-hidden
                    className="absolute -right-8 -top-6 w-28 opacity-[0.06]"
                  />
                  <img
                    src={bearIcons}
                    loading="lazy"
                    alt=""
                    aria-hidden
                    className="absolute -bottom-8 -left-6 w-24 opacity-[0.05]"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F25D88]/10">
                        <HiMiniShoppingBag className="h-3 w-3 text-[#F25D88]" />
                      </span>
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C69B71]">
                        Summary
                      </span>
                    </div>
                    <h2 className="mt-1 text-3xl font-bold text-[#6B3E06]">Order total</h2>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between text-sm text-[#9A6E42]">
                        <span>Items</span>
                        <span className="font-semibold">{itemCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-[#9A6E42]">
                        <span>Delivery</span>
                        <span className="font-medium text-[#C69B71]">Calculated later</span>
                      </div>
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#EFD9C8] to-transparent" />
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-[#6B3E06]">Subtotal</span>
                        <span className="text-3xl font-black text-[#F25D88]">
                          {formatMoney(subtotal)}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/checkout"
                      className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-8 text-base font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(242,93,136,0.30)] active:translate-y-0"
                    >
                      <HiMiniShoppingBag className="h-5 w-5" />
                      Continue to checkout
                    </Link>

                    <p className="mt-3 text-center text-xs text-[#C9A67E]">
                      🐰 Sweet treats are packed with love!
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </div>

          {/* Bottom decoration */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#EFD9C8]" />
            <div className="flex items-center gap-1.5">
              <img src={macaronIcon} alt="" className="h-4 w-4 opacity-50" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A67E]">
                SweetCharm
              </span>
              <img loading="lazy" src={macaronIcon} alt="" className="h-4 w-4 opacity-50" />
            </div>
            <div className="h-px w-8 bg-gradient-to-r from-[#EFD9C8] to-transparent" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
