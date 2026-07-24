import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import {
  Animated,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Modal,
  Pressable,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';
import type { SupportResources } from '../types';
import { openGoogleMapsDirections } from '../utils/googleMaps';

type Coordinate = { latitude: number; longitude: number };
type RouteStep = { instruction: string; distance: string };

function confirmLocationUse(): Promise<boolean> {
  return new Promise((resolve) => {
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
}

type Route = {
  placeName: string;
  placeSubtitle: string;
  walkMinutes: number;
  distanceText?: string | null;
  steps: RouteStep[];
  origin?: Coordinate;
  destination?: Coordinate;
  polyline?: { type: string; coordinates: number[][] | number[][][] } | null;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  route?: Route;
  serviceId?: string;
  supportResources?: SupportResources;
  facilityPicker?: 'campus' | 'college';
  retryQuery?: string;
};

type QueryResponse = {
  type?: 'info' | 'location';
  title?: string;
  summary?: string;
  placeName?: string;
  placeSubtitle?: string;
  walkMinutes?: number;
  distanceText?: string | null;
  steps?: RouteStep[];
  origin?: Coordinate;
  destination?: Coordinate;
  polyline?: Route['polyline'];
  serviceId?: string;
  supportResources?: SupportResources;
  facilityPicker?: 'campus' | 'college';
  error?: string;
};

// Set EXPO_PUBLIC_API_URL to your computer's LAN address when testing on a
// physical device, for example: http://192.168.1.20:3000.
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

const RECOVERY_RESOURCES: SupportResources = {
  title: 'Official U of T support',
  intro: 'While T-AI reconnects, these official sites can help you find the next step.',
  campusLocations: [],
  links: [
    { group: 'U of T resources', title: 'U of T Student Life', description: 'Find student services, support, and campus resources.', url: 'https://studentlife.utoronto.ca/' },
    { group: 'U of T resources', title: 'University Registrar', description: 'Official information about registration, records, fees, and academic services.', url: 'https://www.registrar.utoronto.ca/' },
  ],
};

const INITIAL: Message[] = [
  {
    id: '1',
    role: 'assistant',
    text: "Hi! I'm T-AI, your campus support assistant. Ask about academics, money, housing, international support, safety, careers, libraries, food, wellbeing, or accessibility. I can also find campus buildings by name or timetable code, like “Where is Bahen?” or “How do I get to SS 1083?”",
  },
];

const COLLEGES = [
  { id: 'innis', label: 'Innis College' },
  { id: 'new-college', label: 'New College' },
  { id: 'st-michaels', label: "St. Michael's College" },
  { id: 'trinity', label: 'Trinity College' },
  { id: 'university-college', label: 'University College' },
  { id: 'victoria', label: 'Victoria College' },
  { id: 'woodsworth', label: 'Woodsworth College' },
];

const CAMPUSES = [
  { id: 'utsg', label: 'UTSG (St. George Campus)', match: /utsg|st\.?\s*george/i },
  { id: 'utsc', label: 'UTSC (Scarborough Campus)', match: /utsc|scarborough/i },
  { id: 'utm', label: 'UTM (Mississauga Campus)', match: /utm|mississauga/i },
];

function TAIThinkingIndicator() {
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animations = dotAnimations.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 120),
          Animated.timing(value, {
            toValue: -6,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.delay((2 - index) * 120),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [dotAnimations]);

  return (
    <View style={styles.thinkingBubble} accessibilityLabel="T-AI is thinking">
      {dotAnimations.map((animation, index) => (
        <Animated.View
          key={index}
          style={[styles.thinkingDot, { transform: [{ translateY: animation }] }]}
        />
      ))}
    </View>
  );
}

function geometryToCoordinates(polyline: Route['polyline']): Coordinate[] {
  if (!polyline) return [];
  const toCoordinate = ([longitude, latitude]: number[]) => ({ latitude, longitude });
  if (polyline.type === 'LineString') return (polyline.coordinates as number[][]).map(toCoordinate);
  if (polyline.type === 'MultiLineString') {
    return (polyline.coordinates as number[][][]).flat().map(toCoordinate);
  }
  return [];
}

function RouteCard({ route, onMapReady }: { route: Route; onMapReady?: () => void }) {
  const coordinates = geometryToCoordinates(route.polyline);
  const [directionsVisible, setDirectionsVisible] = useState(false);
  const mapRef = useRef<MapView>(null);
  const region = route.destination && {
    latitude: route.destination.latitude,
    longitude: route.destination.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  if (!region) return null;

  const fitRoute = () => {
    const points = coordinates.length > 0
      ? coordinates
      : [route.origin, route.destination].filter(Boolean) as Coordinate[];

    if (points.length > 1) {
      mapRef.current?.fitToCoordinates(points, {
        animated: false,
        edgePadding: { top: 36, right: 36, bottom: 36, left: 36 },
      });
    }
    onMapReady?.();
  };

  return (
    <View style={styles.routeCard}>
      <MapView ref={mapRef} style={styles.routeMap} initialRegion={region} onMapReady={fitRoute}>
        {route.origin && <Marker coordinate={route.origin} title="You" pinColor={colors.accent} />}
        <Marker coordinate={route.destination} title={route.placeName} />
        {coordinates.length > 0 && <Polyline coordinates={coordinates} strokeColor={colors.accent} strokeWidth={4} />}
      </MapView>
      <View style={styles.routeDetails}>
        <Text style={styles.routeName}>{route.placeName}</Text>
        <Text style={styles.routeAddress}>{route.placeSubtitle}</Text>
        {route.origin && (
          <Text style={styles.routeTime}>
            {route.walkMinutes} min walk{route.distanceText ? ` · ${route.distanceText}` : ''}
          </Text>
        )}
        {route.steps.length > 0 && (
          <View style={styles.steps}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ expanded: directionsVisible }}
              accessibilityLabel={directionsVisible ? 'Hide walking directions' : 'Show walking directions'}
              accessibilityHint="Shows step-by-step directions to this destination"
              style={styles.directionsToggle}
              onPress={() => setDirectionsVisible((visible) => !visible)}
            >
              <Text style={styles.stepsTitle}>
                {directionsVisible ? 'Hide directions' : 'Show directions'}
              </Text>
              <Text style={styles.directionsChevron}>{directionsVisible ? '⌃' : '⌄'}</Text>
            </TouchableOpacity>
            {directionsVisible && route.steps.map((step, index) => (
              <View key={`${step.instruction}-${index}`} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>
                  {step.instruction}{step.distance ? ` (${step.distance})` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={styles.googleMapsButton}
          onPress={() => void openGoogleMapsDirections(route.placeName, route.placeSubtitle)}
          accessibilityRole="button"
          accessibilityLabel={`Open directions to ${route.placeName} in Google Maps`}
          accessibilityHint="Opens Google Maps if installed, or directions in your default browser"
        >
          <Text style={styles.googleMapsButtonText}>Open directions in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SupportResourceLinks({
  resources,
  serviceId,
  onCampusLocationPress,
  facilityPicker,
  onChooseFacility,
}: {
  resources: SupportResources;
  serviceId?: string;
  onCampusLocationPress: (campusLocationName: string) => Promise<boolean>;
  facilityPicker?: 'campus' | 'college';
  onChooseFacility: () => void;
}) {
  const [loadingCampusLocation, setLoadingCampusLocation] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);
  const open = async (url: string) => {
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  };

  return (
    <View style={styles.mentalHealthCard}>
      <Text style={styles.mentalHealthTitle}>{resources.title ?? 'Mental health support'}</Text>
      {resources.intro && <Text style={styles.mentalHealthIntro}>{resources.intro}</Text>}
      {facilityPicker && (
        <TouchableOpacity style={styles.chooseFacilityButton} onPress={onChooseFacility} accessibilityRole="button" accessibilityLabel={facilityPicker === 'college' ? 'Choose your college or campus' : 'Choose your campus'}>
          <Text style={styles.chooseFacilityButtonText}>{facilityPicker === 'college' ? 'Choose your college or campus' : 'Choose your campus'}</Text>
        </TouchableOpacity>
      )}
      {resources.campusLocations.length > 0 && (
        <Text style={styles.mentalHealthSubhead}>{resources.campusHeading ?? 'On campus'}</Text>
      )}
      {resources.campusLocations.map((location) => (
        <TouchableOpacity
          key={location.name}
          style={styles.mentalHealthLocation}
          disabled={!serviceId || Boolean(loadingCampusLocation)}
          onPress={async () => {
            if (!serviceId) return;
            setLoadingCampusLocation(location.name);
            setMapError(false);
            try {
              setMapError(!(await onCampusLocationPress(location.name)));
            } finally {
              setLoadingCampusLocation(null);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={`Show ${location.name} on the map`}
          accessibilityHint="Uses your current location to create directions to this office"
        >
          <Text style={styles.mentalHealthLocationName}>{location.name}</Text>
          <Text style={styles.mentalHealthLocationAddress}>{location.location}</Text>
          {serviceId && (
            <Text style={styles.mentalHealthMapAction}>
              {loadingCampusLocation === location.name ? 'Loading map...' : 'Show on map'}
            </Text>
          )}
        </TouchableOpacity>
      ))}
      {mapError && (
        <Text style={styles.mentalHealthMapError}>
          We couldn&apos;t load that map. Please try again.
        </Text>
      )}
      {['Government support', 'U of T resources'].map((group) => {
        const links = resources.links.filter((link) => link.group === group);
        return links.length ? (
          <View key={group} style={styles.mentalHealthLinkGroup}>
            <Text style={styles.mentalHealthSubhead}>{group}</Text>
            {links.map((link) => (
              <TouchableOpacity
                key={link.url}
                style={styles.mentalHealthLink}
                onPress={() => void open(link.url)}
                accessibilityRole="link"
                accessibilityLabel={link.title}
                accessibilityHint="Opens an external support website"
              >
                <Text style={styles.mentalHealthLinkText}>{link.title}</Text>
                <Text style={styles.mentalHealthLinkArrow} accessibilityElementsHidden>↗</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null;
      })}
    </View>
  );
}

export function TAIScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mapLoadingLocation, setMapLoadingLocation] = useState<string | null>(null);
  const [collegePickerVisible, setCollegePickerVisible] = useState(false);
  const [facilitySelection, setFacilitySelection] = useState<{
    messageId: string;
    serviceId: string;
    type: 'campus' | 'college';
    requiresCollege: boolean;
    campusLocations: SupportResources['campusLocations'];
  } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const send = async (retryQuery?: string) => {
    const query = (retryQuery ?? input).trim();
    if (!query || isSending) return;

    if (!retryQuery) {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-user`, role: 'user', text: query },
      ]);
      setInput('');
    }
    setIsSending(true);

    try {
      // Only request location for a direction-style question. If permission is
      // declined, T-AI still answers and can show the destination on the map.
      const asksForDirections = /\b(directions?|guide(?: me)?|route|map|navigation|navigate|wayfind(?:ing)?|find (?:my|the) way|how (do|can) i get|how to get|get to|get me|take me|bring me|lead me|walk me|show me (?:the )?(?:way|route)|go to|head to|travel to|walk to|reach|arriv(?:e|al|ing)|destination|where is)\b/i.test(query);
      const asksForOnCampusSupport = /\b(mental health|counselling|counseling|anxious|anxiety|overwhelmed|stressed|talk to someone|accessibility|accommodation|disability|adaptive technology|assistive technology|note taker|exam accommodation)\b/i.test(query);
      let location: { lat: number; lng: number } | undefined;
      if (asksForDirections || asksForOnCampusSupport) {
        const shouldUseLocation = await confirmLocationUse();
        const permission = shouldUseLocation
          ? await Location.requestForegroundPermissionsAsync()
          : { status: 'denied' as const };
        if (permission.status === 'granted') {
          try {
            const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            location = { lat: position.coords.latitude, lng: position.coords.longitude };
          } catch (locationError) {
            // A recently known position still lets us give a route when GPS is
            // temporarily unavailable indoors or taking too long to acquire.
            console.warn('Could not get current location:', locationError);
            const lastKnown = await Location.getLastKnownPositionAsync({
              maxAge: 60_000,
              requiredAccuracy: 500,
            });
            if (lastKnown) {
              location = { lat: lastKnown.coords.latitude, lng: lastKnown.coords.longitude };
            }
          }
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location }),
      });
      const payload: QueryResponse = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'The assistant could not answer right now.');
      }

      const text = [payload.title, payload.summary].filter(Boolean).join('\n\n');
      if (!text) throw new Error('The assistant returned an empty response.');

      const route =
        payload.type === 'location' && payload.placeName && payload.placeSubtitle
          ? {
              placeName: payload.placeName,
              placeSubtitle: payload.placeSubtitle,
              walkMinutes: payload.walkMinutes ?? 0,
              distanceText: payload.distanceText,
              steps: payload.steps ?? [],
              origin: payload.origin,
              destination: payload.destination,
          polyline: payload.polyline,
            }
          : undefined;

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text,
          route,
          serviceId: payload.serviceId,
          supportResources: payload.supportResources,
          facilityPicker: payload.facilityPicker,
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      const recoveryText = message.includes('location') || message.includes('permission')
        ? "I saved your question, but I couldn't use your location. Check location access in your phone settings, then try again."
        : message.includes('network') || message.includes('fetch') || message.includes('timeout')
          ? "I saved your question, but I couldn't connect. Check your internet connection, then try again."
          : "I saved your question, but T-AI is temporarily unavailable. Please try again in a moment.";
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          text: recoveryText,
          retryQuery: query,
          supportResources: RECOVERY_RESOURCES,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const loadCampusLocation = async (messageId: string, serviceId: string, campusLocationName: string): Promise<boolean> => {
    setMapLoadingLocation(campusLocationName);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      const position =
        permission.status === 'granted'
          ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          : undefined;
      const location = position
        ? { lat: position.coords.latitude, lng: position.coords.longitude }
        : undefined;

      const response = await fetch(`${API_BASE_URL}/api/campus-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, campusLocationName, location }),
      });
      const payload: QueryResponse = await response.json();
      if (!response.ok || !payload.placeName || !payload.placeSubtitle || !payload.destination) {
        throw new Error(payload.error || 'Could not load this campus location.');
      }

      const route: Route = {
        placeName: payload.placeName,
        placeSubtitle: payload.placeSubtitle,
        walkMinutes: payload.walkMinutes ?? 0,
        distanceText: payload.distanceText,
        steps: payload.steps ?? [],
        origin: payload.origin,
        destination: payload.destination,
        polyline: payload.polyline,
      };
      setMessages((messages) => messages.map((message) => (
        message.id === messageId ? { ...message, route } : message
      )));
      // The route is ready at this point. Waiting for MapView's onMapReady event
      // can leave the blocking overlay up indefinitely when that native event is
      // missed while the screen is transitioning.
      setMapLoadingLocation((current) => current === campusLocationName ? null : current);
      return true;
    } catch (error) {
      console.warn('Could not load selected campus map:', error);
      setMapLoadingLocation(null);
      return false;
    }
  };

  const finishMapLoading = () => {
    if (!mapLoadingLocation) return;
    setMapLoadingLocation(null);
    requestAnimationFrame(() => scrollViewRef.current?.scrollToEnd({ animated: true }));
  };

  const selectCollegeFacility = async (collegeId: string) => {
    setCollegePickerVisible(false);
    const selectedFacility = facilitySelection;
    if (!selectedFacility) return;
    setIsSending(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      const position = permission.status === 'granted'
        ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        : undefined;
      const location = position ? { lat: position.coords.latitude, lng: position.coords.longitude } : undefined;
      const response = await fetch(`${API_BASE_URL}/api/college-service/${collegeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, serviceId: selectedFacility.serviceId }),
      });
      const payload: QueryResponse = await response.json();
      if (!response.ok || !payload.placeName || !payload.placeSubtitle) throw new Error(payload.error || 'Could not load this college service.');
      setMessages((previous) => [...previous, {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: [payload.title, payload.summary].filter(Boolean).join('\n\n'),
        route: {
          placeName: payload.placeName,
          placeSubtitle: payload.placeSubtitle,
          walkMinutes: payload.walkMinutes ?? 0,
          distanceText: payload.distanceText,
          steps: payload.steps ?? [],
          origin: payload.origin,
          destination: payload.destination,
          polyline: payload.polyline,
        },
        serviceId: payload.serviceId,
        supportResources: payload.supportResources,
      }]);
    } catch (error) {
      setMessages((previous) => [...previous, {
        id: `${Date.now()}-error`, role: 'assistant', text: "I couldn't load that college service. Please try again.",
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const selectCampusFacility = async (campusId: string) => {
    const selectedFacility = facilitySelection;
    if (!selectedFacility) return;

    // College-specific services need a second decision at UTSG: the college
    // determines the appropriate local office. Keep this modal open while its
    // content transitions so the campus choice cannot leak through to a map.
    if (selectedFacility.requiresCollege && campusId === 'utsg') {
      setFacilitySelection({ ...selectedFacility, type: 'college' });
      return;
    }

    setCollegePickerVisible(false);
    if (selectedFacility.requiresCollege) {
      await selectCollegeFacility(campusId);
      return;
    }

    const campus = CAMPUSES.find((option) => option.id === campusId);
    const campusLocation = campus && selectedFacility.campusLocations.find((location) => campus.match.test(location.name));
    if (!campusLocation) {
      setMessages((previous) => [...previous, {
        id: `${Date.now()}-error`, role: 'assistant', text: "I couldn't find that campus office. Please try another campus.",
      }]);
      return;
    }
    await loadCampusLocation(selectedFacility.messageId, selectedFacility.serviceId, campusLocation.name);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🤖</Text>
        </View>
        <View>
          <Text style={styles.headerTitle} numberOfLines={1}>Follow-up conversation</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
      </View>

      <Text style={styles.followUpHint}>Continue a question after you&apos;ve explored a result in Ask or Resources.</Text>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubbleRow,
              message.role === 'user' ? styles.bubbleRowUser : styles.bubbleRowAssistant,
            ]}
          >
            {message.role === 'assistant' && (
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarEmojiSmall}>🤖</Text>
              </View>
            )}
            <View
              style={[
                styles.bubble,
                message.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
              ]}
            >
              <Text
                style={
                  message.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant
                }
              >
                {message.text}
              </Text>
              {message.retryQuery && (
                <TouchableOpacity
                  style={styles.retryMessageButton}
                  onPress={() => void send(message.retryQuery)}
                  accessibilityRole="button"
                  accessibilityLabel="Try your question again"
                  accessibilityHint="Sends the same question again"
                >
                  <Text style={styles.retryMessageButtonText}>Try again</Text>
                </TouchableOpacity>
              )}
              {message.supportResources && (
                <SupportResourceLinks
                  resources={message.supportResources}
                  serviceId={message.serviceId}
                  facilityPicker={message.facilityPicker}
                  onChooseFacility={() => {
                    if (!message.serviceId || !message.facilityPicker) return;
                    setFacilitySelection({
                      messageId: message.id,
                      serviceId: message.serviceId,
                      type: 'campus',
                      requiresCollege: message.facilityPicker === 'college',
                      campusLocations: message.supportResources?.campusLocations ?? [],
                    });
                    setCollegePickerVisible(true);
                  }}
                  onCampusLocationPress={(campusLocationName) =>
                    message.serviceId
                      ? loadCampusLocation(message.id, message.serviceId, campusLocationName)
                      : Promise.resolve(false)
                  }
                />
              )}
              {message.route && <RouteCard route={message.route} onMapReady={finishMapLoading} />}
            </View>
          </View>
        ))}
        {isSending && (
          <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarEmojiSmall}>🤖</Text>
            </View>
            <TAIThinkingIndicator />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={() => void send()}
          editable={!isSending}
          accessibilityLabel="Message T-AI"
          accessibilityHint="Ask about campus resources, accommodations, or support services"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isSending) && styles.sendBtnDisabled]}
          onPress={() => void send()}
          activeOpacity={0.8}
          disabled={!input.trim() || isSending}
          accessibilityRole="button"
          accessibilityLabel="Send message to T-AI"
          accessibilityState={{ disabled: !input.trim() || isSending }}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={collegePickerVisible} transparent animationType="fade" onRequestClose={() => setCollegePickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalDismissArea} onPress={() => setCollegePickerVisible(false)} accessibilityRole="button" accessibilityLabel="Close campus selector" />
          <View style={styles.modalCard} accessibilityViewIsModal>
            <Text style={styles.modalTitle}>{facilitySelection?.type === 'college' ? 'Choose your college' : 'Choose your campus'}</Text>
            <Text style={styles.modalBody}>{facilitySelection?.type === 'college' ? 'Choose your UTSG college to find the right local office.' : "We'll show the right in-person office and map."}</Text>
            {facilitySelection?.type === 'college' && (
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setFacilitySelection((selection) => selection ? { ...selection, type: 'campus' } : null)}
                accessibilityRole="button"
                accessibilityLabel="Back to campus selection"
              >
                <Text style={styles.modalBackButtonText}>Back to campuses</Text>
              </TouchableOpacity>
            )}
            <ScrollView style={styles.modalOptions} showsVerticalScrollIndicator={false}>
              {(facilitySelection?.type === 'campus'
                ? CAMPUSES
                : COLLEGES).map((college) => (
                <TouchableOpacity key={college.id} style={styles.collegeOption} onPress={() => void (facilitySelection?.type === 'campus' ? selectCampusFacility(college.id) : selectCollegeFacility(college.id))} accessibilityRole="button" accessibilityLabel={college.label}>
                  <Text style={styles.collegeOptionText}>{college.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {mapLoadingLocation && (
        <View
          style={styles.mapLoadingOverlay}
          accessibilityRole="progressbar"
          accessibilityLabel={`Loading a map for ${mapLoadingLocation}`}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.mapLoadingCard}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.mapLoadingTitle}>Loading your map</Text>
            <Text style={styles.mapLoadingText}>Finding directions to {mapLoadingLocation}.</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl * 2.5,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 18 },
  headerTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  statusText: { color: colors.textMuted, fontSize: fontSize.sm },
  followUpHint: { backgroundColor: colors.infoBg, color: colors.infoText, fontSize: fontSize.sm, lineHeight: 18, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  chatArea: { flex: 1 },
  chatContent: { padding: spacing.lg, gap: spacing.md },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAssistant: { justifyContent: 'flex-start' },
  avatarSmall: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmojiSmall: { fontSize: 13 },
  bubble: { maxWidth: '75%', padding: spacing.md, borderRadius: radius.lg },
  bubbleAssistant: { backgroundColor: colors.surface, borderTopLeftRadius: radius.sm },
  bubbleUser: { backgroundColor: colors.accent, borderTopRightRadius: radius.sm },
  bubbleTextAssistant: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20 },
  bubbleTextUser: { color: colors.white, fontSize: fontSize.base, lineHeight: 20 },
  retryMessageButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  retryMessageButtonText: { color: colors.accentOn, fontSize: fontSize.sm, fontWeight: '700' },
  routeCard: {
    marginTop: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  routeMap: { height: 160, width: '100%' },
  routeDetails: { padding: spacing.sm, gap: 2 },
  routeName: { color: colors.textPrimary, fontWeight: '700', fontSize: fontSize.sm },
  routeAddress: { color: colors.textSecondary, fontSize: fontSize.sm },
  routeTime: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '600' },
  steps: { marginTop: spacing.sm, gap: spacing.sm },
  directionsToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  stepsTitle: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '700' },
  directionsChevron: { color: colors.accent, fontSize: fontSize.md, fontWeight: '700' },
  googleMapsButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.md, justifyContent: 'center', marginTop: spacing.sm, minHeight: 44, paddingHorizontal: spacing.md },
  googleMapsButtonText: { color: colors.accentOn, fontSize: fontSize.sm, fontWeight: '700' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  stepNumber: {
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    overflow: 'hidden',
    textAlign: 'center',
    color: colors.white,
    backgroundColor: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  stepText: { flex: 1, color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },
  mentalHealthCard: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  mentalHealthTitle: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700' },
  mentalHealthIntro: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },
  chooseFacilityButton: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.md, minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  chooseFacilityButtonText: { color: colors.accentOn, fontSize: fontSize.sm, fontWeight: '700' },
  mentalHealthSubhead: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700', marginTop: 2 },
  mentalHealthLocation: { gap: 2 },
  mentalHealthLocationName: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '700' },
  mentalHealthLocationAddress: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 17 },
  mentalHealthMapAction: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', marginTop: 2 },
  mentalHealthMapError: { color: colors.danger, fontSize: fontSize.sm, lineHeight: 17 },
  mentalHealthLinkGroup: { gap: spacing.xs, marginTop: spacing.xs },
  mentalHealthLink: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  mentalHealthLinkText: { color: colors.textPrimary, flex: 1, fontSize: fontSize.sm, fontWeight: '600' },
  mentalHealthLinkArrow: { color: colors.accent, fontSize: fontSize.base, fontWeight: '700' },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderTopLeftRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  thinkingDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    minHeight: 44,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.55 },
  sendBtnText: { color: colors.white, fontSize: fontSize.md },
  modalBackdrop: { backgroundColor: 'rgba(0, 0, 0, 0.45)', flex: 1, justifyContent: 'center', padding: spacing.xl },
  modalDismissArea: { ...StyleSheet.absoluteFillObject },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, gap: spacing.sm, maxHeight: '82%', padding: spacing.lg },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  modalBody: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, marginBottom: spacing.xs },
  modalBackButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  modalBackButtonText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
  modalOptions: { flexGrow: 0 },
  collegeOption: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.sm, minHeight: 44, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, justifyContent: 'center' },
  collegeOptionText: { color: colors.accent, fontSize: fontSize.base, fontWeight: '600' },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(11, 31, 58, 0.82)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  mapLoadingCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    maxWidth: 320,
    padding: spacing.xl,
    width: '100%',
  },
  mapLoadingTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.xs },
  mapLoadingText: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, textAlign: 'center' },
});
