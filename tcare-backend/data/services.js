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
    keywords: ['tcard', 'lost id', 'student card', 'replacement card'],
    summary:
      'Report a lost TCard, then visit the TCard office with photo ID. A replacement costs $20 and is usually ready same day.',
    address: '130 St George St, Toronto, ON M5S 1A5', // Robarts Library
    fee: '$20',
    hours: '9:00 AM – 5:00 PM',
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
      'Same-day counselling drop-ins and scheduled appointments are available, free for students.',
    address: '214 College St, Toronto, ON M5T 2Z9',
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
    address: '455 Spadina Ave, Toronto, ON M5S 2G8',
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
