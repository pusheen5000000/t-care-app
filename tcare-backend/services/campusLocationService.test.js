const assert = require('node:assert/strict');
const test = require('node:test');
const {
  findNearbyCampusLocation,
  findRequestedCampusLocation,
  withRelevantCampusLocations,
  requiresCollegePicker,
} = require('./campusLocationService');
const services = require('../data/services');
const { classifyQuery } = require('./groqService');

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

test('every campus-facing resource includes a map-ready location for all three campuses', () => {
  const serviceIds = [
    'housing',
    'academic-success',
    'international-support',
    'registrar-enrolment',
    'campus-safety',
    'career-support',
    'libraries-it',
    'food-basic-needs',
    'sexual-violence-support',
  ];

  for (const serviceId of serviceIds) {
    const locations = services.find((service) => service.id === serviceId)?.supportResources?.campusLocations;
    assert.equal(locations?.length, 3, `${serviceId} should list all three campuses`);
    assert.ok(locations.every((location) => location.name && location.location && location.coordinates));
    assert.ok(locations.some((location) => /utsg|st\.?\s*george/i.test(location.name)));
    assert.ok(locations.some((location) => /utsc|scarborough/i.test(location.name)));
    assert.ok(locations.some((location) => /utm|mississauga/i.test(location.name)));
  }
});

test('location-style questions match the intended campus service without an AI request', async () => {
  const queries = [
    ['Where is the housing office?', 'housing'],
    ['Where is academic advising?', 'academic-success'],
    ['Bring me to the international student office', 'international-support'],
    ['Where is the registrar?', 'registrar-enrolment'],
    ['Bring me to Campus Safety', 'campus-safety'],
    ['Where is the career support adviser?', 'career-support'],
    ['Bring me to IT support', 'libraries-it'],
    ['Where is the food bank?', 'food-basic-needs'],
    ['Where is sexual violence support?', 'sexual-violence-support'],
  ];

  for (const [query, serviceId] of queries) {
    assert.equal((await classifyQuery(query, services)).serviceId, serviceId);
  }
});

test('food support routes UTSC and UTM students to their campus food centres', () => {
  const foodSupport = services.find((service) => service.id === 'food-basic-needs');
  const locations = foodSupport.supportResources.campusLocations;
  const links = foodSupport.supportResources.links;

  const utsc = locations.find((location) => /utsc/i.test(location.name));
  const utm = locations.find((location) => /utm/i.test(location.name));
  assert.match(utsc.name, /SCSU Food Centre/);
  assert.match(utsc.location, /SL-210-B/);
  assert.match(utm.name, /UTMSU Food Centre/);
  assert.match(utm.location, /Room 100/);
  assert.ok(links.some((link) => link.url === 'https://scsu.ca/foodcentre'));
  assert.ok(links.some((link) => link.url === 'https://utmsu.ca/service/food-centre/'));
});

test('only college-owned UTSG services require a second college selection', () => {
  assert.equal(requiresCollegePicker(services.find((service) => service.id === 'academic-success')), true);
  assert.equal(requiresCollegePicker(services.find((service) => service.id === 'financial-aid')), true);
  assert.equal(requiresCollegePicker(services.find((service) => service.id === 'registrar-enrolment')), true);

  for (const serviceId of [
    'housing',
    'international-support',
    'campus-safety',
    'career-support',
    'libraries-it',
    'food-basic-needs',
    'sexual-violence-support',
  ]) {
    assert.equal(requiresCollegePicker(services.find((service) => service.id === serviceId)), false, serviceId);
  }
});
