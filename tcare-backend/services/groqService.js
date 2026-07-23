// services/groqService.js
//
// Uses Groq's OpenAI-compatible chat completions endpoint.
// Docs: https://console.groq.com/docs/quickstart
//
// No SDK needed — Groq's API matches OpenAI's request/response shape,
// so a plain fetch() call works fine and keeps this dependency-free.

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Ask Groq to pick the best-matching service (or none) for a student's
 * query, and to write a short, calm, plain-language summary.
 *
 * @param {string} query - the student's raw text
 * @param {Array} services - the services list from data/services.js
 * @returns {Promise<{ serviceId: string|null, title: string, summary: string, destination?: string|null }>}
 */
async function classifyQuery(query, services) {
  if (/^(hi|hello|hey|good (morning|afternoon|evening))[!,.?\s]*$/i.test(query.trim())) {
    return {
      serviceId: null,
      title: 'Hi, how can I help?',
      summary:
        'I can help you find TCard, accessibility, wellness, and study-support services. What would you like to know?',
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
- Treat greetings such as "hello" as valid. Reply warmly and invite the student to ask about TCards, accessibility, wellness, or study support. Use serviceId null.
- For a matching service, give a direct answer with a useful next step. If the student asks where or how to get there, include the exact address and relevant hours from that service's details.
- Accessibility Services and Health & Wellness have campus-specific in-person offices. Do not imply that the St. George office is the only option; the app will show either the nearby campus office or all three campus offices with addresses.
- Use only the facts supplied above for service-specific claims. Do not invent a location, hours, fee, policy, or route.
- When the student explicitly asks for directions, a route, a map, or how to get to a place, set "destination" to the location they want. Prefer the matching service's exact address when there is one. For another clearly named place, use that place name exactly as the student described it, adding "Toronto, ON" only when needed for clarity. Otherwise use null. Do not put a destination in a response that is not asking for directions.
- If no service fits, do not call the question invalid. Give a brief, supportive response and offer the areas T-AI can help with.
- Keep the summary concise but useful: 2-4 short sentences, at most 90 words.

Respond with ONLY valid JSON, no markdown or preamble, in this exact shape:
{"serviceId": "<id or null>", "title": "<short, helpful title>", "summary": "<helpful answer>", "destination": "<address/place or null>"}`;

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
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() ?? '{}';

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Groq returned non-JSON content: ${raw}`);
  }
}

module.exports = { classifyQuery };
