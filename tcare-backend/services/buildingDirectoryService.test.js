const test = require('node:test');
const assert = require('node:assert/strict');
const { findBuilding, formatBuildingSummary } = require('./buildingDirectoryService');

test('finds a building by its full name', () => {
  const building = findBuilding('Where is the Bahen Centre?');
  assert.equal(building?.code, 'BA');
  assert.match(formatBuildingSummary(building), /40 St\. George Street/);
});

test('finds a timetable-style building code with a room number', () => {
  const building = findBuilding('How do I get to SS 1083?');
  assert.equal(building?.name, 'Sidney Smith Hall');
});

test('finds St. Michael\'s building codes in a natural-language location question', () => {
  assert.equal(findBuilding("Where's em?")?.name, 'Emmanuel College');
  assert.equal(findBuilding('Where’s em?')?.name, 'Emmanuel College');
  assert.equal(findBuilding('Where is AH?')?.name, 'Muzzo Family Alumni Hall');
});

test('uses the named campus to disambiguate a shared building code', () => {
  const building = findBuilding('Where is UTSC AC 213?');
  assert.equal(building?.name, 'Academic Resource Centre');
});

test('does not treat ordinary prose as a building code', () => {
  assert.equal(findBuilding('I need to talk to someone about my courses'), null);
});
