import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import * as Location from 'expo-location';
import { AskScreen } from './screens/AskScreen';
import { ResultScreen } from './screens/ResultScreen';
import { TAIScreen } from './screens/TAIScreen';
import { ContactScreen } from './screens/ContactScreen';
import { ResourcesScreen } from './screens/ResourcesScreen';
import { TabBar, TabKey } from './components/TabBar';
import { colors, fontSize } from './theme';
import type { LocationResult, QueryResult, SupportResources, TravelMode } from './types';

const TCARD_QUERY = 'I lost my TCard, what do I do?';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const ACCESSIBILITY_SUPPORT_RESOURCES: SupportResources = {
  title: 'Accessibility support',
  intro: 'Find academic accommodations, assistive technology, and support that works for you. The map above routes to St. George Accessibility Services.',
  campusHeading: 'U of T accessibility offices',
  primaryDestination: 'St. George Accessibility Services',
  campusLocations: [
    { name: 'St. George Accessibility Services', location: '455 Spadina Avenue, 4th Floor, Suite 400, Toronto, ON M5S 2G8', detail: 'Academic accommodations, adaptive technology, and exam support.' },
    { name: 'UTSC AccessAbility Services', location: 'Sam Ibrahim Building, IA5105, 1050 Military Trail, Scarborough, ON M1C 1A4', detail: 'Disability-related accommodations and accessible learning support.' },
    { name: 'UTM AccessABILITY Resource Centre', location: 'Davis Building, DV2240, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Academic accommodations and accessibility resources for UTM students.' },
  ],
  links: [
    { group: 'Government support', title: 'Accessibility in Ontario', description: 'Ontario accessibility information, rights, and community-support directory.', url: 'https://www.ontario.ca/page/accessibility-ontario-what-you-need-to-know' },
    { group: 'Government support', title: 'Canada grants for disability services and equipment', description: 'Federal funding information for eligible students who need education-related services or equipment.', url: 'https://www.canada.ca/en/services/benefits/education/student-aid/grants-loans/disabilities-service-equipment.html' },
    { group: 'U of T resources', title: 'U of T Accessibility Services', description: 'Register for accommodations and connect with St. George Accessibility Services.', url: 'https://studentlife.utoronto.ca/department/accessibility-services/' },
    { group: 'U of T resources', title: 'Accessibility advisor support', description: 'Learn how to meet with an accessibility advisor and manage your accommodations.', url: 'https://studentlife.utoronto.ca/service/accessibility-advisor-support/' },
  ],
};
const TCARD_OFFICE_FALLBACK: QueryResult = {
  type: 'location',
  query: TCARD_QUERY,
  title: 'TCard replacement',
  summary:
    'Report your card lost in eAccounts, then visit the TCard Office for a replacement.',
  placeName: 'TCard Office',
  placeSubtitle: '800 Bay Street, 5th Floor, Toronto, ON M5S 3A9',
  walkMinutes: 0,
  fee: '$20',
  hours: 'Monday to Friday, 9:00 AM to 4:15 PM',
  polyline: null,
  destination: { latitude: 43.6644, longitude: -79.3873 },
};

const ACCESSIBILITY_SERVICES_FALLBACK: QueryResult = {
  type: 'location',
  query: 'Where can I access accessibility services?',
  title: 'Accessibility Services',
  summary: 'Visit Accessibility Services for academic accommodations, assistive technology, and exam accommodations.',
  placeName: 'U of T Accessibility Services',
  placeSubtitle: '455 Spadina Avenue, 4th Floor, Suite 400, Toronto, ON M5S 2G8',
  walkMinutes: 0,
  fee: 'Free',
  hours: 'Contact office',
  polyline: null,
  destination: { latitude: 43.6643, longitude: -79.4018 },
  supportResources: ACCESSIBILITY_SUPPORT_RESOURCES,
  serviceId: 'accessibility-services',
};

const ACCESSIBILITY_FALLBACK_DESTINATIONS = [
  { name: 'St. George Accessibility Services', latitude: 43.6643, longitude: -79.4018 },
  { name: 'UTSC AccessAbility Services', latitude: 43.7846, longitude: -79.187 },
  { name: 'UTM AccessABILITY Resource Centre', latitude: 43.5483, longitude: -79.662 },
];

