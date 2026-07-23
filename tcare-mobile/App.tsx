import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import * as Location from 'expo-location';
import { AskScreen } from './screens/AskScreen';
import { ResultScreen } from './screens/ResultScreen';
import { TAIScreen } from './screens/TAIScreen';
import { ContactScreen } from './screens/ContactScreen';
import { TabBar, TabKey } from './components/TabBar';
import { colors, fontSize } from './theme';
import type { QueryResult } from './types';

const TCARD_QUERY = 'I lost my TCard, what do I do?';
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
  placeSubtitle: '455 Spadina Ave, Suite 400, Toronto, ON M5S 1A1',
  walkMinutes: 0,
  fee: 'Free',
  hours: 'Contact office',
  polyline: null,
  destination: { latitude: 43.6643, longitude: -79.4018 },
};

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
};

async function resolveQuery(query: string): Promise<QueryResult> {
  await new Promise((r) => setTimeout(r, 700));
  return {
    type: 'info',
    query,
    title: "Here's what I found",
    summary: 'Frontend-only stub response — no backend connected right now.',
  };
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('ask');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (query: string) => {
    setLoading(true);
    try {
      const r = await resolveQuery(query);
      setResult(r);
    } catch (err) {
      console.error(err);
      setResult({
        type: 'info',
        query,
        title: 'Something went wrong',
        summary: 'Stub error.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAskAnother = () => setResult(null);

  const loadMapDestination = async (endpoint: string, fallback: QueryResult) => {
    setLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      const position =
        permission.status === 'granted'
          ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          : null;
      const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

      if (!apiUrl) throw new Error('Missing EXPO_PUBLIC_API_URL');

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: position
            ? { lat: position.coords.latitude, lng: position.coords.longitude }
            : undefined,
        }),
      });

      if (!response.ok) throw new Error(`Map request failed (${response.status})`);
      setResult((await response.json()) as QueryResult);
    } catch (error) {
      console.warn('Could not load map destination:', error);
      setResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleLostTCard = () => loadMapDestination('/api/tcard-office', TCARD_OFFICE_FALLBACK);

  const handleAccessibilityServices = () =>
    loadMapDestination('/api/accessibility-services', ACCESSIBILITY_SERVICES_FALLBACK);

  const handleTalkSupport = () =>
    loadMapDestination('/api/health-wellness', HEALTH_WELLNESS_FALLBACK);

  const handleCollegeSelect = (collegeId: string) =>
    loadMapDestination(`/api/college-registrar/${collegeId}`, {
      type: 'info',
      query: 'I need help with my studies',
      title: 'College registrar unavailable',
      summary: 'We could not load your college registrar’s office. Please try again shortly.',
    });

  const renderNonTaiBody = () => {
    if (tab === 'contact') {
      return <ContactScreen />;
    }

    if (tab !== 'ask') {
      return (
        <View style={styles.placeholderScreen}>
          <Text style={styles.placeholderText}>
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
      return <ResultScreen result={result} onAskAnother={handleAskAnother} />;
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
          setTab(key);
          if (key === 'ask') setResult(null);
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
