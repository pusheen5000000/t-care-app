// services/mapsService.js
//
// Uses the Google Maps Directions API.
// Docs: https://developers.google.com/maps/documentation/directions
//
// Note: Directions API requires a Google Cloud project with billing
// enabled (a card on file), even though usage is covered by the
// monthly $200 free credit for typical campus-app volume.

const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';

/**
 * Get a walking route from the student's current location to a
 * service's address.
 *
 * @param {{ lat: number, lng: number }} origin - student's live location
 * @param {string} destinationAddress
 * @returns {Promise<{ walkMinutes: number, distanceText: string, steps: Array }>}
 */
async function getWalkingRoute(origin, destinationAddress) {
  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: destinationAddress,
    mode: 'walking',
    key: process.env.GOOGLE_MAPS_API_KEY,
  });

  const response = await fetch(`${DIRECTIONS_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Google Maps API error (${response.status})`);
  }

  const data = await response.json();

  if (data.status !== 'OK' || !data.routes?.length) {
    throw new Error(`Google Maps Directions returned status: ${data.status}`);
  }

  const leg = data.routes[0].legs[0];

  return {
    walkMinutes: Math.round(leg.duration.value / 60),
    distanceText: leg.distance.text,
    steps: leg.steps.map((s) => ({
      instruction: s.html_instructions,
      distance: s.distance.text,
    })),
    // Raw polyline so the mobile app can draw the route on the map
    polyline: data.routes[0].overview_polyline?.points ?? null,
  };
}

module.exports = { getWalkingRoute };
