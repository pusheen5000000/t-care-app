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
 * @returns {Promise<{ serviceId: string|null, title: string, summary: string }>}
 */
async function classifyQuery(query, services) {
  const serviceList = services
    .map((s) => `- id: "${s.id}", name: "${s.name}"`)
    .join('\n');

  const systemPrompt = `You are T-Care, a calm and supportive assistant that helps university students find the right campus support service. 

Given a student's message, choose the single best-matching service from this list, or "none" if nothing fits:
${serviceList}

Respond with ONLY valid JSON, no markdown, no preamble, in this exact shape:
{"serviceId": "<id or null>", "title": "<short 3-6 word title>", "summary": "<1-2 calm, plain-language sentences, max 40 words>"}`;

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
