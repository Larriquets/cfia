import { GoogleGenAI } from '@google/genai';
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  extractJson,
  validate,
  slugify,
  titleHasBan,
} from './generate.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function extractText(resp) {
  const t = resp?.text;
  if (typeof t === 'string' && t.trim()) return t;
  if (typeof t === 'function') {
    try { const v = t.call(resp); if (typeof v === 'string' && v.trim()) return v; } catch {}
  }
  const cand = resp?.candidates?.[0];
  const parts = cand?.content?.parts || [];
  const joined = parts.map((p) => p?.text || '').join('').trim();
  if (joined) return joined;
  const reason = cand?.finishReason || resp?.promptFeedback?.blockReason || 'unknown';
  const safety = cand?.safetyRatings || resp?.promptFeedback?.safetyRatings;
  const hint = safety ? ` safety=${JSON.stringify(safety)}` : '';
  throw new Error(`Gemini returned empty response (finishReason=${reason})${hint}`);
}

async function callModel({ model, temp, userPrompt, extraSystem = '' }) {
  const resp = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT + extraSystem,
      temperature: temp,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  });
  const text = extractText(resp);
  return validate(extractJson(text));
}

export async function generateStoryGemini({
  tags = [],
  model = 'gemini-2.5-flash',
  temp = 0.9,
  prompt = '',
  length = 'medium',
}) {
  const userPrompt = buildUserPrompt({ tags, prompt, length });
  let parsed = await callModel({ model, temp, userPrompt });

  if (titleHasBan(parsed)) {
    const retryNote =
      '\n\nIMPORTANTE: En el intento anterior el título contenía "último/última/last" — palabras PROHIBIDAS en el título. Generá un título totalmente distinto, con otro ángulo (objeto concreto, gesto, número, lugar, nombre propio inventado). NO uses superlativos.';
    parsed = await callModel({ model, temp, userPrompt, extraSystem: retryNote });
  }

  return { ...parsed, slugBase: slugify(parsed.titleEs) };
}
