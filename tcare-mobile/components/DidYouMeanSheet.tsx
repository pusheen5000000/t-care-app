import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';
import type { DisambiguationOption, DisambiguationPrompt } from '../utils/disambiguation';

type Props = {
  prompt: DisambiguationPrompt | null;
  onSelect: (option: DisambiguationOption) => void;
  // Send the student's original wording to the normal Ask flow instead.
  onAskAnyway: () => void;
  onClose: () => void;
};

/**
 * A quick "did you mean" follow-up shown when a casual, everyday query is
 * ambiguous. It presents a short list of specific choices as buttons, plus an
 * escape hatch to ask the original question as typed.
 */
export function DidYouMeanSheet({ prompt, onSelect, onAskAnyway, onClose }: Props) {
  const visible = prompt !== null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => undefined} accessibilityViewIsModal>
          <View style={styles.handle} accessibilityElementsHidden />
          <Text style={styles.question}>{prompt?.question ?? 'Did you mean:'}</Text>
          {prompt?.trigger ? (
            <Text style={styles.subtext}>
              A few things match “{prompt.trigger}”. Pick the one you need.
            </Text>
          ) : null}

          <ScrollView style={styles.optionScroll} contentContainerStyle={styles.optionList}>
            {prompt?.options.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={styles.option}
                onPress={() => onSelect(option)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityHint={option.description}
              >
                <View style={styles.optionCopy}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Text style={styles.optionChevron} accessibilityElementsHidden>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.askAnyway}
            onPress={onAskAnyway}
            accessibilityRole="button"
            accessibilityLabel="Ask my question as typed"
            accessibilityHint="Skips these choices and sends your original question"
          >
            <Text style={styles.askAnywayText}>None of these — ask as typed</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.58)', flex: 1, justifyContent: 'flex-end' },
  card: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '80%', paddingBottom: spacing.xl, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  handle: { alignSelf: 'center', backgroundColor: colors.border, borderRadius: radius.full, height: 4, marginBottom: spacing.md, width: 44 },
  question: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  subtext: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, marginTop: spacing.xs },
  optionScroll: { marginTop: spacing.lg },
  optionList: { gap: spacing.sm },
  option: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, minHeight: 64, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  optionCopy: { flex: 1, gap: spacing.xs },
  optionLabel: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  optionDescription: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },
  optionChevron: { color: colors.accent, fontSize: 24 },
  askAnyway: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, minHeight: 44 },
  askAnywayText: { color: colors.accent, fontSize: fontSize.base, fontWeight: '700' },
});
