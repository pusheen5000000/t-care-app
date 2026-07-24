import React, { useEffect, useRef, useState } from 'react';
import { Alert, View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AskScreen } from './screens/AskScreen';
import { ResultScreen } from './screens/ResultScreen';
import { TAIScreen } from './screens/TAIScreen';
import { ContactScreen } from './screens/ContactScreen';
import { ResourcesScreen } from './screens/ResourcesScreen';
import { TabBar, TabKey } from './components/TabBar';
import { EmergencySupportSheet } from './components/EmergencySupportSheet';
import { colors, fontSize } from './theme';
import type { LocationResult, QueryResult, RecoveryKind, SupportResources, TravelMode } from './types';

const TCARD_QUERY = 'I lost my TCard, what do I do?';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const CAMPUS_PREFERENCE_KEY = '@tcare/campus-preference';
const REQUEST_TIMEOUT_MS = 15_000;
const RECOVERY_RESOURCES: SupportResources = {
  title: 'Official U of T support',
  intro: 'While T-Care reconnects, these official sites can help you find the next step.',
  campusLocations: [],
  links: [
    { group: 'U of T resources', title: 'U of T Student Life', description: 'Find student services, support, and campus resources.', url: 'https://studentlife.utoronto.ca/' },
    { group: 'U of T resources', title: 'University Registrar', description: 'Official information about registration, records, fees, and academic services.', url: 'https://www.registrar.utoronto.ca/' },
  ],
};
const ACCESSIBILITY_SUPPORT_RESOURCES: SupportResources = {
  title: 'Accessibility support',
  intro: 'Find academic accommodations, assistive technology, and support that works for you. The map above routes to St. George Accessibility Services.',
  campusHeading: 'U of T accessibility offices',
  primaryDestination: 'St. George Accessibility Services',
  campusLocations: [
    { name: 'St. George Accessibility Services', location: '455 Spadina Avenue, 4th Floor, Suite 400, Toronto, ON M5S 2G8', detail: 'Academic accommodations, adaptive technology, and exam support.' },
    { name: 'UTSC AccessAbility Services', location: 'Sam Ibrahim Building, IA5105, 1050 Military Trail, Scarborough, ON M1C 1A4', detail: 'Disability-related accommodations and accessible learning support.' },
    { name: 'UTM AccessABILITY Resource Centre', location: 'Davis Building, DV2240, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Academic accommodations and accessibility resources for UTM students.' },
  ],
  links: [
    { group: 'Government support', title: 'Accessibility in Ontario', description: 'Ontario accessibility information, rights, and community-support directory.', url: 'https://www.ontario.ca/page/accessibility-ontario-what-you-need-to-know' },
    { group: 'Government support', title: 'Canada grants for disability services and equipment', description: 'Federal funding information for eligible students who need education-related services or equipment.', url: 'https://www.canada.ca/en/services/benefits/education/student-aid/grants-loans/disabilities-service-equipment.html' },
    { group: 'U of T resources', title: 'U of T Accessibility Services', description: 'Register for accommodations and connect with St. George Accessibility Services.', url: 'https://studentlife.utoronto.ca/department/accessibility-services/' },
    { group: 'U of T resources', title: 'Accessibility advisor support', description: 'Learn how to meet with an accessibility advisor and manage your accommodations.', url: 'https://studentlife.utoronto.ca/service/accessibility-advisor-support/' },
  ],
};

