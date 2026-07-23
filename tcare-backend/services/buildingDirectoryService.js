const buildings = require('../data/buildings');

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[’'.,!?()/-]/g, ' ')
    .replace(/\b(room|building|hall|centre|center|the|where|is|how|do|i|get|to|directions?|map)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesPhrase(query, phrase) {
  const normalizedPhrase = normalize(phrase);
  if (!normalizedPhrase) return false;
  return new RegExp(`(^|\\s)${normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=\\s|$)`).test(query);
}

function matchesCode(rawQuery, code) {
  const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const appearsAsUppercaseCode = new RegExp(`(^|\\W)${escapedCode}(?=$|\\W)`).test(rawQuery);
  const appearsWithRoomNumber = new RegExp(`(^|\\W)${escapedCode}\\s*[- ]?\\d`, 'i').test(rawQuery);
  // Short codes such as "em" and "ah" can also be ordinary prose. Accept
  // their lowercase form only when the student is clearly asking for a place,
  // while continuing to accept timetable-style codes such as "ss 1083".
  const asksForLocation = /\b(where(?:['’]s| is)|location|directions?|map|route|how (?:do|can) i get|how to get|get to|go to|walk to|find)\b/i.test(rawQuery);
  const appearsInLocationQuestion = asksForLocation
    && new RegExp(`(^|\\W)${escapedCode}(?=$|\\W)`, 'i').test(rawQuery);

  return appearsAsUppercaseCode || appearsWithRoomNumber || appearsInLocationQuestion;
}

function findBuilding(query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  const nameMatch = buildings.find((building) =>
    [building.name, ...building.aliases].some((phrase) => matchesPhrase(normalizedQuery, phrase)),
  );
  if (nameMatch) return nameMatch;

  const codeMatches = buildings.filter((building) => matchesCode(query, building.code));
  if (codeMatches.length < 2) return codeMatches[0] ?? null;

  const campusMarker = /\b(utsc|scarborough)\b/i.test(query)
    ? 'Scarborough'
    : /\b(utm|mississauga)\b/i.test(query)
      ? 'Mississauga'
      : /\b(utsg|st\.?\s*george)\b/i.test(query)
        ? 'Toronto'
        : null;
  return codeMatches.find((building) => !campusMarker || building.address.includes(campusMarker))
    ?? codeMatches[0];
}

function formatBuildingSummary(building) {
  return `${building.name}${building.code ? ` (${building.code})` : ''} is at ${building.address}.`;
}

module.exports = { findBuilding, formatBuildingSummary };
