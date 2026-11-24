const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Short campus acronyms can be valid even with no vowels.
const KNOWN_TERMS = new Set([
  'ttc', 'utm', 'utsc', 'utsg', 'atm', 'atms', 'osap', 'uhip', 'gym', 'gyms',
  'id', 'tcard', 'acorn', 'utorid', 'wifi', 'it', 'cv', 'faq',
]);

function looksUnreadable(text) {
  const letters = text.replace(/[^a-zA-Z]/g, '').length;
  const length = text.replace(/\s/g, '').length;
  if (!letters || (length >= 4 && letters / length < 0.4)) return true;

  return !text.split(/\s+/).some((token) => {
    const word = token.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (!word) return false;
    return word.length <= 2 || KNOWN_TERMS.has(word) || (/[aeiouy]/.test(word) && !/[^aeiouy]{5,}/.test(word));
  });
}

// A single, friendly "please rephrase" answer used whenever a prompt is
// nonsensical, off-topic, or the AI is momentarily unavailable. It is a normal
// info result (never an error), so the app shows guidance instead of a
// request-error/recovery screen.
function invalidPromptResult() {
  return {
    serviceId: null,
    unclear: true,
    title: 'Invalid prompt',
    summary:
      'That doesn\u2019t look like something I can help with. Please enter an appropriate, on-topic question about U of T student life \u2014 for example \u201cI lost my TCard\u201d, \u201cwhere can I eat on campus\u201d, \u201cI need someone to talk to\u201d, or \u201chelp with my courses.\u201d I can point you to TCards, wellbeing, accessibility, academics, money, housing, international support, safety, careers, libraries, and food.',
  };
}

function normalizeWord(word) {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function editDistance(left, right) {
  const matrix = Array.from({ length: left.length + 1 }, () => (
    Array.from({ length: right.length + 1 }, (_, index) => index)
  ));

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    matrix[leftIndex][0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      matrix[leftIndex][rightIndex] = Math.min(
        matrix[leftIndex - 1][rightIndex] + 1,
        matrix[leftIndex][rightIndex - 1] + 1,
        matrix[leftIndex - 1][rightIndex - 1] + substitutionCost,
      );

      // Treat an adjacent transposition as one typo ("fodo" -> "food").
      if (
        leftIndex > 1
        && rightIndex > 1
        && left[leftIndex - 1] === right[rightIndex - 2]
        && left[leftIndex - 2] === right[rightIndex - 1]
      ) {
        matrix[leftIndex][rightIndex] = Math.min(
          matrix[leftIndex][rightIndex],
          matrix[leftIndex - 2][rightIndex - 2] + 1,
        );
      }
    }
  }

  return matrix[left.length][right.length];
}

function fuzzyKeywordScore(query, keyword) {
  const keywordWords = keyword.split(/\s+/).map(normalizeWord).filter(Boolean);
  if (keywordWords.length !== 1 || keywordWords[0].length < 3) return 0;

  const queryWords = query.split(/\s+/).map(normalizeWord).filter(Boolean);
  const keywordWord = keywordWords[0];
  const match = queryWords.find((queryWord) => (
    queryWord.length >= 3
    && Math.abs(queryWord.length - keywordWord.length) <= 1
    && editDistance(queryWord, keywordWord) === 1
  ));

  return match ? Math.max(1, keywordWord.length - 1) * 0.5 : 0;
}

