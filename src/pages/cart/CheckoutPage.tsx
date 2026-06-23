import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HiMiniCalendarDays,
  HiMiniCheckCircle,
  HiMiniClock,
  HiMiniCreditCard,
  HiMiniMapPin,
  HiMiniMagnifyingGlass,
  HiMiniMap,
  HiMiniShoppingBag,
  HiMiniSparkles,
  HiMiniTruck,
  HiMiniUser,
} from "react-icons/hi2";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { toast } from "react-toastify";
import { getErrorMessage, getStoredAccessToken } from "../../api/auth";
import {
  createMyAddress,
  createMyOrder,
  getMyAddresses,
  type AccountAddress,
  type AccountAddressPayload,
  type AccountOrder,
} from "../../api/account";
import { getMyProfile } from "../../api/profile";
import { getActiveCoupons, type PublicCoupon } from "../../api/coupons";
import rabbitIcons from "../../assets/rabbit_icons.png";
import Footer from "../home/components/Footer";
import Header from "../home/components/Header";
import { useCart } from "../../hooks/useCart";
import useContextPro from "../../hooks/useContextPro";
import { formatDate, formatMoney, normalizePhoneForApi, normalizePhoneInput } from "../account/utils";

type PaymentMethod = "cash" | "card";
type AddressMode = "saved" | "new";
const DEFAULT_CENTER: [number, number] = [69.2401, 41.2995];

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    road?: string;
    neighbourhood?: string;
  };
}

interface CheckoutFormState {
  customerName: string;
  phone: string;
  email: string;
  deliveryDate: string;
  deliveryTime: string;
  note: string;
  paymentMethod: PaymentMethod;
  addressMode: AddressMode;
  selectedAddressId: string;
  newAddressTitle: string;
  newAddressCity: string;
  newAddressStreet: string;
  newAddressApartment: string;
  newAddressNote: string;
  newAddressLatitude: number | null;
  newAddressLongitude: number | null;
  saveNewAddress: boolean;
  makeDefaultAddress: boolean;
}

const initialForm: CheckoutFormState = {
  customerName: "",
  phone: "",
  email: "",
  deliveryDate: "",
  deliveryTime: "",
  note: "",
  paymentMethod: "cash",
  addressMode: "saved",
  selectedAddressId: "",
  newAddressTitle: "Home",
  newAddressCity: "",
  newAddressStreet: "",
  newAddressApartment: "",
  newAddressNote: "",
  newAddressLatitude: null,
  newAddressLongitude: null,
  saveNewAddress: true,
  makeDefaultAddress: false,
};

function buildAddressLabel(address?: AccountAddress | null) {
  if (!address) return "";
  return [address.city, address.street, address.apartment].filter(Boolean).join(", ");
}

function buildNewAddressLabel(form: CheckoutFormState) {
  return [form.newAddressCity.trim(), form.newAddressStreet.trim(), form.newAddressApartment.trim()]
    .filter(Boolean)
    .join(", ");
}

function calculateCouponDiscount(coupon: PublicCoupon | null, subtotal: number, deliveryPrice: number) {
  if (!coupon) return 0;
  if (subtotal + deliveryPrice < Number(coupon.minimum_order)) return 0;
  if (coupon.type === "percentage") return Number(((subtotal * Number(coupon.value)) / 100).toFixed(2));
  if (coupon.type === "fixed") return Math.min(Number(coupon.value), subtotal + deliveryPrice);
  return Math.min(deliveryPrice, subtotal + deliveryPrice);
}

