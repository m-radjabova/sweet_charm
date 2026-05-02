import { type MouseEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Menu, MenuItem } from "@mui/material";
import {
  HiMiniMapPin,
  HiMiniMagnifyingGlass,
  HiMiniXMark,
  HiOutlineChevronRight,
  HiOutlineScissors,
} from "react-icons/hi2";
import { listPublicBarbers } from "../../api/bookings";
import { getErrorMessage } from "../../api/auth";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import useContextPro from "../../hooks/useContextPro";
import i18n from "../../i18n";
import { getDefaultRouteForRole, getUserRoleLabel } from "../../utils/roles";
import { formatDistance, getBrowserLocation, type Coordinates } from "../../utils/location";
import { showLocationErrorToast } from "../../utils/locationToast";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function HeaderProfileLink({
  fullName,
  avatar,
  roleLabel,
  onClick,
}: {
  fullName: string;
  avatar?: string | null;
  roleLabel: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ borderRadius: "20px" }}
      className="flex items-center gap-2 bg-white px-2 py-1.5 pr-3 text-left shadow-sm transition hover:bg-slate-50 sm:gap-3 sm:py-2 sm:pr-4"
    >
      {avatar ? (
        <img
          src={avatar}
          alt={fullName}
          className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 sm:h-11 sm:w-11"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white sm:h-11 sm:w-11">
          {getInitials(fullName)}
        </div>
      )}

      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-black text-slate-950">{fullName}</p>
        <p className="truncate text-xs font-medium text-slate-500">
          {roleLabel}
        </p>
      </div>

      <HiOutlineChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}

function formatMoney(value?: number | null) {
  if (value == null) return i18n.t("common.priceUnavailable");
  return `${value.toLocaleString("ru-RU")} ${i18n.t("common.currency")}`;
}

function formatWorkingHours(start?: string | null, end?: string | null) {
  if (!start || !end) return i18n.t("common.scheduleUnavailable");
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

function BarberCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[28px] bg-white shadow-lg">
      <div className="h-48 bg-slate-200 sm:h-56" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="h-6 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-[70px] rounded-2xl bg-slate-100 sm:h-[78px]" />
          <div className="h-[70px] rounded-2xl bg-slate-100 sm:h-[78px]" />
          <div className="h-[70px] rounded-2xl bg-slate-100 sm:h-[78px]" />
        </div>
        <div className="h-[60px] rounded-[24px] bg-slate-100 sm:h-[70px]" />
        <div className="h-10 rounded-2xl bg-slate-200 sm:h-12" />
      </div>
    </div>
  );
}

