// data/services.js
//
// Fresh start — this replaces whatever service data existed in the old
// repo. Fill in real UofT service details here; the AI matches a
// student's question against this list, and the address is used to
// generate a Google Maps route.

module.exports = [
  {
    id: 'tcard-office',
    name: 'TCard Office',
    keywords: ['tcard', 'lost id', 'student card', 'replacement card', 'directions'],
    summary:
      'The St. George TCard Office is on the 5th floor of 800 Bay Street. For a lost or damaged card, report it lost in eAccounts, then visit in person; a standard replacement is $20, payable by debit, credit, or TBucks.',
    address: '800 Bay Street, 5th Floor, Toronto, ON M5S 3A9',
    fee: '$20',
    hours: 'Monday to Friday, 9:00 AM to 4:15 PM',
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness Centre',
    keywords: [
      'overwhelmed',
      'talk to someone',
      'counselling',
      'counseling',
      'mental health',
      'anxious',
      'stressed',
    ],
    summary:
      'U of T Health & Wellness can connect you with confidential mental health support. The St. George Health & Wellness Centre at 700 Bay Street is the main route shown below.',
    address: '700 Bay Street, Toronto, ON M5G 1Z6',
    fee: 'Free',
    supportResources: {
      campusLocations: [
        { name: 'St. George Health & Wellness Centre', location: '700 Bay Street, Toronto, ON M5G 1Z6', detail: 'Confidential mental health and physical health support for St. George students.', coordinates: { latitude: 43.6586, longitude: -79.3835 } },
        { name: 'UTSC Health & Wellness Centre', location: 'Sam Ibrahim Building, IA5061, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Counselling, health care, and health-promotion support for UTSC students.', coordinates: { latitude: 43.7846, longitude: -79.187 } },
        { name: 'UTM Health & Counselling Centre', location: 'Davis Building, DV1152, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Personal and group counselling, psychiatric care, and health support for UTM students.', coordinates: { latitude: 43.5483, longitude: -79.662 } },
      ],
      links: [
        { group: 'Government support', title: 'Ontario mental health support', description: 'Ontario’s directory for confidential mental health and crisis supports.', url: 'https://www.ontario.ca/page/find-mental-health-support' },
        { group: 'Government support', title: 'Canada mental health support', description: 'Federal guidance and Canada-wide mental health supports.', url: 'https://www.canada.ca/en/public-health/campaigns/get-help-here.html' },
        { group: 'U of T resources', title: 'Student Mental Health Resource', description: 'Tri-campus U of T supports and tools for students.', url: 'https://mentalhealth.utoronto.ca/' },
        { group: 'U of T resources', title: 'U of T mental health supports', description: 'Ways to access counselling, same-day care, and other Health & Wellness supports.', url: 'https://studentlife.utoronto.ca/service/mental-health-supports/' },
      ],
    },
    hours: '9:00 AM – 4:30 PM',
  },
  {
    id: 'accessibility-services',
    name: 'Accessibility Services',
    keywords: [
      'accessibility',
      'disability',
      'accommodation',
      'note taker',
      'exam accommodation',
    ],
    summary:
      'Register for academic accommodations, assistive technology, and exam accommodations.',
    address: '455 Spadina Avenue, 4th Floor, Suite 400, Toronto, ON M5S 2G8',
    fee: 'Free',
    supportResources: {
      title: 'Accessibility support',
      intro: 'Find academic accommodations, assistive technology, and support that works for you. The map above routes to St. George Accessibility Services.',
      campusHeading: 'U of T accessibility offices',
      primaryDestination: 'St. George Accessibility Services',
      campusLocations: [
        { name: 'St. George Accessibility Services', location: '455 Spadina Avenue, 4th Floor, Suite 400, Toronto, ON M5S 2G8', detail: 'Academic accommodations, adaptive technology, and exam support.', coordinates: { latitude: 43.6643, longitude: -79.4018 } },
        { name: 'UTSC AccessAbility Services', location: 'Sam Ibrahim Building, IA5105, 1050 Military Trail, Scarborough, ON M1C 1A4', detail: 'Disability-related accommodations and accessible learning support.', coordinates: { latitude: 43.7846, longitude: -79.187 } },
        { name: 'UTM AccessABILITY Resource Centre', location: 'Davis Building, DV2240, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Academic accommodations and accessibility resources for UTM students.', coordinates: { latitude: 43.5483, longitude: -79.662 } },
      ],
      links: [
        { group: 'Government support', title: 'Accessibility in Ontario', description: 'Ontario accessibility information, rights, and community-support directory.', url: 'https://www.ontario.ca/page/accessibility-ontario-what-you-need-to-know' },
        { group: 'Government support', title: 'Canada grants for disability services and equipment', description: 'Federal funding information for eligible students who need education-related services or equipment.', url: 'https://www.canada.ca/en/services/benefits/education/student-aid/grants-loans/disabilities-service-equipment.html' },
        { group: 'U of T resources', title: 'U of T Accessibility Services', description: 'Register for accommodations and connect with St. George Accessibility Services.', url: 'https://studentlife.utoronto.ca/department/accessibility-services/' },
        { group: 'U of T resources', title: 'Accessibility advisor support', description: 'Learn how to meet with an accessibility advisor and manage your accommodations.', url: 'https://studentlife.utoronto.ca/service/accessibility-advisor-support/' },
      ],
    },
    hours: '9:00 AM – 4:00 PM',
  },
  {
    id: 'academic-success',
    name: 'Academic Success Centre',
    keywords: [
      'study help',
      'studies',
      'tutoring',
      'time management',
      'study skills',
      'writing help',
    ],
    summary:
      'Free workshops and one-on-one appointments for study skills, time management, and writing support.',
    address: '9 St George St, Toronto, ON M5S 3H8',
    fee: 'Free',
    hours: '9:00 AM – 5:00 PM',
  },
];
