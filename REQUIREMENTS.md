# T-Care — Setup Guide (for testing)

This covers everything you need to get both the backend and the mobile
app running on your own machine so you can test T-Care.

## 1. What you need installed

- **Node.js** (v18 or newer) — https://nodejs.org
- **Expo Go** app on your phone — search "Expo Go" in the App Store /
  Play Store
- A code editor (VS Code recommended, but anything works)
- Your phone and your computer **on the same WiFi network**

## 2. Get the project files

Pull/copy the `T-CARE-APP` folder so you have both `tcare-backend` and
`tcare-mobile` side by side.

## 3. Set up the backend

```bash
cd tcare-backend
npm install
cp .env.example .env
```

Open the new `.env` file and fill in:

```
GROQ_API_KEY=<ask [your name] for the key, or make your own free one at console.groq.com>
GOOGLE_MAPS_API_KEY=<ask [your name] for the key>
PORT=3000
```

Start it:

```bash
npm start
```

You should see: `T-Care backend running on http://localhost:3000`

**Test it's working** before moving on:

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "I lost my TCard, what do I do?", "location": {"lat": 43.6629, "lng": -79.3957}}'
```

You should get back a JSON response with a `title` and `summary`. If
this doesn't work, stop here and fix it before touching the app —
the mobile app depends on this running correctly.

## 4. Set up the mobile app

```bash
cd tcare-mobile
npm install
```

## 5. Point the app at YOUR backend

Find your computer's local IP address (not `localhost` — your phone
is a separate device and can't reach `localhost` on your computer):

- **Windows:** open Command Prompt, run `ipconfig`, look for "IPv4
  Address" (something like `192.168.x.x`)
- **Mac:** System Settings → WiFi → Details, or run `ifconfig` in
  Terminal
- **Linux:** run `ip addr` or `hostname -I`

Open `App.tsx`, find the `resolveQuery()` function, and make sure it's
pointed at your IP:

```ts
const res = await fetch('http://YOUR_IP_HERE:3000/api/query', { ... });
```

## 6. Run it

```bash
npx expo start
```

A QR code will appear in your terminal. Open the **Expo Go** app on
your phone and scan it (or use your phone's camera app on iOS). The
app should load on your phone.

## 7. Testing checklist

- [ ] Backend starts with no errors (`npm start` in `tcare-backend`)
- [ ] `curl` test above returns a valid response
- [ ] Expo app loads on your phone via Expo Go
- [ ] Tapping a suggestion chip on the Ask screen shows a loading
      state, then a result
- [ ] Try all 4 example queries (TCard, overwhelmed, accessibility,
      study help) and note anything that looks wrong
- [ ] Try typing your own custom question in the input bar

## Troubleshooting

- **"Network request failed" in the app** → your phone and computer
  probably aren't on the same WiFi, or you typed the wrong IP in
  `App.tsx`
- **Backend crashes on startup** → double check both API keys are
  actually pasted into `.env` with no extra quotes or spaces
- **Groq error in terminal** → check your Groq key is active at
  console.groq.com
- **Google Maps error** → this one needs billing enabled on the
  Google Cloud project even though it's within the free tier — check
  with [your name] if you don't have a key yet

## Questions / feedback

Note anything that feels off — wrong colors, weird spacing, slow
responses, wrong service matched to a question — and send it back so
we can fix it before showing this to the dean.
