// server.js
//
// Fresh backend for T-Care.
// Stack: Express + Groq (query understanding) + Geoapify (routing)

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const services = require('./data/services');
const { classifyQuery } = require('./services/groqService');
const { getWalkingRoute } = require('./services/mapsService');

const app = express();
app.use(cors());
app.use(express.json());

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