function accessibilityFallbackFor(query?: string): QueryResult {
  const campusPattern = /\b(?:utsg|st\.?\s*george|utsc|scarborough|utm|mississauga)\b/i;
  const campusMatch = query?.match(campusPattern)?.[0]?.toLowerCase();
  const selectedName = campusMatch && /utsc|scarborough/.test(campusMatch)
    ? 'UTSC AccessAbility Services'
    : campusMatch && /utm|mississauga/.test(campusMatch)
      ? 'UTM AccessABILITY Resource Centre'
      : campusMatch
        ? 'St. George Accessibility Services'
        : undefined;
  const selectedLocation = selectedName
    ? ACCESSIBILITY_SUPPORT_RESOURCES.campusLocations.find((location) => location.name === selectedName)
    : undefined;
  const selectedDestination = selectedName
    ? ACCESSIBILITY_FALLBACK_DESTINATIONS.find((destination) => destination.name === selectedName)
    : undefined;

  if (!selectedLocation || !selectedDestination) return ACCESSIBILITY_SERVICES_FALLBACK;

  return {
    ...(ACCESSIBILITY_SERVICES_FALLBACK as LocationResult),
    title: selectedLocation.name,
    placeName: selectedLocation.name,
    placeSubtitle: selectedLocation.location,
    destination: { latitude: selectedDestination.latitude, longitude: selectedDestination.longitude },
    supportResources: {
      ...ACCESSIBILITY_SUPPORT_RESOURCES,
      intro: `Showing the in-person support at ${selectedLocation.name}.`,
      campusLocations: [selectedLocation],
    },
  };
}

const HEALTH_WELLNESS_FALLBACK: QueryResult = {
  type: 'location',
  query: 'I need someone to talk to',
  title: 'U of T Health & Wellness',
  summary: 'Mental Health Services are on the 12th floor and Medical Services are on the 14th floor.',
  placeName: 'U of T Health & Wellness',
  placeSubtitle: '700 Bay Street, 12th and 14th Floors, Toronto, ON M5G 1Z6',
  walkMinutes: 0,
  fee: 'Free',
  hours: 'Monday to Friday, 8:45 AM to 5:00 PM',
  polyline: null,
  destination: { latitude: 43.6586, longitude: -79.3835 },
  supportResources: {
    campusLocations: [
      { name: 'St. George Health & Wellness Centre', location: '700 Bay Street, Toronto, ON M5G 1Z6', detail: 'Confidential mental health and physical health support.' },
      { name: 'UTSC Health & Wellness Centre', location: 'Sam Ibrahim Building, IA5061, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Counselling, health care, and health-promotion support.' },
      { name: 'UTM Health & Counselling Centre', location: 'Davis Building, DV1152, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Personal and group counselling, psychiatric care, and health support.' },
    ],
    links: [
      { group: 'Government support', title: 'Ontario mental health support', description: 'Ontario’s directory for confidential mental health and crisis supports.', url: 'https://www.ontario.ca/page/find-mental-health-support' },
      { group: 'Government support', title: 'Canada mental health support', description: 'Federal guidance and Canada-wide mental health supports.', url: 'https://www.canada.ca/en/public-health/campaigns/get-help-here.html' },
      { group: 'U of T resources', title: 'Student Mental Health Resource', description: 'Tri-campus U of T supports and tools for students.', url: 'https://mentalhealth.utoronto.ca/' },
      { group: 'U of T resources', title: 'U of T mental health supports', description: 'Ways to access counselling, same-day care, and other Health & Wellness supports.', url: 'https://studentlife.utoronto.ca/service/mental-health-supports/' },
    ],
  },
  serviceId: 'health-wellness',
};

type DeviceLocation = { lat: number; lng: number };

async function getCurrentLocation(): Promise<DeviceLocation | undefined> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') return undefined;

  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { lat: position.coords.latitude, lng: position.coords.longitude };
}

