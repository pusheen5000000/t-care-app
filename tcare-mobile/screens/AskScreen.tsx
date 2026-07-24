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

type Props = {
  onSubmit: (query: string) => void;
  onTCardPress: () => void;
  onTalkSupportPress: () => void;
  onAccessibilityPress: () => void;
  onCollegeSelect: (collegeId: string) => void;
  onEmergencySupportPress: () => void;
  campus: Campus | null;
  onCampusChange: (campus: Campus | null) => void;
};

type Campus = { id: 'utsg' | 'utsc' | 'utm'; label: string };

const CAMPUSES: Campus[] = [
  { id: 'utsg', label: 'St. George' },
  { id: 'utsc', label: 'UTSC' },
  { id: 'utm', label: 'UTM' },
];

const COLLEGES = [
  { id: 'innis', label: 'Innis College' },
  { id: 'new-college', label: 'New College' },
  { id: 'st-michaels', label: 'St. Michael’s College' },
  { id: 'trinity', label: 'Trinity College' },
  { id: 'university-college', label: 'University College' },
  { id: 'victoria', label: 'Victoria College' },
  { id: 'woodsworth', label: 'Woodsworth College' },
  { id: 'utsc', label: 'UTSC (Scarborough Campus)' },
  { id: 'utm', label: 'UTM (Mississauga Campus)' },
];

const SUGGESTIONS = [
  { label: 'I lost my TCard', query: 'I lost my TCard, what do I do?' },
  {
    label: 'I need someone to talk to',
    query: 'I need someone to talk to, I feel overwhelmed',
  },
  {
    label: 'Accessibility services',
    query: 'Where can I access accessibility services?',
  },
  {
    label: 'I need help with my studies',
    query: 'I need help with my studies',
  },
];

const MOODS: { emoji: string; label: string; mood: 'good' | 'okay' | 'struggling' }[] = [
  { emoji: '😊', label: 'Good', mood: 'good' },
  { emoji: '😐', label: 'Okay', mood: 'okay' },
  { emoji: '😔', label: 'Struggling', mood: 'struggling' },
];