const STUDENT_LIFE_RESOURCES: Record<string, QueryResult> = {
  'financial-aid': {
    type: 'info', query: 'Financial aid and awards', title: 'Financial aid & awards',
    summary: 'Explore scholarships, awards, grants, OSAP, UTAPS, and other funding options for your studies.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'Financial Aid & Awards', description: 'U of T Registrar information for awards, scholarships, grants, UTAPS, and student aid.', url: 'https://www.registrar.utoronto.ca/financial-aid-awards/' },
      { group: 'U of T resources', title: 'Award Explorer', description: 'Search U of T awards and scholarships available to students.', url: 'https://awardexplorer.utoronto.ca/' },
      { group: 'U of T resources', title: 'Tuition fees & schedules', description: 'Check tuition fee categories, billing information, and fee schedules for your program.', url: 'https://www.registrar.utoronto.ca/fees-payments/tuition-fee-schedules/' },
      { group: 'U of T resources', title: 'Payment deadlines', description: 'See registration, minimum-payment, and remaining-balance deadlines for your session.', url: 'https://www.registrar.utoronto.ca/fees-payments/payment-deadlines/' },
    ] },
  },
  housing: {
    type: 'info', query: 'Housing and residence', title: 'Housing & residence',
    summary: 'Start with the residence portal for on-campus residence, family housing, off-campus listings, and housing help.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'U of T Residence Portal', description: 'Apply for residence or family housing, and access off-campus housing resources.', url: 'https://studentlife.utoronto.ca/service/u-of-t-residence-portal/' },
      { group: 'U of T resources', title: 'U of T housing options', description: 'Compare residence options and learn about on- and off-campus housing.', url: 'https://future.utoronto.ca/housing' },
    ] },
  },
  international: {
    type: 'info', query: 'International student support', title: 'International student support',
    summary: 'Find immigration, permit, transition, and community support for international students.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'Immigration & permit support', description: 'Connect with the Centre for International Experience for immigration resources and advising.', url: 'https://start.studentlife.utoronto.ca/topic-category/learn-about-immigration-and-permits' },
      { group: 'U of T resources', title: 'UTSC International Student Centre', description: 'Support for immigration, UHIP, transition, and global-learning questions at UTSC.', url: 'https://www.utsc.utoronto.ca/utscinternational/' },
      { group: 'U of T resources', title: 'International student services', description: 'Find international-student programs, events, and ways to connect with the Centre for International Experience.', url: 'https://start.studentlife.utoronto.ca/topic-category/connect-with-international-students-and-services' },
    ] },
  },
  registrar: {
    type: 'info', query: 'Registrar and enrolment', title: 'Registrar & enrolment',
    summary: 'Manage your course enrolment, academic record, fees, deadlines, and other registrarial tasks.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'University Registrar', description: 'Official source for registration, records, examinations, fees, and academic information.', url: 'https://www.registrar.utoronto.ca/' },
      { group: 'U of T resources', title: 'ACORN', description: 'Sign in to manage course enrolment, your timetable, fees, and personal information.', url: 'https://acorn.utoronto.ca/' },
      { group: 'U of T resources', title: 'Tuition fees & schedules', description: 'Review program- and course-based tuition, fee categories, and billing details.', url: 'https://www.registrar.utoronto.ca/fees-payments/tuition-fee-schedules/' },
      { group: 'U of T resources', title: 'Payment deadlines', description: 'Find minimum-payment, deferment, and session payment deadlines to protect your registration.', url: 'https://www.registrar.utoronto.ca/fees-payments/payment-deadlines/' },
      { group: 'U of T resources', title: 'Understanding your fees', description: 'Learn how to read your ACORN invoice, pay or defer fees, and manage your registration status.', url: 'https://www.registrar.utoronto.ca/fees-payments/understanding-your-fees/' },
    ] },
  },
  safety: {
    type: 'info', query: 'Campus safety', title: 'Campus safety',
    summary: 'For immediate danger call 911, then Campus Safety. Find non-emergency, personal-safety, and escort options here.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'U of T Safety & Support', description: 'Tri-campus emergency contacts, safety resources, and the Campus Safety app.', url: 'https://safety.utoronto.ca/' },
      { group: 'U of T resources', title: 'Personal safety & TravelSafer', description: 'Find safety planning, Community Safety Office, and campus escort contacts.', url: 'https://safety.utoronto.ca/personal-safety/' },
    ] },
  },
  career: {
    type: 'info', query: 'Career support', title: 'Career support',
    summary: 'Explore careers, job search strategies, further education, advising, workshops, and U of T job boards.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'Career Exploration & Education', description: 'Career programs, advising, workshops, job-search support, and resources.', url: 'https://studentlife.utoronto.ca/department/career-exploration-education/' },
      { group: 'U of T resources', title: 'Career advising appointments', description: 'Book one-on-one advising for career exploration, applications, interviews, or further education.', url: 'https://studentlife.utoronto.ca/service/career-advising-appointments/' },
      { group: 'U of T resources', title: 'Work Study Program', description: 'Find paid, part-time on-campus roles and learn about eligibility and applying.', url: 'https://studentlife.utoronto.ca/work-study-program/' },
    ] },
  },
  'libraries-it': {
    type: 'info', query: 'Libraries and IT', title: 'Libraries & IT',
    summary: 'Use U of T Libraries for research and study spaces, or connect with IT support for UTORid, Wi-Fi, software, and technology.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'University of Toronto Libraries', description: 'Search collections, find study spaces and hours, and access research help.', url: 'https://library.utoronto.ca/' },
      { group: 'U of T resources', title: 'Information Technology Services', description: 'Find student help-desk contacts and IT support across all three campuses.', url: 'https://www.its.utoronto.ca/contact/' },
      { group: 'U of T resources', title: 'Libraries & hours', description: 'Find an open U of T library, current hours, and available study spaces.', url: 'https://library.utoronto.ca/libraries' },
    ] },
  },
  'learning-strategies': {
    type: 'info', query: 'Study skills and learning support', title: 'Study skills & learning support',
    summary: 'Build practical strategies for studying, writing, time management, exam preparation, and navigating academic challenges.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'Learning strategist appointments', description: 'Book one-on-one support for study habits, exam preparation, academic stress, and assignment planning.', url: 'https://studentlife.utoronto.ca/service/learning-strategist-appointments/' },
      { group: 'U of T resources', title: 'Centre for Learning Strategy Support', description: 'Explore academic-skills workshops, peer mentoring, and learning resources.', url: 'https://studentlife.utoronto.ca/department/centre-for-learning-strategy-support/' },
      { group: 'U of T resources', title: 'Writing support', description: 'Find writing centres, programs, and resources for writing effectively at U of T.', url: 'https://studentlife.utoronto.ca/task/write-effectively/' },
    ] },
  },
  'indigenous-support': {
    type: 'info', query: 'Indigenous student support', title: 'Indigenous student support',
    summary: 'Find culturally relevant academic, wellness, financial, career, and community support for Indigenous students.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'First Nations House', description: 'Connect with Indigenous Student Services for academic support, financial planning, wellness, and cultural programs.', url: 'https://studentlife.utoronto.ca/department/first-nations-house/' },
      { group: 'U of T resources', title: 'Indigenous learning strategist support', description: 'Meet one-to-one with an Indigenous learning strategist to build study plans and learning strategies.', url: 'https://studentlife.utoronto.ca/service/indigenous-learning-strategist-support/' },
      { group: 'U of T resources', title: 'Indigenous Gateway', description: 'Explore current-student services, programs, and Indigenous community resources across all three campuses.', url: 'https://indigenous.utoronto.ca/students/current-students/' },
    ] },
  },
  food: {
    type: 'info', query: 'Food and basic needs', title: 'Food & basic needs',
    summary: 'Connect with food-bank support and basic-needs resources. Services and eligibility may vary by campus.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'UTSU Food Bank', description: 'Free, year-round food-bank support for U of T students, including students with families.', url: 'https://www.utsu.ca/food-bank/' },
      { group: 'U of T resources', title: 'UTSU food programming', description: 'Explore food-bank support and other student food programs.', url: 'https://www.utsu.ca/food-programming/' },
    ] },
  },
  'tenant-rights': {
    type: 'info', query: 'Tenant rights and legal help', title: 'Tenant rights & legal help',
    summary: 'Get guidance for off-campus housing concerns, including tenant rights, landlord issues, and referrals for legal support.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'Tenant rights', description: 'Learn about tenant rights, off-campus housing support, and where to get legal advice.', url: 'https://studentlife.utoronto.ca/task/tenant-rights/' },
      { group: 'U of T resources', title: 'Tenancy issues', description: 'Find support for concerns with landlords, negotiating, and housing-related dispute resolution.', url: 'https://studentlife.utoronto.ca/task/tenancy-issues/' },
    ] },
  },
  'sexual-violence': {
    type: 'info', query: 'Sexual violence support', title: 'Sexual violence support',
    summary: 'Confidential, non-judgmental support is available for U of T community members affected by sexual violence or harassment.',
    supportResources: { campusLocations: [], links: [
      { group: 'U of T resources', title: 'Sexual Violence Prevention & Support Centre', description: 'Confidential support, options, referrals, accommodations, and prevention resources.', url: 'https://svpscentre.utoronto.ca/' },
      { group: 'U of T resources', title: 'Sexual violence & sexual harassment support', description: 'Find tri-campus support options and immediate-help information.', url: 'https://safety.utoronto.ca/sexual-violence-sexual-harassment/' },
    ] },
  },
};

