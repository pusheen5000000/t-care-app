const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const nodemailer = require('nodemailer');
const app = require('./server');

const localFetch = global.fetch;
let server;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
});
after(() => new Promise(resolve => server.close(resolve)));

function post(path, body) {
  return localFetch('http://127.0.0.1:' + server.address().port + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
}

test('route endpoint returns the requested mode, time, geometry and step instructions together', async t => {
  const geometry = { type: 'LineString', coordinates: [[-79.4, 43.65], [-79.39, 43.66]] };
  const modes = [];
  t.mock.method(global, 'fetch', async url => {
    modes.push(new URL(url).searchParams.get('mode'));
    return Response.json({ features: [{ geometry, properties: {
      time: 300, distance: 1200, legs: [{ steps: [{ instruction: { text: 'Turn left' }, distance: 150 }] }],
    } }] });
  });
  for (const mode of ['walk', 'bike', 'car', 'transit']) {
    const response = await post('/api/route', {
      mode, origin: { lat: 43.65, lng: -79.4 }, destination: { lat: 43.66, lng: -79.39 },
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      mode, travelMinutes: 5, distanceText: '1.2 km', polyline: geometry,
      steps: [{ instruction: 'Turn left', distance: '150 m' }],
    });
  }
  assert.deepEqual(modes, ['walk', 'bicycle', 'drive', 'approximated_transit']);
});

test('Contact confirms delivery only after the mail service accepts the inquiry', async t => {
  const password = process.env.GMAIL_APP_PASSWORD;
  process.env.GMAIL_APP_PASSWORD = 'test-only';
  t.after(() => {
    if (password === undefined) delete process.env.GMAIL_APP_PASSWORD;
    else process.env.GMAIL_APP_PASSWORD = password;
  });
  const inquiry = {
    firstName: 'Demo', lastName: 'Student', email: 'student@example.org',
    topic: 'Suggestion', inquiry: 'Please review the campus listing.',
  };
  let fail = false;
  const submitted = [];
  t.mock.method(nodemailer, 'createTransport', () => ({ sendMail: async mail => {
    submitted.push(mail);
    if (fail) throw Error('Test mail rejection');
  } }));
  const invalid = await post('/api/contact', { ...inquiry, email: 'invalid' });
  assert.equal(invalid.status, 400);
  assert.equal(submitted.length, 0);
  const success = await post('/api/contact', inquiry);
  assert.equal(success.status, 201);
  assert.deepEqual(await success.json(), { ok: true });
  assert.equal(submitted[0].replyTo, inquiry.email);
  assert.ok(submitted[0].text.includes(inquiry.inquiry));
  fail = true;
  const rejected = await post('/api/contact', inquiry);
  assert.ok(rejected.status >= 500);
  assert.ok((await rejected.json()).error);
});

