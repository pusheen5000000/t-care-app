// server.js
//
// Fresh backend for T-Care.
// Stack: Express + Groq (query understanding) + Geoapify (routing)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const services = require('./data/services');
const collegeRegistrarOffices = require('./data/collegeRegistrarOffices');
const { findBuilding, formatBuildingSummary } = require('./services/buildingDirectoryService');
const { classifyQuery } = require('./services/groqService');
const { geocodeAddress, getRoute, getWalkingRoute } = require('./services/mapsService');
const {
  campusLocationToOffice,
  findNearbyCampusLocation,
  findRequestedCampusLocation,
  withRelevantCampusLocations,
  requiresCollegePicker,
} = require('./services/campusLocationService');

const app = express();
app.use(cors());
app.use(express.json());

async function createMapResult({ office, query, summary, location }) {
  const route = location ? await getWalkingRoute(location, office.address) : null;
  const destination = route?.destination ?? (await geocodeAddress(office.address));

  return {
    type: 'location',
    query,
    title: office.name,
    summary,
    placeName: office.name,
    placeSubtitle: destination.formattedAddress ?? office.address,
    walkMinutes: route?.walkMinutes ?? 0,
    distanceText: route?.distanceText ?? null,
    steps: route?.steps ?? [],
    fee: office.fee ?? 'Free',
    hours: office.hours ?? 'Contact office',
    polyline: route?.polyline ?? null,
    origin: location ? { latitude: location.lat, longitude: location.lng } : undefined,
    destination: { latitude: destination.lat, longitude: destination.lng },
    supportResources: office.supportResources,
  };
}

function createInfoResult({ service, query, title, summary, location }) {
  const campusLocations = service.supportResources?.campusLocations ?? [];
  const confidentCampusLocation = findRequestedCampusLocation(query, campusLocations)
    ?? findNearbyCampusLocation(location, campusLocations);
  return {
    type: 'info',
    serviceId: service.id,
    query,
    title: title || service.name,
    summary: summary || service.summary,
    supportResources: withRelevantCampusLocations(service.supportResources, location, query),
    facilityPicker: requiresCollegePicker(service)
      ? 'college'
      : (campusLocations.length > 1 && !confidentCampusLocation ? 'campus' : undefined),
  };
}

async function createCampusAwareServiceResult({ service, query, title, summary, location }) {
  // A UTSG college is a required second choice for these services. Never let a
  // UTSG mention or device location bypass that choice and open a map instead.
  if (requiresCollegePicker(service)) {
    return createInfoResult({ service, query, title, summary, location });
  }
  const campusLocations = service.supportResources?.campusLocations ?? [];
  const requestedCampusLocation = findRequestedCampusLocation(query, campusLocations);
  const nearbyCampusLocation = findNearbyCampusLocation(location, campusLocations);
  const selectedCampusLocation = requestedCampusLocation ?? nearbyCampusLocation;
  if (!selectedCampusLocation) return createInfoResult({ service, query, title, summary, location });

  const result = await createMapResult({
    office: campusLocationToOffice(selectedCampusLocation, service),
    query,
    summary: summary || service.summary,
    location,
  });
  return {
    ...result,
    serviceId: service.id,
    title: title || selectedCampusLocation.name,
    supportResources: withRelevantCampusLocations(service.supportResources, location, query),
  };
}

/**
 * POST /api/query
 * body: { query: string, location?: { lat: number, lng: number } }
 *
 * Returns a QueryResult shaped for the mobile app:
 *   { type: 'info', query, title, summary }
 * or
 *   { type: 'location', query, title, summary, placeName,
 *     placeSubtitle, walkMinutes, fee, hours, polyline, origin, destination }
 */
