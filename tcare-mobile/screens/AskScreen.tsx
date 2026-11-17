import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';
import { MoodCheckIn } from '../components/MoodCheckIn';
import { DidYouMeanSheet } from '../components/DidYouMeanSheet';
import { getDisambiguation } from '../utils/disambiguation';
import type { DisambiguationOption, DisambiguationPrompt } from '../utils/disambiguation';

type Campus = { id: 'utsg' | 'utsc' | 'utm'; label: string };

type Props = {
  onSubmit: (query: string) => void | Promise<void>;
  onTCardPress: () => void | Promise<void>;
  onTalkSupportPress: () => void | Promise<void>;
  onAccessibilityPress: () => void | Promise<void>;
  onResolveDisambiguation: (option: DisambiguationOption) => void | Promise<void>;
  onEmergencySupportPress: () => void;
  campus: Campus | null;
  onCampusChange: (campus: Campus | null) => void;
};

const CAMPUSES: Campus[] = [
  { id: 'utsg', label: 'St. George' },
  { id: 'utsc', label: 'UTSC' },
  { id: 'utm', label: 'UTM' },
];

const SUGGESTIONS = [
  { label: 'I lost my TCard', query: 'I lost my TCard, what do I do?' },
  { label: 'Accessibility services', query: 'Where can I access accessibility services?' },
  { label: 'Help with my studies', query: 'I need help with my studies' },
  { label: 'Registrar & enrolment', query: 'I need help with registrar and enrolment' },
];

const MOODS: { emoji: string; label: string; mood: 'good' | 'okay' | 'struggling' }[] = [
  { emoji: '😊', label: 'Good', mood: 'good' },
  { emoji: '😐', label: 'Okay', mood: 'okay' },
  { emoji: '😔', label: 'Struggling', mood: 'struggling' },
];

