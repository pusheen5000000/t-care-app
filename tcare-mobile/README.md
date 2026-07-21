# T-Care Mobile (Expo)

Redesigned mobile version of T-Care — square corners throughout, colors
pulled from the official U of T brand palette (brand.utoronto.ca).

## What's here

- `theme.ts` — all colors, spacing, and font sizes in one place. `radius`
  is kept at `0` everywhere (no rounded corners anywhere in the UI).
- `screens/AskScreen.tsx` — entry point: greeting, tappable suggestion
  chips, chat-style input bar at the bottom.
- `screens/ResultScreen.tsx` — answer card + map/route block (this maps
  to your existing `InfoCard` / `LocationCard` / `RouteCard` logic from
  the web app, just restructured as a real screen instead of a stacked
  section on one page).
- `components/TabBar.tsx` — bottom tab bar (Ask / Resources / Saved).
- `App.tsx` — wires it all together. Has a `resolveQuery()` stub with
  a couple of hardcoded example responses so you can run this
  immediately without your backend — swap that function for a real
  `fetch()` call to your Express server.
- `types.ts` — shared result types, same shape as your existing
  `QueryResult` type from the web app.

## Getting it running (Windows/Linux, no Mac needed)

```bash
npx create-expo-app tcare-mobile --template blank-typescript
cd tcare-mobile
# copy theme.ts, types.ts, App.tsx, screens/, components/ from this
# folder into the new project, overwriting the generated App.tsx
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your iPhone — the app will
load live on your phone.

## Wiring up your real backend

In `App.tsx`, replace the body of `resolveQuery()` with a call to your
existing Express endpoint, e.g.:

```ts
async function resolveQuery(query: string): Promise<QueryResult> {
  const res = await fetch('https://your-backend.com/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  return res.json();
}
```

## Swapping in a real map

`ResultScreen.tsx` currently renders a placeholder box where the map
goes. Swap it for `react-native-maps`:

```bash
npx expo install react-native-maps
```

Then feed it markers/route coordinates from your Geoapify Routing API
response (same data your web app's `RouteCard` already uses).

## Colors used (U of T brand guide)

| Name        | Hex       | Usage                          |
|-------------|-----------|---------------------------------|
| U of T Blue | `#1E3765` | Primary — buttons, header logo |
| Sky (tint)  | `#E8F1F5`| Answer card background          |
| Cool Gray   | `#D0D1C9`| Borders, dividers                |
| Black       | `#000000`| Body text                        |
| White       | `#FFFFFF`| Backgrounds/surfaces             |

Secondary brand colors (teal `#00A189`, red `#DC4633`, purple `#6D247A`,
yellow `#F1C500`) aren't used yet — the brand guide says to use these
as accents only, so there's room to bring one in for things like
success/error states or category tags on the Resources screen later.
