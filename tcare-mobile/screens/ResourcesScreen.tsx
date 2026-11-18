import { useWindowDimensions } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = {
  search: string;
  setSearch: (value: string) => void;
  onMentalHealthPress: () => void;
  onAccessibilityPress: () => void;
  onStudentLifePress: (resourceId: string) => void;
  /** Scroll offset (in px) to restore when the screen mounts. */
  initialScrollOffset?: number;
  /** Reports the latest scroll offset so it can be restored after navigating away. */
  onScrollOffsetChange?: (offset: number) => void;
};

const STUDENT_LIFE_RESOURCES = [
  { id: 'financial-aid', label: 'Financial Aid & Awards', description: 'Explore awards, UTAPS, OSAP, grants, and funding support.', icon: '$', tone: 'financialIcon' },
  { id: 'housing', label: 'Housing & Residence', description: 'Apply for residence or get help finding a place to live.', icon: 'H', tone: 'housingIcon' },
  { id: 'international', label: 'International Student Support', description: 'Get help with immigration, permits, UHIP, and settling in.', icon: 'INT', tone: 'internationalIcon' },
  { id: 'registrar', label: 'Registrar & Enrolment', description: 'Manage courses, records, fees, and university deadlines.', icon: 'REG', tone: 'registrarIcon' },
  { id: 'safety', label: 'Campus Safety', description: 'Find emergency contacts, safety planning, and escort services.', icon: 'SAFE', tone: 'safetyIcon' },
  { id: 'career', label: 'Career Support', description: 'Book advising, explore careers, and find job-search support.', icon: 'CAR', tone: 'careerIcon' },
  { id: 'libraries-it', label: 'Libraries & IT', description: 'Access study spaces, research tools, Wi-Fi, and tech help.', icon: 'LIB', tone: 'librariesIcon' },
  { id: 'learning-strategies', label: 'Study Skills & Learning Support', description: 'Build study, writing, time-management, and exam-preparation strategies.', icon: 'STDY', tone: 'learningIcon' },
  { id: 'indigenous-support', label: 'Indigenous Student Support', description: 'Connect with culturally relevant academic, wellness, financial, and community support.', icon: 'INDI', tone: 'indigenousIcon' },
  { id: 'food', label: 'Food & Basic Needs', description: 'Find food-bank support and other community resources.', icon: 'FOOD', tone: 'foodIcon' },
  { id: 'tenant-rights', label: 'Tenant Rights & Legal Help', description: 'Get guidance for off-campus housing concerns and tenant-rights questions.', icon: 'LAW', tone: 'legalIcon' },
  { id: 'sexual-violence', label: 'Sexual Violence Support', description: 'Access confidential, non-judgmental support and options.', icon: 'SV', tone: 'sexualViolenceIcon' },
] as const;

