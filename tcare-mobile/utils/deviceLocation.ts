import * as Location from 'expo-location';
import { Alert } from 'react-native';

export async function getDeviceLocation(
  onPositionError?: (error: unknown) => Promise<Location.LocationObject | null>,
) {
  const consent = await new Promise<boolean>((resolve) => {
    Alert.alert(
      'Use your location for directions?',
      'T-Care uses your location only to estimate walking time and show directions. You can still view office details without it.',
      [
        { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continue', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
  if (!consent) return;
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;

  let position;
  try {
    position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  } catch (error) {
    if (!onPositionError) throw error;
    position = await onPositionError(error);
  }
  if (position) return { lat: position.coords.latitude, lng: position.coords.longitude };
}