const STUDENT_LIFE_RESOURCE_QUERIES: Record<string, string> = {
  'financial-aid': 'Where is financial aid and awards?',
  housing: 'Where is the housing office?',
  international: 'Where is the international student office?',
  registrar: 'Where is the registrar office?',
  safety: 'Where is Campus Safety?',
  career: 'Where is the career support adviser?',
  'libraries-it': 'Where is student IT support?',
  'learning-strategies': 'Where can I get help with studying and academic skills?',
  'indigenous-support': 'Where can Indigenous students get support?',
  food: 'Where is food and basic needs support?',
  'tenant-rights': 'Where can I get help with tenant rights and legal housing concerns?',
  'sexual-violence': 'Where is sexual violence support?',
};
const TCARD_OFFICE_FALLBACK: QueryResult = {
  type: 'location',
  query: TCARD_QUERY,
  title: 'TCard replacement',
  summary:
    'Report your card lost in eAccounts, then visit the TCard Office for a replacement.',
  placeName: 'TCard Office',
  placeSubtitle: '800 Bay Street, 5th Floor, Toronto, ON M5S 3A9',
  walkMinutes: 0,
  fee: '$20',
  hours: 'Monday to Friday, 9:00 AM to 4:15 PM',
  polyline: null,
  destination: { latitude: 43.6644, longitude: -79.3873 },
};

