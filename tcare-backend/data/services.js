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
      'U of T Health & Wellness provides mental health and medical support. Mental Health Services are on the 12th floor and Medical Services are on the 14th floor.',
    address: '700 Bay Street, 12th and 14th Floors, Toronto, ON M5G 1Z6',
    fee: 'Free',
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
    address: '455 Spadina Ave, Suite 400, Toronto, ON M5S 1A1',
    fee: 'Free',
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
