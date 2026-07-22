import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Linking, ScrollView } from 'react-native';
import { colors, spacing, fontSize, radius } from '../theme';

type Mood = 'good' | 'okay' | 'struggling';

type Props = {
  visible: boolean;
  mood: Mood | null;
  onClose: () => void;
};

const GROUNDING_STEPS = [
  { title: '5-4-3-2-1', detail: 'Look around and name five things you can see, 4 things you can touch, 3 things you hear, 2 things you smell, and 1 thing you taste.' },
  { title: 'Box Breahting', detail: 'Breathe in through your nose for 4 counts, hold for 4 counts, and exhale for 4 counts. Repeat as needed.' },
  { title: 'Temperature', detail: 'A temperature change can regulate your nervous system. Wash your hands or splash your face with cold water.' },
  { title: 'Reset your body', detail: 'Go through from head to toe, tense up your body and release it.' },
  { title: 'Imagination', detail: 'Imagine you are in a comforting place. Notice your senses as if you were there.' },
];

export function MoodCheckIn({ visible, mood, onClose }: Props) {
  const [safetyAnswer, setSafetyAnswer] = useState<'yes' | 'no' | null>(null);

  const handleClose = () => {
    setSafetyAnswer(null);
    onClose();
  };

  const call = (number: string) => Linking.openURL(`tel:${number}`);

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

    // mood === 'struggling'
    if (safetyAnswer === null) {
      return (
        <>
          <Text style={styles.stepLabel}>QUICK SAFETY CHECK</Text>
          <Text style={styles.title}>Are you having any thoughts of hurting yourself or others?</Text>
          <View style={styles.answerRow}>
            <TouchableOpacity
              style={[styles.answerButton, styles.answerYes]}
              onPress={() => setSafetyAnswer('yes')}
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
            Please reach out right now. These services are free, confidential,
            and available 24/7.
          </Text>

          <TouchableOpacity style={styles.resourceCard} onPress={() => call('988')}>
            <Text style={styles.resourceTitle}>988 Suicide & Crisis Lifeline</Text>
            <Text style={styles.resourceSubtitle}>Call or text 988 · Free · 24/7</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard} onPress={() => call('911')}>
            <Text style={styles.resourceTitle}>Emergency Services</Text>
            <Text style={styles.resourceSubtitle}>Call 911 · Immediate response</Text>
          </TouchableOpacity>

          <View style={styles.resourceCard}>
            <Text style={styles.resourceTitle}>Campus Security</Text>
            <Text style={styles.resourceSubtitle}>Check your student portal for the direct line</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </>
      );
    }

    // safetyAnswer === 'no'
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