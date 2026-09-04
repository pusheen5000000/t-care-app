// utils/disambiguation.ts
//
// Lightweight, client-side "did you mean" disambiguation for casual resource
// questions. When a student types something short and everyday like
// "i'm hungry", the exact next step is ambiguous: do they want the food bank,
// or somewhere to grab a bite? Instead of guessing (or firing a vague query at
// the AI), the app offers a small set of specific choices, the way an assistant
// would ask a quick follow-up.
//
// Each option maps to an action the app already knows how to perform:
//   - kind 'resource'      -> handleStudentLifeResource(resourceId) in App.tsx
//                             (resourceId must be a key of STUDENT_LIFE_RESOURCES)
//   - kind 'mental-health' -> handleTalkSupport()
//   - kind 'accessibility' -> handleAccessibilityServices()
//
// These are intentionally casual, high-frequency needs. Anything not covered
// here falls through to the normal Ask flow untouched.

export type DisambiguationAction =
  | { kind: 'resource'; resourceId: string }
  | { kind: 'mental-health' }
  | { kind: 'accessibility' };

export type DisambiguationOption = {
  label: string;
  description: string;
  // Screens that route through in-app handlers (the Ask flow) use `action`.
  action: DisambiguationAction;
  // Chat-style screens (T-AI) that talk to /api/query directly use `query`,
  // a concrete, unambiguous rephrasing of the student's original message.
  query: string;
};

export type DisambiguationPrompt = {
  // The phrase the app recognised, echoed back so the follow-up feels grounded
  // (e.g. "hungry"). Used only for display.
  trigger: string;
  // A short, friendly lead-in shown above the option buttons.
  question: string;
  options: DisambiguationOption[];
};

type DisambiguationRule = {
  // Regex that decides whether this everyday need is being expressed.
  match: RegExp;
  // Label used to echo the recognised need back to the student.
  trigger: string;
  question: string;
  options: DisambiguationOption[];
};

