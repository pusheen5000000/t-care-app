import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors, spacing, fontSize, radius } from '../theme';
import type { QueryResult, LocationResult, RecoveryResult, SupportResources, TravelMode } from '../types';
import { openGoogleMapsDirections } from '../utils/googleMaps';

type Props = {
  result: QueryResult;
  showMap?: boolean;
  showLocationPaths?: boolean;
  onAskAnother: () => void;
  onRetry: () => void;
  onTravelModeChange: (mode: TravelMode) => Promise<boolean>;
  onShowWalkingRoute: () => Promise<boolean>;
  onCampusLocationPress: (serviceId: string, campusLocationName: string) => void;
  onCollegeSelect: (collegeId: string, serviceId: CollegeServiceId) => void;
};

type CollegeServiceId = 'academic-success' | 'financial-aid' | 'registrar-enrolment';
const COLLEGE_SERVICE_IDS = new Set<CollegeServiceId>([
  'academic-success',
  'financial-aid',
  'registrar-enrolment',
]);

const COLLEGES = [
  { id: 'innis', label: 'Innis College' },
  { id: 'new-college', label: 'New College' },
  { id: 'st-michaels', label: "St. Michael's College" },
  { id: 'trinity', label: 'Trinity College' },
  { id: 'university-college', label: 'University College' },
  { id: 'victoria', label: 'Victoria College' },
  { id: 'woodsworth', label: 'Woodsworth College' },
];

const TRAVEL_MODES: { key: TravelMode; label: string }[] = [
  { key: 'bike', label: 'Bike' },
  { key: 'car', label: 'Car' },
  { key: 'walk', label: 'Walk' },
  { key: 'transit', label: 'Transit' },
];

