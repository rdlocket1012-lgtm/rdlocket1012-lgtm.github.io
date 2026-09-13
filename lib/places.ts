/**
 * Google Places API (New) helpers.
 * Key is read from EXPO_PUBLIC_GOOGLE_PLACES_KEY — injected at build/OTA time
 * via the EXPO_PUBLIC_ prefix which Expo exposes to JS automatically.
 *
 * Calls made:
 *  1. Nearby Search  → resolves (lat,lng) to the closest place_id + display name
 *  2. Place Details  → address, website, first photo reference
 *  3. Photo          → resolved to a CDN URL (no extra call; URL is deterministic)
 */

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ?? '';

const BASE = 'https://places.googleapis.com/v1';

export interface PlacesEnrichment {
  place_id: string;
  name: string;        // Official display name, e.g. "Eiffel Tower"
  address: string | null;
  website: string | null;
  photo_url: string | null;
}

/**
 * Given a coordinate, returns enrichment data from Google Places.
 * Returns null if the API key is missing, the network is unavailable,
 * or no suitable place is found nearby.
 */
export async function enrichFromCoords(
  latitude: number,
  longitude: number,
): Promise<PlacesEnrichment | null> {
  if (!API_KEY) return null;

  try {
    // ── Step 1: Nearby Search (New API) ────────────────────────────────────
    const nearbyRes = await fetch(`${BASE}/places:searchNearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        // Only request fields we actually use (minimises billing SKU)
        'X-Goog-FieldMask': 'places.id,places.displayName,places.types',
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: 100, // metres — tight enough to find the tapped spot
          },
        },
        maxResultCount: 1,
        // Prefer points of interest over generic addresses
        includedTypes: [
          'tourist_attraction',
          'restaurant',
          'cafe',
          'bar',
          'lodging',
          'park',
          'museum',
          'night_club',
          'shopping_mall',
          'store',
          'establishment',
        ],
        rankPreference: 'DISTANCE',
      }),
    });

    if (!nearbyRes.ok) return null;
    const nearbyData = await nearbyRes.json();
    const place = nearbyData.places?.[0];
    if (!place?.id) return null;

    const placeId: string = place.id;
    const displayName: string = place.displayName?.text ?? '';

    // ── Step 2: Place Details ───────────────────────────────────────────────
    const detailRes = await fetch(
      `${BASE}/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask':
            'formattedAddress,websiteUri,photos',
        },
      },
    );

    if (!detailRes.ok) {
      // Return what we got from nearby search — better than nothing
      return { place_id: placeId, name: displayName, address: null, website: null, photo_url: null };
    }

    const detail = await detailRes.json();

    // ── Step 3: Photo URL (deterministic, no extra request) ─────────────────
    const photoName: string | undefined = detail.photos?.[0]?.name;
    const photo_url = photoName
      ? `${BASE}/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${API_KEY}&skipHttpRedirect=true`
      : null;

    return {
      place_id: placeId,
      name: displayName,
      address: detail.formattedAddress ?? null,
      website: detail.websiteUri ?? null,
      photo_url,
    };
  } catch {
    // Network error or JSON parse failure — degrade gracefully
    return null;
  }
}
