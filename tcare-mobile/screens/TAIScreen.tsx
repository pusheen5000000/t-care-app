import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

type Message = { id: string; role: 'user' | 'assistant'; text: string };

const INITIAL: Message[] = [
  {
    id: '1',
    role: 'assistant',
    text: "Hi! I'm T-AI, your Accessibility Assistant. Ask me anything about campus resources, accommodations, or support services and I'll do my best to help.",
  },
];

export function TAIScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    // stub reply — call groq api here later
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + 'a', role: 'assistant', text: '...' },
      ]);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>🤖</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>T-AI (T-Care AI Assistant)</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.bubbleRow,
              m.role === 'user' ? styles.bubbleRowUser : styles.bubbleRowAssistant,
            ]}
          >
            {m.role === 'assistant' && (
              <View style={styles.avatarSmall}>
                <Text style={styles.avatarEmojiSmall}>🤖</Text>
              </View>
            )}
            <View
              style={[
                styles.bubble,
                m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
              ]}
            >
              <Text
                style={
                  m.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant
                }
              >
                {m.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={send}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} activeOpacity={0.8}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl * 2.5,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 18 },
  headerTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  statusText: { color: colors.textMuted, fontSize: fontSize.sm },
  chatArea: { flex: 1 },
  chatContent: { padding: spacing.lg, gap: spacing.md },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAssistant: { justifyContent: 'flex-start' },
  avatarSmall: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmojiSmall: { fontSize: 13 },
  bubble: { maxWidth: '75%', padding: spacing.md, borderRadius: radius.lg },
  bubbleAssistant: { backgroundColor: colors.surface, borderTopLeftRadius: radius.sm },
  bubbleUser: { backgroundColor: colors.accent, borderTopRightRadius: radius.sm },
  bubbleTextAssistant: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20 },
  bubbleTextUser: { color: colors.white, fontSize: fontSize.base, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: colors.white, fontSize: fontSize.md },
});