app.post('/api/query', async (req, res) => {
  const { query, location } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing "query" string in body' });
  }

  try {
    // Building questions are resolved from the curated directory before calling
    // the AI. This keeps common names and timetable codes fast and dependable.
    const requestedBuilding = findBuilding(query);
    if (requestedBuilding) {
      const summary = formatBuildingSummary(requestedBuilding);
      try {
        return res.json(
          await createMapResult({
            office: { ...requestedBuilding, fee: 'Free', hours: 'Building hours vary' },
            query,
            summary,
            location,
          }),
        );
      } catch (mapError) {
        // The directory answer is still useful when an external map provider
        // is unavailable; never discard the verified stored address.
        console.warn('Could not create building map result:', mapError.message);
        return res.json({
          type: 'info',
          query,
          title: requestedBuilding.name,
          summary,
          supportResources: { campusLocations: [], links: [] },
        });
      }
    }

    const classification = await classifyQuery(query, services);
    const matched = services.find((s) => s.id === classification.serviceId);

    // A multi-campus service is never routed to an arbitrary default office.
    // When a campus is nearby, route there; otherwise list every in-person option.
    if (matched?.supportResources?.campusLocations) {
      return res.json(
        await createCampusAwareServiceResult({
          service: matched,
          query,
          title: classification.title,
          summary: classification.summary,
          location,
        }),
      );
    }

    const requestedDestination =
      typeof classification.destination === 'string' ? classification.destination.trim() : '';
    const asksForDirections =
      /\b(directions?|guide(?: me)?|route|map|navigation|navigate|wayfind(?:ing)?|find (?:my|the) way|how (do|can) i get|how to get|get to|get me|take me|bring me|lead me|walk me|show me (?:the )?(?:way|route)|go to|head to|travel to|walk to|reach|arriv(?:e|al|ing)|destination|where is)\b/i.test(query);

    // Known services should route whenever the student asks for directions,
    // even if the AI omits its optional destination field.
    if (requestedDestination || (matched && asksForDirections)) {
      try {
        return res.json(
          await createMapResult({
            office: matched ?? {
              name: requestedDestination,
              address: requestedDestination,
              fee: 'Not available',
              hours: 'Not available',
            },
            query,
            summary: classification.summary || matched?.summary,
            location,
          })
        );
      } catch (mapError) {
        // The normal T-AI answer remains useful if mapping is unavailable.
        console.warn('Could not create map result:', mapError.message);
      }
    }

    // No matching service — just return the AI's plain-language answer
    if (!matched) {
      return res.json({
        type: 'info',
        query,
        title: classification.title || "Here's what I found",
        summary: classification.summary,
        supportResources: matched?.supportResources,
      });
    }

    // Matched a service, but no location provided — return info without a route
    if (!location) {
      return res.json({
        type: 'info',
        query,
        title: classification.title || matched.name,
        summary: classification.summary || matched.summary,
        supportResources: matched.supportResources,
      });
    }

    // Matched a service AND we have the student's location — get the route
    const route = await getWalkingRoute(location, matched.address);

    return res.json({
      type: 'location',
      query,
      title: classification.title || matched.name,
      summary: classification.summary || matched.summary,
      placeName: matched.name,
      placeSubtitle: matched.address,
      walkMinutes: route.walkMinutes,
      fee: matched.fee,
      hours: matched.hours,
      polyline: route.polyline,
      origin: { latitude: location.lat, longitude: location.lng },
      destination: {
        latitude: route.destination.lat,
        longitude: route.destination.lng,
      },
      supportResources: matched.supportResources,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong', detail: err.message });
  }
});

const TRAVEL_MODES = {
  walk: 'walk',
  bike: 'bicycle',
  car: 'drive',
  transit: 'approximated_transit',
};

// Re-route an already displayed destination when the student changes travel mode.
app.post('/api/route', async (req, res) => {
  const { origin, destination, mode } = req.body ?? {};
  const geoapifyMode = TRAVEL_MODES[mode];

  if (!geoapifyMode) {
    return res.status(400).json({ error: 'Unsupported travel mode' });
  }

  if (![origin?.lat, origin?.lng, destination?.lat, destination?.lng].every(Number.isFinite)) {
    return res.status(400).json({ error: 'A valid origin and destination are required' });
  }

  try {
    const route = await getRoute(origin, destination, geoapifyMode);
    return res.json({
      mode,
      travelMinutes: route.minutes,
      distanceText: route.distanceText,
      polyline: route.polyline,
    });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'Could not calculate route', detail: err.message });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`T-Care backend running on http://localhost:${PORT}`);
});

