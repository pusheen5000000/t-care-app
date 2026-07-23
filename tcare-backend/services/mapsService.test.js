const test = require('node:test');
const assert = require('node:assert/strict');

const { geocodeAddress, getRoute } = require('./mapsService');

function geocodeResponse() {
  return {
    ok: true,
    json: async () => ({
      features: [{
        geometry: { coordinates: [-79.3832, 43.6532] },
        properties: { formatted: '100 Test Street, Toronto, ON' },
      }],
    }),
  };
}

function routeResponse() {
  return {
    ok: true,
    json: async () => ({
      features: [{
        geometry: { type: 'LineString', coordinates: [] },
        properties: { time: 600, distance: 1250, legs: [{ steps: [] }] },
      }],
    }),
  };
}

test('geocode requests are cached by normalized address', async () => {
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    return geocodeResponse();
  };

  try {
    await Promise.all([
      geocodeAddress('100 Test Street, Toronto, ON'),
      geocodeAddress('  100   Test Street, Toronto, ON  '),
    ]);
    assert.equal(calls, 1);
  } finally {
    global.fetch = originalFetch;
  }
});

test('routes share a cache entry for GPS jitter within four decimal places', async () => {
  const originalFetch = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    return routeResponse();
  };

  try {
    await Promise.all([
      getRoute({ lat: 43.66001, lng: -79.39501 }, { lat: 43.66003, lng: -79.39503 }),
      getRoute({ lat: 43.66004, lng: -79.39504 }, { lat: 43.66003, lng: -79.39503 }),
    ]);
    assert.equal(calls, 1);
  } finally {
    global.fetch = originalFetch;
  }
});

