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
  Platform,
} from 'react-native';
import { colors, spacing, fontSize } from '../theme';

type Props = {
  onSubmit: (query: string) => void;
};

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

export function AskScreen({ onSubmit }: Props) {
  const [text, setText] = useState('');

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
          <Text style={styles.greeting}>Hey, what's going on?</Text>
          <Text style={styles.subtitle}>
            Tell me what you need and I'll point you to the right place.
          </Text>

          <View style={styles.chipList}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s.label}
                style={styles.chip}
                onPress={() => onSubmit(s.query)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{s.label}</Text>
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
  },
  chipText: {
    fontSize: fontSize.base,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
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
  },
  sendButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sendButtonText: {
    color: colors.accentOn,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
});