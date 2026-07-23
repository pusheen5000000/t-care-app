import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

const TOPICS = ['Outdated info', 'Wrong route', 'General bug', 'Other'];

export function ContactScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState(false);

  const canSend = firstName.trim() !== '' && email.trim() !== '' && message.trim() !== '';

  const handleSend = () => {
    if (!canSend) return;
    // A feedback endpoint has not been connected yet; avoid reporting a false success.
    setFeedbackNotice(true);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>CONTACT</Text>
      <Text style={styles.title}>Get in touch or report a gap</Text>
      <Text style={styles.subtitle}>
        Outdated info? Wrong route? General bug? Please let us know here.
      </Text>

      {feedbackNotice ? (
        <View style={styles.sentBox}>
          <Text accessibilityRole="alert" style={styles.sentText}>
            Feedback sending is not available yet. Please try again later.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="First name"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor={colors.textMuted}
                accessibilityLabel="Last name"
              />
            </View>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Email"
          />

          <Text style={styles.label}>Topic</Text>
          <View style={styles.topicRow}>
            {TOPICS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.topicChip, topic === t && styles.topicChipActive]}
                onPress={() => setTopic(t)}
                accessibilityRole="button"
                accessibilityLabel={t}
                accessibilityState={{ selected: topic === t }}
              >
                <Text style={[styles.topicText, topic === t && styles.topicTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {topic === 'Other' && (
            <TextInput
              style={[styles.input, { marginTop: spacing.sm }]}
              value={customTopic}
              onChangeText={setCustomTopic}
              placeholder="Type your topic..."
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Other topic"
            />
          )}

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us more..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={5}
            accessibilityLabel="Message"
          />

          <TouchableOpacity
            style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send feedback"
            accessibilityState={{ disabled: !canSend }}
          >
            <Text style={styles.sendBtnText}>Send message →</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl * 2, gap: spacing.sm },
  eyebrow: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700', marginTop: spacing.xs },
  subtitle: { color: colors.textMuted, fontSize: fontSize.base, marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 20 },
  label: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.md, marginBottom: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
    color: colors.textPrimary,
    fontSize: fontSize.base,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  topicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  topicChip: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  topicChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  topicText: { color: colors.textMuted, fontSize: fontSize.sm },
  topicTextActive: { color: colors.white, fontWeight: '700' },
  sendBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '700' },
  sentBox: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.success,
    alignItems: 'center',
  },
  sentText: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700', textAlign: 'center' },
});
