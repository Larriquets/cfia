import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const ILLUS_KINDS = ['orbit', 'target', 'signal', 'horizon', 'generative'];
const SHAPE_TYPES = ['line', 'circle', 'rect', 'polyline', 'polygon'];
const SHAPE_COLORS = ['fg', 'amber', 'bg'];

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
  "illus": "generative",
  "illusData": { "shapes": [ ...primitivas SVG... ] }
}

ILUSTRACIÓN GENERATIVA (illusData):
Sos también un ilustrador brutalist minimalista. Cada cuento lleva UNA ilustración abstracta dibujada con primitivas SVG. Devolvé un objeto con "shapes": array de 4 a 18 primitivas que compongan una imagen evocativa de la atmósfera/concepto central del cuento (no ilustra la trama literal — captura el TONO).

Sistema de coordenadas: todos los valores x/y/w/h/r son NORMALIZADOS entre 0 y 1 (0,0 = arriba-izq; 1,1 = abajo-der). El renderer los multiplica por el tamaño del canvas.

Formato de cada shape (elegí uno de estos tipos):
- { "type": "line",     "x1": n, "y1": n, "x2": n, "y2": n, "stroke": "fg"|"amber"|"bg", "strokeWidth": n }
- { "type": "circle",   "cx": n, "cy": n, "r": n, "stroke": "fg"|"amber"|"bg", "fill": "fg"|"amber"|"bg"|null, "strokeWidth": n }
- { "type": "rect",     "x": n, "y": n, "w": n, "h": n, "stroke": "fg"|"amber"|"bg", "fill": "fg"|"amber"|"bg"|null, "strokeWidth": n }
- { "type": "polyline", "points": [[n,n],[n,n],...], "stroke": "fg"|"amber"|"bg", "strokeWidth": n }
- { "type": "polygon",  "points": [[n,n],[n,n],...], "stroke": "fg"|"amber"|"bg", "fill": "fg"|"amber"|"bg"|null, "strokeWidth": n }

Paleta (SOLO estos 3 valores):
- "fg"    = crema sobre fondo negro (color principal para líneas)
- "amber" = ámbar dorado (acento, usalo en UN solo shape clave)
- "bg"    = negro (para "borrar" dentro de una forma, raro)

Reglas estéticas OBLIGATORIAS:
- Estilo: brutalist editorial, tipo Saul Bass / cartografía / diagrama técnico / partitura espacial. Geométrico, silencioso, misterioso.
- Usá entre 4 y 18 shapes. Menos suele ser más.
- strokeWidth típico entre 0.5 y 2. Nada grueso.
- Dejá aire. No llenes el canvas. Composición asimétrica > centrada.
- Un ÚNICO elemento ámbar como foco visual — el resto en fg.
- NO uses texto, NO uses gradientes, NO uses curvas Bézier complejas (solo las primitivas listadas).
- NO dibujes cosas literales (astronauta, planeta con cráteres, cara de robot). Abstraé: círculos concéntricos, líneas radiales, trayectorias, grillas rotas, horizontes, constelaciones, ondas, intersecciones.

Reglas de forma:
- bodyEs y bodyEn: entre 4 y 8 párrafos cada uno. Deben ser la MISMA historia, no versiones distintas.
- Nunca uses comillas triples ni bloques de código. Solo JSON puro.
- Los títulos y excerpts NO deben ser traducciones palabra por palabra — adaptá para que suenen naturales en cada idioma.
- illus: siempre "generative" (la ilustración la componés vos en illusData).

Reglas de originalidad (CRÍTICAS):
- PROHIBIDO en los títulos (ES y EN): las palabras "último/última/últimos/últimas" y "last", y las fórmulas "El último X" / "La última X" / "The Last X". Son cliché de SF y las estás usando demasiado. Buscá otro ángulo: un objeto concreto, un gesto, un número, un lugar, un tiempo del día, una textura, un nombre propio inventado. Títulos tipo "Horizonte menor", "Tres relojes en la estación", "La casa de mi abuela en Ío", "Protocolo de despedida" — específicos, no superlativos.
- Evitá también en títulos los superlativos fáciles y las aperturas adjetivales: "El primer/La primera", "El único", "El final de", "La muerte de", "El día que", "Cuando los". Preferí sustantivos concretos o frases elípticas.
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

