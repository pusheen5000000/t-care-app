import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { AskScreen } from './screens/AskScreen';
import { ResultScreen } from './screens/ResultScreen';
import { TabBar, TabKey } from './components/TabBar';
import { colors, fontSize } from './theme';
import type { QueryResult } from './types';

// FRONTEND-ONLY STUB — no backend needed. Fake data for UI/theme testing.
async function resolveQuery(query: string): Promise<QueryResult> {
  await new Promise((r) => setTimeout(r, 700));

  const lower = query.toLowerCase();

  if (lower.includes('tcard')) {
    return {
      type: 'location',
      query,
      title: 'TCard replacement',
      summary:
        'Report it lost, then head to the TCard office with photo ID. A replacement costs $20 and is ready same day.',
      placeName: 'TCard Office',
      placeSubtitle: '765 Sunningdale Rd W, London, ON',
      walkMinutes: 8,
      fee: '$20',
      hours: 'until 5pm',
      origin: { latitude: 42.9849, longitude: -81.2453 },
      destination: { latitude: 42.9989, longitude: -81.2853 },
      polyline: {
        type: 'LineString',
        coordinates: [
          [-81.2453, 42.9849],
          [-81.2653, 42.9919],
          [-81.2853, 42.9989],
        ],
      },
    };
  }

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
        summary: 'Stub error — this should not happen in the fake-data version.',
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