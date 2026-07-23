import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

type Mood = 'good' | 'okay' | 'struggling';

type Props = {
  visible: boolean;
  mood: Mood | null;
  onClose: () => void;
  onEmergencySupportPress: () => void;
};

const GROUNDING_STEPS = [
  { title: '5-4-3-2-1', detail: 'Look around and name five things you can see, 4 things you can touch, 3 things you hear, 2 things you smell, and 1 thing you taste.' },
  { title: 'Box Breathing', detail: 'Breathe in through your nose for 4 counts, hold for 4 counts, and exhale for 4 counts. Repeat as needed.' },
  { title: 'Temperature', detail: 'A temperature change can regulate your nervous system. Wash your hands or splash your face with cold water.' },
  { title: 'Reset your body', detail: 'Go through from head to toe, tense up your body and release it.' },
  { title: 'Imagination', detail: 'Imagine you are in a comforting place. Notice your senses as if you were there.' },
];

export function MoodCheckIn({ visible, mood, onClose, onEmergencySupportPress }: Props) {
  const [safetyAnswer, setSafetyAnswer] = useState<'yes' | 'no' | null>(null);

  const handleClose = () => {
    setSafetyAnswer(null);
    onClose();
  };

  const renderContent = () => {
    if (mood === 'good') {
      return (
        <>
          <Text style={styles.title}>Good to hear 😊</Text>
          <Text style={styles.body}>
            Glad things are going well. If anything comes up later, T-Care is
            always here.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
            <Text style={styles.primaryButtonText}>Thanks</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (mood === 'okay') {
      return <GroundingContent onDone={handleClose} />;
    }

    if (mood !== 'struggling') {
      return null;
    }

    if (safetyAnswer === null) {
      return (
        <>
          <Text style={styles.stepLabel}>QUICK SAFETY CHECK</Text>
          <Text style={styles.title}>Are you having any thoughts of hurting yourself or others?</Text>
          <View style={styles.answerRow}>
            <TouchableOpacity
              style={[styles.answerButton, styles.answerYes]}
              onPress={() => { handleClose(); onEmergencySupportPress(); }}
            >
              <Text style={styles.answerYesText}>Yes, I am</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.answerButton, styles.answerNo]}
              onPress={() => setSafetyAnswer('no')}
            >
              <Text style={styles.answerNoText}>No, I'm okay</Text>
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (safetyAnswer === 'yes') {
      return (
        <>
          <Text style={styles.warningTitle}>⚠️ You're not alone</Text>
          <Text style={styles.body}>
            You deserve support. This app will not call or text anyone for you.
            If you choose to reach out, open your phone app and dial or text one of these numbers yourself.
          </Text>

          <TouchableOpacity
            style={styles.urgentButton}
            onPress={() => { handleClose(); onEmergencySupportPress(); }}
            accessibilityRole="button"
            accessibilityLabel="Open urgent support options"
          >
            <Text style={styles.urgentButtonText}>Open urgent support options</Text>
          </TouchableOpacity>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>9-8-8 Suicide Crisis Helpline</Text>
            <Text style={styles.resourceSubtitle}>Call or text 9-8-8 yourself · Free · 24/7</Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>U of T Telus Health Student Support</Text>
            <Text style={styles.resourceSubtitle}>Call or text 1-844-451-9700 yourself · 24/7</Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>Good2Talk student helpline</Text>
            <Text style={styles.resourceSubtitle}>Call 1-866-925-5454 yourself · Free · 24/7</Text>
          </View>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>Emergency help</Text>
            <Text style={styles.resourceSubtitle}>If there is immediate danger, use your phone to call 9-1-1 or go to the nearest emergency department.</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </>
      );
    }

    return <GroundingContent onDone={handleClose} />;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderContent()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function GroundingContent({ onDone }: { onDone: () => void }) {
  return (
    <>
      <Text style={styles.stepLabel}>GROUNDING TECHNIQUE</Text>
      <Text style={styles.title}>Let's slow down for a minute</Text>
      <Text style={styles.body}>
        Here are some strategies that can help bring your attention back to the
        present moment.
      </Text>

      {GROUNDING_STEPS.map((step) => (
        <View key={step.title} style={styles.groundingStep}>
          <Text style={styles.groundingStepTitle}>{step.title}</Text>
          <Text style={styles.groundingStepDetail}>{step.detail}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.primaryButton} onPress={onDone}>
        <Text style={styles.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    maxHeight: '80%',
    borderRadius: radius.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },
  closeButtonText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  stepLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  warningTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: spacing.md,
  },
  body: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  answerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  answerButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  answerYes: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  answerYesText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
  answerNo: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  answerNoText: {
    color: colors.accentOn,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
  resourceCard: {
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
  },
  resourceTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resourceSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  urgentButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  urgentButtonText: { color: colors.white, fontSize: fontSize.base, fontWeight: '700' },
  groundingStep: {
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingLeft: spacing.md,
    marginBottom: spacing.md,
  },
  groundingStepTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  groundingStepDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    borderRadius: radius.lg,
  },
  primaryButtonText: {
    color: colors.accentOn,
    fontWeight: '600',
    fontSize: fontSize.base,
  },
});
