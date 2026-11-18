import { useWindowDimensions } from 'react-native';
import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

import { postWithTimeout } from '../utils/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

const TOPICS = [
  { id: 'app-issue', label: 'App issue' },
  { id: 'service-question', label: 'Service question' },
  { id: 'suggestion', label: 'Suggestion' },
  { id: 'other', label: 'Other' },
] as const;

type TopicId = typeof TOPICS[number]['id'];

export function ContactScreen() {
  const { fontScale } = useWindowDimensions();
  const singleLineInputHeight = Math.max(48, Math.ceil(20 * fontScale) + 16);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<TopicId | null>(null);
  const [inquiry, setInquiry] = useState('');
  const [status, setStatus] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [invalidField, setInvalidField] = useState('');
  const controls = useRef<Record<string, { focus(): void } | null>>({});
  const clearFieldError = (field: string) => {
    if (invalidField === field) {
      setInvalidField('');
      setStatus(null);
    }
  };
  const reportFieldError = (field: string, message: string) => {
    setInvalidField(field);
    setStatus({ type: 'error', message });
    controls.current[field]?.focus();
  };
  const fieldError = (field: string) => invalidField === field && status && (
    <Text accessibilityRole="alert" style={styles.statusErrorText}>{status.message}</Text>
  );

  const sendInquiry = async () => {
    if (isSending) return;
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedInquiry = inquiry.trim();
    const selectedTopic = TOPICS.find((option) => option.id === topic);

    const required = [
      ['firstName', trimmedFirstName, 'Enter your first name.'],
      ['lastName', trimmedLastName, 'Enter your last name.'],
      ['email', trimmedEmail, 'Enter your email address.'],
      ['topic', selectedTopic?.label, 'Choose a topic.'],
      ['inquiry', trimmedInquiry, 'Describe your inquiry.'],
    ] as const;
    for (const [field, value, message] of required) {
      if (!value) {
        reportFieldError(field, message);
        return;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      reportFieldError('email', 'Enter a valid email address so we can reply.');
      return;
    }
    setInvalidField('');
    if (!API_BASE_URL) {
      setStatus({ type: 'error', message: 'Contact submission is unavailable until the app is connected to its backend.' });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const { response, payload } = await postWithTimeout<{ ok?: boolean; error?: string }>(`${API_BASE_URL}/api/contact`, {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        topic: selectedTopic?.label,
        inquiry: trimmedInquiry,
      });
      if (!response.ok) {
        setStatus({ type: 'error', message: payload?.error || 'We could not send your inquiry. Your draft is saved here.' });
        return;
      }
      if (payload?.ok !== true) throw new Error('Unconfirmed delivery');

      setFirstName('');
      setLastName('');
      setEmail('');
      setTopic(null);
      setInquiry('');
      setStatus({ type: 'success', message: 'Your inquiry has been sent. We’ll reply to the email address you provided.' });
    } catch {
      setStatus({ type: 'error', message: 'Delivery could not be confirmed. Your inquiry may have been sent. Your draft is still here.' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Contact T-Care</Text>
          <Text style={styles.subtitle}>Tell us what you need. Fields marked * are required.</Text>

          <View style={styles.nameRow}>
            <View style={styles.halfField}>
              <Text style={styles.label}>First name *</Text>
              <TextInput editable={!isSending} style={[styles.input, styles.nameInput, { height: singleLineInputHeight, paddingTop: 0, paddingBottom: 4 }]} ref={node => { controls.current.firstName = node; }} value={firstName} onChangeText={value => { setFirstName(value); clearFieldError('firstName'); }} autoCapitalize="words" autoComplete="given-name" textContentType="givenName" placeholder="First name" placeholderTextColor={colors.textMuted} accessibilityLabel="First name, required" />
            {fieldError('firstName')}
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Last name *</Text>
              <TextInput editable={!isSending} style={[styles.input, styles.nameInput, { height: singleLineInputHeight, paddingTop: 0, paddingBottom: 4 }]} ref={node => { controls.current.lastName = node; }} value={lastName} onChangeText={value => { setLastName(value); clearFieldError('lastName'); }} autoCapitalize="words" autoComplete="family-name" textContentType="familyName" placeholder="Last name" placeholderTextColor={colors.textMuted} accessibilityLabel="Last name, required" />
            {fieldError('lastName')}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email *</Text>
            <TextInput editable={!isSending} style={[styles.input, { height: singleLineInputHeight, paddingTop: 0, paddingBottom: 4 }]} ref={node => { controls.current.email = node; }} value={email} onChangeText={value => { setEmail(value); clearFieldError('email'); }} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" placeholder="you@example.com" placeholderTextColor={colors.textMuted} accessibilityLabel="Email address, required" />
            {fieldError('email')}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>What can we help with? *</Text>
            {fieldError('topic')}
            <View style={styles.topicList}>
              {TOPICS.map((option) => {
                const selected = topic === option.id;
                return (
                  <TouchableOpacity disabled={isSending} ref={option === TOPICS[0] ? node => { controls.current.topic = node; } : undefined} key={option.id} style={[styles.topic, selected && styles.topicSelected]} onPress={() => { setTopic(option.id); clearFieldError('topic'); }} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ selected }}>
                    <Text style={[styles.topicText, selected && styles.topicTextSelected]}>{option.label}</Text>
                    <Text style={[styles.topicMarker, selected && styles.topicMarkerSelected]} accessibilityElementsHidden>{selected ? 'Selected' : ''}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Your inquiry *</Text>
            <TextInput editable={!isSending} style={[styles.input, styles.inquiryInput]} ref={node => { controls.current.inquiry = node; }} value={inquiry} onChangeText={value => { setInquiry(value); clearFieldError('inquiry'); }} multiline maxLength={2000} textAlignVertical="top" placeholder="Describe your question or issue" placeholderTextColor={colors.textMuted} accessibilityLabel="Your inquiry, required" accessibilityHint="Provide details that will help the T-Care team respond." />
            {fieldError('inquiry')}
            <Text style={styles.counter}>{inquiry.length}/2000</Text>
          </View>

          {status && !invalidField && <View style={[styles.status, status.type === 'error' ? styles.statusError : styles.statusSuccess]} accessibilityRole="alert"><Text style={status.type === 'error' ? styles.statusErrorText : styles.statusSuccessText}>{status.message}</Text></View>}

          <TouchableOpacity style={[styles.sendButton, isSending && styles.sendButtonDisabled]} onPress={sendInquiry} disabled={isSending} accessibilityRole="button" accessibilityLabel="Send inquiry" accessibilityState={{ disabled: isSending, busy: isSending }}>
            <Text style={styles.sendButtonText}>{isSending ? 'Sending…' : 'Send inquiry'}</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Do not use this form for urgent wellbeing, safety, accessibility, or emergency support. Use the resources in T-Care instead.</Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nameInput: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { gap: spacing.lg, padding: spacing.xl, paddingBottom: spacing.xxl + spacing.lg },
  title: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700', marginTop: spacing.sm },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, marginTop: -spacing.sm },
  nameRow: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1, gap: spacing.xs },
  field: { gap: spacing.xs },
  label: { color: colors.textPrimary, fontSize: fontSize.sm, fontWeight: '700' },
  input: { includeFontPadding: false, textAlignVertical: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.textPrimary, fontSize: fontSize.base, minHeight: 48, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  inquiryInput: { minHeight: 132 },
  counter: { alignSelf: 'flex-end', color: colors.textMuted, fontSize: fontSize.sm },
  topicList: { gap: spacing.sm },
  topic: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: spacing.md },
  topicSelected: { backgroundColor: colors.surfaceMuted, borderColor: colors.accent },
  topicText: { includeFontPadding: false, textAlignVertical: 'center', color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '600' },
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
  sendButtonText: { includeFontPadding: false, textAlignVertical: 'center', color: colors.accentOn, fontSize: fontSize.base, fontWeight: '700' },
  footer: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 18, marginTop: spacing.sm },
});
