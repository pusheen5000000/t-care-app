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