export function AskScreen({ onSubmit, onTCardPress, onTalkSupportPress, onAccessibilityPress, onResolveDisambiguation, onEmergencySupportPress, campus, onCampusChange }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [activeMood, setActiveMood] = useState<'good' | 'okay' | 'struggling' | null>(null);
  const [campusPickerVisible, setCampusPickerVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // The query being disambiguated, held so "ask as typed" can still send it.
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [disambiguation, setDisambiguation] = useState<DisambiguationPrompt | null>(null);

  useEffect(() => {
    let secondFrame: number | undefined;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setIsLayoutReady(true));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    };
  }, []);

  const submit = async (action: () => void | Promise<void>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await action();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSend = () => {
    const query = text.trim();
    if (!query) return;

    // For short, everyday needs the exact next step can be ambiguous
    // ("i'm hungry" -> food bank or campus dining?). Offer a quick follow-up
    // with specific choices before sending a vague question.
    const prompt = getDisambiguation(query);
    if (prompt) {
      setPendingQuery(query);
      setDisambiguation(prompt);
      return;
    }

    void submit(() => onSubmit(query));
    setText('');
  };

  const dismissDisambiguation = () => {
    setDisambiguation(null);
    setPendingQuery(null);
  };

  const handleDisambiguationSelect = (option: DisambiguationOption) => {
    setDisambiguation(null);
    setPendingQuery(null);
    setText('');
    void submit(() => onResolveDisambiguation(option));
  };

  const handleAskAnyway = () => {
    const query = pendingQuery;
    dismissDisambiguation();
    if (!query) return;
    setText('');
    void submit(() => onSubmit(query));
  };

  const askSuggestion = (suggestion: typeof SUGGESTIONS[number]) => {
    if (suggestion.label === 'I lost my TCard') return void submit(onTCardPress);
    if (suggestion.label === 'Accessibility services') return void submit(onAccessibilityPress);
    void submit(() => onSubmit(suggestion.query));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.flex, !isLayoutReady && styles.pendingLayout]}>
        <View style={styles.header}>
          <View style={styles.logoBox}><Text style={styles.logoText}>T</Text></View>
          <Text style={styles.headerTitle}>T-Care</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.greeting} accessibilityRole="header">How can we help?</Text>
          <Text style={styles.subtitle}>Ask a question. We’ll find the next step.</Text>

          <TouchableOpacity
            style={styles.campusControl}
            onPress={() => setCampusPickerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={campus ? `Campus preference: ${campus.label}` : 'Set a campus preference'}
            accessibilityHint="Optional. Used to make your result more relevant."
          >
            <Text style={styles.campusControlLabel}>Campus</Text>
            <Text style={styles.campusControlValue}>{campus ? campus.label : 'Choose campus'}</Text>
          </TouchableOpacity>

          <View style={styles.askPanel}>
            <Text style={styles.inputLabel}>Your question</Text>
            <TextInput
              style={[styles.input, inputFocused && styles.inputFocused]}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              value={text}
              onChangeText={setText}
              placeholder="Ask about a service, place, or campus need"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              editable={!isSubmitting}
              accessibilityLabel="Ask T-Care a question"
              accessibilityHint="Type a question about a U of T service or campus need"
            />
            <TouchableOpacity
              style={[styles.askButton, (!text.trim() || isSubmitting) && styles.askButtonDisabled]}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!text.trim() || isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Ask T-Care"
              accessibilityState={{ disabled: !text.trim() || isSubmitting, busy: isSubmitting }}
            >
              <Text style={[styles.askButtonText, (!text.trim() || isSubmitting) && styles.askButtonTextDisabled]}>{isSubmitting ? 'Finding support…' : 'Ask T-Care'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.popularHeading} accessibilityRole="header">Try one of these</Text>
          <View style={styles.chipList}>
            {SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity key={suggestion.label} style={styles.chip} onPress={() => askSuggestion(suggestion)} activeOpacity={0.7} disabled={isSubmitting} accessibilityRole="button" accessibilityLabel={suggestion.label} accessibilityState={{ disabled: isSubmitting }}>
                <Text style={styles.chipText}>{suggestion.label}</Text>
                <Text style={styles.chipChevron} accessibilityElementsHidden importantForAccessibility="no">›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.supportSection}>
            <View style={styles.wellbeingHeader}>
              <View><Text style={styles.wellbeingTitle} accessibilityRole="header">Wellbeing support</Text><Text style={styles.wellbeingHint}>Private and separate from your question.</Text></View>
            </View>
              <View style={styles.moodRow}>
                {MOODS.map((mood) => (
                  <TouchableOpacity key={mood.label} style={[styles.moodButton, activeMood === mood.mood && styles.moodButtonActive]} onPress={() => setActiveMood(mood.mood)} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={`I am feeling ${mood.label.toLowerCase()}`} accessibilityState={{ selected: activeMood === mood.mood }}>
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text><Text style={[styles.moodLabel, activeMood === mood.mood && styles.moodLabelActive]}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.talkSupportButton} onPress={onTalkSupportPress} accessibilityRole="button" accessibilityLabel="Talk to someone now">
                <Text style={styles.talkSupportText}>Talk to someone</Text>
              </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <DidYouMeanSheet
        prompt={disambiguation}
        onSelect={handleDisambiguationSelect}
        onAskAnyway={handleAskAnyway}
        onClose={dismissDisambiguation}
      />

      <MoodCheckIn visible={activeMood !== null} mood={activeMood} onClose={() => setActiveMood(null)} onEmergencySupportPress={onEmergencySupportPress} />

      <Modal visible={campusPickerVisible} transparent animationType="none" onRequestClose={() => setCampusPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCampusPickerVisible(false)} accessible={false} importantForAccessibility="no" />
          <View
            style={[
              styles.modalCard,
              { maxHeight: '90%', paddingBottom: Math.max(spacing.xl, insets.bottom) },
            ]}
          >
            <ScrollView accessibilityViewIsModal>
              <Text style={styles.modalTitle} accessibilityRole="header">Set your campus</Text>
              <TouchableOpacity style={styles.skipCampusButton} onPress={() => setCampusPickerVisible(false)} accessibilityRole="button" accessibilityLabel="Close campus selection">
                <Text style={styles.skipCampusText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalBody}>Optional. T-Care saves this preference and uses it to make service results more relevant.</Text>
              {CAMPUSES.map((option) => (
                <TouchableOpacity key={option.id} style={[styles.campusOption, campus?.id === option.id && styles.campusOptionSelected]} onPress={() => { onCampusChange(option); setCampusPickerVisible(false); }} accessibilityRole="button" accessibilityLabel={option.label} accessibilityState={{ selected: campus?.id === option.id }}>
                  <Text style={styles.collegeOptionText}>{option.label}</Text>
                  {campus?.id === option.id && <Text style={styles.selectedMark}>Selected</Text>}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.skipCampusButton}
                onPress={() => {
                  if (campus) onCampusChange(null);
                  setCampusPickerVisible(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={campus ? 'Remove campus preference' : 'Choose a campus later'}
              >
                <Text style={styles.skipCampusText}>{campus ? 'Remove my selection' : 'I’ll choose later'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  pendingLayout: { opacity: 0 },
  header: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  logoBox: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.md, height: 32, justifyContent: 'center', width: 32 },
  logoText: { includeFontPadding: false, textAlignVertical: 'center', color: colors.yellow, fontSize: 16, fontWeight: '700' },
  headerTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  scrollContent: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: spacing.xl, paddingBottom: spacing.xxl },
  greeting: { color: colors.textPrimary, fontSize: 28, fontWeight: '700', marginBottom: spacing.sm },
  subtitle: { color: colors.textSecondary, fontSize: 16, lineHeight: 24, marginBottom: spacing.xl },
  askPanel: { gap: spacing.md, marginBottom: spacing.xxl },
  inputLabel: { color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  inputFocused: { borderColor: colors.accent, backgroundColor: colors.infoBg },
  askButtonTextDisabled: { color: colors.textSecondary },
  input: { color: colors.textPrimary, borderColor: colors.textMuted, borderWidth: 2, borderRadius: radius.md, padding: spacing.md, fontSize: 16, lineHeight: 24, minHeight: 112, textAlignVertical: 'top' },
  askButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.md, justifyContent: 'center', minHeight: 48, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  askButtonDisabled: { backgroundColor: colors.surfaceMuted },
  askButtonText: { includeFontPadding: false, textAlignVertical: 'center', color: colors.accentOn, fontSize: 16, fontWeight: '700' },
  popularHeading: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.sm },
  chipList: { gap: 0 },
  chip: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 56, paddingVertical: spacing.md },
  chipText: { includeFontPadding: false, textAlignVertical: 'center', color: colors.textPrimary, flex: 1, fontSize: 16, fontWeight: '600' },
  chipChevron: { includeFontPadding: false, textAlignVertical: 'center', color: colors.accent, fontSize: 24, marginLeft: spacing.md },
  campusControl: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between', marginBottom: spacing.xl, minHeight: 48, paddingVertical: spacing.sm },
  campusControlLabel: { includeFontPadding: false, textAlignVertical: 'center', color: colors.textSecondary, fontSize: fontSize.base, fontWeight: '600' },
  campusControlValue: { includeFontPadding: false, textAlignVertical: 'center', color: colors.accent, fontSize: 16, fontWeight: '700', textDecorationLine: 'underline', flexShrink: 1 },
  supportSection: { marginTop: spacing.xxl, paddingTop: spacing.sm },
  wellbeingHeader: { marginBottom: spacing.sm },
  wellbeingTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '600' },
  wellbeingHint: { color: colors.textSecondary, fontSize: fontSize.base, marginTop: 2 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  moodButton: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexGrow: 1, flexBasis: 120, flexDirection: 'row', gap: spacing.sm, minHeight: 48, justifyContent: 'center', padding: spacing.md },
  moodButtonActive: { backgroundColor: colors.surface, borderColor: colors.accent },
  moodEmoji: { fontSize: 24 },
  moodLabel: { includeFontPadding: false, textAlignVertical: 'center', flexShrink: 1, color: colors.textSecondary, fontSize: fontSize.base, fontWeight: '600' },
  moodLabelActive: { color: colors.textPrimary },
  talkSupportButton: { alignItems: 'center', borderColor: colors.purple, borderRadius: radius.md, borderWidth: 1, justifyContent: 'center', marginTop: spacing.sm, minHeight: 48 },
  talkSupportText: { includeFontPadding: false, textAlignVertical: 'center', color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  modalHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  modalBackdrop: { backgroundColor: 'rgba(0,0,0,0.58)', flex: 1, justifyContent: 'flex-end' },
  modalCard: { width: '100%', maxWidth: 680, alignSelf: 'center', backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  modalBody: { color: colors.textSecondary, fontSize: 16, lineHeight: 24, marginBottom: spacing.lg, marginTop: spacing.xs },
  campusOption: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, minHeight: 52, padding: spacing.md, flexWrap: 'wrap', gap: spacing.sm },
  campusOptionSelected: { borderColor: colors.accent },
  collegeOptionText: { includeFontPadding: false, textAlignVertical: 'center', flexShrink: 1, color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  selectedMark: { includeFontPadding: false, textAlignVertical: 'center', color: colors.accent, fontSize: fontSize.base, fontWeight: '700' },
  skipCampusButton: { alignItems: 'center', justifyContent: 'center', minHeight: 48, paddingVertical: spacing.sm, marginTop: spacing.xs },
  skipCampusText: { includeFontPadding: false, textAlignVertical: 'center', color: colors.accent, fontSize: 16, fontWeight: '700' },
});
