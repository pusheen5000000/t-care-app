const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const services = require('./data/services');
const collegeRegistrarOffices = require('./data/collegeRegistrarOffices');
const { findBuilding, formatBuildingSummary } = require('./services/buildingDirectoryService');
const { classifyQuery } = require('./services/groqService');
const { geocodeAddress, getRoute, getWalkingRoute } = require('./services/mapsService');
const {
  campusLocationToOffice,
  resolveCampusSupport,
  withRelevantCampusLocations,
  requiresCollegePicker,
} = require('./services/campusLocationService');

const app = express();
app.use(cors());
app.use(express.json());

const INQUIRIES_EMAIL = 'inquiries.tcare@gmail.com';
const CONTACT_TOPICS = new Set(['App issue', 'Service question', 'Suggestion', 'Other']);

function contactField(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function sendError(res, err, message, status = 500) {
  console.error(err);
  return res.status(status).json({ error: message, detail: err.message });
}

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

// Trim a list-only service's locations to the student's selected campus.
// Untagged entries always remain, and if nothing matches (or no campus is
// selected) the full list is returned so a result is never empty.
function filterListOnlyByCampus(supportResources, campus) {
  const locations = supportResources?.campusLocations ?? [];
  const hasCampusTags = locations.some((location) => location.campus);
  if (!['utsg', 'utsc', 'utm'].includes(campus) || !hasCampusTags) return supportResources;

  const filtered = locations.filter((location) => !location.campus || location.campus === campus);
  if (filtered.length === 0) return supportResources;

  const campusLabel = campus === 'utsg' ? 'St. George' : campus === 'utsc' ? 'UTSC' : 'UTM';
  // When the resource carries links for other campuses, point students to them
  // so they can still reach another campus's version of this amenity.
  const hasCrossCampusLinks = (supportResources.links?.length ?? 0) > 1;
  const intro = hasCrossCampusLinks
    ? `Showing ${campusLabel} spots. Need another campus? Use the links below to reach its version.`
    : `Showing options at your selected campus (${campusLabel}).`;
  return {
    ...supportResources,
    intro,
    campusLocations: filtered,
  };
}

async function createCampusAwareServiceResult({ service, query, title, summary, location, campus }) {
  const info = {
    type: 'info',
    serviceId: service.id,
    query,
    title: title || service.name,
    summary: summary || service.summary,
  };
  if (service.listOnly) {
    return { ...info, supportResources: filterListOnlyByCampus(service.supportResources, campus) };
  }

  const { selected, destination, supportResources } = resolveCampusSupport(service.supportResources, location, query, campus);
  // College services can map directly only after the student selects UTSC or UTM.
  if (requiresCollegePicker(service) && (!selected || /st\.?\s*george|utsg/i.test(selected.name))) {
    return { ...info, supportResources, facilityPicker: 'college' };
  }
  if (!destination) {
    const facilityPicker = supportResources?.campusLocations?.length > 1 ? 'campus' : undefined;
    return { ...info, supportResources, facilityPicker };
  }

  const result = await createMapResult({
    office: campusLocationToOffice(destination, service),
    query,
    summary: info.summary,
    location,
  });
  return {
    ...result,
    serviceId: service.id,
    title: title || destination.name,
    supportResources,
  };
}

app.post('/api/query', async (req, res) => {
  const { query, location, campus } = req.body;

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
          campus,
        }),
      );
    }

    const requestedDestination =
      typeof classification.destination === 'string' ? classification.destination.trim() : '';
    const asksForDirections =
      /\b(directions?|guide(?: me)?|route|map|navigation|navigate|wayfind(?:ing)?|find (?:my|the) way|how (do|can) i get|how to get|get to|get me|take me|bring me|lead me|walk me|show me (?:the )?(?:way|route)|go to|head to|travel to|walk to|reach|arriv(?:e|al|ing)|destination|where is)\b/i.test(query);

    // Known services should route whenever the student asks for directions,
    // even if the AI omits its optional destination field.
    // An AI-provided destination is useful only when the student explicitly
    // asks to go somewhere. Never turn a broad request such as "I need help"
    // into an arbitrary map result.
    if (asksForDirections && (requestedDestination || matched)) {
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

    if (!matched) {
      return res.json({
        type: 'info', query, title: classification.title || "Here's what I found", summary: classification.summary,
      });
    }

    const title = classification.title || matched.name;
    const summary = classification.summary || matched.summary;
    if (!location) return res.json({ type: 'info', query, title, summary, supportResources: matched.supportResources });

    const route = await getWalkingRoute(location, matched.address);

    return res.json({
      type: 'location',
      query,
      title,
      summary,
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
    return sendError(res, err, 'Something went wrong');
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
      steps: route.steps,
      travelMinutes: route.minutes,
      distanceText: route.distanceText,
      polyline: route.polyline,
    });
  } catch (err) {
    return sendError(res, err, 'Could not calculate route', 502);
  }
});

app.post('/api/contact', async (req, res) => {
  const firstName = contactField(req.body?.firstName, 80);
  const lastName = contactField(req.body?.lastName, 80);
  const email = contactField(req.body?.email, 254).toLowerCase();
  const topic = contactField(req.body?.topic, 80);
  const inquiry = contactField(req.body?.inquiry, 2000);

  if (!firstName || !lastName || !email || !topic || !inquiry) {
    return res.status(400).json({ error: 'First name, last name, email, topic, and inquiry are required.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (!CONTACT_TOPICS.has(topic)) {
    return res.status(400).json({ error: 'Choose a valid inquiry topic.' });
  }
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
  if (!gmailAppPassword) {
    console.error('Contact email is unavailable: GMAIL_APP_PASSWORD is not configured.');
    return res.status(503).json({ error: 'Contact submission is temporarily unavailable. Please try again later.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: INQUIRIES_EMAIL, pass: gmailAppPassword },
    });
    await transporter.sendMail({
      from: `T-Care inquiries <${INQUIRIES_EMAIL}>`,
      to: INQUIRIES_EMAIL,
      replyTo: email,
      subject: `[T-Care] ${topic}: ${firstName} ${lastName}`,
      text: [
        'A new T-Care inquiry was submitted.',
        '',
        `First name: ${firstName}`,
        `Last name: ${lastName}`,
        `Email: ${email}`,
        `Topic: ${topic}`,
        '',
        'Inquiry:',
        inquiry,
      ].join('\n'),
    });
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Could not send contact email:', error.message);
    return res.status(502).json({ error: 'We could not send your inquiry. Please try again later.' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

module.exports = app;
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`T-Care backend running on http://localhost:${port}`));
}

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
    return sendError(res, err, 'Could not load the TCard Office map');
  }
});

for (const [id, label, defaultQuery] of [
  ['accessibility-services', 'Accessibility Services', 'Where can I access accessibility services?'],
  ['health-wellness', 'Health & Wellness', 'I need someone to talk to'],
]) {
  app.post(`/api/${id}`, async (req, res) => {
    const service = services.find((candidate) => candidate.id === id);
    const { query, location, campus } = req.body ?? {};
    if (!service) return res.status(500).json({ error: `${label} is not configured` });

    try {
      const useQuery = id === 'accessibility-services' && typeof query === 'string' && query.trim();
      return res.json(await createCampusAwareServiceResult({
        service, query: useQuery ? query : defaultQuery, location, campus,
      }));
    } catch (err) {
      return sendError(res, err, `Could not load the ${label} map`);
    }
  });
}

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
    return sendError(res, err, 'Could not load the campus location map');
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
    return sendError(res, err, 'Could not load the college registrar map');
  }
});