function getCouponLabel(coupon: PublicCoupon) {
  if (coupon.type === "percentage") return `${Number(coupon.value)}% off`;
  if (coupon.type === "fixed") return `${formatMoney(coupon.value)} off`;
  return "Free shipping";
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const {
    state: { user },
  } = useContextPro();
  const { items, itemCount, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutFormState>(initialForm);
  const [placedOrder, setPlacedOrder] = useState<AccountOrder | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponInput, setCouponInput] = useState("");

  const isAuthenticated = Boolean(getStoredAccessToken() && user);

  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
  });

  const addressesQuery = useQuery({
    queryKey: ["my-addresses"],
    queryFn: getMyAddresses,
    enabled: isAuthenticated,
  });
  const couponsQuery = useQuery({
    queryKey: ["active-coupons"],
    queryFn: getActiveCoupons,
  });

  const addresses = addressesQuery.data ?? [];
  const activeCoupons = couponsQuery.data ?? [];

  useEffect(() => {
    if (!profileQuery.data) return;

    setForm((current) => ({
      ...current,
      customerName: current.customerName || profileQuery.data?.full_name || "",
      email: current.email || profileQuery.data?.email || "",
      phone: current.phone || (profileQuery.data?.phone ? profileQuery.data.phone.replace(/^\+998/, "") : ""),
    }));
  }, [profileQuery.data]);

  useEffect(() => {
    if (addresses.length === 0) {
      setForm((current) => ({
        ...current,
        addressMode: "new",
        selectedAddressId: "",
      }));
      return;
    }

    setForm((current) => {
      if (current.selectedAddressId) return current;
      const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0];
      return {
        ...current,
        selectedAddressId: defaultAddress?.id ?? "",
        addressMode: "saved",
      };
    });
  }, [addresses]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: DEFAULT_CENTER,
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.on("click", (event) => {
      const lng = Number(event.lngLat.lng.toFixed(6));
      const lat = Number(event.lngLat.lat.toFixed(6));
      void applyPickedLocation(lat, lng);
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || form.newAddressLatitude === null || form.newAddressLongitude === null) return;
    const lngLat: [number, number] = [form.newAddressLongitude, form.newAddressLatitude];
    markerRef.current?.remove();
    markerRef.current = new maplibregl.Marker({ color: "#F25D88" }).setLngLat(lngLat).addTo(mapRef.current);
    mapRef.current.flyTo({ center: lngLat, zoom: 15, essential: true });
  }, [form.newAddressLatitude, form.newAddressLongitude]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === form.selectedAddressId) ?? null,
    [addresses, form.selectedAddressId],
  );

  const deliveryPrice = 0;
  const appliedCoupon = useMemo(
    () => activeCoupons.find((coupon) => coupon.code === appliedCouponCode) ?? null,
    [activeCoupons, appliedCouponCode],
  );
  const couponDiscount = useMemo(
    () => calculateCouponDiscount(appliedCoupon, subtotal, deliveryPrice),
    [appliedCoupon, subtotal, deliveryPrice],
  );
  const total = Math.max(0, subtotal + deliveryPrice - couponDiscount);
  const minDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!appliedCoupon) return;
    const isStillEligible = subtotal + deliveryPrice >= Number(appliedCoupon.minimum_order);
    if (!isStillEligible) {
      setAppliedCouponCode("");
      setCouponInput("");
    }
  }, [appliedCoupon, subtotal, deliveryPrice]);

  function applyCouponFromInput() {
    const normalizedCode = couponInput.trim().toUpperCase();
    if (!normalizedCode) {
      toast.error("Enter a coupon code first");
      return;
    }

    const coupon = activeCoupons.find((item) => item.code === normalizedCode);
    if (!coupon) {
      toast.error("Coupon not found or no longer active");
      return;
    }

    const eligible = subtotal + deliveryPrice >= Number(coupon.minimum_order);
    if (!eligible) {
      toast.error(`Minimum order for this coupon is ${formatMoney(coupon.minimum_order)}`);
      return;
    }

    setAppliedCouponCode(coupon.code);
    setCouponInput(coupon.code);
    toast.success(`${coupon.code} applied successfully`);
  }

  const createOrderMutation = useMutation({
    mutationFn: createMyOrder,
    onSuccess: async (order) => {
      setPlacedOrder(order);
      clearCart();
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
      toast.success("Order placed successfully! SweetCharm is on it.");
      setAppliedCouponCode("");
      setCouponInput("");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Checkout failed"));
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: createMyAddress,
    onError: (error) => {
      toast.error(getErrorMessage(error, "Address could not be saved"));
    },
  });

  const summaryItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        lineTotal: Number(item.price) * item.quantity,
      })),
    [items],
  );

  const isAddressValid =
    form.addressMode === "saved"
      ? Boolean(selectedAddress)
      : Boolean(form.newAddressCity.trim() && form.newAddressStreet.trim());

  async function reverseGeocode(lat: number, lon: number) {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      format: "json",
      addressdetails: "1",
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
    return (await response.json()) as NominatimResult;
  }

  async function applyPickedLocation(lat: number, lon: number) {
    try {
      const result = await reverseGeocode(lat, lon);
      setForm((current) => ({
        ...current,
        newAddressCity:
          result.address?.city ?? result.address?.town ?? result.address?.village ?? current.newAddressCity,
        newAddressStreet:
          result.address?.road ?? result.address?.neighbourhood ?? result.display_name ?? current.newAddressStreet,
        newAddressLatitude: lat,
        newAddressLongitude: lon,
      }));
      setSearch(result.display_name ?? "");
    } catch {
      setForm((current) => ({
        ...current,
        newAddressLatitude: lat,
        newAddressLongitude: lon,
      }));
      toast.error("Map location was picked, but address details could not be loaded");
    }
  }

  async function searchAddress() {
    if (search.trim().length < 3) {
      toast.error("Type at least 3 characters");
      return;
    }

    setSearching(true);
    try {
      const params = new URLSearchParams({
        q: search.trim(),
        format: "json",
        addressdetails: "1",
        limit: "5",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      const data = (await response.json()) as NominatimResult[];
      setResults(data);
    } catch {
      toast.error("Location search failed");
    } finally {
      setSearching(false);
    }
  }

  function pickResult(result: NominatimResult) {
    const lat = Number(result.lat);
    const lon = Number(result.lon);
    setForm((current) => ({
      ...current,
      newAddressCity:
        result.address?.city ?? result.address?.town ?? result.address?.village ?? current.newAddressCity,
      newAddressStreet: result.address?.road ?? result.address?.neighbourhood ?? result.display_name,
      newAddressLatitude: lat,
      newAddressLongitude: lon,
    }));
    setResults([]);
    setSearch(result.display_name);
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await applyPickedLocation(
            Number(position.coords.latitude.toFixed(6)),
            Number(position.coords.longitude.toFixed(6)),
          );
          toast.success("Your current location was added");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.error("Location access was denied or unavailable");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  async function handleSubmit() {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: location.pathname,
        },
      });
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const normalizedPhone = normalizePhoneForApi(form.phone);
    if (form.customerName.trim().length < 2) {
      toast.error("Please enter your full name");
      return;
    }
    if (!normalizedPhone) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (!isAddressValid) {
      toast.error("Please choose or fill in a delivery address");
      return;
    }

    let addressText = buildAddressLabel(selectedAddress);

    if (form.addressMode === "new") {
      addressText = buildNewAddressLabel(form);

      if (form.saveNewAddress) {
        const addressPayload: AccountAddressPayload = {
          title: form.newAddressTitle.trim() || "Home",
          city: form.newAddressCity.trim(),
          street: form.newAddressStreet.trim(),
          apartment: form.newAddressApartment.trim() || null,
          note: form.newAddressNote.trim() || null,
          latitude: form.newAddressLatitude,
          longitude: form.newAddressLongitude,
          is_default: form.makeDefaultAddress,
        };

        await createAddressMutation.mutateAsync(addressPayload);
      }
    }

    await createOrderMutation.mutateAsync({
      customer_name: form.customerName.trim(),
      phone: normalizedPhone,
      email: form.email.trim() || null,
      address: addressText,
      delivery_date: form.deliveryDate || null,
      delivery_time: form.deliveryTime || null,
      payment_method: form.paymentMethod,
      coupon_code: appliedCouponCode || null,
      note: form.note.trim() || null,
      items: items.map((item) => ({
        dessert_id: item.id,
        quantity: item.quantity,
      })),
    });
  }

  if (placedOrder) {
    return (
      <main className="min-h-screen overflow-hidden bg-[var(--color-header-bg)] text-[#6B3E06]">
        <div className="relative z-30 bg-[var(--color-header-bg)]/40 px-4 py-3 sm:px-8 sm:py-4">
          <Header />
        </div>

        <section className="relative z-10 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[920px] overflow-hidden rounded-[36px] border border-white/70 bg-white/88 p-6 shadow-[0_16px_48px_rgba(175,117,60,0.10)] sm:p-10">
            <div className="mx-auto flex max-w-[560px] flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF1F5] shadow-[0_12px_30px_rgba(242,93,136,0.14)]">
                <HiMiniCheckCircle className="h-14 w-14 text-[#F25D88]" />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#C69B71]">
                Sweet order confirmed
              </p>
              <h1 className="mt-2 text-[clamp(2rem,4vw,3.4rem)] font-bold leading-tight">
                Your treats are officially on the way
              </h1>
              <p className="mt-3 text-sm leading-7 text-[#9A6E42]">
                Order #{placedOrder.id.slice(0, 8)} was placed for {formatMoney(placedOrder.total_price)}.
                We saved your checkout details and sent everything to the kitchen.
              </p>

              <div className="mt-8 grid w-full gap-4 rounded-[28px] border border-[#F3E1D1] bg-[#FFF9F4] p-5 text-left sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C69B71]">Delivery to</p>
                  <p className="mt-2 text-sm font-semibold text-[#6B3E06]">{placedOrder.address}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C69B71]">Payment</p>
                  <p className="mt-2 text-sm font-semibold capitalize text-[#6B3E06]">
                    {placedOrder.payment_method}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <Link
                  to="/account/profile"
                  className="inline-flex h-14 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition hover:-translate-y-0.5"
                >
                  View my orders
                </Link>
                <Link
                  to="/desserts"
                  className="inline-flex h-14 flex-1 items-center justify-center rounded-full border border-[#F2D8C2] bg-white px-6 text-sm font-semibold text-[#8B6237] shadow-sm transition hover:border-[#F7A7BB] hover:text-[#F25D88]"
                >
                  Order more desserts
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen overflow-hidden bg-[var(--color-header-bg)] text-[#6B3E06]">
        <div className="relative z-30 bg-[var(--color-header-bg)]/40 px-4 py-3 sm:px-8 sm:py-4">
          <Header />
        </div>

        <section className="relative z-10 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[840px] rounded-[36px] border border-white/70 bg-white/88 p-8 text-center shadow-[0_12px_36px_rgba(175,117,60,0.10)] sm:p-10">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF1F5]">
              <HiMiniShoppingBag className="h-12 w-12 text-[#F25D88]" />
            </div>
            <h1 className="mt-6 text-3xl font-bold">Your checkout is waiting for a cart</h1>
            <p className="mt-3 text-sm leading-7 text-[#9A6E42]">
              Add a few desserts first, then come back here and we will finish the order in one step.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/desserts"
                className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-8 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition hover:-translate-y-0.5"
              >
                Browse desserts
              </Link>
              <Link
                to="/cart"
                className="inline-flex h-14 items-center justify-center rounded-full border border-[#F2D8C2] bg-white px-8 text-sm font-semibold text-[#8B6237] shadow-sm transition hover:border-[#F7A7BB] hover:text-[#F25D88]"
              >
                Back to cart
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-header-bg)] text-[#6B3E06]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img src={rabbitIcons} alt="" aria-hidden className="absolute right-0 top-10 w-44 opacity-[0.05] sm:w-60" />
        <div className="absolute left-[6%] top-[18%] h-4 w-4 animate-float rounded-full bg-[#FAD5DF]/70" />
        <div className="absolute right-[12%] top-[26%] h-5 w-5 animate-float rounded-full bg-[#F7E2B8]/80" />
      </div>

      <div className="relative z-30 bg-[var(--color-header-bg)]/40 px-4 py-3 sm:px-8 sm:py-4">
        <Header />
      </div>

      <section className="relative z-10 px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px] space-y-6">
          <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[#FFF5ED] via-[#FFFDF9] to-[#FFEFE5] px-6 py-7 shadow-[0_8px_28px_rgba(175,117,60,0.08)] sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C69B71]">Checkout</p>
            <h1 className="mt-2 text-[clamp(2rem,4vw,3.6rem)] font-bold leading-[1.05]">
              Finish your <span className="text-[#F25D88]">sweet</span> order
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#9A6E42]">
              Review your cart, choose where we should deliver it, and place the order in one smooth flow.
            </p>
          </div>

          {!isAuthenticated ? (
            <div className="rounded-[36px] border border-white/70 bg-white/88 p-6 shadow-[0_12px_36px_rgba(175,117,60,0.10)] sm:p-8">
              <div className="mx-auto max-w-[640px] text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF1F5]">
                  <HiMiniUser className="h-10 w-10 text-[#F25D88]" />
                </div>
                <h2 className="mt-5 text-3xl font-bold">Sign in to complete checkout</h2>
                <p className="mt-3 text-sm leading-7 text-[#9A6E42]">
                  We use your account to save delivery addresses and keep your orders visible inside your profile.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    to="/login"
                    state={{ from: "/checkout" }}
                    className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-8 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition hover:-translate-y-0.5"
                  >
                    Login to continue
                  </Link>
                  <Link
                    to="/cart"
                    className="inline-flex h-14 items-center justify-center rounded-full border border-[#F2D8C2] bg-white px-8 text-sm font-semibold text-[#8B6237] shadow-sm transition hover:border-[#F7A7BB] hover:text-[#F25D88]"
                  >
                    Back to cart
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <section className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-[0_12px_36px_rgba(175,117,60,0.08)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1F5] text-[#F25D88]">
                      <HiMiniUser className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69B71]">Customer</p>
                      <h2 className="text-2xl font-bold">Contact details</h2>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-[#8B6237]">Full name</span>
                      <input
                        value={form.customerName}
                        onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                        className="h-12 w-full rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm outline-none transition focus:border-[#F25D88]/40"
                        placeholder="Your full name"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-[#8B6237]">Phone number</span>
                      <input
                        value={form.phone}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, phone: normalizePhoneInput(event.target.value) }))
                        }
                        className="h-12 w-full rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm outline-none transition focus:border-[#F25D88]/40"
                        placeholder="90 123 45 67"
                      />
                    </label>
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-semibold text-[#8B6237]">Email</span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                        className="h-12 w-full rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm outline-none transition focus:border-[#F25D88]/40"
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>
                </section>

                <section className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-[0_12px_36px_rgba(175,117,60,0.08)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1F5] text-[#F25D88]">
                      <HiMiniMapPin className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69B71]">Delivery</p>
                      <h2 className="text-2xl font-bold">Address details</h2>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, addressMode: "saved" }))}
                      className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                        form.addressMode === "saved"
                          ? "bg-[#F25D88] text-white shadow-[0_10px_20px_rgba(242,93,136,0.20)]"
                          : "border border-[#F2D8C2] bg-white text-[#8B6237]"
                      }`}
                    >
                      Saved address
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, addressMode: "new" }))}
                      className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition ${
                        form.addressMode === "new"
                          ? "bg-[#F25D88] text-white shadow-[0_10px_20px_rgba(242,93,136,0.20)]"
                          : "border border-[#F2D8C2] bg-white text-[#8B6237]"
                      }`}
                    >
                      New address
                    </button>
                  </div>

                  {form.addressMode === "saved" && addresses.length > 0 ? (
                    <div className="mt-5 space-y-3">
                      {addresses.map((address) => {
                        const isActive = form.selectedAddressId === address.id;

                        return (
                          <button
                            type="button"
                            key={address.id}
                            onClick={() => setForm((current) => ({ ...current, selectedAddressId: address.id }))}
                            className={`w-full rounded-[24px] border p-4 text-left transition ${
                              isActive
                                ? "border-[#F7A7BB] bg-[#FFF5F7] shadow-[0_10px_24px_rgba(242,93,136,0.08)]"
                                : "border-[#F2DEC8] bg-[#FFF9F1]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-[#6B3E06]">
                                  {address.title}
                                  {address.is_default ? (
                                    <span className="ml-2 rounded-full bg-[#F25D88]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F25D88]">
                                      Default
                                    </span>
                                  ) : null}
                                </p>
                                <p className="mt-1 text-sm text-[#9A6E42]">{buildAddressLabel(address)}</p>
                              </div>
                              {isActive ? <HiMiniCheckCircle className="h-6 w-6 text-[#F25D88]" /> : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {form.addressMode === "saved" && addresses.length === 0 ? (
                    <div className="mt-5 rounded-[24px] border border-dashed border-[#F2DEC8] bg-[#FFF9F1] p-5 text-sm text-[#9A6E42]">
                      You do not have any saved addresses yet. Switch to new address and we can save one during checkout.
                    </div>
                  ) : null}

                  {form.addressMode === "new" ? (
                    <div className="mt-5 space-y-5">
                      <div className="rounded-[28px] border border-[#F2DEC8] bg-[#FFF9F1] p-4">
                        <div className="flex flex-col gap-3 lg:flex-row">
                          <div className="group relative flex-1">
                            <HiMiniMagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A67E] transition-colors group-focus-within:text-[#F25D88]" />
                            <input
                              value={search}
                              onChange={(event) => setSearch(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void searchAddress();
                                }
                              }}
                              placeholder="Search district, street, or landmark"
                              className="h-12 w-full rounded-2xl border border-[#F2DEC8] bg-white pl-10 pr-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)]"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => void searchAddress()}
                              disabled={searching}
                              className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#F2DEC8] bg-white px-5 text-sm font-semibold text-[#8B6237] shadow-sm transition hover:border-[#F7A7BB] hover:text-[#F25D88] disabled:opacity-70"
                            >
                              {searching ? "Searching..." : "Search"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void useMyLocation()}
                              disabled={locating}
                              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(242,93,136,0.18)] transition hover:-translate-y-0.5 disabled:opacity-70"
                            >
                              <HiMiniMap className="h-4 w-4" />
                              {locating ? "Locating..." : "My location"}
                            </button>
                          </div>
                        </div>

                        {results.length > 0 ? (
                          <div className="mt-3 max-h-44 overflow-auto rounded-2xl border border-[#F2DEC8] bg-white p-2 shadow-sm">
                            {results.map((result) => (
                              <button
                                key={`${result.lat}-${result.lon}-${result.display_name}`}
                                type="button"
                                onClick={() => pickResult(result)}
                                className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#7F5B30] transition hover:bg-[#FFF5F7]"
                              >
                                {result.display_name}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        <div
                          ref={mapContainerRef}
                          className="mt-3 h-[320px] overflow-hidden rounded-[24px] border border-[#F2DEC8] bg-white shadow-inner"
                        />
                        <div className="mt-3 flex items-center gap-2 text-sm text-[#9A6E42]">
                          <HiMiniMapPin className="h-4 w-4 text-[#F25D88]" />
                          {form.newAddressLatitude !== null && form.newAddressLongitude !== null
                            ? `${form.newAddressLatitude.toFixed(4)}, ${form.newAddressLongitude.toFixed(4)}`
                            : "Search, use My location, or click the map to pin the address"}
                        </div>
                      </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-[#8B6237]">Label</span>
                        <input
                          value={form.newAddressTitle}
                          onChange={(event) => setForm((current) => ({ ...current, newAddressTitle: event.target.value }))}
                          className="h-12 w-full rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm outline-none transition focus:border-[#F25D88]/40"
                          placeholder="Home"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-[#8B6237]">City</span>
                        <input
                          value={form.newAddressCity}
                          onChange={(event) => setForm((current) => ({ ...current, newAddressCity: event.target.value }))}
                          className="h-12 w-full rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm outline-none transition focus:border-[#F25D88]/40"
                          placeholder="Tashkent"
                        />
                      </label>
                      <label className="space-y-2 sm:col-span-2">
                        <span className="text-sm font-semibold text-[#8B6237]">Street / area</span>
                        <input
                          value={form.newAddressStreet}
                          onChange={(event) => setForm((current) => ({ ...current, newAddressStreet: event.target.value }))}
                          className="h-12 w-full rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm outline-none transition focus:border-[#F25D88]/40"
                          placeholder="Street, house, landmark"
                        />
                      </label>
                      <label className="space-y-2 sm:col-span-2">
                        <span className="text-sm font-semibold text-[#8B6237]">Apartment / details</span>
                        <input
                          value={form.newAddressApartment}
                          onChange={(event) => setForm((current) => ({ ...current, newAddressApartment: event.target.value }))}
                          className="h-12 w-full rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm outline-none transition focus:border-[#F25D88]/40"
                          placeholder="Apartment, floor, entrance"
                        />
                      </label>
                      <label className="space-y-2 sm:col-span-2">
                        <span className="text-sm font-semibold text-[#8B6237]">Address note</span>
                        <textarea
                          value={form.newAddressNote}
                          onChange={(event) => setForm((current) => ({ ...current, newAddressNote: event.target.value }))}
                          className="min-h-28 w-full rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 py-3 text-sm outline-none transition focus:border-[#F25D88]/40"
                          placeholder="Any extra details for the courier"
                        />
                      </label>

                      <label className="flex items-center gap-3 rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 py-3 sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={form.saveNewAddress}
                          onChange={(event) => setForm((current) => ({ ...current, saveNewAddress: event.target.checked }))}
                        />
                        <span className="text-sm font-medium text-[#8B6237]">Save this address to my account</span>
                      </label>

                      {form.saveNewAddress ? (
                        <label className="flex items-center gap-3 rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 py-3 sm:col-span-2">
                          <input
                            type="checkbox"
                            checked={form.makeDefaultAddress}
                            onChange={(event) => setForm((current) => ({ ...current, makeDefaultAddress: event.target.checked }))}
                          />
                          <span className="text-sm font-medium text-[#8B6237]">Make it my default address</span>
                        </label>
                      ) : null}
                    </div>
                    </div>
                  ) : null}
                </section>

                <section className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-[0_12px_36px_rgba(175,117,60,0.08)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1F5] text-[#F25D88]">
                      <HiMiniTruck className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69B71]">Schedule</p>
                      <h2 className="text-2xl font-bold">Delivery preferences</h2>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-[#8B6237]">Delivery date</span>
                      <div className="flex h-12 items-center rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4">
                        <HiMiniCalendarDays className="mr-3 h-5 w-5 text-[#C69B71]" />
                        <input
                          type="date"
                          min={minDate}
                          value={form.deliveryDate}
                          onChange={(event) => setForm((current) => ({ ...current, deliveryDate: event.target.value }))}
                          className="w-full bg-transparent text-sm outline-none"
                        />
                      </div>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-[#8B6237]">Delivery time</span>
                      <div className="flex h-12 items-center rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4">
                        <HiMiniClock className="mr-3 h-5 w-5 text-[#C69B71]" />
                        <input
                          type="time"
                          value={form.deliveryTime}
                          onChange={(event) => setForm((current) => ({ ...current, deliveryTime: event.target.value }))}
                          className="w-full bg-transparent text-sm outline-none"
                        />
                      </div>
                    </label>
                    <label className="space-y-2 sm:col-span-2">
                      <span className="text-sm font-semibold text-[#8B6237]">Order note</span>
                      <textarea
                        value={form.note}
                        onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                        className="min-h-28 w-full rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 py-3 text-sm outline-none transition focus:border-[#F25D88]/40"
                        placeholder="Candles, call on arrival, less sweet, or anything else"
                      />
                    </label>
                  </div>
                </section>
              </div>

              <aside className="space-y-6">
                <section className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-[0_12px_36px_rgba(175,117,60,0.08)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1F5] text-[#F25D88]">
                      <HiMiniCreditCard className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69B71]">Payment</p>
                      <h2 className="text-2xl font-bold">Choose a method</h2>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {([
                      {
                        id: "cash" as const,
                        title: "Cash on delivery",
                        description: "Pay the courier when your order arrives.",
                      },
                      {
                        id: "card" as const,
                        title: "Card on delivery",
                        description: "We will mark it as paid once the order is submitted.",
                      },
                    ]).map((option) => {
                      const isActive = form.paymentMethod === option.id;

                      return (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => setForm((current) => ({ ...current, paymentMethod: option.id }))}
                          className={`rounded-[24px] border p-4 text-left transition ${
                            isActive
                              ? "border-[#F7A7BB] bg-[#FFF5F7] shadow-[0_10px_24px_rgba(242,93,136,0.08)]"
                              : "border-[#F2DEC8] bg-[#FFF9F1]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-[#6B3E06]">{option.title}</p>
                              <p className="mt-1 text-sm text-[#9A6E42]">{option.description}</p>
                            </div>
                            {isActive ? <HiMiniCheckCircle className="h-6 w-6 text-[#F25D88]" /> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-[0_12px_36px_rgba(175,117,60,0.08)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1F5] text-[#F25D88]">
                      <HiMiniShoppingBag className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69B71]">Summary</p>
                      <h2 className="text-2xl font-bold">Final review</h2>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {summaryItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-[22px] bg-[#FFF9F4] p-3">
                        <img
                          src={item.image_url ?? ""}
                          alt={item.name}
                          className="h-16 w-16 rounded-[18px] object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#6B3E06]">{item.name}</p>
                          <p className="text-xs text-[#9A6E42]">Qty {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-[#F25D88]">{formatMoney(item.lineTotal)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[24px] border border-[#F7DDE4] bg-[linear-gradient(135deg,rgba(255,243,246,0.95),rgba(255,250,244,0.98))] p-4">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#F25D88] shadow-sm">
                        <HiMiniSparkles className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C69B71]">Available coupons</p>
                        <h3 className="mt-1 text-lg font-bold text-[#6B3E06]">Use an active offer at checkout</h3>
                        <p className="mt-1 text-sm text-[#9A6E42]">
                          Type or paste a coupon code, then press Accept to apply it.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        value={couponInput}
                        onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="h-12 flex-1 rounded-2xl border border-[#F2DEC8] bg-white/90 px-4 text-sm font-semibold uppercase tracking-[0.08em] text-[#6B3E06] outline-none transition focus:border-[#F25D88]/40"
                      />
                      <button
                        type="button"
                        onClick={applyCouponFromInput}
                        className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(242,93,136,0.20)] transition hover:-translate-y-0.5"
                      >
                        Accept
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {couponsQuery.isLoading ? (
                        <div className="rounded-[20px] bg-white/80 px-4 py-5 text-center text-sm font-medium text-[#B1845D]">
                          Loading coupons...
                        </div>
                      ) : activeCoupons.length ? (
                        activeCoupons.slice(0, 2).map((coupon) => {
                          const eligible = subtotal >= Number(coupon.minimum_order);
                          const isApplied = appliedCouponCode === coupon.code;
                          return (
                            <div key={coupon.id} className="rounded-[20px] bg-white/85 p-3 shadow-[0_8px_24px_rgba(175,117,60,0.06)]">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-black tracking-[0.08em] text-[#F25D88]">{coupon.code}</p>
                                  <p className="mt-1 text-sm font-semibold text-[#6B3E06]">{getCouponLabel(coupon)}</p>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                                    eligible ? "bg-[#EAF8E8] text-[#57A45A]" : "bg-[#FFF0F4] text-[#F25D88]"
                                  }`}
                                >
                                  {eligible ? "Eligible" : `Min ${formatMoney(coupon.minimum_order)}`}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-[#9A6E42]">
                                Valid until {formatDate(coupon.end_date)}.
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCouponInput(coupon.code);
                                  }}
                                  className={`inline-flex h-10 items-center justify-center rounded-2xl px-4 text-xs font-bold transition ${
                                    couponInput === coupon.code
                                      ? "bg-[#FFF0F4] text-[#F25D88]"
                                      : "border border-[#F2DEC8] bg-white text-[#8B6237]"
                                  }`}
                                >
                                  {couponInput === coupon.code ? "Selected" : "Use this code"}
                                </button>
                                {isApplied ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAppliedCouponCode("");
                                      setCouponInput("");
                                      toast.info(`${coupon.code} removed`);
                                    }}
                                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-[#F2DEC8] bg-white px-4 text-xs font-bold text-[#8B6237] transition"
                                  >
                                    Remove
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-[20px] bg-white/80 px-4 py-5 text-center text-sm font-medium text-[#B1845D]">
                          No active coupons available right now.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 space-y-3 rounded-[24px] border border-[#F2DEC8] bg-[#FFF9F1] p-4">
                    <div className="flex items-center justify-between text-sm text-[#9A6E42]">
                      <span>Items ({itemCount})</span>
                      <span>{formatMoney(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-[#9A6E42]">
                      <span>Delivery</span>
                      <span>{formatMoney(deliveryPrice)}</span>
                    </div>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between text-sm text-[#57A45A]">
                        <span>
                          Coupon {appliedCoupon.code}
                          <span className="ml-2 text-[#9A6E42]">({getCouponLabel(appliedCoupon)})</span>
                        </span>
                        <span>-{formatMoney(couponDiscount)}</span>
                      </div>
                    ) : null}
                    <div className="h-px bg-[#F0DFCF]" />
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">Total</span>
                      <span className="text-3xl font-black text-[#F25D88]">{formatMoney(total)}</span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] bg-[#FFF6F8] p-4 text-sm leading-7 text-[#9A6E42]">
                    <div className="flex items-start gap-3">
                      <HiMiniSparkles className="mt-1 h-5 w-5 shrink-0 text-[#F25D88]" />
                      <p>
                        {form.addressMode === "saved" && selectedAddress
                          ? `Delivering to: ${buildAddressLabel(selectedAddress)}`
                          : form.addressMode === "new" && isAddressValid
                            ? `Delivering to: ${buildNewAddressLabel(form)}`
                            : "Add your address to see the final delivery destination here."}
                      </p>
                    </div>
                    {form.deliveryDate ? (
                      <p className="mt-2 text-xs text-[#B7875E]">
                        Preferred date: {formatDate(form.deliveryDate, form.deliveryDate)}
                        {form.deliveryTime ? ` at ${form.deliveryTime}` : ""}
                      </p>
                    ) : null}
                    {appliedCoupon ? (
                      <p className="mt-2 text-xs font-semibold text-[#57A45A]">
                        Applied coupon: {appliedCoupon.code}. You saved {formatMoney(couponDiscount)}.
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={createOrderMutation.isPending || createAddressMutation.isPending || items.length === 0}
                    className="mt-5 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#FF7E9F] to-[#F25D88] px-8 text-base font-semibold text-white shadow-[0_14px_28px_rgba(242,93,136,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(242,93,136,0.30)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <HiMiniShoppingBag className="h-5 w-5" />
                    {createOrderMutation.isPending || createAddressMutation.isPending ? "Placing order..." : "Place order"}
                  </button>

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[#B7875E]">
                    <Link to="/cart" className="font-semibold text-[#8B6237] transition hover:text-[#F25D88]">
                      Back to cart
                    </Link>
                    <span>Sweet treats are packed with love.</span>
                  </div>
                </section>
              </aside>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
