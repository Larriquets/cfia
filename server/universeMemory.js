import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MEMORY_MODEL = 'gemini-2.5-flash-lite';
const MAX_SUMMARY_WORDS = 500;

const SYSTEM = `Sos un editor literario que mantiene un "diario de universo" para un universo de cuentos cortos de ciencia ficción (un árbol que arranca en un cuento raíz y crece en ramas).

Tu trabajo: recibir el resumen acumulado previo + el nuevo cuento que se acaba de escribir, y devolver el resumen actualizado + el índice de entidades recurrentes.

REGLAS CRÍTICAS:
- El resumen NO es una lista de tramas. Es un mapa tonal y conceptual del universo: qué tipo de lugares aparecen, qué obsesiones vuelven, qué texturas emocionales se repiten, qué gestos narrativos.
- Preservá nombres propios, lugares, objetos o eventos que puedan reaparecer en cuentos futuros. Pero NO fuerces continuidad: si el nuevo cuento contradice algo, priorizá lo nuevo.
- Límite duro: resumen ≤ ${MAX_SUMMARY_WORDS} palabras. Si crece, comprimí — borrá detalles menos cargados, conservá el núcleo.
- Entidades: arrays cortos (≤ 15 items cada uno). Solo nombres/etiquetas, sin descripciones largas.

Devolvés SIEMPRE un único objeto JSON válido con esta forma exacta, sin markdown:

{
  "summaryEs": "string (≤ ${MAX_SUMMARY_WORDS} palabras, en español)",
  "summaryEn": "string (≤ ${MAX_SUMMARY_WORDS} palabras, traducción fiel al inglés)",
  "entities": {
    "personajes": ["string", "..."],
    "lugares": ["string", "..."],
    "objetos": ["string", "..."],
    "eventos": ["string", "..."]
  }
}`;

function truncateWords(s, max) {
  if (!s) return '';
  const words = s.split(/\s+/);
  if (words.length <= max) return s;
  return words.slice(0, max).join(' ');
}

function parseEntities(raw) {
  try {
    const e = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      personajes: Array.isArray(e?.personajes) ? e.personajes : [],
      lugares: Array.isArray(e?.lugares) ? e.lugares : [],
      objetos: Array.isArray(e?.objetos) ? e.objetos : [],
      eventos: Array.isArray(e?.eventos) ? e.eventos : [],
    };
  } catch {
    return { personajes: [], lugares: [], objetos: [], eventos: [] };
  }
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in memory response');
  return JSON.parse(text.slice(start, end + 1));
}