// Rules are checked in order; the first match wins. Keep the most specific
// phrasings above broader ones so, for example, "food bank" never gets caught
// by a generic "food" rule.
const RULES: DisambiguationRule[] = [
  {
    match: /\b(hungry|starving|need (?:some )?food|wanna eat|want (?:to|some) (?:eat|food)|grab (?:a bite|food|lunch|dinner)|somewhere to eat|where (?:can|do) i eat|food)\b/i,
    trigger: 'food',
    question: 'Did you mean:',
    options: [
      {
        label: 'Food bank & basic needs',
        description: 'Free food-bank support if money is tight.',
        action: { kind: 'resource', resourceId: 'food' },
        query: 'Where is food and basic needs support?',
      },
      {
        label: 'Campus dining',
        description: 'Dining halls, cafés, and where to grab a bite.',
        action: { kind: 'resource', resourceId: 'campus-dining' },
        query: 'Where can I get food on campus?',
      },
    ],
  },
  {
    match: /\b(need (?:to )?study|somewhere to study|place to study|study spot|quiet place|somewhere quiet|need a room)\b/i,
    trigger: 'a place to study',
    question: 'Did you mean:',
    options: [
      {
        label: 'Study spots',
        description: 'Quiet rooms and open study spaces on campus.',
        action: { kind: 'resource', resourceId: 'study-spots' },
        query: 'Where can I find a quiet place to study?',
      },
      {
        label: 'Libraries & IT',
        description: 'Library hours, research help, and tech support.',
        action: { kind: 'resource', resourceId: 'libraries-it' },
        query: 'Where is student IT support?',
      },
    ],
  },
  {
    match: /\b(broke|no money|need money|can'?t afford|cash|short on (?:cash|money)|money problems?|financial)\b/i,
    trigger: 'money help',
    question: 'Did you mean:',
    options: [
      {
        label: 'Financial aid & awards',
        description: 'Scholarships, grants, OSAP, and UTAPS.',
        action: { kind: 'resource', resourceId: 'financial-aid' },
        query: 'Where is financial aid and awards?',
      },
      {
        label: 'Food bank & basic needs',
        description: 'Free food support if you need it.',
        action: { kind: 'resource', resourceId: 'food' },
        query: 'Where is food and basic needs support?',
      },
      {
        label: 'Find an ATM',
        description: 'Nearest on-campus ATM or bank branch.',
        action: { kind: 'resource', resourceId: 'atms' },
        query: 'Where can I find an ATM?',
      },
    ],
  },
  {
    match: /\b(bored|nothing to do|something to do|fun|hang ?out|meet people|make friends)\b/i,
    trigger: 'something to do',
    question: 'Did you mean:',
    options: [
      {
        label: "Events & what's on",
        description: 'Talks, socials, and student-group events this week.',
        action: { kind: 'resource', resourceId: 'events' },
        query: "What's happening on campus this week?",
      },
      {
        label: 'Clubs & student groups',
        description: 'Find a club that matches your interests.',
        action: { kind: 'resource', resourceId: 'clubs' },
        query: 'Where can I find student clubs?',
      },
      {
        label: 'Gyms & recreation',
        description: 'Drop-in hours, pools, and courts.',
        action: { kind: 'resource', resourceId: 'recreation' },
        query: 'Where can I work out on campus?',
      },
    ],
  },
  {
    match: /\b(tired|exhausted|need (?:a )?(?:rest|nap|break)|worn out|so sleepy)\b/i,
    trigger: 'feeling worn out',
    question: 'Did you mean:',
    options: [
      {
        label: 'Talk to someone',
        description: 'Health & Wellness counselling and support.',
        action: { kind: 'mental-health' },
        query: 'I need someone to talk to',
      },
      {
        label: 'Quiet study spots',
        description: 'Somewhere calm to rest and reset between classes.',
        action: { kind: 'resource', resourceId: 'study-spots' },
        query: 'Where can I find a quiet place to study?',
      },
    ],
  },
  {
    match: /\b(lost (?:my|something)|i lost|can'?t find my|dropped my|misplaced)\b/i,
    trigger: 'something lost',
    question: 'Did you mean:',
    options: [
      {
        label: 'Lost & found',
        description: 'Report or track down a lost item.',
        action: { kind: 'resource', resourceId: 'lost-found' },
        query: 'Where do I report a lost item?',
      },
      {
        label: 'Campus safety',
        description: 'Non-emergency safety and escort support.',
        action: { kind: 'resource', resourceId: 'safety' },
        query: 'Where is Campus Safety?',
      },
    ],
  },
  {
    match: /\b(need (?:a )?place to (?:live|stay)|nowhere to (?:live|stay)|homeless|somewhere to stay|housing)\b/i,
    trigger: 'a place to stay',
    question: 'Did you mean:',
    options: [
      {
        label: 'Housing & residence',
        description: 'Residence and off-campus housing help.',
        action: { kind: 'resource', resourceId: 'housing' },
        query: 'Where is the housing office?',
      },
      {
        label: 'Tenant rights & legal help',
        description: 'Support for landlord or tenancy problems.',
        action: { kind: 'resource', resourceId: 'tenant-rights' },
        query: 'Where can I get help with tenant rights and legal housing concerns?',
      },
    ],
  },
  {
    match: /\b(get (?:around|to campus)|how do i get|transit|bus|subway|ttc|parking|park my car)\b/i,
    trigger: 'getting around',
    question: 'Did you mean:',
    options: [
      {
        label: 'Transit & parking',
        description: 'Campus parking, permits, and TTC routes.',
        action: { kind: 'resource', resourceId: 'transit-parking' },
        query: 'Where can I park or catch transit near campus?',
      },
    ],
  },
  {
    match: /\b(sick|unwell|not feeling well|feel(?:ing)? ill|need a doctor|see a doctor|flu|fever|cold|nurse|clinic|prescription|medical)\b/i,
    trigger: 'feeling unwell',
    question: 'Did you mean:',
    options: [
      {
        label: 'Health & Wellness (medical)',
        description: 'Same-day and appointment medical care on campus.',
        action: { kind: 'mental-health' },
        query: 'Where is Health and Wellness medical care?',
      },
      {
        label: 'Talk to someone',
        description: 'Counselling and mental-health support.',
        action: { kind: 'mental-health' },
        query: 'I need someone to talk to',
      },
    ],
  },
  {
    match: /\b(exam stress|stressed about (?:exams?|school|class)|failing|behind (?:in|on) (?:class|school|my courses?)|can'?t focus|falling behind|academic stress)\b/i,
    trigger: 'school stress',
    question: 'Did you mean:',
    options: [
      {
        label: 'Study skills & learning support',
        description: 'Learning strategists for study habits and exam prep.',
        action: { kind: 'resource', resourceId: 'learning-strategies' },
        query: 'Where can I get help with studying and academic skills?',
      },
      {
        label: 'Talk to someone',
        description: 'Wellbeing support if the stress feels like too much.',
        action: { kind: 'mental-health' },
        query: 'I need someone to talk to',
      },
      {
        label: 'Courses & enrolment',
        description: 'Registrar help to add, drop, or plan courses.',
        action: { kind: 'resource', resourceId: 'registrar' },
        query: 'Where is the registrar office?',
      },
    ],
  },
  {
    match: /\b(essay|assignment|paper|thesis|writing help|help (?:me )?write|write my|proofread|citation)\b/i,
    trigger: 'writing help',
    question: 'Did you mean:',
    options: [
      {
        label: 'Writing support',
        description: 'Writing centres and help writing effectively at U of T.',
        action: { kind: 'resource', resourceId: 'learning-strategies' },
        query: 'Where can I get help with studying and academic skills?',
      },
      {
        label: 'Libraries & research help',
        description: 'Research guidance, sources, and study spaces.',
        action: { kind: 'resource', resourceId: 'libraries-it' },
        query: 'Where is student IT support?',
      },
    ],
  },
  {
    match: /\b(wi-?fi|internet|can'?t (?:connect|log ?in)|utorid|password|reset my password|email not working|software|laptop|computer help|tech help)\b/i,
    trigger: 'tech or Wi-Fi help',
    question: 'Did you mean:',
    options: [
      {
        label: 'IT & UTORid help',
        description: 'Wi-Fi, UTORid, passwords, software, and tech support.',
        action: { kind: 'resource', resourceId: 'libraries-it' },
        query: 'Where is student IT support?',
      },
      {
        label: 'Printing & tech help',
        description: 'Set up wireless printing or find a help desk.',
        action: { kind: 'resource', resourceId: 'printing' },
        query: 'Where can I print documents on campus?',
      },
    ],
  },
  {
    match: /\b(job|jobs|work on campus|part[- ]?time|hiring|resume|résumé|cv|interview|internship|career)\b/i,
    trigger: 'work or careers',
    question: 'Did you mean:',
    options: [
      {
        label: 'Career support',
        description: 'Advising, resumes, interviews, and job search help.',
        action: { kind: 'resource', resourceId: 'career' },
        query: 'Where is the career support adviser?',
      },
      {
        label: 'Work Study & campus jobs',
        description: 'Paid, part-time on-campus roles for students.',
        action: { kind: 'resource', resourceId: 'career' },
        query: 'Where can I find on-campus student jobs?',
      },
    ],
  },
  {
    match: /\b(unsafe|feel unsafe|scared|being followed|walk me home|safe walk|escort|someone is following)\b/i,
    trigger: 'feeling unsafe',
    question: 'Did you mean:',
    options: [
      {
        label: 'Campus safety & TravelSafer',
        description: 'Escort service, safety planning, and emergency contacts.',
        action: { kind: 'resource', resourceId: 'safety' },
        query: 'Where is Campus Safety?',
      },
      {
        label: 'Talk to someone',
        description: 'Confidential support if you are shaken or distressed.',
        action: { kind: 'mental-health' },
        query: 'I need someone to talk to',
      },
    ],
  },
  {
    match: /\b(pray|prayer|worship|religious|meditat(?:e|ion)|faith|quiet reflection)\b/i,
    trigger: 'prayer or reflection',
    question: 'Did you mean:',
    options: [
      {
        label: 'Multi-faith & prayer spaces',
        description: 'Prayer, meditation, and reflection spaces on campus.',
        action: { kind: 'resource', resourceId: 'multi-faith' },
        query: 'Where can I find a prayer or meditation space?',
      },
    ],
  },
  {
    match: /\b(new (?:to|here)|international student|study permit|visa|immigration|uhip|permit)\b/i,
    trigger: 'international support',
    question: 'Did you mean:',
    options: [
      {
        label: 'International student support',
        description: 'Immigration, permits, UHIP, and settling in.',
        action: { kind: 'resource', resourceId: 'international' },
        query: 'Where is the international student office?',
      },
      {
        label: 'Accessibility & accommodations',
        description: 'Academic accommodations and support services.',
        action: { kind: 'accessibility' },
        query: 'Where can I access accessibility services?',
      },
    ],
  },
];

const MIN_WORDS_FOR_CLEAR_QUERY = 6;

/**
 * Decide whether a free-form query is an unclear, everyday need that would
 * benefit from a quick "did you mean" follow-up.
 *
 * Returns a prompt to show the student, or null when the query is either
 * specific enough to answer directly or not a casual need we disambiguate.
 */
export function getDisambiguation(rawQuery: string): DisambiguationPrompt | null {
  const query = rawQuery.trim();
  if (!query) return null;

  // Longer, detailed questions are already specific enough — let the normal
  // flow handle them rather than interrupting with a follow-up.
  const wordCount = query.split(/\s+/).length;
  if (wordCount > MIN_WORDS_FOR_CLEAR_QUERY) return null;

  const rule = RULES.find((candidate) => candidate.match.test(query));
  if (!rule) return null;

  return {
    trigger: rule.trigger,
    question: rule.question,
    options: rule.options,
  };
}
