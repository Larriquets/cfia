import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const ILLUS_KINDS = ['orbit', 'target', 'signal', 'horizon'];

const SYSTEM_PROMPT = `Sos un autor de ciencia ficción breve. Escribís cuentos cortos, literarios, con tono introspectivo — estilo Ted Chiang, Ursula K. Le Guin, Ken Liu. Nada de exposición pesada ni pirotecnia pulp.

Devolvés SIEMPRE un único objeto JSON válido, sin markdown, sin texto antes ni después, con esta forma exacta:

{
  "titleEs": "string (2-6 palabras, evocativo)",
  "titleEn": "string (traducción literaria, no literal)",
  "excerptEs": "string (1 frase, 15-25 palabras, hook)",
  "excerptEn": "string (traducción literaria del excerpt)",
  "bodyEs": ["parrafo1", "parrafo2", "..."],
  "bodyEn": ["paragraph1", "paragraph2", "..."],
  "minutes": number (tiempo de lectura estimado, 3-12),
  "illus": "orbit" | "target" | "signal" | "horizon"
}

Reglas:
- bodyEs y bodyEn: entre 4 y 8 párrafos cada uno. Deben ser la MISMA historia, no versiones distintas.
- Nunca uses comillas triples ni bloques de código. Solo JSON puro.
- Los títulos y excerpts NO deben ser traducciones palabra por palabra — adaptá para que suenen naturales en cada idioma.
- illus: elegí el que mejor coincida con la atmósfera (orbit=espacio/planetas, target=contacto/precisión, signal=comunicación/lenguaje, horizon=memoria/exoplanetas).`;

function buildUserPrompt({ tags, temp, prompt }) {
  const tagList = (tags || []).map((t) => t.toUpperCase()).join(', ');
  const parts = [];
  if (tagList) parts.push(`Tags temáticos: ${tagList}.`);
  if (prompt && prompt.trim()) parts.push(`Semilla/idea: ${prompt.trim()}`);
  parts.push(`Escribí un cuento que respete esos tags como anclas temáticas.`);
  return parts.join('\n\n');
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object in response');
  return JSON.parse(text.slice(start, end + 1));
}

function validate(obj) {
  const req = ['titleEs', 'titleEn', 'excerptEs', 'excerptEn', 'bodyEs', 'bodyEn', 'minutes', 'illus'];
  for (const k of req) if (obj[k] === undefined) throw new Error(`Missing field: ${k}`);
  if (!Array.isArray(obj.bodyEs) || !Array.isArray(obj.bodyEn)) throw new Error('body* must be arrays');
  if (!ILLUS_KINDS.includes(obj.illus)) obj.illus = 'orbit';
  if (typeof obj.minutes !== 'number') obj.minutes = 5;
  return obj;
}

export async function generateStory({ tags = [], model = 'claude-sonnet-4-5', temp = 0.9, prompt = '' }) {
  const resp = await client.messages.create({
    model,
    max_tokens: 4096,
    temperature: temp,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt({ tags, temp, prompt }) }],
  });
  const text = resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const parsed = validate(extractJson(text));
  return { ...parsed, slugBase: slugify(parsed.titleEs) };
}
