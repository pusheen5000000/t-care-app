import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import * as Location from 'expo-location';
import { AskScreen } from './screens/AskScreen';
import { ResultScreen } from './screens/ResultScreen';
import { TabBar, TabKey } from './components/TabBar';
import { colors, fontSize } from './theme';
import type { QueryResult } from './types';

// Update this to your laptop's local IP + port (find it with `ipconfig`).
// Must match whatever network your phone is currently connected to.
const API_BASE_URL = 'http://10.0.0.48:3000';

async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const position = await Location.getCurrentPositionAsync({});
  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
}

async function resolveQuery(query: string): Promise<QueryResult> {
  const location = await getCurrentLocation();

  const response = await fetch(`${API_BASE_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, location }),
  });

  if (!response.ok) {
    throw new Error(`Backend error (${response.status})`);
  }

  return response.json();
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
        summary: 'Could not reach the backend. Check the server and API URL.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAskAnother = () => {
    setResult(null);
  };

  const renderBody = () => {
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

    return <AskScreen onSubmit={handleSubmit} />;
  };

  return (
    <View style={styles.root}>
      <View style={styles.body}>{renderBody()}</View>
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
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
  },
  placeholderScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: fontSize.base,
  },
});