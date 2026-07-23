import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors, spacing, fontSize, radius } from '../theme';
import type { QueryResult, LocationResult, SupportResources, TravelMode } from '../types';

type Props = {
  result: QueryResult;
  onAskAnother: () => void;
  onTravelModeChange: (mode: TravelMode) => Promise<boolean>;
  onCampusLocationPress: (serviceId: string, campusLocationName: string) => void;
};

const TRAVEL_MODES: { key: TravelMode; label: string }[] = [
  { key: 'bike', label: 'Bike' },
  { key: 'car', label: 'Car' },
  { key: 'walk', label: 'Walk' },
  { key: 'transit', label: 'Transit' },
];

export function ResultScreen({ result, onAskAnother, onTravelModeChange, onCampusLocationPress }: Props) {
  const isLocation = result.type === 'location';
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onAskAnother}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Ask another question"
        >
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
        {result.supportResources && (
          <SupportResourcesSection
            resources={result.supportResources}
            serviceId={result.serviceId}
            onCampusLocationPress={onCampusLocationPress}
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
  const [isWalkingPathExpanded, setIsWalkingPathExpanded] = useState(false);
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
        <MapView
          style={[styles.map, isPortrait && styles.mapPortrait]}
          initialRegion={initialRegion}
          accessibilityLabel={`Map to ${result.placeName}`}
        >
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
              accessibilityLabel={`${mode.label} travel mode`}
              accessibilityHint="Updates the route and travel time"
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

      {result.steps && result.steps.length > 0 && (
        <View style={styles.pathCard}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ expanded: isWalkingPathExpanded }}
            accessibilityLabel={`Walking path, ${result.steps.length} steps`}
            accessibilityHint={isWalkingPathExpanded ? 'Hides turn-by-turn directions' : 'Shows turn-by-turn directions'}
            activeOpacity={0.8}
            onPress={() => setIsWalkingPathExpanded((expanded) => !expanded)}
            style={styles.pathToggle}
          >
            <Text style={styles.pathTitle}>Walking path</Text>
            <Text style={styles.pathToggleLabel}>
              {isWalkingPathExpanded ? 'Hide directions ▲' : 'Show directions ▼'}
            </Text>
          </TouchableOpacity>
          {isWalkingPathExpanded && result.steps.map((step, index) => (
            <View key={`${step.instruction}-${index}`} style={styles.pathStep}>
              <Text style={styles.pathNumber}>{index + 1}</Text>
              <Text style={styles.pathText}>
                {step.instruction}{step.distance ? ` · ${step.distance}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function SupportResourcesSection({
  resources,
  serviceId,
  onCampusLocationPress,
}: {
  resources: SupportResources;
  serviceId?: string;
  onCampusLocationPress: (serviceId: string, campusLocationName: string) => void;
}) {
  const governmentLinks = resources.links.filter((link) => link.group === 'Government support');
  const universityLinks = resources.links.filter((link) => link.group === 'U of T resources');

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  return (
    <View style={styles.resourcesSection}>
      <Text style={styles.resourcesTitle}>{resources.title ?? 'Mental health support'}</Text>
      <Text style={styles.resourcesIntro}>{resources.intro ?? 'Choose the support that feels right for you. The map above routes to St. George Health & Wellness.'}</Text>

      <Text style={styles.resourceHeading}>{resources.campusHeading ?? 'On-campus support'}</Text>
      {resources.campusLocations.map((location) => (
        <TouchableOpacity
          key={location.name}
          style={styles.locationRow}
          disabled={!serviceId}
          onPress={() => serviceId && onCampusLocationPress(serviceId, location.name)}
          accessibilityRole="button"
          accessibilityLabel={`Show ${location.name} on the map`}
          accessibilityHint="Opens this office as the map destination"
        >
          <Text style={styles.locationName}>{location.name}</Text>
          <Text style={styles.locationAddress}>{location.location}</Text>
          <Text style={styles.locationDetail}>{location.detail}</Text>
          {serviceId && <Text style={styles.locationAction}>Show on map</Text>}
        </TouchableOpacity>
      ))}

      <ResourceLinks title="Government-approved support" links={governmentLinks} onOpen={openLink} />
      <ResourceLinks title="U of T resources" links={universityLinks} onOpen={openLink} />
    </View>
  );
}

function ResourceLinks({
  title,
  links,
  onOpen,
}: {
  title: string;
  links: SupportResources['links'];
  onOpen: (url: string) => Promise<void>;
}) {
  if (!links.length) return null;

  return (
    <View style={styles.linkGroup}>
      <Text style={styles.resourceHeading}>{title}</Text>
      {links.map((link) => (
        <TouchableOpacity
          key={link.url}
          style={styles.resourceLink}
          onPress={() => void onOpen(link.url)}
          accessibilityRole="link"
          accessibilityLabel={link.title}
          accessibilityHint="Opens an external support website"
        >
          <View style={styles.resourceLinkCopy}>
            <Text style={styles.resourceLinkTitle}>{link.title}</Text>
            <Text style={styles.resourceLinkDescription}>{link.description}</Text>
          </View>
          <Text style={styles.resourceLinkArrow} accessibilityElementsHidden>↗</Text>
        </TouchableOpacity>
      ))}
    </View>
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
  backButton: {
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
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
    borderRadius: radius.lg,
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
    borderRadius: radius.md,
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
    minHeight: 44,
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
  pathCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  pathTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  pathToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  pathToggleLabel: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  pathStep: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pathNumber: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    color: colors.accentOn,
    fontSize: fontSize.sm,
    fontWeight: '700',
    height: 20,
    minWidth: 20,
    overflow: 'hidden',
    textAlign: 'center',
  },
  pathText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  resourcesSection: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.lg,
  },
  resourcesTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  resourcesIntro: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  resourceHeading: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  locationRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 2,
    padding: spacing.md,
  },
  locationName: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700' },
  locationAddress: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '600', lineHeight: 18 },
  locationDetail: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },
  locationAction: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', marginTop: spacing.xs },
  linkGroup: { gap: spacing.sm, marginTop: spacing.sm },
  resourceLink: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 64,
    padding: spacing.md,
  },
  resourceLinkCopy: { flex: 1, gap: 2 },
  resourceLinkTitle: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700' },
  resourceLinkDescription: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },
  resourceLinkArrow: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '700' },
});