const ACCESSIBILITY_SERVICES_FALLBACK: QueryResult = {
  type: 'location',
  query: 'Where can I access accessibility services?',
  title: 'Accessibility Services',
  summary: 'Visit Accessibility Services for academic accommodations, assistive technology, and exam accommodations.',
  placeName: 'U of T Accessibility Services',
  placeSubtitle: '455 Spadina Avenue, 4th Floor, Suite 400, Toronto, ON M5S 2G8',
  walkMinutes: 0,
  fee: 'Free',
  hours: 'Contact office',
  polyline: null,
  destination: { latitude: 43.6643, longitude: -79.4018 },
  supportResources: ACCESSIBILITY_SUPPORT_RESOURCES,
  serviceId: 'accessibility-services',
};

const ACCESSIBILITY_FALLBACK_DESTINATIONS = [
  { name: 'St. George Accessibility Services', latitude: 43.6643, longitude: -79.4018 },
  { name: 'UTSC AccessAbility Services', latitude: 43.7846, longitude: -79.187 },
  { name: 'UTM AccessABILITY Resource Centre', latitude: 43.5483, longitude: -79.662 },
];

function accessibilityFallbackFor(query?: string): QueryResult {
  const campusPattern = /\b(?:utsg|st\.?\s*george|utsc|scarborough|utm|mississauga)\b/i;
  const campusMatch = query?.match(campusPattern)?.[0]?.toLowerCase();
  const selectedName = campusMatch && /utsc|scarborough/.test(campusMatch)
    ? 'UTSC AccessAbility Services'
    : campusMatch && /utm|mississauga/.test(campusMatch)
      ? 'UTM AccessABILITY Resource Centre'
      : campusMatch
        ? 'St. George Accessibility Services'
        : undefined;
  const selectedLocation = selectedName
    ? ACCESSIBILITY_SUPPORT_RESOURCES.campusLocations.find((location) => location.name === selectedName)
    : undefined;
  const selectedDestination = selectedName
    ? ACCESSIBILITY_FALLBACK_DESTINATIONS.find((destination) => destination.name === selectedName)
    : undefined;

  if (!selectedLocation || !selectedDestination) return ACCESSIBILITY_SERVICES_FALLBACK;

  return {
    ...(ACCESSIBILITY_SERVICES_FALLBACK as LocationResult),
    title: selectedLocation.name,
    placeName: selectedLocation.name,
    placeSubtitle: selectedLocation.location,
    destination: { latitude: selectedDestination.latitude, longitude: selectedDestination.longitude },
    supportResources: {
      ...ACCESSIBILITY_SUPPORT_RESOURCES,
      intro: `Showing the in-person support at ${selectedLocation.name}.`,
      campusLocations: [selectedLocation],
    },
  };
}

