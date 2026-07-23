// services/mapsService.js
//
// Uses the Geoapify Routing API.
// Docs: https://apidocs.geoapify.com/docs/routing/

const ROUTING_URL = 'https://api.geoapify.com/v1/routing';
const GEOCODE_URL = 'https://api.geoapify.com/v1/geocode/search';

async function geocodeAddress(address) {
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
