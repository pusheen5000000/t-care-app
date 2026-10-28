# T-Care setup and phone testing

Follow the [quick start](README.md#quick-start) first. It covers Node,
backend credentials, both terminals, and the phone's backend address.
Use the committed lockfiles with `npm ci` for reproducible installations.

## Check before opening the app

1. Update Expo Go and confirm it supports SDK 58 at https://expo.dev/go.
   Expo Go supports a specific SDK; an older store build cannot load SDK 58.
   If SDK 58 is unavailable for your device, use an SDK 58 development build:
   https://docs.expo.dev/develop/development-builds/create-a-build/.
2. Start the backend with `npm start` inside `tcare-backend`.
3. Open `http://YOUR_COMPUTER_IP:3000/health` from the phone's browser.
   Expect `{"ok":true}`. This confirms networking, not API credentials.
4. Set the same base URL (without `/health`) in `tcare-mobile/.env`.
5. Run `npm run start:clear` inside `tcare-mobile` after upgrading or
   changing environment settings. Scan the QR code to open the app.

## If Wi-Fi does not work

- Use your Wi-Fi adapter's IPv4 address, not a VPN, virtual adapter, or
  `localhost`. Keep port 3000 unless you changed backend `PORT`.
- Allow Node.js through the private-network firewall. Guest/campus Wi-Fi
  may isolate devices; try a trusted network or personal hotspot.
- `npm run start:tunnel` can expose the Expo development server. It does
  **not** expose the backend: use a separately hosted HTTPS API or a
  separate backend tunnel, then set `EXPO_PUBLIC_API_URL` to that address.
  Restart Expo after changing it. Do not expose backend secrets in the app.
- If Expo offers a development-build QR code, press `s` to switch to Expo Go.

## Verification

From `tcare-mobile`:

```bash
npm run typecheck
npx expo install --check
npx expo-doctor@latest
```

From `tcare-backend`, run `npm test`.

On a physical iPhone and Android phone:

- Load the app through Expo Go with no SDK mismatch.
- Grant location permission, submit a question, and check the destination,
  map, and walking route. Also check behavior with permission denied.
- Try TCard, accessibility, health/wellness, and study-help suggestions.
- Submit a custom question and check campus/college selection when offered.
- Test the contact form with configured Gmail credentials.

## Troubleshooting

- **Network request failed:** repeat the phone browser health check and
  verify `EXPO_PUBLIC_API_URL`. An Expo tunnel alone cannot fix API access.
- **Missing EXPO_PUBLIC_API_URL:** copy the mobile `.env.example`, set the
  URL, and restart Expo.
- **SDK mismatch:** verify Expo Go supports SDK 58. `--clear` cannot fix a
  native SDK mismatch. Development builds must be rebuilt after an upgrade.
- **Groq or routing errors:** verify backend `GROQ_API_KEY` and
  `GEOAPIFY_API_KEY`. The health endpoint does not validate these keys.
- **Contact email fails:** configure a Google App Password for
  inquiries.tcare@gmail.com in backend `GMAIL_APP_PASSWORD`.

Setup remains manual for now; Bash automation can be added later.
