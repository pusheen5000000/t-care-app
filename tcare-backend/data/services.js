const CAMPUS_COORDINATES = {
  utsg: { latitude: 43.6629, longitude: -79.3957 },
  utsc: { latitude: 43.7846, longitude: -79.187 },
  utm: { latitude: 43.5483, longitude: -79.662 },
};

const UTSC_ADDRESS = '1265 Military Trail, Scarborough, ON M1C 1A4';
const UTM_ADDRESS = '3359 Mississauga Road, Mississauga, ON L5L 1C6';

function campusOffice(name, location, detail, coordinates) {
  return { name, location, detail, coordinates };
}

function campusSpot(campus, name, location, detail) {
  return { campus, name, location, detail };
}

function resourceLink(title, description, url, group = 'U of T resources') {
  return { group, title, description, url };
}

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
      'someone to talk to',
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
        campusOffice('St. George Health & Wellness Centre', '700 Bay Street, Toronto, ON M5G 1Z6', 'Confidential mental health and physical health support for St. George students.', { latitude: 43.6586, longitude: -79.3835 }),
        campusOffice('UTSC Health & Wellness Centre', `Sam Ibrahim Building, IA5061, ${UTSC_ADDRESS}`, 'Counselling, health care, and health-promotion support for UTSC students.', { latitude: 43.7846, longitude: -79.187 }),
        campusOffice('UTM Health & Counselling Centre', `Davis Building, DV1152, ${UTM_ADDRESS}`, 'Personal and group counselling, psychiatric care, and health support for UTM students.', { latitude: 43.5483, longitude: -79.662 }),
      ],
      links: [
        resourceLink('Ontario mental health support', 'Ontario’s directory for confidential mental health and crisis supports.', 'https://www.ontario.ca/page/find-mental-health-support', 'Government support'),
        resourceLink('Canada mental health support', 'Federal guidance and Canada-wide mental health supports.', 'https://www.canada.ca/en/public-health/campaigns/get-help-here.html', 'Government support'),
        resourceLink('Student Mental Health Resource', 'Tri-campus U of T supports and tools for students.', 'https://mentalhealth.utoronto.ca/'),
        resourceLink('U of T mental health supports', 'Ways to access counselling, same-day care, and other Health & Wellness supports.', 'https://studentlife.utoronto.ca/service/mental-health-supports/'),
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
        campusOffice('St. George Accessibility Services', '455 Spadina Avenue, 4th Floor, Suite 400, Toronto, ON M5S 2G8', 'Academic accommodations, adaptive technology, and exam support.', { latitude: 43.6643, longitude: -79.4018 }),
        campusOffice('UTSC AccessAbility Services', `Sam Ibrahim Building, IA5105, ${UTSC_ADDRESS}`, 'Disability-related accommodations and accessible learning support.', { latitude: 43.7846, longitude: -79.187 }),
        campusOffice('UTM AccessABILITY Resource Centre', `Davis Building, DV2240, ${UTM_ADDRESS}`, 'Academic accommodations and accessibility resources for UTM students.', { latitude: 43.5483, longitude: -79.662 }),
      ],
      links: [
        resourceLink('Accessibility in Ontario', 'Ontario accessibility information, rights, and community-support directory.', 'https://www.ontario.ca/page/accessibility-ontario-what-you-need-to-know', 'Government support'),
        resourceLink('Canada grants for disability services and equipment', 'Federal funding information for eligible students who need education-related services or equipment.', 'https://www.canada.ca/en/services/benefits/education/student-aid/grants-loans/disabilities-service-equipment.html', 'Government support'),
        resourceLink('U of T Accessibility Services', 'Register for accommodations and connect with St. George Accessibility Services.', 'https://studentlife.utoronto.ca/department/accessibility-services/'),
        resourceLink('Accessibility advisor support', 'Learn how to meet with an accessibility advisor and manage your accommodations.', 'https://studentlife.utoronto.ca/service/accessibility-advisor-support/'),
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
      'help with my courses',
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
      campusOffice('St. George College Academic Advising', 'Choose your UTSG college to see its academic advising office address.', 'Faculty of Arts & Science students are served by their college academic adviser.', CAMPUS_COORDINATES.utsg),
      campusOffice('UTSC Academic Advising & Career Centre', `Academic Resource Centre, Room AC213, ${UTSC_ADDRESS}`, 'Academic advising, program planning, and learning support at UTSC.', CAMPUS_COORDINATES.utsc),
      campusOffice('UTM Office of the Registrar', `Innovation Complex, Room 1235, ${UTM_ADDRESS}`, 'Academic advising and course support at UTM.', CAMPUS_COORDINATES.utm),
    ], links: [
      resourceLink('University Registrar', 'Registration, records, examinations, fees, and academic information.', 'https://www.registrar.utoronto.ca/'),
      resourceLink('ACORN', 'Manage course enrolment, your timetable, fees, and personal information.', 'https://acorn.utoronto.ca/'),
    ] },
  },
  {
    id: 'financial-aid', name: 'Financial Aid & Awards',
    keywords: ['financial aid office', 'financial aid and awards', 'financial aid', 'financial awards', 'financial rewards', 'scholarship', 'scholarships', 'award', 'awards', 'rewards', 'bursary', 'bursaries', 'osap office', 'osap', 'student loan', 'student grant', 'grants', 'grant', 'utaps', 'funding', 'tuition assistance', 'tuition', 'payment deadline'],
    summary: 'Explore U of T awards, scholarships, grants, OSAP, UTAPS, and other funding options.', address: '', fee: 'Varies', hours: 'Online resources',
    facilityPicker: 'college',
    supportResources: { title: 'Financial aid & awards', intro: 'Choose your campus to find local financial-aid, awards, scholarship, and OSAP support.', campusLocations: [
      campusOffice('St. George Financial Aid & Awards', 'University Registrar’s Office, 172 St. George Street, Toronto, ON M5R 0A3', 'Financial-aid, awards, scholarships, and OSAP support.', { latitude: 43.6684, longitude: -79.4001 }),
      campusOffice('UTSC Financial Aid Office', `Highland Hall, ground floor, ${UTSC_ADDRESS}`, 'Financial aid, awards, scholarships, and OSAP support.', { latitude: 43.7847, longitude: -79.1871 }),
      campusOffice('UTM Financial Aid Advising', `Office of the Registrar, Room 1235, Innovation Complex, ${UTM_ADDRESS}`, 'Financial-aid advising, awards, scholarships, and OSAP support.', { latitude: 43.5483, longitude: -79.6620 }),
    ], links: [
      resourceLink('Financial Aid & Awards', 'Awards, scholarships, grants, UTAPS, and student aid.', 'https://www.registrar.utoronto.ca/financial-aid-awards/'),
      resourceLink('Award Explorer', 'Search awards and scholarships available to students.', 'https://awardexplorer.utoronto.ca/'),
      resourceLink('Tuition fees & schedules', 'Review fee categories, billing, and program schedules.', 'https://www.registrar.utoronto.ca/fees-payments/tuition-fee-schedules/'),
      resourceLink('Payment deadlines', 'Check registration and payment deadlines for your session.', 'https://www.registrar.utoronto.ca/fees-payments/payment-deadlines/'),
    ] },
  },
  {
    id: 'housing', name: 'Housing & Residence',
    keywords: ['housing office', 'residence office', 'residence application', 'off-campus housing', 'family housing', 'live on campus', 'housing', 'residence', 'roommate', 'rent', 'rental'],
    summary: 'Find on-campus residence, family housing, off-campus listings, and housing support.', address: '', fee: 'Varies', hours: 'Online resources',
    supportResources: { title: 'Housing & residence', intro: 'Choose a campus office for in-person housing and residence help, or use the portal for applications and off-campus listings.', campusHeading: 'Housing and residence offices', campusLocations: [
      campusOffice('St. George Student Housing & Residence Life', '214 College Street, Toronto, ON M5T 2Z9', 'Residence applications, room assignments, and housing support for St. George students.', CAMPUS_COORDINATES.utsg),
      campusOffice('UTSC Student Housing & Residence Life', UTSC_ADDRESS, 'Residence and housing support for UTSC students.', CAMPUS_COORDINATES.utsc),
      campusOffice('UTM Student Housing & Residence Life', `Oscar Peterson Hall, Suite 120, ${UTM_ADDRESS}`, 'Residence and housing support for UTM students.', CAMPUS_COORDINATES.utm),
    ], links: [
      resourceLink('U of T Residence Portal', 'Apply for residence or family housing and access housing resources.', 'https://studentlife.utoronto.ca/service/u-of-t-residence-portal/'),
      resourceLink('U of T housing options', 'Compare residence options and learn about on- and off-campus housing.', 'https://future.utoronto.ca/housing'),
    ] },
  },
  {
    id: 'international-support', name: 'International Student Support',
    keywords: ['international student office', 'international office', 'international student', 'immigration advisor', 'immigration advice', 'study permit', 'work permit', 'student visa', 'visa help', 'visa', 'immigration', 'uhip', 'new to canada', 'international experience'],
    summary: 'Get support with immigration, permits, UHIP, transition, and community as an international student.', address: '', fee: 'Free', hours: 'Online resources',
    supportResources: { title: 'International student support', intro: 'Choose your campus to reach an international-student office for immigration, permits, UHIP, and transition support.', campusHeading: 'International student offices', campusLocations: [
      campusOffice('St. George Centre for International Experience', '33 St. George Street, Toronto, ON M5S 2E8', 'Immigration advising, permits, UHIP, transition, and global learning support.', CAMPUS_COORDINATES.utsg),
      campusOffice('UTSC International Student Centre', `Arts & Administration Building, Room AA142, ${UTSC_ADDRESS}`, 'Immigration, UHIP, transition, and international student support.', CAMPUS_COORDINATES.utsc),
      campusOffice('UTM International Education Centre', `Davis Building, Room DV2071, ${UTM_ADDRESS}`, 'International Student Immigration Advisor, immigration documents, and UHIP support.', CAMPUS_COORDINATES.utm),
    ], links: [
      resourceLink('Immigration & permit support', 'Connect with the Centre for International Experience for immigration advising.', 'https://start.studentlife.utoronto.ca/topic-category/learn-about-immigration-and-permits'),
      resourceLink('International student services', 'Programs, events, and ways to connect with international-student services.', 'https://start.studentlife.utoronto.ca/topic-category/connect-with-international-students-and-services'),
      resourceLink('UTSC International Student Centre', 'UTSC support for immigration, UHIP, transition, and global learning.', 'https://www.utsc.utoronto.ca/utscinternational/'),
    ] },
  },
  {
    id: 'registrar-enrolment', name: 'Registrar & Enrolment',
    keywords: ['registrar office', 'registrar', 'course enrolment', 'course enrollment', 'course registration', 'register for courses', 'add a course', 'drop a course', 'enrolment', 'enrollment', 'enrol', 'acorn', 'timetable', 'academic record', 'transcript', 'academic calendar'],
    summary: 'Manage course enrolment, your timetable, fees, academic records, and university deadlines. Choose your college or campus to find the right registrar office.', address: '', fee: 'Free', hours: 'Varies by college and campus', facilityPicker: 'college',
    supportResources: { title: 'Registrar & enrolment', intro: 'Choose your college or campus to find the appropriate registrar office, or use these links for enrolment and fee tasks.', campusHeading: 'Registrar offices', campusLocations: [
      campusOffice('St. George College Registrar', 'Choose your UTSG college to see its registrar office address.', 'Faculty of Arts & Science students are served by their college registrar.', CAMPUS_COORDINATES.utsg),
      campusOffice('UTSC Office of the Registrar', `Highland Hall, ${UTSC_ADDRESS}`, 'Enrolment, records, fees, and academic advising at UTSC.', CAMPUS_COORDINATES.utsc),
      campusOffice('UTM Office of the Registrar', `Innovation Complex, Room 1235, ${UTM_ADDRESS}`, 'Enrolment, records, fees, and academic advising at UTM.', CAMPUS_COORDINATES.utm),
    ], links: [
      resourceLink('University Registrar', 'Registration, records, examinations, fees, and academic information.', 'https://www.registrar.utoronto.ca/'),
      resourceLink('ACORN', 'Manage course enrolment, your timetable, fees, and personal information.', 'https://acorn.utoronto.ca/'),
      resourceLink('Tuition fees & schedules', 'Review program- and course-based tuition and billing details.', 'https://www.registrar.utoronto.ca/fees-payments/tuition-fee-schedules/'),
      resourceLink('Payment deadlines', 'Find minimum-payment, deferment, and session payment deadlines.', 'https://www.registrar.utoronto.ca/fees-payments/payment-deadlines/'),
      resourceLink('Understanding your fees', 'Learn how to read your ACORN invoice and protect your registration status.', 'https://www.registrar.utoronto.ca/fees-payments/understanding-your-fees/'),
    ] },
  },
  {
    id: 'campus-safety', name: 'Campus Safety',
    keywords: ['campus safety office', 'campus safety', 'personal safety', 'travelsafer', 'safe walk', 'walk safe', 'walksafe', 'campus police', 'unsafe', 'harassment', 'stalking', 'emergency'],
    summary: 'For immediate danger, call 911, then Campus Safety. Find personal-safety planning, non-emergency contacts, and escort services here.', address: '', fee: 'Free', hours: '24/7 emergency support',
    supportResources: { title: 'Campus safety', intro: 'For immediate danger call 911, then Campus Safety. Choose your campus for the nearest safety office; use the links for safety planning and escort services.', campusHeading: 'Campus Safety offices', campusLocations: [
      campusOffice('St. George Community Safety Office', 'Sussex Court, 21 Sussex Avenue, 2nd Floor, Toronto, ON M5S 1J6', 'Personal safety planning, harassment and stalking support. For emergencies call Campus Safety or 911.', CAMPUS_COORDINATES.utsg),
      campusOffice('UTSC Campus Safety', `Science Wing, Room SW304, ${UTSC_ADDRESS}`, 'Campus Safety reports, personal safety support, and TravelSafer.', CAMPUS_COORDINATES.utsc),
      campusOffice('UTM Campus Safety', `Davis Building, Room DV3116, ${UTM_ADDRESS}`, 'Campus Safety reports, WalkSafer, and personal safety support.', CAMPUS_COORDINATES.utm),
    ], links: [
      resourceLink('U of T Safety & Support', 'Tri-campus emergency contacts, safety resources, and the Campus Safety app.', 'https://safety.utoronto.ca/'),
      resourceLink('TravelSafer escort service', 'Request a free 24/7 walking escort to and from campus and nearby TTC stations.', 'https://www.campussafety.utoronto.ca/travel-safer'),
      resourceLink('Community Safety Office', 'Short-term support for personal-safety concerns like harassment, stalking, or threats.', 'https://www.communitysafety.utoronto.ca/'),
    ] },
  },
  {
    id: 'career-support', name: 'Career Support',
    keywords: ['career office', 'career advisor', 'career advising', 'career counselling', 'career', 'job', 'jobs', 'resume', 'résumé', 'cv', 'cover letter', 'interview', 'work study', 'work-study', 'clnx', 'internship', 'graduate school'],
    summary: 'Explore careers, job-search strategies, further education, advising, workshops, and paid on-campus opportunities.', address: '800 Bay Street, 5th Floor, Toronto, ON M5S 3A9', fee: 'Free', hours: 'See Career Exploration & Education',
    supportResources: { title: 'Career support', intro: 'Choose your campus to find career advising, job-search support, workshops, and Work Study information.', campusHeading: 'Career advising offices', campusLocations: [
      campusOffice('St. George Career Exploration & Education', '800 Bay Street, 5th Floor, Toronto, ON M5S 3A9', 'Career advising, job-search support, workshops, and Work Study support.', CAMPUS_COORDINATES.utsg),
      campusOffice('UTSC Academic Advising & Career Centre', `Academic Resource Centre, Room AC213, ${UTSC_ADDRESS}`, 'Career advising, job search, academic advising, and experiential learning support.', CAMPUS_COORDINATES.utsc),
      campusOffice('UTM Career Centre', `Davis Building, Room DV3094, ${UTM_ADDRESS}`, 'Career advising, job-search support, workshops, and career programming.', CAMPUS_COORDINATES.utm),
    ], links: [
      resourceLink('Career Exploration & Education', 'Career programs, advising, workshops, job-search support, and resources.', 'https://studentlife.utoronto.ca/department/career-exploration-education/'),
      resourceLink('Career advising appointments', 'Book one-on-one advising for careers, applications, interviews, or further education.', 'https://studentlife.utoronto.ca/service/career-advising-appointments/'),
      resourceLink('Work Study Program', 'Find paid, part-time on-campus roles and learn about applying.', 'https://studentlife.utoronto.ca/work-study-program/'),
    ] },
  },
  {
    id: 'libraries-it', name: 'Libraries & IT',
    keywords: ['library hours', 'book a study room', 'study space', 'study room', 'research help', 'it support', 'utorid', 'password', 'wifi', 'wi-fi', 'printing', 'printer', 'library', 'libraries', 'librarian', 'software', 'computer'],
    summary: 'Access study spaces, research tools, library services, Wi-Fi, UTORid, software, and technology support.', address: '', fee: 'Free', hours: 'Varies by location',
    supportResources: { title: 'Libraries & IT', intro: 'Choose your campus for in-person student IT support, or use the library links to find study spaces and current hours.', campusHeading: 'Student IT help desks', campusLocations: [
      campusOffice('St. George Information Commons Help Desk', '130 St. George Street, Ground Floor, Toronto, ON M5S 1A5', 'UTORid, Wi-Fi, software, printing, and general student IT support.', CAMPUS_COORDINATES.utsg),
      campusOffice('UTSC Service Desk', `Academic Resource Centre, Room AC200, ${UTSC_ADDRESS}`, 'Student IT support at UTSC.', CAMPUS_COORDINATES.utsc),
      campusOffice('UTM Service Desk', `Communication, Culture & Technology Building Atrium, Room 0160, ${UTM_ADDRESS}`, 'Student IT support at UTM.', CAMPUS_COORDINATES.utm),
    ], links: [
      resourceLink('University of Toronto Libraries', 'Search collections, study spaces, current hours, and research help.', 'https://library.utoronto.ca/'),
      resourceLink('Libraries & hours', 'Find an open library and available study spaces.', 'https://library.utoronto.ca/libraries'),
      resourceLink('Information Technology Services', 'Student help-desk contacts and IT support across all three campuses.', 'https://www.its.utoronto.ca/contact/'),
    ] },
  },
  {
    id: 'food-basic-needs', name: 'Food & Basic Needs',
    keywords: ['food bank office', 'food bank', 'food support', 'food insecurity', 'emergency food', 'basic needs', 'hungry', 'groceries', 'food', 'meal', 'meals'],
    summary: 'Find food-bank support and student food programs. Services and eligibility may vary by campus.', address: 'Student Commons, 230 College Street, Toronto, ON M5T 1R2', fee: 'Free', hours: 'See UTSU Food Bank',
    supportResources: { title: 'Food & basic needs', intro: 'Choose your campus for student food and basic-needs support. Check each program’s site for current eligibility and hours.', campusHeading: 'Food and basic-needs support', campusLocations: [
      campusOffice('UTSG UTSU Food Bank', 'Student Commons, 230 College Street, Toronto, ON M5T 1R2', 'Free food-bank support for eligible U of T students, including students with families.', CAMPUS_COORDINATES.utsg),
      campusOffice('UTSC SCSU Food Centre', `Student Centre, Room SL-210-B, ${UTSC_ADDRESS}`, 'Free food and basic-needs support for the UTSC community.', CAMPUS_COORDINATES.utsc),
      campusOffice('UTM UTMSU Food Centre', 'UTM Student Centre, Room 100, 1815 Inner Circle Road, Mississauga, ON L5L 1C6', 'Food-access support for UTM students and community members experiencing food insecurity.', CAMPUS_COORDINATES.utm),
    ], links: [
      resourceLink('UTSU Food Bank', 'Free food-bank support for U of T students, including students with families.', 'https://www.utsu.ca/food-bank/'),
      resourceLink('UTSU Food Programming', 'Food-bank support and other student food programs.', 'https://www.utsu.ca/food-programming/'),
      resourceLink('SCSU Food Centre (UTSC)', 'Food-access support and current details for UTSC students.', 'https://www.scsu.ca/equity-centres#food'),
      resourceLink('UTMSU Food Centre (UTM)', 'Food-access support and current pickup details for UTM students.', 'https://utmsu.ca/service/food-centre/'),
    ] },
  },
  {
    id: 'campus-dining', name: 'Where to eat on campus',
    // Casual dining keywords are intentionally specific so genuine food-bank
    // needs ("food bank", "hungry", "food insecurity") still match Food & Basic
    // Needs, while "where to eat", "dining hall", "coffee", etc. land here.
    keywords: ['eat on campus', 'where to eat', 'place to eat', 'places to eat', 'campus food', 'food on campus', 'food hall', 'food court', 'dining hall', 'dining commons', 'dining', 'cafeteria', 'cafe', 'café', 'coffee', 'starbucks', 'meal plan', 'grab a bite', 'restaurant', 'restaurants', 'lunch', 'breakfast', 'somewhere to eat'],
    summary: 'Grab a bite at a campus food hall, café, or residence dining commons. Tap a spot for directions, or check U of T Food Services for full hours.',
    address: '', fee: 'Varies', hours: 'Varies by location',
    listOnly: true,
    supportResources: { title: 'Casual places to eat', intro: 'Popular food halls, cafés, and dining commons on campus. Hours vary by location and term — check U of T Food Services for the latest.', campusHeading: 'Food halls & cafés', campusLocations: [
      campusSpot('utsg', 'Robarts Food Hall', '2nd Floor, Robarts Library, 130 St. George Street, Toronto, ON M5S 1A5', 'Food court with a rotating line-up of quick-service vendors in the heart of campus.'),
      campusSpot('utsg', 'Starbucks at Robarts Library', 'Robarts Library, 130 St. George Street, Toronto, ON M5S 1A5', 'Coffee, espresso drinks, and grab-and-go snacks inside Robarts.'),
      campusSpot('utsg', "Sid's Food Hall", 'Sidney Smith Hall, 100 St. George Street, Toronto, ON M5S 3G3', 'Busy food hall with several vendors, popular with Arts & Science students.'),
      campusSpot('utsg', 'Medical Sciences Building Food Hall', 'Medical Sciences Building, 1 King’s College Circle, Toronto, ON M5S 1A8', 'Cafeteria-style food hall near the science and medical buildings.'),
      campusSpot('utsg', 'Howard Ferguson Dining Hall', 'Morrison Hall (1st Floor), 75 St. George Street, Toronto, ON M5S 2E5', 'University College all-you-care-to-eat dining hall, open to meal-plan holders and pay-as-you-go diners.'),
      campusSpot('utsg', 'New College Dining Commons', 'Wilson Hall, New College, 40 Willcocks Street, Toronto, ON M5S 1C6', 'All-you-care-to-eat residence dining commons open to the campus community.'),
      campusSpot('utsg', 'Chestnut Residence Dining Commons', 'Chestnut Residence, 89 Chestnut Street, Toronto, ON M5G 1R1', 'All-you-care-to-eat dining commons near the hospital district.'),
      campusSpot('utm', 'William G. Davis Building food court', `William G. Davis Building, ${UTM_ADDRESS}`, 'UTM’s main food court with quick-service brands and in-house options like Tex Mex and FUSION8.'),
      campusSpot('utm', 'Colman Commons (Oscar Peterson Hall)', `Oscar Peterson Hall, ${UTM_ADDRESS}`, 'UTM residence dining room with chef specials, a grab-and-go fridge, and a warm place to eat or study.'),
      campusSpot('utm', 'Deerfield Hall café', `Deerfield Hall, ${UTM_ADDRESS}`, 'Italian-inspired café with pizzas, soups, baked goods, and an Italian soda bar.'),
      campusSpot('utm', 'Maanjiwe nendamowinan Fair Trade Café', `Maanjiwe nendamowinan, ${UTM_ADDRESS}`, 'Fair Trade coffee and tea, fresh salads, sandwiches, and grab-and-go options.'),
      campusSpot('utsc', 'Student Centre food court', `Student Centre, ${UTSC_ADDRESS}`, 'UTSC food court with a wide range of vendors, plus Halal, Kosher, vegetarian, and gluten-free options.'),
      campusSpot('utsc', 'Bistro 1265', `Student Centre, ${UTSC_ADDRESS}`, 'SCSU-run restaurant in the Student Centre.'),
      campusSpot('utsc', 'Starbucks (Meeting Place)', `Meeting Place, ${UTSC_ADDRESS}`, 'Coffee and grab-and-go items in the UTSC Meeting Place.'),
      campusSpot('utsc', 'Market Place', UTSC_ADDRESS, 'On-campus food options and dining at UTSC.'),
    ], links: [
      resourceLink('U of T Food Services', 'Explore dining halls, cafés, meal plans, and where-to-eat guides across campus.', 'https://www.scsu.ca/equity-centres#food'),
      resourceLink('UTM Food Locations & Hours', 'Find dining halls, cafés, and food locations at UTM.', 'https://www.utm.utoronto.ca/hospitality/Food'),
      resourceLink('UTSC Dining', 'Find food courts, cafés, and dining options at UTSC.', 'https://www.utsc.utoronto.ca/food/where-eat-campus'),
    ] },
  },
  {
    id: 'printing', name: 'Printing & tech help',
    keywords: ['print', 'printer', 'printing', 'wireless printing', 'photocopy', 'scan', 'scanner'],
    summary: 'Print wirelessly from your laptop to campus release stations with your TCard, or get help from an IT help desk.',
    address: '', fee: 'Varies', hours: 'Varies by location', listOnly: true,
    supportResources: { title: 'Printing & tech help', intro: 'Set up wireless printing or find IT support across campus.', campusLocations: [], links: [
      resourceLink('Wireless printing', 'Set up wireless printing to release stations across campus using your TCard.', 'https://printhere.utoronto.ca/'),
      resourceLink('Information Technology Services', 'Find student help-desk contacts and IT support across all three campuses.', 'https://its.utoronto.ca/contact/'),
    ] },
  },
  {
    id: 'multi-faith', name: 'Multi-faith & prayer spaces',
    keywords: ['prayer', 'prayer space', 'pray', 'worship', 'meditation', 'meditate', 'multi-faith', 'multifaith', 'reflection space', 'quiet reflection', 'religious space'],
    summary: 'Find prayer, meditation, and reflection spaces open to all faiths across campus.',
    address: '', fee: 'Free', hours: 'Varies by location', listOnly: true,
    supportResources: { title: 'Multi-faith & prayer spaces', intro: 'Prayer, meditation, and reflection spaces open to all faiths.', campusLocations: [], links: [
      resourceLink('Multi-Faith Centre', 'Bookable rooms for prayer, worship, and spiritual practice at 569 Spadina Ave.', 'https://studentlife.utoronto.ca/department/multi-faith-centre/'),
      resourceLink('Find worship space on campus', 'See additional prayer and reflection spaces across St. George buildings.', 'https://www.studentlife.utoronto.ca/task/find-worship-space-on-campus/'),
    ] },
  },
  {
    id: 'campus-atms', name: 'ATMs & banking',
    keywords: ['atm', 'atms', 'bank machine', 'cash machine', 'where can i get cash', 'bank branch', 'banking', 'withdraw cash'],
    summary: 'Most student centres and hubs have an ATM close by. Tap a spot for directions, or use the interactive campus map to find the nearest one at any campus.',
    address: '', fee: 'Varies', hours: 'Varies by location', listOnly: true,
    supportResources: { title: 'ATMs & banking', intro: 'Common on-campus spots to find an ATM. Exact machines vary — use the interactive map to confirm the closest one.', campusHeading: 'Where to find an ATM', campusLocations: [
      campusSpot('utsg', 'Student Commons', '230 College Street, Toronto, ON M5T 1R2', 'Student hub near the St. George core with nearby banking and ATMs.'),
      campusSpot('utsg', 'Hart House', '7 Hart House Circle, Toronto, ON M5S 3H3', 'Central St. George building with ATM access nearby.'),
      campusSpot('utm', 'UTM Student Centre', UTM_ADDRESS, 'UTM student hub with ATMs on site.'),
      campusSpot('utsc', 'UTSC Student Centre', UTSC_ADDRESS, 'UTSC student hub with ATMs on site.'),
    ], links: [
      resourceLink('Interactive campus map', 'Search any campus by building or service to find the nearest ATM or bank.', 'https://map.utoronto.ca/'),
    ] },
  },
  {
    id: 'campus-recreation', name: 'Gyms & recreation',
    keywords: ['gym', 'gyms', 'workout', 'work out', 'recreation', 'athletic centre', 'athletic center', 'sport and rec', 'fitness', 'pool', 'swim', 'weight room', 'rawc', 'tpasc', 'goldring', 'varsity'],
    summary: 'Your student athletic fees include access to your campus gym and pools. Tap your campus facility for directions, or use the links to reach another campus’s facilities.',
    address: '', fee: 'Included with athletic fees', hours: 'Varies by facility', listOnly: true,
    supportResources: { title: 'Gyms & recreation', intro: 'Sport & rec facilities are included with your student athletic fees. Tap a spot for directions.', campusHeading: 'Athletic & recreation facilities', campusLocations: [
      campusSpot('utsg', 'Athletic Centre', '55 Harbord Street, Toronto, ON M5S 2W6', 'St. George gym, pools, weight rooms, and indoor courts.'),
      campusSpot('utsg', 'Goldring Centre for High Performance Sport', '100 Devonshire Place, Toronto, ON M5S 2C9', 'Strength & conditioning centre, field house, and fitness space.'),
      campusSpot('utsg', 'Varsity Centre', '299 Bloor Street West, Toronto, ON M5S 0A7', 'Field house, stadium, and arena on the St. George campus.'),
      campusSpot('utm', 'Recreation, Athletics & Wellness Centre (RAWC)', UTM_ADDRESS, 'UTM gym, pool, courts, and fitness facilities.'),
      campusSpot('utsc', 'Toronto Pan Am Sports Centre (TPASC)', '875 Morningside Avenue, Scarborough, ON M1C 0C7', 'UTSC’s world-class facility with pools, courts, and fitness spaces.'),
    ], links: [
      resourceLink('St. George Sport & Rec', 'Facilities, drop-in hours, and memberships at the St. George campus.', 'https://kpe.utoronto.ca/facilities-memberships'),
      resourceLink('UTM Recreation, Athletics & Wellness', 'Facilities, drop-in hours, and programs at UTM.', 'https://www.utm.utoronto.ca/athletics/'),
      resourceLink('UTSC Athletics & Recreation', 'Get started with athletics and recreation at UTSC and TPASC.', 'https://www.utsc.utoronto.ca/athletics/get-started-athletics-recreation'),
    ] },
  },
  {
    id: 'campus-transit-parking', name: 'Transit & parking',
    keywords: ['parking', 'park my car', 'parking permit', 'parking office', 'transit', 'shuttle', 'ttc', 'bus', 'subway', 'commute', 'drive to campus'],
    summary: 'Find your campus’s parking office for rates and permits, or plan your route with the TTC. Tap a campus office for directions, or use the links to reach another campus’s parking service.',
    address: '', fee: 'Varies', hours: 'Varies by campus', listOnly: true,
    supportResources: { title: 'Transit & parking', intro: 'Each campus runs its own parking service. Tap a parking office or lot for directions.', campusHeading: 'Parking offices & lots', campusLocations: [
      campusSpot('utsg', 'St. George Transportation Services', '563 Spadina Crescent, Toronto, ON M5S 2J7', 'Parking permits, rates, EV charging, and regulations for the St. George campus.'),
      campusSpot('utsg', 'Parking — 107 St. George (Rotman garage)', '107 St. George Street, Toronto, ON M5S 3E6', 'Gated public garage under Rotman; daily max $20, EV charging on P1.'),
      campusSpot('utsg', 'Parking — Lot C (Bahen Centre)', '40 St. George Street, Toronto, ON M5S 2E4', 'Open-air lot at the Bahen Centre; current student permit location.'),
      campusSpot('utsg', 'Parking — Landmark Garage (King’s College Circle)', '27 King’s College Circle, Toronto, ON M5S 1A1', 'Underground garage beneath King’s College Circle with EV charging.'),
      campusSpot('utsg', 'Parking — Lot I (OISE Garage)', '252 Bloor Street West, Toronto, ON M5S 1V6', 'Open-air garage at OISE near the Bloor/St. George area.'),
      campusSpot('utm', 'UTM Parking & Transportation Services', UTM_ADDRESS, 'Parking permits, rates, and shuttle information for UTM.'),
      campusSpot('utm', 'UTM Parking — Lot 4', `Lot 4, ${UTM_ADDRESS}`, 'Pay & Display visitor lot; recommended for visitors and tours.'),
      campusSpot('utm', 'UTM Parking — Lot 8', `Lot 8, ${UTM_ADDRESS}`, 'Pay & Display visitor lot; recommended for visitors and tours.'),
      campusSpot('utm', 'UTM Parking — Lot 9', `Lot 9, ${UTM_ADDRESS}`, 'Alternative visitor lot with Pay & Display machines.'),
      campusSpot('utsc', 'UTSC Parking Services', `Room IC 40 (basement), ${UTSC_ADDRESS}`, 'Parking permits, visitor rates, and prox cards for UTSC.'),
      campusSpot('utsc', 'UTSC Parking — Lot A', `Lot A, ${UTSC_ADDRESS}`, 'Short-term Pay & Display lot beside the transit bus loop.'),
      campusSpot('utsc', 'UTSC Parking — Lot G', 'Lot G, Pan Am Drive, Scarborough, ON M1C 1A4', 'Student permit and daily flat-rate lot on Pan Am Drive.'),
      campusSpot('utsc', 'UTSC Parking — Lot H', `Lot H, ${UTSC_ADDRESS}`, 'Short-term Pay & Display lot behind the Sam Ibrahim Building.'),
      campusSpot('utsc', 'UTSC Parking — East Lot (TPASC)', '875 Morningside Avenue, Scarborough, ON M1C 0C7', 'Interim East Lot near TPASC with two hours complimentary parking.'),
    ], links: [
      resourceLink('St. George Transportation Services', 'Parking rates, permits, EV charging, and regulations at the St. George campus.', 'https://transportation.utoronto.ca/'),
      resourceLink('UTM Parking & Transportation', 'Parking permits, rates, and shuttle information at UTM.', 'https://www.utm.utoronto.ca/parking/'),
      resourceLink('UTSC Parking Services', 'Permits, visitor rates, and parking information at UTSC.', 'https://www.utsc.utoronto.ca/parking/'),
      resourceLink('TTC route planner', 'Plan subway, streetcar, and bus routes around Toronto.', 'https://www.ttc.ca/', 'Government support'),
    ] },
  },
  {
    id: 'learning-support', name: 'Study skills & learning support',
    keywords: ['studying', 'study skills', 'academic skills', 'learning strategist', 'learning support', 'exam prep', 'exam preparation', 'time management', 'procrastination', 'note taking', 'writing help', 'essay help', 'assignment help'],
    summary: 'Build study, writing, time-management, and exam-preparation strategies with U of T learning strategists.',
    address: '', fee: 'Free', hours: 'By appointment', listOnly: true,
    supportResources: { title: 'Study skills & learning support', intro: 'Practical strategies for studying, writing, time management, and exams.', campusLocations: [], links: [
      resourceLink('Learning strategist appointments', 'Book one-on-one support for study habits, exam preparation, and assignment planning.', 'https://studentlife.utoronto.ca/service/learning-strategist-appointments/'),
      resourceLink('Centre for Learning Strategy Support', 'Academic-skills workshops, peer mentoring, and learning resources.', 'https://studentlife.utoronto.ca/department/centre-for-learning-strategy-support/'),
      resourceLink('Writing support', 'Writing centres, programs, and resources for writing effectively at U of T.', 'https://studentlife.utoronto.ca/task/write-effectively/'),
    ] },
  },
  {
    id: 'sexual-violence-support', name: 'Sexual Violence Support',
    keywords: ['sexual violence office', 'sexual violence', 'sexual assault', 'sexual harassment', 'svpscentre', 'svps', 'consent', 'survivor', 'rape', 'disclosure'],
    summary: 'Confidential, non-judgmental support is available for U of T community members affected by sexual violence or harassment.', address: '', fee: 'Free', hours: 'See Sexual Violence Prevention & Support Centre',
    supportResources: { title: 'Sexual violence support', intro: 'You can access confidential, non-judgmental support and learn about your options at your own pace. Choose a campus location to see it on the map.', campusHeading: 'Sexual Violence Prevention & Support Centre locations', campusLocations: [
      campusOffice('St. George Sexual Violence Prevention & Support Centre', 'Gerstein Library, Room B139, 9 King’s College Circle, Toronto, ON M5S 1A5', 'Confidential support, options, referrals, and accommodations.', CAMPUS_COORDINATES.utsg),
      campusOffice('UTSC Sexual Violence Prevention & Support Centre', 'Environmental Science and Chemistry Building, Room EV141, 1065 Military Trail, Scarborough, ON M1C 1A4', 'Confidential support, options, referrals, and accommodations.', CAMPUS_COORDINATES.utsc),
      campusOffice('UTM Sexual Violence Prevention & Support Centre', `Davis Building, Room DV3094G, ${UTM_ADDRESS}`, 'Confidential support, options, referrals, and accommodations.', CAMPUS_COORDINATES.utm),
    ], links: [
      resourceLink('Sexual Violence Prevention & Support Centre', 'Confidential support, options, referrals, accommodations, and prevention resources.', 'https://svpscentre.utoronto.ca/'),
      resourceLink('Help for sexual assault', 'Immediate-help information and support options for anyone affected by sexual assault.', 'https://www.studentlife.utoronto.ca/task/help-for-sexual-assault/'),
    ] },
  },
];