export function ResultScreen({ result, showMap = true, showLocationPaths = true, onAskAnother, onRetry, onTravelModeChange, onShowWalkingRoute, onCampusLocationPress, onCollegeSelect }: Props) {
  const isLocation = result.type === 'location';
  const isRecovery = result.type === 'recovery';
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

        {isRecovery && <RecoveryActions result={result} onRetry={onRetry} />}

        {isLocation && showMap && (
          <LocationBlock
            result={result as LocationResult}
            isPortrait={isPortrait}
            showLocationPaths={showLocationPaths}
            onTravelModeChange={onTravelModeChange}
            onShowWalkingRoute={onShowWalkingRoute}
          />
        )}
        {result.supportResources && (
          <SupportResourcesSection
            resources={result.supportResources}
            query={result.query}
            resultTitle={result.title}
            serviceId={result.type === 'recovery' ? undefined : result.serviceId}
            showLocationPaths={showLocationPaths}
            onCampusLocationPress={onCampusLocationPress}
            onCollegeSelect={onCollegeSelect}
          />
        )}
        <ResultNextStep result={result} showLocationPaths={showLocationPaths} />
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
  showLocationPaths,
  onTravelModeChange,
  onShowWalkingRoute,
}: {
  result: LocationResult;
  isPortrait: boolean;
  showLocationPaths: boolean;
  onTravelModeChange: (mode: TravelMode) => Promise<boolean>;
  onShowWalkingRoute: () => Promise<boolean>;
}) {
  const [travelMode, setTravelMode] = useState<TravelMode>('walk');
  const [isChangingMode, setIsChangingMode] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isWalkingPathExpanded, setIsWalkingPathExpanded] = useState(false);
  const selectTravelMode = async (mode: TravelMode, force = false) => {
    if ((!force && mode === travelMode) || isChangingMode) return;

    setIsChangingMode(true);
    const changed = await onTravelModeChange(mode);
    if (changed) {
      setTravelMode(mode);
      setRouteError(null);
    } else {
      setRouteError('We could not update this route. Your current route is still available—please try again.');
    }
    setIsChangingMode(false);
  };
  const showWalkingRoute = async () => {
    if (isLoadingRoute) return;
    setIsLoadingRoute(true);
    const loaded = await onShowWalkingRoute();
    if (!loaded) {
      setRouteError('We could not show a walking route. Your service details are still here. Try again or open the destination in Maps.');
    } else {
      setRouteError(null);
    }
    setIsLoadingRoute(false);
  };
  const routeCoords = geometryToCoordinates(result.polyline);
  const origin = result.origin;
  const destination = result.destination;
  const hasRoute = showLocationPaths && Boolean(origin && destination && routeCoords.length > 0);

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
          {hasRoute && origin && (
            <Marker
              coordinate={origin}
              title="You"
              pinColor={colors.accent}
            />
          )}
          {destination && (
            <Marker coordinate={destination} title={result.placeName} />
          )}
          {hasRoute && routeCoords.length > 0 && (
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

      {!hasRoute && destination && (
        <View style={styles.routePrompt}>
          <Text style={styles.routePromptTitle}>Need directions?</Text>
          <Text style={styles.routePromptBody}>Use your location only to show a walking route and time.</Text>
          <View style={styles.routeActions}>
            <TouchableOpacity style={styles.showRouteButton} onPress={() => void showWalkingRoute()} disabled={isLoadingRoute} accessibilityRole="button" accessibilityLabel="Show walking route">
              <Text style={styles.showRouteButtonText}>{isLoadingRoute ? 'Getting route…' : 'Show walking route'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.openMapsButton} onPress={() => void openGoogleMapsDirections(result.placeName, result.placeSubtitle)} accessibilityRole="button" accessibilityLabel="Open destination in Maps">
              <Text style={styles.openMapsButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
          {routeError && <Text style={styles.routeError} accessibilityLiveRegion="polite">{routeError}</Text>}
        </View>
      )}

      {hasRoute && <View style={styles.travelTimeCard}>
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
        {routeError && <>
          <Text style={styles.routeError} accessibilityLiveRegion="polite">{routeError}</Text>
          <TouchableOpacity onPress={() => void selectTravelMode(travelMode, true)} accessibilityRole="button" accessibilityLabel="Retry route update"><Text style={styles.retryRouteText}>Retry</Text></TouchableOpacity>
        </>}
      </View>}

      <View style={styles.statsRow}>
        <StatBox label="fee" value={result.fee} />
        <StatBox label="hours" value={result.hours} />
      </View>

      {hasRoute && result.steps && result.steps.length > 0 && (
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

function RecoveryActions({ result, onRetry }: { result: RecoveryResult; onRetry: () => void }) {
  return (
    <View style={styles.recoveryCard} accessibilityLiveRegion="polite">
      <Text style={styles.recoveryLabel}>Your question</Text>
      <Text style={styles.recoveryQuestion}>{result.query}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Try your question again"
        accessibilityHint="Sends the same question again"
      >
        <Text style={styles.retryButtonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
}

function ResultNextStep({ result, showLocationPaths }: { result: QueryResult; showLocationPaths: boolean }) {
  const isLocation = result.type === 'location';
  const primaryLink = getBestNextStepLink(result);
  const locationResult = result as LocationResult;
  const useDirections = isLocation
    && showLocationPaths
    && Boolean(locationResult.origin && geometryToCoordinates(locationResult.polyline).length > 0);
  const actionLabel = useDirections
    ? 'Open directions in Google Maps'
    : getActionLabel(result.query, result.title, primaryLink);
  const prompt = useDirections
    ? `Ready to find ${result.placeName}?`
    : getNextStepPrompt(result.query, result.title, actionLabel);

  const handlePress = async () => {
    if (useDirections) {
      await openGoogleMapsDirections(result.placeName, result.placeSubtitle);
      return;
    }

    const url = primaryLink?.url ?? 'https://www.utoronto.ca/';
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  };

  return (
    <View style={styles.nextStepSection}>
      <Text style={styles.nextStepPrompt}>{prompt}</Text>
      <TouchableOpacity
        style={styles.nextStepButton}
        onPress={() => void handlePress()}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        accessibilityHint={useDirections ? `Opens directions to ${result.placeName} in Google Maps or your default browser` : 'Opens the most relevant official resource for your question'}
      >
        <Text style={styles.nextStepButtonText}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function SupportResourcesSection({
  resources,
  query,
  resultTitle,
  serviceId,
  showLocationPaths,
  onCampusLocationPress,
  onCollegeSelect,
}: {
  resources: SupportResources;
  query: string;
  resultTitle: string;
  serviceId?: string;
  showLocationPaths: boolean;
  onCampusLocationPress: (serviceId: string, campusLocationName: string) => void;
  onCollegeSelect: (collegeId: string, serviceId: CollegeServiceId) => void;
}) {
  const [collegePickerService, setCollegePickerService] = useState<CollegeServiceId | null>(null);
  const [collegeSearch, setCollegeSearch] = useState('');
  const governmentLinks = resources.links.filter((link) => link.group === 'Government support');
  const universityLinks = resources.links.filter((link) => link.group === 'U of T resources');

  const isCollegeService = (candidate?: string): candidate is CollegeServiceId =>
    Boolean(candidate) && COLLEGE_SERVICE_IDS.has(candidate as CollegeServiceId);
  const isUtsgLocation = (locationName: string) => /\b(?:st\.?\s*george|utsg)\b/i.test(locationName);
  const usesInAppDirections = Boolean(serviceId);
  const pickerBody = collegePickerService === 'financial-aid'
    ? "Choose your UTSG college to find its financial-aid and awards office."
    : collegePickerService === 'academic-success'
      ? 'Choose your UTSG college to find its academic advising office.'
      : 'Choose your UTSG college to find its registrar office.';

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  return (
    <>
      <View style={styles.resourcesSection}>
      <Text style={styles.resourcesTitle}>{resources.title ?? 'Mental health support'}</Text>
      <Text style={styles.resourcesIntro}>{resources.intro ?? 'Choose the support that feels right for you. The map above routes to St. George Health & Wellness.'}</Text>

      {resources.campusLocations.length > 0 && (
        <Text style={styles.resourceHeading}>{resources.campusHeading ?? 'On-campus support'}</Text>
      )}
      {resources.campusLocations.map((location) => {
        const opensCollegePicker = isCollegeService(serviceId) && isUtsgLocation(location.name);
        const actionLabel = opensCollegePicker
          ? 'Choose your college'
          : usesInAppDirections
            ? 'Show in T-Care'
            : 'Get directions in Google Maps';
        return (
        <View
          key={location.name}
          style={styles.locationRow}
        >
          <Text style={styles.locationName}>{location.name}</Text>
          <Text style={styles.locationAddress}>{location.location}</Text>
          <Text style={styles.locationDetail}>{location.detail}</Text>
          {serviceId && <TouchableOpacity
            onPress={() => {
              if (opensCollegePicker) {
                setCollegePickerService(serviceId as CollegeServiceId);
                setCollegeSearch('');
                return;
              }
              if (usesInAppDirections && serviceId) {
                onCampusLocationPress(serviceId, location.name);
                return;
              }
              void openGoogleMapsDirections(location.name, location.location);
            }}
            accessibilityRole="button"
            accessibilityLabel={opensCollegePicker ? `Choose a college for ${location.name}` : `${actionLabel} to ${location.name}`}
            accessibilityHint={opensCollegePicker ? 'Opens a list of UTSG colleges' : usesInAppDirections ? 'Opens this office as the T-Care map destination' : 'Opens turn-by-turn directions in Google Maps'}
          >
            <Text style={styles.locationAction}>{actionLabel}</Text>
          </TouchableOpacity>}
        </View>
        );
      })}

      <ResourceLinks title="Government-approved support" links={governmentLinks} query={query} contextTitle={resultTitle} onOpen={openLink} />
      <ResourceLinks title="U of T resources" links={universityLinks} query={query} contextTitle={resultTitle} onOpen={openLink} />
      </View>

      <Modal visible={collegePickerService !== null} transparent animationType="fade" onRequestClose={() => setCollegePickerService(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCollegePickerService(null)}>
          <Pressable style={styles.modalCard} onPress={() => undefined} accessibilityViewIsModal>
            <Text style={styles.modalTitle}>Choose your college</Text>
            <Text style={styles.modalBody}>{pickerBody}</Text>
            <TextInput value={collegeSearch} onChangeText={setCollegeSearch} placeholder="Search colleges" placeholderTextColor={colors.textMuted} style={styles.collegeSearch} accessibilityLabel="Search UTSG colleges" />
            <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
              {COLLEGES.filter((college) => college.label.toLowerCase().includes(collegeSearch.trim().toLowerCase())).map((college) => (
                <TouchableOpacity
                  key={college.id}
                  style={styles.collegeOption}
                  onPress={() => {
                    if (!collegePickerService) return;
                    onCollegeSelect(college.id, collegePickerService);
                    setCollegePickerService(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={college.label}
                >
                  <Text style={styles.collegeOptionText}>{college.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.unknownCollegeButton} onPress={() => { if (collegePickerService) { onCollegeSelect('utsg', collegePickerService); setCollegePickerService(null); } }} accessibilityRole="button" accessibilityLabel="I do not know my college"><Text style={styles.unknownCollegeText}>I don’t know my college</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setCollegePickerService(null)} accessibilityRole="button" accessibilityLabel="Cancel college selection">
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function ResourceLinks({
  title,
  links,
  query,
  contextTitle,
  onOpen,
}: {
  title: string;
  links: SupportResources['links'];
  query: string;
  contextTitle: string;
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
            <Text style={styles.resourceLinkAction}>{getActionLabel(query, contextTitle, link)}</Text>
          </View>
          <Text style={styles.resourceLinkArrow} accessibilityElementsHidden>↗</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function getBestNextStepLink(result: QueryResult): SupportResources['links'][number] | undefined {
  const links = result.supportResources?.links ?? [];
  if (links.length < 2) return links[0];

  const queryTerms = new Set(
    `${result.query} ${result.title}`
      .toLowerCase()
      .match(/[a-z]{3,}/g)
      ?.filter((term) => !new Set(['about', 'where', 'there', 'would', 'could', 'please', 'need', 'help', 'with', 'find', 'what', 'that', 'this']).has(term))
      ?? [],
  );

  return links.reduce((best, link) => {
    const score = (candidate: SupportResources['links'][number]) => {
      const text = `${candidate.title} ${candidate.description}`.toLowerCase();
      return [...queryTerms].reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0)
        + (candidate.group === 'U of T resources' ? 0.25 : 0);
    };

    return score(link) > score(best) ? link : best;
  });
}

function getNextStepPrompt(query: string, title: string, actionLabel: string) {
  const cleanTitle = title === "Here's what I found" ? query.trim() : title;
  if (/\b(?:book|appointment|advising)\b/i.test(actionLabel)) return `Ready to book support for ${cleanTitle}?`;
  if (/\b(?:apply|manage|explore|learn|find|read|review)\b/i.test(actionLabel)) return `Ready to continue with ${cleanTitle}?`;
  return `Ready to open help for ${cleanTitle}?`;
}

function getActionLabel(
  query: string,
  contextTitle: string,
  link?: SupportResources['links'][number],
) {
  const context = `${query} ${contextTitle} ${link?.title ?? ''} ${link?.description ?? ''}`.toLowerCase();

  if (/appointment|advising/.test(context)) return 'Book an appointment';
  if (/mental health|counselling|counseling|wellness/.test(context)) return 'Read more about support';
  if (/accessibility|accommodation|assistive/.test(context)) return 'Learn about accommodations';
  if (/financial aid|award|scholarship|osap|funding/.test(context)) return 'Explore funding options';
  if (/housing|residence/.test(context)) return 'Explore housing options';
  if (/immigration|international/.test(context)) return 'Explore international support';
  if (/registrar|enrolment|acorn|tuition|fee|deadline/.test(context)) return 'Manage your enrolment';
  if (/career|job|work study/.test(context)) return 'Explore career support';
  if (/library|study space|research|technology|wi-fi|utorid/.test(context)) return 'Find study resources';
  if (/food|basic needs/.test(context)) return 'Find food support';
  if (/sexual violence|harassment/.test(context)) return 'Explore support options';
  if (/safety|travelsafer|escort/.test(context)) return 'Review safety options';

  return `Visit ${link?.title ?? 'U of T support'}`;
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
  recoveryCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  recoveryLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  recoveryQuestion: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    justifyContent: 'center',
    marginTop: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  retryButtonText: {
    color: colors.accentOn,
    fontSize: fontSize.base,
    fontWeight: '700',
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
  routePrompt: { backgroundColor: colors.infoBg, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.sm, padding: spacing.md },
  routePromptTitle: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700' },
  routePromptBody: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18, marginTop: spacing.xs },
  routeActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  showRouteButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.md, flex: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: spacing.sm },
  showRouteButtonText: { color: colors.accentOn, fontSize: fontSize.sm, fontWeight: '700' },
  openMapsButton: { alignItems: 'center', borderColor: colors.accent, borderRadius: radius.md, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: spacing.sm },
  openMapsButtonText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
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
  routeError: { color: colors.danger, fontSize: fontSize.sm, lineHeight: 18, marginTop: spacing.sm, textAlign: 'center' },
  retryRouteText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', marginTop: spacing.sm, textAlign: 'center' },
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
  resourceLinkAction: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', marginTop: spacing.xs },
  resourceLinkArrow: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '700' },
  modalBackdrop: { backgroundColor: 'rgba(0, 0, 0, 0.45)', flex: 1, justifyContent: 'center', padding: spacing.xl },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, gap: spacing.sm, maxHeight: '82%', padding: spacing.lg },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  modalBody: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, marginBottom: spacing.xs },
  options: { flexGrow: 0 },
  collegeSearch: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.textPrimary, fontSize: fontSize.base, marginBottom: spacing.sm, minHeight: 44, paddingHorizontal: spacing.md },
  collegeOption: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, justifyContent: 'center', marginBottom: spacing.sm, minHeight: 44, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  collegeOptionText: { color: colors.accent, fontSize: fontSize.base, fontWeight: '600' },
  unknownCollegeButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, marginTop: spacing.sm },
  unknownCollegeText: { color: colors.accent, fontSize: fontSize.base, fontWeight: '700' },
  cancelButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  cancelButtonText: { color: colors.textSecondary, fontSize: fontSize.base, fontWeight: '600' },
  nextStepSection: { borderTopColor: colors.border, borderTopWidth: 1, gap: spacing.sm, marginTop: spacing.lg, paddingTop: spacing.lg },
  nextStepPrompt: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700' },
  nextStepButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.lg, justifyContent: 'center', minHeight: 48, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  nextStepButtonText: { color: colors.accentOn, fontSize: fontSize.base, fontWeight: '700' },
});
