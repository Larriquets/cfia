import { GoogleGenAI } from '@google/genai';
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  extractJson,
  validate,
  slugify,
} from './generate.js';
import {
  titleHasBannedWord,
  titleRepeatsOverused,
  buildTitleGuardNote,
  buildRetryNote,
} from './titleGuard.js';
import { pickCreativityKnobs, buildCreativityNote } from './creativityKnobs.js';

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
  try {
    return validate(extractJson(text));
  } catch (e) {
    const finishReason = resp?.candidates?.[0]?.finishReason || 'unknown';
    console.error(`[gemini] parse failed — finishReason=${finishReason} text_len=${text.length} error=${e.message}`);
    console.error(`[gemini] tail: …${text.slice(-200)}`);
    throw new Error(`${e.message} (finishReason=${finishReason}, len=${text.length})`);
  }
}

export async function generateStoryGemini({
  tags = [],
  model = 'gemini-2.5-flash',
  temp = 0.9,
  prompt = '',
  length = 'medium',
  recentTitles = [],
  overusedWords = [],
  knobs = null,
  contextBlock = '',
  extraUser = '',
}) {
  const userPrompt = buildUserPrompt({ tags, prompt, length, extraUser });
  const guardNote = buildTitleGuardNote({ recentTitles, overused: overusedWords });
  const activeKnobs = knobs || pickCreativityKnobs();
  const creativityNote = buildCreativityNote(activeKnobs);
  const extra = contextBlock + guardNote + creativityNote;
  let parsed = await callModel({ model, temp, userPrompt, extraSystem: extra });

  const banned = titleHasBannedWord(parsed) ? 'último/last' : null;
  const repeated = !banned ? titleRepeatsOverused(parsed, overusedWords) : null;

  if (banned || repeated) {
    const retryNote = buildRetryNote({ bannedWord: banned, repeatedWord: repeated });
    parsed = await callModel({ model, temp, userPrompt, extraSystem: extra + retryNote });
  }

  return { ...parsed, slugBase: slugify(parsed.titleEs), knobs: activeKnobs };
}
