import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = {
  onMentalHealthPress: () => void;
  onAccessibilityPress: () => void;
  onCollegeSelect: (collegeId: string) => void;
};

const COLLEGES = [
  { id: 'innis', label: 'Innis College' },
  { id: 'new-college', label: 'New College' },
  { id: 'st-michaels', label: "St. Michael's College" },
  { id: 'trinity', label: 'Trinity College' },
  { id: 'university-college', label: 'University College' },
  { id: 'victoria', label: 'Victoria College' },
  { id: 'woodsworth', label: 'Woodsworth College' },
  { id: 'utsc', label: 'UTSC (Scarborough Campus)' },
  { id: 'utm', label: 'UTM (Mississauga Campus)' },
];

export function ResourcesScreen({ onMentalHealthPress, onAccessibilityPress, onCollegeSelect }: Props) {
  const [collegePickerVisible, setCollegePickerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Resources</Text>
        <Text style={styles.subtitle}>Find campus support for your wellbeing, access, and academics.</Text>

        <View style={styles.list}>
          <TouchableOpacity style={styles.card} onPress={onMentalHealthPress} activeOpacity={0.75}>
            <View style={[styles.icon, styles.mentalHealthIcon]}><Text style={styles.iconText}>MH</Text></View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>Mental health support</Text>
              <Text style={styles.cardDescription}>Connect with Health & Wellness for counselling and care.</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={onAccessibilityPress} activeOpacity={0.75}>
            <View style={[styles.icon, styles.accessibilityIcon]}><Text style={styles.iconText}>A</Text></View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>Accessibility services</Text>
              <Text style={styles.cardDescription}>Learn about accommodations, assistive technology, and exams.</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setCollegePickerVisible(true)} activeOpacity={0.75}>
            <View style={[styles.icon, styles.academicsIcon]}><Text style={styles.iconText}>AC</Text></View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>Courses & academic support</Text>
              <Text style={styles.cardDescription}>Choose your college or campus to find its registrar.</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={collegePickerVisible} transparent animationType="fade" onRequestClose={() => setCollegePickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCollegePickerVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Choose your college or campus</Text>
            <Text style={styles.modalBody}>We'll route you to the right registrar for course and academic support.</Text>
            <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
              {COLLEGES.map((college) => (
                <TouchableOpacity key={college.id} style={styles.collegeOption} onPress={() => {
                  setCollegePickerVisible(false);
                  onCollegeSelect(college.id);
                }}>
                  <Text style={styles.collegeOptionText}>{college.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.xl },
  title: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 21, marginTop: -spacing.md },
  list: { gap: spacing.md },
  card: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  icon: { alignItems: 'center', borderRadius: radius.md, height: 42, justifyContent: 'center', width: 42 },
  mentalHealthIcon: { backgroundColor: colors.purple },
  accessibilityIcon: { backgroundColor: colors.teal },
  academicsIcon: { backgroundColor: colors.sky },
  iconText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '700' },
  cardCopy: { flex: 1, gap: spacing.xs },
  cardTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  cardDescription: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },
  chevron: { color: colors.accent, fontSize: 28, fontWeight: '300' },
  modalBackdrop: { backgroundColor: 'rgba(0, 0, 0, 0.45)', flex: 1, justifyContent: 'center', padding: spacing.xl },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, gap: spacing.sm, maxHeight: '82%', padding: spacing.lg },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  modalBody: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, marginBottom: spacing.xs },
  options: { flexGrow: 0 },
  collegeOption: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  collegeOptionText: { color: colors.accent, fontSize: fontSize.base, fontWeight: '600' },
});
