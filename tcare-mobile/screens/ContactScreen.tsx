import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

const TOPICS = [
  { id: 'app-issue', label: 'App issue' },
  { id: 'service-question', label: 'Service question' },
  { id: 'suggestion', label: 'Suggestion' },
  { id: 'other', label: 'Other' },
] as const;

type TopicId = typeof TOPICS[number]['id'];

export function ContactScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [inquiry, setInquiry] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendInquiry = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedInquiry = inquiry.trim();
    const selectedTopic = TOPICS.find((option) => option.id === topic);

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !selectedTopic || !trimmedInquiry) {
      setStatus({ type: 'error', message: 'Complete every required field before sending your inquiry.' });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setStatus({ type: 'error', message: 'Enter a valid email address so we can reply.' });
      return;
    }

    if (!API_BASE_URL) {
      setStatus({ type: 'error', message: 'Contact submission is unavailable until the app is connected to its backend.' });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          email: trimmedEmail,
          topic: selectedTopic.label,
          inquiry: trimmedInquiry,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'We could not send your inquiry. Please try again.');

      setFirstName('');
      setLastName('');
      setEmail('');
      setTopic(null);
      setInquiry('');
      setStatus({ type: 'success', message: 'Your inquiry has been sent. We’ll reply to the email address you provided.' });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'We could not send your inquiry. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Contact T-Care</Text>
          <Text style={styles.subtitle}>Tell us what you need. Fields marked * are required.</Text>

          <View style={styles.nameRow}>
            <View style={styles.halfField}>
              <Text style={styles.label}>First name *</Text>
              <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} autoCapitalize="words" autoComplete="given-name" textContentType="givenName" placeholder="First name" placeholderTextColor={colors.textMuted} accessibilityLabel="First name, required" />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Last name *</Text>
              <TextInput style={styles.input} value={lastName} onChangeText={setLastName} autoCapitalize="words" autoComplete="family-name" textContentType="familyName" placeholder="Last name" placeholderTextColor={colors.textMuted} accessibilityLabel="Last name, required" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" placeholder="you@example.com" placeholderTextColor={colors.textMuted} accessibilityLabel="Email address, required" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>What can we help with? *</Text>
            <View style={styles.topicList}>
              {TOPICS.map((option) => {
                const selected = topic === option.id;
                return (
                  <TouchableOpacity key={option.id} style={[styles.topic, selected && styles.topicSelected]} onPress={() => setTopic(option.id)} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ selected }}>
                    <Text style={[styles.topicText, selected && styles.topicTextSelected]}>{option.label}</Text>
                    <Text style={[styles.topicMarker, selected && styles.topicMarkerSelected]} accessibilityElementsHidden>{selected ? 'Selected' : ''}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Your inquiry *</Text>
            <TextInput style={[styles.input, styles.inquiryInput]} value={inquiry} onChangeText={setInquiry} multiline maxLength={2000} textAlignVertical="top" placeholder="Describe your question or issue" placeholderTextColor={colors.textMuted} accessibilityLabel="Your inquiry, required" accessibilityHint="Provide details that will help the T-Care team respond." />
            <Text style={styles.counter}>{inquiry.length}/2000</Text>
          </View>

          {status && <View style={[styles.status, status.type === 'error' ? styles.statusError : styles.statusSuccess]} accessibilityRole="alert"><Text style={status.type === 'error' ? styles.statusErrorText : styles.statusSuccessText}>{status.message}</Text></View>}

          <TouchableOpacity style={[styles.sendButton, isSending && styles.sendButtonDisabled]} onPress={sendInquiry} disabled={isSending} accessibilityRole="button" accessibilityLabel="Send inquiry" accessibilityState={{ disabled: isSending, busy: isSending }}>
            <Text style={styles.sendButtonText}>{isSending ? 'Sending…' : 'Send inquiry'}</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Do not use this form for urgent wellbeing, safety, accessibility, or emergency support. Use the resources in T-Care instead.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { gap: spacing.lg, padding: spacing.xl, paddingBottom: spacing.xxl + spacing.lg },
  title: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700', marginTop: spacing.sm },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, marginTop: -spacing.sm },
  nameRow: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1, gap: spacing.xs },
  field: { gap: spacing.xs },
  label: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '700' },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.textPrimary, fontSize: fontSize.base, minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  inquiryInput: { minHeight: 132 },
  counter: { alignSelf: 'flex-end', color: colors.textMuted, fontSize: fontSize.sm },
  topicList: { gap: spacing.sm },
  topic: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: spacing.md },
  topicSelected: { backgroundColor: colors.surfaceMuted, borderColor: colors.accent },
  topicText: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '600' },
  topicTextSelected: { color: colors.textPrimary },
  topicMarker: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700' },
  topicMarkerSelected: { color: colors.accent },
  status: { borderRadius: radius.md, borderWidth: 1, padding: spacing.md },
  statusError: { backgroundColor: colors.infoBg, borderColor: colors.danger },
  statusSuccess: { backgroundColor: colors.infoBg, borderColor: colors.success },
  statusErrorText: { color: colors.textPrimary, fontSize: fontSize.base, lineHeight: 20 },
  statusSuccessText: { color: colors.textPrimary, fontSize: fontSize.base, lineHeight: 20 },
  sendButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.md, justifyContent: 'center', minHeight: 52, paddingHorizontal: spacing.lg },
  sendButtonDisabled: { backgroundColor: colors.border },
  sendButtonText: { color: colors.accentOn, fontSize: fontSize.base, fontWeight: '700' },
  footer: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 18, marginTop: spacing.sm },
});
