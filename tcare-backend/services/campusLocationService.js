const CAMPUS_PROXIMITY_KM = 5;
// A college is only needed when it determines the actual UTSG academic office.
// All other services have one campus-level destination.
const COLLEGE_SPECIFIC_SERVICE_IDS = new Set([
  'academic-success',
  'financial-aid',
  'registrar-enrolment',
]);

function requiresCollegePicker(service) {
  return Boolean(service)
    && service.facilityPicker === 'college'
    && COLLEGE_SPECIFIC_SERVICE_IDS.has(service.id);
}

function distanceInKm(from, to) {
  const earthRadiusKm = 6371;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.lat);
  const longitudeDelta = toRadians(to.longitude - from.lng);
  const latitude1 = toRadians(from.lat);
  const latitude2 = toRadians(to.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function findNearbyCampusLocation(location, campusLocations) {
  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return null;

  const nearest = campusLocations
    .filter((campusLocation) => campusLocation.coordinates)
    .map((campusLocation) => ({
      campusLocation,
      distance: distanceInKm(location, campusLocation.coordinates),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return nearest?.distance <= CAMPUS_PROXIMITY_KM ? nearest.campusLocation : null;
}

function findRequestedCampusLocation(query, campusLocations) {
  if (typeof query !== 'string') return null;

  const campusPatterns = [
    { pattern: /\b(?:utsg|st\.?\s*george|u\s*of\s*t\.?\s*st\.?\s*george|uoft\s*st\.?\s*george)\b/i, name: /st\.?\s*george/i },
    { pattern: /\b(?:utsc|scarborough|u\s*of\s*t\.?\s*scarborough|uoft\s*scarborough)\b/i, name: /utsc|scarborough/i },
    { pattern: /\b(?:utm|mississauga|u\s*of\s*t\.?\s*mississauga|uoft\s*mississauga)\b/i, name: /utm|mississauga/i },
  ];

  const requestedCampus = campusPatterns.find(({ pattern }) => pattern.test(query));
  return requestedCampus
    ? campusLocations.find((campusLocation) => requestedCampus.name.test(campusLocation.name)) ?? null
    : null;
}

function findSelectedCampusLocation(campus, campusLocations) {
  if (!['utsg', 'utsc', 'utm'].includes(campus)) return null;

  const campusNames = {
    utsg: /st\.?\s*george|utsg/i,
    utsc: /utsc|scarborough/i,
    utm: /utm|mississauga/i,
  };
  return campusLocations.find((campusLocation) => campusNames[campus].test(campusLocation.name)) ?? null;
}

function resolveCampusSupport(supportResources, location, query, campus) {
  const locations = supportResources?.campusLocations;
  if (!locations) return { supportResources };

  const selected = findSelectedCampusLocation(campus, locations);
  const requested = findRequestedCampusLocation(query, locations);
  const destination = selected ?? requested ?? findNearbyCampusLocation(location, locations);
  let intro = 'We could not confidently match you to a U of T campus, so here are all in-person options.';
  if (selected) intro = `Showing the in-person support for your selected campus at ${selected.name}.`;
  else if (requested) intro = `Showing the in-person support at ${requested.name}.`;
  else if (destination) intro = `Showing the in-person support available near you at ${destination.name}.`;

  return { selected, destination, supportResources: { ...supportResources, intro } };
}

function withRelevantCampusLocations(supportResources, location, query, campus) {
  return resolveCampusSupport(supportResources, location, query, campus).supportResources;
}

function campusLocationToOffice(campusLocation, service) {
  return {
    name: campusLocation.name,
    address: campusLocation.location,
    fee: service.fee,
    hours: service.hours,
  };
}

module.exports = {
  findNearbyCampusLocation,
  findRequestedCampusLocation,
  findSelectedCampusLocation,
  resolveCampusSupport,
  withRelevantCampusLocations,
  campusLocationToOffice,
  requiresCollegePicker,
};
