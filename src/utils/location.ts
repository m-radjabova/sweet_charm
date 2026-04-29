export type Coordinates = {
  lat: number;
  lng: number;
};

export function formatDistance(distanceKm?: number | null) {
  if (distanceKm == null) return "Masofa yo'q";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export async function getBrowserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Brauzer geolokatsiyani qo'llab-quvvatlamaydi"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => reject(new Error("Lokatsiyaga ruxsat berilmadi")),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  });
}

export async function reverseGeocode(coords: Coordinates): Promise<string | null> {
  const search = new URLSearchParams({
    format: "jsonv2",
    lat: String(coords.lat),
    lon: String(coords.lng),
    zoom: "16",
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${search.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { display_name?: string };
  return data.display_name ?? null;
}
