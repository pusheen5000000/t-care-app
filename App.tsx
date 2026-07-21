import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { AskScreen } from './screens/AskScreen';
import { ResultScreen } from './screens/ResultScreen';
import { TabBar, TabKey } from './components/TabBar';
import { colors, fontSize } from './theme';
import type { QueryResult } from './types';

// Stub — replace with a real call to your Express backend
// (the same endpoint your web app already hits for
// query understanding + Geoapify routing).
async function resolveQuery(query: string): Promise<QueryResult> {
  await new Promise((r) => setTimeout(r, 900)); // simulate network

  const lower = query.toLowerCase();

  if (lower.includes('tcard')) {
    return {
      type: 'location',
      query,
      title: 'TCard replacement',
      summary:
        "Report it lost, then head to the TCard office with photo ID. A replacement costs $20 and is ready same day.",
      placeName: 'TCard Office',
      placeSubtitle: 'Robarts Library, 1st floor',
      walkMinutes: 8,
      fee: '$20',
      hours: 'until 5pm',
    };
  }

  if (lower.includes('overwhelmed') || lower.includes('talk to')) {
    return {
      type: 'location',
      query,
      title: 'Health & Wellness Centre',
      summary:
        'You can book a same-day counselling drop-in or a scheduled appointment, both free for students.',
      placeName: 'Health & Wellness Centre',
      placeSubtitle: '214 College Street, 2nd floor',
      walkMinutes: 12,
      fee: 'Free',
      hours: 'until 4:30pm',
    };
  }

  return {
    type: 'info',
    query,
    title: "Here's what I found",
    summary:
      'Placeholder response — wire this up to your backend endpoint that calls Groq for query understanding.',
  };
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('ask');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (query: string) => {
    setLoading(true);
    const r = await resolveQuery(query);
    setResult(r);
    setLoading(false);
  };

  const handleAskAnother = () => {
    setResult(null);
  };

  const renderBody = () => {
    if (tab !== 'ask') {
      // Resources / Saved screens — build these out next
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
