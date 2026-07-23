import React from 'react';
import * as Clipboard from 'expo-clipboard';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = { visible: boolean; onClose: () => void };

const PHONE_SUPPORT = [
  { name: '9-8-8 Suicide Crisis Helpline', number: '988', phoneLabel: '9-8-8', detail: 'Call or text yourself · Free · 24/7' },
  { name: 'U of T Telus Health Student Support', number: '18444519700', phoneLabel: '1-844-451-9700', detail: 'Call or text yourself · 24/7' },
  { name: 'Good2Talk student helpline', number: '18669255454', phoneLabel: '1-866-925-5454', detail: 'Call yourself · Free · 24/7' },
  { name: 'Emergency services', number: '911', phoneLabel: '9-1-1', detail: 'For immediate danger or a medical emergency' },
];

export function EmergencySupportSheet({ visible, onClose }: Props) {
  const handleSupportAction = async (support: (typeof PHONE_SUPPORT)[number]) => {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.intent.action.DIAL');
      return;
    }

    await Clipboard.setStringAsync(support.phoneLabel);
    Alert.alert('Number copied', `Open the Phone app and enter ${support.phoneLabel} when you are ready.`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet} accessibilityViewIsModal>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close urgent support">
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.eyebrow}>URGENT SUPPORT</Text>
            <Text style={styles.title}>You do not have to handle this alone.</Text>
            <Text style={styles.body}>
              T-Care will never place a call or send a text. On Android, open a blank dialer; on iPhone, copy a number and open Phone when you are ready.
            </Text>
            {PHONE_SUPPORT.map((support) => (
              <View key={support.number} style={styles.supportRow}>
                <Text style={styles.supportName}>{support.name}</Text>
                <Text style={styles.phoneNumber}>{support.phoneLabel}</Text>
                <Text style={styles.supportDetail}>{support.detail}</Text>
                <TouchableOpacity
                  style={[styles.openPhoneButton, support.number === '911' && styles.emergencyButton]}
                  onPress={() => void handleSupportAction(support)}
                  accessibilityRole="button"
                  accessibilityLabel={Platform.OS === 'android' ? 'Open blank phone dialer' : `Copy ${support.phoneLabel}`}
                  accessibilityHint={Platform.OS === 'android' ? 'Opens the phone dialer without a number or call' : 'Copies this number so you can enter it in your Phone app'}
                >
                  <Text style={[styles.openPhoneText, support.number === '911' && styles.emergencyButtonText]}>
                    {Platform.OS === 'android' ? 'Open dialer' : 'Copy number'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            <Text style={styles.note}>If you can, move to a safer place or ask someone nearby to stay with you.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.68)', justifyContent: 'center', padding: spacing.xl },
  sheet: { backgroundColor: colors.surface, borderColor: colors.danger, borderRadius: radius.xl, borderWidth: 1, maxHeight: '86%', padding: spacing.xl },
  content: { gap: spacing.sm, paddingTop: spacing.sm },
  closeButton: { alignItems: 'center', height: 44, justifyContent: 'center', position: 'absolute', right: spacing.sm, top: spacing.sm, width: 44, zIndex: 1 },
  closeButtonText: { color: colors.textSecondary, fontSize: 28, lineHeight: 30 },
  eyebrow: { color: colors.danger, fontSize: fontSize.sm, fontWeight: '700', letterSpacing: 0.5, marginRight: 36 },
  title: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700', lineHeight: 24, marginRight: 28 },
  body: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, marginBottom: spacing.sm },
  supportRow: { backgroundColor: colors.infoBg, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.xs, padding: spacing.md },
  supportName: { color: colors.textPrimary, fontSize: fontSize.base, fontWeight: '700' },
  phoneNumber: { color: colors.danger, fontSize: fontSize.md, fontWeight: '700' },
  supportDetail: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },
  openPhoneButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.md, justifyContent: 'center', marginTop: spacing.xs, minHeight: 44, paddingHorizontal: spacing.md },
  emergencyButton: { backgroundColor: colors.danger },
  openPhoneText: { color: colors.accentOn, fontSize: fontSize.base, fontWeight: '700' },
  emergencyButtonText: { color: colors.white },
  note: { color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 18, marginTop: spacing.sm },
});
