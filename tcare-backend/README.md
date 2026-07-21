# T-Care Backend (fresh start)

Express backend using **Groq** for query understanding and **Google Maps**
(Directions API) for routing. Independent of the old repo — nothing
copied over.

## Setup

```bash
cd tcare-backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `GROQ_API_KEY` — from https://console.groq.com (no card needed)
- `GOOGLE_MAPS_API_KEY` — from Google Cloud Console. You'll need to:
  1. Create a project, enable billing (card required — Google gives
     $200/month free credit, which comfortably covers a campus-scale app)
  2. Enable the **Directions API**
  3. Create an API key restricted to that API

Then run:

```bash
npm start
```

Server runs on `http://localhost:3000` by default.

## Testing it

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I lost my TCard, what do I do?",
    "location": { "lat": 43.6629, "lng": -79.3957 }
  }'
```

Expected response shape (matches the mobile app's `QueryResult` type):

```json
{
  "type": "location",
  "query": "I lost my TCard, what do I do?",
  "title": "TCard replacement",
  "summary": "...",
  "placeName": "TCard Office",
  "placeSubtitle": "130 St George St, Toronto, ON M5S 1A5",
  "walkMinutes": 8,
  "fee": "$20",
  "hours": "9:00 AM – 5:00 PM",
  "polyline": "..."
}
```

Omit `location` in the request body to get a plain `type: "info"`
response with no route.

## How it works

1. `POST /api/query` receives the student's text (+ optional live location)
2. `services/groqService.js` sends the query + your list of campus
   services (from `data/services.js`) to Groq, asking it to pick the
   best match and write a short plain-language summary
3. If a service matched **and** you sent a location, `services/mapsService.js`
   calls Google's Directions API to get walking time, distance, and a
   polyline for drawing the route on a map
4. Server responds with one JSON object shaped for the mobile app

## Connecting the mobile app

In the mobile app's `App.tsx`, replace the `resolveQuery()` stub with:

```ts
async function resolveQuery(query: string): Promise<QueryResult> {
  const res = await fetch('http://YOUR_BACKEND_URL/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      location: { lat: /* from expo-location */, lng: /* ... */ },
    }),
  });
  return res.json();
}
```

You'll want `expo-location` in the mobile app to get the student's
live coordinates before sending the request.

## Adding more services

Just add entries to `data/services.js` — no code changes needed
elsewhere. Give each one good `keywords` and a real `address`; Groq
uses the service names/ids to pick a match, so keep names descriptive.
