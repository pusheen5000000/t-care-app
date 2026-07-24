import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

export function ContactScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>CONTACT</Text>
      <Text style={styles.title}>Help us improve T-Care</Text>
      <Text style={styles.subtitle}>
        We&apos;re not collecting feedback in the app yet, so we won&apos;t ask for information we can&apos;t send or protect.
      </Text>

      <View style={styles.notice} accessibilityRole="alert">
        <Text style={styles.noticeTitle}>Feedback submission is coming soon</Text>
        <Text style={styles.noticeText}>
          Until a secure feedback channel is available, please don&apos;t include personal, academic, health, or account information in messages about T-Care.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>What helps us fix an issue</Text>
      <View style={styles.checklist}>
        <Text style={styles.checkItem}>• What you were trying to do</Text>
        <Text style={styles.checkItem}>• The service or result you expected</Text>
        <Text style={styles.checkItem}>• What happened instead</Text>
        <Text style={styles.checkItem}>• Your device type, if you know it</Text>
      </View>

      <Text style={styles.footer}>
        For urgent wellbeing, safety, or accessibility support, use the resources in T-Care instead of waiting for app feedback.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl * 2, gap: spacing.md },
  eyebrow: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700', marginTop: spacing.xs },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 21, marginBottom: spacing.md },
  notice: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.lg },
  noticeTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  noticeText: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20 },
  sectionTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.lg },
  checklist: { backgroundColor: colors.surfaceMuted, borderRadius: radius.lg, gap: spacing.sm, padding: spacing.lg },
  checkItem: { color: colors.textPrimary, fontSize: fontSize.base, lineHeight: 20 },
  footer: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 18, marginTop: spacing.lg },
});
