const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { act } = require('react-test-renderer');
const installNative = require('./native.cjs');
const { render } = installNative;

const answer = { type: 'info', title: 'Academic support', summary: 'Contact your campus office.', query: 'academic support' };
const destination = { latitude: 43.66, longitude: -79.39 };
const polyline = { type: 'LineString', coordinates: [[-79.4, 43.66], [-79.39, 43.66]] };
const library = {
  type: 'location', query: 'library', title: 'Campus library', summary: 'Visit the library.',
  placeName: 'Library', placeSubtitle: 'Toronto campus', destination, fee: 'Free', hours: 'Weekdays',
};
const json = (payload, status = 200) => ({ ok: status < 400, status, json: async () => payload });

module.exports = platform => {
  const device = installNative(platform);
  const App = require('../../App.tsx').default;
  const { openExternalLink } = require('../../utils/googleMaps');
  let requests, respond;
  const start = t => render(t, App);
  const lastAlert = () => device.alerts.at(-1);
  const chooseAlert = async label => {
    const button = lastAlert()?.buttons.find(b => b.text === label);
    assert.ok(button, 'Missing alert action: ' + label);
    await act(async () => { await button.onPress(); });
  };
  const sendChat = async (app, question) => {
    await app.type('Message T-AI', question);
    await app.press('Send message to T-AI');
  };
  const fillContact = async app => {
    await app.type('First name, required', 'Demo');
    await app.type('Last name, required', 'Student');
    await app.type('Email address, required', 'student@example.org');
    await app.press('Suggestion');
    await app.type('Your inquiry, required', 'Please review the campus listing.');
  };

  describe(platform + ' student journeys', () => {
    beforeEach(t => {
      device.alerts.length = device.announcements.length = device.links.length = device.copied.length = 0;
      device.storage.clear();
      device.screenReader = true;
      device.permission = 'granted';
      device.locationRequests = device.dialerCalls = 0;
      device.linkFails = device.clipboardFails = device.dialerFails = false;
      requests = [];
      respond = () => { throw Error('Unexpected network request'); };
      t.mock.method(global, 'fetch', async (url, options) => {
        const request = { path: new URL(url).pathname, body: JSON.parse(options.body), signal: options.signal };
        requests.push(request);
        return respond(request);
      });
    });

    it('selects and restores a campus, clarifies an ambiguous question and opens urgent support from mood check-in', async t => {
      const app = await start(t);
      await app.press('Set a campus preference');
      await app.press('UTM');
      assert.ok(app.control('Campus preference: UTM'));
      const reopened = await start(t);
      assert.ok(reopened.control('Campus preference: UTM'));
      await reopened.type('Ask T-Care a question', "I'm hungry");
      await reopened.press('Ask T-Care');
      assert.ok(reopened.control('Ask my question as typed'));
      assert.equal(requests.length, 0);
      respond = () => json(answer);
      await reopened.press('Ask my question as typed');
      assert.equal(requests.at(-1).body.campus, 'utm');
      assert.ok(reopened.text(answer.summary).length);
      await reopened.press('Back to Ask');
      await reopened.press('I am feeling struggling');
      await reopened.press('Yes, I am');
      assert.ok(reopened.control('Close urgent support'));
      await reopened.press('Close urgent support');
      assert.ok(reopened.control('Ask T-Care'));
    });

    it('filters featured and directory services and keeps the search when returning from a result', async t => {
      const app = await start(t);
      await app.press('Resources');
      const search = 'Search campus resources';
      const accessibility = 'Accessibility Services. Learn about accommodations, assistive technology, and exams.';
      const mentalHealth = 'Mental Health Support. Connect with Health & Wellness for counselling and care.';
      await app.type(search, '  AcCeSSiBiLiTy  ');
      assert.ok(app.control(accessibility));
      assert.ok(!app.control(mentalHealth));
      assert.equal(app.text('No Matching Services Yet').length, 0);
      respond = () => json(library);
      await app.press(accessibility);
      assert.equal(requests.at(-1).path, '/api/accessibility-services');
      await app.press('Back to resources');
      assert.equal(app.control(search).props.value.trim(), 'AcCeSSiBiLiTy');
      await app.type(search, 'OSAP');
      assert.ok(app.control('Financial Aid & Awards. Explore awards, UTAPS, OSAP, grants, and funding support.'));
      assert.ok(!app.control(accessibility));
      await app.type(search, 'nothing-matches-this');
      assert.equal(app.text('No Matching Services Yet').length, 1);
      await app.press('Ask about this');
      assert.equal(app.control('Ask T-Care a question').props.value, 'nothing-matches-this');
      await app.press('Resources');
      await app.press('Clear search');
      assert.equal(app.control(search).props.value, '');
      assert.ok(app.control(mentalHealth));
      assert.ok(app.control('Housing & Residence. Apply for residence or get help finding a place to live.'));
    });

    it('preserves failed Ask questions and retries the original request', async t => {
      const app = await start(t);
      const question = 'Tell me about scholarships at university';
      await app.type('Ask T-Care a question', question);
      await app.press('Ask T-Care');
      respond = () => json(answer);
      await app.press('Try your question again');
      assert.deepEqual(requests.map(r => r.body.query), [question, question]);
      assert.ok(app.text(answer.summary).length);
    });

    it('opens the destination after location denial and updates map, time and walking steps after retry', async t => {
      const app = await start(t);
      let bikeAttempts = 0;
      const bikeLine = { ...polyline, coordinates: [[-79.41, 43.65], [-79.39, 43.66]] };
      respond = ({ path, body }) => {
        if (path === '/api/tcard-office') return json(library);
        assert.equal(path, '/api/route');
        if (body.mode === 'bike' && ++bikeAttempts === 1) return json({}, 503);
        return json({ travelMinutes: body.mode === 'walk' ? 12 : 5, polyline: body.mode === 'walk' ? polyline : bikeLine,
          steps: [{ instruction: 'Walk to the east entrance', distance: '100 m' }] });
      };
      await app.press('I lost my TCard');
      device.permission = 'denied';
      await app.press('Show walking route');
      await chooseAlert('Continue');
      assert.equal(device.locationRequests, 1);
      assert.equal(requests.length, 1);
      await app.press('Open destination in Maps');
      assert.match(device.links.at(-1), /destination=Library%2C%20Toronto%20campus/);
      device.permission = 'granted';
      await app.press('Show walking route');
      await chooseAlert('Continue');
      assert.ok(app.text('12 min').length);
      await app.press('Walking path, 1 steps');
      assert.ok(app.hosts(n => n.type === 'Text' && n.children.join('').includes('Walk to the east entrance')).length);
      await app.press('Bike travel mode');
      assert.ok(app.control('Walk travel mode').props.accessibilityState.selected);
      await app.press('Retry route update');
      assert.deepEqual(requests.filter(r => r.path === '/api/route').map(r => r.body.mode), ['walk', 'bike', 'bike']);
      assert.ok(app.control('Bike travel mode').props.accessibilityState.selected);
      assert.ok(app.text('5 min').length);
      assert.ok(!app.control('Walking path, 1 steps'));
      assert.equal(app.hosts(n => n.type === 'Polyline')[0].props.coordinates[0].longitude, -79.41);
    });

    it('answers accommodation questions without requesting location and announces each reply once', async t => {
      const app = await start(t);
      await app.press('Chat');
      respond = () => json(answer);
      await sendChat(app, 'How do I get accommodations?');
      assert.equal(requests.length, 1);
      assert.ok(!Object.hasOwn(requests[0].body, 'location'));
      assert.equal(device.alerts.length, 0);
      assert.deepEqual(device.announcements, ['New reply from T-AI']);
      await app.type('Message T-AI', 'Next question');
      assert.equal(device.announcements.length, 1);
      await app.press('Read latest reply');
      assert.match(device.announcements.at(-1), /Contact your campus office/);
      assert.equal(app.control('Message T-AI').props.value, 'Next question');
      await sendChat(app, 'Give me directions to the library');
      await chooseAlert('Not now');
      assert.equal(requests.length, 2);
      assert.equal(device.locationRequests, 0);
    });

    it('clarifies ambiguous chat requests without a network call', async t => {
      const app = await start(t);
      await app.press('Chat');
      await sendChat(app, "I'm hungry");
      assert.equal(requests.length, 0);
      assert.ok(app.hosts(n => n.type === 'Text' && n.children.join('').includes('Which do you need?')).length);
    });

    for (const page of ['Contact', 'Chat']) {
      it(page + ' recovers when the response body stalls, keeps the draft and can send again', async t => {
        const app = await start(t);
        await app.press(page);
        const realTimeout = global.setTimeout;
        let expire;
        t.mock.method(global, 'setTimeout', (callback, ms, ...args) => {
          if (ms !== 15_000) return realTimeout(callback, ms, ...args);
          expire = callback;
          return undefined;
        });
        respond = ({ signal }) => ({ ok: true, json: () => new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(Error('aborted')), { once: true });
        }) });
        if (page === 'Contact') {
          await app.press('Send inquiry');
          assert.ok(app.text('Enter your first name.').length);
          await fillContact(app);
          await app.press('Send inquiry');
          assert.equal(app.control('Your inquiry, required').props.editable, false);
          assert.equal(app.control('Suggestion').props.disabled, true);
          assert.equal(app.control('Send inquiry').props.disabled, true);
        } else {
          await sendChat(app, 'Tell me about academic support');
          assert.equal(app.control('Send message to T-AI').props.disabled, true);
        }
        assert.equal(typeof expire, 'function');
        await act(async () => expire());
        assert.ok(requests[0].signal.aborted);
        if (page === 'Contact') {
          assert.equal(app.control('Your inquiry, required').props.value, requests[0].body.inquiry);
          assert.ok(app.hosts(n => n.type === 'Text' && n.children.join('').includes('Delivery could not be confirmed')).length);
          respond = () => json({ ok: true }, 201);
          await app.press('Send inquiry');
          assert.equal(app.control('Your inquiry, required').props.value, '');
          assert.equal(app.control('Email address, required').props.value, '');
        } else {
          assert.equal(app.control('Message T-AI').props.value, requests[0].body.query);
          respond = () => json(answer);
          await app.press('Try your question again');
          assert.equal(app.control('Message T-AI').props.value, '');
          assert.ok(app.control('Read latest reply'));
        }
        assert.deepEqual(requests[1].body, requests[0].body);
      });
    }

    it('offers the same URL for copying when an external link fails and reports clipboard failure', async () => {
      device.linkFails = true;
      const url = 'https://example.org/campus';
      await openExternalLink(url);
      assert.equal(lastAlert().message, url);
      await chooseAlert('Copy link');
      assert.deepEqual(device.copied, [url]);
      device.clipboardFails = true;
      await openExternalLink(url);
      await chooseAlert('Copy link');
      assert.equal(lastAlert().title, 'Could not copy link');
      assert.equal(lastAlert().message, url);
    });

    it('keeps urgent support numbers selectable when phone actions fail', async t => {
      const app = await start(t);
      await app.press('Get urgent support');
      const name = 'Emergency services';
      await app.press('Copy number for ' + name);
      assert.deepEqual(device.copied, ['9-1-1']);
      device.clipboardFails = true;
      await app.press('Copy number for ' + name);
      assert.equal(lastAlert().title, 'Could not copy number');
      assert.ok(app.text('9-1-1').some(n => n.props.selectable));
      if (platform === 'android') {
        device.dialerFails = true;
        await app.press('Open blank phone dialer for ' + name);
        assert.equal(device.dialerCalls, 1);
        assert.equal(lastAlert().title, 'Could not open the dialer');
      }
      assert.deepEqual(device.links, []);
    });

    if (platform === 'android') {
      it('returns to Ask with system Back from each secondary tab', async t => {
        const app = await start(t);
        for (const tab of ['Resources', 'Chat', 'Contact']) {
          await app.press(tab);
          await act(async () => assert.equal(device.back(), true));
          assert.ok(app.control('Ask').props.accessibilityState.selected);
        }
      });
    }
  });
};

