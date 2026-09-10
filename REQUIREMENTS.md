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
PORT=3000
GROQ_API_KEY=<ask [your name] for the key, or make your own free one at console.groq.com>
GEOAPIFY_API_KEY=<ask [your name] for the key, or make your own free one at geoapify.com>
GMAIL_APP_PASSWORD=<ask [your name] for the app password for inquiries.tcare@gmail.com>
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

The app reads the backend address from an `EXPO_PUBLIC_API_URL`
environment variable. Create a `.env` file in `tcare-mobile` and add
your IP (keep the `http://` and the `:3000` port):

```
EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:3000
```

Restart the Expo dev server after changing `.env` so the new value is
picked up.

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
  probably aren't on the same WiFi, or you set the wrong IP in
  `EXPO_PUBLIC_API_URL` in `tcare-mobile/.env`
- **"Missing EXPO_PUBLIC_API_URL" in the app** → the `.env` file in
  `tcare-mobile` is missing the variable, or you didn't restart
  `npx expo start` after adding it
- **Backend crashes on startup** → double check the API keys are
  actually pasted into `.env` with no extra quotes or spaces
- **Groq error in terminal** → check your Groq key is active at
  console.groq.com
- **Geoapify / map error** → check your `GEOAPIFY_API_KEY` is set and
  active at geoapify.com — check with [your name] if you don't have a
  key yet
- **Contact form email fails** → confirm `GMAIL_APP_PASSWORD` is set
  in the backend `.env` (a Google App Password for
  inquiries.tcare@gmail.com)

## Questions / feedback

Note anything that feels off — wrong colors, weird spacing, slow
responses, wrong service matched to a question — and send it back so
we can fix it before showing this to the dean.