function clamp01(v) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function sanitizeShapes(shapes) {
  if (!Array.isArray(shapes)) return null;
  const out = [];
  for (const s of shapes.slice(0, 40)) {
    if (!s || !SHAPE_TYPES.includes(s.type)) continue;
    const stroke = SHAPE_COLORS.includes(s.stroke) ? s.stroke : 'fg';
    const fill = SHAPE_COLORS.includes(s.fill) ? s.fill : null;
    const strokeWidth = typeof s.strokeWidth === 'number' ? Math.max(0.25, Math.min(4, s.strokeWidth)) : 1;
    if (s.type === 'line') {
      out.push({ type: 'line', x1: clamp01(s.x1), y1: clamp01(s.y1), x2: clamp01(s.x2), y2: clamp01(s.y2), stroke, strokeWidth });
    } else if (s.type === 'circle') {
      out.push({ type: 'circle', cx: clamp01(s.cx), cy: clamp01(s.cy), r: clamp01(s.r), stroke, fill, strokeWidth });
    } else if (s.type === 'rect') {
      out.push({ type: 'rect', x: clamp01(s.x), y: clamp01(s.y), w: clamp01(s.w), h: clamp01(s.h), stroke, fill, strokeWidth });
    } else if ((s.type === 'polyline' || s.type === 'polygon') && Array.isArray(s.points)) {
      const pts = s.points.slice(0, 20).map((p) => [clamp01(p?.[0]), clamp01(p?.[1])]);
      if (pts.length >= 2) out.push({ type: s.type, points: pts, stroke, fill: s.type === 'polygon' ? fill : null, strokeWidth });
    }
  }
  return out.length ? out : null;
}

function validate(obj) {
  const req = ['titleEs', 'titleEn', 'excerptEs', 'excerptEn', 'bodyEs', 'bodyEn', 'minutes', 'illus'];
  for (const k of req) if (obj[k] === undefined) throw new Error(`Missing field: ${k}`);
  if (!Array.isArray(obj.bodyEs) || !Array.isArray(obj.bodyEn)) throw new Error('body* must be arrays');
  if (typeof obj.minutes !== 'number') obj.minutes = 5;

  const shapes = sanitizeShapes(obj.illusData?.shapes);
  if (shapes) {
    obj.illus = 'generative';
    obj.illusData = { shapes };
  } else {
    if (!ILLUS_KINDS.includes(obj.illus) || obj.illus === 'generative') obj.illus = 'orbit';
    obj.illusData = null;
  }
  return obj;
}

const TITLE_BANS = /\b(último|última|últimos|últimas|last)\b/i;

export function titleHasBan(obj) {
  return TITLE_BANS.test(obj.titleEs || '') || TITLE_BANS.test(obj.titleEn || '');
}

export { SYSTEM_PROMPT, buildUserPrompt, extractJson, validate, slugify };

async function callModel({ model, temp, userPrompt, extraSystem = '' }) {
  const resp = await client.messages.create({
    model,
    max_tokens: 4096,
    temperature: temp,
    system: SYSTEM_PROMPT + extraSystem,
    messages: [{ role: 'user', content: userPrompt }],
  });
  const text = resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  return validate(extractJson(text));
}

export async function generateStory({ tags = [], model = 'claude-sonnet-4-5', temp = 0.9, prompt = '', length = 'medium' }) {
  const userPrompt = buildUserPrompt({ tags, prompt, length });
  let parsed = await callModel({ model, temp, userPrompt });

  if (titleHasBan(parsed)) {
    const retryNote = `\n\nIMPORTANTE: En el intento anterior el título contenía "último/última/last" — palabras PROHIBIDAS en el título. Generá un título totalmente distinto, con otro ángulo (objeto concreto, gesto, número, lugar, nombre propio inventado). NO uses superlativos.`;
    parsed = await callModel({ model, temp, userPrompt, extraSystem: retryNote });
  }

  return { ...parsed, slugBase: slugify(parsed.titleEs) };
}
