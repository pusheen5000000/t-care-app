import { Linking } from 'react-native';

/**
 * Google Maps URLs open the installed Google Maps app when available and
 * otherwise continue in the device's default browser.
 */
export function googleMapsDirectionsUrl(placeName: string, placeSubtitle: string) {
  const destination = encodeURIComponent(`${placeName}, ${placeSubtitle}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export async function openGoogleMapsDirections(placeName: string, placeSubtitle: string) {
  const url = googleMapsDirectionsUrl(placeName, placeSubtitle);
  if (await Linking.canOpenURL(url)) await Linking.openURL(url);
}
