export type Coordinates = {
  lat: number;
  lng: number;
};

type BrowserLocationMessages = {
  unsupported: string;
  insecureContext: string;
  permissionDenied: string;
  unavailable: string;
  timeout: string;
  unknown: string;
};

const defaultLocationMessages: BrowserLocationMessages = {
  unsupported: "Brauzer geolokatsiyani qo'llab-quvvatlamaydi",
  insecureContext:
    "Joylashuv faqat HTTPS yoki localhost orqali ishlaydi. Telefoningizda sayt http://IP:port bilan ochilgan bo'lsa, HTTPS orqali oching.",
  permissionDenied: "Lokatsiyaga ruxsat berilmadi",
  unavailable: "Joylashuv ma'lumoti hozircha topilmadi",
  timeout: "Joylashuvni aniqlash vaqti tugadi",
  unknown: "Joylashuvni aniqlab bo'lmadi",
};

export function formatDistance(distanceKm?: number | null) {
  if (distanceKm == null) return "Masofa yo'q";
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export async function getBrowserLocation(
  messages: Partial<BrowserLocationMessages> = {},
): Promise<Coordinates> {
  const locationMessages = { ...defaultLocationMessages, ...messages };

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error(locationMessages.unsupported));
      return;
    }

    if (!window.isSecureContext) {
      reject(new Error(locationMessages.insecureContext));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error(locationMessages.permissionDenied));
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          reject(new Error(locationMessages.unavailable));
          return;
        }

        if (error.code === error.TIMEOUT) {
          reject(new Error(locationMessages.timeout));
          return;
        }

        reject(new Error(locationMessages.unknown));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
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