// Direct shortcut for the home-screen "I lost my TCard" action. It avoids
// relying on AI classification and always returns a map-ready office result.
app.post('/api/tcard-office', async (req, res) => {
  const tcardOffice = services.find((service) => service.id === 'tcard-office');
  const { location } = req.body ?? {};

  if (!tcardOffice) {
    return res.status(500).json({ error: 'TCard Office is not configured' });
  }

  try {
    return res.json(
      await createMapResult({
        office: tcardOffice,
        query: 'I lost my TCard, what do I do?',
        summary: tcardOffice.summary,
        location,
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load the TCard Office map', detail: err.message });
  }
});

app.post('/api/accessibility-services', async (req, res) => {
  const accessibilityServices = services.find((service) => service.id === 'accessibility-services');
  const { location, query } = req.body ?? {};

  if (!accessibilityServices) {
    return res.status(500).json({ error: 'Accessibility Services is not configured' });
  }

  try {
    return res.json(await createCampusAwareServiceResult({
      service: accessibilityServices,
      query: typeof query === 'string' && query.trim()
        ? query
        : 'Where can I access accessibility services?',
      summary: accessibilityServices.summary,
      location,
    }));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load the Accessibility Services map', detail: err.message });
  }
});

// Lets a student choose a specific office from the full tri-campus list.
app.post('/api/campus-location', async (req, res) => {
  const { serviceId, campusLocationName, location } = req.body ?? {};
  const service = services.find((candidate) => candidate.id === serviceId);
  const campusLocation = service?.supportResources?.campusLocations
    .find((candidate) => candidate.name === campusLocationName);

  if (!campusLocation) {
    return res.status(404).json({ error: 'Campus location not found' });
  }

  try {
    const result = await createMapResult({
      office: campusLocationToOffice(campusLocation, service),
      query: `Show ${campusLocation.name} on the map`,
      summary: service.summary,
      location,
    });
    return res.json({
      ...result,
      serviceId: service.id,
      supportResources: withRelevantCampusLocations(service.supportResources, location),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load the campus location map', detail: err.message });
  }
});

app.post('/api/health-wellness', async (req, res) => {
  const healthWellness = services.find((service) => service.id === 'health-wellness');
  const { location } = req.body ?? {};

  if (!healthWellness) {
    return res.status(500).json({ error: 'Health & Wellness is not configured' });
  }

  try {
    return res.json(await createCampusAwareServiceResult({
      service: healthWellness,
      query: 'I need someone to talk to',
      summary: healthWellness.summary,
      location,
    }));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load the Health & Wellness map', detail: err.message });
  }
});

app.post(['/api/college-service/:collegeId', '/api/college-registrar/:collegeId'], async (req, res) => {
  const office = collegeRegistrarOffices.find((college) => college.id === req.params.collegeId);
  const { location, serviceId } = req.body ?? {};
  const facilityService = services.find((service) => service.id === serviceId && requiresCollegePicker(service))
    ?? services.find((service) => service.id === 'registrar-enrolment');

  if (!office) return res.status(404).json({ error: 'College registrar office not found' });

  try {
    const result = await createMapResult({
      office,
        query: facilityService?.name ?? 'College service',
        summary: `${office.name} is the local UTSG office selected for ${facilityService?.name ?? 'this service'}. Use the resources below for the next step.`,
        location,
      });
    return res.json({
      ...result,
      title: `${facilityService?.name ?? 'College service'} at ${office.name}`,
      serviceId: facilityService?.id,
      supportResources: facilityService?.supportResources,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load the college registrar map', detail: err.message });
  }
});
