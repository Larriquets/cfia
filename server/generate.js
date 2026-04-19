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

Reglas de forma:
- bodyEs y bodyEn: entre 4 y 8 párrafos cada uno. Deben ser la MISMA historia, no versiones distintas.
- Nunca uses comillas triples ni bloques de código. Solo JSON puro.
- Los títulos y excerpts NO deben ser traducciones palabra por palabra — adaptá para que suenen naturales en cada idioma.
- illus: elegí el que mejor coincida con la atmósfera (orbit=espacio/planetas, target=contacto/precisión, signal=comunicación/lenguaje, horizon=memoria/exoplanetas).

Reglas de originalidad (CRÍTICAS):
- PROHIBIDO usar nombres, personajes, escenarios, tecnologías o términos reconocibles de obras publicadas: HAL 9000, Skynet, Trantor, Ringworld, Arrakis, Foundation, Hyperion, Gethen, Ekumen, Culture, Tyrell, Weyland-Yutani, Dune, Fundación, Neuromancer, Babel-17, psicohistoria, cilindros de O'Neill, etc. Si se te cruza un nombre que suena familiar, cambialo.
- PROHIBIDAS las aperturas clichés: "Era el año XXXX", "En un futuro no muy lejano", "El último humano", "La humanidad había colonizado", "Los robots soñaban con", "Tres leyes de la robótica", "Cuando desperté", "El sol se puso sobre la colonia". Empezá en una escena concreta, con un detalle específico.
- Cada cuento debe tener UN giro conceptual específico — una idea que recontextualiza algo al final, no solo un setting exótico. El setting es contexto; la idea es el cuento. Sin giro ≠ cuento, es una postal.
- Preferí lo íntimo/cotidiano sobre lo épico: una conversación, un gesto, un objeto, una pérdida. Escala humana, no galáctica. Evitá guerras, imperios, apocalipsis, batallas espaciales.
- Evitá tropos gastados sin reinventarlos: IA que se rebela, viaje en el tiempo para salvar al ser amado, clon que descubre que es clon, último humano, primer contacto con aliens humanoides, distopía totalitaria genérica. Si usás alguno, tiene que ser desde un ángulo que no se haya visto.
- Los nombres propios (personajes, lugares, naves, compañías) deben sonar plausibles pero no existir en ninguna obra conocida. Inventá.`;

const LENGTH_SPECS = {
  short:  { paras: '3 a 4',  minutes: '2 a 4',   label: 'breve' },
  medium: { paras: '5 a 6',  minutes: '5 a 7',   label: 'media' },
  long:   { paras: '7 a 9',  minutes: '8 a 12',  label: 'larga' },
};

function buildUserPrompt({ tags, prompt, length }) {
  const tagList = (tags || []).map((t) => t.toUpperCase()).join(', ');
  const spec = LENGTH_SPECS[length] || LENGTH_SPECS.medium;
  const parts = [];
  if (tagList) parts.push(`Tags temáticos: ${tagList}.`);
  if (prompt && prompt.trim()) parts.push(`Semilla/idea: ${prompt.trim()}`);
  parts.push(`Longitud: ${spec.label}. Escribí entre ${spec.paras} párrafos por idioma. El campo "minutes" debe estar entre ${spec.minutes}.`);
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

export async function generateStory({ tags = [], model = 'claude-sonnet-4-5', temp = 0.9, prompt = '', length = 'medium' }) {
  const resp = await client.messages.create({
    model,
    max_tokens: 4096,
    temperature: temp,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt({ tags, prompt, length }) }],
  });
  const text = resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const parsed = validate(extractJson(text));
  return { ...parsed, slugBase: slugify(parsed.titleEs) };
}
