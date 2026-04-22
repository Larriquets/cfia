import OpenAI from 'openai';
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

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function extractText(resp) {
  const choice = resp?.choices?.[0];
  const msg = choice?.message;
  if (typeof msg?.content === 'string' && msg.content.trim()) return msg.content;
  if (Array.isArray(msg?.content)) {
    const joined = msg.content.map((p) => (typeof p === 'string' ? p : p?.text || '')).join('').trim();
    if (joined) return joined;
  }
  const reason = choice?.finish_reason || 'unknown';
  throw new Error(`OpenAI returned empty response (finish_reason=${reason})`);
}

async function callModel({ model, temp, userPrompt, extraSystem = '' }) {
  const resp = await client.chat.completions.create({
    model,
    temperature: temp,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + extraSystem },
      { role: 'user', content: userPrompt },
    ],
  });
  const text = extractText(resp);
  try {
    return validate(extractJson(text));
  } catch (e) {
    const finishReason = resp?.choices?.[0]?.finish_reason || 'unknown';
    console.error(`[openai] parse failed — finish_reason=${finishReason} text_len=${text.length} error=${e.message}`);
    console.error(`[openai] tail: …${text.slice(-200)}`);
    throw new Error(`${e.message} (finish_reason=${finishReason}, len=${text.length})`);
  }
}

export async function generateStoryOpenAI({
  tags = [],
  model = 'gpt-4o',
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
