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
  onStudentLifePress: (resourceId: string) => void;
};

const STUDENT_LIFE_RESOURCES = [
  { id: 'financial-aid', label: 'Financial aid & awards', description: 'Explore awards, UTAPS, OSAP, grants, and funding support.', icon: '$', tone: 'financialIcon' },
  { id: 'housing', label: 'Housing & residence', description: 'Apply for residence or get help finding a place to live.', icon: 'H', tone: 'housingIcon' },
  { id: 'international', label: 'International student support', description: 'Get help with immigration, permits, UHIP, and settling in.', icon: 'INT', tone: 'internationalIcon' },
  { id: 'registrar', label: 'Registrar & enrolment', description: 'Manage courses, records, fees, and university deadlines.', icon: 'REG', tone: 'registrarIcon' },
  { id: 'safety', label: 'Campus safety', description: 'Find emergency contacts, safety planning, and escort services.', icon: 'SAFE', tone: 'safetyIcon' },
  { id: 'career', label: 'Career support', description: 'Book advising, explore careers, and find job-search support.', icon: 'CAR', tone: 'careerIcon' },
  { id: 'libraries-it', label: 'Libraries & IT', description: 'Access study spaces, research tools, Wi-Fi, and tech help.', icon: 'LIB', tone: 'librariesIcon' },
  { id: 'food', label: 'Food & basic needs', description: 'Find food-bank support and other community resources.', icon: 'FOOD', tone: 'foodIcon' },
  { id: 'sexual-violence', label: 'Sexual violence support', description: 'Access confidential, non-judgmental support and options.', icon: 'SV', tone: 'sexualViolenceIcon' },
] as const;

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

export function ResourcesScreen({ onMentalHealthPress, onAccessibilityPress, onCollegeSelect, onStudentLifePress }: Props) {
  const [collegePickerVisible, setCollegePickerVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Resources</Text>
        <Text style={styles.subtitle}>Find trusted U of T support for your wellbeing, studies, and student life.</Text>

        <View style={styles.list}>
          <Text style={styles.sectionTitle}>Wellbeing & academics</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={onMentalHealthPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Mental health support"
            accessibilityHint="Opens Health and Wellness support information"
          >
            <View style={[styles.icon, styles.mentalHealthIcon]}><Text style={styles.iconText}>MH</Text></View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>Mental health support</Text>
              <Text style={styles.cardDescription}>Connect with Health & Wellness for counselling and care.</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={onAccessibilityPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Accessibility services"
            accessibilityHint="Opens accessibility service information"
          >
            <View style={[styles.icon, styles.accessibilityIcon]}><Text style={styles.iconText}>A</Text></View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>Accessibility services</Text>
              <Text style={styles.cardDescription}>Learn about accommodations, assistive technology, and exams.</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => setCollegePickerVisible(true)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Courses and academic support"
            accessibilityHint="Choose your college or campus to find its registrar"
          >
            <View style={[styles.icon, styles.academicsIcon]}><Text style={styles.iconText}>AC</Text></View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>Courses & academic support</Text>
              <Text style={styles.cardDescription}>Choose your college or campus to find its registrar.</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Student life essentials</Text>
          {STUDENT_LIFE_RESOURCES.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={styles.card}
              onPress={() => onStudentLifePress(resource.id)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={resource.label}
              accessibilityHint="Opens trusted support links"
            >
              <View style={[styles.icon, styles[resource.tone]]}>
                <Text style={[styles.iconText, ['financial-aid', 'career', 'food'].includes(resource.id) && styles.iconTextDark]}>{resource.icon}</Text>
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{resource.label}</Text>
                <Text style={styles.cardDescription}>{resource.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={collegePickerVisible} transparent animationType="fade" onRequestClose={() => setCollegePickerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setCollegePickerVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined} accessibilityViewIsModal>
            <Text style={styles.modalTitle}>Choose your college or campus</Text>
            <Text style={styles.modalBody}>We'll route you to the right registrar for course and academic support.</Text>
            <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
              {COLLEGES.map((college) => (
                <TouchableOpacity key={college.id} style={styles.collegeOption} onPress={() => {
                  setCollegePickerVisible(false);
                  onCollegeSelect(college.id);
                }} accessibilityRole="button" accessibilityLabel={college.label}>
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
  card: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, minHeight: 72, padding: spacing.md },
  icon: { alignItems: 'center', borderRadius: radius.md, height: 42, justifyContent: 'center', width: 42 },
  mentalHealthIcon: { backgroundColor: colors.purple },
  accessibilityIcon: { backgroundColor: colors.teal },
  academicsIcon: { backgroundColor: colors.sky },
  financialIcon: { backgroundColor: colors.green },
  housingIcon: { backgroundColor: colors.purple },
  internationalIcon: { backgroundColor: colors.sky },
  registrarIcon: { backgroundColor: colors.teal },
  safetyIcon: { backgroundColor: colors.red },
  careerIcon: { backgroundColor: colors.yellow },
  librariesIcon: { backgroundColor: colors.darkTeal },
  foodIcon: { backgroundColor: colors.green },
  sexualViolenceIcon: { backgroundColor: colors.magenta },
  iconText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '700' },
  iconTextDark: { color: colors.accentOn },
  sectionTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.xs },
  cardCopy: { flex: 1, gap: spacing.xs },
  cardTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  cardDescription: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },
  chevron: { color: colors.accent, fontSize: 28, fontWeight: '300' },
  modalBackdrop: { backgroundColor: 'rgba(0, 0, 0, 0.45)', flex: 1, justifyContent: 'center', padding: spacing.xl },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.lg, gap: spacing.sm, maxHeight: '82%', padding: spacing.lg },
  modalTitle: { color: colors.textPrimary, fontSize: fontSize.lg, fontWeight: '700' },
  modalBody: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20, marginBottom: spacing.xs },
  options: { flexGrow: 0 },
  collegeOption: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.sm, minHeight: 44, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, justifyContent: 'center' },
  collegeOptionText: { color: colors.accent, fontSize: fontSize.base, fontWeight: '600' },
});
