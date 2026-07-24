import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = {
  onMentalHealthPress: () => void;
  onAccessibilityPress: () => void;
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

export function ResourcesScreen({ onMentalHealthPress, onAccessibilityPress, onStudentLifePress }: Props) {
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const matchingResources = STUDENT_LIFE_RESOURCES.filter((resource) =>
    !normalizedSearch
    || `${resource.label} ${resource.description}`.toLowerCase().includes(normalizedSearch),
  );
  const popularResources = STUDENT_LIFE_RESOURCES.filter((resource) =>
    ['financial-aid', 'housing', 'food'].includes(resource.id),
  );

  useEffect(() => {
    // On web, the viewport can settle one frame after this screen mounts. Keep
    // the screen hidden until then so it never flashes at a transient offset.
    let secondFrame: number | undefined;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setIsLayoutReady(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    };
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, !isLayoutReady && styles.pendingLayout]}
      pointerEvents={isLayoutReady ? 'auto' : 'none'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Resources</Text>
        <Text style={styles.subtitle}>Find trusted U of T support for your wellbeing, studies, and student life.</Text>

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search resources"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search campus resources"
          accessibilityHint="Filters the student-service directory as you type"
        />

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
            onPress={() => onStudentLifePress('registrar')}
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

          {!normalizedSearch && (
            <>
              <Text style={styles.sectionTitle}>Popular right now</Text>
              {popularResources.map((resource) => (
                <TouchableOpacity
                  key={`popular-${resource.id}`}
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
            </>
          )}

          <Text style={styles.sectionTitle}>{normalizedSearch ? 'Matching services' : 'Browse all student services'}</Text>
          {matchingResources.map((resource) => (
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
          {matchingResources.length === 0 && (
            <View style={styles.emptyState} accessibilityRole="text">
              <Text style={styles.emptyTitle}>No matching services yet</Text>
              <Text style={styles.emptyText}>Try a broader term, or use Ask for help with a specific situation.</Text>
            </View>
          )}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pendingLayout: { opacity: 0 },
  content: { padding: spacing.xl, gap: spacing.xl },
  title: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 21, marginTop: -spacing.md },
  searchInput: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.textPrimary, fontSize: fontSize.base, minHeight: 48, paddingHorizontal: spacing.md },
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
  emptyState: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.xs, padding: spacing.lg },
  emptyTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20 },
});