const HEALTH_WELLNESS_FALLBACK: QueryResult = {
  type: 'location',
  query: 'I need someone to talk to',
  title: 'U of T Health & Wellness',
  summary: 'Mental Health Services are on the 12th floor and Medical Services are on the 14th floor.',
  placeName: 'U of T Health & Wellness',
  placeSubtitle: '700 Bay Street, 12th and 14th Floors, Toronto, ON M5G 1Z6',
  walkMinutes: 0,
  fee: 'Free',
  hours: 'Monday to Friday, 8:45 AM to 5:00 PM',
  polyline: null,
  destination: { latitude: 43.6586, longitude: -79.3835 },
  supportResources: {
    campusLocations: [
      { name: 'St. George Health & Wellness Centre', location: '700 Bay Street, Toronto, ON M5G 1Z6', detail: 'Confidential mental health and physical health support.' },
      { name: 'UTSC Health & Wellness Centre', location: 'Sam Ibrahim Building, IA5061, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Counselling, health care, and health-promotion support.' },
      { name: 'UTM Health & Counselling Centre', location: 'Davis Building, DV1152, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Personal and group counselling, psychiatric care, and health support.' },
    ],
    links: [
      { group: 'Government support', title: 'Ontario mental health support', description: 'Ontario’s directory for confidential mental health and crisis supports.', url: 'https://www.ontario.ca/page/find-mental-health-support' },
      { group: 'Government support', title: 'Canada mental health support', description: 'Federal guidance and Canada-wide mental health supports.', url: 'https://www.canada.ca/en/public-health/campaigns/get-help-here.html' },
      { group: 'U of T resources', title: 'Student Mental Health Resource', description: 'Tri-campus U of T supports and tools for students.', url: 'https://mentalhealth.utoronto.ca/' },
      { group: 'U of T resources', title: 'U of T mental health supports', description: 'Ways to access counselling, same-day care, and other Health & Wellness supports.', url: 'https://studentlife.utoronto.ca/service/mental-health-supports/' },
    ],
  },
  serviceId: 'health-wellness',
};

type DeviceLocation = { lat: number; lng: number };

class RequestError extends Error {
  constructor(
    public readonly kind: 'configuration' | 'connection' | 'rate-limit' | 'service' | 'invalid-response',
    message: string,
  ) {
    super(message);
    this.name = 'RequestError';
  }
}

async function postJson<T>(url: string, body: object): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 429) {
      throw new RequestError('rate-limit', 'Too many requests');
    }
    if (!response.ok) {
      throw new RequestError(response.status === 408 ? 'connection' : 'service', `Request failed (${response.status})`);
    }

    try {
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== 'object') {
        throw new RequestError('invalid-response', 'The service returned an empty response');
      }
      return payload as T;
    } catch (error) {
      if (error instanceof RequestError) throw error;
      throw new RequestError('invalid-response', 'The service returned an unreadable response');
    }
  } catch (error) {
    if (error instanceof RequestError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new RequestError('connection', 'Request timed out');
    }
    throw new RequestError('connection', 'Network request failed');
  } finally {
    clearTimeout(timeout);
  }
}

