import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors, spacing, fontSize, radius } from '../theme';
import type { QueryResult, LocationResult, TravelMode } from '../types';

type Props = {
  result: QueryResult;
  onAskAnother: () => void;
  onTravelModeChange: (mode: TravelMode) => Promise<boolean>;
};

const TRAVEL_MODES: { key: TravelMode; label: string }[] = [
  { key: 'bike', label: 'Bike' },
  { key: 'car', label: 'Car' },
  { key: 'walk', label: 'Walk' },
  { key: 'transit', label: 'Transit' },
];

export function ResultScreen({ result, onAskAnother, onTravelModeChange }: Props) {
  const isLocation = result.type === 'location';
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onAskAnother} activeOpacity={0.7}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {result.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.answerCard}>
          <Text style={styles.answerTitle}>{result.title}</Text>
          <Text style={styles.answerBody}>{result.summary}</Text>
        </View>

        {isLocation && (
          <LocationBlock
            result={result as LocationResult}
            isPortrait={isPortrait}
            onTravelModeChange={onTravelModeChange}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Flattens Geoapify's GeoJSON geometry (LineString or MultiLineString)
// into a flat array of {latitude, longitude} points for react-native-maps.
function geometryToCoordinates(
  geometry: LocationResult['polyline']
): { latitude: number; longitude: number }[] {
  if (!geometry) return [];

  const toLatLng = (pair: number[]) => ({
    latitude: pair[1],
    longitude: pair[0],
  });

  if (geometry.type === 'LineString') {
    return (geometry.coordinates as number[][]).map(toLatLng);
  }

  if (geometry.type === 'MultiLineString') {
    return (geometry.coordinates as number[][][]).flat().map(toLatLng);
  }

  return [];
}

function LocationBlock({
  result,
  isPortrait,
  onTravelModeChange,
}: {
  result: LocationResult;
  isPortrait: boolean;
  onTravelModeChange: (mode: TravelMode) => Promise<boolean>;
}) {
  const [travelMode, setTravelMode] = useState<TravelMode>('walk');
  const [isChangingMode, setIsChangingMode] = useState(false);
  const selectTravelMode = async (mode: TravelMode) => {
    if (mode === travelMode || isChangingMode) return;

    setIsChangingMode(true);
    const changed = await onTravelModeChange(mode);
    if (changed) setTravelMode(mode);
    setIsChangingMode(false);
  };
  const routeCoords = geometryToCoordinates(result.polyline);
  const origin = result.origin;
  const destination = result.destination;

  const initialRegion = destination
    ? {
        latitude: destination.latitude,
        longitude: destination.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : undefined;

  return (
    <>
      <View style={styles.mapCard}>
        <MapView style={[styles.map, isPortrait && styles.mapPortrait]} initialRegion={initialRegion}>
          {origin && (
            <Marker
              coordinate={origin}
              title="You"
              pinColor={colors.accent}
            />
          )}
          {destination && (
            <Marker coordinate={destination} title={result.placeName} />
          )}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={colors.accent}
              strokeWidth={4}
            />
          )}
        </MapView>
        <View style={styles.mapCardFooter}>
          <Text style={styles.placeName}>{result.placeName}</Text>
          <Text style={styles.placeSubtitle}>{result.placeSubtitle}</Text>
        </View>
      </View>

      <View style={styles.travelTimeCard}>
        <Text style={styles.travelTimeLabel}>Time to destination</Text>
        <Text style={styles.travelTimeValue}>
          {(result.travelMinutes ?? result.walkMinutes) > 0
            ? `${result.travelMinutes ?? result.walkMinutes} min`
            : 'Unavailable'}
        </Text>
        <View style={styles.travelModes}>
          {TRAVEL_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.key}
              accessibilityRole="button"
              accessibilityState={{ selected: travelMode === mode.key }}
              activeOpacity={0.8}
              disabled={isChangingMode}
              onPress={() => selectTravelMode(mode.key)}
              style={[styles.travelMode, travelMode === mode.key && styles.travelModeActive]}
            >
              <Text style={[styles.travelModeText, travelMode === mode.key && styles.travelModeTextActive]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {isChangingMode && (
          <Text style={styles.travelTimeNote}>Updating route…</Text>
        )}
      </View>

      <View style={styles.statsRow}>
        <StatBox label="fee" value={result.fee} />
        <StatBox label="hours" value={result.hours} />
      </View>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    color: colors.accent,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  answerCard: {
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  answerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.infoText,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  answerBody: {
    fontSize: fontSize.base,
    color: colors.infoText,
    lineHeight: 20,
    textAlign: 'center',
  },
  mapCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  map: {
    height: 220,
    width: '100%',
  },
  mapPortrait: {
    height: 300,
  },
  mapCardFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  placeName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  placeSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    alignSelf: 'stretch',
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statLabel: {
    alignSelf: 'stretch',
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  travelTimeCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  travelTimeLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  travelTimeValue: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  travelModes: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    width: '100%',
  },
  travelMode: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: spacing.xs,
  },
  travelModeActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  travelModeText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  travelModeTextActive: {
    color: colors.accentOn,
  },
  travelTimeNote: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
