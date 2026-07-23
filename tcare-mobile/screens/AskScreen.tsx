import React, { useState } from 'react';
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
};

const COLLEGES = [
  { id: 'innis', label: 'Innis College' },
  { id: 'new-college', label: 'New College' },
  { id: 'st-michaels', label: 'St. Michael’s College' },
  { id: 'trinity', label: 'Trinity College' },
  { id: 'university-college', label: 'University College' },
  { id: 'victoria', label: 'Victoria College' },
  { id: 'woodsworth', label: 'Woodsworth College' },
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

export function AskScreen({ onSubmit, onTCardPress, onTalkSupportPress, onAccessibilityPress, onCollegeSelect }: Props) {
  const [text, setText] = useState('');
  const [activeMood, setActiveMood] = useState<'good' | 'okay' | 'struggling' | null>(null);
  const [collegePromptVisible, setCollegePromptVisible] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
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

          <View style={styles.chipList}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.chip}
                onPress={() => {
                  if (s.label === 'I lost my TCard') return onTCardPress();
                  if (s.label === 'I need someone to talk to') return onTalkSupportPress();
                  if (s.label === 'Accessibility services') return onAccessibilityPress();
                  if (s.label === 'I need help with my studies') return setCollegePromptVisible(true);
                  onSubmit(s.query);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.moodTitle}>How are you feeling right now?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.label}
                style={styles.moodButton}
                onPress={() => setActiveMood(m.mood)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={styles.moodLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Describe your situation..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <MoodCheckIn
        visible={activeMood !== null}
        mood={activeMood}
        onClose={() => setActiveMood(null)}
      />

      <Modal
        visible={collegePromptVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCollegePromptVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCollegePromptVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Which U of T college are you in?</Text>
            <Text style={styles.modalBody}>
              We’ll point you to your college registrar’s academic assistance office.
            </Text>
            {COLLEGES.map((college) => (
              <TouchableOpacity
                key={college.id}
                style={styles.collegeOption}
                onPress={() => {
                  setCollegePromptVisible(false);
                  onCollegeSelect(college.id);
                }}
              >
                <Text style={styles.collegeOptionText}>{college.label}</Text>
              </TouchableOpacity>
            ))}
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
  chipList: {
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  chipText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  moodTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
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
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
    maxHeight: 100,
    borderRadius: 999,
  },
  sendButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 999,
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
  collegeOptionText: {
    color: colors.accent,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
});
