// services/mapsService.js
//
// Uses the Geoapify Routing API.
// Docs: https://apidocs.geoapify.com/docs/routing/

const ROUTING_URL = 'https://api.geoapify.com/v1/routing';
const GEOCODE_URL = 'https://api.geoapify.com/v1/geocode/search';

// Office addresses are stable, so retaining their coordinates saves a complete
// provider request on every subsequent lookup. Routes are more volatile because
// they begin at a student's live location, so they use a much shorter lifetime.
const GEOCODE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const ROUTE_CACHE_TTL_MS = 90 * 1000;
const geocodeCache = new Map();
const routeCache = new Map();

function getCachedResult(cache, key, ttlMs, maxEntries, create) {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return cached.value;
  if (cached) cache.delete(key);

  // Remove expired entries first, then evict the oldest entry if the cache is
  // full. This keeps the process memory bounded even on a busy deployment.
  for (const [cachedKey, entry] of cache) {
    if (entry.expiresAt <= now) cache.delete(cachedKey);
  }
  if (cache.size >= maxEntries) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  // Store the promise immediately so simultaneous requests for the same map
  // data share one Geoapify call instead of racing duplicate calls.
  const value = Promise.resolve().then(create);
  cache.set(key, { value, expiresAt: now + ttlMs });
  value.catch(() => {
    if (cache.get(key)?.value === value) cache.delete(key);
  });
  return value;
}

function normalizedAddress(address) {
  return address.trim().replace(/\s+/g, ' ').toLowerCase();
}

function routeCacheKey(origin, destination, mode) {
  // Four decimal places is roughly 11 metres. It is precise enough for a
  // walking route while allowing repeated requests from a stationary student
  // to share a cached result despite small GPS jitter.
  const coordinate = ({ lat, lng }) => `${lat.toFixed(4)},${lng.toFixed(4)}`;
  return `${mode}:${coordinate(origin)}:${coordinate(destination)}`;
}

async function geocodeAddress(address) {
  const key = normalizedAddress(address);
  return getCachedResult(geocodeCache, key, GEOCODE_CACHE_TTL_MS, 500, async () => {
    const params = new URLSearchParams({
      text: address,
      apiKey: process.env.GEOAPIFY_API_KEY,
    });

    const response = await fetch(`${GEOCODE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error(`Geoapify geocode error (${response.status})`);

    const data = await response.json();
    const feature = data.features?.[0];
    if (!feature) throw new Error(`Geoapify geocode found no results for: ${address}`);

    const [lng, lat] = feature.geometry.coordinates;
    return {
      lat,
      lng,
      formattedAddress: feature.properties?.formatted ?? address,
    };
  });
}

/**
 * Get a route between two coordinates for the selected travel mode.
 *
 * @param {{ lat: number, lng: number }} origin - student's live location
 * @param {{ lat: number, lng: number }} destination
 * @param {'walk' | 'bicycle' | 'drive' | 'approximated_transit'} mode
 * @returns {Promise<{ minutes: number, distanceText: string, steps: Array }>}
 */
async function getRoute(origin, destination, mode = 'walk') {
  const key = routeCacheKey(origin, destination, mode);
  return getCachedResult(routeCache, key, ROUTE_CACHE_TTL_MS, 1000, async () => {
    const params = new URLSearchParams({
      waypoints: `${origin.lat},${origin.lng}|${destination.lat},${destination.lng}`,
      mode,
      apiKey: process.env.GEOAPIFY_API_KEY,
    });

    const response = await fetch(`${ROUTING_URL}?${params.toString()}`);
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Geoapify Routing API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const feature = data.features?.[0];
    if (!feature) throw new Error('Geoapify Routing returned no route');

    const props = feature.properties;
    const leg = props.legs?.[0];

    return {
      minutes: Math.round(props.time / 60),
      distanceText: `${(props.distance / 1000).toFixed(1)} km`,
      steps: (leg?.steps ?? []).map((s) => ({
        instruction: s.instruction?.text ?? '',
        distance: `${Math.round(s.distance)} m`,
      })),
      // Geometry so the mobile app can draw the route on the map
      polyline: feature.geometry ?? null,
    };
  });
}

async function getWalkingRoute(origin, destinationAddress) {
  const destination = await geocodeAddress(destinationAddress);
  console.log('Routing from', origin, 'to', destination, `(address: "${destinationAddress}")`);
  const route = await getRoute(origin, destination, 'walk');

  return {
    ...route,
    walkMinutes: route.minutes,
    destination,
  };
}

module.exports = { geocodeAddress, getRoute, getWalkingRoute };