export function AskScreen({ onSubmit, onTCardPress, onTalkSupportPress, onAccessibilityPress, onCollegeSelect, onEmergencySupportPress, campus, onCampusChange }: Props) {
  const [text, setText] = useState('');
  const [activeMood, setActiveMood] = useState<'good' | 'okay' | 'struggling' | null>(null);
  const [collegePromptVisible, setCollegePromptVisible] = useState(false);
  const [campusPickerVisible, setCampusPickerVisible] = useState(false);
  const [moodOptionsVisible, setMoodOptionsVisible] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    // On web, the viewport can settle one frame after this screen mounts. Keep
    // the screen hidden until then so controls never paint at their transient
    // position before moving into place.
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
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={[styles.flex, !isLayoutReady && styles.pendingLayout]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>T</Text>
            </View>
            <Text style={styles.headerTitle}>T-Care</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.greeting}>Every resource, routed to you. </Text>
          <Text style={styles.subtitle}>
            The fastest path to campus support. 
          </Text>

          <TouchableOpacity
            style={styles.campusSelector}
            onPress={() => setCampusPickerVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={campus ? `Your campus: ${campus.label}` : 'Choose your campus'}
            accessibilityHint="Optionally chooses a campus to make results more relevant"
          >
            <View>
              <Text style={styles.campusLabel}>YOUR CAMPUS</Text>
              <Text style={styles.campusValue}>{campus?.label ?? 'Choose for more relevant results'}</Text>
            </View>
            <Text style={styles.campusChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.chipList}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.chip}
                onPress={() => {
                  if (s.label === 'I lost my TCard') return onTCardPress();
                  if (s.label === 'I need someone to talk to') return onTalkSupportPress();
                  if (s.label === 'Accessibility services') return onAccessibilityPress();
                  if (s.label === 'I need help with my studies') {
                    // UTSC and UTM each have one campus-level academic office.
                    // St. George still needs the student's college to route them.
                    if (campus?.id === 'utsc' || campus?.id === 'utm') return onCollegeSelect(campus.id);
                    return setCollegePromptVisible(true);
                  }
                  onSubmit(s.query);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={s.label}
                accessibilityHint="Opens guidance for this campus support need"
              >
                <Text style={styles.chipText}>{s.label}</Text>
                <Text style={styles.chipChevron} aria-hidden>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.wellbeingToggle}
            onPress={() => setMoodOptionsVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel="Optional wellbeing check-in"
            accessibilityState={{ expanded: moodOptionsVisible }}
          >
            <Text style={styles.wellbeingToggleText}>Need wellbeing support?</Text>
            <Text style={styles.wellbeingToggleHint}>Optional check-in {moodOptionsVisible ? '⌃' : '⌄'}</Text>
          </TouchableOpacity>
          {moodOptionsVisible && (
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m.label}
                  style={[styles.moodButton, activeMood === m.mood && styles.moodButtonActive]}
                  onPress={() => setActiveMood(m.mood)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`I am feeling ${m.label.toLowerCase()}`}
                  accessibilityState={{ selected: activeMood === m.mood }}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, activeMood === m.mood && styles.moodLabelActive]}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Describe your situation..."
            placeholderTextColor={colors.textMuted}
            multiline
            accessibilityLabel="Describe your situation"
            accessibilityHint="Type a question about a U of T service or campus need"
          />
          <TouchableOpacity
            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            activeOpacity={0.8}
            disabled={!text.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send question"
            accessibilityState={{ disabled: !text.trim() }}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <MoodCheckIn
        visible={activeMood !== null}
        mood={activeMood}
        onClose={() => setActiveMood(null)}
        onEmergencySupportPress={onEmergencySupportPress}
      />

      <Modal
        visible={collegePromptVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCollegePromptVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCollegePromptVisible(false)}>
          <Pressable
            style={styles.modalCard}
            onPress={() => undefined}
            accessibilityViewIsModal
          >
            <Text style={styles.modalTitle}>Which U of T college or campus are you in?</Text>
            <Text style={styles.modalBody}>
              We’ll point you to your college registrar’s academic assistance office.
            </Text>
            <ScrollView style={styles.collegeOptions} showsVerticalScrollIndicator={false}>
              {(campus
                ? COLLEGES.filter((college) => college.id !== 'utsc' && college.id !== 'utm')
                : COLLEGES
              ).map((college) => (
                <TouchableOpacity
                  key={college.id}
                  style={styles.collegeOption}
                  onPress={() => {
                    setCollegePromptVisible(false);
                    onCollegeSelect(college.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={college.label}
                >
                  <Text style={styles.collegeOptionText}>{college.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={campusPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCampusPickerVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCampusPickerVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined} accessibilityViewIsModal>
            <Text style={styles.modalTitle}>Choose your campus</Text>
            <Text style={styles.modalBody}>This helps T-Care give more relevant service and location guidance. You can change it anytime.</Text>
            {CAMPUSES.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.collegeOption}
                onPress={() => { onCampusChange(option); setCampusPickerVisible(false); }}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: campus?.id === option.id }}
              >
                <Text style={styles.collegeOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.skipCampusButton}
              onPress={() => { onCampusChange(null); setCampusPickerVisible(false); }}
              accessibilityRole="button"
              accessibilityLabel="Skip campus selection"
            >
              <Text style={styles.skipCampusText}>Skip for now</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  pendingLayout: {
    opacity: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBox: {
    width: 30,
    height: 30,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.accentOn,
    fontWeight: '700',
    fontSize: fontSize.base,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  campusSelector: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg, minHeight: 56, paddingHorizontal: spacing.md },
  campusLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700', letterSpacing: 0.7 },
  campusValue: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '600', marginTop: 2 },
  campusChevron: { color: colors.accent, fontSize: 28, fontWeight: '300' },
  chipList: {
    gap: spacing.sm,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  chipText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  chipChevron: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: '400',
    marginLeft: spacing.md,
  },
  wellbeingToggle: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl, minHeight: 44 },
  wellbeingToggleText: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '600' },
  wellbeingToggleHint: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '600' },
  moodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  moodButton: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.lg,
    minHeight: 72,
  },
  moodButtonActive: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  moodLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    minHeight: 48,
    maxHeight: 100,
    borderRadius: 999,
    lineHeight: 20,
    justifyContent: 'center',
    textAlignVertical: 'center',
  },
  sendButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 48,
  },
  sendButtonDisabled: {
    opacity: 0.55,
  },
  sendButtonText: {
    color: colors.accentOn,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    maxHeight: '82%',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  modalBody: {
    color: colors.textSecondary,
    fontSize: fontSize.base,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  collegeOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  collegeOptions: {
    flexGrow: 0,
  },
  collegeOptionText: {
    color: colors.accent,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  skipCampusButton: { alignSelf: 'flex-start', justifyContent: 'center', minHeight: 44, paddingHorizontal: spacing.sm },
  skipCampusText: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '700' },
});
