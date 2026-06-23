import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { toast } from "react-toastify";
import { HiMiniMapPin, HiMiniPlus, HiMiniTrash, HiMiniMagnifyingGlass, HiMiniCheck } from "react-icons/hi2";
import {
  createMyAddress,
  deleteMyAddress,
  getMyAddresses,
  updateMyAddress,
  type AccountAddress,
  type AccountAddressPayload,
} from "../../../api/account";
import { getErrorMessage } from "../../../api/auth";
import SectionHeader from "./SectionHeader";

const DEFAULT_CENTER: [number, number] = [69.2401, 41.2995];

interface AddressFormState {
  id?: string;
  title: string;
  city: string;
  street: string;
  apartment: string;
  note: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

const emptyForm: AddressFormState = {
  title: "",
  city: "",
  street: "",
  apartment: "",
  note: "",
  latitude: null,
  longitude: null,
  is_default: false,
};

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

function toForm(address: AccountAddress): AddressFormState {
  return {
    id: address.id,
    title: address.title,
    city: address.city,
    street: address.street,
    apartment: address.apartment ?? "",
    note: address.note ?? "",
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
    is_default: address.is_default,
  };
}

function toPayload(form: AddressFormState): AccountAddressPayload {
  return {
    title: form.title.trim(),
    city: form.city.trim(),
    street: form.street.trim(),
    apartment: form.apartment.trim() || null,
    note: form.note.trim() || null,
    latitude: form.latitude,
    longitude: form.longitude,
    is_default: form.is_default,
  };
}

export default function AddressBookPanel() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AddressFormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);

  const addressesQuery = useQuery({ queryKey: ["my-addresses"], queryFn: getMyAddresses });
  const addresses = addressesQuery.data ?? [];

  const refreshAddresses = async () => {
    await queryClient.invalidateQueries({ queryKey: ["my-addresses"] });
  };

  const createMutation = useMutation({
    mutationFn: createMyAddress,
    onSuccess: async () => {
      toast.success("Address saved");
      setForm(emptyForm);
      await refreshAddresses();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Address could not be saved")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AccountAddressPayload> }) => updateMyAddress(id, payload),
    onSuccess: async () => {
      toast.success("Address updated");
      setForm(emptyForm);
      await refreshAddresses();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Address could not be updated")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMyAddress,
    onSuccess: async () => {
      toast.success("Address deleted");
      await refreshAddresses();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Address could not be deleted")),
  });

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
      setForm((current) => ({ ...current, latitude: lat, longitude: lng }));
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
    if (!mapRef.current || form.latitude === null || form.longitude === null) return;
    const lngLat: [number, number] = [form.longitude, form.latitude];
    markerRef.current?.remove();
    markerRef.current = new maplibregl.Marker({ color: "#F25D88" }).setLngLat(lngLat).addTo(mapRef.current);
    mapRef.current.flyTo({ center: lngLat, zoom: 15, essential: true });
  }, [form.latitude, form.longitude]);

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
      city: result.address?.city ?? result.address?.town ?? result.address?.village ?? current.city,
      street: result.address?.road ?? result.address?.neighbourhood ?? result.display_name,
      latitude: lat,
      longitude: lon,
    }));
    setResults([]);
    setSearch(result.display_name);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = toPayload(form);
    if (!payload.title || !payload.city || !payload.street) {
      toast.error("Title, city and street are required");
      return;
    }
    if (form.id) {
      updateMutation.mutate({ id: form.id, payload });
      return;
    }
    createMutation.mutate(payload);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
      {/* Addresses Form */}
      <section className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_8px_32px_rgba(175,117,60,0.08)]">
        <SectionHeader
          icon={<HiMiniMapPin className="h-4 w-4" />}
          title="Addresses"
          subtitle="Manage your delivery locations"
        />

        <form className="space-y-3.5" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="h-12 rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)] placeholder:text-[#C9A67E]"
              placeholder="Title (e.g. Home)"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            <input
              className="h-12 rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)] placeholder:text-[#C9A67E]"
              placeholder="City"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            />
          </div>
          <input
            className="h-12 w-full rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)] placeholder:text-[#C9A67E]"
            placeholder="Street"
            value={form.street}
            onChange={(event) => setForm((current) => ({ ...current, street: event.target.value }))}
          />
          <input
            className="h-12 w-full rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)] placeholder:text-[#C9A67E]"
            placeholder="Apartment / Suite"
            value={form.apartment}
            onChange={(event) => setForm((current) => ({ ...current, apartment: event.target.value }))}
          />
          <textarea
            className="w-full rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] px-4 py-3 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)] placeholder:text-[#C9A67E]"
            rows={3}
            placeholder="Delivery note (optional)"
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
          />

          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#FFF9F1] px-4 py-3 text-sm font-semibold text-[#7F5B30] transition-all duration-200 hover:bg-[#FFF5EB]">
            <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 ${
              form.is_default ? "border-[#F25D88] bg-[#F25D88]" : "border-[#F2DEC8] bg-white"
            }`}>
              {form.is_default && <HiMiniCheck className="h-3 w-3 text-white" />}
            </div>
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(event) => setForm((current) => ({ ...current, is_default: event.target.checked }))}
              className="hidden"
            />
            Make default address
          </label>

          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#FF89AA] to-[#F45C87] px-5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <HiMiniPlus className="h-4 w-4" />
                {form.id ? "Update Address" : "Save Address"}
              </>
            )}
          </button>
        </form>

        {/* Saved Addresses */}
        <div className="mt-6 space-y-3">
          {addressesQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-2xl bg-[#FFF8F0] p-8 text-sm text-[#B7885D]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#F25D88] border-t-transparent mr-2" />
              Loading addresses...
            </div>
          ) : null}
          {addresses.map((address) => (
            <article
              key={address.id}
              className="group rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] p-4 transition-all duration-200 hover:border-[#F25D88]/30 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <button type="button" onClick={() => setForm(toForm(address))} className="text-left flex-1">
                  <p className="text-sm font-bold text-[#6C410C]">
                    {address.title}
                    {address.is_default ? (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-[#FFE8EF] px-2 py-0.5 text-[10px] font-semibold text-[#F25D88]">
                        <HiMiniCheck className="h-3 w-3" />
                        Default
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-[#9A6E42]">
                    {address.city}, {address.street}
                    {address.apartment ? `, ${address.apartment}` : ""}
                  </p>
                  {address.note ? (
                    <p className="mt-1 text-xs text-[#B7885D] italic">Note: {address.note}</p>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(address.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#C28564] transition-all duration-200 hover:bg-[#FFE5EC] hover:text-[#F25D88]"
                >
                  <HiMiniTrash className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_8px_32px_rgba(175,117,60,0.08)]">
        <div className="mb-4 flex gap-3">
          <div className="group relative flex-1">
            <HiMiniMagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A67E] transition-colors group-focus-within:text-[#F25D88]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") void searchAddress(); }}
              placeholder="Search location..."
              className="h-12 w-full rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] pl-10 pr-4 text-sm text-[#6F420B] outline-none transition-all duration-200 focus:border-[#F25D88]/40 focus:shadow-[0_0_0_3px_rgba(242,93,136,0.08)] placeholder:text-[#C9A67E]"
            />
          </div>
          <button
            type="button"
            onClick={() => void searchAddress()}
            disabled={searching}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-br from-[#FF89AA] to-[#F45C87] px-5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
          >
            {searching ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Search"
            )}
          </button>
        </div>

        {results.length > 0 ? (
          <div className="mb-4 max-h-44 overflow-auto rounded-xl border border-[#F2DEC8] bg-[#FFF9F1] p-2 shadow-sm">
            {results.map((result) => (
              <button
                key={`${result.lat}-${result.lon}-${result.display_name}`}
                type="button"
                onClick={() => pickResult(result)}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#7F5B30] transition-all duration-200 hover:bg-white hover:shadow-sm"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        ) : null}

        <div
          ref={mapContainerRef}
          className="h-[480px] overflow-hidden rounded-2xl border border-[#F2DEC8] bg-[#FFF9F1] shadow-inner"
        />
        <div className="mt-3 flex items-center gap-2 text-sm text-[#9A6E42]">
          <HiMiniMapPin className="h-4 w-4 text-[#F25D88]" />
          {form.latitude && form.longitude
            ? `${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}`
            : "Click the map or search an address"}
        </div>
      </section>
    </div>
  );
}