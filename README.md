# T-Care

T-Care is a mobile tool that helps University of Toronto students get a fast,
trustworthy answer to everyday campus questions. A student asks a question in
plain language ("I lost my TCard, what do I do?"), and T-Care returns concise
guidance and, when relevant, walking directions to the right campus service.

The goal is simple: get a student to an accurate next step quickly, without
digging through disconnected university websites.

## What it does

- Accepts free-form questions or quick suggestion prompts.
- Routes each question to the correct U of T service using an AI classifier.
- Returns concise, plain-language guidance for the question.
- For location-based needs, shows a destination with hours, fee, and a walking
  route from the student's location.
- Supports tri-campus routing (St. George, UTSC, UTM) and college-specific
  registrar offices, prompting for a campus or college when needed.
- Includes a curated, manually checked service directory and links, so students
  reach dependable destinations rather than unverified search results.
- Lets students send an inquiry through an in-app contact form.

T-Care does not present unverified university information or fabricate service
details. The service directory and destination links are curated by hand.

## Architecture

The project is split into two side-by-side apps:

```
t-care-app/
├── tcare-mobile/     Expo / React Native app (iOS & Android)
├── tcare-backend/    Express API (query understanding + routing + contact)
├── PRODUCT.md        Product purpose, users, and principles
├── DESIGN.md         Design system (U of T brand colors, type, components)
└── REQUIREMENTS.md   Step-by-step local setup guide for testing
```

**Mobile app (`tcare-mobile/`)** — Expo / React Native with TypeScript. Screens
include Ask, Result, Resources, Contact, and T-AI. It reads the backend URL from
the `EXPO_PUBLIC_API_URL` environment variable and renders maps and walking
routes with `react-native-maps`.

**Backend (`tcare-backend/`)** — Node.js + Express. It classifies questions with
Groq, resolves them against a curated service directory, and builds walking (or
bike/car/transit) routes with Geoapify. Contact-form submissions are emailed via
Nodemailer. Building and service data live in `tcare-backend/data/`, and the
routing/classification logic lives in `tcare-backend/services/`.

### Tech stack

| Layer    | Technology |
|----------|------------|
| Mobile   | Expo, React Native, TypeScript, react-native-maps |
| Backend  | Node.js, Express, dotenv, CORS, Nodemailer |
| AI       | Groq (query understanding) |
| Maps     | Geoapify (geocoding + routing) |
| Email    | Gmail (via App Password) |

## API overview

The backend exposes a small JSON API (default `http://localhost:3000`):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/query` | Main entry point — classify a question and return info or a routed location |
| `POST` | `/api/route` | Re-route a known destination for a different travel mode |
| `POST` | `/api/contact` | Send a student inquiry by email |
| `POST` | `/api/tcard-office` | Shortcut for the "I lost my TCard" action |
| `POST` | `/api/accessibility-services` | Campus-aware Accessibility Services result |
| `POST` | `/api/health-wellness` | Campus-aware Health & Wellness result |
| `POST` | `/api/campus-location` | Pick a specific office from a tri-campus list |
| `POST` | `/api/college-service/:collegeId` | Resolve a UTSG college registrar office |
| `GET`  | `/health` | Health check |

Example request:

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "I lost my TCard, what do I do?", "location": {"lat": 43.6629, "lng": -79.3957}}'
```

The response is either an `info` result (`{ type, title, summary, ... }`) or a
`location` result that adds `placeName`, `walkMinutes`, `hours`, `fee`, and a
map `polyline`.

## Quick start

You need Node.js 18+, the Expo Go app on your phone, and your phone and computer
on the same WiFi network.

**1. Backend**

```bash
cd tcare-backend
npm install
cp .env.example .env   # then fill in the keys below
npm start              # -> T-Care backend running on http://localhost:3000
```

Required backend environment variables (`tcare-backend/.env`):

```
PORT=3000
GROQ_API_KEY=<from console.groq.com>
GEOAPIFY_API_KEY=<from geoapify.com>
GMAIL_APP_PASSWORD=<Google App Password for [insert email address here]>
```

**2. Mobile app**

```bash
cd tcare-mobile
npm install
```

Point the app at your computer's local IP (not `localhost`, since your phone is
a separate device). Create `tcare-mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:3000
```

Find your IP with `ipconfig` (Windows), `ifconfig` (macOS), or `ip addr`
(Linux). Then start Expo and scan the QR code with Expo Go:

```bash
npx expo start
```

For the full setup walkthrough, testing checklist, and troubleshooting, see
[`REQUIREMENTS.md`](./REQUIREMENTS.md).

## Testing

The backend uses Node's built-in test runner:

```bash
cd tcare-backend
npm test
```

## Documentation

- [`REQUIREMENTS.md`](./REQUIREMENTS.md) — local setup and testing guide
