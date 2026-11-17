# T-Care Mobile

Expo / React Native app for iOS and Android, targeting Expo SDK 58.
The app already connects to the Express backend and uses react-native-maps.

Follow the [repository quick start](../README.md#quick-start) to install
both apps, configure the backend URL, and open the app on your phone.
Do not run create-expo-app or copy these files into another project.

- `npm start`: start Expo Go over the local network.
- `npm run start:clear`: restart with a clean Metro cache after an upgrade.
- `npm run start:tunnel`: tunnel the Metro server when LAN access is blocked.
  The API needs its own phone-reachable URL; this does not tunnel port 3000.
- `npm run typecheck`: check TypeScript.
- `npx expo install --check`: check SDK dependency versions.
- `npx expo-doctor@latest`: check Expo project health.

Keep backend credentials out of this app. Only the public backend address
belongs in `EXPO_PUBLIC_API_URL`; see `.env.example`.

See [REQUIREMENTS.md](../REQUIREMENTS.md) for phone checks and troubleshooting.

## Platform layout

`App.tsx` owns the top and side safe areas; its footer owns the bottom safe
area. Screen content uses ordinary views so insets are applied only once.
Native modals render outside that shell, so edge-aligned sheets handle their
own insets. The tab bar uses 44-point targets on iOS and 48-dp targets on Android.

Chat uses Keyboard Controller's native animation for both the conversation
and composer. Both use the measured footer height as their offset; keep these
in sync. The footer stays in the layout behind the keyboard. Do not add a
second keyboard-avoiding wrapper, keyboard-event visibility toggle, or
layout-triggered scroll-to-end to Chat: those introduce separate movements.

On-device layout checks before release:

- iPhone with a home indicator: visit all tabs and a result; check that there
  is no empty strip above the footer and that Chat starts just below the status bar.
- Android with gesture navigation and with three-button navigation: confirm
  the tabs and urgent-support button sit above system navigation, and system
  Back dismisses sheets and returns from results.
- Both platforms: open the keyboard in Ask, Contact, and Chat; confirm focused
  fields and submit/send controls remain reachable. Open the “Did you mean”
  sheet and check its last action clears system navigation.
- Rotate to landscape and increase system text size; check cutout clearance,
  readable tab labels, scrolling, and access to sheet actions.
- Chat keyboard regression: with a long conversation, open and close the
  keyboard both at the latest message and while reading older messages. The
  messages, input, and latest-message button should lift together and return
  together, with no footer jump or opaque panel over the conversation. Repeat
  with interactive keyboard dismissal on iOS and Back dismissal on Android.
  Check Send and Latest message while the keyboard is open, and repeat with
  a short conversation, landscape, and a hardware keyboard.
