import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
} from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';
import { MoodCheckIn } from '../components/MoodCheckIn';

type Campus = { id: 'utsg' | 'utsc' | 'utm'; label: string };

type Props = {
  onSubmit: (query: string) => void;
  onTCardPress: () => void;
  onTalkSupportPress: () => void;
  onAccessibilityPress: () => void;
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

export function AskScreen({ onSubmit, onTCardPress, onTalkSupportPress, onAccessibilityPress, onEmergencySupportPress, campus, onCampusChange }: Props) {
  const [text, setText] = useState('');
  const [activeMood, setActiveMood] = useState<'good' | 'okay' | 'struggling' | null>(null);
  const [campusPickerVisible, setCampusPickerVisible] = useState(false);
  const [moodOptionsVisible, setMoodOptionsVisible] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

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

  const handleSend = () => {
    const query = text.trim();
    if (!query) return;
    onSubmit(query);
    setText('');
  };

  const askSuggestion = (suggestion: typeof SUGGESTIONS[number]) => {
    if (suggestion.label === 'I lost my TCard') return onTCardPress();
    if (suggestion.label === 'Accessibility services') return onAccessibilityPress();
    onSubmit(suggestion.query);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={[styles.flex, !isLayoutReady && styles.pendingLayout]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <View style={styles.logoBox}><Text style={styles.logoText}>T</Text></View>
          <Text style={styles.headerTitle}>T-Care</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.greeting}>How can we help?</Text>
          <Text style={styles.subtitle}>Ask a question. We’ll find the next step.</Text>

          <View style={styles.askPanel}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Ask about a service, place, or campus need"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              accessibilityLabel="Ask T-Care a question"
              accessibilityHint="Type a question about a U of T service or campus need"
            />
            <TouchableOpacity
              style={[styles.askButton, !text.trim() && styles.askButtonDisabled]}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!text.trim()}
              accessibilityRole="button"
              accessibilityLabel="Ask T-Care"
              accessibilityState={{ disabled: !text.trim() }}
            >
              <Text style={styles.askButtonText}>Ask T-Care</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.popularHeading}>Try one of these</Text>
          <View style={styles.chipList}>
            {SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity key={suggestion.label} style={styles.chip} onPress={() => askSuggestion(suggestion)} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={suggestion.label}>
                <Text style={styles.chipText}>{suggestion.label}</Text>
                <Text style={styles.chipChevron} accessibilityElementsHidden>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.supportSection}>
            <TouchableOpacity style={styles.campusRow} onPress={() => setCampusPickerVisible(true)} accessibilityRole="button" accessibilityLabel={campus ? `Campus preference: ${campus.label}` : 'Set a campus preference'} accessibilityHint="Optional. Saved for more relevant results.">
              <View style={styles.campusCopy}>
                <Text style={styles.campusTitle}>Campus</Text>
                <Text style={styles.campusValue}>{campus ? campus.label : 'Set a preference'}</Text>
              </View>
              <Text style={styles.campusChevron} accessibilityElementsHidden>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.wellbeingToggle} onPress={() => setMoodOptionsVisible((visible) => !visible)} accessibilityRole="button" accessibilityLabel="Wellbeing support" accessibilityState={{ expanded: moodOptionsVisible }}>
              <View><Text style={styles.wellbeingToggleText}>Wellbeing support</Text><Text style={styles.wellbeingHint}>Private and separate from your question.</Text></View>
              <Text style={styles.campusChevron} accessibilityElementsHidden>{moodOptionsVisible ? '⌃' : '⌄'}</Text>
            </TouchableOpacity>
            {moodOptionsVisible && <>
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
            </>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <MoodCheckIn visible={activeMood !== null} mood={activeMood} onClose={() => setActiveMood(null)} onEmergencySupportPress={onEmergencySupportPress} />

      <Modal visible={campusPickerVisible} transparent animationType="slide" onRequestClose={() => setCampusPickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCampusPickerVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined} accessibilityViewIsModal>
            <Text style={styles.modalTitle}>Set your campus</Text>
            <Text style={styles.modalBody}>Optional. T-Care saves this preference and uses it to make service results more relevant.</Text>
            {CAMPUSES.map((option) => (
              <TouchableOpacity key={option.id} style={[styles.campusOption, campus?.id === option.id && styles.campusOptionSelected]} onPress={() => { onCampusChange(option); setCampusPickerVisible(false); }} accessibilityRole="button" accessibilityLabel={option.label} accessibilityState={{ selected: campus?.id === option.id }}>
                <Text style={styles.collegeOptionText}>{option.label}</Text>
                {campus?.id === option.id && <Text style={styles.selectedMark}>Selected</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.skipCampusButton} onPress={() => { onCampusChange(null); setCampusPickerVisible(false); }} accessibilityRole="button" accessibilityLabel="Clear campus preference"><Text style={styles.skipCampusText}>I’ll choose later</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, flex: { flex: 1 }, pendingLayout: { opacity: 0 },
  header: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  logoBox: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.md, height: 32, justifyContent: 'center', width: 32 }, logoText: { color: colors.accentOn, fontSize: fontSize.base, fontWeight: '700' }, headerTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl }, greeting: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.xs }, subtitle: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, marginBottom: spacing.xl },
  askPanel: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl, borderWidth: 1, gap: spacing.sm, marginBottom: spacing.xxl, padding: spacing.md }, input: { color: colors.textPrimary, fontSize: fontSize.base, lineHeight: 20, minHeight: 64, textAlignVertical: 'top' }, askButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.md, justifyContent: 'center', minHeight: 48, paddingHorizontal: spacing.lg }, askButtonDisabled: { backgroundColor: colors.border }, askButtonText: { color: colors.accentOn, fontSize: fontSize.base, fontWeight: '700' },
  popularHeading: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '700', marginBottom: spacing.sm }, chipList: { gap: 0 }, chip: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 52 }, chipText: { color: colors.textPrimary, flex: 1, fontSize: fontSize.base, fontWeight: '600' }, chipChevron: { color: colors.accent, fontSize: 24, marginLeft: spacing.md },
  campusRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 60 }, campusCopy: { flex: 1 }, campusTitle: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '600' }, campusValue: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18, marginTop: 2 }, campusChevron: { color: colors.accent, fontSize: 24, marginLeft: spacing.md },
  supportSection: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.xxl }, wellbeingToggle: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 60 }, wellbeingToggleText: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '600' }, wellbeingHint: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }, moodRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }, moodButton: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flex: 1, gap: spacing.xs, minHeight: 76, justifyContent: 'center', paddingVertical: spacing.sm }, moodButtonActive: { backgroundColor: colors.surface, borderColor: colors.accent }, moodEmoji: { fontSize: 24 }, moodLabel: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' }, moodLabelActive: { color: colors.textPrimary }, talkSupportButton: { alignItems: 'center', borderColor: colors.purple, borderRadius: radius.md, borderWidth: 1, justifyContent: 'center', marginTop: spacing.sm, minHeight: 48 }, talkSupportText: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700' },
  modalBackdrop: { backgroundColor: 'rgba(0,0,0,0.58)', flex: 1, justifyContent: 'flex-end' }, modalCard: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl }, modalTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' }, modalBody: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, marginBottom: spacing.lg, marginTop: spacing.xs }, campusOption: { alignItems: 'center', borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, minHeight: 52, paddingHorizontal: spacing.md }, campusOptionSelected: { borderColor: colors.accent }, collegeOptionText: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '600' }, selectedMark: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' }, skipCampusButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, marginTop: spacing.xs }, skipCampusText: { color: colors.accent, fontSize: fontSize.base, fontWeight: '700' },
});
