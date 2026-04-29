import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { Coordinates } from "../utils/location";

import "leaflet/dist/leaflet.css";

const defaultCenter: Coordinates = { lat: 41.3111, lng: 69.2797 };

const emojiMarkerIcon = L.divIcon({
  html: '<div style="font-size: 28px; line-height: 1; filter: drop-shadow(0 6px 10px rgba(15, 23, 42, 0.25));">📍</div>',
  className: "emoji-map-marker",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function MapClickHandler({
  onChange,
}: {
  onChange: (coords: Coordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        lat: Number(event.latlng.lat.toFixed(6)),
        lng: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function RecenterMap({ center }: { center: Coordinates }) {
  const map = useMapEvents({});

  useEffect(() => {
    map.setView([center.lat, center.lng], Math.max(map.getZoom(), 14), {
      animate: true,
    });
  }, [center, map]);

  return null;
}

export default function LocationPickerMap({
  value,
  onChange,
  heightClassName = "h-72",
}: {
  value?: Coordinates | null;
  onChange: (coords: Coordinates) => void;
  heightClassName?: string;
}) {
  const center = value ?? defaultCenter;

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 ${heightClassName}`}>
      <MapContainer center={[center.lat, center.lng]} zoom={value ? 14 : 12} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onChange={onChange} />
        <RecenterMap center={center} />
        {value ? <Marker position={[value.lat, value.lng]} icon={emojiMarkerIcon} /> : null}
      </MapContainer>
    </div>
  );
}