export function ResourcesScreen({
  onMentalHealthPress,
  onAccessibilityPress,
  onStudentLifePress,
  search, setSearch,
  initialScrollOffset = 0,
  onScrollOffsetChange,
}: Props) {
  const { fontScale } = useWindowDimensions();
  const singleLineInputHeight = Math.max(48, Math.ceil(20 * fontScale) + 16);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollOffset = useRef(initialScrollOffset);
  const normalizedSearch = search.trim().toLowerCase();
  const featured = ([
    { label: 'Mental Health Support', description: 'Connect with Health & Wellness for counselling and care.', hint: 'Opens Health and Wellness support information', tone: 'mentalHealthIcon', icon: 'MH', onPress: onMentalHealthPress },
    { label: 'Accessibility Services', description: 'Learn about accommodations, assistive technology, and exams.', hint: 'Opens accessibility service information', tone: 'accessibilityIcon', icon: 'AS', onPress: onAccessibilityPress },
    { label: 'Courses & Academic Support', description: 'Choose your college or campus to find its registrar.', hint: 'Choose your college or campus to find its registrar', tone: 'academicsIcon', icon: 'AC', onPress: () => onStudentLifePress('registrar') },
  ] as const).filter(resource => (resource.label + " " + resource.description).toLowerCase().includes(normalizedSearch));
  const matchingResources = STUDENT_LIFE_RESOURCES.filter((resource) =>
    !normalizedSearch
    || `${resource.label} ${resource.description}`.toLowerCase().includes(normalizedSearch),
  );
  const popularResources = STUDENT_LIFE_RESOURCES.filter((resource) =>
    ['financial-aid', 'housing', 'food'].includes(resource.id),
  );
  const browseResources = normalizedSearch
    ? matchingResources
    : STUDENT_LIFE_RESOURCES.filter((resource) => !popularResources.includes(resource));

  useEffect(() => {
    // On web, the viewport can settle one frame after this screen mounts. Keep
    // the screen hidden until then so it never flashes at a transient offset.
    // We also use these frames to restore the previous scroll position before
    // revealing the screen, so returning here lands exactly where the student
    // left off instead of snapping back to the top.
    let secondFrame: number | undefined;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (initialScrollOffset > 0) {
          scrollRef.current?.scrollTo({ y: initialScrollOffset, animated: false });
        }
        setIsLayoutReady(true);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
    };
    // Restore only on mount; the offset ref is seeded from initialScrollOffset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
    onScrollOffsetChange?.(scrollOffset.current);
  };

  return (
    <View
      style={[styles.container, !isLayoutReady && styles.pendingLayout]}
      pointerEvents={isLayoutReady ? 'auto' : 'none'}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>Resources</Text>
          <Text style={styles.subtitle}>Find trusted U of T support for your wellbeing, studies, and student life.</Text>
        </View>

        <TextInput
          style={[styles.searchInput, { height: singleLineInputHeight, paddingTop: 0, paddingBottom: 4 }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search resources"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search campus resources"
          accessibilityHint="Filters the student-service directory as you type"
        />

        <View style={styles.list}>
          {featured.length > 0 && <Text style={styles.sectionTitle}>{normalizedSearch ? 'Matching Services' : 'Wellbeing & Academics'}</Text>}
          {featured.map(resource => (
            <TouchableOpacity key={resource.label} style={styles.card} onPress={resource.onPress} accessibilityRole="button" accessibilityLabel={resource.label} accessibilityHint={resource.hint}>
              <View style={[styles.icon, styles[resource.tone]]}><Text style={styles.iconText}>{resource.icon}</Text></View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{resource.label}</Text>
                <Text style={styles.cardDescription}>{resource.description}</Text>
              </View>
              <View style={styles.chevronBadge}><Text style={styles.chevron}>›</Text></View>
            </TouchableOpacity>
          ))}

          {!normalizedSearch && (
            <>
              <Text style={styles.sectionTitle}>Popular Right Now</Text>
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
                    <Text style={[styles.iconText, resource.id === 'financial-aid' && styles.iconTextDark]}>{resource.icon}</Text>
                  </View>
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>{resource.label}</Text>
                    <Text style={styles.cardDescription}>{resource.description}</Text>
                  </View>
                  <View style={styles.chevronBadge}><Text style={styles.chevron}>›</Text></View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {(!normalizedSearch || featured.length === 0 && browseResources.length > 0) && <Text style={styles.sectionTitle}>{normalizedSearch ? 'Matching Services' : 'Browse More Student Services'}</Text>}
          {browseResources.map((resource) => (
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
                <Text style={[styles.iconText, resource.id === 'financial-aid' && styles.iconTextDark]}>{resource.icon}</Text>
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{resource.label}</Text>
                <Text style={styles.cardDescription}>{resource.description}</Text>
              </View>
              <View style={styles.chevronBadge}><Text style={styles.chevron}>›</Text></View>
            </TouchableOpacity>
          ))}
          {featured.length === 0 && browseResources.length === 0 && (
            <View style={styles.emptyState} accessibilityRole="text">
              <Text style={styles.emptyTitle}>No Matching Services Yet</Text>
              <Text style={styles.emptyText}>Try a broader term, or use Ask for help with a specific situation.</Text>
            </View>
          )}
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pendingLayout: { opacity: 0 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl + spacing.lg },
  intro: { gap: spacing.xs, marginBottom: spacing.xl },
  title: { color: colors.textPrimary, fontSize: fontSize.xl, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 21 },
  searchInput: { includeFontPadding: false, textAlignVertical: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, color: colors.textPrimary, fontSize: fontSize.base, marginBottom: spacing.xl, minHeight: 48, paddingHorizontal: spacing.md },
  list: { gap: spacing.md },
  card: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, minHeight: 72, padding: spacing.md },
  icon: { alignItems: 'center', borderRadius: radius.md, height: 42, justifyContent: 'center', width: 42 },
  mentalHealthIcon: { backgroundColor: colors.resourcePurple },
  accessibilityIcon: { backgroundColor: colors.resourceTeal },
  academicsIcon: { backgroundColor: colors.resourceBlue },
  financialIcon: { backgroundColor: colors.yellow },
  housingIcon: { backgroundColor: colors.resourcePurple },
  internationalIcon: { backgroundColor: colors.resourceBlue },
  registrarIcon: { backgroundColor: colors.resourceBlue },
  safetyIcon: { backgroundColor: colors.red },
  careerIcon: { backgroundColor: colors.resourceOrange },
  librariesIcon: { backgroundColor: colors.resourceIndigo },
  learningIcon: { backgroundColor: colors.resourceBlue },
  indigenousIcon: { backgroundColor: colors.resourceBerry },
  foodIcon: { backgroundColor: colors.resourceGreen },
  legalIcon: { backgroundColor: colors.resourcePurple },
  sexualViolenceIcon: { backgroundColor: colors.resourceBerry },
  iconText: { includeFontPadding: false, textAlignVertical: 'center', color: colors.white, fontSize: fontSize.sm, fontWeight: '700' },
  iconTextDark: { color: colors.accentOn },
  sectionTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.xs },
  cardCopy: { flex: 1, gap: spacing.xs },
  cardTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  cardDescription: { color: colors.textSecondary, fontSize: fontSize.sm, lineHeight: 18 },
  chevronBadge: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: radius.full, height: 28, justifyContent: 'center', width: 28 },
  chevron: { includeFontPadding: false, textAlignVertical: 'center', color: colors.yellow, fontSize: 25, fontWeight: '500', lineHeight: 27 },
  emptyState: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.xs, padding: spacing.lg },
  emptyTitle: { color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '700' },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.base, lineHeight: 20 },
});
