// server.js
//
// Fresh backend for T-Care.
// Stack: Express + Groq (query understanding) + Geoapify (routing)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const services = require('./data/services');
const collegeRegistrarOffices = require('./data/collegeRegistrarOffices');
const { classifyQuery } = require('./services/groqService');
const { geocodeAddress, getWalkingRoute } = require('./services/mapsService');

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
    const classification = await classifyQuery(query, services);
    const matched = services.find((s) => s.id === classification.serviceId);

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
      });
    }

    // Matched a service, but no location provided — return info without a route
    if (!location) {
      return res.json({
        type: 'info',
        query,
        title: classification.title || matched.name,
        summary: classification.summary || matched.summary,
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
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong', detail: err.message });
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
  const { location } = req.body ?? {};

  if (!accessibilityServices) {
    return res.status(500).json({ error: 'Accessibility Services is not configured' });
  }

  try {
    return res.json(
      await createMapResult({
        office: accessibilityServices,
        query: 'Where can I access accessibility services?',
        summary: accessibilityServices.summary,
        location,
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load the Accessibility Services map', detail: err.message });
  }
});

app.post('/api/health-wellness', async (req, res) => {
  const healthWellness = services.find((service) => service.id === 'health-wellness');
  const { location } = req.body ?? {};

  if (!healthWellness) {
    return res.status(500).json({ error: 'Health & Wellness is not configured' });
  }

  try {
    return res.json(
      await createMapResult({
        office: healthWellness,
        query: 'I need someone to talk to',
        summary: healthWellness.summary,
        location,
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load the Health & Wellness map', detail: err.message });
  }
});

app.post('/api/college-registrar/:collegeId', async (req, res) => {
  const office = collegeRegistrarOffices.find((college) => college.id === req.params.collegeId);
  const { location } = req.body ?? {};

  if (!office) return res.status(404).json({ error: 'College registrar office not found' });

  try {
    return res.json(
      await createMapResult({
        office,
        query: 'I need help with my studies',
        summary: 'Your college registrar is a first stop for academic assistance, advising, and referrals.',
        location,
      })
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not load the college registrar map', detail: err.message });
  }
});
