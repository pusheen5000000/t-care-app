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
 * Get a walking route from the student's current location to a
 * service's address.
 *
 * @param {{ lat: number, lng: number }} origin - student's live location
 * @param {string} destinationAddress
 * @returns {Promise<{ walkMinutes: number, distanceText: string, steps: Array }>}
 */
async function getWalkingRoute(origin, destinationAddress) {
  const dest = await geocodeAddress(destinationAddress);
  console.log('Routing from', origin, 'to', dest, `(address: "${destinationAddress}")`);


  const params = new URLSearchParams({
    waypoints: `${origin.lat},${origin.lng}|${dest.lat},${dest.lng}`,
    mode: 'walk',
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
  const leg = props.legs[0];

  return {
    walkMinutes: Math.round(props.time / 60),
    distanceText: `${(props.distance / 1000).toFixed(1)} km`,
    steps: leg.steps.map((s) => ({
      instruction: s.instruction?.text ?? '',
      distance: `${Math.round(s.distance)} m`,
    })),
    // Geometry so the mobile app can draw the route on the map
    polyline: feature.geometry ?? null,
    destination: dest,
  };
}

module.exports = { geocodeAddress, getWalkingRoute };