function EmptyBarbersState({
  hasLocationFilter,
  onReset,
}: {
  hasLocationFilter: boolean;
  onReset: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:rounded-[36px] sm:p-8 sm:shadow-[0_30px_80px_rgba(15,23,42,0.08)] md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.08),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.04),_transparent_40%)]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl sm:h-20 sm:w-20 sm:rounded-[28px]">
          {hasLocationFilter ? (
            <HiMiniMapPin className="h-7 w-7 sm:h-9 sm:w-9" />
          ) : (
            <HiMiniMagnifyingGlass className="h-7 w-7 sm:h-9 sm:w-9" />
          )}
        </div>

        <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:mt-6 sm:text-3xl md:text-4xl">
          {hasLocationFilter ? t("home.emptyNearTitle") : t("home.emptyDefaultTitle")}
        </h3>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:mt-3 sm:text-base">
          {hasLocationFilter
            ? t("home.emptyNearText")
            : t("home.emptyDefaultText")}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:mt-8 sm:gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:h-12 sm:rounded-2xl sm:px-6"
          >
            {t("home.clearFilter")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchLocation, setSearchLocation] = useState<Coordinates | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "distance" | "price_asc" | "price_desc">("default");
  const [detectingLocation, setDetectingLocation] = useState(false);

  const {
    state: { user },
    logout,
  } = useContextPro();

  const barbersQuery = useQuery({
    queryKey: ["public-barbers", searchLocation?.lat ?? null, searchLocation?.lng ?? null, sortBy],
    queryFn: () =>
      listPublicBarbers({
        lat: searchLocation?.lat,
        lng: searchLocation?.lng,
        sort_by: sortBy === "default" ? undefined : sortBy,
      }),
  });

  const barbers = useMemo(() => {
    return (barbersQuery.data ?? []).map((barber) => ({
      ...barber,
      specialty: barber.specialty?.trim() || t("home.professionalBarber"),
    }));
  }, [barbersQuery.data, t]);

  const isLoading = barbersQuery.isLoading;
  const isLoggedIn = Boolean(user?.role);
  const profileRoute = getDefaultRouteForRole(user);
  const isMenuOpen = Boolean(menuAnchor);

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleGoToProfile = () => {
    handleCloseMenu();
    navigate(profileRoute);
  };

  const handleLogout = async () => {
    handleCloseMenu();
    await logout();
  };

  const handleSortChange = async (nextSort: "default" | "distance" | "price_asc" | "price_desc") => {
    if (nextSort === "distance") {
      try {
        setDetectingLocation(true);
        const coords = await getBrowserLocation();
        setSearchLocation(coords);
        setSortBy("distance");
      } catch (error) {
        showLocationErrorToast(getErrorMessage(error, t("home.locationError")));
        setSearchLocation(null);
        setSortBy("default");
      } finally {
        setDetectingLocation(false);
      }
      return;
    }

    if (sortBy === "distance") {
      setSearchLocation(null);
    }

    setSortBy(nextSort);
  };

  const handleResetFilters = () => {
    setSearchLocation(null);
    setSortBy("default");
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
          {/* Logo */}
          <Link to="/" className="group flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg transition group-hover:scale-105 sm:h-12 sm:w-12 sm:rounded-2xl">
              <HiOutlineScissors className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-950 sm:text-sm">
                {t("brand.name")}
              </p>
              <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
                {t("home.brandSubtitle")}
              </p>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            {isLoggedIn ? (
              <>
                <HeaderProfileLink
                  fullName={user?.full_name ?? t("home.myAccount")}
                  avatar={user?.avatar}
                  roleLabel={getUserRoleLabel(user)}
                  onClick={handleOpenMenu}
                />

                <Menu
                  anchorEl={menuAnchor}
                  open={isMenuOpen}
                  onClose={handleCloseMenu}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        mt: 1.25,
                        minWidth: 180,
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        boxShadow: "0 24px 60px rgba(15,23,42,0.16)",
                        overflow: "hidden",
                      },
                    },
                  }}
                >
                  <MenuItem onClick={handleGoToProfile}>
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-sm font-bold">
                        {t("home.myAccount")}
                      </span>
                      <HiOutlineChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </MenuItem>

                  <MenuItem onClick={() => void handleLogout()}>
                    <div className="flex w-full items-center justify-between gap-4 text-red-600">
                      <span className="text-sm font-bold">
                        {t("home.signOut")}
                      </span>
                      <HiOutlineChevronRight className="h-4 w-4 text-red-400" />
                    </div>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 sm:px-5 sm:py-2.5"
              >
                Ro'yxatdan o'tish
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <section>
<div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
  {/* Chap tomon: Sarlavha va tavsif */}
  <div className="space-y-3">
    <h1 className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl md:text-6xl">
      {t("home.ourBarbers")}
    </h1>
    <p className="max-w-xl text-base text-slate-500 sm:text-lg">
      {t("home.chooseExpert")}
    </p>
  </div>

  {/* O‘ng tomon: Filtr va saralash */}
  <div className="w-full lg:w-auto lg:min-w-[380px]">
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-all hover:shadow-2xl">
      
      {/* Reset button */}
      {(sortBy !== "default" || searchLocation) && (
        <button
          type="button"
          onClick={handleResetFilters}
          aria-label={t("home.clearFiltersAria")}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-400 backdrop-blur-sm transition-all hover:bg-red-50 hover:text-red-500 hover:shadow-md"
        >
          <HiMiniXMark className="h-4 w-4" />
          <span className="sr-only">{t("home.clearFiltersAria")}</span>
        </button>
      )}

      {/* Asosiy filtr tugmalari */}
      <div className="bg-gradient-to-br from-slate-50/50 to-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t("home.sortLabel")}
          </span>
          {detectingLocation && (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium text-emerald-600">
                {t("home.detectingLocation")}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Eng yaqin */}
          <button
            onClick={() => void handleSortChange("distance")}
            disabled={detectingLocation}
            className={`group relative overflow-hidden rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all duration-300 ${
              sortBy === "distance"
                ? "bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-800/20"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 hover:shadow-md hover:ring-slate-300"
            } ${detectingLocation ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="rounded-full bg-white/10 p-1.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                {sortBy === "distance" ? (
                  <HiMiniMapPin className="h-5 w-5" />
                ) : (
                  <HiMiniMapPin className="h-5 w-5" />
                )}
              </div>
              <span className="leading-tight">{t("home.nearest")}</span>
            </div>
            {sortBy === "distance" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500"></div>
            )}
          </button>

          {/* Eng arzon */}
          <button
            onClick={() => void handleSortChange("price_asc")}
            className={`group relative overflow-hidden rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all duration-300 ${
              sortBy === "price_asc"
                ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 hover:shadow-md hover:ring-slate-300"
            }`}
          >
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="rounded-full bg-white/10 p-1.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                {sortBy === "price_asc" ? (
                  <span className="text-base">💰</span>
                ) : (
                  <span className="text-base">$</span>
                )}
              </div>
              <span className="leading-tight">{t("home.cheapest")}</span>
            </div>
            {sortBy === "price_asc" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
            )}
          </button>

          {/* Eng qimmat */}
          <button
            onClick={() => void handleSortChange("price_desc")}
            className={`group relative overflow-hidden rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all duration-300 ${
              sortBy === "price_desc"
                ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 hover:shadow-md hover:ring-slate-300"
            }`}
          >
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className="rounded-full bg-white/10 p-1.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                {sortBy === "price_desc" ? (
                  <span className="text-base">🏆</span>
                ) : (
                  <span className="text-base">📈</span>
                )}
              </div>
              <span className="leading-tight">{t("home.expensive")}</span>
            </div>
            {sortBy === "price_desc" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
            )}
          </button>
        </div>

        {/* Aktiv filtrlar ko'rsatkichi */}
        {(sortBy !== "default" || searchLocation) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-400">{t("home.activeFilter")}</span>
            {sortBy !== "default" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {sortBy === "distance" && <HiMiniMapPin className="h-3 w-3" />}
                {sortBy === "price_asc" && <span>$</span>}
                {sortBy === "price_desc" && <span>🏆</span>}
                {sortBy === "distance" && t("home.nearest")}
                {sortBy === "price_asc" && t("home.cheapest")}
                {sortBy === "price_desc" && t("home.expensive")}
              </span>
            )}
            {searchLocation && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                <HiMiniMapPin className="h-3 w-3" />
                {`${searchLocation.lat.toFixed(4)}, ${searchLocation.lng.toFixed(4)}`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
</div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <BarberCardSkeleton key={item} />
              ))}
            </div>
          ) : barbers.length === 0 ? (
            <EmptyBarbersState
              hasLocationFilter={Boolean(searchLocation)}
              onReset={handleResetFilters}
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {barbers.map((barber) => (
                <article
                  key={barber.id}
                  className="group relative h-[420px] overflow-hidden rounded-2xl bg-black shadow-lg transition-shadow hover:shadow-xl sm:h-[460px] sm:rounded-[32px] sm:shadow-[0_25px_80px_rgba(0,0,0,0.4)]"
                >
                  {/* Image - full cover */}
                  <img
                    src={barber.avatar ?? undefined}
                    alt={barber.full_name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Top icon */}
                  <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-lg sm:left-5 sm:top-5 sm:h-11 sm:w-11">
                    <HiOutlineScissors className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                  </div>

                  {/* Rating badge */}
                  <div className="absolute right-4 top-4 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-md sm:right-5 sm:top-5 sm:px-3 sm:py-1 sm:text-sm">
                    ⭐ {barber.average_rating?.toFixed(1) || "5.0"}
                  </div>

                  {/* Bottom card - slides up on hover */}
                  <div className="absolute inset-x-3 bottom-3 translate-y-[60px] transition-all duration-500 ease-out group-hover:translate-y-0 sm:inset-x-4 sm:bottom-4 sm:translate-y-[70px]">
                    <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur-xl sm:rounded-2xl sm:p-4">
                      {/* Name */}
                      <h2 className="text-lg font-black leading-tight sm:text-2xl">
                        {barber.full_name}
                      </h2>

                      {/* Specialty */}
                      <p className="mt-0.5 text-xs text-white/70 sm:mt-1 sm:text-sm">
                        {barber.specialty}
                      </p>

                      {/* Info grid */}
                      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] sm:mt-4 sm:gap-2 sm:text-xs">
                        <div className="rounded-lg bg-white/10 p-1.5 text-center backdrop-blur sm:rounded-xl sm:p-2">
                          <p className="text-white/50">{t("home.scheduleLabel")}</p>
                          <p className="font-bold leading-tight">
                            {formatWorkingHours(
                              barber.work_start_time,
                              barber.work_end_time,
                            )}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white/10 p-1.5 text-center backdrop-blur sm:rounded-xl sm:p-2">
                          <p className="text-white/50">{t("home.locationLabel")}</p>
                          <p className="line-clamp-1 font-bold leading-tight">
                            {barber.location_text || t("home.emptyDash")}
                          </p>
                        </div>

                        <div className="rounded-lg bg-white/10 p-1.5 text-center backdrop-blur sm:rounded-xl sm:p-2">
                          <p className="text-white/50">{t("home.priceLabel")}</p>
                          <p className="truncate font-bold text-amber-300 sm:whitespace-normal">
                            {formatMoney(barber.price_from)}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] sm:mt-3 sm:gap-2 sm:text-xs">
                        {barber.distance_km != null ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-0.5 font-bold text-emerald-200 sm:px-2.5 sm:py-1">
                            <HiMiniMapPin className="h-3 w-3" />
                            {formatDistance(barber.distance_km)}
                          </span>
                        ) : null}
                        {barber.services?.some((service) => service.discount_price != null) ? (
                          <span className="rounded-full bg-rose-400/20 px-2 py-0.5 font-bold text-rose-100 sm:px-2.5 sm:py-1">
                            {t("home.promotionAvailable")}
                          </span>
                        ) : null}
                      </div>

                      {/* Book button */}
                      <Link
                        to={`/book/${barber.id}`}
                        className="mt-3 flex h-9 items-center justify-center rounded-lg bg-white/20 text-xs font-bold text-white backdrop-blur-md transition hover:bg-amber-400 hover:text-black sm:mt-4 sm:h-11 sm:rounded-xl sm:text-sm"
                      >
                        {t("home.bookNow")}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