async function classifyQuery(query, services) {
  const normalizedQuery = query.trim();
  if (/^(?:hi|hello|hey|good (?:morning|afternoon|evening)|i need (?:some )?help|can you help(?: me)?|help me)[!,.?\s]*$/i.test(normalizedQuery)) {
    return {
      serviceId: null,
      title: 'Hi, how can I help?',
      summary:
        'Tell me what you need help with. I can connect you with a U of T resource for TCards, wellbeing, accessibility, academics, money, housing, international support, safety, careers, libraries, food, or sexual violence support.',
    };
  }

  // Catch keyboard-mashing and other unreadable input before spending an AI
  // call on it. We answer with friendly guidance rather than an error so the
  // student sees what they can actually ask for.
  if (looksUnreadable(normalizedQuery)) {
    return invalidPromptResult();
  }

  const queryForMatching = normalizedQuery.toLowerCase();
  const keywordAppearsInQuery = (keyword) => {
    const escapedKeyword = keyword
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\s+/g, '\\s+');
    return new RegExp(`(^|\\W)${escapedKeyword}(?=$|\\W)`, 'i').test(queryForMatching);
  };
  const keywordMatch = services
    .map((service) => ({
      service,
      score: service.keywords.reduce(
        (score, keyword) => score
          + (keywordAppearsInQuery(keyword)
            ? keyword.length
            : fuzzyKeywordScore(queryForMatching, keyword)),
        0,
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)[0]?.service;

  if (keywordMatch) {
    return {
      serviceId: keywordMatch.id,
      title: keywordMatch.name,
      summary: keywordMatch.summary,
      destination: null,
    };
  }

  const serviceList = services
    .map(
      (s) =>
        `- id: "${s.id}"\n  name: "${s.name}"\n  details: "${s.summary}"\n  address: "${s.address}"\n  hours: "${s.hours}"\n  fee: "${s.fee}"`,
    )
    .join('\n');

  const systemPrompt = `You are T-AI, a warm, practical assistant for University of Toronto students. Answer the student's message helpfully, then identify the single best service from the supplied list when one applies.

Available services (these are the only source of facts about their locations, hours, fees, and processes):
${serviceList}

Response rules:
- Treat greetings such as "hello" as valid. Reply warmly and invite the student to ask about TCards, wellbeing, accessibility, academics, finances, housing, international support, safety, careers, libraries, food, or sexual violence support. Use serviceId null.
- For a matching service, give a direct answer with a useful next step. If the student asks where or how to get there, include the exact address and relevant hours from that service's details.
- Accessibility Services and Health & Wellness have campus-specific in-person offices. Do not imply that the St. George office is the only option; the app will show either the nearby campus office or all three campus offices with addresses.
- Use only the facts supplied above for service-specific claims. Do not invent a location, hours, fee, policy, or route.
- When the student explicitly asks for directions, a route, a map, or how to get to a place, set "destination" to the location they want. Prefer the matching service's exact address when there is one. For another clearly named place, use that place name exactly as the student described it, adding "Toronto, ON" only when needed for clarity. Otherwise use null. Do not put a destination in a response that is not asking for directions.
- If a real campus need has no matching service, do not call the question invalid. Give a brief, supportive response and offer the areas T-AI can help with. Use serviceId null.
- If the message is off-topic for a U of T student helper (for example weather, sports scores, celebrities, general trivia, coding help, or math homework), do not answer it. Politely say that you focus on University of Toronto student life and campus services, then invite them to ask about something like TCards, wellbeing, academics, money, housing, food, safety, or getting around. Keep it warm and one or two sentences. Use serviceId null and destination null.
- Keep the summary concise but useful: 2-4 short sentences, at most 90 words.

Respond with ONLY valid JSON, no markdown or preamble, in this exact shape:
{"serviceId": "<id or null>", "title": "<short, helpful title>", "summary": "<helpful answer>", "destination": "<address/place or null>"}`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      // A 4xx here almost always means the prompt itself was rejected (for
      // example flagged or unprocessable content). Guide the student to
      // rephrase instead of surfacing a request error.
      if (response.status >= 400 && response.status < 500) {
        console.warn(`Groq rejected the prompt (${response.status}): ${errText}`);
        return invalidPromptResult();
      }
      throw new Error(`Groq API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() ?? '{}';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      // The model returned something we can't read for this prompt. Rather than
      // erroring out, ask the student to enter an appropriate, on-topic question.
      console.warn(`Groq returned non-JSON content: ${raw}`);
      return invalidPromptResult();
    }

    // Guard against an empty/blank AI answer so the app never shows a bare or
    // confusing result for a nonsensical prompt.
    if (!parsed || typeof parsed !== 'object' || (!parsed.serviceId && !String(parsed.summary ?? '').trim())) {
      return invalidPromptResult();
    }
    return parsed;
  } catch (err) {
    // Network/transport failures against the AI should not become a request
    // error for a nonsensical prompt; keep the app on friendly guidance. Only
    // genuine connectivity errors (not our thrown API errors) reach here.
    if (err instanceof Error && err.message.startsWith('Groq API error')) {
      throw err;
    }
    console.warn('Groq request failed:', err.message);
    return invalidPromptResult();
  }
}

module.exports = { classifyQuery };
