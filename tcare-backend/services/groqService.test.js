const test = require('node:test');
const assert = require('node:assert/strict');
const services = require('../data/services');
const { classifyQuery } = require('./groqService');

test('every example shown for an invalid prompt resolves locally', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', () => {
    throw new Error('Suggested prompts should use the campus directory');
  });
  const guidance = await classifyQuery('?!?!', services);
  const examples = Array.from(guidance.summary.matchAll(/“([^”]+)”/g), match => match[1]);
  const expected = ['tcard-office', 'campus-dining', 'health-wellness', 'academic-success'];
  assert.equal(examples.length, expected.length);
  for (const [index, prompt] of examples.entries()) {
    const answer = await classifyQuery(prompt, services);
    assert.equal(answer.serviceId, expected[index], prompt);
  }
  assert.equal(fetch.mock.callCount(), 0);
});
