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

Use **Node.js 22.13+ (Node 24 LTS recommended)** and an **Expo Go build
that supports SDK 58** on your iPhone or Android phone. Start from this
repository; do not generate a new Expo project.

1. In a terminal at the repository root, set up the backend:

   ```bash
   cd tcare-backend
   npm ci
   cp .env.example .env
   ```

   In PowerShell, use `Copy-Item .env.example .env` instead of `cp`.
   If `.env` already exists, keep it. Fill in `GROQ_API_KEY` and
   `GEOAPIFY_API_KEY`; contact email also needs `GMAIL_APP_PASSWORD`.
   Run `npm start` and leave this terminal open.

2. Find your computer's Wi-Fi IPv4 address (`ipconfig` on Windows,
   Wi-Fi settings on macOS, or `ip addr` on Linux). On your phone, open
   `http://YOUR_COMPUTER_IP:3000/health` in a browser. It must return
   `{"ok":true}`. Both devices must be on the same network; allow Node.js
   through your computer's firewall on the private network if needed.

3. Open a **second terminal at the repository root**:

   ```bash
   cd tcare-mobile
   npm ci
   cp .env.example .env
   ```

   Use `Copy-Item .env.example .env` in PowerShell. Keep an existing `.env`.
   Set `EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000` in this file.
   This address must be reachable from the phone; `localhost` points to
   the phone itself. Values prefixed `EXPO_PUBLIC_` are public: never put
   API keys in the mobile environment.

4. Run `npm start`, then scan the QR code using the iPhone Camera or
   Expo Go on Android. Keep both terminals running. Grant location access
   when prompted to test walking routes.

If the phone reports an incompatible SDK, check its Expo Go version against
[Expo's download page](https://expo.dev/go). SDK 58 store rollout may vary;
if a compatible Expo Go build is unavailable, use a development build.
See [the setup guide](./REQUIREMENTS.md) for networking alternatives,
verification, and troubleshooting. Bash setup automation is deferred.

## Testing

The backend uses Node's built-in test runner:

```bash
cd tcare-backend
npm test
```

## Documentation

- [`REQUIREMENTS.md`](./REQUIREMENTS.md) — local setup and testing guide