export async function updateUniverseMemory({ universeId, story }) {
  if (!universeId || !story) return;
  if (!process.env.GEMINI_API_KEY) return;

  const memory = await prisma.universeMemory.findUnique({ where: { universeId } });
  const prevSummaryEs = memory?.summaryEs || '';
  const prevSummaryEn = memory?.summaryEn || '';
  const prevEntities = parseEntities(memory?.entities);

  const bodyEs = Array.isArray(story.bodyEs) ? story.bodyEs.join('\n\n') : String(story.bodyEs || '');
  const userPrompt = [
    `RESUMEN ACUMULADO PREVIO (ES):\n${prevSummaryEs || '[vacío]'}`,
    `\nRESUMEN ACUMULADO PREVIO (EN):\n${prevSummaryEn || '[empty]'}`,
    `\nENTIDADES PREVIAS:\n${JSON.stringify(prevEntities)}`,
    `\nNUEVO CUENTO:\nTítulo: ${story.titleEs} / ${story.titleEn}\n\n${bodyEs}`,
    `\nActualizá el resumen (ES y EN) y las entidades. Devolvé SOLO JSON.`,
  ].join('\n');

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const resp = await ai.models.generateContent({
    model: MEMORY_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM,
      temperature: 0.4,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const text = resp?.text || resp?.candidates?.[0]?.content?.parts?.map((p) => p?.text || '').join('') || '';
  if (!text.trim()) throw new Error('empty memory response');

  const parsed = extractJson(text);
  const summaryEs = truncateWords(String(parsed.summaryEs || '').trim(), MAX_SUMMARY_WORDS);
  const summaryEn = truncateWords(String(parsed.summaryEn || '').trim(), MAX_SUMMARY_WORDS);
  const entities = parseEntities(parsed.entities);

  await prisma.universeMemory.upsert({
    where: { universeId },
    update: {
      summaryEs,
      summaryEn,
      entities: JSON.stringify(entities),
    },
    create: {
      universeId,
      summaryEs,
      summaryEn,
      entities: JSON.stringify(entities),
    },
  });

  console.log(`[memory] updated universe=${universeId} (${summaryEs.split(/\s+/).length} words ES)`);
}

const COMPACT_TARGET_WORDS = 450;
const COMPACT_MAX_ENTITIES = 15;

const COMPACT_SYSTEM = `Sos un editor literario que comprime el "diario de universo" de una colección de cuentos de ciencia ficción.

Recibís el resumen acumulado actual (ES y EN) y las entidades recurrentes, y devolvés una versión MÁS CONDENSADA preservando lo esencial:

- Resumen ≤ ${COMPACT_TARGET_WORDS} palabras por idioma. PRESERVÁ nombres propios (personajes, lugares, naves, objetos distintivos), eventos clave y vínculos entre cuentos. Cortá adjetivos, descripciones tonales redundantes y generalidades — pero nunca sacrifiques especificidad concreta.
- Entidades: quedate con los ítems más relevantes/recurrentes. Máximo ${COMPACT_MAX_ENTITIES} por categoría. Preferí nombres específicos sobre etiquetas genéricas.
- NO inventes nada nuevo. Solo condensar lo existente.

Devolvés SIEMPRE un único objeto JSON válido, sin markdown:

{
  "summaryEs": "string (≤ ${COMPACT_TARGET_WORDS} palabras, español)",
  "summaryEn": "string (≤ ${COMPACT_TARGET_WORDS} palabras, inglés)",
  "entities": {
    "personajes": ["string", "..."],
    "lugares": ["string", "..."],
    "objetos": ["string", "..."],
    "eventos": ["string", "..."]
  }
}`;

export async function compactUniverseMemory({ universeId }) {
  if (!universeId) throw new Error('universeId required');
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const memory = await prisma.universeMemory.findUnique({ where: { universeId } });
  if (!memory) throw new Error('no memory to compact');

  const prevEntities = parseEntities(memory.entities);
  const entitiesJson = JSON.stringify(prevEntities);
  const beforeChars = (memory.summaryEs || '').length + (memory.summaryEn || '').length + entitiesJson.length;

  const userPrompt = [
    `RESUMEN ACTUAL (ES):\n${memory.summaryEs || '[vacío]'}`,
    `\nRESUMEN ACTUAL (EN):\n${memory.summaryEn || '[empty]'}`,
    `\nENTIDADES ACTUALES:\n${entitiesJson}`,
    `\nDevolvé una versión condensada (SOLO JSON).`,
  ].join('\n');

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const resp = await ai.models.generateContent({
    model: MEMORY_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: COMPACT_SYSTEM,
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const text = resp?.text || resp?.candidates?.[0]?.content?.parts?.map((p) => p?.text || '').join('') || '';
  if (!text.trim()) throw new Error('empty compact response');

  const parsed = extractJson(text);
  const summaryEs = truncateWords(String(parsed.summaryEs || '').trim(), COMPACT_TARGET_WORDS);
  const summaryEn = truncateWords(String(parsed.summaryEn || '').trim(), COMPACT_TARGET_WORDS);
  const entities = parseEntities(parsed.entities);
  const newEntitiesJson = JSON.stringify(entities);
  const afterChars = summaryEs.length + summaryEn.length + newEntitiesJson.length;

  await prisma.universeMemory.update({
    where: { universeId },
    data: { summaryEs, summaryEn, entities: newEntitiesJson },
  });

  const ratio = beforeChars > 0 ? Math.round((afterChars / beforeChars) * 100) : 0;
  console.log(`[compact] universe=${universeId} before=${beforeChars} after=${afterChars} ratio=${ratio}%`);

  return { beforeChars, afterChars, ratio };
}

const THREAD_SYSTEM = `Sos un editor literario que condensa un HILO específico de cuentos de ciencia ficción (varios cuentos que comparten una cadena de expansión: uno deriva del anterior).

Recibís una cadena ordenada de cuentos (del más antiguo al más reciente) y devolvés un resumen denso que captura:
- El arco narrativo concreto del hilo: qué pasa, en qué orden, qué se transforma
- Personajes, lugares, objetos y eventos recurrentes del hilo (con sus nombres propios intactos)
- El tono y las obsesiones específicas del hilo
- Caminos ya tomados (para que un cuento nuevo que derive del hilo pueda continuar sin repetir)

REGLAS:
- Resumen ≤ 500 palabras por idioma.
- PRESERVÁ todos los nombres propios (personajes, lugares, naves, objetos distintivos).
- NO inventes. Solo condensá lo dado.
- Entidades: arrays de nombres específicos del hilo, máx 15 por categoría.

Devolvés SIEMPRE un único objeto JSON válido, sin markdown:

{
  "summaryEs": "string (≤ 500 palabras, español)",
  "summaryEn": "string (≤ 500 palabras, inglés)",
  "entities": {
    "personajes": ["string", "..."],
    "lugares": ["string", "..."],
    "objetos": ["string", "..."],
    "eventos": ["string", "..."]
  }
}`;

export async function compactThread({ stories }) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
  if (!Array.isArray(stories) || !stories.length) throw new Error('empty thread');

  const chain = stories
    .map((s, i) => {
      const body = Array.isArray(s.bodyEs) ? s.bodyEs.join('\n\n') : (s.bodyEs || s.excerptEs || '');
      return `--- CUENTO ${i + 1} / ${stories.length} [#${String(s.num).padStart(3, '0')}] ---
Título: ${s.titleEs} / ${s.titleEn}
Tags: ${(s.tags || []).join(', ')}

${body}`;
    })
    .join('\n\n');

  const userPrompt = `HILO DE ${stories.length} CUENTOS (del más antiguo al más reciente):

${chain}

Condensá el hilo completo. Devolvé SOLO JSON.`;

  const beforeChars = chain.length;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const resp = await ai.models.generateContent({
    model: MEMORY_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: THREAD_SYSTEM,
      temperature: 0.3,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });

  const text = resp?.text || resp?.candidates?.[0]?.content?.parts?.map((p) => p?.text || '').join('') || '';
  if (!text.trim()) throw new Error('empty thread compact response');

  const parsed = extractJson(text);
  const summaryEs = truncateWords(String(parsed.summaryEs || '').trim(), 500);
  const summaryEn = truncateWords(String(parsed.summaryEn || '').trim(), 500);
  const entities = parseEntities(parsed.entities);
  const afterChars = summaryEs.length + summaryEn.length + JSON.stringify(entities).length;
  const ratio = beforeChars > 0 ? Math.round((afterChars / beforeChars) * 100) : 0;

  console.log(`[compact-thread] stories=${stories.length} before=${beforeChars} after=${afterChars} ratio=${ratio}%`);

  return { summaryEs, summaryEn, entities, beforeChars, afterChars, ratio, nodeCount: stories.length };
}
