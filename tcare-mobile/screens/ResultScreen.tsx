import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors, spacing, fontSize } from '../theme';
import type { QueryResult, LocationResult } from '../types';

type Props = {
  result: QueryResult;
  onAskAnother: () => void;
};

export function ResultScreen({ result, onAskAnother }: Props) {
  const isLocation = result.type === 'location';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onAskAnother} activeOpacity={0.7}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerQuery} numberOfLines={1}>
          "{result.query}"
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.answerCard}>
          <Text style={styles.answerTitle}>{result.title}</Text>
          <Text style={styles.answerBody}>{result.summary}</Text>
        </View>

        {isLocation && <LocationBlock result={result as LocationResult} />}
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

function LocationBlock({ result }: { result: LocationResult }) {
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
        <MapView style={styles.map} initialRegion={initialRegion}>
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

      <View style={styles.statsRow}>
        <StatBox label="walk" value={`${result.walkMinutes} min`} />
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
  headerQuery: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
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
  },
  answerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.infoText,
    marginBottom: spacing.xs,
  },
  answerBody: {
    fontSize: fontSize.base,
    color: colors.infoText,
    lineHeight: 20,
  },
  mapCard: {
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  map: {
    height: 220,
    width: '100%',
  },
  mapCardFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  placeName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
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
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
});