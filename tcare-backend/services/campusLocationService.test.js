const assert = require('node:assert/strict');
const test = require('node:test');
const {
  findNearbyCampusLocation,
  findRequestedCampusLocation,
  withRelevantCampusLocations,
} = require('./campusLocationService');
const services = require('../data/services');

const campusLocations = [
  { name: 'St. George', location: 'Toronto', coordinates: { latitude: 43.6643, longitude: -79.4018 } },
  { name: 'UTSC', location: 'Scarborough', coordinates: { latitude: 43.7846, longitude: -79.187 } },
  { name: 'UTM', location: 'Mississauga', coordinates: { latitude: 43.5483, longitude: -79.662 } },
];

test('selects only the nearby campus location', () => {
  assert.equal(findNearbyCampusLocation({ lat: 43.659, lng: -79.385 }, campusLocations).name, 'St. George');
  assert.equal(findNearbyCampusLocation({ lat: 43.79, lng: -79.19 }, campusLocations).name, 'UTSC');
});

test('keeps all campus locations when no campus is nearby or location is unavailable', () => {
  const resources = { campusLocations, links: [] };
  assert.equal(withRelevantCampusLocations(resources, { lat: 43.2, lng: -79.2 }).campusLocations.length, 3);
  assert.equal(withRelevantCampusLocations(resources).campusLocations.length, 3);
});

test('uses the campus explicitly named in the query before the nearby campus', () => {
  const requested = findRequestedCampusLocation('Where is UTSG accessibility services?', campusLocations);
  assert.equal(requested.name, 'St. George');

  const resources = { campusLocations, links: [] };
  const relevant = withRelevantCampusLocations(
    resources,
    { lat: 43.79, lng: -79.19 },
    'I need accessibility services at UTSG',
  );
  assert.deepEqual(relevant.campusLocations.map((location) => location.name), ['St. George']);
});

test('accessibility and mental-health support both include all three U of T campuses', () => {
  for (const serviceId of ['accessibility-services', 'health-wellness']) {
    const service = services.find((candidate) => candidate.id === serviceId);
    assert.equal(service?.supportResources?.campusLocations.length, 3);
  }
});
