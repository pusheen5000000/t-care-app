import * as Clipboard from 'expo-clipboard';
import { Alert, Linking } from 'react-native';

/**
 * Google Maps URLs open the installed Google Maps app when available and
 * otherwise continue in the device's default browser.
 */
export function googleMapsDirectionsUrl(placeName: string, placeSubtitle: string) {
  const destination = encodeURIComponent(`${placeName}, ${placeSubtitle}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export async function openExternalLink(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Could not open link', url, [
      { text: 'Close', style: 'cancel' },
      { text: 'Copy link', onPress: async () => {
        try {
          if (!await Clipboard.setStringAsync(url)) throw new Error();
        } catch {
          Alert.alert('Could not copy link', url);
        }
      } },
    ]);
  }
}

export async function openGoogleMapsDirections(placeName: string, placeSubtitle: string) {
  return openExternalLink(googleMapsDirectionsUrl(placeName, placeSubtitle));
}
