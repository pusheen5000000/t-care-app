import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { colors, spacing, fontSize } from '../theme';
import type { QueryResult, LocationResult } from '../types';

type Props = {
  result: QueryResult;
  onAskAnother: () => void;
};

export function ResultScreen({ result, onAskAnother }: Props) {
  const isLocation = result.type === 'location';

  const openDirections = (r: LocationResult) => {
    // Swap this URL for your Geoapify routing deep link / native maps intent
    const url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(
      r.placeName
    )}`;
    Linking.openURL(url);
  };

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

        {isLocation && (
          <LocationBlock
            result={result as LocationResult}
            onDirections={openDirections}
          />
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onAskAnother}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>Ask something else</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function LocationBlock({
  result,
  onDirections,
}: {
  result: LocationResult;
  onDirections: (r: LocationResult) => void;
}) {
  return (
    <>
      <View style={styles.mapCard}>
        {/* Swap this placeholder for a real map component,
            e.g. react-native-maps fed by Geoapify tiles/markers */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Map preview</Text>
        </View>
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

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => onDirections(result)}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Get directions</Text>
      </TouchableOpacity>
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
    // square — no borderRadius
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
    // square — no borderRadius
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
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
    // square — no borderRadius
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
  primaryButton: {
    backgroundColor: colors.accent,
    // square — no borderRadius
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    color: colors.accentOn,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    // square — no borderRadius
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: fontSize.base,
  },
});
