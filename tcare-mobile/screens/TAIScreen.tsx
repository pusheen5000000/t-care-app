import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

type Coordinate = { latitude: number; longitude: number };
type RouteStep = { instruction: string; distance: string };

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

type Message = { id: string; role: 'user' | 'assistant'; text: string; route?: Route };

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
  error?: string;
};

// Set EXPO_PUBLIC_API_URL to your computer's LAN address when testing on a
// physical device, for example: http://192.168.1.20:3000.
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

const INITIAL: Message[] = [
  {
    id: '1',
    role: 'assistant',
    text: "Hi! I'm T-AI, your Accessibility Assistant. Ask me anything about campus resources, accommodations, or support services and I'll do my best to help.",
  },
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

function RouteCard({ route }: { route: Route }) {
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
      </View>
    </View>
  );
}

export function TAIScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const send = async () => {
    const query = input.trim();
    if (!query || isSending) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: 'user', text: query },
    ]);
    setInput('');
    setIsSending(true);

    try {
      // Only request location for a direction-style question. If permission is
      // declined, T-AI still answers and can show the destination on the map.
      const asksForDirections = /\b(directions?|guide(?: me)?|route|map|navigation|navigate|wayfind(?:ing)?|find (?:my|the) way|how (do|can) i get|how to get|get to|get me|take me|bring me|lead me|walk me|show me (?:the )?(?:way|route)|go to|head to|travel to|walk to|reach|arriv(?:e|al|ing)|destination|where is)\b/i.test(query);
      let location: { lat: number; lng: number } | undefined;
      if (asksForDirections) {
        const permission = await Location.requestForegroundPermissionsAsync();
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
        { id: `${Date.now()}-assistant`, role: 'assistant', text, route },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          text: "I couldn't reach T-AI right now. Please check your connection and try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
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
          <Text style={styles.headerTitle} numberOfLines={1}>T-AI (T-Care AI Assistant)</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
      </View>

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
              {message.route && <RouteCard route={message.route} />}
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
          onSubmitEditing={send}
          editable={!isSending}
          accessibilityLabel="Message T-AI"
          accessibilityHint="Ask about campus resources, accommodations, or support services"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || isSending) && styles.sendBtnDisabled]}
          onPress={send}
          activeOpacity={0.8}
          disabled={!input.trim() || isSending}
          accessibilityRole="button"
          accessibilityLabel="Send message to T-AI"
          accessibilityState={{ disabled: !input.trim() || isSending }}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
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
});