async function getCurrentLocation(): Promise<DeviceLocation | undefined> {
  const shouldUseLocation = await new Promise<boolean>((resolve) => {
    Alert.alert(
      'Use your location for directions?',
      'T-Care uses your location only to estimate walking time and show directions. You can still view office details without it.',
      [
        { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continue', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
  if (!shouldUseLocation) return undefined;
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') return undefined;

  try {
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { lat: position.coords.latitude, lng: position.coords.longitude };
  } catch {
    throw new Error('LOCATION_UNAVAILABLE');
  }
}

function recoveryKindFor(error: unknown): RecoveryKind {
  if (error instanceof RequestError && error.kind === 'connection') return 'connection';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('location') || message.includes('permission')) return 'location';
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) return 'connection';
  return 'service';
}

function createRecoveryResult(query: string, error: unknown): QueryResult {
  const recoveryKind = recoveryKindFor(error);
  const requestKind = error instanceof RequestError ? error.kind : undefined;
  const message = requestKind === 'configuration'
    ? 'T-Care is not configured to answer questions right now. Please use the official U of T links below.'
    : requestKind === 'rate-limit'
      ? 'T-Care is receiving a lot of requests. Please wait a moment, then try your question again.'
      : requestKind === 'invalid-response'
        ? 'T-Care received an incomplete answer. Please try your question again.'
        : recoveryKind === 'connection'
    ? 'We saved your question, but T-Care could not connect. Check your internet connection, then try again.'
    : recoveryKind === 'location'
      ? 'We saved your question, but T-Care could not get your location. Check location access in your phone settings, then try again.'
      : 'We saved your question, but T-Care is temporarily unavailable. Please try again in a moment.';

  return {
    type: 'recovery',
    query,
    title: requestKind === 'rate-limit'
      ? 'Please try again shortly'
      : requestKind === 'configuration'
        ? 'T-Care is unavailable'
        : requestKind === 'invalid-response'
          ? 'Incomplete response'
          : recoveryKind === 'connection'
      ? 'Connection issue'
      : recoveryKind === 'location'
        ? 'Location issue'
        : 'Service issue',
    summary: message,
    recoveryKind,
    supportResources: RECOVERY_RESOURCES,
  };
}

async function resolveQuery(
  query: string,
  location?: DeviceLocation,
  campus?: 'utsg' | 'utsc' | 'utm',
): Promise<QueryResult> {
  if (!API_BASE_URL) throw new RequestError('configuration', 'Missing EXPO_PUBLIC_API_URL');

  const result = await postJson<unknown>(`${API_BASE_URL}/api/query`, { query, location, campus });
  if (!result || typeof result !== 'object' || !('type' in result) || !['info', 'location', 'recovery'].includes(String(result.type))) {
    throw new RequestError('invalid-response', 'The service returned an incomplete answer');
  }
  return result as QueryResult;

  /*
  await new Promise((r) => setTimeout(r, 700));
  return {
    type: 'info',
    query,
    title: "Here's what I found",
    summary: 'Frontend-only stub response — no backend connected right now.',
  };
  */
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('ask');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [resultSource, setResultSource] = useState<TabKey>('ask');
  const [showResourceMap, setShowResourceMap] = useState(false);
  // A route is only meaningful after the student has explicitly shared their
  // location. A campus choice still lets us place the service marker.
  const [showLocationPaths, setShowLocationPaths] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [campus, setCampus] = useState<{ id: 'utsg' | 'utsc' | 'utm'; label: string } | null>(null);
  const [campusPreferenceLoaded, setCampusPreferenceLoaded] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    void AsyncStorage.getItem(CAMPUS_PREFERENCE_KEY)
      .then((savedCampus) => {
        if (!savedCampus) return;
        const parsed = JSON.parse(savedCampus) as { id?: string; label?: string };
        if ((parsed.id === 'utsg' || parsed.id === 'utsc' || parsed.id === 'utm') && parsed.label) {
          setCampus(parsed as { id: 'utsg' | 'utsc' | 'utm'; label: string });
        }
      })
      .catch(() => undefined)
      .finally(() => setCampusPreferenceLoaded(true));
  }, []);

  const handleCampusChange = (nextCampus: { id: 'utsg' | 'utsc' | 'utm'; label: string } | null) => {
    setCampus(nextCampus);
    if (!campusPreferenceLoaded) return;
    void (nextCampus
      ? AsyncStorage.setItem(CAMPUS_PREFERENCE_KEY, JSON.stringify(nextCampus))
      : AsyncStorage.removeItem(CAMPUS_PREFERENCE_KEY)
    ).catch(() => undefined);
  };

  const handleSubmit = async (query: string) => {
    if (/\b(mental health|counselling|counseling|anxious|anxiety|overwhelmed|stressed|talk to someone)\b/i.test(query)) {
      return handleTalkSupport();
    }
    if (/\b(accessibility|accommodation|disability|adaptive technology|assistive technology|note taker|exam accommodation)\b/i.test(query)) {
      return handleAccessibilityServices('ask', query);
    }

    const currentRequestId = ++requestId.current;
    setResultSource('ask');
    setShowLocationPaths(false);
    setLoading(true);
    try {
      // Answer general questions before asking for sensitive device location.
      // Location is only needed after the student chooses directions.
      const r = await resolveQuery(query, undefined, campus?.id);
      if (currentRequestId === requestId.current) setResult(r);
    } catch (err) {
      console.error(err);
      if (currentRequestId === requestId.current) {
        setResult(createRecoveryResult(query, err));
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  };

  const handleAskAnother = () => {
    setResult(null);
    setTab(resultSource);
  };

  const handleRetry = () => {
    if (result?.type === 'recovery') void handleSubmit(result.query);
  };

  const loadMapDestination = async (
    endpoint: string,
    fallback: QueryResult,
    source: TabKey = 'ask',
    query?: string,
    serviceId?: string,
    requestRoute = false,
  ) => {
    const currentRequestId = ++requestId.current;
    setResultSource(source);
    setShowResourceMap(source !== 'resources' || Boolean(campus) || requestRoute);
    setShowLocationPaths(false);
    setLoading(true);
    try {
      // Show the service first. Device location is requested only after the
      // student explicitly asks to see a walking route or ETA.
      const location = undefined;
      setShowLocationPaths(false);
      const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

      if (!apiUrl) throw new Error('Missing EXPO_PUBLIC_API_URL');

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, query, serviceId, campus: campus?.id }),
      });

      if (!response.ok) throw new Error(`Map request failed (${response.status})`);
      if (currentRequestId === requestId.current) {
        setResult((await response.json()) as QueryResult);
      }
    } catch (error) {
      console.warn('Could not load map destination:', error);
      if (currentRequestId === requestId.current) setResult(fallback);
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  };

  const handleLostTCard = () => loadMapDestination('/api/tcard-office', TCARD_OFFICE_FALLBACK);

  const handleAccessibilityServices = (source: TabKey = 'ask', query?: string) =>
    loadMapDestination('/api/accessibility-services', accessibilityFallbackFor(query), source, query);

  const handleTalkSupport = (source: TabKey = 'ask') =>
    loadMapDestination('/api/health-wellness', HEALTH_WELLNESS_FALLBACK, source);

  const handleCollegeSelect = (
    collegeId: string,
    serviceId: 'academic-success' | 'financial-aid' | 'registrar-enrolment' = 'registrar-enrolment',
    source: TabKey = 'ask',
    requestRoute = false,
  ) =>
    loadMapDestination(`/api/college-service/${collegeId}`, {
      type: 'info',
      query: serviceId === 'financial-aid'
        ? 'Financial aid and awards'
        : serviceId === 'academic-success'
          ? 'Academic advising'
          : 'Registrar and enrolment',
      title: serviceId === 'financial-aid'
        ? 'Financial aid office unavailable'
        : serviceId === 'academic-success'
          ? 'Academic advising office unavailable'
          : 'College registrar unavailable',
      summary: serviceId === 'financial-aid'
        ? 'We could not load your college financial-aid office. Please try again shortly.'
        : serviceId === 'academic-success'
          ? 'We could not load your college academic advising office. Please try again shortly.'
          : 'We could not load your college registrar’s office. Please try again shortly.',
    }, source, undefined, serviceId, requestRoute);

  const handleStudentLifeResource = async (resourceId: string) => {
    const resource = STUDENT_LIFE_RESOURCES[resourceId];
    const query = STUDENT_LIFE_RESOURCE_QUERIES[resourceId];
    if (!resource || !query) return;
    const currentRequestId = ++requestId.current;
    setResultSource('resources');
    setShowResourceMap(Boolean(campus));
    setShowLocationPaths(false);
    setLoading(true);
    try {
      // Resolve the service and destination first. Location remains opt-in
      // through the explicit walking-route action on the result.
      setShowLocationPaths(false);
      const response = await resolveQuery(query, undefined, campus?.id);
      if (currentRequestId === requestId.current) setResult(response);
    } catch (error) {
      console.warn('Could not load campus resource locations:', error);
      if (currentRequestId === requestId.current) setResult(resource);
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  };

  const handleCampusLocationPress = async (serviceId: string, campusLocationName: string) => {
    const currentRequestId = ++requestId.current;
    setShowLocationPaths(false);
    setLoading(true);
    try {
      setShowLocationPaths(false);
      if (!API_BASE_URL) throw new Error('Missing EXPO_PUBLIC_API_URL');

      const response = await fetch(`${API_BASE_URL}/api/campus-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, campusLocationName, location: undefined }),
      });
      if (!response.ok) throw new Error(`Campus map request failed (${response.status})`);
      if (currentRequestId === requestId.current) {
        setShowResourceMap(true);
        setResult((await response.json()) as QueryResult);
      }
    } catch (error) {
      console.warn('Could not load selected campus map:', error);
      Alert.alert(
        'Could not update directions',
        'Your current result is still available. Please try again.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Try again', onPress: () => void handleCampusLocationPress(serviceId, campusLocationName) },
        ],
      );
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  };

  const updateTravelRoute = async (mode: TravelMode): Promise<boolean> => {
    if (result?.type !== 'location' || !result.origin || !result.destination) return false;

    const currentRequestId = ++requestId.current;

    const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
    if (!apiUrl) return false;

    try {
      const response = await fetch(`${apiUrl}/api/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          origin: { lat: result.origin.latitude, lng: result.origin.longitude },
          destination: { lat: result.destination.latitude, lng: result.destination.longitude },
        }),
      });
      if (!response.ok) throw new Error(`Route request failed (${response.status})`);

      const route = await response.json() as Pick<LocationResult, 'travelMinutes' | 'polyline'>;
      if (currentRequestId === requestId.current) {
        setResult((current) => current?.type === 'location'
          ? { ...current, travelMinutes: route.travelMinutes, polyline: route.polyline }
          : current);
      }
      return true;
    } catch (error) {
      console.warn('Could not update route:', error);
      return false;
    }
  };

  const handleShowWalkingRoute = async (): Promise<boolean> => {
    if (result?.type !== 'location' || !result.destination) return false;

    try {
      const location = await getCurrentLocation();
      if (!location) return false;
      const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
      if (!apiUrl) throw new Error('Missing EXPO_PUBLIC_API_URL');

      const response = await fetch(`${apiUrl}/api/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'walk',
          origin: location,
          destination: { lat: result.destination.latitude, lng: result.destination.longitude },
        }),
      });
      if (!response.ok) throw new Error(`Route request failed (${response.status})`);
      const route = await response.json() as Pick<LocationResult, 'travelMinutes' | 'polyline'>;
      setResult((current) => current?.type === 'location'
        ? { ...current, origin: { latitude: location.lat, longitude: location.lng }, travelMinutes: route.travelMinutes, polyline: route.polyline }
        : current);
      setShowLocationPaths(true);
      return true;
    } catch (error) {
      console.warn('Could not load walking route:', error);
      return false;
    }
  };

  const renderNonTaiBody = () => {
    if (tab === 'contact') {
      return <ContactScreen />;
    }

    if (loading) {
      return (
        <View style={styles.loadingScreen}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Finding the right resource...</Text>
        </View>
      );
    }

    if (result && resultSource === tab) {
      return (
        <ResultScreen
          result={result}
          showMap={resultSource !== 'resources' || showResourceMap}
          showLocationPaths={showLocationPaths}
          onAskAnother={handleAskAnother}
          onRetry={handleRetry}
          onTravelModeChange={updateTravelRoute}
          onShowWalkingRoute={handleShowWalkingRoute}
          onCampusLocationPress={handleCampusLocationPress}
          onCollegeSelect={(collegeId, serviceId) => handleCollegeSelect(collegeId, serviceId, resultSource, true)}
        />
      );
    }

    if (tab === 'resources') {
      return (
        <ResourcesScreen
          onMentalHealthPress={() => handleTalkSupport('resources')}
          onAccessibilityPress={() => handleAccessibilityServices('resources')}
          onStudentLifePress={handleStudentLifeResource}
        />
      );
    }

    if (tab !== 'ask') {
      return (
        <View style={styles.placeholderScreen}>
          <Text style={styles.placeholderText}>
            {/* This fallback only renders for the non-Ask tab. */}
            {/* @ts-expect-error The branch is intentionally unreachable for Resources. */}
            {tab === 'resources' ? 'Resources' : 'Saved'} screen — coming soon
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.loadingScreen}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Finding the right resource...</Text>
        </View>
      );
    }

    if (result && resultSource === tab) {
      return (
        <ResultScreen
          result={result}
          showMap
          showLocationPaths={showLocationPaths}
          onAskAnother={handleAskAnother}
          onRetry={handleRetry}
          onTravelModeChange={updateTravelRoute}
          onShowWalkingRoute={handleShowWalkingRoute}
          onCampusLocationPress={handleCampusLocationPress}
          onCollegeSelect={(collegeId, serviceId) => handleCollegeSelect(collegeId, serviceId, resultSource, true)}
        />
      );
    }

    return (
      <AskScreen
        onSubmit={handleSubmit}
        onTCardPress={handleLostTCard}
        onTalkSupportPress={handleTalkSupport}
        onAccessibilityPress={handleAccessibilityServices}
        onEmergencySupportPress={() => setEmergencyVisible(true)}
        campus={campus}
        onCampusChange={handleCampusChange}
      />
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        <View style={tab === 'tai' ? styles.taiScreen : styles.hiddenTaiScreen}>
          <TAIScreen />
        </View>
        {tab !== 'tai' && renderNonTaiBody()}
      </View>
      <TouchableOpacity
        style={styles.urgentSupportButton}
        onPress={() => setEmergencyVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Get urgent support"
        accessibilityHint="Opens urgent support options without making a call"
      >
        <Text style={styles.urgentSupportText}>Need urgent support?</Text>
      </TouchableOpacity>
      <TabBar
        active={tab}
        onChange={(key) => {
          requestId.current += 1;
          setTab(key);
          setLoading(false);
        }}
      />
      <EmergencySupportSheet visible={emergencyVisible} onClose={() => setEmergencyVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  taiScreen: { flex: 1 },
  hiddenTaiScreen: { display: 'none' },
  urgentSupportButton: { alignItems: 'center', backgroundColor: colors.infoBg, borderTopColor: colors.danger, borderTopWidth: 1, justifyContent: 'center', minHeight: 44 },
  urgentSupportText: { color: colors.danger, fontSize: fontSize.base, fontWeight: '700' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: colors.textSecondary, fontSize: fontSize.base },
  placeholderScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: colors.textMuted, fontSize: fontSize.base },
});