async function resolveQuery(query: string, location?: DeviceLocation): Promise<QueryResult> {
  if (!API_BASE_URL) throw new Error('Missing EXPO_PUBLIC_API_URL');

  const response = await fetch(`${API_BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, location }),
  });
  if (!response.ok) throw new Error(`Query request failed (${response.status})`);
  return response.json() as Promise<QueryResult>;

  /*
  await new Promise((r) => setTimeout(r, 700));
  return {
    type: 'info',
    query,
    title: "Here's what I found",
    summary: 'Frontend-only stub response — no backend connected right now.',
  };
  */
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('ask');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [resultSource, setResultSource] = useState<TabKey>('ask');
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const handleSubmit = async (query: string) => {
    if (/\b(mental health|counselling|counseling|anxious|anxiety|overwhelmed|stressed|talk to someone)\b/i.test(query)) {
      return handleTalkSupport();
    }
    if (/\b(accessibility|accommodation|disability|adaptive technology|assistive technology|note taker|exam accommodation)\b/i.test(query)) {
      return handleAccessibilityServices('ask', query);
    }

    const currentRequestId = ++requestId.current;
    setResultSource('ask');
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const r = await resolveQuery(query, location);
      if (currentRequestId === requestId.current) setResult(r);
    } catch (err) {
      console.error(err);
      if (currentRequestId === requestId.current) {
        setResult({
          type: 'info',
          query,
          title: 'Something went wrong',
          summary: 'Stub error.',
        });
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  };

  const handleAskAnother = () => {
    setResult(null);
    setTab(resultSource);
  };

  const loadMapDestination = async (
    endpoint: string,
    fallback: QueryResult,
    source: TabKey = 'ask',
    query?: string,
  ) => {
    const currentRequestId = ++requestId.current;
    setResultSource(source);
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

      if (!apiUrl) throw new Error('Missing EXPO_PUBLIC_API_URL');

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, query }),
      });

      if (!response.ok) throw new Error(`Map request failed (${response.status})`);
      if (currentRequestId === requestId.current) {
        setResult((await response.json()) as QueryResult);
      }
    } catch (error) {
      console.warn('Could not load map destination:', error);
      if (currentRequestId === requestId.current) setResult(fallback);
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  };

  const handleLostTCard = () => loadMapDestination('/api/tcard-office', TCARD_OFFICE_FALLBACK);

  const handleAccessibilityServices = (source: TabKey = 'ask', query?: string) =>
    loadMapDestination('/api/accessibility-services', accessibilityFallbackFor(query), source, query);

  const handleTalkSupport = (source: TabKey = 'ask') =>
    loadMapDestination('/api/health-wellness', HEALTH_WELLNESS_FALLBACK, source);

  const handleCollegeSelect = (collegeId: string, source: TabKey = 'ask') =>
    loadMapDestination(`/api/college-registrar/${collegeId}`, {
      type: 'info',
      query: 'I need help with my studies',
      title: 'College registrar unavailable',
      summary: 'We could not load your college registrar’s office. Please try again shortly.',
    }, source);

  const handleCampusLocationPress = async (serviceId: string, campusLocationName: string) => {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      if (!API_BASE_URL) throw new Error('Missing EXPO_PUBLIC_API_URL');

      const response = await fetch(`${API_BASE_URL}/api/campus-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, campusLocationName, location }),
      });
      if (!response.ok) throw new Error(`Campus map request failed (${response.status})`);
      if (currentRequestId === requestId.current) {
        setResult((await response.json()) as QueryResult);
      }
    } catch (error) {
      console.warn('Could not load selected campus map:', error);
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  };

  const updateTravelRoute = async (mode: TravelMode): Promise<boolean> => {
    if (result?.type !== 'location' || !result.origin || !result.destination) return false;

    const currentRequestId = ++requestId.current;

    const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
    if (!apiUrl) return false;

    try {
      const response = await fetch(`${apiUrl}/api/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          origin: { lat: result.origin.latitude, lng: result.origin.longitude },
          destination: { lat: result.destination.latitude, lng: result.destination.longitude },
        }),
      });
      if (!response.ok) throw new Error(`Route request failed (${response.status})`);

      const route = await response.json() as Pick<LocationResult, 'travelMinutes' | 'polyline'>;
      if (currentRequestId === requestId.current) {
        setResult((current) => current?.type === 'location'
          ? { ...current, travelMinutes: route.travelMinutes, polyline: route.polyline }
          : current);
      }
      return true;
    } catch (error) {
      console.warn('Could not update route:', error);
      return false;
    }
  };

  const renderNonTaiBody = () => {
    if (tab === 'contact') {
      return <ContactScreen />;
    }

    if (loading) {
      return (
        <View style={styles.loadingScreen}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Finding the right resource...</Text>
        </View>
      );
    }

    if (result) {
      return (
        <ResultScreen
          result={result}
          onAskAnother={handleAskAnother}
          onTravelModeChange={updateTravelRoute}
          onCampusLocationPress={handleCampusLocationPress}
        />
      );
    }

    if (tab === 'resources') {
      return (
        <ResourcesScreen
          onMentalHealthPress={() => handleTalkSupport('resources')}
          onAccessibilityPress={() => handleAccessibilityServices('resources')}
          onCollegeSelect={(collegeId) => handleCollegeSelect(collegeId, 'resources')}
        />
      );
    }

    if (tab !== 'ask') {
      return (
        <View style={styles.placeholderScreen}>
          <Text style={styles.placeholderText}>
            {/* This fallback only renders for the non-Ask tab. */}
            {/* @ts-expect-error The branch is intentionally unreachable for Resources. */}
            {tab === 'resources' ? 'Resources' : 'Saved'} screen — coming soon
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.loadingScreen}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Finding the right resource...</Text>
        </View>
      );
    }

    if (result) {
      return (
        <ResultScreen
          result={result}
          onAskAnother={handleAskAnother}
          onTravelModeChange={updateTravelRoute}
          onCampusLocationPress={handleCampusLocationPress}
        />
      );
    }

    return (
      <AskScreen
        onSubmit={handleSubmit}
        onTCardPress={handleLostTCard}
        onTalkSupportPress={handleTalkSupport}
        onAccessibilityPress={handleAccessibilityServices}
        onCollegeSelect={handleCollegeSelect}
      />
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        <View style={tab === 'tai' ? styles.taiScreen : styles.hiddenTaiScreen}>
          <TAIScreen />
        </View>
        {tab !== 'tai' && renderNonTaiBody()}
      </View>
      <TabBar
        active={tab}
        onChange={(key) => {
          requestId.current += 1;
          setTab(key);
          setResult(null);
          setLoading(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  taiScreen: { flex: 1 },
  hiddenTaiScreen: { display: 'none' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: colors.textSecondary, fontSize: fontSize.base },
  placeholderScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: colors.textMuted, fontSize: fontSize.base },
});
