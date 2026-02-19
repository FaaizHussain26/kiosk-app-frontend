import { useEffect, useState } from "react";

const CACHE_KEY = "kiosk_location";
const FALLBACK =
  process.env.NEXT_PUBLIC_KIOSK_LOCATION || "Desert Botanical Garden";

interface NominatimAddress {
  tourism?: string;
  amenity?: string;
  building?: string;
  leisure?: string;
  shop?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  suburb?: string;
  neighbourhood?: string;
  road?: string;
}

/**
 * Auto-detect the kiosk's location via GPS + reverse geocoding (Nominatim).
 * The result is cached in sessionStorage so the API is only called once per
 * session. Falls back to NEXT_PUBLIC_KIOSK_LOCATION if geolocation fails.
 */
export function useKioskLocation(): string {
  const [location, setLocation] = useState<string>(() => {
    if (typeof window === "undefined") return FALLBACK;
    return sessionStorage.getItem(CACHE_KEY) || FALLBACK;
  });

  useEffect(() => {
    // Already resolved this session — skip
    if (sessionStorage.getItem(CACHE_KEY)) return;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url =
            `https://nominatim.openstreetmap.org/reverse?` +
            `lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`;

          const res = await fetch(url, {
            headers: { "User-Agent": "KioskApp/1.0" },
          });

          if (!res.ok) return;

          const data = await res.json();
          const addr: NominatimAddress = data.address || {};

          // Pick the most meaningful name: venue > neighbourhood > city
          const venue =
            addr.tourism || addr.amenity || addr.leisure || addr.building;
          const city = addr.city || addr.town || addr.village || "";
          const state = addr.state || "";

          let label: string;
          if (venue && city) {
            label = `${venue}, ${city}`;
          } else if (venue) {
            label = venue;
          } else if (city && state) {
            label = `${city}, ${state}`;
          } else if (city) {
            label = city;
          } else {
            label = FALLBACK;
          }

          sessionStorage.setItem(CACHE_KEY, label);
          setLocation(label);
        } catch {
          // Reverse-geocode failed — keep fallback
        }
      },
      () => {
        // Geolocation denied or unavailable — keep fallback
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 86_400_000 },
    );
  }, []);

  return location;
}
