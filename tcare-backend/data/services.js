// data/services.js
//
// Fresh start — this replaces whatever service data existed in the old
// repo. Fill in real UofT service details here; the AI matches a
// student's question against this list, and the address is used to
// generate a Google Maps route.

const CAMPUS_COORDINATES = {
  utsg: { latitude: 43.6629, longitude: -79.3957 },
  utsc: { latitude: 43.7846, longitude: -79.187 },
  utm: { latitude: 43.5483, longitude: -79.662 },
};

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
      'academic advising',
      'academic advisor',
      'program advising',
    ],
    summary:
      'Free workshops and one-on-one appointments for study skills, time management, and writing support.',
    address: '9 St George St, Toronto, ON M5S 3H8',
    fee: 'Free',
    hours: '9:00 AM – 5:00 PM',
    facilityPicker: 'college',
    supportResources: { title: 'Academic advising', intro: 'Choose your college or campus to find the right academic adviser or registrar office.', campusHeading: 'Academic advising offices', campusLocations: [
      { name: 'St. George college academic advising', location: 'Choose your UTSG college to see its academic advising office address.', detail: 'Faculty of Arts & Science students are served by their college academic adviser.', coordinates: CAMPUS_COORDINATES.utsg },
      { name: 'UTSC Academic Advising & Career Centre', location: 'Academic Resource Centre, Room AC213, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Academic advising, program planning, and learning support at UTSC.', coordinates: CAMPUS_COORDINATES.utsc },
      { name: 'UTM Office of the Registrar', location: 'Innovation Complex, Room 1235, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Academic advising and course support at UTM.', coordinates: CAMPUS_COORDINATES.utm },
    ], links: [
      { group: 'U of T resources', title: 'University Registrar', description: 'Registration, records, examinations, fees, and academic information.', url: 'https://www.registrar.utoronto.ca/' },
      { group: 'U of T resources', title: 'ACORN', description: 'Manage course enrolment, your timetable, fees, and personal information.', url: 'https://acorn.utoronto.ca/' },
    ] },
  },
  {
    id: 'financial-aid', name: 'Financial Aid & Awards',
    keywords: ['financial aid office', 'financial aid and awards', 'financial aid', 'financial awards', 'financial rewards', 'scholarship', 'scholarships', 'award', 'awards', 'rewards', 'bursary', 'bursaries', 'osap office', 'osap', 'student loan', 'student grant', 'grants', 'grant', 'utaps', 'funding', 'tuition assistance', 'tuition', 'payment deadline'],
    summary: 'Explore U of T awards, scholarships, grants, OSAP, UTAPS, and other funding options.', address: '', fee: 'Varies', hours: 'Online resources',
    facilityPicker: 'college',
    supportResources: { title: 'Financial aid & awards', intro: 'Choose your campus to find local financial-aid, awards, scholarship, and OSAP support.', campusLocations: [
      { name: 'St. George Financial Aid & Awards', location: 'University Registrar’s Office, 172 St. George Street, Toronto, ON M5R 0A3', detail: 'Financial-aid, awards, scholarships, and OSAP support.', coordinates: { latitude: 43.6684, longitude: -79.4001 } },
      { name: 'UTSC Financial Aid Office', location: 'Highland Hall, ground floor, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Financial aid, awards, scholarships, and OSAP support.', coordinates: { latitude: 43.7847, longitude: -79.1871 } },
      { name: 'UTM Financial Aid Advising', location: 'Office of the Registrar, Room 1235, Innovation Complex, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Financial-aid advising, awards, scholarships, and OSAP support.', coordinates: { latitude: 43.5483, longitude: -79.6620 } },
    ], links: [
      { group: 'U of T resources', title: 'Financial Aid & Awards', description: 'Awards, scholarships, grants, UTAPS, and student aid.', url: 'https://www.registrar.utoronto.ca/financial-aid-awards/' },
      { group: 'U of T resources', title: 'Award Explorer', description: 'Search awards and scholarships available to students.', url: 'https://awardexplorer.utoronto.ca/' },
      { group: 'U of T resources', title: 'Tuition fees & schedules', description: 'Review fee categories, billing, and program schedules.', url: 'https://www.registrar.utoronto.ca/fees-payments/tuition-fee-schedules/' },
      { group: 'U of T resources', title: 'Payment deadlines', description: 'Check registration and payment deadlines for your session.', url: 'https://www.registrar.utoronto.ca/fees-payments/payment-deadlines/' },
    ] },
  },
  {
    id: 'housing', name: 'Housing & Residence',
    keywords: ['housing office', 'residence office', 'residence application', 'off-campus housing', 'family housing', 'live on campus', 'housing', 'residence', 'roommate', 'rent', 'rental'],
    summary: 'Find on-campus residence, family housing, off-campus listings, and housing support.', address: '', fee: 'Varies', hours: 'Online resources',
    supportResources: { title: 'Housing & residence', intro: 'Choose a campus office for in-person housing and residence help, or use the portal for applications and off-campus listings.', campusHeading: 'Housing and residence offices', campusLocations: [
      { name: 'St. George Student Housing & Residence Life', location: '214 College Street, Toronto, ON M5T 2Z9', detail: 'Residence applications, room assignments, and housing support for St. George students.', coordinates: CAMPUS_COORDINATES.utsg },
      { name: 'UTSC Student Housing & Residence Life', location: '1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Residence and housing support for UTSC students.', coordinates: CAMPUS_COORDINATES.utsc },
      { name: 'UTM Student Housing & Residence Life', location: 'Oscar Peterson Hall, Suite 120, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Residence and housing support for UTM students.', coordinates: CAMPUS_COORDINATES.utm },
    ], links: [
      { group: 'U of T resources', title: 'U of T Residence Portal', description: 'Apply for residence or family housing and access housing resources.', url: 'https://studentlife.utoronto.ca/service/u-of-t-residence-portal/' },
      { group: 'U of T resources', title: 'U of T housing options', description: 'Compare residence options and learn about on- and off-campus housing.', url: 'https://future.utoronto.ca/housing' },
    ] },
  },
  {
    id: 'international-support', name: 'International Student Support',
    keywords: ['international student office', 'international office', 'international student', 'immigration advisor', 'immigration advice', 'study permit', 'work permit', 'student visa', 'visa help', 'visa', 'immigration', 'uhip', 'new to canada', 'international experience'],
    summary: 'Get support with immigration, permits, UHIP, transition, and community as an international student.', address: '', fee: 'Free', hours: 'Online resources',
    supportResources: { title: 'International student support', intro: 'Choose your campus to reach an international-student office for immigration, permits, UHIP, and transition support.', campusHeading: 'International student offices', campusLocations: [
      { name: 'St. George Centre for International Experience', location: '33 St. George Street, Toronto, ON M5S 2E8', detail: 'Immigration advising, permits, UHIP, transition, and global learning support.', coordinates: CAMPUS_COORDINATES.utsg },
      { name: 'UTSC International Student Centre', location: 'Student Centre, Room SL157, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Immigration, UHIP, transition, and international student support.', coordinates: CAMPUS_COORDINATES.utsc },
      { name: 'UTM International Education Centre', location: 'Davis Building, Room DV2071, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'International Student Immigration Advisor, immigration documents, and UHIP support.', coordinates: CAMPUS_COORDINATES.utm },
    ], links: [
      { group: 'U of T resources', title: 'Immigration & permit support', description: 'Connect with the Centre for International Experience for immigration advising.', url: 'https://start.studentlife.utoronto.ca/topic-category/learn-about-immigration-and-permits' },
      { group: 'U of T resources', title: 'International student services', description: 'Programs, events, and ways to connect with international-student services.', url: 'https://start.studentlife.utoronto.ca/topic-category/connect-with-international-students-and-services' },
      { group: 'U of T resources', title: 'UTSC International Student Centre', description: 'UTSC support for immigration, UHIP, transition, and global learning.', url: 'https://www.utsc.utoronto.ca/utscinternational/' },
    ] },
  },
  {
    id: 'registrar-enrolment', name: 'Registrar & Enrolment',
    keywords: ['registrar office', 'registrar', 'course enrolment', 'course enrollment', 'course registration', 'register for courses', 'add a course', 'drop a course', 'enrolment', 'enrollment', 'enrol', 'acorn', 'timetable', 'academic record', 'transcript', 'academic calendar'],
    summary: 'Manage course enrolment, your timetable, fees, academic records, and university deadlines. Choose your college or campus to find the right registrar office.', address: '', fee: 'Free', hours: 'Varies by college and campus', facilityPicker: 'college',
    supportResources: { title: 'Registrar & enrolment', intro: 'Choose your college or campus to find the appropriate registrar office, or use these links for enrolment and fee tasks.', campusHeading: 'Registrar offices', campusLocations: [
      { name: 'St. George college registrar', location: 'Choose your UTSG college to see its registrar office address.', detail: 'Faculty of Arts & Science students are served by their college registrar.', coordinates: CAMPUS_COORDINATES.utsg },
      { name: 'UTSC Office of the Registrar', location: 'Highland Hall, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Enrolment, records, fees, and academic advising at UTSC.', coordinates: CAMPUS_COORDINATES.utsc },
      { name: 'UTM Office of the Registrar', location: 'Innovation Complex, Room 1235, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Enrolment, records, fees, and academic advising at UTM.', coordinates: CAMPUS_COORDINATES.utm },
    ], links: [
      { group: 'U of T resources', title: 'University Registrar', description: 'Registration, records, examinations, fees, and academic information.', url: 'https://www.registrar.utoronto.ca/' },
      { group: 'U of T resources', title: 'ACORN', description: 'Manage course enrolment, your timetable, fees, and personal information.', url: 'https://acorn.utoronto.ca/' },
      { group: 'U of T resources', title: 'Tuition fees & schedules', description: 'Review program- and course-based tuition and billing details.', url: 'https://www.registrar.utoronto.ca/fees-payments/tuition-fee-schedules/' },
      { group: 'U of T resources', title: 'Payment deadlines', description: 'Find minimum-payment, deferment, and session payment deadlines.', url: 'https://www.registrar.utoronto.ca/fees-payments/payment-deadlines/' },
      { group: 'U of T resources', title: 'Understanding your fees', description: 'Learn how to read your ACORN invoice and protect your registration status.', url: 'https://www.registrar.utoronto.ca/fees-payments/understanding-your-fees/' },
    ] },
  },
  {
    id: 'campus-safety', name: 'Campus Safety',
    keywords: ['campus safety office', 'campus safety', 'personal safety', 'travelsafer', 'safe walk', 'walk safe', 'walksafe', 'campus police', 'unsafe', 'harassment', 'stalking', 'emergency'],
    summary: 'For immediate danger, call 911, then Campus Safety. Find personal-safety planning, non-emergency contacts, and escort services here.', address: '', fee: 'Free', hours: '24/7 emergency support',
    supportResources: { title: 'Campus safety', intro: 'For immediate danger call 911, then Campus Safety. Choose your campus for the nearest safety office; use the links for safety planning and escort services.', campusHeading: 'Campus Safety offices', campusLocations: [
      { name: 'St. George Community Safety Office', location: 'Sussex Court, 21 Sussex Avenue, 2nd Floor, Toronto, ON M5S 1J6', detail: 'Personal safety planning, harassment and stalking support. For emergencies call Campus Safety or 911.', coordinates: CAMPUS_COORDINATES.utsg },
      { name: 'UTSC Campus Safety', location: 'Science Wing, Room SW304, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Campus Safety reports, personal safety support, and TravelSafer.', coordinates: CAMPUS_COORDINATES.utsc },
      { name: 'UTM Campus Safety', location: 'Davis Building, Room DV3116, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Campus Safety reports, WalkSafer, and personal safety support.', coordinates: CAMPUS_COORDINATES.utm },
    ], links: [
      { group: 'U of T resources', title: 'U of T Safety & Support', description: 'Tri-campus emergency contacts, safety resources, and the Campus Safety app.', url: 'https://safety.utoronto.ca/' },
      { group: 'U of T resources', title: 'Personal safety & TravelSafer', description: 'Safety planning, Community Safety Office, and campus escort contacts.', url: 'https://safety.utoronto.ca/personal-safety/' },
    ] },
  },
  {
    id: 'career-support', name: 'Career Support',
    keywords: ['career office', 'career advisor', 'career advising', 'career counselling', 'career', 'job', 'jobs', 'resume', 'résumé', 'cv', 'cover letter', 'interview', 'work study', 'work-study', 'clnx', 'internship', 'graduate school'],
    summary: 'Explore careers, job-search strategies, further education, advising, workshops, and paid on-campus opportunities.', address: '800 Bay Street, 5th Floor, Toronto, ON M5S 3A9', fee: 'Free', hours: 'See Career Exploration & Education',
    supportResources: { title: 'Career support', intro: 'Choose your campus to find career advising, job-search support, workshops, and Work Study information.', campusHeading: 'Career advising offices', campusLocations: [
      { name: 'St. George Career Exploration & Education', location: '800 Bay Street, 5th Floor, Toronto, ON M5S 3A9', detail: 'Career advising, job-search support, workshops, and Work Study support.', coordinates: CAMPUS_COORDINATES.utsg },
      { name: 'UTSC Academic Advising & Career Centre', location: 'Academic Resource Centre, Room AC213, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Career advising, job search, academic advising, and experiential learning support.', coordinates: CAMPUS_COORDINATES.utsc },
      { name: 'UTM Career Centre', location: 'Davis Building, Room DV3094, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Career advising, job-search support, workshops, and career programming.', coordinates: CAMPUS_COORDINATES.utm },
    ], links: [
      { group: 'U of T resources', title: 'Career Exploration & Education', description: 'Career programs, advising, workshops, job-search support, and resources.', url: 'https://studentlife.utoronto.ca/department/career-exploration-education/' },
      { group: 'U of T resources', title: 'Career advising appointments', description: 'Book one-on-one advising for careers, applications, interviews, or further education.', url: 'https://studentlife.utoronto.ca/service/career-advising-appointments/' },
      { group: 'U of T resources', title: 'Work Study Program', description: 'Find paid, part-time on-campus roles and learn about applying.', url: 'https://studentlife.utoronto.ca/work-study-program/' },
    ] },
  },
  {
    id: 'libraries-it', name: 'Libraries & IT',
    keywords: ['library hours', 'book a study room', 'study space', 'study room', 'research help', 'it support', 'utorid', 'password', 'wifi', 'wi-fi', 'printing', 'printer', 'library', 'libraries', 'librarian', 'software', 'computer'],
    summary: 'Access study spaces, research tools, library services, Wi-Fi, UTORid, software, and technology support.', address: '', fee: 'Free', hours: 'Varies by location',
    supportResources: { title: 'Libraries & IT', intro: 'Choose your campus for in-person student IT support, or use the library links to find study spaces and current hours.', campusHeading: 'Student IT help desks', campusLocations: [
      { name: 'St. George Information Commons Help Desk', location: '130 St. George Street, Ground Floor, Toronto, ON M5S 1A5', detail: 'UTORid, Wi-Fi, software, printing, and general student IT support.', coordinates: CAMPUS_COORDINATES.utsg },
      { name: 'UTSC Service Desk', location: 'Academic Resource Centre, Room AC200, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Student IT support at UTSC.', coordinates: CAMPUS_COORDINATES.utsc },
      { name: 'UTM Service Desk', location: 'Communication, Culture & Technology Building Atrium, Room 0160, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Student IT support at UTM.', coordinates: CAMPUS_COORDINATES.utm },
    ], links: [
      { group: 'U of T resources', title: 'University of Toronto Libraries', description: 'Search collections, study spaces, current hours, and research help.', url: 'https://library.utoronto.ca/' },
      { group: 'U of T resources', title: 'Libraries & hours', description: 'Find an open library and available study spaces.', url: 'https://library.utoronto.ca/libraries' },
      { group: 'U of T resources', title: 'Information Technology Services', description: 'Student help-desk contacts and IT support across all three campuses.', url: 'https://www.its.utoronto.ca/contact/' },
    ] },
  },
  {
    id: 'food-basic-needs', name: 'Food & Basic Needs',
    keywords: ['food bank office', 'food bank', 'food support', 'food insecurity', 'emergency food', 'basic needs', 'hungry', 'groceries', 'food', 'meal', 'meals'],
    summary: 'Find food-bank support and student food programs. Services and eligibility may vary by campus.', address: 'Student Commons, 230 College Street, Toronto, ON M5T 1R2', fee: 'Free', hours: 'See UTSU Food Bank',
    supportResources: { title: 'Food & basic needs', intro: 'Choose your campus for student food and basic-needs support. Check each program’s site for current eligibility and hours.', campusHeading: 'Food and basic-needs support', campusLocations: [
      { name: 'UTSG UTSU Food Bank', location: 'Student Commons, 230 College Street, Toronto, ON M5T 1R2', detail: 'Free food-bank support for eligible U of T students, including students with families.', coordinates: CAMPUS_COORDINATES.utsg },
      { name: 'UTSC SCSU Food Centre', location: 'Student Centre, Room SL-210-B, 1265 Military Trail, Scarborough, ON M1C 1A4', detail: 'Free food and basic-needs support for the UTSC community.', coordinates: CAMPUS_COORDINATES.utsc },
      { name: 'UTM UTMSU Food Centre', location: 'UTM Student Centre, Room 100, 1815 Inner Circle Road, Mississauga, ON L5L 1C6', detail: 'Food-access support for UTM students and community members experiencing food insecurity.', coordinates: CAMPUS_COORDINATES.utm },
    ], links: [
      { group: 'U of T resources', title: 'UTSU Food Bank', description: 'Free food-bank support for U of T students, including students with families.', url: 'https://www.utsu.ca/food-bank/' },
      { group: 'U of T resources', title: 'UTSU Food Programming', description: 'Food-bank support and other student food programs.', url: 'https://www.utsu.ca/food-programming/' },
      { group: 'U of T resources', title: 'SCSU Food Centre (UTSC)', description: 'Food-access support and current details for UTSC students.', url: 'https://scsu.ca/foodcentre' },
      { group: 'U of T resources', title: 'UTMSU Food Centre (UTM)', description: 'Food-access support and current pickup details for UTM students.', url: 'https://utmsu.ca/service/food-centre/' },
    ] },
  },
  {
    id: 'sexual-violence-support', name: 'Sexual Violence Support',
    keywords: ['sexual violence office', 'sexual violence', 'sexual assault', 'sexual harassment', 'svpscentre', 'svps', 'consent', 'survivor', 'rape', 'disclosure'],
    summary: 'Confidential, non-judgmental support is available for U of T community members affected by sexual violence or harassment.', address: '', fee: 'Free', hours: 'See Sexual Violence Prevention & Support Centre',
    supportResources: { title: 'Sexual violence support', intro: 'You can access confidential, non-judgmental support and learn about your options at your own pace. Choose a campus location to see it on the map.', campusHeading: 'Sexual Violence Prevention & Support Centre locations', campusLocations: [
      { name: 'St. George Sexual Violence Prevention & Support Centre', location: 'Gerstein Library, Room B139, 9 King’s College Circle, Toronto, ON M5S 1A5', detail: 'Confidential support, options, referrals, and accommodations.', coordinates: CAMPUS_COORDINATES.utsg },
      { name: 'UTSC Sexual Violence Prevention & Support Centre', location: 'Environmental Science and Chemistry Building, Room EV141, 1065 Military Trail, Scarborough, ON M1C 1A4', detail: 'Confidential support, options, referrals, and accommodations.', coordinates: CAMPUS_COORDINATES.utsc },
      { name: 'UTM Sexual Violence Prevention & Support Centre', location: 'Davis Building, Room DV3094G, 3359 Mississauga Road, Mississauga, ON L5L 1C6', detail: 'Confidential support, options, referrals, and accommodations.', coordinates: CAMPUS_COORDINATES.utm },
    ], links: [
      { group: 'U of T resources', title: 'Sexual Violence Prevention & Support Centre', description: 'Confidential support, options, referrals, accommodations, and prevention resources.', url: 'https://svpscentre.utoronto.ca/' },
      { group: 'U of T resources', title: 'Sexual violence & sexual harassment support', description: 'Tri-campus support options and immediate-help information.', url: 'https://safety.utoronto.ca/sexual-violence-sexual-harassment/' },
    ] },
  },
];
